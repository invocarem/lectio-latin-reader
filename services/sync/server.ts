/**
 * Home sync service.
 *
 * One `lectio-sessions.json` on a home computer, reached over HTTP. The store
 * reads the bytes and writes them only when the caller still holds the current
 * etag, replacing the file atomically through a temp file beside it. The HTTP
 * surface exposes one route, `/lectio-sessions.json`, gated by a bearer token,
 * with `OPTIONS` for CORS. The service stores bytes as sent and never merges,
 * reformats, or validates the sessions inside.
 *
 * One TypeScript file, no imports of `src/`, so it runs on Node 22 with type
 * stripping and no compile step:
 *   node --experimental-strip-types services/sync/server.ts
 *
 * Step 1 (store) and Step 2 (HTTP) live together here. Importing this module
 * never opens a port; only running it as the entry point starts the server.
 */

import { createHash, timingSafeEqual } from "node:crypto";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { promises as fs } from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

/** Must stay equal to `BUNDLE_VERSION` in `src/session/bundle.ts`; a test pins them. */
export const BUNDLE_VERSION = 1;
export const MAX_BODY_BYTES = 1024 * 1024;
export const DEFAULT_HOST = "127.0.0.1";
export const DEFAULT_PORT = 3010;
export const DEFAULT_ORIGINS = [
  "lectiolatinreader://localhost",
  "http://localhost:5180",
  "http://127.0.0.1:5180",
];

const ROUTE = "/lectio-sessions.json";
const TMP_SUFFIX = ".tmp";

/* ------------------------------------------------------------------ *
 * File store (Step 1)
 * ------------------------------------------------------------------ */

function etagOf(bytes: Buffer): string {
  return `"${createHash("sha256").update(bytes).digest("hex")}"`;
}

/**
 * If-Match is a strong comparison. A proxy may hand the client the same
 * hash prefixed with `W/`. That prefix is not a different file.
 */
function etagMatches(ifMatch: string, currentEtag: string): boolean {
  const presented = ifMatch.trim().replace(/^W\//i, "");
  return presented === currentEtag;
}

function isMissing(error: unknown): boolean {
  return (
    error instanceof Error &&
    "code" in error &&
    (error as NodeJS.ErrnoException).code === "ENOENT"
  );
}

/**
 * One logical file, serialized with an in-process lock so a read-compare-write
 * either lands on the current bytes or leaves the file untouched.
 */
export class FileStore {
  /** Serializes operations so overlapping conditional writes do not interleave. */
  private tail: Promise<void> = Promise.resolve();
  private readonly filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  /** Run `fn` after every already-queued operation has settled. */
  private enqueue<T>(fn: () => Promise<T>): Promise<T> {
    const run = this.tail.then(fn, fn);
    this.tail = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  }

  /** Current bytes and their etag. A missing file reads as empty text, not an error. */
  read(): Promise<{ bytes: Buffer; etag: string }> {
    return this.enqueue(async () => {
      const bytes = await this.readBytes();
      return { bytes, etag: etagOf(bytes) };
    });
  }

  private async readBytes(): Promise<Buffer> {
    try {
      return await fs.readFile(this.filePath);
    } catch (error) {
      if (isMissing(error)) return Buffer.alloc(0);
      throw error;
    }
  }

  /**
   * Replace the file only when `ifMatch` equals the current etag. `null` (no
   * If-Match) never matches. A match replaces through a temp file in the same
   * directory, then renames over the real one, so the swap is atomic and a
   * crash can at most leave a `.tmp` that the next write overwrites.
   */
  writeIfMatch(
    bytes: Buffer,
    ifMatch: string | null,
  ): Promise<{ ok: true; etag: string } | { ok: false; currentEtag: string }> {
    return this.enqueue(async () => {
      const current = await this.readBytes();
      const currentEtag = etagOf(current);
      if (ifMatch === null || !etagMatches(ifMatch, currentEtag)) {
        return { ok: false, currentEtag };
      }
      await this.replace(bytes);
      return { ok: true, etag: etagOf(bytes) };
    });
  }

  private async replace(bytes: Buffer): Promise<void> {
    const dir = path.dirname(this.filePath);
    const tmp = path.join(dir, `${path.basename(this.filePath)}${TMP_SUFFIX}`);
    await fs.mkdir(dir, { recursive: true });
    const handle = await fs.open(tmp, "w");
    try {
      await handle.writeFile(bytes);
      await handle.sync();
    } finally {
      await handle.close();
    }
    // libuv maps rename to MoveFileEx(MOVEFILE_REPLACE_EXISTING) on Windows, so
    // overwriting an existing target is atomic and fails only on sibling errors.
    await fs.rename(tmp, this.filePath);
  }
}

/* ------------------------------------------------------------------ *
 * HTTP (Step 2)
 * ------------------------------------------------------------------ */

export type SyncConfig = {
  filePath: string;
  token: string;
  host: string;
  port: number;
  /** Lowercased allowed origins. */
  origins: string[];
};

/** Read configuration from the environment, refusing to run on a bad setup. */
export function configFromEnv(env: NodeJS.ProcessEnv = process.env): SyncConfig {
  const filePath = env.LECTIO_SYNC_FILE;
  const token = env.LECTIO_SYNC_TOKEN;
  if (!filePath) throw new Error("LECTIO_SYNC_FILE is required");
  if (!token) throw new Error("LECTIO_SYNC_TOKEN is required");
  if (token.length < 16) throw new Error("LECTIO_SYNC_TOKEN must be at least 16 characters");
  if (/\s/.test(token)) throw new Error("LECTIO_SYNC_TOKEN must not contain spaces");

  const host = env.LECTIO_SYNC_HOST ?? DEFAULT_HOST;
  const rawPort = env.LECTIO_SYNC_PORT;
  const port = rawPort !== undefined ? Number(rawPort) : DEFAULT_PORT;
  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    throw new Error(`invalid LECTIO_SYNC_PORT: ${rawPort}`);
  }

  const rawOrigins = env.LECTIO_SYNC_ORIGINS;
  const origins = (rawOrigins ? rawOrigins.split(",").map((s) => s.trim()) : DEFAULT_ORIGINS)
    .map((o) => o.toLowerCase())
    .filter((o) => o.length > 0);

  return { filePath, token, host, port, origins };
}

/** A strong hash of the bytes, quoted, so it can be sent as an HTTP ETag. */
export { etagOf };

/**
 * The gate a `PUT` body must pass to be stored: JSON that parses to an object
 * with `version` equal to `BUNDLE_VERSION` and `sessions` a plain object. Inner
 * sessions are not validated here — the app skips a work it cannot parse, and
 * the service stores bytes as sent.
 */
export function isVersionOneBundle(body: Buffer): boolean {
  if (body.length === 0) return false;
  let value: unknown;
  try {
    value = JSON.parse(body.toString("utf8"));
  } catch {
    return false;
  }
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  if (record.version !== BUNDLE_VERSION) return false;
  if (typeof record.sessions !== "object" || record.sessions === null || Array.isArray(record.sessions)) {
    return false;
  }
  return true;
}

/** Constant-time comparison: hash both sides so length differences do not leak. */
function constantTimeEqual(a: string, b: string): boolean {
  const da = createHash("sha256").update(a).digest();
  const db = createHash("sha256").update(b).digest();
  return timingSafeEqual(da, db);
}

function bearerToken(req: IncomingMessage): string | null {
  const header = req.headers.authorization;
  if (typeof header !== "string") return null;
  const match = /^Bearer\s+(\S+)$/i.exec(header.trim());
  return match ? match[1] : null;
}

function authorized(req: IncomingMessage, token: string): boolean {
  const presented = bearerToken(req);
  return presented !== null && constantTimeEqual(presented, token);
}

function requestOrigin(req: IncomingMessage): string | null {
  const origin = req.headers.origin;
  return typeof origin === "string" && origin.length > 0 ? origin : null;
}

function isAllowed(origin: string, allowed: string[]): boolean {
  return allowed.includes(origin.toLowerCase());
}

/** Mirror an allowed origin and expose ETag so the page can send it on the next write. */
function applyCors(res: ServerResponse, origin: string): void {
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Expose-Headers", "ETag");
}

function respond(res: ServerResponse, code: number): void {
  res.writeHead(code);
  res.end();
}

function pathOf(url: string | undefined): string {
  if (!url) return "/";
  try {
    return new URL(url, "http://localhost").pathname;
  } catch {
    return url;
  }
}

/** Read a request body, flagging a body larger than the cap. */
async function readBody(
  req: IncomingMessage,
  cap: number,
): Promise<{ bytes: Buffer; tooLarge: boolean }> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buf.length;
    if (size > cap) return { bytes: Buffer.alloc(0), tooLarge: true };
    chunks.push(buf);
  }
  return { bytes: Buffer.concat(chunks), tooLarge: false };
}

/**
 * Build the request handler for one store. Importing it never listens; the
 * caller creates the server (as tests do) or `start()` does.
 */
export function createSyncHandler(
  store: FileStore,
  config: Pick<SyncConfig, "token" | "origins">,
): (req: IncomingMessage, res: ServerResponse) => Promise<void> {
  return async (req, res) => {
    try {
      const origin = requestOrigin(req);
      const allowed = origin !== null && isAllowed(origin, config.origins);
      if (origin !== null && !allowed) {
        respond(res, 403); // deliberately no Access-Control-Allow-Origin
        return;
      }
      if (allowed) applyCors(res, origin as string);

      if (pathOf(req.url) !== ROUTE) {
        respond(res, 404);
        return;
      }

      switch (req.method) {
        case "OPTIONS": {
          res.setHeader("Access-Control-Allow-Methods", "GET, PUT, OPTIONS");
          res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type, If-Match");
          res.setHeader("Access-Control-Max-Age", "600");
          respond(res, 204);
          return;
        }
        case "GET": {
          if (!authorized(req, config.token)) {
            respond(res, 401);
            return;
          }
          const { bytes, etag } = await store.read();
          res.setHeader("ETag", etag);
          res.setHeader("Cache-Control", "no-store, no-transform");
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.writeHead(200);
          res.end(bytes);
          return;
        }
        case "PUT": {
          if (!authorized(req, config.token)) {
            respond(res, 401);
            return;
          }
          const ifMatch = req.headers["if-match"];
          if (typeof ifMatch !== "string" || ifMatch.trim() === "") {
            respond(res, 428);
            return;
          }
          const contentType = req.headers["content-type"];
          if (
            contentType !== undefined &&
            contentType.trim() !== "" &&
            !/^application\/json\b/i.test(contentType)
          ) {
            respond(res, 415);
            return;
          }
          const { bytes, tooLarge } = await readBody(req, MAX_BODY_BYTES);
          if (tooLarge) {
            respond(res, 413);
            return;
          }
          if (!isVersionOneBundle(bytes)) {
            respond(res, 400);
            return;
          }
          const result = await store.writeIfMatch(bytes, ifMatch);
          if (!result.ok) {
            res.setHeader("ETag", result.currentEtag);
            respond(res, 412);
            return;
          }
          res.setHeader("ETag", result.etag);
          respond(res, 204);
          return;
        }
        default: {
          respond(res, 405);
          return;
        }
      }
    } catch {
      respond(res, 500);
    }
  };
}

async function main(): Promise<void> {
  let config: SyncConfig;
  try {
    config = configFromEnv();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
    return;
  }
  const store = new FileStore(config.filePath);
  const server = createServer(createSyncHandler(store, config));
  server.listen(config.port, config.host, () => {
    const address = server.address();
    const bound = typeof address === "object" && address !== null ? `${address.address}:${address.port}` : String(address);
    console.log(`listening on ${bound}, file ${config.filePath}`);
  });
}

/** True only when this module is the entry point, so `node server.ts` starts it. */
function isMain(): boolean {
  const entry = process.argv[1];
  if (!entry) return false;
  const resolved = path.resolve(entry);
  const self = fileURLToPath(import.meta.url);
  const a = process.platform === "win32" ? resolved.toLowerCase() : resolved;
  const b = process.platform === "win32" ? self.toLowerCase() : self;
  return a === b;
}

if (isMain()) void main();

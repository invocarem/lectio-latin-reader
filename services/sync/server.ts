/**
 * Home sync service.
 *
 * One `lectio-sessions.json` on a home computer, reached over HTTP. The store
 * reads the bytes and writes them only when the caller still holds the current
 * etag, replacing the file atomically through a temp file beside it. The HTTP
 * surface exposes `/lectio-sessions.json`, gated by a bearer token, with
 * `OPTIONS` for CORS. When `LECTIO_SYNC_DIR` is set, that folder also holds
 * `notes/`, and `/notes` serves those files the same way: one etag per file,
 * bytes stored as sent. The service never merges, reformats, or validates the
 * sessions inside.
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
const NOTES_ROUTE = "/notes";
const TMP_SUFFIX = ".tmp";
const TOMBSTONE = ".deleted";
const ISO_STAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/;
const NOTE_NAME = /^(\d{2})_psalm_([1-9]\d{0,2})(?:_([a-z0-9]+))?\.md$/;

/** Psalm 118 sections, matching `PSALM_118_SECTIONS` in `src/session/notes.ts`. */
const PSALM_118_SECTIONS = new Set([
  "aleph", "beth", "ghimel", "daleth", "he", "vau", "zain", "heth", "teth", "iod",
  "caph", "lamed", "mem", "nun", "samech", "ain", "phe", "sade", "coph", "res", "sin", "tau",
]);

/** Psalms sung in numbered parts, matching `NUMBERED_PARTS` in `src/session/notes.ts`. */
const NUMBERED_PARTS = new Set([9, 17, 36, 67, 68, 77, 88, 103, 104, 105, 106, 138, 143, 144]);

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

  /**
   * Remove the file only when `ifMatch` equals the current etag. A missing
   * file's etag is the etag of empty bytes, the same value a GET returns.
   */
  removeIfMatch(
    ifMatch: string | null,
  ): Promise<{ ok: true; etag: string } | { ok: false; currentEtag: string }> {
    return this.enqueue(async () => {
      const current = await this.readBytes();
      const currentEtag = etagOf(current);
      if (ifMatch === null || !etagMatches(ifMatch, currentEtag)) {
        return { ok: false, currentEtag };
      }
      await fs.rm(this.filePath, { force: true });
      return { ok: true, etag: currentEtag };
    });
  }

  /** Bytes when the file is present, including an empty file. Null when it is absent. */
  readExisting(): Promise<{ bytes: Buffer; etag: string } | null> {
    return this.enqueue(async () => {
      try {
        const bytes = await fs.readFile(this.filePath);
        return { bytes, etag: etagOf(bytes) };
      } catch (error) {
        if (isMissing(error)) return null;
        throw error;
      }
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

/** A note filename, or that filename plus `.deleted`. Anything else is not a route. */
export function isSyncNoteName(name: string): boolean {
  const filename = name.endsWith(TOMBSTONE) ? name.slice(0, -TOMBSTONE.length) : name;
  const match = NOTE_NAME.exec(filename);
  if (!match) return false;
  const psalm = Number(match[2]);
  const section = match[3];
  if (psalm < 1 || psalm > 150) return false;
  if (psalm === 118) return section != null && PSALM_118_SECTIONS.has(section);
  if (NUMBERED_PARTS.has(psalm)) return section === "1" || section === "2";
  return section == null;
}

/** `updated` from a note header, or the timestamp body of a tombstone. */
export function noteUpdated(name: string, text: string): string | undefined {
  if (name.endsWith(TOMBSTONE)) {
    const value = text.trim();
    return ISO_STAMP.test(value) ? value : undefined;
  }
  for (const line of text.split(/\r?\n/)) {
    const match = /^updated:\s*(\S+)\s*$/.exec(line);
    if (match && ISO_STAMP.test(match[1])) return match[1];
  }
  return undefined;
}

export type ListedNote = { name: string; etag: string; updated?: string };

/**
 * The `notes/` directory. Each file has its own `FileStore`, so one lock
 * covers that file and a write to another note does not wait on it.
 */
export class NoteDirectory {
  private readonly stores = new Map<string, FileStore>();
  private readonly dir: string;

  constructor(dir: string) {
    this.dir = dir;
  }

  private store(name: string): FileStore {
    const existing = this.stores.get(name);
    if (existing) return existing;
    const created = new FileStore(path.join(this.dir, name));
    this.stores.set(name, created);
    return created;
  }

  file(name: string): FileStore {
    return this.store(name);
  }

  async list(): Promise<ListedNote[]> {
    let names: string[];
    try {
      names = await fs.readdir(this.dir);
    } catch (error) {
      if (isMissing(error)) return [];
      throw error;
    }
    const listed: ListedNote[] = [];
    for (const name of names.sort()) {
      if (!isSyncNoteName(name)) continue;
      const found = await this.store(name).readExisting();
      if (!found) continue;
      const updated = noteUpdated(name, found.bytes.toString("utf8"));
      listed.push(updated ? { name, etag: found.etag, updated } : { name, etag: found.etag });
    }
    return listed;
  }
}

/* ------------------------------------------------------------------ *
 * HTTP (Step 2)
 * ------------------------------------------------------------------ */

export type SyncConfig = {
  filePath: string;
  /** `notes/` inside `LECTIO_SYNC_DIR`. Null when the process was started with `LECTIO_SYNC_FILE` alone. */
  notesDir: string | null;
  token: string;
  host: string;
  port: number;
  /** Lowercased allowed origins. */
  origins: string[];
};

/** Read configuration from the environment, refusing to run on a bad setup. */
export function configFromEnv(env: NodeJS.ProcessEnv = process.env): SyncConfig {
  const dir = env.LECTIO_SYNC_DIR?.trim();
  const filePath = dir ? path.join(dir, "lectio-sessions.json") : env.LECTIO_SYNC_FILE;
  const notesDir = dir ? path.join(dir, "notes") : null;
  const token = env.LECTIO_SYNC_TOKEN;
  if (!filePath) throw new Error("LECTIO_SYNC_FILE or LECTIO_SYNC_DIR is required");
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

  return { filePath, notesDir, token, host, port, origins };
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

type SyncRoute =
  | { kind: "bundle" }
  | { kind: "notes" }
  | { kind: "note"; name: string }
  | { kind: "other" };

function routeOf(url: string | undefined): SyncRoute {
  const pathname = pathOf(url);
  if (pathname === ROUTE) return { kind: "bundle" };
  if (pathname === NOTES_ROUTE) return { kind: "notes" };
  if (pathname.startsWith(`${NOTES_ROUTE}/`)) {
    const name = pathname.slice(NOTES_ROUTE.length + 1);
    if (!name || name.includes("/")) return { kind: "other" };
    return { kind: "note", name };
  }
  return { kind: "other" };
}

function allowMethods(res: ServerResponse, methods: string): void {
  res.setHeader("Access-Control-Allow-Methods", methods);
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type, If-Match");
  res.setHeader("Access-Control-Max-Age", "600");
  respond(res, 204);
}

function ifMatchOf(req: IncomingMessage): string | null {
  const header = req.headers["if-match"];
  if (typeof header !== "string" || header.trim() === "") return null;
  return header;
}

/**
 * Build the request handler for one store. Importing it never listens; the
 * caller creates the server (as tests do) or `start()` does. `notes` is set
 * only when the process was given `LECTIO_SYNC_DIR`.
 */
export function createSyncHandler(
  store: FileStore,
  config: Pick<SyncConfig, "token" | "origins">,
  notes: NoteDirectory | null = null,
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

      const route = routeOf(req.url);
      if (route.kind === "other") {
        respond(res, 404);
        return;
      }
      if ((route.kind === "notes" || route.kind === "note") && !notes) {
        respond(res, 404);
        return;
      }
      if (route.kind === "note" && !isSyncNoteName(route.name)) {
        respond(res, 404);
        return;
      }

      if (req.method === "OPTIONS") {
        const methods = route.kind === "note" ? "GET, PUT, DELETE, OPTIONS" : "GET, PUT, OPTIONS";
        allowMethods(res, methods);
        return;
      }

      if (route.kind === "bundle") {
        await serveBundle(req, res, store, config.token);
        return;
      }
      if (!notes) {
        respond(res, 404);
        return;
      }
      if (route.kind === "notes") {
        await serveNoteList(req, res, notes, config.token);
        return;
      }
      await serveNote(req, res, notes, route.name, config.token);
    } catch {
      respond(res, 500);
    }
  };
}

async function serveBundle(
  req: IncomingMessage,
  res: ServerResponse,
  store: FileStore,
  token: string,
): Promise<void> {
  switch (req.method) {
    case "GET": {
      if (!authorized(req, token)) {
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
      if (!authorized(req, token)) {
        respond(res, 401);
        return;
      }
      const ifMatch = ifMatchOf(req);
      if (ifMatch === null) {
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
    }
  }
}

async function serveNoteList(
  req: IncomingMessage,
  res: ServerResponse,
  notes: NoteDirectory,
  token: string,
): Promise<void> {
  if (req.method !== "GET") {
    respond(res, 405);
    return;
  }
  if (!authorized(req, token)) {
    respond(res, 401);
    return;
  }
  const files = await notes.list();
  res.setHeader("Cache-Control", "no-store, no-transform");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.writeHead(200);
  res.end(JSON.stringify({ files }));
}

async function serveNote(
  req: IncomingMessage,
  res: ServerResponse,
  notes: NoteDirectory,
  name: string,
  token: string,
): Promise<void> {
  const file = notes.file(name);
  switch (req.method) {
    case "GET": {
      if (!authorized(req, token)) {
        respond(res, 401);
        return;
      }
      const { bytes, etag } = await file.read();
      res.setHeader("ETag", etag);
      res.setHeader("Cache-Control", "no-store, no-transform");
      res.setHeader("Content-Type", name.endsWith(TOMBSTONE) ? "text/plain; charset=utf-8" : "text/markdown; charset=utf-8");
      res.writeHead(200);
      res.end(bytes);
      return;
    }
    case "PUT": {
      if (!authorized(req, token)) {
        respond(res, 401);
        return;
      }
      const ifMatch = ifMatchOf(req);
      if (ifMatch === null) {
        respond(res, 428);
        return;
      }
      const { bytes, tooLarge } = await readBody(req, MAX_BODY_BYTES);
      if (tooLarge) {
        respond(res, 413);
        return;
      }
      const result = await file.writeIfMatch(bytes, ifMatch);
      if (!result.ok) {
        res.setHeader("ETag", result.currentEtag);
        respond(res, 412);
        return;
      }
      res.setHeader("ETag", result.etag);
      respond(res, 204);
      return;
    }
    case "DELETE": {
      if (!authorized(req, token)) {
        respond(res, 401);
        return;
      }
      const ifMatch = ifMatchOf(req);
      if (ifMatch === null) {
        respond(res, 428);
        return;
      }
      const result = await file.removeIfMatch(ifMatch);
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
    }
  }
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
  const notes = config.notesDir ? new NoteDirectory(config.notesDir) : null;
  const server = createServer(createSyncHandler(store, config, notes));
  server.listen(config.port, config.host, () => {
    const address = server.address();
    const bound = typeof address === "object" && address !== null ? `${address.address}:${address.port}` : String(address);
    const notesLabel = config.notesDir ? `, notes ${config.notesDir}` : "";
    console.log(`listening on ${bound}, file ${config.filePath}${notesLabel}`);
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

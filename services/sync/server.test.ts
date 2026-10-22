/// <reference types="vitest/globals" />

/**
 * Step 2 tests — the HTTP surface in `server.ts` against the status table in
 * `service-sync.md`. Each row of that table gets a test, plus the CORS
 * case-insensitive origin fix and the no-drift pin on `BUNDLE_VERSION`.
 *
 * Requests go through Node's `http.request` (not `fetch`) so the exact status
 * codes and headers can be asserted without the client-side CORS layer.
 */

import { createServer, request as httpRequest, type IncomingHttpHeaders } from "node:http";
import type { AddressInfo } from "node:net";
import { promises as fs } from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import {
  BUNDLE_VERSION,
  DEFAULT_ORIGINS,
  FileStore,
  MAX_BODY_BYTES,
  createSyncHandler,
  etagOf,
} from "./server";
import { BUNDLE_VERSION as APP_BUNDLE_VERSION } from "../../src/session/bundle";

const TOKEN = "test-token-0123456789abcd"; // 16+ chars, no spaces
const ROUTE = "/lectio-sessions.json";
const EMPTY = etagOf(Buffer.alloc(0));
const BODY = '{"version":1,"sessions":{}}';

let dir: string;
let file: string;
let server: ReturnType<typeof createServer>;
let port: number;

function rawRequest(opts: {
  method: string;
  path?: string;
  headers?: Record<string, string>;
  body?: Buffer | string;
}): Promise<{ status: number; headers: IncomingHttpHeaders; body: Buffer }> {
  return new Promise((resolve, reject) => {
    const req = httpRequest(
      {
        host: "127.0.0.1",
        port,
        method: opts.method,
        path: opts.path ?? ROUTE,
        headers: opts.headers,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (c: Buffer) => chunks.push(c));
        res.on("end", () =>
          resolve({ status: res.statusCode ?? 0, headers: res.headers, body: Buffer.concat(chunks) }),
        );
      },
    );
    req.on("error", reject);
    if (opts.body !== undefined) req.write(opts.body);
    req.end();
  });
}

function auth(token: string = TOKEN): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}
function putHeaders(extra: Record<string, string> = {}): Record<string, string> {
  return { ...auth(), ...extra };
}

describe("sync HTTP (Step 2)", () => {
  beforeAll(async () => {
    dir = await fs.mkdtemp(path.join(os.tmpdir(), "lectio-sync-http-"));
    file = path.join(dir, "lectio-sessions.json");
    const handler = createSyncHandler(new FileStore(file), {
      token: TOKEN,
      origins: DEFAULT_ORIGINS,
    });
    server = createServer(handler);
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    port = (server.address() as AddressInfo).port;
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) =>
      server.close((err) => (err ? reject(err) : resolve())),
    );
    await fs.rm(dir, { recursive: true, force: true });
  });

  beforeEach(async () => {
    await fs.rm(file, { force: true }); // every test starts with a missing file
  });

  it("GET a missing file: 200, empty body, etag of the empty text", async () => {
    const r = await rawRequest({ method: "GET", headers: auth() });
    expect(r.status).toBe(200);
    expect(r.body.length).toBe(0);
    expect(r.headers.etag).toBe(EMPTY);
  });

  it("GET a present file: 200, stored bytes, Cache-Control no-store", async () => {
    await fs.writeFile(file, "hello-bytes");
    const r = await rawRequest({ method: "GET", headers: auth() });
    expect(r.status).toBe(200);
    expect(r.body.toString()).toBe("hello-bytes");
    expect(r.headers.etag).toBe(etagOf(Buffer.from("hello-bytes")));
    expect(r.headers["cache-control"]).toBe("no-store, no-transform");
  });

  it("PUT with a missing or wrong token: 401 and file unchanged", async () => {
    const r1 = await rawRequest({ method: "PUT", body: BODY, headers: { "If-Match": EMPTY } });
    expect(r1.status).toBe(401);
    const r2 = await rawRequest({
      method: "PUT",
      body: BODY,
      headers: { "If-Match": EMPTY, ...auth("wrong-token-0123456789") },
    });
    expect(r2.status).toBe(401);
    await expect(fs.stat(file)).rejects.toThrow();
  });

  it("PUT without If-Match: 428 and file unchanged", async () => {
    await fs.writeFile(file, "orig");
    const r = await rawRequest({ method: "PUT", headers: auth(), body: BODY });
    expect(r.status).toBe(428);
    expect(await fs.readFile(file, "utf8")).toBe("orig");
  });

  it("PUT with a stale or wildcard If-Match: 412, current etag, file unchanged", async () => {
    await fs.writeFile(file, "orig");
    const current = etagOf(Buffer.from("orig"));
    for (const ifMatch of [etagOf(Buffer.from("other")), "*"]) {
      const r = await rawRequest({ method: "PUT", headers: putHeaders({ "If-Match": ifMatch }), body: BODY });
      expect(r.status).toBe(412);
      expect(r.headers.etag).toBe(current);
    }
    expect(await fs.readFile(file, "utf8")).toBe("orig");
  });

  it("PUT with a non-version-1 body: 400 and file unchanged", async () => {
    await fs.writeFile(file, "orig");
    const current = etagOf(Buffer.from("orig"));
    const bad = ["", "not json", '{"version":2,"sessions":{}}', '{"version":1}', '[1,2]', '{"version":1,"sessions":[]}'];
    for (const body of bad) {
      const r = await rawRequest({ method: "PUT", headers: putHeaders({ "If-Match": current }), body });
      expect(r.status).toBe(400);
    }
    expect(await fs.readFile(file, "utf8")).toBe("orig");
  });

  it("PUT a body over 1 MiB: 413 and file unchanged", async () => {
    await fs.writeFile(file, "orig");
    const current = etagOf(Buffer.from("orig"));
    const big = Buffer.concat([Buffer.from('{"version":1,"sessions":{'), Buffer.alloc(MAX_BODY_BYTES), Buffer.from("}}")]);
    const r = await rawRequest({ method: "PUT", headers: putHeaders({ "If-Match": current }), body: big });
    expect(r.status).toBe(413);
    expect(await fs.readFile(file, "utf8")).toBe("orig");
  });

  it("PUT with the same hash in a weak etag: 204, bytes stored", async () => {
    await fs.writeFile(file, "orig");
    const current = etagOf(Buffer.from("orig"));
    const r = await rawRequest({
      method: "PUT",
      headers: putHeaders({ "If-Match": `W/${current}` }),
      body: BODY,
    });
    expect(r.status).toBe(204);
    expect(await fs.readFile(file, "utf8")).toBe(BODY);
  });

  it("PUT with a matching etag: 204, new etag, bytes stored as sent", async () => {
    const payload = '{"version":1,"sessions":{}}';
    const r = await rawRequest({ method: "PUT", headers: putHeaders({ "If-Match": EMPTY }), body: payload });
    expect(r.status).toBe(204);
    expect(r.headers.etag).toBe(etagOf(Buffer.from(payload)));
    expect(await fs.readFile(file, "utf8")).toBe(payload);
  });

  it("PUT with no Content-Type is accepted (application/json also ok)", async () => {
    const json = await rawRequest({
      method: "PUT",
      headers: putHeaders({ "If-Match": EMPTY, "Content-Type": "application/json" }),
      body: BODY,
    });
    expect(json.status).toBe(204);
  });

  it("PUT with a non-JSON Content-Type: 415 and file unchanged", async () => {
    await fs.writeFile(file, "orig");
    const current = etagOf(Buffer.from("orig"));
    const r = await rawRequest({
      method: "PUT",
      headers: putHeaders({ "If-Match": current, "Content-Type": "text/plain" }),
      body: BODY,
    });
    expect(r.status).toBe(415);
    expect(await fs.readFile(file, "utf8")).toBe("orig");
  });

  it("OPTIONS from an allowed origin: 204, CORS headers, no token needed", async () => {
    const r = await rawRequest({ method: "OPTIONS", headers: { Origin: "http://localhost:5180" } });
    expect(r.status).toBe(204);
    expect(r.headers["access-control-allow-origin"]).toBe("http://localhost:5180");
    expect(r.headers["access-control-allow-methods"]).toContain("GET");
    expect(r.headers["access-control-allow-methods"]).toContain("PUT");
    expect(r.headers["access-control-allow-headers"]).toContain("If-Match");
  });

  it("matches an origin case-insensitively (Capacitor scheme)", async () => {
    const r = await rawRequest({
      method: "OPTIONS",
      headers: { Origin: "LectioLatinReader://localhost" },
    });
    expect(r.status).toBe(204);
    expect(r.headers["access-control-allow-origin"]).toBe("LectioLatinReader://localhost");
  });

  it("GET from an allowed origin reflects the origin and exposes ETag", async () => {
    const r = await rawRequest({ method: "GET", headers: { ...auth(), Origin: "http://127.0.0.1:5180" } });
    expect(r.status).toBe(200);
    expect(r.headers["access-control-allow-origin"]).toBe("http://127.0.0.1:5180");
    expect(r.headers["access-control-expose-headers"]).toContain("ETag");
  });

  it("an Origin not on the list: 403, no Access-Control-Allow-Origin", async () => {
    for (const method of ["GET", "PUT", "OPTIONS"]) {
      const r = await rawRequest({
        method,
        headers: method === "OPTIONS" ? { Origin: "https://evil.example" } : { ...auth(), Origin: "https://evil.example" },
        body: method === "PUT" ? BODY : undefined,
      });
      expect(r.status).toBe(403);
      expect(r.headers["access-control-allow-origin"]).toBeUndefined();
    }
  });

  it("any other path: 404", async () => {
    const r = await rawRequest({ method: "GET", path: "/other", headers: auth() });
    expect(r.status).toBe(404);
  });

  it("any other method on the route: 405", async () => {
    const r = await rawRequest({ method: "DELETE", headers: auth() });
    expect(r.status).toBe(405);
  });

  it("the server BUNDLE_VERSION does not drift from src/session/bundle.ts", () => {
    expect(BUNDLE_VERSION).toBe(APP_BUNDLE_VERSION);
  });
});

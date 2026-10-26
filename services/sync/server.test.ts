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
  NoteDirectory,
  configFromEnv,
  createSyncHandler,
  etagOf,
  isSyncNoteName,
} from "./server";
import { BUNDLE_VERSION as APP_BUNDLE_VERSION } from "../../src/session/bundle";
import { parseNoteFilename } from "../../src/session/notes";

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

  it("GET /notes is 404 when the process was started with a file alone", async () => {
    const r = await rawRequest({ method: "GET", path: "/notes", headers: auth() });
    expect(r.status).toBe(404);
  });
});

const NOTE = "09_psalm_118_nun.md";
const NOTE_BODY = [
  "---",
  "title: Memoria",
  "at: 2026-10-22",
  "updated: 2026-10-22T22:13:00.000Z",
  "---",
  "",
  "From the service.",
  "",
].join("\n");

describe("sync notes (LECTIO_SYNC_DIR)", () => {
  let notesDir: string;
  let bundleFile: string;
  let noteServer: ReturnType<typeof createServer>;
  let notePort: number;

  function noteRequest(opts: {
    method: string;
    path?: string;
    headers?: Record<string, string>;
    body?: Buffer | string;
  }): Promise<{ status: number; headers: IncomingHttpHeaders; body: Buffer }> {
    return new Promise((resolve, reject) => {
      const req = httpRequest(
        {
          host: "127.0.0.1",
          port: notePort,
          method: opts.method,
          path: opts.path ?? "/notes",
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

  beforeAll(async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "lectio-sync-notes-"));
    notesDir = path.join(root, "notes");
    bundleFile = path.join(root, "lectio-sessions.json");
    const handler = createSyncHandler(new FileStore(bundleFile), { token: TOKEN, origins: DEFAULT_ORIGINS }, new NoteDirectory(notesDir));
    noteServer = createServer(handler);
    await new Promise<void>((resolve) => noteServer.listen(0, "127.0.0.1", resolve));
    notePort = (noteServer.address() as AddressInfo).port;
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => noteServer.close((err) => (err ? reject(err) : resolve())));
    await fs.rm(path.dirname(notesDir), { recursive: true, force: true });
  });

  beforeEach(async () => {
    await fs.rm(notesDir, { recursive: true, force: true });
    await fs.rm(bundleFile, { force: true });
  });

  it("GET /notes on a missing directory is an empty list", async () => {
    const r = await noteRequest({ method: "GET", headers: auth() });
    expect(r.status).toBe(200);
    expect(JSON.parse(r.body.toString())).toEqual({ files: [] });
  });

  it("PUT and GET one note, and a second note has its own etag", async () => {
    const created = await noteRequest({
      method: "PUT",
      path: `/notes/${NOTE}`,
      headers: putHeaders({ "If-Match": EMPTY, "Content-Type": "text/markdown" }),
      body: NOTE_BODY,
    });
    expect(created.status).toBe(204);
    const got = await noteRequest({ method: "GET", path: `/notes/${NOTE}`, headers: auth() });
    expect(got.status).toBe(200);
    expect(got.body.toString()).toBe(NOTE_BODY);
    expect(got.headers.etag).toBe(etagOf(Buffer.from(NOTE_BODY)));

    const other = "03_psalm_50.md";
    const otherBody = "---\nupdated: 2026-10-22T23:00:00.000Z\n---\n\n";
    const second = await noteRequest({
      method: "PUT",
      path: `/notes/${other}`,
      headers: putHeaders({ "If-Match": EMPTY }),
      body: otherBody,
    });
    expect(second.status).toBe(204);
    expect(second.headers.etag).not.toBe(created.headers.etag);

    const list = await noteRequest({ method: "GET", headers: auth() });
    const files = JSON.parse(list.body.toString()).files as { name: string; etag: string; updated: string; text: string }[];
    expect(files.map((file) => file.name)).toEqual([other, NOTE]);
    expect(files.find((file) => file.name === NOTE)?.updated).toBe("2026-10-22T22:13:00.000Z");
    expect(files.find((file) => file.name === NOTE)?.etag).toBe(got.headers.etag);
    expect(files.find((file) => file.name === NOTE)?.text).toBe(NOTE_BODY);
    expect(files.find((file) => file.name === other)?.etag).toBe(second.headers.etag);
    expect(files.find((file) => file.name === other)?.text).toBe(otherBody);
  });

  it("a stale If-Match is 412 and the file is unchanged", async () => {
    await noteRequest({
      method: "PUT",
      path: `/notes/${NOTE}`,
      headers: putHeaders({ "If-Match": EMPTY }),
      body: NOTE_BODY,
    });
    const r = await noteRequest({
      method: "PUT",
      path: `/notes/${NOTE}`,
      headers: putHeaders({ "If-Match": etagOf(Buffer.from("other")) }),
      body: "later",
    });
    expect(r.status).toBe(412);
    expect(r.headers.etag).toBe(etagOf(Buffer.from(NOTE_BODY)));
    const got = await noteRequest({ method: "GET", path: `/notes/${NOTE}`, headers: auth() });
    expect(got.body.toString()).toBe(NOTE_BODY);
  });

  it("a body over 1 MiB is 413", async () => {
    const big = Buffer.alloc(MAX_BODY_BYTES + 1, 0x61);
    const r = await noteRequest({
      method: "PUT",
      path: `/notes/${NOTE}`,
      headers: putHeaders({ "If-Match": EMPTY }),
      body: big,
    });
    expect(r.status).toBe(413);
    await expect(fs.stat(path.join(notesDir, NOTE))).rejects.toThrow();
  });

  it("a name that is not a note or its tombstone is 404", async () => {
    const r = await noteRequest({ method: "GET", path: "/notes/notes.txt", headers: auth() });
    expect(r.status).toBe(404);
    const nested = await noteRequest({ method: "GET", path: "/notes/09_psalm_118_nun.md/extra", headers: auth() });
    expect(nested.status).toBe(404);
  });

  it("a tombstone is a file, and DELETE removes the note when the etag matches", async () => {
    const put = await noteRequest({
      method: "PUT",
      path: `/notes/${NOTE}`,
      headers: putHeaders({ "If-Match": EMPTY }),
      body: NOTE_BODY,
    });
    const tomb = `${NOTE}.deleted`;
    const stamp = "2026-10-22T23:00:00.000Z\n";
    const written = await noteRequest({
      method: "PUT",
      path: `/notes/${tomb}`,
      headers: putHeaders({ "If-Match": EMPTY, "Content-Type": "text/plain" }),
      body: stamp,
    });
    expect(written.status).toBe(204);
    const removed = await noteRequest({
      method: "DELETE",
      path: `/notes/${NOTE}`,
      headers: putHeaders({ "If-Match": String(put.headers.etag) }),
    });
    expect(removed.status).toBe(204);
    const list = JSON.parse((await noteRequest({ method: "GET", headers: auth() })).body.toString()) as {
      files: { name: string; updated?: string }[];
    };
    expect(list.files.map((file) => file.name)).toEqual([tomb]);
    expect(list.files[0].updated).toBe("2026-10-22T23:00:00.000Z");
  });

  it("GET and PUT of the bundle still use lectio-sessions.json in the folder", async () => {
    const payload = BODY;
    const put = await noteRequest({
      method: "PUT",
      path: "/lectio-sessions.json",
      headers: putHeaders({ "If-Match": EMPTY, "Content-Type": "application/json" }),
      body: payload,
    });
    expect(put.status).toBe(204);
    expect(await fs.readFile(bundleFile, "utf8")).toBe(payload);
    const got = await noteRequest({ method: "GET", path: "/lectio-sessions.json", headers: auth() });
    expect(got.body.toString()).toBe(payload);
  });
});

describe("note route names", () => {
  const names = [
    "09_psalm_118_nun.md",
    "01_psalm_118_aleph.md",
    "02_psalm_36_1.md",
    "03_psalm_50.md",
    "09_psalm_118.md",
    "09_psalm_151.md",
    "09_psalm_118_foo.md",
    "notes.txt",
    "9_psalm_50.md",
  ];

  it("accepts a name exactly when the app can parse it, and the same plus .deleted", () => {
    for (const name of names) {
      expect(isSyncNoteName(name)).toBe(parseNoteFilename(name) != null);
      expect(isSyncNoteName(`${name}.deleted`)).toBe(parseNoteFilename(name) != null);
    }
  });
});

describe("configFromEnv", () => {
  it("a file alone serves no notes directory", () => {
    const config = configFromEnv({ LECTIO_SYNC_FILE: "/tmp/lectio-sessions.json", LECTIO_SYNC_TOKEN: TOKEN });
    expect(config.filePath).toBe("/tmp/lectio-sessions.json");
    expect(config.notesDir).toBeNull();
  });

  it("a directory serves the json and notes inside it", () => {
    const config = configFromEnv({ LECTIO_SYNC_DIR: "/tmp/lectio-sessions", LECTIO_SYNC_TOKEN: TOKEN });
    expect(config.filePath).toBe(path.join("/tmp/lectio-sessions", "lectio-sessions.json"));
    expect(config.notesDir).toBe(path.join("/tmp/lectio-sessions", "notes"));
  });

  it("refuses to start when neither path is set", () => {
    expect(() => configFromEnv({ LECTIO_SYNC_TOKEN: TOKEN })).toThrow(/LECTIO_SYNC_FILE or LECTIO_SYNC_DIR/);
  });
});

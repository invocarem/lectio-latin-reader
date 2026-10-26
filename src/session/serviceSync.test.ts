/// <reference types="vitest/globals" />

/**
 * Step 4 transport tests — the sync service transport in `serviceSync.ts`.
 *
 * read() is the GET, write() is the PUT sent with the etag from the last read;
 * a stale write (412) throws so the controller keeps local progress; and the
 * endpoint lives in device storage so a device uses either the picked file or
 * this service, never both.
 */

import { createServer } from "node:http";
import { promises as fs } from "node:fs";
import type { AddressInfo } from "node:net";
import * as os from "node:os";
import * as path from "node:path";
import { FileStore, NoteDirectory, createSyncHandler } from "../../services/sync/server";
import { createLearningNote, editLearningNote, formatNoteFile } from "./notes";
import { deleteLearningNote, memoryNoteFiles } from "./noteStore";
import { createSync } from "./sync";
import {
  clearEndpoint,
  endpointUrl,
  loadEndpoint,
  saveEndpoint,
  serviceTransport,
  validateEndpoint,
  type ServiceEndpoint,
} from "./serviceSync";

const V1 = '{"version":1,"sessions":{}}';

/** Minimal Storage (node has no localStorage). */
function fakeStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (key) => map.get(key) ?? null,
    key: (index) => [...map.keys()][index] ?? null,
    removeItem: (key) => {
      map.delete(key);
    },
    setItem: (key, value) => {
      map.set(key, value);
    },
  };
}

function response(status: number, etag: string, text: string): Response {
  return {
    status,
    headers: { get: (name: string) => (name.toLowerCase() === "etag" ? etag : null) },
    text: async () => text,
  } as Response;
}

/** An in-memory service that enforces If-Match, mirroring the real contract. */
function inMemoryService(initial: string) {
  let file = initial;
  let etag = `"0"`;

  async function handle(_url: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const headers = (init?.headers ?? {}) as Record<string, string>;
    const method = init?.method ?? "GET";
    if (method === "GET") return response(200, etag, file);
    if (method === "PUT") {
      if (headers["If-Match"] !== etag) return response(412, etag, "");
      file = String(init?.body ?? "");
      etag = `"1"`;
      return response(204, etag, "");
    }
    return response(405, etag, "");
  }

  return {
    fetch: (async (input, init) => handle(input, init)) as typeof fetch,
    file: () => file,
  };
}

const ENDPOINT: ServiceEndpoint = { baseUrl: "http://127.0.0.1:3010", token: "secret-token-0123456789" };

function configuredStore(): Storage {
  const storage = fakeStorage();
  saveEndpoint(ENDPOINT, storage);
  return storage;
}

describe("service endpoint storage (Step 4)", () => {
  it("saves, loads, and clears the endpoint from device storage", () => {
    const storage = fakeStorage();
    expect(loadEndpoint(storage)).toBeNull();
    saveEndpoint(ENDPOINT, storage);
    expect(loadEndpoint(storage)).toEqual(ENDPOINT);
    clearEndpoint(storage);
    expect(loadEndpoint(storage)).toBeNull();
  });

  it("treats malformed storage as unset", () => {
    const storage = fakeStorage();
    storage.setItem("lectio-sync-service", "not json");
    expect(loadEndpoint(storage)).toBeNull();
  });

  it("joins the base URL onto the route, tolerating a trailing slash", () => {
    expect(endpointUrl({ baseUrl: "http://h/", token: "t" })).toBe("http://h/lectio-sessions.json");
    expect(endpointUrl(ENDPOINT)).toBe("http://127.0.0.1:3010/lectio-sessions.json");
  });

  it("validates an endpoint before it is saved", () => {
    const good = { baseUrl: "https://ideacentre.example", token: "secret-token-0123456789" };
    expect(validateEndpoint(good)).toBeNull();
    expect(validateEndpoint({ ...good, baseUrl: "  " })).toBe("Enter the sync service URL.");
    expect(validateEndpoint({ ...good, token: "  " })).toBe("Enter the sync service token.");
    expect(validateEndpoint({ ...good, token: "short" })).toBe("The token must be at least 16 characters.");
    expect(validateEndpoint({ ...good, token: "has a space in it" })).toBe("The token must not contain spaces.");
    expect(validateEndpoint({ ...good, baseUrl: "not a url" })).toBe("The URL is not valid.");
    expect(validateEndpoint({ ...good, baseUrl: "ftp://h" })).toBe("The URL must start with http:// or https://.");
  });
});

describe("service transport (Step 4)", () => {
  it("status is ready when configured, none when not", async () => {
    const transport = serviceTransport({ load: () => loadEndpoint(fakeStorage()) });
    expect(await transport.status()).toBe("none");
    const configured = serviceTransport({ load: () => loadEndpoint(configuredStore()) });
    expect(await configured.status()).toBe("ready");
  });

  it("strips a weak etag before sending If-Match", async () => {
    const store = configuredStore();
    let sent: string | null = null;
    const fetchFn = (async (_input, init) => {
      const method = init?.method ?? "GET";
      const headers = (init?.headers ?? {}) as Record<string, string>;
      if (method === "PUT") {
        sent = headers["If-Match"] ?? null;
        return response(204, 'W/"1"', "");
      }
      return response(200, 'W/"abc"', V1);
    }) as typeof fetch;
    const transport = serviceTransport({ load: () => loadEndpoint(store), fetchFn });
    await transport.read();
    await transport.write(V1);
    expect(sent).toBe('"abc"');
  });

  it("read is the GET and write sends that read's etag", async () => {
    const store = configuredStore();
    const svc = inMemoryService(V1);
    const transport = serviceTransport({ load: () => loadEndpoint(store), fetchFn: svc.fetch });

    expect(await transport.read()).toBe(V1);
    // A write with the just-read etag lands; the file now holds the new bundle.
    await transport.write('{"version":1,"sessions":{"gradibus":{"id":"d","work":"gradibus","started":"2026-09-27","cursor":null,"satWith":[],"annotations":[]}}}');
    expect(svc.file()).toContain('"gradibus"');
  });

  it("refuses a write when a competing transport already landed (412)", async () => {
    const store = configuredStore();
    const svc = inMemoryService(V1);
    const a = serviceTransport({ load: () => loadEndpoint(store), fetchFn: svc.fetch });
    const b = serviceTransport({ load: () => loadEndpoint(store), fetchFn: svc.fetch });

    await a.read(); // etag "0"
    await b.read(); // same remote, same etag "0"
    await a.write(V1); // lands; remote etag advances to "1"

    // b still holds "0": the write is refused, not silently overwritten.
    await expect(b.write(V1)).rejects.toThrow();
  });

  it("a failed read surfaces an error so the controller keeps local progress", async () => {
    const store = configuredStore();
    const failFetch = (async () => {
      throw new Error("network down");
    }) as typeof fetch;
    const transport = serviceTransport({ load: () => loadEndpoint(store), fetchFn: failFetch });
    await expect(transport.read()).rejects.toThrow();
  });
});

const PLACE = { kind: "psalm" as const, psalm: 118, section: "nun" };

function learningFile(body: string, updated: string) {
  const created = createLearningNote(PLACE, "09", "2026-10-22", updated);
  const written = editLearningNote(created!, "Memoria", body, updated);
  return { name: written.filename, text: formatNoteFile(written), note: written };
}

function httpResponse(status: number, etag: string, text: string): Response {
  return {
    status,
    headers: { get: (name: string) => (name.toLowerCase() === "etag" ? etag : null) },
    text: async () => text,
    json: async () => JSON.parse(text),
  } as Response;
}

describe("service notes", () => {
  it("keeps the later note and says so", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "lectio-note-sync-"));
    const server = createServer(
      createSyncHandler(
        new FileStore(path.join(root, "lectio-sessions.json")),
        { token: ENDPOINT.token, origins: ["http://127.0.0.1:5180"] },
        new NoteDirectory(path.join(root, "notes")),
      ),
    );
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const port = (server.address() as AddressInfo).port;
    const endpoint = { baseUrl: `http://127.0.0.1:${port}`, token: ENDPOINT.token };
    try {
      const earlier = learningFile("First.", "2026-10-22T22:13:00.000Z");
      const later = learningFile("Second.", "2026-10-22T23:00:00.000Z");
      const here = memoryNoteFiles([earlier]);
      const there = memoryNoteFiles([later]);
      const syncHere = createSync({
        transport: serviceTransport({ load: () => endpoint }),
        storage: fakeStorage(),
        notes: here,
      });
      const syncThere = createSync({
        transport: serviceTransport({ load: () => endpoint }),
        storage: fakeStorage(),
        notes: there,
      });
      await syncHere.start();
      await syncHere.syncNow();
      await syncThere.start();
      expect(syncThere.current().text).toContain("Kept the later note 09_psalm_118_nun.md");
      await syncThere.syncNow();
      await syncHere.syncNow();
      expect(syncHere.current().text).toContain("Kept the later note 09_psalm_118_nun.md");
      expect((await here.list()).find((file) => file.name === later.name)?.text).toBe(later.text);
      const stored = await fs.readFile(path.join(root, "notes", later.name), "utf8");
      expect(stored).toBe(later.text);
    } finally {
      await new Promise<void>((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
      await fs.rm(root, { recursive: true, force: true });
    }
  });

  it("a delete is a tombstone, so the other device does not put the note back", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "lectio-note-tomb-"));
    const notesDir = path.join(root, "notes");
    const server = createServer(
      createSyncHandler(
        new FileStore(path.join(root, "lectio-sessions.json")),
        { token: ENDPOINT.token, origins: ["http://127.0.0.1:5180"] },
        new NoteDirectory(notesDir),
      ),
    );
    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const port = (server.address() as AddressInfo).port;
    const endpoint = { baseUrl: `http://127.0.0.1:${port}`, token: ENDPOINT.token };
    try {
      const file = learningFile("Still here.", "2026-10-22T22:13:00.000Z");
      const here = memoryNoteFiles([file]);
      const there = memoryNoteFiles([file]);
      const syncHere = createSync({
        transport: serviceTransport({ load: () => endpoint }),
        storage: fakeStorage(),
        notes: here,
      });
      const syncThere = createSync({
        transport: serviceTransport({ load: () => endpoint }),
        storage: fakeStorage(),
        notes: there,
      });
      await syncHere.start();
      await syncHere.syncNow();
      await syncThere.start();
      await deleteLearningNote(here, file.note, "2026-10-22T23:00:00.000Z");
      await syncHere.syncNow();
      await syncThere.syncNow();
      const names = await fs.readdir(notesDir);
      expect(names).toEqual(["09_psalm_118_nun.md.deleted"]);
      expect((await there.list()).map((item) => item.name)).toEqual(["09_psalm_118_nun.md.deleted"]);
    } finally {
      await new Promise<void>((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
      await fs.rm(root, { recursive: true, force: true });
    }
  });

  it("a 412 leaves this device's note in place", async () => {
    const local = learningFile("Second.", "2026-10-22T23:00:00.000Z");
    const remote = learningFile("First.", "2026-10-22T22:13:00.000Z");
    let puts = 0;
    const fetchFn = (async (input, init) => {
      const url = String(input);
      const method = init?.method ?? "GET";
      if (url.endsWith("/lectio-sessions.json")) return httpResponse(method === "PUT" ? 204 : 200, '"b"', method === "GET" ? "" : "");
      if (url.endsWith("/notes") && method === "GET") {
        return httpResponse(200, "", JSON.stringify({ files: [{ name: remote.name, etag: '"n1"' }] }));
      }
      if (method === "GET") return httpResponse(200, '"n1"', remote.text);
      if (method === "PUT") {
        puts += 1;
        return httpResponse(412, '"n2"', "");
      }
      return httpResponse(405, "", "");
    }) as typeof fetch;
    const files = memoryNoteFiles([local]);
    const sync = createSync({
      transport: serviceTransport({ load: () => ENDPOINT, fetchFn }),
      storage: fakeStorage(),
      notes: files,
    });
    await sync.start();
    expect(puts).toBe(0);
    await sync.syncNow();
    expect(puts).toBe(1);
    expect(sync.current().mode).toBe("offline");
    expect((await files.list()).find((file) => file.name === local.name)?.text).toBe(local.text);
  });

  it("reads note text from the list and does not fetch each file", async () => {
    const note = learningFile("From the list.", "2026-10-22T22:13:00.000Z");
    const calls: string[] = [];
    const fetchFn = (async (input, init) => {
      const url = String(input);
      const method = init?.method ?? "GET";
      if (url.endsWith("/lectio-sessions.json")) return httpResponse(200, '"b"', "");
      if (url.endsWith("/notes") && method === "GET") {
        calls.push("list");
        return httpResponse(200, "", JSON.stringify({ files: [{ name: note.name, etag: '"n1"', text: note.text }] }));
      }
      calls.push(`${method} ${url}`);
      return httpResponse(404, "", "");
    }) as typeof fetch;
    const files = memoryNoteFiles([]);
    const sync = createSync({
      transport: serviceTransport({ load: () => ENDPOINT, fetchFn }),
      storage: fakeStorage(),
      notes: files,
    });
    await sync.syncNow({ pull: true });
    expect(calls).toEqual(["list"]);
    expect((await files.list()).find((file) => file.name === note.name)?.text).toBe(note.text);
  });

  it("fetches note bodies together, then skips a file whose etag is unchanged", async () => {
    const note = learningFile("Fetched once.", "2026-10-22T22:13:00.000Z");
    let noteGets = 0;
    const fetchFn = (async (input, init) => {
      const url = String(input);
      const method = init?.method ?? "GET";
      if (url.endsWith("/lectio-sessions.json")) return httpResponse(200, '"b"', "");
      if (url.endsWith("/notes") && method === "GET") {
        return httpResponse(200, "", JSON.stringify({ files: [{ name: note.name, etag: '"n1"' }] }));
      }
      if (method === "GET") {
        noteGets += 1;
        return httpResponse(200, '"n1"', note.text);
      }
      return httpResponse(405, "", "");
    }) as typeof fetch;
    const transport = serviceTransport({ load: () => ENDPOINT, fetchFn });
    const sync = createSync({
      transport,
      storage: fakeStorage(),
      notes: memoryNoteFiles([]),
    });
    await sync.syncNow({ pull: true });
    await sync.syncNow({ pull: true });
    expect(noteGets).toBe(1);
  });
});

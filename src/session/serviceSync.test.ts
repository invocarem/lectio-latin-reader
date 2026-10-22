/// <reference types="vitest/globals" />

/**
 * Step 4 transport tests — the sync service transport in `serviceSync.ts`.
 *
 * read() is the GET, write() is the PUT sent with the etag from the last read;
 * a stale write (412) throws so the controller keeps local progress; and the
 * endpoint lives in device storage so a device uses either the picked file or
 * this service, never both.
 */

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

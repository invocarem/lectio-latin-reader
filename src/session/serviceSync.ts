/**
 * A sync transport backed by the home sync service.
 *
 * `read()` is the service's `GET /lectio-sessions.json` and `write()` is its
 * `PUT`, sent with the `ETag` captured from the last read as `If-Match`. The
 * service refuses a write whose etag is stale (412), so a device that raced
 * another writer does not lose its edit: the controller turns the thrown write
 * into "kept local progress", and the next open reads again and merges.
 *
 * The base URL and token live in device storage, chosen over (or instead of)
 * the picked Drive file. One device uses one backend at a time.
 */

import type { SyncTransport } from "./sync";

export type ServiceEndpoint = { baseUrl: string; token: string };

/** The one route the sync service exposes; it must not require the token for OPTIONS. */
export const SERVICE_ROUTE = "/lectio-sessions.json";

const SERVICE_KEY = "lectio-sync-service";

/** Base URL without a trailing slash, plus the route. */
export function endpointUrl(endpoint: ServiceEndpoint): string {
  return `${endpoint.baseUrl.replace(/\/+$/, "")}${SERVICE_ROUTE}`;
}

export function loadEndpoint(storage: Storage | null): ServiceEndpoint | null {
  if (!storage) return null;
  const raw = storage.getItem(SERVICE_KEY);
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Record<string, unknown>;
    if (typeof value.baseUrl === "string" && typeof value.token === "string") {
      return { baseUrl: value.baseUrl, token: value.token };
    }
  } catch {
    // malformed: treated as unset
  }
  return null;
}

export function saveEndpoint(endpoint: ServiceEndpoint, storage: Storage | null): void {
  storage?.setItem(SERVICE_KEY, JSON.stringify(endpoint));
}

export function clearEndpoint(storage: Storage | null): void {
  storage?.removeItem(SERVICE_KEY);
}

/**
 * Check a service endpoint before saving it. Returns an error string, or null
 * when the endpoint is worth saving. The server refuses a token shorter than
 * 16 characters or with spaces, so the client mirrors that to catch copy-paste
 * mistakes early.
 */
export function validateEndpoint(input: { baseUrl: string; token: string }): string | null {
  const url = input.baseUrl.trim();
  const token = input.token.trim();
  if (!url) return "Enter the sync service URL.";
  if (!token) return "Enter the sync service token.";
  if (token.length < 16) return "The token must be at least 16 characters.";
  if (/\s/.test(token)) return "The token must not contain spaces.";
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return "The URL must start with http:// or https://.";
    }
  } catch {
    return "The URL is not valid.";
  }
  return null;
}

type ServiceTransportOptions = {
  load: () => ServiceEndpoint | null;
  fetchFn?: typeof fetch;
};

/**
 * The tunnel compresses the body and rewrites a strong etag as `W/"…"`.
 * The quoted hash is unchanged. If-Match has to be the strong form, or the
 * service answers 412 and this device reports that it could not reach sync.
 */
function asStrongEtag(value: string | null): string | null {
  if (!value) return null;
  const strong = value.trim().replace(/^W\//i, "");
  return strong.length > 0 ? strong : null;
}

export function serviceTransport(options: ServiceTransportOptions): SyncTransport {
  const fetchFn = options.fetchFn ?? ((input, init) => fetch(input, init));
  let etag: string | null = null;

  function requireEndpoint(): ServiceEndpoint {
    const endpoint = options.load();
    if (!endpoint) throw new Error("No sync service configured");
    return endpoint;
  }

  return {
    async status() {
      return options.load() ? "ready" : "none";
    },
    async choose() {
      // The service is configured through configureSyncService, not a file picker.
    },
    async prepare() {
      // Nothing to grant: it is reachable the moment it is configured.
    },
    async read() {
      const endpoint = requireEndpoint();
      const res = await fetchFn(endpointUrl(endpoint), {
        method: "GET",
        headers: { Authorization: `Bearer ${endpoint.token}` },
        cache: "no-store",
      });
      if (res.status !== 200) throw new Error(`Sync GET failed (${res.status})`);
      const next = asStrongEtag(res.headers.get("etag"));
      if (next) etag = next;
      return res.text();
    },
    async write(text) {
      const endpoint = requireEndpoint();
      const headers: Record<string, string> = {
        Authorization: `Bearer ${endpoint.token}`,
        "Content-Type": "application/json",
      };
      if (etag) headers["If-Match"] = etag;
      const res = await fetchFn(endpointUrl(endpoint), {
        method: "PUT",
        headers,
        body: text,
      });
      if (res.status === 204) {
        const next = asStrongEtag(res.headers.get("etag"));
        if (next) etag = next;
        return;
      }
      // 412 (raced), 401, 428, 400, 413: nothing was stored. Letting this throw
      // is what keeps this device's own progress for the next read.
      throw new Error(`Sync PUT failed (${res.status})`);
    },
  };
}

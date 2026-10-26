/**
 * A sync transport backed by the home sync service.
 *
 * `read()` is the service's `GET /lectio-sessions.json` and `write()` is its
 * `PUT`, sent with the `ETag` captured from the last read as `If-Match`.
 * `listNotes`, `writeNote`, and `removeNote` are the `/notes` routes. The
 * list carries each note's text, so one response is the whole folder. A list
 * from an older service has no text; those files are fetched together, and a
 * file already held at the same etag is not fetched again. A service started
 * with a single file answers `404` on `/notes`, and that is an empty absence:
 * this device keeps its local notes. A `412` on a note leaves the note here
 * for the next read. A request that does not answer within 15 seconds fails,
 * and this device keeps its own progress.
 *
 * The base URL and token live in device storage, chosen over (or instead of)
 * the picked Drive file. One device uses one backend at a time.
 */

import type { NoteFile } from "./noteStore";
import type { SyncTransport } from "./sync";

export type ServiceEndpoint = { baseUrl: string; token: string };

/** The bundle route. It does not require the token for OPTIONS. */
export const SERVICE_ROUTE = "/lectio-sessions.json";

/** The notes collection. A file-only service answers 404 here. */
export const NOTES_ROUTE = "/notes";

const SERVICE_KEY = "lectio-sync-service";

/** A cold tunnel should fail the sync, not hold the button. */
const FETCH_TIMEOUT_MS = 15_000;

/** Base URL without a trailing slash, plus the route. */
export function endpointUrl(endpoint: ServiceEndpoint): string {
  return `${endpoint.baseUrl.replace(/\/+$/, "")}${SERVICE_ROUTE}`;
}

/** One note file, or the collection when `name` is omitted. */
export function notesUrl(endpoint: ServiceEndpoint, name?: string): string {
  const base = `${endpoint.baseUrl.replace(/\/+$/, "")}${NOTES_ROUTE}`;
  return name ? `${base}/${encodeURIComponent(name)}` : base;
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

/** Bound one service call. `AbortSignal.timeout` does not keep the process alive. */
function timeoutSignal(ms: number): AbortSignal {
  if (typeof AbortSignal.timeout === "function") return AbortSignal.timeout(ms);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  if (typeof timer === "object" && timer !== null && "unref" in timer) timer.unref();
  return controller.signal;
}

function timed(init: RequestInit): RequestInit {
  return { ...init, signal: init.signal ?? timeoutSignal(FETCH_TIMEOUT_MS) };
}

export function serviceTransport(options: ServiceTransportOptions): SyncTransport {
  const fetchFn = options.fetchFn ?? ((input, init) => fetch(input, init));
  let etag: string | null = null;
  const noteEtags = new Map<string, string>();
  /** Text already read for an etag, so a later list can skip the file. */
  const noteBodies = new Map<string, { etag: string; text: string }>();

  function requireEndpoint(): ServiceEndpoint {
    const endpoint = options.load();
    if (!endpoint) throw new Error("No sync service configured");
    return endpoint;
  }

  function authHeaders(endpoint: ServiceEndpoint): Record<string, string> {
    return { Authorization: `Bearer ${endpoint.token}` };
  }

  /**
   * One row of `GET /notes`. Text in the row is the file. A row without text
   * is fetched, unless this transport already holds that etag.
   */
  async function readListedNote(
    endpoint: ServiceEndpoint,
    item: { name?: unknown; etag?: unknown; text?: unknown },
  ): Promise<NoteFile | null> {
    if (typeof item.name !== "string" || item.name.length === 0) return null;
    const name = item.name;
    const listedEtag = typeof item.etag === "string" ? asStrongEtag(item.etag) : null;
    if (listedEtag) noteEtags.set(name, listedEtag);
    if (typeof item.text === "string") {
      if (listedEtag) noteBodies.set(name, { etag: listedEtag, text: item.text });
      return { name, text: item.text };
    }
    const cached = noteBodies.get(name);
    if (cached && listedEtag && cached.etag === listedEtag) return { name, text: cached.text };
    const file = await fetchFn(notesUrl(endpoint, name), timed({
      method: "GET",
      headers: authHeaders(endpoint),
      cache: "no-store",
    }));
    if (file.status !== 200) throw new Error(`Sync note GET failed (${file.status})`);
    const next = asStrongEtag(file.headers.get("etag")) ?? listedEtag;
    if (next) noteEtags.set(name, next);
    const text = await file.text();
    if (next) noteBodies.set(name, { etag: next, text });
    return { name, text };
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
      const res = await fetchFn(endpointUrl(endpoint), timed({
        method: "GET",
        headers: authHeaders(endpoint),
        cache: "no-store",
      }));
      if (res.status !== 200) throw new Error(`Sync GET failed (${res.status})`);
      const next = asStrongEtag(res.headers.get("etag"));
      if (next) etag = next;
      return res.text();
    },
    async write(text) {
      const endpoint = requireEndpoint();
      const headers: Record<string, string> = {
        ...authHeaders(endpoint),
        "Content-Type": "application/json",
      };
      if (etag) headers["If-Match"] = etag;
      const res = await fetchFn(endpointUrl(endpoint), timed({
        method: "PUT",
        headers,
        body: text,
      }));
      if (res.status === 204) {
        const next = asStrongEtag(res.headers.get("etag"));
        if (next) etag = next;
        return;
      }
      // 412 (raced), 401, 428, 400, 413: nothing was stored. Letting this throw
      // is what keeps this device's own progress for the next read.
      throw new Error(`Sync PUT failed (${res.status})`);
    },
    async listNotes() {
      const endpoint = requireEndpoint();
      const res = await fetchFn(notesUrl(endpoint), timed({
        method: "GET",
        headers: authHeaders(endpoint),
        cache: "no-store",
      }));
      if (res.status === 404) return null;
      if (res.status !== 200) throw new Error(`Sync notes GET failed (${res.status})`);
      const body = (await res.json()) as { files?: { name?: unknown; etag?: unknown; text?: unknown }[] };
      const listed = Array.isArray(body.files) ? body.files : [];
      const files = await Promise.all(listed.map((item) => readListedNote(endpoint, item)));
      return files.filter((file): file is NoteFile => file != null);
    },
    async writeNote(name, text) {
      const endpoint = requireEndpoint();
      let match = noteEtags.get(name) ?? null;
      if (!match) {
        const probe = await fetchFn(notesUrl(endpoint, name), timed({
          method: "GET",
          headers: authHeaders(endpoint),
          cache: "no-store",
        }));
        if (probe.status !== 200) throw new Error(`Sync note GET failed (${probe.status})`);
        match = asStrongEtag(probe.headers.get("etag"));
        if (match) noteEtags.set(name, match);
      }
      const headers: Record<string, string> = {
        ...authHeaders(endpoint),
        "Content-Type": name.endsWith(".deleted") ? "text/plain; charset=utf-8" : "text/markdown; charset=utf-8",
      };
      if (match) headers["If-Match"] = match;
      const res = await fetchFn(notesUrl(endpoint, name), timed({
        method: "PUT",
        headers,
        body: text,
      }));
      if (res.status === 204) {
        const next = asStrongEtag(res.headers.get("etag"));
        if (next) {
          noteEtags.set(name, next);
          noteBodies.set(name, { etag: next, text });
        }
        return;
      }
      // 412 leaves this device's note where it is. The next read merges.
      throw new Error(`Sync note PUT failed (${res.status})`);
    },
    async removeNote(name) {
      const endpoint = requireEndpoint();
      let match = noteEtags.get(name) ?? null;
      if (!match) {
        const probe = await fetchFn(notesUrl(endpoint, name), timed({
          method: "GET",
          headers: authHeaders(endpoint),
          cache: "no-store",
        }));
        if (probe.status !== 200) throw new Error(`Sync note GET failed (${probe.status})`);
        match = asStrongEtag(probe.headers.get("etag"));
      }
      const headers: Record<string, string> = { ...authHeaders(endpoint) };
      if (match) headers["If-Match"] = match;
      const res = await fetchFn(notesUrl(endpoint, name), timed({ method: "DELETE", headers }));
      if (res.status === 204) {
        noteEtags.delete(name);
        noteBodies.delete(name);
        return;
      }
      throw new Error(`Sync note DELETE failed (${res.status})`);
    },
  };
}

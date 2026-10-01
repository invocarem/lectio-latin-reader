/**
 * Local storage of the open session pass, keyed per work. On the phone this is
 * Capacitor local storage; in the browser it is localStorage. Import/export
 * write the same document as a JSON file.
 */

import { parseSession, serializeSession, type SessionDoc, type SessionWork } from "./document";

/** The storage key for one work's open pass. */
export function sessionKey(work: SessionWork): string {
  return `session.${work}`;
}

function local(): Storage | null {
  try {
    return typeof globalThis.localStorage !== "undefined" ? globalThis.localStorage : null;
  } catch {
    return null;
  }
}

/** Load a work's open pass, or null when none is stored or the file is invalid. */
export function loadSession(work: SessionWork, storage?: Storage | null): SessionDoc | null {
  const store = storage ?? local();
  if (!store) return null;
  const raw = store.getItem(sessionKey(work));
  if (!raw) return null;
  return parseSession(raw);
}

/** Save a work's open pass. */
export function saveSession(doc: SessionDoc, storage?: Storage | null): void {
  const store = storage ?? local();
  if (!store) return;
  store.setItem(sessionKey(doc.work), serializeSession(doc));
}

/** Drop a work's open pass. Used by tests. */
export function clearSession(work: SessionWork, storage?: Storage | null): void {
  const store = storage ?? local();
  if (!store) return;
  store.removeItem(sessionKey(work));
}

/**
 * Local storage of the open session pass. On the phone this is Capacitor local
 * storage; in the browser it is localStorage. Import/export write the same
 * document as a JSON file.
 */

import { parseSession, serializeSession, type SessionDoc } from "./document";

const STORAGE_KEY = "session.cursus";

function local(): Storage | null {
  try {
    return typeof globalThis.localStorage !== "undefined" ? globalThis.localStorage : null;
  } catch {
    return null;
  }
}

/** Load the open pass, or null when none is stored or the file is invalid. */
export function loadSession(storage?: Storage | null): SessionDoc | null {
  const store = storage ?? local();
  if (!store) return null;
  const raw = store.getItem(STORAGE_KEY);
  if (!raw) return null;
  return parseSession(raw);
}

/** Save the open pass. */
export function saveSession(doc: SessionDoc, storage?: Storage | null): void {
  const store = storage ?? local();
  if (!store) return;
  store.setItem(STORAGE_KEY, serializeSession(doc));
}

/** Drop the open pass. Used by tests. */
export function clearSession(storage?: Storage | null): void {
  const store = storage ?? local();
  if (!store) return;
  store.removeItem(STORAGE_KEY);
}

export { STORAGE_KEY };

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

let onRealEdit: (() => void) | undefined;

/** Called after a real change to the default store. Sync registers this. */
export function onSessionEdit(listener: () => void): void {
  onRealEdit = listener;
}

/** True when `next` is a real edit worth writing to the sync file. */
export function sessionChanged(previous: SessionDoc | null, next: SessionDoc): boolean {
  if (!previous) {
    return (
      next.cursor != null ||
      next.satWith.length > 0 ||
      next.annotations.length > 0 ||
      next.touchedAt != null ||
      next.cursorAt != null
    );
  }
  return serializeSession(previous) !== serializeSession(next);
}

/** Load a work's open pass, or null when none is stored or the file is invalid. */
export function loadSession(work: SessionWork, storage?: Storage | null): SessionDoc | null {
  const store = storage ?? local();
  if (!store) return null;
  const raw = store.getItem(sessionKey(work));
  if (!raw) return null;
  return parseSession(raw);
}

/**
 * Save a work's open pass. `silent` writes without telling sync, which uses
 * it while applying the sync file so that write does not schedule another.
 */
export function saveSession(
  doc: SessionDoc,
  storage?: Storage | null,
  options?: { silent?: boolean },
): void {
  const store = storage ?? local();
  if (!store) return;
  const track = storage === undefined && !options?.silent;
  const previous = track ? loadSession(doc.work, store) : null;
  store.setItem(sessionKey(doc.work), serializeSession(doc));
  if (track && sessionChanged(previous, doc)) onRealEdit?.();
}

/** Drop a work's open pass. Used by tests. */
export function clearSession(work: SessionWork, storage?: Storage | null): void {
  const store = storage ?? local();
  if (!store) return;
  store.removeItem(sessionKey(work));
}

/**
 * Keep one lectio-sessions.json in step with this device. The file is read
 * when the app opens and written a few seconds after a real edit. The folder
 * it lives in (iCloud Drive, Dropbox, OneDrive) carries the bytes. This module
 * merges; it does not replace.
 */

import {
  BUNDLE_VERSION,
  bundleFromStorage,
  describeMerge,
  mergeBundle,
  parseBundle,
  type BundleOutcome,
  type SessionBundle,
} from "./bundle";
import { annotationIdentity, isUnitAnnotation, type Annotation, type SessionDoc } from "./document";
import { describeNoteMerge, isNoteEntry, mergeNoteFolders } from "./noteSync";
import { type NoteFile, type NoteFiles } from "./noteStore";
import { saveSession } from "./store";

export type SyncMode = "unsupported" | "none" | "needs-gesture" | "ready" | "offline";

export type SyncNotice = {
  mode: SyncMode;
  text: string;
  refreshed: boolean;
};

export type SyncTransport = {
  status(): Promise<Exclude<SyncMode, "offline">>;
  /** User chose the file. Throws if they cancel. */
  choose(): Promise<void>;
  /** User granted access again, without picking a new file. */
  prepare(): Promise<void>;
  read(): Promise<string>;
  write(text: string): Promise<void>;
  /**
   * Notes beside the progress file. `null` means this backend has no notes
   * folder (the sync service, until it grows those routes). An empty list is
   * a folder with no notes.
   */
  listNotes?(): Promise<NoteFile[] | null>;
  writeNote?(name: string, text: string): Promise<void>;
  removeNote?(name: string): Promise<void>;
};

const CHOOSE =
  "Choose the lectio-sessions folder in a shared place such as Google Drive, or save a sync service. The folder holds lectio-sessions.json and a notes directory.";
const WAITING = "Sync is waiting for access to the folder. Tap Sync now.";
const OFFLINE = "Could not reach sync. This device kept its own progress.";
const UNREADABLE = "Sync did not return lectio progress. This device kept its own progress.";
const UNSUPPORTED = "This browser cannot keep a sync folder open. Save a sync service, or use Export and Import.";

export const SYNC_DELAY_MS = 4000;

type Cancel = { cancel(): void };

export type ChooseResult = "opened" | "cancelled" | "failed";

export type SyncController = {
  start(): Promise<void>;
  choose(): Promise<ChooseResult>;
  syncNow(options?: { keepRemotePass?: boolean; pull?: boolean }): Promise<void>;
  /** Read and merge when a file is already allowed. Does nothing if it is not. */
  syncIfReady(): Promise<void>;
  noteEdit(): void;
  current(): SyncNotice;
  subscribe(listener: (notice: SyncNotice) => void): () => void;
};

function emptyBundle(): SessionBundle {
  return { version: BUNDLE_VERSION, sessions: {} };
}

/** Office lines stay in psalm order. A lectio page sorts by its unit id. */
function compareAnnotations(a: Annotation, b: Annotation): number {
  if (!isUnitAnnotation(a) && !isUnitAnnotation(b)) {
    return a.psalm - b.psalm || a.line.localeCompare(b.line) || a.at.localeCompare(b.at);
  }
  return annotationIdentity(a).localeCompare(annotationIdentity(b)) || a.at.localeCompare(b.at);
}

function canonicalDoc(doc: SessionDoc): SessionDoc {
  return {
    id: doc.id,
    work: doc.work,
    ...(doc.pace != null ? { pace: doc.pace } : {}),
    started: doc.started,
    cursor: doc.cursor,
    ...(doc.cursorAt ? { cursorAt: doc.cursorAt } : {}),
    ...(doc.touchedAt ? { touchedAt: doc.touchedAt } : {}),
    ...(doc.passAt ? { passAt: doc.passAt } : {}),
    satWith: [...doc.satWith].sort((a, b) => a.step.localeCompare(b.step) || a.at.localeCompare(b.at)),
    annotations: [...doc.annotations].sort(compareAnnotations),
  };
}

/** Stable text so two devices do not rewrite the file when nothing changed. */
export function canonicalBundle(bundle: SessionBundle): string {
  const sessions: SessionBundle["sessions"] = {};
  for (const key of Object.keys(bundle.sessions).sort()) {
    const doc = bundle.sessions[key as keyof SessionBundle["sessions"]];
    if (doc) sessions[doc.work] = canonicalDoc(doc);
  }
  return JSON.stringify({ version: BUNDLE_VERSION, sessions }, null, 2);
}

export function mergeRemoteText(
  text: string,
  storage?: Storage | null,
  options?: { keepRemotePass?: boolean },
): { ok: true; outcome: BundleOutcome; nextText: string; dirty: boolean } | { ok: false } {
  const trimmed = text.trim();
  const parsed = trimmed === "" ? { bundle: emptyBundle(), skipped: [] } : parseBundle(trimmed);
  if (!parsed) return { ok: false };
  const outcome = mergeBundle(bundleFromStorage(storage), parsed.bundle, options);
  for (const doc of Object.values(outcome.sessions)) {
    if (!doc) continue;
    saveSession(doc, storage, { silent: true });
  }
  const nextText = canonicalBundle(bundleFromStorage(storage));
  return { ok: true, outcome, nextText, dirty: canonicalBundle(parsed.bundle) !== nextText };
}

/** Read the folder's notes into the local store. A pull does not write them back. */
async function applyNotes(
  notes: NoteFiles,
  transport: SyncTransport,
  pull: boolean,
): Promise<{ changed: boolean; notice: string | null }> {
  const remote = await transport.listNotes?.();
  if (remote == null) return { changed: false, notice: null };
  const local = await notes.list();
  const merged = mergeNoteFolders(local, remote);
  const desired = new Map(merged.local.map((file) => [file.name, file.text]));
  let changed = false;
  for (const file of local) {
    if (!isNoteEntry(file.name) || desired.has(file.name)) continue;
    await notes.remove(file.name);
    changed = true;
  }
  for (const file of merged.local) {
    const current = local.find((item) => item.name === file.name);
    if (current?.text === file.text) continue;
    await notes.write(file.name, file.text);
    changed = true;
  }
  if (!pull) {
    for (const file of merged.upload) await transport.writeNote?.(file.name, file.text);
    for (const name of merged.removeRemote) await transport.removeNote?.(name);
  }
  return { changed, notice: describeNoteMerge(merged) };
}

function noticeFor(mode: Exclude<SyncMode, "offline">): SyncNotice {
  if (mode === "unsupported") return { mode, text: UNSUPPORTED, refreshed: false };
  if (mode === "needs-gesture") return { mode, text: WAITING, refreshed: false };
  if (mode === "none") return { mode, text: CHOOSE, refreshed: false };
  return { mode: "ready", text: "Synced.", refreshed: false };
}

function isCancel(error: unknown): boolean {
  if (error instanceof DOMException && error.name === "AbortError") return true;
  const message = error instanceof Error ? error.message : String(error);
  return /cancel|abort/i.test(message);
}

export function createSync(options: {
  transport: SyncTransport;
  storage?: Storage | null;
  /** Learning notes on this device. Absent in tests that only merge the bundle. */
  notes?: NoteFiles;
  delayMs?: number;
  schedule?: (fn: () => void, ms: number) => Cancel;
  onRefreshed?: () => void;
}): SyncController {
  const delayMs = options.delayMs ?? SYNC_DELAY_MS;
  const schedule =
    options.schedule ??
    ((fn, ms) => {
      const id = setTimeout(fn, ms);
      return { cancel: () => clearTimeout(id) };
    });
  let notice: SyncNotice = noticeFor("none");
  const listeners = new Set<(next: SyncNotice) => void>();
  let pending: Cancel | null = null;
  let tail: Promise<void> = Promise.resolve();

  function publish(next: SyncNotice): void {
    notice = next;
    for (const listener of listeners) listener(next);
    if (next.refreshed) options.onRefreshed?.();
  }

  function enqueue<T>(job: () => Promise<T>): Promise<T> {
    const run = tail.then(job, job);
    tail = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  }

  async function run(gesture: boolean, call: { keepRemotePass?: boolean; pull?: boolean } = {}): Promise<void> {
    const status = await options.transport.status();
    if (status === "none" || status === "unsupported") {
      if (gesture) publish(noticeFor(status));
      return;
    }
    if (status === "needs-gesture" && !gesture) {
      publish(noticeFor("needs-gesture"));
      return;
    }
    let text: string;
    try {
      text = await options.transport.read();
    } catch {
      publish({ mode: "offline", text: OFFLINE, refreshed: false });
      return;
    }
    const merged = mergeRemoteText(text, options.storage, {
      keepRemotePass: call.keepRemotePass === true || call.pull === true,
    });
    if (!merged.ok) {
      publish({ mode: "ready", text: UNREADABLE, refreshed: false });
      return;
    }
    const refreshed =
      merged.outcome.sittingsAdded > 0 ||
      merged.outcome.notesAdded > 0 ||
      merged.outcome.cursorsMoved > 0 ||
      merged.outcome.passesReset > 0 ||
      merged.outcome.passesKept > 0 ||
      merged.outcome.conflicts.length > 0;
    const brought =
      merged.outcome.sittingsAdded > 0 ||
      merged.outcome.notesAdded > 0 ||
      merged.outcome.passesReset > 0 ||
      merged.outcome.conflicts.length > 0;
    if (merged.dirty && !call.pull) {
      try {
        await options.transport.write(merged.nextText);
      } catch {
        publish({ mode: "offline", text: OFFLINE, refreshed });
        return;
      }
    }
    let noteNotice: string | null = null;
    let notesChanged = false;
    if (options.notes && options.transport.listNotes) {
      try {
        const applied = await applyNotes(options.notes, options.transport, call.pull === true);
        notesChanged = applied.changed;
        noteNotice = applied.notice;
      } catch {
        publish({ mode: "offline", text: OFFLINE, refreshed });
        return;
      }
    }
    const noticeText = brought
      ? `${describeMerge(merged.outcome)}.${noteNotice ? ` ${noteNotice}` : ""}`
      : noteNotice
        ? noteNotice
        : call.pull
          ? "Up to date."
          : "Synced.";
    publish({
      mode: "ready",
      text: noticeText,
      refreshed: refreshed || notesChanged,
    });
  }

  return {
    async start() {
      const status = await options.transport.status();
      if (status === "ready") await enqueue(() => run(false, { pull: true }));
      else publish(noticeFor(status));
    },
    choose() {
      pending?.cancel();
      pending = null;
      // Start the picker in this turn so the browser still counts it as the click.
      // A pick that does not open leaves the current backend and its notice alone.
      const picking = options.transport.choose();
      return enqueue(async () => {
        try {
          await picking;
        } catch (error) {
          if (isCancel(error)) return "cancelled";
          return "failed";
        }
        await run(true, { pull: true });
        return "opened";
      });
    },
    syncNow(call) {
      pending?.cancel();
      pending = null;
      return enqueue(async () => {
        const status = await options.transport.status();
        if (status === "needs-gesture") {
          try {
            await options.transport.prepare();
          } catch (error) {
            if (isCancel(error)) return;
            publish(noticeFor("needs-gesture"));
            return;
          }
        }
        await run(true, call);
      });
    },
    syncIfReady() {
      return enqueue(() => run(false, { pull: true }));
    },
    noteEdit() {
      pending?.cancel();
      pending = schedule(() => {
        pending = null;
        void enqueue(() => run(false));
      }, delayMs);
    },
    current: () => notice,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

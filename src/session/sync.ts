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
};

const CHOOSE =
  "Choose lectio-sessions.json in a folder your devices already share. Export once if you still need to create that file.";
const WAITING = "Sync is waiting for access to the file. Tap Sync now.";
const OFFLINE = "Could not reach the sync file. This device kept its own progress.";
const UNREADABLE = "The sync file is not lectio progress. This device kept its own progress.";
const UNSUPPORTED = "This browser cannot keep a sync file open. Export and Import will move it.";

export const SYNC_DELAY_MS = 4000;

type Cancel = { cancel(): void };

export type SyncController = {
  start(): Promise<void>;
  choose(): Promise<void>;
  syncNow(): Promise<void>;
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
): { ok: true; outcome: BundleOutcome; nextText: string; dirty: boolean } | { ok: false } {
  const trimmed = text.trim();
  const parsed = trimmed === "" ? { bundle: emptyBundle(), skipped: [] } : parseBundle(trimmed);
  if (!parsed) return { ok: false };
  const outcome = mergeBundle(bundleFromStorage(storage), parsed.bundle);
  for (const doc of Object.values(outcome.sessions)) {
    if (!doc) continue;
    saveSession(doc, storage, { silent: true });
  }
  const nextText = canonicalBundle(bundleFromStorage(storage));
  return { ok: true, outcome, nextText, dirty: canonicalBundle(parsed.bundle) !== nextText };
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
  return /cancel/i.test(message);
}

function failureText(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (/not implemented|unimplemented/i.test(message)) {
    return "This build of the app cannot open a sync file yet. Install the new build, then choose the file.";
  }
  return OFFLINE;
}

export function createSync(options: {
  transport: SyncTransport;
  storage?: Storage | null;
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

  function enqueue(job: () => Promise<void>): Promise<void> {
    const run = tail.then(job, job);
    tail = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  }

  async function run(gesture: boolean): Promise<void> {
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
    const merged = mergeRemoteText(text, options.storage);
    if (!merged.ok) {
      publish({ mode: "ready", text: UNREADABLE, refreshed: false });
      return;
    }
    const refreshed =
      merged.outcome.sittingsAdded > 0 ||
      merged.outcome.notesAdded > 0 ||
      merged.outcome.cursorsMoved > 0 ||
      merged.outcome.conflicts.length > 0;
    if (merged.dirty) {
      try {
        await options.transport.write(merged.nextText);
      } catch {
        publish({ mode: "offline", text: OFFLINE, refreshed });
        return;
      }
    }
    publish({
      mode: "ready",
      text: refreshed ? `${describeMerge(merged.outcome)}.` : "Synced.",
      refreshed,
    });
  }

  return {
    async start() {
      const status = await options.transport.status();
      if (status === "ready") await enqueue(() => run(false));
      else publish(noticeFor(status));
    },
    choose() {
      pending?.cancel();
      pending = null;
      return enqueue(async () => {
        try {
          await options.transport.choose();
        } catch (error) {
          if (isCancel(error)) return;
          publish({ mode: "offline", text: failureText(error), refreshed: false });
          return;
        }
        await run(true);
      });
    },
    syncNow() {
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
        await run(true);
      });
    },
    syncIfReady() {
      return enqueue(() => run(false));
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

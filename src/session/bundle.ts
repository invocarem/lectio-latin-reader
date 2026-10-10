/**
 * One file for every pass: `lectio-sessions.json`. Each key is a work id
 * (or `cursus`) and each value is that work's session document. Import
 * merges. It does not replace.
 */

import {
  SESSION_WORKS,
  annotationIdentity,
  isSessionWork,
  isUnitAnnotation,
  parseSession,
  stepKey,
  type Annotation,
  type SessionDoc,
  type SessionWork,
} from "./document";
import { loadSession, saveSession } from "./store";

export const BUNDLE_VERSION = 1;

export type SessionBundle = {
  version: typeof BUNDLE_VERSION;
  sessions: Partial<Record<SessionWork, SessionDoc>>;
};

export type NoteConflict = {
  work: SessionWork;
  /** Office line. Absent when `unit` names a lectio page. */
  psalm?: number;
  line?: string;
  /** Lectio page id, when the note is on a library work. */
  unit?: string;
  kept: string;
  dropped: string;
};

export type MergeOutcome = {
  doc: SessionDoc;
  sittingsAdded: number;
  notesAdded: number;
  cursorMoved: boolean;
  conflicts: NoteConflict[];
};

export type BundleOutcome = {
  sessions: Partial<Record<SessionWork, SessionDoc>>;
  sittingsAdded: number;
  notesAdded: number;
  cursorsMoved: number;
  conflicts: NoteConflict[];
};

const CIVIL_DAY = /^\d{4}-\d{2}-\d{2}$/;

/** End of a civil date, UTC. Old files only have `YYYY-MM-DD`. */
function endOfCivilDay(day: string): string {
  return `${day}T23:59:59.999Z`;
}

function latestDay(days: string[]): string | null {
  const valid = days.filter((day) => CIVIL_DAY.test(day)).sort();
  return valid.length ? valid[valid.length - 1] : null;
}

/**
 * Fill `cursorAt` and `touchedAt` on an older session file. An empty pass
 * gets neither. A stamp already on the file is kept.
 */
export function convertOldSession(doc: SessionDoc): SessionDoc {
  const { cursorAt, touchedAt, ...rest } = doc;
  const hasActivity = doc.cursor != null || doc.satWith.length > 0 || doc.annotations.length > 0;
  if (!hasActivity) return rest;
  const latest =
    latestDay([...doc.satWith.map((mark) => mark.at), ...doc.annotations.map((note) => note.at)]) ??
    doc.started;
  const stamp = endOfCivilDay(latest);
  return {
    ...rest,
    touchedAt: touchedAt ?? stamp,
    ...(rest.cursor ? { cursorAt: cursorAt ?? stamp } : {}),
  };
}

function later(a: string | undefined, b: string | undefined): "local" | "remote" | "neither" {
  if (a && b) return a >= b ? "local" : "remote";
  if (a) return "local";
  if (b) return "remote";
  return "neither";
}

function mergeSittings(
  work: SessionWork,
  local: SessionDoc["satWith"],
  remote: SessionDoc["satWith"],
): { satWith: SessionDoc["satWith"]; added: number } {
  const byKey = new Map<string, { step: string; at: string }>();
  for (const mark of local) byKey.set(stepKey(work, mark.step), mark);
  let added = 0;
  for (const mark of remote) {
    const key = stepKey(work, mark.step);
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, mark);
      added += 1;
    } else if (mark.at < existing.at) {
      byKey.set(key, mark);
    }
  }
  return { satWith: [...byKey.values()], added };
}

function noteText(note: Annotation): string {
  return note.text.trim();
}

function preferNote(
  local: Annotation,
  remote: Annotation,
): { annotation: Annotation; dropped?: string } {
  if (local.text === remote.text) {
    return { annotation: local.at <= remote.at ? local : remote };
  }
  const localHas = noteText(local).length > 0;
  const remoteHas = noteText(remote).length > 0;
  if (!localHas && remoteHas) return { annotation: remote };
  if (localHas && !remoteHas) return { annotation: local };
  if (remote.at > local.at) return { annotation: remote, dropped: local.text };
  return { annotation: local, dropped: remote.text };
}

function mergeAnnotations(
  work: SessionWork,
  local: Annotation[],
  remote: Annotation[],
): { annotations: Annotation[]; notesAdded: number; conflicts: NoteConflict[] } {
  const byKey = new Map<string, Annotation>();
  for (const note of local) byKey.set(annotationIdentity(note), note);
  let notesAdded = 0;
  const conflicts: NoteConflict[] = [];
  for (const note of remote) {
    const key = annotationIdentity(note);
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, note);
      notesAdded += 1;
      continue;
    }
    const chosen = preferNote(existing, note);
    if (!noteText(existing) && noteText(chosen.annotation)) notesAdded += 1;
    if (chosen.dropped != null) {
      conflicts.push({
        work,
        ...(isUnitAnnotation(note)
          ? { unit: note.unit }
          : { psalm: note.psalm, line: note.line }),
        kept: chosen.annotation.text,
        dropped: chosen.dropped,
      });
    }
    byKey.set(key, chosen.annotation);
  }
  return { annotations: [...byKey.values()], notesAdded, conflicts };
}

/** Combine two passes of the same work. A different work is ignored. */
export function mergeSession(local: SessionDoc, remote: SessionDoc): MergeOutcome {
  if (local.work !== remote.work) {
    return { doc: local, sittingsAdded: 0, notesAdded: 0, cursorMoved: false, conflicts: [] };
  }
  const sittings = mergeSittings(local.work, local.satWith, remote.satWith);
  const notes = mergeAnnotations(local.work, local.annotations, remote.annotations);
  const cursorSide = later(local.cursorAt, remote.cursorAt);
  const cursor = cursorSide === "remote" ? remote.cursor : local.cursor;
  const cursorAt = cursorSide === "remote" ? remote.cursorAt : local.cursorAt;
  const paceSide = later(local.touchedAt, remote.touchedAt);
  const pace =
    local.work === "cursus"
      ? paceSide === "remote" && remote.pace != null
        ? remote.pace
        : (local.pace ?? remote.pace)
      : undefined;
  const touchedAt =
    paceSide === "remote" ? remote.touchedAt : paceSide === "local" ? local.touchedAt : undefined;
  const doc: SessionDoc = {
    id: local.id,
    work: local.work,
    ...(local.work === "cursus" && pace != null ? { pace } : {}),
    started: local.started <= remote.started ? local.started : remote.started,
    cursor,
    ...(cursorAt ? { cursorAt } : {}),
    ...(touchedAt ? { touchedAt } : {}),
    satWith: sittings.satWith,
    annotations: notes.annotations,
  };
  return {
    doc,
    sittingsAdded: sittings.added,
    notesAdded: notes.notesAdded,
    cursorMoved: cursor !== local.cursor,
    conflicts: notes.conflicts,
  };
}

/** Every stored pass. A work with nothing stored is omitted. */
export function bundleFromStorage(storage?: Storage | null): SessionBundle {
  const sessions: SessionBundle["sessions"] = {};
  for (const work of SESSION_WORKS) {
    const doc = loadSession(work, storage);
    if (doc) sessions[work] = doc;
  }
  return { version: BUNDLE_VERSION, sessions };
}

export function serializeBundle(bundle: SessionBundle): string {
  return JSON.stringify(bundle, null, 2);
}

/**
 * Read a bundle file. Returns null when the JSON is not version 1, so the
 * caller can try a single-work session file instead. Unknown or invalid
 * works are listed in `skipped` and left out.
 */
export function parseBundle(json: string): { bundle: SessionBundle; skipped: string[] } | null {
  try {
    const value = JSON.parse(json) as { version?: unknown; sessions?: unknown };
    if (!value || typeof value !== "object" || value.version !== BUNDLE_VERSION) return null;
    if (!value.sessions || typeof value.sessions !== "object" || Array.isArray(value.sessions)) return null;
    const sessions: SessionBundle["sessions"] = {};
    const skipped: string[] = [];
    for (const [key, raw] of Object.entries(value.sessions)) {
      if (!isSessionWork(key)) {
        skipped.push(key);
        continue;
      }
      const parsed = parseSession(JSON.stringify(raw));
      if (!parsed || parsed.work !== key) {
        skipped.push(key);
        continue;
      }
      sessions[key] = parsed;
    }
    return { bundle: { version: BUNDLE_VERSION, sessions }, skipped };
  } catch {
    return null;
  }
}

function place(into: SessionBundle["sessions"], doc: SessionDoc): void {
  const existing = into[doc.work];
  into[doc.work] = existing ? mergeSession(existing, doc).doc : doc;
}

/**
 * Turn one or more files into one bundle. A version-1 bundle is taken as
 * itself. A single-work session file, including a legacy highlights/notes
 * file, is converted and keyed by its work. A file that is neither is named
 * in `rejected`.
 */
export function sessionsFromFiles(files: { name: string; text: string }[]): {
  bundle: SessionBundle | null;
  rejected: string[];
} {
  const sessions: SessionBundle["sessions"] = {};
  const rejected: string[] = [];
  let accepted = 0;
  for (const file of files) {
    const asBundle = parseBundle(file.text);
    if (asBundle) {
      accepted += 1;
      for (const doc of Object.values(asBundle.bundle.sessions)) {
        if (doc) place(sessions, doc);
      }
      for (const key of asBundle.skipped) rejected.push(`${file.name} (${key})`);
      continue;
    }
    const single = parseSession(file.text);
    if (!single) {
      rejected.push(file.name);
      continue;
    }
    accepted += 1;
    place(sessions, convertOldSession(single));
  }
  if (accepted === 0) return { bundle: null, rejected };
  return { bundle: { version: BUNDLE_VERSION, sessions }, rejected };
}

/** Merge `remote` onto the passes in storage and write each result back. */
export function importBundle(remote: SessionBundle, storage?: Storage | null): BundleOutcome {
  const local = bundleFromStorage(storage);
  const outcome = mergeBundle(local, remote);
  for (const doc of Object.values(outcome.sessions)) {
    if (doc) saveSession(doc, storage);
  }
  return outcome;
}

export function mergeBundle(local: SessionBundle, remote: SessionBundle): BundleOutcome {
  const works = new Set<SessionWork>([
    ...(Object.keys(local.sessions) as SessionWork[]),
    ...(Object.keys(remote.sessions) as SessionWork[]),
  ]);
  const sessions: SessionBundle["sessions"] = {};
  let sittingsAdded = 0;
  let notesAdded = 0;
  let cursorsMoved = 0;
  const conflicts: NoteConflict[] = [];
  for (const work of works) {
    const here = local.sessions[work];
    const there = remote.sessions[work];
    if (here && there) {
      const merged = mergeSession(here, there);
      sessions[work] = merged.doc;
      sittingsAdded += merged.sittingsAdded;
      notesAdded += merged.notesAdded;
      if (merged.cursorMoved) cursorsMoved += 1;
      conflicts.push(...merged.conflicts);
    } else if (there) {
      sessions[work] = there;
      sittingsAdded += new Set(there.satWith.map((mark) => stepKey(there.work, mark.step))).size;
      notesAdded += there.annotations.length;
      if (there.cursor != null) cursorsMoved += 1;
    } else if (here) {
      sessions[work] = here;
    }
  }
  return { sessions, sittingsAdded, notesAdded, cursorsMoved, conflicts };
}

/** One line for the Home screen after an import. */
export function describeMerge(outcome: BundleOutcome): string {
  const sittings = `${outcome.sittingsAdded} ${outcome.sittingsAdded === 1 ? "sitting" : "sittings"} added`;
  const notes = `${outcome.notesAdded} ${outcome.notesAdded === 1 ? "note" : "notes"} added`;
  const cursor = outcome.cursorsMoved > 0 ? "cursor moved" : "cursor unchanged";
  let text = `${sittings}, ${notes}, ${cursor}`;
  if (outcome.conflicts.length === 1) {
    const conflict = outcome.conflicts[0];
    const place = conflict.unit ?? `${conflict.psalm}:${conflict.line}`;
    text += `. Kept the later note on ${conflict.work} ${place}`;
  } else if (outcome.conflicts.length > 1) {
    text += `. Kept the later text on ${outcome.conflicts.length} notes`;
  }
  return text;
}

/**
 * Read progress text into storage. When `openWork` is the imported work, `open`
 * is the merged document to show. A different work is written and `open` stays
 * null, so the pass on screen is left alone.
 */
export function importProgress(
  text: string,
  storage: Storage | null | undefined,
  openWork?: SessionWork,
): { outcome: BundleOutcome | null; open: SessionDoc | null; rejected: string[] } {
  const read = sessionsFromFiles([{ name: "import", text }]);
  if (!read.bundle) return { outcome: null, open: null, rejected: read.rejected };
  const outcome = importBundle(read.bundle, storage);
  const broughtThisWork = openWork != null && read.bundle.sessions[openWork] != null;
  const open = broughtThisWork ? (outcome.sessions[openWork] ?? null) : null;
  return { outcome, open, rejected: read.rejected };
}

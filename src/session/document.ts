/**
 * The session document. One pass through a work, saved as JSON to local
 * storage on the phone, to a file on export, and read back on import.
 *
 * It stores no Latin and no English: a step is a string the work chooses (for
 * the cursus it is the weekday/hour/psalm place), the `at` is a civil date,
 * and each line may carry one annotation — its highlight with any note.
 */

import { keyOfStep } from "./cursus";
import type { WorkId } from "../types";

/**
 * A note on an office line: the Gallican psalm number, the office line
 * number, the person's own words, and the date written. Its presence on the
 * line is the highlight; `text` is the optional note on that line.
 */
export type Annotation = { psalm: number; line: string; text: string; at: string };

/** A work that offers a session pass: the cursus, or any library work. */
export type SessionWork = "cursus" | WorkId;

/** Every registered work id that `work` may name in a session file. */
const WORK_IDS: readonly WorkId[] = [
  "gradibus",
  "canticum",
  "cantica",
  "psalter",
  "rule",
  "confessions",
];

/** The cursus plus every registered work. Bundle import and export walk this list. */
export const SESSION_WORKS: readonly SessionWork[] = ["cursus", ...WORK_IDS];

/** True when `value` names the cursus or a registered work. */
export function isSessionWork(value: unknown): value is SessionWork {
  return (
    value === "cursus" ||
    (typeof value === "string" && (WORK_IDS as readonly string[]).includes(value))
  );
}

export type SessionDoc = {
  id: string;
  work: SessionWork;
  /** Cursus only: 7, 14, or 40. Another work omits it. */
  pace?: 7 | 14 | 40;
  started: string;
  cursor: string | null;
  /**
   * When the cursor last moved, as an ISO timestamp. Absent on a pass that
   * has never moved its cursor, including a fresh `createSession`.
   */
  cursorAt?: string;
  /** When a sitting, note, cursor, or pace last changed. Absent on a fresh pass. */
  touchedAt?: string;
  satWith: { step: string; at: string }[];
  annotations: Annotation[];
};

/** The identity a step counts as in a pass. Cursus dedupes by slice; a lectio work counts its unit id. */
export function stepKey(work: SessionWork, step: string): string {
  return work === "cursus" ? keyOfStep(step) : step;
}

/**
 * A fresh pass, opened today. `pace` is the cursus pace (7, 14, or 40; default 7);
 * other works omit it.
 */
export function createSession(work: SessionWork, today: string, pace?: 7 | 14 | 40): SessionDoc {
  return {
    id: today,
    work,
    ...(work === "cursus" ? { pace: pace ?? 7 } : {}),
    started: today,
    cursor: null,
    satWith: [],
    annotations: [],
  };
}

/**
 * Register that a place was opened. Records the first sitting of each slice.
 * `now`, when passed, stamps `touchedAt` and `cursorAt` only if something moved.
 */
export function recordOpen(doc: SessionDoc, step: string, today: string, now?: string): SessionDoc {
  return updateDoc(doc, (next) => {
    const cursorMoved = next.cursor !== step;
    next.cursor = step;
    const key = stepKey(next.work, step);
    const already = next.satWith.some((mark) => stepKey(next.work, mark.step) === key);
    if (!already) next.satWith = [...next.satWith, { step, at: today }];
    stamp(next, now, cursorMoved || !already, cursorMoved);
    return next;
  });
}

/** Add or remove the sitting mark for a step (the pass's "done" checkbox). */
export function toggleSat(doc: SessionDoc, step: string, today: string, now?: string): SessionDoc {
  return updateDoc(doc, (next) => {
    const key = stepKey(next.work, step);
    const exists = next.satWith.some((mark) => stepKey(next.work, mark.step) === key);
    if (exists) {
      next.satWith = next.satWith.filter((mark) => stepKey(next.work, mark.step) !== key);
      stamp(next, now, true, false);
    } else {
      const cursorMoved = next.cursor !== step;
      next.satWith = [...next.satWith, { step, at: today }];
      next.cursor = step;
      stamp(next, now, true, cursorMoved);
    }
    return next;
  });
}

/**
 * Remember the place now being read, so returning to the work reopens it —
 * without counting it as a sitting. `recordOpen` still marks the sitting.
 */
export function markPosition(doc: SessionDoc, step: string, now?: string): SessionDoc {
  return updateDoc(doc, (next) => {
    const cursorMoved = next.cursor !== step;
    next.cursor = step;
    stamp(next, now, cursorMoved, cursorMoved);
    return next;
  });
}

/** Set the pace of the open pass (cursus only). */
export function setPace(doc: SessionDoc, pace: 7 | 14 | 40, now?: string): SessionDoc {
  return updateDoc(doc, (next) => {
    const changed = next.pace !== pace;
    next.pace = pace;
    stamp(next, now, changed, false);
    return next;
  });
}

/** The stable key of an annotated line. */
export function annotationKey(psalm: number, line: string): string {
  return `${psalm}:${line}`;
}

/** Add the annotation when absent, remove it (and its note) when present. */
export function toggleAnnotation(
  doc: SessionDoc,
  psalm: number,
  line: string,
  today: string,
  now?: string,
): SessionDoc {
  return updateDoc(doc, (next) => {
    const key = annotationKey(psalm, line);
    next.annotations = next.annotations.some((item) => annotationKey(item.psalm, item.line) === key)
      ? next.annotations.filter((item) => annotationKey(item.psalm, item.line) !== key)
      : [...next.annotations, { psalm, line, text: "", at: today }];
    stamp(next, now, true, false);
    return next;
  });
}

/** True when the office line is annotated (highlighted). */
export function isAnnotated(doc: SessionDoc, psalm: number, line: string): boolean {
  const key = annotationKey(psalm, line);
  return doc.annotations.some((item) => annotationKey(item.psalm, item.line) === key);
}

/** The annotation on the line, or undefined. */
export function annotationFor(
  doc: SessionDoc,
  psalm: number,
  line: string,
): Annotation | undefined {
  const key = annotationKey(psalm, line);
  return doc.annotations.find((item) => annotationKey(item.psalm, item.line) === key);
}

/** Write the person's own words on an annotated line. Keeps the first `at` if it is unchanged. */
export function setAnnotation(
  doc: SessionDoc,
  psalm: number,
  line: string,
  text: string,
  today: string,
  now?: string,
): SessionDoc {
  return updateDoc(doc, (next) => {
    const key = annotationKey(psalm, line);
    const index = next.annotations.findIndex((item) => annotationKey(item.psalm, item.line) === key);
    const previous = index < 0 ? undefined : next.annotations[index];
    const changed = !previous || previous.text !== text || previous.at !== today;
    const annotation: Annotation = { psalm, line, text, at: today };
    if (index < 0) next.annotations = [...next.annotations, annotation];
    else next.annotations = next.annotations.map((item, i) => (i === index ? annotation : item));
    stamp(next, now, changed, false);
    return next;
  });
}

/** Stamp a real edit. A no-op leaves both timestamps alone, so opening a pass does not look newer. */
function stamp(doc: SessionDoc, now: string | undefined, changed: boolean, cursorMoved: boolean): void {
  if (!now || !changed) return;
  doc.touchedAt = now;
  if (cursorMoved) doc.cursorAt = now;
}

function updateDoc(doc: SessionDoc, patch: (next: SessionDoc) => SessionDoc): SessionDoc {
  const clone: SessionDoc = { ...doc, satWith: [...doc.satWith], annotations: [...doc.annotations] };
  return patch(clone);
}

/** How many distinct slices have been sat with. */
export function satCount(doc: SessionDoc): number {
  return new Set(doc.satWith.map((mark) => stepKey(doc.work, mark.step))).size;
}

/** Serialize the document for export / storage. */
export function serializeSession(doc: SessionDoc): string {
  return JSON.stringify(doc, null, 2);
}

/** A pre-merge highlight from an older session file. */
type LegacyHighlight = { psalm: number; line: string };
/** A pre-merge note from an older session file. */
type LegacyNote = { psalm: number; line: string; text: string; at: string };

function isLegacyHighlight(item: unknown): item is LegacyHighlight {
  const v = item as Record<string, unknown> | null;
  return !!v && typeof v.psalm === "number" && typeof v.line === "string";
}

const ISO_STAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/;

function parseTimestamp(value: unknown): string | undefined {
  return typeof value === "string" && ISO_STAMP.test(value) ? value : undefined;
}

function isLegacyNote(item: unknown): item is LegacyNote {
  const v = item as Record<string, unknown> | null;
  return (
    !!v &&
    typeof v.psalm === "number" &&
    typeof v.line === "string" &&
    typeof v.text === "string" &&
    typeof v.at === "string"
  );
}

/**
 * Parse and validate an imported session file. Returns the document when it is
 * a valid pass for a known work, otherwise null.
 */
export function parseSession(json: string): SessionDoc | null {
  try {
    const value = JSON.parse(json) as Partial<SessionDoc>;
    const work = value.work;
    if (!isSessionWork(work)) return null;
    if (work === "cursus" && value.pace !== 7 && value.pace !== 14 && value.pace !== 40) return null;
    if (typeof value.started !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value.started)) return null;
    const satWith = Array.isArray(value.satWith)
      ? value.satWith.filter(
          (mark) => mark && typeof mark.step === "string" && typeof mark.at === "string",
        )
      : [];
    const annotations = Array.isArray(value.annotations)
      ? value.annotations.filter(
          (note) =>
            note &&
            typeof note.psalm === "number" &&
            typeof note.line === "string" &&
            typeof note.text === "string" &&
            typeof note.at === "string",
        )
      : [];
    // Legacy files before the merge stored highlights and notes separately.
    // Fold them into the single annotation list, notes winning a shared line.
    const raw = value as Partial<SessionDoc> & { highlights?: unknown; notes?: unknown };
    const legacyHighlights = Array.isArray(raw.highlights) ? raw.highlights.filter(isLegacyHighlight) : [];
    const legacyNotes = Array.isArray(raw.notes) ? raw.notes.filter(isLegacyNote) : [];
    for (const item of legacyHighlights) {
      if (!annotations.some((a) => annotationKey(a.psalm, a.line) === annotationKey(item.psalm, item.line))) {
        annotations.push({ psalm: item.psalm, line: item.line, text: "", at: value.started });
      }
    }
    for (const note of legacyNotes) {
      const index = annotations.findIndex((a) => annotationKey(a.psalm, a.line) === annotationKey(note.psalm, note.line));
      if (index < 0) annotations.push({ psalm: note.psalm, line: note.line, text: note.text, at: note.at });
      else annotations[index] = { ...annotations[index], text: note.text, at: note.at };
    }
    const cursorAt = parseTimestamp(value.cursorAt);
    const touchedAt = parseTimestamp(value.touchedAt);
    return {
      id: typeof value.id === "string" ? value.id : value.started,
      work,
      ...(work === "cursus" ? { pace: value.pace as 7 | 14 | 40 } : {}),
      started: value.started,
      cursor: typeof value.cursor === "string" ? value.cursor : null,
      ...(cursorAt ? { cursorAt } : {}),
      ...(touchedAt ? { touchedAt } : {}),
      satWith,
      annotations,
    };
  } catch {
    return null;
  }
}

/**
 * The session document. One pass through a work, saved as JSON to local
 * storage on the phone, to a file on export, and read back on import.
 *
 * It stores no Latin and no English: a step is a string the work chooses (for
 * the cursus it is the weekday/hour/psalm place), the `at` is a civil date,
 * and highlights and notes are reserved for a later phase.
 */

import { keyOfStep } from "./cursus";

export type SessionDoc = {
  id: string;
  work: "cursus";
  pace: 7 | 14;
  started: string;
  cursor: string | null;
  satWith: { step: string; at: string }[];
  highlights: never[];
  notes: never[];
};

/** A fresh pass, opened today. */
export function createSession(pace: 7 | 14, today: string): SessionDoc {
  return {
    id: today,
    work: "cursus",
    pace,
    started: today,
    cursor: null,
    satWith: [],
    highlights: [],
    notes: [],
  };
}

/** Register that a place was opened. Records the first sitting of each slice. */
export function recordOpen(doc: SessionDoc, step: string, today: string): SessionDoc {
  return updateDoc(doc, (next) => {
    next.cursor = step;
    const key = stepKey(next, step);
    const already = next.satWith.some((mark) => stepKey(next, mark.step) === key);
    if (!already) next.satWith = [...next.satWith, { step, at: today }];
    return next;
  });
}

/** Set the pace of the open pass. */
export function setPace(doc: SessionDoc, pace: 7 | 14): SessionDoc {
  return updateDoc(doc, (next) => {
    next.pace = pace;
    return next;
  });
}

function updateDoc(doc: SessionDoc, patch: (next: SessionDoc) => SessionDoc): SessionDoc {
  const clone: SessionDoc = { ...doc, satWith: [...doc.satWith], highlights: [...doc.highlights], notes: [...doc.notes] };
  return patch(clone);
}

/** Borrow slice-key computation without importing the course (keeps doc free). */
function stepKey(_doc: SessionDoc, step: string): string {
  return keyOfStep(step);
}

/** How many distinct slices have been sat with. */
export function satCount(doc: SessionDoc): number {
  return new Set(doc.satWith.map((mark) => keyOfStep(mark.step))).size;
}

const SESSION_WORK = "cursus";

/** Serialize the document for export / storage. */
export function serializeSession(doc: SessionDoc): string {
  return JSON.stringify(doc, null, 2);
}

/**
 * Parse and validate an imported session file. Returns the document when it is
 * a valid cursus pass, otherwise null.
 */
export function parseSession(json: string): SessionDoc | null {
  try {
    const value = JSON.parse(json) as Partial<SessionDoc>;
    if (value.work !== SESSION_WORK) return null;
    if (value.pace !== 7 && value.pace !== 14) return null;
    if (typeof value.started !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value.started)) return null;
    const satWith = Array.isArray(value.satWith)
      ? value.satWith.filter(
          (mark) => mark && typeof mark.step === "string" && typeof mark.at === "string",
        )
      : [];
    return {
      id: typeof value.id === "string" ? value.id : value.started,
      work: "cursus",
      pace: value.pace,
      started: value.started,
      cursor: typeof value.cursor === "string" ? value.cursor : null,
      satWith,
      highlights: [],
      notes: [],
    };
  } catch {
    return null;
  }
}

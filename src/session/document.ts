/**
 * The session document. One pass through a work, saved as JSON to local
 * storage on the phone, to a file on export, and read back on import.
 *
 * It stores no Latin and no English: a step is a string the work chooses (for
 * the cursus it is the weekday/hour/psalm place), the `at` is a civil date,
 * and highlights and notes are reserved for a later phase.
 */

import { keyOfStep } from "./cursus";

/** A highlighted office line: the Gallican psalm number and the office line number. */
export type Highlight = { psalm: number; line: string };

/** A note on a highlighted office line, with the civil date it was written. */
export type SessionNote = { psalm: number; line: string; text: string; at: string };

export type SessionDoc = {
  id: string;
  work: "cursus";
  pace: 7 | 14;
  started: string;
  cursor: string | null;
  satWith: { step: string; at: string }[];
  highlights: Highlight[];
  notes: SessionNote[];
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

/** Add or remove the sitting mark for a step (the pass's "done" checkbox). */
export function toggleSat(doc: SessionDoc, step: string, today: string): SessionDoc {
  return updateDoc(doc, (next) => {
    const key = keyOfStep(step);
    const exists = next.satWith.some((mark) => keyOfStep(mark.step) === key);
    if (exists) {
      next.satWith = next.satWith.filter((mark) => keyOfStep(mark.step) !== key);
    } else {
      next.satWith = [...next.satWith, { step, at: today }];
      next.cursor = step;
    }
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

/** The stable key of a highlighted line. */
export function highlightKey(psalm: number, line: string): string {
  return `${psalm}:${line}`;
}

/** Add the highlight when absent, remove it when present. */
export function toggleHighlight(doc: SessionDoc, psalm: number, line: string): SessionDoc {
  return updateDoc(doc, (next) => {
    const key = highlightKey(psalm, line);
    const has = next.highlights.some((item) => highlightKey(item.psalm, item.line) === key);
    next.highlights = has
      ? next.highlights.filter((item) => highlightKey(item.psalm, item.line) !== key)
      : [...next.highlights, { psalm, line }];
    return next;
  });
}

/** True when the office line is highlighted. */
export function isHighlighted(doc: SessionDoc, psalm: number, line: string): boolean {
  const key = highlightKey(psalm, line);
  return doc.highlights.some((item) => highlightKey(item.psalm, item.line) === key);
}

/** The note on the highlighted line, or undefined. */
export function noteFor(doc: SessionDoc, psalm: number, line: string): SessionNote | undefined {
  const key = highlightKey(psalm, line);
  return doc.notes.find((item) => highlightKey(item.psalm, item.line) === key);
}

/** Write the person's own words on a line. Keeps the first `at` if it is unchanged. */
export function setNote(
  doc: SessionDoc,
  psalm: number,
  line: string,
  text: string,
  today: string,
): SessionDoc {
  return updateDoc(doc, (next) => {
    const key = highlightKey(psalm, line);
    const index = next.notes.findIndex((item) => highlightKey(item.psalm, item.line) === key);
    const note: SessionNote = { psalm, line, text, at: today };
    if (index < 0) next.notes = [...next.notes, note];
    else next.notes = next.notes.map((item, i) => (i === index ? note : item));
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
    const highlights = Array.isArray(value.highlights)
      ? value.highlights.filter(
          (item) => item && typeof item.psalm === "number" && typeof item.line === "string",
        )
      : [];
    const notes = Array.isArray(value.notes)
      ? value.notes.filter(
          (note) =>
            note &&
            typeof note.psalm === "number" &&
            typeof note.line === "string" &&
            typeof note.text === "string" &&
            typeof note.at === "string",
        )
      : [];
    return {
      id: typeof value.id === "string" ? value.id : value.started,
      work: "cursus",
      pace: value.pace,
      started: value.started,
      cursor: typeof value.cursor === "string" ? value.cursor : null,
      satWith,
      highlights,
      notes,
    };
  } catch {
    return null;
  }
}

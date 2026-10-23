/**
 * A learning note is one markdown file on one psalter place. The filename is
 * the binding key. The session document is not involved: sittings and line
 * highlights stay in `lectio-sessions.json`.
 *
 * Psalm 118's section letters are the same names as `PSALM_118_LETTERS` in
 * `resolve.ts`, in lowercase. A numbered part is the `part` on `PsalmSlice`.
 */

import type { PsalmSlice } from "../content/office/cursus";

/** Section names of Psalm 118, in order. Aleph is verses 1–8. Nun is verses 105–112. */
export const PSALM_118_SECTIONS = [
  "aleph",
  "beth",
  "ghimel",
  "daleth",
  "he",
  "vau",
  "zain",
  "heth",
  "teth",
  "iod",
  "caph",
  "lamed",
  "mem",
  "nun",
  "samech",
  "ain",
  "phe",
  "sade",
  "coph",
  "res",
  "sin",
  "tau",
] as const;

/**
 * Psalms the cursus sings in numbered parts (`1` and `2`), from `cursus.ts`:
 * the halves in `HALF`, plus Prime's cuts of Psalms 9 and 17.
 */
const NUMBERED_PARTS = new Set([9, 17, 36, 67, 68, 77, 88, 103, 104, 105, 106, 138, 143, 144]);

const NOTE_NAME = /^(\d{2})_psalm_([1-9]\d{0,2})(?:_([a-z0-9]+))?\.md$/;
const CIVIL_DAY = /^\d{4}-\d{2}-\d{2}$/;
const ISO_STAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/;

export type NotePlace = {
  kind: "psalm";
  psalm: number;
  /** Psalm 118 letter, or a numbered part. Absent on a whole psalm. */
  section?: string;
};

export type LearningNote = {
  id: string;
  place: NotePlace;
  filename: string;
  /** Header title. Empty when the file names none; the screen then shows no title. */
  title: string;
  at?: string;
  updated?: string;
  body: string;
};

export function samePlace(a: NotePlace, b: NotePlace): boolean {
  return a.kind === b.kind && a.psalm === b.psalm && a.section === b.section;
}

/** The title the screen shows. Empty when the file names none. */
export function noteTitle(note: LearningNote): string {
  return note.title.trim();
}

function psalm118Section(from: number): string | undefined {
  const index = (from - 1) / 8;
  if (!Number.isInteger(index)) return undefined;
  return PSALM_118_SECTIONS[index];
}

function sectionAllowed(psalm: number, section: string | undefined): boolean {
  if (psalm < 1 || psalm > 150) return false;
  if (psalm === 118) return section != null && (PSALM_118_SECTIONS as readonly string[]).includes(section);
  if (NUMBERED_PARTS.has(psalm)) return section === "1" || section === "2";
  return section == null;
}

/** The place a cursus slice names, or null when the slice is not a note place. */
export function placeOfSlice(slice: PsalmSlice): NotePlace | null {
  if (slice.psalm === 118) {
    if (slice.from == null) return null;
    const section = psalm118Section(slice.from);
    if (!section) return null;
    return { kind: "psalm", psalm: 118, section };
  }
  if (slice.part != null) {
    const place: NotePlace = { kind: "psalm", psalm: slice.psalm, section: String(slice.part) };
    return sectionAllowed(place.psalm, place.section) ? place : null;
  }
  const place: NotePlace = { kind: "psalm", psalm: slice.psalm };
  return sectionAllowed(place.psalm, place.section) ? place : null;
}

/**
 * Parse `09_psalm_118_nun.md`. Returns null when the id is not two digits,
 * the kind is not `psalm`, the number is outside 1–150, the section is not
 * the one that place uses, or the file is not `.md`.
 */
export function parseNoteFilename(name: string): { id: string; place: NotePlace } | null {
  const match = NOTE_NAME.exec(name);
  if (!match) return null;
  const psalm = Number(match[2]);
  const section = match[3];
  if (!sectionAllowed(psalm, section)) return null;
  const place: NotePlace = section != null ? { kind: "psalm", psalm, section } : { kind: "psalm", psalm };
  return { id: match[1], place };
}

export function noteFilename(id: string, place: NotePlace): string {
  const section = place.section != null ? `_${place.section}` : "";
  return `${id}_psalm_${place.psalm}${section}.md`;
}

/**
 * The lowest free id from `01` to `99` for one place. `used` is the ids
 * already on that place. Null when every number is taken.
 */
export function nextNoteId(used: readonly string[]): string | null {
  const taken = new Set(used);
  for (let n = 1; n <= 99; n += 1) {
    const id = String(n).padStart(2, "0");
    if (!taken.has(id)) return id;
  }
  return null;
}

function splitHeader(text: string): { header: string | null; body: string } {
  const normalized = text.replace(/\r\n/g, "\n");
  if (!normalized.startsWith("---\n")) return { header: null, body: stripEdges(normalized) };
  const fence = normalized.indexOf("\n---\n", 4);
  if (fence < 0) {
    const trimmed = normalized.replace(/\n$/, "");
    if (trimmed.endsWith("\n---")) return { header: trimmed.slice(4, -4), body: "" };
    return { header: null, body: stripEdges(normalized) };
  }
  return { header: normalized.slice(4, fence), body: stripEdges(normalized.slice(fence + "\n---\n".length)) };
}

/** Drop the blank line that separates a header from the note, and one trailing newline. */
function stripEdges(body: string): string {
  let next = body;
  if (next.startsWith("\n")) next = next.slice(1);
  if (next.endsWith("\n")) next = next.slice(0, -1);
  return next;
}

function headerFields(header: string): { title?: string; at?: string; updated?: string } {
  const fields: { title?: string; at?: string; updated?: string } = {};
  for (const line of header.split("\n")) {
    const colon = line.indexOf(":");
    if (colon <= 0) continue;
    const key = line.slice(0, colon).trim();
    const value = line.slice(colon + 1).trim();
    if (key === "title" && value && !value.includes("\n")) fields.title = value;
    if (key === "at" && CIVIL_DAY.test(value)) fields.at = value;
    if (key === "updated" && ISO_STAMP.test(value)) fields.updated = value;
  }
  return fields;
}

/** Read one note file. A bad filename is null. A missing header still parses. */
export function parseNoteFile(filename: string, text: string): LearningNote | null {
  const parsed = parseNoteFilename(filename);
  if (!parsed) return null;
  const split = splitHeader(text);
  const fields = split.header == null ? {} : headerFields(split.header);
  return {
    id: parsed.id,
    place: parsed.place,
    filename,
    title: fields.title ?? "",
    ...(fields.at ? { at: fields.at } : {}),
    ...(fields.updated ? { updated: fields.updated } : {}),
    body: split.body,
  };
}

/** Write the header and body. A round trip through `parseNoteFile` returns the same note. */
export function formatNoteFile(note: LearningNote): string {
  const lines = ["---"];
  if (note.title.trim()) lines.push(`title: ${note.title.trim()}`);
  if (note.at) lines.push(`at: ${note.at}`);
  if (note.updated) lines.push(`updated: ${note.updated}`);
  lines.push("---", "");
  const body = note.body.replace(/\r\n/g, "\n");
  return `${lines.join("\n")}\n${body}${body.endsWith("\n") || body.length === 0 ? "" : "\n"}`;
}

export function notesForPlace(notes: readonly LearningNote[], place: NotePlace): LearningNote[] {
  return notes.filter((note) => samePlace(note.place, place)).sort((a, b) => a.id.localeCompare(b.id));
}

/** Read a folder listing. A name that does not parse is skipped; the others still load. */
export function notesFromFiles(files: { name: string; text: string }[]): {
  notes: LearningNote[];
  skipped: string[];
} {
  const notes: LearningNote[] = [];
  const skipped: string[] = [];
  for (const file of files) {
    const note = parseNoteFile(file.name, file.text);
    if (note) notes.push(note);
    else skipped.push(file.name);
  }
  return { notes, skipped };
}

export function createLearningNote(place: NotePlace, id: string, at: string, updated: string): LearningNote | null {
  const filename = noteFilename(id, place);
  if (!parseNoteFilename(filename) || parseNoteFilename(filename)?.id !== id) return null;
  return { id, place, filename, title: "", at, updated, body: "" };
}

/** A new title or body moves `updated`. An unchanged note is returned as it was. */
export function editLearningNote(note: LearningNote, title: string, body: string, now: string): LearningNote {
  if (note.title === title && note.body === body) return note;
  return { ...note, title, body, updated: now };
}

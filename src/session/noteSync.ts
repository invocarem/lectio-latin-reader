/**
 * Merge the notes folder with the notes on this device. Identity is the
 * filename. The session bundle is not part of this merge.
 *
 * A tombstone is `09_psalm_118_nun.md.deleted`. Its text is the `updated`
 * timestamp. Tombstones are kept. A later tombstone removes the note file;
 * a later note restores it.
 */

import { parseNoteFile, parseNoteFilename } from "./notes";
import type { NoteFile } from "./noteStore";

const TOMBSTONE = ".deleted";
const ISO_STAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/;

export type NoteConflict = {
  name: string;
  kept: string;
  dropped: string;
};

export type NoteFolderMerge = {
  /** The note files and tombstones this device should store. */
  local: NoteFile[];
  /** Files to write into the folder. */
  upload: NoteFile[];
  /** Note files to delete from the folder. Tombstones are not deleted. */
  removeRemote: string[];
  skipped: string[];
  conflicts: NoteConflict[];
};

type Kind = "note" | "tombstone";

type Item = {
  name: string;
  text: string;
  updated?: string;
  kind: Kind;
};

type Slot = { note?: Item; tomb?: Item };

/** True when `name` is a note file or its tombstone. */
export function isNoteEntry(name: string): boolean {
  return noteKey(name) != null;
}

function noteKey(name: string): { filename: string; kind: Kind } | null {
  if (name.endsWith(TOMBSTONE)) {
    const filename = name.slice(0, -TOMBSTONE.length);
    if (!parseNoteFilename(filename)) return null;
    return { filename, kind: "tombstone" };
  }
  if (!parseNoteFilename(name)) return null;
  return { filename: name, kind: "note" };
}

function updatedOf(filename: string, kind: Kind, text: string): string | undefined {
  if (kind === "tombstone") {
    const value = text.trim();
    return ISO_STAMP.test(value) ? value : undefined;
  }
  return parseNoteFile(filename, text)?.updated;
}

/** A present timestamp is newer than a missing one. Equal timestamps tie. */
function later(a: string | undefined, b: string | undefined): "a" | "b" | "tie" {
  if (a === b) return "tie";
  if (a && b) return a > b ? "a" : "b";
  if (a) return "a";
  if (b) return "b";
  return "tie";
}

function index(files: readonly NoteFile[], skipped: string[]): Map<string, Slot> {
  const map = new Map<string, Slot>();
  for (const file of files) {
    const key = noteKey(file.name);
    if (!key) {
      skipped.push(file.name);
      continue;
    }
    const item: Item = {
      name: file.name,
      text: file.text,
      updated: updatedOf(key.filename, key.kind, file.text),
      kind: key.kind,
    };
    const slot = map.get(key.filename) ?? {};
    if (key.kind === "note") slot.note = item;
    else slot.tomb = item;
    map.set(key.filename, slot);
  }
  return map;
}

/** The file that is in force. A tie between a note and its tombstone keeps the note. */
function effective(slot: Slot | undefined): Item | null {
  if (!slot?.note && !slot?.tomb) return null;
  if (!slot.tomb) return slot.note ?? null;
  if (!slot.note) return slot.tomb;
  return later(slot.note.updated, slot.tomb.updated) === "b" ? slot.tomb : slot.note;
}

function pick(here: Item | null, there: Item | null, tie: "local" | "remote"): Item | null {
  if (!here) return there;
  if (!there) return here;
  if (here.text === there.text && here.kind === there.kind) return here;
  const which = later(here.updated, there.updated);
  if (which === "b") return there;
  if (which === "tie" && tie === "remote") return there;
  return here;
}

function keptTomb(local: Slot | undefined, remote: Slot | undefined, winner: Item): Item | null {
  if (winner.kind === "tombstone") return winner;
  const tombs = [local?.tomb, remote?.tomb].filter((item): item is Item => item != null);
  if (tombs.length === 0) return null;
  return tombs.reduce((current, item) => (later(current.updated, item.updated) === "b" ? item : current));
}

function pushUpload(upload: NoteFile[], slot: Slot | undefined, item: Item): void {
  const current = item.kind === "note" ? slot?.note : slot?.tomb;
  if (!current || current.text !== item.text) upload.push({ name: item.name, text: item.text });
}

/**
 * Combine this device's notes with the folder. A name that does not parse is skipped.
 * `tie` chooses which text to keep when both copies differ and neither `updated`
 * is later, including a note that has no timestamp. A pull passes `"remote"`.
 */
export function mergeNoteFolders(
  localFiles: readonly NoteFile[],
  remoteFiles: readonly NoteFile[],
  options?: { tie?: "local" | "remote" },
): NoteFolderMerge {
  const tie = options?.tie ?? "local";
  const skipped: string[] = [];
  const local = index(localFiles, skipped);
  const remote = index(remoteFiles, skipped);
  const names = new Set([...local.keys(), ...remote.keys()]);
  const kept: NoteFile[] = [];
  const upload: NoteFile[] = [];
  const removeRemote: string[] = [];
  const conflicts: NoteConflict[] = [];

  for (const filename of [...names].sort()) {
    const localSlot = local.get(filename);
    const remoteSlot = remote.get(filename);
    const here = effective(localSlot);
    const there = effective(remoteSlot);
    const winner = pick(here, there, tie);
    if (!winner) continue;
    if (
      here &&
      there &&
      here.kind === "note" &&
      there.kind === "note" &&
      here.text !== there.text &&
      later(here.updated, there.updated) !== "tie"
    ) {
      const dropped = winner === here ? there.text : here.text;
      conflicts.push({ name: filename, kept: winner.text, dropped });
    }
    kept.push({ name: winner.name, text: winner.text });
    const tomb = keptTomb(localSlot, remoteSlot, winner);
    if (tomb && tomb.name !== winner.name) kept.push({ name: tomb.name, text: tomb.text });
    pushUpload(upload, remoteSlot, winner);
    if (tomb && tomb.name !== winner.name) pushUpload(upload, remoteSlot, tomb);
    if (winner.kind === "tombstone" && remoteSlot?.note) removeRemote.push(filename);
  }

  return { local: kept, upload, removeRemote, skipped, conflicts };
}

/** One line when a note's text diverged. Otherwise null. */
export function describeNoteMerge(result: NoteFolderMerge): string | null {
  if (result.conflicts.length === 1) return `Kept the later note ${result.conflicts[0].name}.`;
  if (result.conflicts.length > 1) return `Kept the later text on ${result.conflicts.length} notes.`;
  return null;
}

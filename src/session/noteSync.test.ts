import { createLearningNote, editLearningNote, formatNoteFile } from "./notes";
import { describeNoteMerge, mergeNoteFolders } from "./noteSync";
import type { NoteFile } from "./noteStore";

const PLACE = { kind: "psalm" as const, psalm: 118, section: "nun" };

function note(id: string, body: string, updated: string): NoteFile {
  const created = createLearningNote(PLACE, id, "2026-10-22", updated);
  const written = editLearningNote(created!, "Memoria", body, updated);
  return { name: written.filename, text: formatNoteFile(written) };
}

describe("mergeNoteFolders", () => {
  test("a note that exists only in the folder is kept locally", () => {
    const remote = note("09", "From the folder.", "2026-10-22T22:13:00.000Z");
    const merged = mergeNoteFolders([], [remote]);
    expect(merged.local).toEqual([remote]);
    expect(merged.upload).toEqual([]);
    expect(merged.conflicts).toEqual([]);
  });

  test("a note that exists only on this device is written to the folder", () => {
    const local = note("09", "From this device.", "2026-10-22T22:13:00.000Z");
    const merged = mergeNoteFolders([local], []);
    expect(merged.local).toEqual([local]);
    expect(merged.upload).toEqual([local]);
  });

  test("the same text is left unchanged", () => {
    const file = note("09", "The same.", "2026-10-22T22:13:00.000Z");
    const merged = mergeNoteFolders([file], [file]);
    expect(merged.upload).toEqual([]);
    expect(merged.local).toEqual([file]);
    expect(describeNoteMerge(merged)).toBeNull();
  });

  test("different text keeps the later updated and names the other", () => {
    const earlier = note("09", "First.", "2026-10-22T22:13:00.000Z");
    const later = note("09", "Second.", "2026-10-22T23:00:00.000Z");
    const merged = mergeNoteFolders([earlier], [later]);
    expect(merged.local).toEqual([later]);
    expect(merged.upload).toEqual([]);
    expect(merged.conflicts).toEqual([{ name: "09_psalm_118_nun.md", kept: later.text, dropped: earlier.text }]);
    expect(describeNoteMerge(merged)).toBe("Kept the later note 09_psalm_118_nun.md.");
  });

  test("this device's later text is the one written to the folder", () => {
    const earlier = note("09", "Folder copy.", "2026-10-22T22:13:00.000Z");
    const later = note("09", "Local copy.", "2026-10-22T23:00:00.000Z");
    const merged = mergeNoteFolders([later], [earlier]);
    expect(merged.local).toEqual([later]);
    expect(merged.upload).toEqual([later]);
  });

  test("a later tombstone removes the note and is kept", () => {
    const file = note("09", "Gone.", "2026-10-22T22:13:00.000Z");
    const tomb = { name: "09_psalm_118_nun.md.deleted", text: "2026-10-22T23:00:00.000Z" };
    const merged = mergeNoteFolders([file], [tomb]);
    expect(merged.local).toEqual([tomb]);
    expect(merged.removeRemote).toEqual([]);
    expect(merged.upload).toEqual([]);
  });

  test("a later note restores itself over a tombstone", () => {
    const file = note("09", "Back.", "2026-10-22T23:00:00.000Z");
    const tomb = { name: "09_psalm_118_nun.md.deleted", text: "2026-10-22T22:13:00.000Z" };
    const merged = mergeNoteFolders([file], [tomb]);
    expect(merged.local.map((item) => item.name).sort()).toEqual([
      "09_psalm_118_nun.md",
      "09_psalm_118_nun.md.deleted",
    ]);
    expect(merged.upload).toEqual([file]);
    expect(merged.removeRemote).toEqual([]);
  });

  test("a name that does not parse is skipped", () => {
    const file = note("09", "Kept.", "2026-10-22T22:13:00.000Z");
    const merged = mergeNoteFolders([], [file, { name: "notes.txt", text: "nope" }]);
    expect(merged.local).toEqual([file]);
    expect(merged.skipped).toEqual(["notes.txt"]);
  });
});

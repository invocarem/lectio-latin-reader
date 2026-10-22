import { createSession, serializeSession } from "./document";
import { deleteLearningNote, loadLearningNotes, memoryNoteFiles, onLearningNoteEdit, saveLearningNote } from "./noteStore";
import { createLearningNote, parseNoteFile } from "./notes";
import { loadSession, saveSession, sessionKey } from "./store";

class MemoryStorage implements Storage {
  private map = new Map<string, string>();
  get length(): number {
    return this.map.size;
  }
  clear(): void {
    this.map.clear();
  }
  getItem(key: string): string | null {
    return this.map.get(key) ?? null;
  }
  key(index: number): string | null {
    return [...this.map.keys()][index] ?? null;
  }
  removeItem(key: string): void {
    this.map.delete(key);
  }
  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }
}

describe("learning note store", () => {
  test("a saved note reads back from the note files, not from the session", async () => {
    const storage = new MemoryStorage();
    const doc = createSession("cursus", "2026-10-22");
    saveSession(doc, storage);
    const before = storage.getItem(sessionKey("cursus"));

    const files = memoryNoteFiles();
    const note = createLearningNote(
      { kind: "psalm", psalm: 118, section: "nun" },
      "09",
      "2026-10-22",
      "2026-10-22T22:13:00.000Z",
    );
    await saveLearningNote(files, note!);

    const loaded = await loadLearningNotes(files);
    expect(loaded).toEqual([note]);
    expect(parseNoteFile(loaded[0].filename, (await files.list())[0].text)?.body).toBe("");
    expect(storage.getItem(sessionKey("cursus"))).toBe(before);
    expect(loadSession("cursus", storage)).toEqual(doc);
    expect(before).toBe(serializeSession(doc));
  });

  test("a delete writes a tombstone and removes the note file", async () => {
    const storage = new MemoryStorage();
    const doc = createSession("cursus", "2026-10-22");
    saveSession(doc, storage);
    const before = storage.getItem(sessionKey("cursus"));
    const files = memoryNoteFiles();
    const note = createLearningNote(
      { kind: "psalm", psalm: 118, section: "nun" },
      "09",
      "2026-10-22",
      "2026-10-22T22:13:00.000Z",
    );
    await saveLearningNote(files, note!, { silent: true });
    let edits = 0;
    onLearningNoteEdit(() => {
      edits += 1;
    });
    await deleteLearningNote(files, note!, "2026-10-22T23:00:00.000Z");
    const listed = await files.list();
    expect(listed.map((file) => file.name)).toEqual(["09_psalm_118_nun.md.deleted"]);
    expect(listed[0].text.trim()).toBe("2026-10-22T23:00:00.000Z");
    expect(await loadLearningNotes(files)).toEqual([]);
    expect(edits).toBe(1);
    expect(storage.getItem(sessionKey("cursus"))).toBe(before);
  });
});

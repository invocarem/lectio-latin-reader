import { createSession, recordOpen } from "./document";
import { clearSession, loadSession, saveSession, sessionKey } from "./store";

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

describe("session store", () => {
  let storage: MemoryStorage;

  beforeEach(() => {
    storage = new MemoryStorage();
  });

  test("load returns null when nothing is stored", () => {
    expect(loadSession("cursus", storage)).toBeNull();
  });

  test("save writes the document and load reads it back", () => {
    let doc = createSession("cursus", "2026-09-27");
    doc = recordOpen(doc, "compline:4", "2026-09-27");
    saveSession(doc, storage);
    expect(storage.getItem(sessionKey("cursus"))).toBeTruthy();
    expect(loadSession("cursus", storage)).toEqual(doc);
  });

  test("clear drops the stored pass", () => {
    saveSession(createSession("cursus", "2026-09-27"), storage);
    clearSession("cursus", storage);
    expect(loadSession("cursus", storage)).toBeNull();
  });

  test("load ignores a corrupt stored file", () => {
    storage.setItem(sessionKey("cursus"), "{ not json");
    expect(loadSession("cursus", storage)).toBeNull();
  });

  test("cursus and gradibus keep independent passes under separate keys", () => {
    saveSession(createSession("cursus", "2026-09-27"), storage);
    saveSession(createSession("gradibus", "2026-09-27"), storage);
    expect(sessionKey("cursus")).not.toBe(sessionKey("gradibus"));
    expect(loadSession("cursus", storage)?.work).toBe("cursus");
    expect(loadSession("gradibus", storage)?.work).toBe("gradibus");
    clearSession("cursus", storage);
    expect(loadSession("cursus", storage)).toBeNull();
    expect(loadSession("gradibus", storage)?.work).toBe("gradibus");
  });
});

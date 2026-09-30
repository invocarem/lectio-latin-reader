import { createSession, recordOpen } from "./document";
import { clearSession, loadSession, saveSession, STORAGE_KEY } from "./store";

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
    expect(loadSession(storage)).toBeNull();
  });

  test("save writes the document and load reads it back", () => {
    let doc = createSession(14, "2026-09-27");
    doc = recordOpen(doc, "compline:4", "2026-09-27");
    saveSession(doc, storage);
    expect(storage.getItem(STORAGE_KEY)).toBeTruthy();
    expect(loadSession(storage)).toEqual(doc);
  });

  test("clear drops the stored pass", () => {
    saveSession(createSession(14, "2026-09-27"), storage);
    clearSession(storage);
    expect(loadSession(storage)).toBeNull();
  });

  test("load ignores a corrupt stored file", () => {
    storage.setItem(STORAGE_KEY, "{ not json");
    expect(loadSession(storage)).toBeNull();
  });
});

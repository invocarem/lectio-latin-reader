import { createSession, type SessionDoc } from "./document";
import { loadSession, saveSession, sessionChanged } from "./store";
import { createSync, mergeRemoteText, type SyncTransport } from "./sync";

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

function pass(patch: Partial<SessionDoc> = {}): SessionDoc {
  return {
    ...createSession("gradibus", "2026-09-27"),
    cursor: "cap1-s1",
    cursorAt: "2026-10-01T12:00:00.000Z",
    touchedAt: "2026-10-01T12:00:00.000Z",
    satWith: [{ step: "cap1-s1", at: "2026-10-01" }],
    ...patch,
  };
}

function bundle(doc: SessionDoc): string {
  return JSON.stringify({ version: 1, sessions: { [doc.work]: doc } }, null, 2);
}

function transport(text: string, status: "ready" | "needs-gesture" | "none" = "ready") {
  const writes: string[] = [];
  let file = text;
  let reads = 0;
  const api: SyncTransport & { writes: string[]; reads: () => number } = {
    writes,
    reads: () => reads,
    status: async () => status,
    choose: async () => undefined,
    prepare: async () => undefined,
    read: async () => {
      reads += 1;
      if (file === "throw") throw new Error("offline");
      return file;
    },
    write: async (next) => {
      writes.push(next);
      file = next;
    },
  };
  return api;
}

describe("mergeRemoteText", () => {
  test("unions a sitting from the file into local progress and reports a rewrite", () => {
    const storage = new MemoryStorage();
    saveSession(pass(), storage);
    const remote = pass({
      satWith: [
        { step: "cap1-s1", at: "2026-10-01" },
        { step: "cap1-s2", at: "2026-10-02" },
      ],
      cursor: "cap1-s2",
      cursorAt: "2026-10-02T12:00:00.000Z",
      touchedAt: "2026-10-02T12:00:00.000Z",
    });
    const merged = mergeRemoteText(bundle(remote), storage);
    expect(merged.ok).toBe(true);
    if (!merged.ok) return;
    expect(merged.dirty).toBe(false);
    expect(merged.outcome.sittingsAdded).toBe(1);
    expect(loadSession("gradibus", storage)?.satWith.map((mark) => mark.step)).toEqual(["cap1-s1", "cap1-s2"]);
  });

  test("rewrites the file when this device has a sitting the file does not", () => {
    const storage = new MemoryStorage();
    saveSession(
      pass({
        satWith: [
          { step: "cap1-s1", at: "2026-10-01" },
          { step: "cap1-s2", at: "2026-10-02" },
        ],
      }),
      storage,
    );
    const merged = mergeRemoteText(bundle(pass()), storage);
    expect(merged.ok).toBe(true);
    if (!merged.ok) return;
    expect(merged.dirty).toBe(true);
    expect(merged.nextText).toContain("cap1-s2");
  });

  test("an empty file is filled from local progress", () => {
    const storage = new MemoryStorage();
    saveSession(pass(), storage);
    const merged = mergeRemoteText("", storage);
    expect(merged.ok).toBe(true);
    if (!merged.ok) return;
    expect(merged.dirty).toBe(true);
    expect(merged.nextText).toContain("cap1-s1");
    expect(loadSession("gradibus", storage)?.cursor).toBe("cap1-s1");
  });

  test("matching progress is not rewritten", () => {
    const storage = new MemoryStorage();
    const doc = pass();
    saveSession(doc, storage);
    const merged = mergeRemoteText(bundle(doc), storage);
    expect(merged.ok).toBe(true);
    if (!merged.ok) return;
    expect(merged.dirty).toBe(false);
  });

  test("a file that is not lectio progress is left unread", () => {
    const storage = new MemoryStorage();
    saveSession(pass(), storage);
    expect(mergeRemoteText("{ not a bundle", storage).ok).toBe(false);
    expect(loadSession("gradibus", storage)?.cursor).toBe("cap1-s1");
  });
});

describe("createSync", () => {
  test("writes a sitting this device has and the file does not", async () => {
    const storage = new MemoryStorage();
    saveSession(
      pass({
        satWith: [
          { step: "cap1-s1", at: "2026-10-01" },
          { step: "cap1-s2", at: "2026-10-03" },
        ],
      }),
      storage,
    );
    const files = transport(bundle(pass()));
    const sync = createSync({ transport: files, storage });
    await sync.syncNow();
    expect(files.writes.length).toBe(1);
    expect(files.writes[0]).toContain("cap1-s2");
    expect(sync.current().text).toBe("Synced.");
  });

  test("says what arrived from the file without rewriting it", async () => {
    const storage = new MemoryStorage();
    saveSession(pass(), storage);
    const remote = pass({
      satWith: [
        { step: "cap1-s1", at: "2026-10-01" },
        { step: "cap1-s2", at: "2026-10-03" },
      ],
    });
    const files = transport(bundle(remote));
    const sync = createSync({ transport: files, storage });
    await sync.syncNow();
    expect(files.writes).toEqual([]);
    expect(sync.current().text).toBe("1 sitting added, 0 notes added, cursor unchanged.");
    expect(sync.current().refreshed).toBe(true);
  });

  test("does not write when the file already matches", async () => {
    const storage = new MemoryStorage();
    const doc = pass();
    saveSession(doc, storage);
    const files = transport(bundle(doc));
    const sync = createSync({ transport: files, storage });
    await sync.syncNow();
    expect(files.writes).toEqual([]);
    expect(sync.current().text).toBe("Synced.");
  });

  test("keeps local progress when the file cannot be read", async () => {
    const storage = new MemoryStorage();
    saveSession(pass(), storage);
    const files = transport("throw");
    const sync = createSync({ transport: files, storage });
    await sync.syncNow();
    expect(files.writes).toEqual([]);
    expect(loadSession("gradibus", storage)?.cursor).toBe("cap1-s1");
    expect(sync.current().mode).toBe("offline");
  });

  test("does not read until access is granted", async () => {
    const files = transport(bundle(pass()), "needs-gesture");
    const sync = createSync({ transport: files, storage: new MemoryStorage() });
    await sync.syncIfReady();
    expect(files.reads()).toBe(0);
    expect(sync.current().mode).toBe("needs-gesture");
    await sync.syncNow();
    expect(files.reads()).toBe(1);
  });

  test("several edits become one sync", async () => {
    const storage = new MemoryStorage();
    saveSession(pass(), storage);
    const files = transport(bundle(pass()));
    const queued: { run: () => void; cancelled: boolean }[] = [];
    const sync = createSync({
      transport: files,
      storage,
      schedule(fn) {
        const item = { run: fn, cancelled: false };
        queued.push(item);
        return { cancel: () => { item.cancelled = true; } };
      },
    });
    sync.noteEdit();
    sync.noteEdit();
    expect(queued[0].cancelled).toBe(true);
    queued[1].run();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(files.reads()).toBe(1);
  });
});

describe("sessionChanged", () => {
  test("opening an empty pass is not an edit, and a new sitting is", () => {
    expect(sessionChanged(null, createSession("gradibus", "2026-09-27"))).toBe(false);
    const doc = pass();
    expect(sessionChanged(null, doc)).toBe(true);
    expect(sessionChanged(doc, doc)).toBe(false);
    expect(sessionChanged(doc, { ...doc, satWith: [...doc.satWith, { step: "cap1-s2", at: "2026-10-02" }] })).toBe(true);
  });
});

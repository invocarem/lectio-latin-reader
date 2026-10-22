import {
  convertOldSession,
  describeMerge,
  importProgress,
  mergeSession,
  parseBundle,
  serializeBundle,
  sessionsFromFiles,
} from "./bundle";
import { createSession, resetSession, type SessionDoc, type SessionWork } from "./document";
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

function pass(work: SessionWork, patch: Partial<SessionDoc> = {}): SessionDoc {
  return { ...createSession(work, "2026-09-27"), ...patch, work };
}

describe("mergeSession", () => {
  test("unions sittings and keeps the earlier date", () => {
    const local = pass("gradibus", {
      satWith: [{ step: "cap1-s1", at: "2026-10-02" }],
      cursor: "cap1-s1",
      cursorAt: "2026-10-02T12:00:00.000Z",
      touchedAt: "2026-10-02T12:00:00.000Z",
    });
    const remote = pass("gradibus", {
      satWith: [
        { step: "cap1-s1", at: "2026-10-01" },
        { step: "cap1-s2", at: "2026-10-03" },
      ],
      cursor: "cap1-s2",
      cursorAt: "2026-10-03T12:00:00.000Z",
      touchedAt: "2026-10-03T12:00:00.000Z",
    });
    const merged = mergeSession(local, remote);
    expect(merged.sittingsAdded).toBe(1);
    expect(merged.doc.satWith).toEqual([
      { step: "cap1-s1", at: "2026-10-01" },
      { step: "cap1-s2", at: "2026-10-03" },
    ]);
  });

  test("keeps the later note when both texts differ and records the other", () => {
    const local = pass("cursus", {
      annotations: [{ psalm: 50, line: "12", text: "earlier words", at: "2026-10-01" }],
    });
    const remote = pass("cursus", {
      annotations: [{ psalm: 50, line: "12", text: "later words", at: "2026-10-02" }],
    });
    const merged = mergeSession(local, remote);
    expect(merged.doc.annotations).toEqual([
      { psalm: 50, line: "12", text: "later words", at: "2026-10-02" },
    ]);
    expect(merged.conflicts).toEqual([
      {
        work: "cursus",
        psalm: 50,
        line: "12",
        kept: "later words",
        dropped: "earlier words",
      },
    ]);
    expect(describeMerge({
      sessions: {},
      sittingsAdded: 0,
      notesAdded: 0,
      cursorsMoved: 0,
      passesReset: 0,
      passesKept: 0,
      conflicts: merged.conflicts,
    })).toBe("0 sittings added, 0 notes added, cursor unchanged. Kept the later note on cursus 50:12");
  });

  test("a note with text beats an empty one", () => {
    const local = pass("cursus", {
      annotations: [{ psalm: 50, line: "12", text: "", at: "2026-10-08" }],
    });
    const remote = pass("cursus", {
      annotations: [{ psalm: 50, line: "12", text: "He is my God", at: "2026-10-01" }],
    });
    const merged = mergeSession(local, remote);
    expect(merged.doc.annotations[0].text).toBe("He is my God");
    expect(merged.notesAdded).toBe(1);
    expect(merged.conflicts).toEqual([]);
  });

  test("merges a library passage note by its unit, apart from any office line", () => {
    const local = pass("confessions", {
      annotations: [{ unit: "1.1", text: "earlier words", at: "2026-10-01" }],
    });
    const remote = pass("confessions", {
      annotations: [{ unit: "1.1", text: "later words", at: "2026-10-02" }],
    });
    const merged = mergeSession(local, remote);
    expect(merged.doc.annotations).toEqual([
      { unit: "1.1", text: "later words", at: "2026-10-02" },
    ]);
    expect(merged.conflicts).toEqual([
      {
        work: "confessions",
        unit: "1.1",
        kept: "later words",
        dropped: "earlier words",
      },
    ]);
    expect(describeMerge({
      sessions: {},
      sittingsAdded: 0,
      notesAdded: 0,
      cursorsMoved: 0,
      passesReset: 0,
      passesKept: 0,
      conflicts: merged.conflicts,
    })).toBe("0 sittings added, 0 notes added, cursor unchanged. Kept the later note on confessions 1.1");
  });

  test("the later cursorAt moves the cursor, and a missing one does not", () => {
    const local = pass("gradibus", {
      cursor: "cap1-s1",
      cursorAt: "2026-10-02T12:00:00.000Z",
      touchedAt: "2026-10-02T12:00:00.000Z",
    });
    const older = pass("gradibus", { cursor: "cap1-s9", cursorAt: "2026-10-01T12:00:00.000Z" });
    expect(mergeSession(local, older).doc.cursor).toBe("cap1-s1");
    const newer = pass("gradibus", { cursor: "cap1-s2", cursorAt: "2026-10-04T12:00:00.000Z" });
    const moved = mergeSession(local, newer);
    expect(moved.doc.cursor).toBe("cap1-s2");
    expect(moved.cursorMoved).toBe(true);
    const unstamped = pass("gradibus", { cursor: "cap1-s9" });
    expect(mergeSession(local, unstamped).doc.cursor).toBe("cap1-s1");
  });

  test("pace follows the later touchedAt, started is the earlier date, and the local id stays", () => {
    const local = pass("cursus", {
      id: "local-id",
      pace: 7,
      started: "2026-10-01",
      touchedAt: "2026-10-01T12:00:00.000Z",
    });
    const remote = pass("cursus", {
      id: "remote-id",
      pace: 40,
      started: "2026-09-01",
      touchedAt: "2026-10-08T12:00:00.000Z",
    });
    const merged = mergeSession(local, remote);
    expect(merged.doc.pace).toBe(40);
    expect(merged.doc.started).toBe("2026-09-01");
    expect(merged.doc.id).toBe("local-id");
  });

  test("an empty pass does not clobber a real one", () => {
    const real = pass("cursus", {
      id: "kept",
      pace: 40,
      started: "2026-09-01",
      cursor: "mon:prime:1",
      cursorAt: "2026-10-01T12:00:00.000Z",
      touchedAt: "2026-10-01T12:00:00.000Z",
      satWith: [{ step: "mon:prime:1", at: "2026-10-01" }],
      annotations: [{ psalm: 1, line: "1", text: "kept", at: "2026-10-01" }],
    });
    const empty = createSession("cursus", "2026-10-09", 7);
    const merged = mergeSession(real, empty);
    expect(merged.doc.satWith).toEqual(real.satWith);
    expect(merged.doc.annotations).toEqual(real.annotations);
    expect(merged.doc.cursor).toBe("mon:prime:1");
    expect(merged.doc.pace).toBe(40);
    expect(merged.doc.started).toBe("2026-09-01");
    expect(merged.doc.id).toBe("kept");
    expect(merged.sittingsAdded).toBe(0);
    expect(merged.cursorMoved).toBe(false);
  });

  test("an empty local pass takes the remote progress", () => {
    const empty = createSession("cursus", "2026-10-09", 7);
    const real = pass("cursus", {
      id: "from-the-other-device",
      pace: 40,
      started: "2026-09-01",
      cursor: "mon:prime:1",
      cursorAt: "2026-10-01T12:00:00.000Z",
      touchedAt: "2026-10-01T12:00:00.000Z",
      satWith: [{ step: "mon:prime:1", at: "2026-10-01" }],
    });
    const merged = mergeSession(empty, real);
    expect(merged.doc.satWith).toEqual(real.satWith);
    expect(merged.doc.cursor).toBe("mon:prime:1");
    expect(merged.doc.pace).toBe(40);
    expect(merged.doc.started).toBe("2026-09-01");
    expect(merged.doc.id).toBe(empty.id);
    expect(merged.sittingsAdded).toBe(1);
    expect(merged.cursorMoved).toBe(true);
  });

  test("a reset pass replaces the other copy's sittings, cursor, and start date", () => {
    const now = "2026-10-09T15:00:00.000Z";
    const old = pass("psalter", {
      started: "2026-09-01",
      cursor: "ps-2",
      cursorAt: "2026-09-02T12:00:00.000Z",
      touchedAt: "2026-09-02T12:00:00.000Z",
      satWith: [
        { step: "ps-1", at: "2026-09-01" },
        { step: "ps-2", at: "2026-09-02" },
      ],
      annotations: [{ unit: "ps-1", text: "on this device", at: "2026-09-01" }],
    });
    const reset = resetSession(
      pass("psalter", {
        annotations: [{ unit: "ps-3", text: "from the other pass", at: "2026-09-03" }],
      }),
      "2026-10-09",
      now,
    );
    const kept = mergeSession(reset, old);
    expect(kept.passReset).toBe(false);
    expect(kept.sittingsAdded).toBe(0);
    expect(kept.doc.satWith).toEqual([]);
    expect(kept.doc.cursor).toBeNull();
    expect(kept.doc.cursorAt).toBeUndefined();
    expect(kept.doc.started).toBe("2026-10-09");
    expect(kept.doc.passAt).toBe(now);
    expect(kept.doc.annotations).toEqual([
      { unit: "ps-3", text: "from the other pass", at: "2026-09-03" },
      { unit: "ps-1", text: "on this device", at: "2026-09-01" },
    ]);

    const replaced = mergeSession(old, reset);
    expect(replaced.passReset).toBe(true);
    expect(replaced.doc.satWith).toEqual([]);
    expect(replaced.doc.cursor).toBeNull();
    expect(replaced.doc.started).toBe("2026-10-09");
    expect(replaced.doc.passAt).toBe(now);
    expect(replaced.doc.id).toBe(old.id);
    expect(replaced.cursorMoved).toBe(true);
    expect(describeMerge({
      sessions: {},
      sittingsAdded: replaced.sittingsAdded,
      notesAdded: replaced.notesAdded,
      cursorsMoved: replaced.cursorMoved ? 1 : 0,
      passesReset: 1,
      passesKept: 0,
      conflicts: replaced.conflicts,
    })).toBe("1 pass started over, 1 note added, cursor moved");
  });

  test("the later reset wins, and the same pass still unions sittings", () => {
    const earlier = pass("gradibus", {
      started: "2026-10-01",
      passAt: "2026-10-01T12:00:00.000Z",
      cursor: "cap1-s1",
      cursorAt: "2026-10-02T12:00:00.000Z",
      satWith: [{ step: "cap1-s1", at: "2026-10-02" }],
    });
    const later = pass("gradibus", {
      started: "2026-10-09",
      passAt: "2026-10-09T15:00:00.000Z",
      cursor: "cap1-s4",
      cursorAt: "2026-10-10T12:00:00.000Z",
      satWith: [{ step: "cap1-s4", at: "2026-10-10" }],
    });
    const merged = mergeSession(earlier, later);
    expect(merged.doc.satWith).toEqual(later.satWith);
    expect(merged.doc.cursor).toBe("cap1-s4");
    expect(merged.doc.started).toBe("2026-10-09");
    expect(merged.doc.passAt).toBe(later.passAt);
    expect(merged.sittingsAdded).toBe(0);

    const same = mergeSession(
      { ...later, satWith: [{ step: "cap1-s4", at: "2026-10-10" }] },
      { ...later, satWith: [{ step: "cap1-s5", at: "2026-10-11" }], cursor: "cap1-s5" },
    );
    expect(same.passReset).toBe(false);
    expect(same.doc.satWith.map((mark) => mark.step).sort()).toEqual(["cap1-s4", "cap1-s5"]);
    expect(same.sittingsAdded).toBe(1);
  });
});

describe("lectio-sessions.json", () => {
  test("round-trips and skips an unknown work", () => {
    const bundle = {
      version: 1 as const,
      sessions: {
        gradibus: pass("gradibus", { cursor: "cap1-s1", satWith: [{ step: "cap1-s1", at: "2026-10-01" }] }),
      },
    };
    const text = serializeBundle(bundle);
    const parsed = parseBundle(text);
    expect(parsed?.bundle.sessions.gradibus).toEqual(bundle.sessions.gradibus);
    const mixed = JSON.stringify({
      version: 1,
      sessions: {
        nope: { work: "nope" },
        gradibus: bundle.sessions.gradibus,
      },
    });
    const read = parseBundle(mixed);
    expect(read?.skipped).toEqual(["nope"]);
    expect(read?.bundle.sessions.gradibus?.work).toBe("gradibus");
    expect(parseBundle(JSON.stringify({ version: 2, sessions: {} }))).toBeNull();
  });

  test("old progress files fold into one bundle and an empty pass gets no timestamps", () => {
    const cursus = JSON.stringify({
      work: "cursus",
      pace: 14,
      started: "2026-09-01",
      cursor: "mon:prime:1",
      satWith: [{ step: "mon:prime:1", at: "2026-10-01" }],
      highlights: [{ psalm: 50, line: "12" }],
      notes: [{ psalm: 50, line: "12", text: "He is my God", at: "2026-10-03" }],
    });
    const gradibus = JSON.stringify({
      id: "g",
      work: "gradibus",
      started: "2026-09-15",
      cursor: "cap1-s2",
      satWith: [{ step: "cap1-s1", at: "2026-09-20" }],
      annotations: [],
    });
    const empty = JSON.stringify(createSession("rule", "2026-10-09"));
    const read = sessionsFromFiles([
      { name: "cursus.json", text: cursus },
      { name: "gradibus.json", text: gradibus },
      { name: "rule.json", text: empty },
      { name: "notes.txt", text: "nope" },
    ]);
    expect(read.rejected).toEqual(["notes.txt"]);
    expect(read.bundle?.sessions.cursus?.pace).toBe(14);
    expect(read.bundle?.sessions.cursus?.annotations).toContainEqual({
      psalm: 50,
      line: "12",
      text: "He is my God",
      at: "2026-10-03",
    });
    expect(read.bundle?.sessions.cursus?.touchedAt).toBe("2026-10-03T23:59:59.999Z");
    expect(read.bundle?.sessions.cursus?.cursorAt).toBe("2026-10-03T23:59:59.999Z");
    expect(read.bundle?.sessions.gradibus?.satWith).toEqual([{ step: "cap1-s1", at: "2026-09-20" }]);
    expect(read.bundle?.sessions.gradibus?.cursorAt).toBe("2026-09-20T23:59:59.999Z");
    expect(read.bundle?.sessions.rule?.cursorAt).toBeUndefined();
    expect(read.bundle?.sessions.rule?.touchedAt).toBeUndefined();
  });

  test("convertOldSession keeps a stamp the file already has", () => {
    const doc = pass("gradibus", {
      cursor: "cap1-s1",
      satWith: [{ step: "cap1-s1", at: "2026-10-01" }],
      touchedAt: "2026-10-08T14:00:00.000Z",
      cursorAt: "2026-10-08T14:00:00.000Z",
    });
    expect(convertOldSession(doc).touchedAt).toBe("2026-10-08T14:00:00.000Z");
  });

  test("a single-work import writes that work and does not replace a different open pass", () => {
    const storage = new MemoryStorage();
    const cursus = pass("cursus", {
      id: "on-screen",
      cursor: "mon:prime:1",
      cursorAt: "2026-10-01T12:00:00.000Z",
      touchedAt: "2026-10-01T12:00:00.000Z",
      satWith: [{ step: "mon:prime:1", at: "2026-10-01" }],
    });
    saveSession(cursus, storage);
    const incoming = JSON.stringify(
      pass("gradibus", {
        cursor: "cap1-s2",
        satWith: [{ step: "cap1-s2", at: "2026-10-04" }],
      }),
    );
    const read = importProgress(incoming, storage, "cursus");
    expect(read.open).toBeNull();
    expect(loadSession("cursus", storage)).toEqual(cursus);
    expect(loadSession("gradibus", storage)?.cursor).toBe("cap1-s2");
    expect(loadSession("gradibus", storage)?.touchedAt).toBe("2026-10-04T23:59:59.999Z");
    expect(storage.getItem(sessionKey("gradibus"))).toBeTruthy();
    clearSession("gradibus", storage);
    expect(loadSession("cursus", storage)?.id).toBe("on-screen");
  });
});

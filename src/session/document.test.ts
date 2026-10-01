import {
  createSession,
  isHighlighted,
  noteFor,
  parseSession,
  recordOpen,
  satCount,
  serializeSession,
  setNote,
  setPace,
  toggleHighlight,
  toggleSat,
} from "./document";

describe("session document", () => {
  test("createSession opens a fresh pass today", () => {
    const doc = createSession("cursus", "2026-09-27");
    expect(doc.work).toBe("cursus");
    expect(doc.pace).toBe(14);
    expect(doc.started).toBe("2026-09-27");
    expect(doc.id).toBe("2026-09-27");
    expect(doc.cursor).toBeNull();
    expect(doc.satWith).toEqual([]);
  });

  test("recordOpen records the first sitting of each slice once", () => {
    let doc = createSession("cursus", "2026-09-27");
    doc = recordOpen(doc, "compline:4", "2026-09-27"); // first sitting of daily Psalm 4
    doc = recordOpen(doc, "compline:4", "2026-09-28"); // later sitting adds nothing
    expect(doc.satWith.length).toBe(1);
    expect(satCount(doc)).toBe(1);
    expect(doc.cursor).toBe("compline:4");
  });

  test("satCount counts the distinct slices, not the marks", () => {
    let doc = createSession("cursus", "2026-09-27");
    doc = recordOpen(doc, "sun:vigils:20", "2026-09-27");
    doc = recordOpen(doc, "mon:vigils:36:1-26", "2026-09-28");
    doc = recordOpen(doc, "mon:vigils:36:27-40", "2026-09-28");
    expect(satCount(doc)).toBe(3);
  });

  test("setPace changes the pace", () => {
    const doc = setPace(createSession("cursus", "2026-09-27"), 7);
    expect(doc.pace).toBe(7);
  });

  test("toggleSat adds then removes the sitting mark", () => {
    let doc = createSession("cursus", "2026-09-27");
    doc = toggleSat(doc, "wed:prime:10", "2026-09-27");
    expect(doc.satWith.length).toBe(1);
    expect(doc.cursor).toBe("wed:prime:10");
    expect(satCount(doc)).toBe(1);
    doc = toggleSat(doc, "wed:prime:10", "2026-09-27");
    expect(doc.satWith.length).toBe(0);
    expect(satCount(doc)).toBe(0);
  });

  test("serialize and parse round-trip", () => {
    let doc = createSession("cursus", "2026-09-27", 7);
    doc = recordOpen(doc, "sun:vigils:21", "2026-09-29");
    const text = serializeSession(doc);
    const parsed = parseSession(text);
    expect(parsed).toEqual(doc);
  });

  test("parse rejects an unknown or malformed file", () => {
    expect(parseSession(JSON.stringify({ work: "other" }))).toBeNull();
    expect(parseSession("{ not json")).toBeNull();
    expect(parseSession('{ "work": "cursus", "pace": 14, "started": "nope" }')).toBeNull();
    // a gradibus pass has no pace; a cursus pass without a valid pace is rejected
    expect(parseSession(JSON.stringify({ work: "cursus", pace: 9, started: "2026-09-27" }))).toBeNull();
  });

  test("gradibus pass has no pace and counts units by id", () => {
    let doc = createSession("gradibus", "2026-09-27");
    expect(doc.work).toBe("gradibus");
    expect(doc.pace).toBeUndefined();
    doc = recordOpen(doc, "cap1-s1", "2026-09-27");
    doc = recordOpen(doc, "cap1-s1", "2026-09-28"); // same unit adds nothing
    doc = recordOpen(doc, "cap1-s2", "2026-09-28");
    expect(satCount(doc)).toBe(2);
    expect(doc.cursor).toBe("cap1-s2");
  });

  test("gradibus serializes and parses without pace", () => {
    let doc = createSession("gradibus", "2026-09-27");
    doc = recordOpen(doc, "cap1-s1", "2026-09-27");
    const parsed = parseSession(serializeSession(doc));
    expect(parsed).toEqual(doc);
    expect(parsed?.pace).toBeUndefined();
  });

  test("parse tolerates extra fields and drops bad marks", () => {
    const text = JSON.stringify({
      work: "cursus",
      pace: 14,
      started: "2026-09-27",
      cursor: null,
      satWith: [{ step: "compline:4", at: "2026-09-27" }, { step: "sun:vigils:21" }],
      highlights: [{ psalm: 50 }],
      notes: [],
    });
    const parsed = parseSession(text);
    expect(parsed?.satWith.length).toBe(1);
    expect(parsed?.highlights).toEqual([]);
  });
});

describe("highlight and note", () => {
  test("toggleHighlight adds then removes a line", () => {
    const base = createSession("cursus", "2026-09-27");
    const on = toggleHighlight(base, 50, "12");
    expect(on.highlights).toEqual([{ psalm: 50, line: "12" }]);
    expect(isHighlighted(on, 50, "12")).toBe(true);
    expect(isHighlighted(on, 50, "13")).toBe(false);
    const off = toggleHighlight(on, 50, "12");
    expect(off.highlights).toEqual([]);
  });

  test("setNote writes and updates a note on a line", () => {
    const base = createSession("cursus", "2026-09-27");
    const first = setNote(base, 50, "12", "He is my God", "2026-09-28");
    expect(noteFor(first, 50, "12")).toEqual({ psalm: 50, line: "12", text: "He is my God", at: "2026-09-28" });
    const second = setNote(first, 50, "12", "Shown under the English", "2026-09-29");
    expect(second.notes.length).toBe(1);
    expect(noteFor(second, 50, "12")?.text).toBe("Shown under the English");
    expect(noteFor(second, 50, "12")?.at).toBe("2026-09-29");
  });

  test("setNote on another line does not touch the first", () => {
    const base = setNote(createSession("cursus", "2026-09-27"), 50, "12", "one", "2026-09-28");
    const next = setNote(base, 50, "13", "two", "2026-09-28");
    expect(next.notes.length).toBe(2);
    expect(noteFor(next, 50, "12")?.text).toBe("one");
    expect(noteFor(next, 50, "13")?.text).toBe("two");
  });

  test("import round-trips highlights and notes", () => {
    let doc = createSession("cursus", "2026-09-27");
    doc = toggleHighlight(doc, 50, "12");
    doc = setNote(doc, 50, "12", "He is my God", "2026-09-28");
    const parsed = parseSession(serializeSession(doc));
    expect(parsed?.highlights).toEqual([{ psalm: 50, line: "12" }]);
    expect(parsed?.notes).toEqual([{ psalm: 50, line: "12", text: "He is my God", at: "2026-09-28" }]);
  });
});

import {
  annotationFor,
  createSession,
  isAnnotated,
  markPosition,
  parseSession,
  recordOpen,
  satCount,
  serializeSession,
  setAnnotation,
  setPace,
  toggleAnnotation,
  toggleSat,
} from "./document";

describe("session document", () => {
  test("createSession opens a fresh pass today", () => {
    const doc = createSession("cursus", "2026-09-27");
    expect(doc.work).toBe("cursus");
    expect(doc.pace).toBe(7);
    expect(doc.started).toBe("2026-09-27");
    expect(doc.id).toBe("2026-09-27");
    expect(doc.cursor).toBeNull();
    expect(doc.satWith).toEqual([]);
    expect(doc.cursorAt).toBeUndefined();
    expect(doc.touchedAt).toBeUndefined();
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
    // 7, 14, and 40 are all valid paces for a cursus pass
    expect(parseSession(JSON.stringify({ work: "cursus", pace: 40, started: "2026-09-27" }))).not.toBeNull();
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

  test("confessions and rule passes serialize and parse like gradibus", () => {
    for (const work of ["confessions", "rule"] as const) {
      let doc = createSession(work, "2026-09-27");
      doc = recordOpen(doc, `${work}:1:1`, "2026-09-27");
      expect(doc.pace).toBeUndefined();
      const parsed = parseSession(serializeSession(doc));
      expect(parsed).toEqual(doc);
      expect(parsed?.work).toBe(work);
      expect(parsed?.pace).toBeUndefined();
    }
  });

  test("a real edit stamps touchedAt, and a cursor move stamps cursorAt", () => {
    const now = "2026-10-09T22:15:00.000Z";
    let doc = createSession("cursus", "2026-09-27");
    doc = recordOpen(doc, "compline:4", "2026-10-09", now);
    expect(doc.touchedAt).toBe(now);
    expect(doc.cursorAt).toBe(now);
    doc = recordOpen(doc, "compline:4", "2026-10-10", "2026-10-10T01:00:00.000Z");
    expect(doc.cursorAt).toBe(now);
    expect(doc.touchedAt).toBe(now);
    doc = setPace(doc, 14, "2026-10-10T02:00:00.000Z");
    expect(doc.touchedAt).toBe("2026-10-10T02:00:00.000Z");
    expect(doc.cursorAt).toBe(now);
  });

  test("parse keeps ISO timestamps and drops a malformed one", () => {
    const text = JSON.stringify({
      work: "gradibus",
      started: "2026-09-27",
      cursor: "cap1-s1",
      cursorAt: "2026-10-09T23:59:59.999Z",
      touchedAt: "not-a-stamp",
      satWith: [],
      annotations: [],
    });
    const parsed = parseSession(text);
    expect(parsed?.cursorAt).toBe("2026-10-09T23:59:59.999Z");
    expect(parsed?.touchedAt).toBeUndefined();
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
    expect(parsed?.annotations).toEqual([]);
  });
});

describe("annotation (highlight + note)", () => {
  test("toggleAnnotation adds then removes a line, deleting its note", () => {
    const base = createSession("cursus", "2026-09-27");
    const on = toggleAnnotation(base, 50, "12", "2026-09-27");
    expect(on.annotations).toEqual([{ psalm: 50, line: "12", text: "", at: "2026-09-27" }]);
    expect(isAnnotated(on, 50, "12")).toBe(true);
    expect(isAnnotated(on, 50, "13")).toBe(false);
    const noted = setAnnotation(on, 50, "12", "He is my God", "2026-09-28");
    expect(noted.annotations[0].text).toBe("He is my God");
    const off = toggleAnnotation(noted, 50, "12", "2026-09-29");
    expect(off.annotations).toEqual([]);
  });

  test("setAnnotation writes and updates a note on a line, refreshing its date", () => {
    const base = createSession("cursus", "2026-09-27");
    const first = setAnnotation(base, 50, "12", "He is my God", "2026-09-28");
    expect(annotationFor(first, 50, "12")).toEqual({ psalm: 50, line: "12", text: "He is my God", at: "2026-09-28" });
    const second = setAnnotation(first, 50, "12", "Shown under the English", "2026-09-29");
    expect(second.annotations.length).toBe(1);
    expect(annotationFor(second, 50, "12")?.text).toBe("Shown under the English");
    expect(annotationFor(second, 50, "12")?.at).toBe("2026-09-29");
  });

  test("setAnnotation on another line does not touch the first", () => {
    const base = setAnnotation(createSession("cursus", "2026-09-27"), 50, "12", "one", "2026-09-28");
    const next = setAnnotation(base, 50, "13", "two", "2026-09-28");
    expect(next.annotations.length).toBe(2);
    expect(annotationFor(next, 50, "12")?.text).toBe("one");
    expect(annotationFor(next, 50, "13")?.text).toBe("two");
  });

  test("import round-trips annotations", () => {
    let doc = createSession("cursus", "2026-09-27");
    doc = toggleAnnotation(doc, 50, "12", "2026-09-27");
    doc = setAnnotation(doc, 50, "12", "He is my God", "2026-09-28");
    const parsed = parseSession(serializeSession(doc));
    expect(parsed?.annotations).toEqual([{ psalm: 50, line: "12", text: "He is my God", at: "2026-09-28" }]);
  });

  test("import folds legacy highlights and notes into one annotation list", () => {
    const legacy = JSON.stringify({
      work: "cursus",
      pace: 7,
      started: "2026-09-27",
      cursor: null,
      satWith: [],
      highlights: [{ psalm: 50, line: "12" }, { psalm: 51, line: "3" }],
      notes: [{ psalm: 50, line: "12", text: "He is my God", at: "2026-09-28" }],
    });
    const parsed = parseSession(legacy);
    expect(parsed?.annotations).toContainEqual({ psalm: 50, line: "12", text: "He is my God", at: "2026-09-28" });
    expect(parsed?.annotations).toContainEqual({ psalm: 51, line: "3", text: "", at: "2026-09-27" });
  });
});

describe("remembered position (markPosition)", () => {
  test("remembers where the reader is without counting it as a sitting", () => {
    let doc = createSession("cursus", "2026-09-27");
    expect(doc.cursor).toBeNull();
    doc = markPosition(doc, "sun:vigils:21");
    expect(doc.cursor).toBe("sun:vigils:21");
    expect(doc.satWith).toEqual([]);
    expect(satCount(doc)).toBe(0);
  });

  test("moving on from a remembered position keeps the pass unmarked", () => {
    let doc = createSession("cursus", "2026-09-27");
    doc = markPosition(doc, "mon:vespers:113");
    doc = markPosition(doc, "mon:vespers:114");
    expect(doc.cursor).toBe("mon:vespers:114");
    expect(doc.satWith).toEqual([]);
  });
});

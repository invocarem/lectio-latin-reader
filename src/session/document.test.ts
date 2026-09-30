import { createSession, parseSession, recordOpen, satCount, serializeSession, setPace } from "./document";

describe("session document", () => {
  test("createSession opens a fresh pass today", () => {
    const doc = createSession(14, "2026-09-27");
    expect(doc.work).toBe("cursus");
    expect(doc.pace).toBe(14);
    expect(doc.started).toBe("2026-09-27");
    expect(doc.id).toBe("2026-09-27");
    expect(doc.cursor).toBeNull();
    expect(doc.satWith).toEqual([]);
  });

  test("recordOpen records the first sitting of each slice once", () => {
    let doc = createSession(14, "2026-09-27");
    doc = recordOpen(doc, "compline:4", "2026-09-27"); // first sitting of daily Psalm 4
    doc = recordOpen(doc, "compline:4", "2026-09-28"); // later sitting adds nothing
    expect(doc.satWith.length).toBe(1);
    expect(satCount(doc)).toBe(1);
    expect(doc.cursor).toBe("compline:4");
  });

  test("satCount counts the distinct slices, not the marks", () => {
    let doc = createSession(14, "2026-09-27");
    doc = recordOpen(doc, "sun:vigils:20", "2026-09-27");
    doc = recordOpen(doc, "mon:vigils:36:1-26", "2026-09-28");
    doc = recordOpen(doc, "mon:vigils:36:27-40", "2026-09-28");
    expect(satCount(doc)).toBe(3);
  });

  test("setPace changes the pace", () => {
    const doc = setPace(createSession(14, "2026-09-27"), 7);
    expect(doc.pace).toBe(7);
  });

  test("serialize and parse round-trip", () => {
    let doc = createSession(7, "2026-09-27");
    doc = recordOpen(doc, "sun:vigils:21", "2026-09-29");
    const text = serializeSession(doc);
    const parsed = parseSession(text);
    expect(parsed).toEqual(doc);
  });

  test("parse rejects a non-cursus or malformed file", () => {
    expect(parseSession(JSON.stringify({ work: "gradibus" }))).toBeNull();
    expect(parseSession("{ not json")).toBeNull();
    expect(parseSession('{ "work": "cursus", "pace": 14, "started": "nope" }')).toBeNull();
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

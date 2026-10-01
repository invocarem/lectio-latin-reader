/// <reference types="vitest/globals" />
import { lectioFocus, resolveSession, chapterFocus } from "./lectioNav";
import type { Chapter } from "./types";

const chapters: Chapter[] = [
  { id: "ch1", caput: 1, title: "Caput primum", firstUnitId: "u1" },
  { id: "ch2", caput: 2, title: "Caput secundum", firstUnitId: "u2" },
  { id: "ch3", caput: 3, title: "Caput tertium", firstUnitId: "u3" },
];

const units = [{ id: "a" }, { id: "b" }, { id: "c" }];

const studyWork = {
  studyEnabled: true,
  lectio: [{ id: "lectio-0" }],
  study: { units: [{ id: "study-0" }] },
};

const lectioOnlyWork = {
  studyEnabled: false,
  lectio: [{ id: "lectio-0" }],
};

describe("lectioFocus", () => {
  test("middle unit has previous and next", () => {
    const focus = lectioFocus(units, "b");
    expect(focus.current.id).toBe("b");
    expect(focus.index).toBe(1);
    expect(focus.prev?.id).toBe("a");
    expect(focus.next?.id).toBe("c");
  });

  test("first unit cannot go previous", () => {
    const focus = lectioFocus(units, "a");
    expect(focus.prev).toBeNull();
    expect(focus.next?.id).toBe("b");
  });

  test("last unit cannot go next", () => {
    const focus = lectioFocus(units, "c");
    expect(focus.prev?.id).toBe("b");
    expect(focus.next).toBeNull();
  });

  test("unknown focus id falls back to the first unit", () => {
    const focus = lectioFocus(units, "missing");
    expect(focus.current.id).toBe("a");
    expect(focus.index).toBe(0);
  });
});

describe("chapterFocus", () => {
  test("middle chapter has previous and next", () => {
    const focus = chapterFocus(chapters, "ch2");
    expect(focus.current?.id).toBe("ch2");
    expect(focus.prev?.id).toBe("ch1");
    expect(focus.next?.id).toBe("ch3");
  });

  test("first chapter cannot go previous", () => {
    const focus = chapterFocus(chapters, "ch1");
    expect(focus.prev).toBeNull();
    expect(focus.next?.id).toBe("ch2");
  });

  test("last chapter cannot go next", () => {
    const focus = chapterFocus(chapters, "ch3");
    expect(focus.prev?.id).toBe("ch2");
    expect(focus.next).toBeNull();
  });

  test("unknown chapter id has no neighbours", () => {
    const focus = chapterFocus(chapters, "missing");
    expect(focus.current).toBeNull();
    expect(focus.prev).toBeNull();
    expect(focus.next).toBeNull();
  });
});

describe("resolveSession", () => {
  test("browser can open Study when the work supports it", () => {
    expect(resolveSession(studyWork, true, "study")).toEqual({
      mode: "study",
      focusId: "study-0",
    });
  });

  test("iPhone cannot open Study even if requested", () => {
    expect(resolveSession(studyWork, false, "study")).toEqual({
      mode: "lectio",
      focusId: "lectio-0",
    });
  });

  test("a lectio-only work stays in lectio", () => {
    expect(resolveSession(lectioOnlyWork, true, "study")).toEqual({
      mode: "lectio",
      focusId: "lectio-0",
    });
  });

  test("default mode is lectio", () => {
    expect(resolveSession(studyWork, true)).toEqual({
      mode: "lectio",
      focusId: "lectio-0",
    });
  });

  test("lectio opens the first readable page, skipping a leading title", () => {
    const work = {
      studyEnabled: false,
      lectio: [
        { id: "tractatus", kind: "title" },
        { id: "cap1-title", kind: "chapter-title" },
        { id: "retractatio-s1", kind: "retractatio" },
        { id: "retractatio-s2", kind: "retractatio" },
      ],
    };
    expect(resolveSession(work, true)).toEqual({ mode: "lectio", focusId: "retractatio-s1" });
  });

  test("the psalter can open the office", () => {
    expect(
      resolveSession({ ...lectioOnlyWork, officeEnabled: true }, false, "office"),
    ).toEqual({ mode: "office", focusId: "lectio-0" });
  });

  test("a work without the office stays in lectio", () => {
    expect(resolveSession(lectioOnlyWork, true, "office")).toEqual({
      mode: "lectio",
      focusId: "lectio-0",
    });
  });

  test("the psalter can open office lectio", () => {
    expect(
      resolveSession({ ...lectioOnlyWork, officeEnabled: true }, false, "office-lectio"),
    ).toEqual({ mode: "office-lectio", focusId: "lectio-0" });
  });

  test("a work without the office cannot open office lectio", () => {
    expect(resolveSession(lectioOnlyWork, true, "office-lectio")).toEqual({
      mode: "lectio",
      focusId: "lectio-0",
    });
  });
});

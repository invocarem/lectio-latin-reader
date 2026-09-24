/// <reference types="vitest/globals" />
import { lectioFocus, resolveSession } from "./lectioNav";

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
});

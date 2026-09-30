/// <reference types="vitest/globals" />
import { countDone, daysBetween, sessionFromJson, sitWith, startSession } from "./session";
import { createPsalterCourse, offeredPlaces, psalterSlices, sliceFromCursus } from "./psalter";
import { PSALM_118_LETTERS, sliceId } from "./slice";

describe("slice", () => {
  test("Psalm 118 letters and a numbered half", () => {
    expect(sliceId(sliceFromCursus({ psalm: 118, from: 1, to: 8 }))).toBe("118:aleph");
    expect(sliceId(sliceFromCursus({ psalm: 118, from: 169, to: 176 }))).toBe("118:tau");
    expect(sliceId(sliceFromCursus({ psalm: 36, from: 1, to: 26, part: 1 }))).toBe("36:1");
    expect(sliceId(sliceFromCursus({ psalm: 21 }))).toBe("21");
  });
});

describe("psalter course", () => {
  const ids = () => psalterSlices().map(sliceId);

  test("total counts slices, including every letter of Psalm 118", () => {
    const course = createPsalterCourse({
      weekday: "sun",
      started: "2026-09-27",
      today: "2026-09-27",
      pace: 14,
    });
    expect(course.total()).toBeGreaterThan(150);
    expect(course.total()).toBe(ids().length);
    for (const letter of PSALM_118_LETTERS) {
      expect(ids().filter((id) => id === `118:${letter}`)).toHaveLength(1);
    }
    expect(ids()).toContain("36:1");
    expect(ids()).toContain("36:2");
    expect(ids()).toContain("115");
    expect(ids()).toContain("116");
    expect(ids().filter((id) => id === "4")).toHaveLength(1);
  });

  test("next on Sunday opens Psalm 3, then the next slice not yet sat with", () => {
    const course = createPsalterCourse({
      weekday: "sun",
      started: "2026-09-27",
      today: "2026-09-27",
      pace: 7,
    });
    expect(course.next(null, [])).toBe("3");
    expect(course.next("3", ["3"])).toBe("94");
  });

  test("Tuesday still offers Sunday Vigils, and Psalm 4 stays after it is sat with", () => {
    const places = offeredPlaces({
      weekday: "tue",
      started: "2026-09-27",
      today: "2026-09-29",
      pace: 7,
      satWith: ["4"],
    });
    const psalm21 = places.find((place) => sliceId(place.slice) === "21");
    expect(psalm21).toMatchObject({ weekday: "sun", hour: "vigils" });
    const psalm4 = places.filter((place) => sliceId(place.slice) === "4");
    expect(psalm4).toHaveLength(1);
    expect(psalm4[0]).toMatchObject({ weekday: "tue", hour: "compline" });
    expect(places.findIndex((place) => place.weekday === "tue")).toBe(0);
  });

  test("a fortnight holds the second nocturn until the second week", () => {
    const first = offeredPlaces({
      weekday: "tue",
      started: "2026-09-27",
      today: "2026-09-29",
      pace: 14,
      satWith: [],
    }).map((place) => sliceId(place.slice));
    expect(first).toContain("21");
    expect(first).not.toContain("26");
    expect(first).not.toContain("38");

    const second = offeredPlaces({
      weekday: "tue",
      started: "2026-09-27",
      today: "2026-10-06",
      pace: 14,
      satWith: ["21"],
    }).map((place) => sliceId(place.slice));
    expect(second).toContain("26");
    expect(second).toContain("58");
    expect(second).not.toContain("21");
    expect(second).toContain("45");
  });
});

describe("session record", () => {
  test("days from Sunday 27 September", () => {
    expect(daysBetween("2026-09-27", "2026-09-29")).toBe(2);
    expect(daysBetween("2026-09-27", "2026-10-04")).toBe(7);
  });

  test("Psalm 21 keeps Sunday Vigils when sat with on Tuesday", () => {
    const place = offeredPlaces({
      weekday: "tue",
      started: "2026-09-27",
      today: "2026-09-29",
      pace: 7,
      satWith: [],
    }).find((item) => sliceId(item.slice) === "21");
    expect(place).toBeDefined();
    const session = sitWith(startSession("2026-09-27", 14), place!, "2026-09-29");
    expect(session.satWith).toEqual([
      { weekday: "sun", hour: "vigils", psalm: 21, at: "2026-09-29" },
    ]);
    expect(session.cursor).toEqual({ weekday: "sun", hour: "vigils", psalm: 21 });
    expect(countDone(session)).toBe(1);
    const again = sitWith(session, place!, "2026-09-30");
    expect(again.satWith).toHaveLength(1);
    expect(countDone(again)).toBe(1);
  });

  test("Psalm 4 counts once and records Compline without a weekday", () => {
    const place = offeredPlaces({
      weekday: "sun",
      started: "2026-09-27",
      today: "2026-09-27",
      pace: 14,
      satWith: [],
    }).find((item) => sliceId(item.slice) === "4");
    expect(place).toBeDefined();
    const once = sitWith(startSession("2026-09-27"), place!, "2026-09-27");
    expect(once.satWith).toEqual([{ hour: "compline", psalm: 4, at: "2026-09-27" }]);
    const tuesday = offeredPlaces({
      weekday: "tue",
      started: "2026-09-27",
      today: "2026-09-29",
      pace: 14,
      satWith: ["4"],
    }).find((item) => sliceId(item.slice) === "4");
    const twice = sitWith(once, tuesday!, "2026-09-29");
    expect(countDone(twice)).toBe(1);
    expect(twice.satWith[0].at).toBe("2026-09-27");
  });

  test("aleph is one slice of Psalm 118", () => {
    const place = offeredPlaces({
      weekday: "sun",
      started: "2026-09-27",
      today: "2026-09-27",
      pace: 7,
      satWith: [],
    }).find((item) => sliceId(item.slice) === "118:aleph");
    expect(place).toMatchObject({ hour: "prime", weekday: "sun" });
    const session = sitWith(startSession("2026-09-27", 7), place!, "2026-09-28");
    expect(session.satWith[0]).toMatchObject({ psalm: 118, part: "aleph", at: "2026-09-28" });
    expect(countDone(session)).toBe(1);
  });

  test("a JSON file is the same pass, and other text is refused", () => {
    const session = startSession("2026-09-27", 14);
    expect(sessionFromJson(JSON.stringify(session))).toEqual(session);
    expect(sessionFromJson("not json")).toBeNull();
    expect(sessionFromJson(JSON.stringify({ work: "gradibus" }))).toBeNull();
  });
});

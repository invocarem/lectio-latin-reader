/// <reference types="vitest/globals" />
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { countDone, daysBetween, noteOn, sessionFromJson, setNote, sitWith, startSession, toggleHighlight } from "./session";
import { hourLines } from "../content/office/resolve";
import { ascentPlaces, createPsalterCourse, lectioIndex, offeredPlaces, placesOfPsalm, psalm118Places, psalterSlices, sliceFromCursus } from "./psalter";
import { SessionView } from "./SessionView";
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

  test("Psalm 4 opens at the first line of Compline", () => {
    const place = placesOfPsalm(4, "wed")[0];
    expect(place).toMatchObject({ weekday: "wed", hour: "compline" });
    const index = lectioIndex(place);
    expect(hourLines("wed", "compline")[index]).toMatchObject({ label: "Psalmus 4", psalm: 4 });
  });

  test("a psalm number finds its place, and a daily psalm is today's hour", () => {
    const tuesday = placesOfPsalm(4, "tue");
    expect(tuesday).toHaveLength(1);
    expect(tuesday[0]).toMatchObject({ weekday: "tue", hour: "compline" });
    const psalm21 = placesOfPsalm(21, "tue");
    expect(psalm21.map((place) => place.weekday)).toEqual(["sun"]);
    expect(psalm21[0].hour).toBe("vigils");
    const letters = placesOfPsalm(118, "sun").map((place) => place.slice.part);
    expect(letters[0]).toBe("aleph");
    expect(letters.at(-1)).toBe("tau");
    expect(placesOfPsalm(151, "sun")).toEqual([]);
  });

  test("Friday in the first week is Vigils 6 and Lauds 2", () => {
    const places = offeredPlaces({
      weekday: "wed",
      started: "2026-09-27",
      today: "2026-09-30",
      pace: 14,
      satWith: [],
    }).filter((place) => place.weekday === "fri");
    const count = (hour: string) => places.filter((place) => place.hour === hour).length;
    expect(count("vigils")).toBe(6);
    expect(count("lauds")).toBe(2);
    expect(places.some((place) => place.slice.psalm === 118)).toBe(false);
  });

  test("Wednesday is one day of eight hours", () => {
    const places = offeredPlaces({
      weekday: "wed",
      started: "2026-09-27",
      today: "2026-09-30",
      pace: 7,
      satWith: [],
    }).filter((place) => place.weekday === "wed");
    expect(new Set(places.map((place) => place.hour)).size).toBe(8);
  });

  test("Psalm 118 is twenty-two letters, and the ascent psalms are 119–127", () => {
    const letters = psalm118Places();
    expect(letters).toHaveLength(22);
    expect(letters[0]).toMatchObject({ weekday: "sun", hour: "prime", slice: { part: "aleph" } });
    expect(letters[21]).toMatchObject({ weekday: "mon", hour: "none", slice: { part: "tau" } });
    const ascent = ascentPlaces("tue");
    expect(ascent.map((place) => place.slice.psalm)).toEqual([119, 120, 121, 122, 123, 124, 125, 126, 127]);
    expect(ascent[0]).toMatchObject({ weekday: "tue", hour: "terce" });
    expect(ascent[8]).toMatchObject({ weekday: "tue", hour: "none" });
    expect(ascentPlaces("sun")[0].weekday).toBe("tue");
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

  test("a line highlight keeps a note, and an empty note is removed", () => {
    const fresh = startSession("2026-09-27");
    const marked = toggleHighlight(fresh, { psalm: 50, line: "12" });
    expect(marked.highlights).toEqual([{ psalm: 50, line: "12" }]);
    const noted = setNote(marked, { psalm: 50, line: "12", text: "miserere", at: "2026-09-28" });
    expect(noted.notes).toEqual([{ psalm: 50, line: "12", text: "miserere", at: "2026-09-28" }]);
    const cleared = toggleHighlight(noted, { psalm: 50, line: "12" });
    expect(cleared.highlights).toEqual([]);
    expect(cleared.notes).toHaveLength(1);
    const again = toggleHighlight(cleared, { psalm: 50, line: "12" });
    expect(noteOn(again, { psalm: 50, line: "12" })?.text).toBe("miserere");
    expect(setNote(again, { psalm: 50, line: "12", text: "  ", at: "2026-09-29" }).notes).toEqual([]);
  });

  test("Psalm 118 letters keep separate notes on the same line number", () => {
    const aleph = setNote(startSession("2026-09-27"), {
      psalm: 118,
      part: "aleph",
      line: "1",
      text: "beati",
      at: "2026-09-27",
    });
    const both = setNote(aleph, {
      psalm: 118,
      part: "beth",
      line: "1",
      text: "in quo",
      at: "2026-09-27",
    });
    expect(both.highlights).toHaveLength(2);
    expect(noteOn(both, { psalm: 118, part: "aleph", line: "1" })?.text).toBe("beati");
    expect(noteOn(both, { psalm: 118, part: "beth", line: "1" })?.text).toBe("in quo");
  });

  test("a JSON file is the same pass, and other text is refused", () => {
    const session = startSession("2026-09-27", 14);
    expect(sessionFromJson(JSON.stringify(session))).toEqual(session);
    expect(sessionFromJson("not json")).toBeNull();
    expect(sessionFromJson(JSON.stringify({ work: "gradibus" }))).toBeNull();
  });
});

describe("session panel", () => {
  test("today's day is selected, and only that card is shown", () => {
    const html = renderToStaticMarkup(
      createElement(SessionView, {
        session: startSession("2026-09-30", 7),
        today: new Date(2026, 8, 30, 9),
        importError: null,
        onChange: () => {},
        onOpen: () => {},
        onExport: () => {},
        onImport: () => {},
      }),
    );
    expect(html).toContain('aria-label="Day"');
    expect(html).toContain('<option value="wed" selected="">Wednesday</option>');
    expect(html).toContain('<option value="fri">Friday</option>');
    expect(html).not.toContain("Psalm 118");
    expect(html).not.toContain("Psalms of ascent");
    const cards = html.split('class="session-day"');
    expect(cards).toHaveLength(2);
    expect(cards[1].match(/Wednesday/g)).toHaveLength(1);
    expect(cards[1]).toContain("<summary>Wednesday");
    expect(cards[1].match(/session-hour/g)).toHaveLength(8);
    expect(cards[1]).toContain("Vigils");
    expect(cards[1]).toContain("Compline");
  });
});

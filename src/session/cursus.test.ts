import { ALL_PLACES, cursusCourse, daysFrom, dayPlaces, encodeStep, keyOfStep, nextStep, openPlaces, parseStep, psalmLabel, psalmPlaces } from "./cursus";

function distinctKeys(): Set<string> {
  return new Set(ALL_PLACES.map((place) => place.key));
}

describe("cursus course", () => {
  test("total counts the distinct slices, more than 150 psalms", () => {
    expect(cursusCourse.total()).toBe(distinctKeys().size);
    expect(cursusCourse.total()).toBeGreaterThan(150);
  });

  test("a psalm said every day is one slice", () => {
    const keys = distinctKeys();
    for (const psalm of [3, 4, 50, 66, 90, 94, 133, 148, 149, 150]) {
      expect(keys.has(String(psalm))).toBe(true);
    }
    // Psalm 4 appears at Compline every day but is only one slice.
    const compline4 = ALL_PLACES.filter((place) => place.hour === "compline" && place.slice.psalm === 4);
    expect(compline4.length).toBeGreaterThan(1);
    const unique = new Set(compline4.map((place) => place.key));
    expect(unique.size).toBe(1);
  });

  test("a divided psalm counts each slice", () => {
    const keys = distinctKeys();
    expect(keys.has("36:1-26")).toBe(true);
    expect(keys.has("36:27-40")).toBe(true);
    // Psalms 115 and 116 share a Vespers slot and are two slices.
    expect(keys.has("115")).toBe(true);
    expect(keys.has("116")).toBe(true);
    // Psalm 118 is twenty-two slices, one letter each (8 verses).
    const p118 = [...keys].filter((key) => key.startsWith("118:"));
    expect(p118.length).toBe(22);
  });

  test("step round-trips", () => {
    expect(encodeStep(null, "compline", 4)).toBe("compline:4");
    expect(encodeStep("sun", "vigils", 21)).toBe("sun:vigils:21");
    expect(parseStep("compline:4")).toEqual({ weekday: null, hour: "compline", psalm: 4 });
    expect(keyOfStep("compline:4")).toBe("4");
    expect(keyOfStep("sun:vigils:21")).toBe("21");
    expect(keyOfStep("mon:vigils:36:1-26")).toBe("36:1-26");
  });

  test("next walks the cursus on from the cursor", () => {
    expect(nextStep(null, [])).toBe(ALL_PLACES[0].step);
    const second = nextStep(ALL_PLACES[0].step, []);
    expect(second).toBe(ALL_PLACES[1].step);
  });

  test("next returns an already-sat daily psalm rather than stopping", () => {
    // Mark every slice except a daily psalm that appears again.
    const allSat = ALL_PLACES.map((place) => place.key);
    const keepKey = "4";
    const satSteps = ALL_PLACES.filter((place) => place.key !== keepKey).map((place) => place.step);
    const step = nextStep(null, satSteps)!;
    expect(keyOfStep(step)).toBe(keepKey);
    expect(allSat.length).toBeGreaterThan(0);
  });

  test("next returns null when every slice has been sat with", () => {
    const satSteps = ALL_PLACES.map((place) => place.step);
    expect(nextStep(null, satSteps)).toBeNull();
  });
});

describe("openPlaces", () => {
  test("seven-day pass offers today's weekday first", () => {
    const started = "2026-09-27"; // Sunday
    const today = "2026-09-27"; // Sunday
    const places = openPlaces(7, started, today, []);
    const todayPlaces = places.filter((place) => place.isToday);
    expect(todayPlaces.length).toBeGreaterThan(0);
    for (const place of todayPlaces) {
      if (place.weekday != null) expect(place.weekday).toBe("sun");
    }
    const keys = places.map((place) => place.key);
    expect(keys).toContain("4"); // daily Compline.
  });

  test("a fortnight keeps the second six of Vigils until the second half", () => {
    const started = "2026-09-27"; // Sunday
    const today = "2026-09-27"; // day 0, first half
    const places = openPlaces(14, started, today, []);
    const steps = places.map((place) => place.step);
    expect(steps).toContain("sun:vigils:20"); // first six offered
    expect(steps).not.toContain("sun:vigils:26"); // second six held back
  });

  test("a fortnight offers the second six in the second week", () => {
    const started = "2026-09-27"; // Sunday
    const today = "2026-10-04"; // day 7, second half, Sunday again
    const places = openPlaces(14, started, today, []);
    const steps = places.map((place) => place.step);
    expect(steps).toContain("sun:vigils:26");
  });

  test("a forty-day pass spreads Vigils over a fortnight like the fourteen-day pass", () => {
    const started = "2026-09-27"; // Sunday
    const first = openPlaces(40, started, "2026-09-27", []).map((place) => place.step);
    expect(first).toContain("sun:vigils:20"); // first six offered
    expect(first).not.toContain("sun:vigils:26"); // second six held back
    const second = openPlaces(40, started, "2026-10-04", []).map((place) => place.step);
    expect(second).toContain("sun:vigils:26"); // second six offered in week two
  });

  test("an open Sunday place is still offered later in the week", () => {
    const started = "2026-09-27"; // Sunday
    const today = "2026-09-30"; // Wednesday
    const places = openPlaces(7, started, today, []);
    const steps = places.map((place) => place.step);
    expect(steps).toContain("sun:vigils:21"); // unsat Sunday place remains open
  });

  test("sat-with places disappear from the open list", () => {
    const started = "2026-09-27";
    const today = "2026-09-27";
    const places = openPlaces(7, started, today, ["compline:4"]);
    expect(places.map((place) => place.key)).not.toContain("4");
  });

  test("a daily psalm is offered once, not once per weekday", () => {
    const started = "2026-09-27";
    const today = "2026-09-27";
    const places = openPlaces(7, started, today, []);
    const keys = places.map((place) => place.key);
    // Psalm 94 sits at Vigils on all seven weekdays but is one slice.
    expect(keys.filter((key) => key === "94").length).toBe(1);
  });
});

describe("dayPlaces and psalmPlaces (session locator)", () => {
  test("dayPlaces lists the full cursus of one weekday in hour order", () => {
    const sun = dayPlaces("sun");
    expect(sun.length).toBeGreaterThan(0);
    // Psalm 21 is Sunday Vigils.
    expect(sun.some((place) => place.slice.psalm === 21)).toBe(true);
    // Order runs Vigils first and Compline last.
    expect(sun[0].hour).toBe("vigils");
    expect(sun[sun.length - 1].hour).toBe("compline");
  });

  test("dayPlaces places a psalm on the weekday of its hour", () => {
    // Psalm 10 is Wednesday Prime.
    const wed = dayPlaces("wed");
    const found = wed.filter((place) => place.slice.psalm === 10);
    expect(found.length).toBe(1);
    expect(found[0].hour).toBe("prime");
    // Psalm 10 is not on a Sunday schedule.
    expect(dayPlaces("sun").some((place) => place.slice.psalm === 10)).toBe(false);
  });

  test("dayPlaces includes a daily psalm once at its hour", () => {
    const places = dayPlaces("wed");
    const daily = places.filter((place) => place.slice.psalm === 4);
    expect(daily.length).toBe(1); // Compline only; one slice, not once per hour.
    expect(daily[0].hour).toBe("compline");
  });

  test("psalmPlaces locates a psalm under its own weekday and hour", () => {
    const found = psalmPlaces(10);
    expect(found.length).toBe(1);
    expect(found[0].weekday).toBe("wed");
    expect(found[0].hour).toBe("prime");
  });

  test("psalmPlaces returns each slice of a divided psalm", () => {
    const halves = psalmPlaces(36);
    expect(halves.length).toBe(2);
    expect(new Set(halves.map((place) => place.key))).toEqual(
      new Set(["36:1-26", "36:27-40"]),
    );
  });

  test("psalmPlaces returns a daily psalm once despite its many weekday slots", () => {
    const found = psalmPlaces(4);
    expect(found.length).toBe(1);
    expect(found[0].weekday).toBeNull();
    expect(found[0].hour).toBe("compline");
  });

  test("psalmLabel names divided psalms instead of verse ranges", () => {
    // Psalm 118 aleph is verses 1–8, shown as its letter.
    const aleph = psalmPlaces(118).find((place) => place.key === "118:1-8");
    expect(aleph).toBeDefined();
    expect(psalmLabel(aleph!)).toBe("Psalmus 118 · Aleph");
    // Psalm 9 is cut in two on Tuesday and Wednesday Prime; part 1 is 2–19.
    const ninePart1 = psalmPlaces(9).find((place) => place.slice.from === 2);
    expect(ninePart1).toBeDefined();
    expect(psalmLabel(ninePart1!)).toBe("Psalmus 9 · 1");
    // A whole psalm keeps its number.
    expect(psalmLabel(psalmPlaces(10)[0])).toBe("Psalmus 10");
  });
});

describe("date helpers", () => {
  test("daysFrom counts whole civil days", () => {
    expect(daysFrom("2026-09-27", "2026-09-27")).toBe(0);
    expect(daysFrom("2026-09-27", "2026-10-04")).toBe(7);
  });
});

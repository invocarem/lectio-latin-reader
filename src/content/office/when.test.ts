/// <reference types="vitest/globals" />
import { easterSunday, officeNow, pentecostSunday } from "./when";

describe("officeNow", () => {
  test("10:19 on 24 Sep 2026 is Thursday Terce, summer, after Pentecost", () => {
    expect(officeNow(new Date(2026, 8, 24, 10, 19))).toEqual({
      weekday: "thu",
      hour: "terce",
      season: "summer",
      time: "after-pentecost",
    });
  });

  test("Easter and Pentecost 2026", () => {
    expect(easterSunday(2026)).toEqual(new Date(2026, 3, 5));
    expect(pentecostSunday(2026)).toEqual(new Date(2026, 4, 24));
  });
});

/// <reference types="vitest/globals" />
import { STUDY_MIN_SHORT_SIDE, screenSupportsStudy } from "./native";

describe("screenSupportsStudy", () => {
  test("the browser always has Study", () => {
    expect(screenSupportsStudy(false, 390)).toBe(true);
  });

  test("an iPhone stays on Lectio, in either orientation", () => {
    expect(screenSupportsStudy(true, 390)).toBe(false);
    expect(screenSupportsStudy(true, 430)).toBe(false);
  });

  test("an iPad gets Study", () => {
    expect(screenSupportsStudy(true, 744)).toBe(true);
    expect(screenSupportsStudy(true, 1024)).toBe(true);
  });

  test("the cutoff sits between the largest phone and the smallest iPad", () => {
    expect(STUDY_MIN_SHORT_SIDE).toBeGreaterThan(440);
    expect(STUDY_MIN_SHORT_SIDE).toBeLessThanOrEqual(744);
  });
});

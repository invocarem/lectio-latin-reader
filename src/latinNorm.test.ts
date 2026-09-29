/// <reference types="vitest/globals" />
import { normLatin } from "./latinNorm";

describe("normLatin", () => {
  test("folds ë to e", () => {
    expect(normLatin("Nunc Israël,")).toBe("Nunc Israel,");
    expect(normLatin("Doëg Idumaeus")).toBe("Doeg Idumaeus");
  });

  test("folds uppercase Ë to E", () => {
    expect(normLatin("IntroËat")).toBe("IntroEat");
  });

  test("capitalizes a lowercase-leading verse", () => {
    expect(normLatin("cum exsurgerent homines in nos")).toBe(
      "Cum exsurgerent homines in nos",
    );
  });

  test("keeps existing capital and leading non-letters", () => {
    expect(normLatin("Nisi quia Dominus erat in nobis")).toBe(
      "Nisi quia Dominus erat in nobis",
    );
    expect(normLatin("(forte vivos deglutissent)")).toBe(
      "(Forte vivos deglutissent)",
    );
  });
});

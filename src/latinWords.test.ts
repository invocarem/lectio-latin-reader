/// <reference types="vitest/globals" />
import { isLatinWord, latinWords } from "./latinWords";

describe("latinWords", () => {
  test("splits a sentence into tappable words", () => {
    expect(latinWords("Beatus vir qui")).toEqual(["Beatus", "vir", "qui"]);
  });

  test("punctuation is not a word", () => {
    expect(latinWords("iam.")).toEqual(["iam"]);
    expect(isLatinWord(".")).toBe(false);
    expect(isLatinWord(",")).toBe(false);
  });

  test("keeps vowels like eius and iam as words", () => {
    expect(latinWords("eius iam")).toEqual(["eius", "iam"]);
  });

  test("accented letters stay words", () => {
    expect(latinWords("Deus, tu")).toEqual(["Deus", "tu"]);
  });
});

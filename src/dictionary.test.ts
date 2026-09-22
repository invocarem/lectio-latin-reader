/// <reference types="vitest/globals" />
import { normalise } from "./dictionary";

describe("normalise", () => {
  test("lowercases a tapped Latin word for lexicon lookup", () => {
    expect(normalise("In")).toBe("in");
    expect(normalise("Beatus")).toBe("beatus");
  });

  test("strips surrounding punctuation", () => {
    expect(normalise("vir,")).toBe("vir");
    expect(normalise("«iam»")).toBe("iam");
  });
});

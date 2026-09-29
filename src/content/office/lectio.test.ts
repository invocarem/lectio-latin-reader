/// <reference types="vitest/globals" />
import { hourLines, nextPsalmIndex, prevPsalmIndex } from "./resolve";

describe("hourLines", () => {
  test("Monday None walks Psalm 118 in Benedictine section order", () => {
    const lines = hourLines("mon", "none");
    expect(lines).toHaveLength(24);
    expect(lines[0]).toMatchObject({
      label: "Psalmus 118 · Res",
      n: "153",
    });
    expect(lines[0].latin.startsWith("Vide")).toBe(true);
    expect(lines[8].label).toBe("Psalmus 118 · Sin");
    expect(lines[23].label).toBe("Psalmus 118 · Tau");
    expect(lines[23].n).toBe("176");
  });

  test("Sunday Vigils opens on the Benedictine lining of Psalm 3", () => {
    const lines = hourLines("sun", "vigils");
    expect(lines[0].label).toBe("Psalmus 3");
    expect(lines[0].n).toBe("1");
    expect(lines[0].latin.startsWith("Domine, quid multiplicati sunt")).toBe(true);
    expect(lines[0].latin.includes("Psalmus David")).toBe(false);
  });

  test("Monday Vespers reads Psalm 115 and then Psalm 116", () => {
    const lines = hourLines("mon", "vespers");
    const psalm116 = lines.findIndex((line) => line.label === "Psalmus 116");
    expect(psalm116).toBeGreaterThan(0);
    expect(lines[psalm116 - 1].label).toBe("Psalmus 115");
  });

  test("Compline Psalm 90 drops the title from Latin and English", () => {
    const lines = hourLines("mon", "compline");
    const psalm90 = lines.find((line) => line.label === "Psalmus 90");
    expect(psalm90).toBeDefined();
    expect(psalm90!.n).toBe("1");
    expect(psalm90!.latin.startsWith("Qui habitat")).toBe(true);
    expect(psalm90!.latin).not.toContain("Laus cantici");
    expect(psalm90!.english.startsWith("He that dwelleth")).toBe(true);
    expect(psalm90!.english).not.toContain("The praise of a canticle");
  });

  test("psalm jump: Compline walks Psalm 4 → 90 → 133", () => {
    const lines = hourLines("mon", "compline");
    const first = lines.findIndex((line) => line.label === "Psalmus 4");
    const ninety = nextPsalmIndex(lines, first);
    expect(ninety).toBeGreaterThan(first);
    expect(lines[ninety].label).toBe("Psalmus 90");
    expect(lines[ninety].n).toBe("1");
    const oneThirtyThree = nextPsalmIndex(lines, ninety);
    expect(lines[oneThirtyThree].label).toBe("Psalmus 133");
    expect(nextPsalmIndex(lines, oneThirtyThree)).toBe(-1);
    // and back down
    expect(prevPsalmIndex(lines, oneThirtyThree)).toBe(ninety);
    expect(prevPsalmIndex(lines, ninety)).toBe(first);
    expect(prevPsalmIndex(lines, first)).toBe(-1);
  });

  test("psalm jump: joined Psalms 115 and 116 at Monday Vespers are separate steps", () => {
    const lines = hourLines("mon", "vespers");
    const psalm115 = lines.findIndex((line) => line.label === "Psalmus 115");
    const psalm116 = lines.findIndex((line) => line.label === "Psalmus 116");
    expect(psalm115).toBeGreaterThanOrEqual(0);
    expect(nextPsalmIndex(lines, psalm115)).toBe(psalm116);
    expect(prevPsalmIndex(lines, psalm116)).toBe(psalm115);
  });
});

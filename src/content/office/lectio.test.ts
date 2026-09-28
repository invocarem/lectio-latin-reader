/// <reference types="vitest/globals" />
import { hourLines } from "./resolve";

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
});

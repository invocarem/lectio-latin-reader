/// <reference types="vitest/globals" />
import { studyUnitsInView } from "./studyView";

const units = [
  { id: "s1-title", caput: 1 },
  { id: "s1-p1", caput: 1 },
  { id: "s2-title", caput: 2 },
  { id: "s2-p1", caput: 2 },
  { id: "preface", caput: null },
];

describe("studyUnitsInView", () => {
  test("mounts the whole work when mount is omitted", () => {
    expect(studyUnitsInView(units, "s2-p1").map((unit) => unit.id)).toEqual([
      "s1-title",
      "s1-p1",
      "s2-title",
      "s2-p1",
      "preface",
    ]);
  });

  test("mounts only the focused sermon's blocks", () => {
    expect(
      studyUnitsInView(units, "s2-p1", "caput").map((unit) => unit.id),
    ).toEqual(["s2-title", "s2-p1"]);
  });

  test("an unknown focus falls back to the first sermon's blocks", () => {
    expect(
      studyUnitsInView(units, "missing", "caput").map((unit) => unit.id),
    ).toEqual(["s1-title", "s1-p1"]);
  });

  test("a block with no caput keeps the whole work mounted", () => {
    expect(studyUnitsInView(units, "preface", "caput")).toBe(units);
  });
});

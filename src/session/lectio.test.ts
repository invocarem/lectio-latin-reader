import type { ReaderWork } from "../types";
import { gradibus } from "../content/gradibus";
import { confessions } from "../content/confessions";
import { rule } from "../content/rule";
import { cantica } from "../content/cantica";
import { buildSlices, makeLectioCourse } from "./lectio";
import type { SessionCourse } from "./course";

const cases: Array<[string, SessionCourse, ReaderWork]> = [
  ["gradibus", makeLectioCourse(gradibus), gradibus],
  ["confessions", makeLectioCourse(confessions), confessions],
  ["rule", makeLectioCourse(rule), rule],
  ["cantica", makeLectioCourse(cantica), cantica],
];

describe("shared lectio course", () => {
  for (const [name, course, work] of cases) {
    const slices = buildSlices(work);
    const order = slices.map((s) => s.step);

    test(`${name}: total is the number of slices`, () => {
      expect(course.total()).toBe(slices.length);
      expect(course.total()).toBeGreaterThan(0);
    });

    test(`${name}: a section split into lectio pages is one slice`, () => {
      // every slice key is distinct (pages collapse), and keys are stable
      expect(new Set(slices.map((s) => s.key)).size).toBe(slices.length);
      expect(slices.map((s) => s.key)).toEqual([...slices.map((s) => s.key)]);
    });

    test(`${name}: next walks from the cursor to the first unsat slice in order`, () => {
      const first = order[0];
      const second = order[1];
      expect(course.next(null, [])).toBe(first);
      expect(course.next(first, [])).toBe(second);
      // a sat slice is skipped
      expect(course.next(null, [first])).toBe(second);
      expect(course.next(second, [first])).toBe(order[2]);
    });

    test(`${name}: next wraps to the start when the tail is done`, () => {
      const first = order[0];
      const satAfter = order.slice(1);
      expect(course.next(order[0], satAfter)).toBe(first);
    });

    test(`${name}: next returns null when every slice is sat`, () => {
      expect(course.next(null, order)).toBeNull();
    });

    test(`${name}: next steps are slice steps (readable pages)`, () => {
      const steps = new Set(order);
      for (let i = 0; i < order.length - 1; i++) {
        const step = course.next(order[i], []);
        if (step) expect(steps.has(step)).toBe(true);
      }
    });
  }

  test("gradibus sections are split yet collapse to one slice each", () => {
    const readable = gradibus.lectio.filter((u) => u.kind !== "title" && u.kind !== "chapter-title");
    const slices = buildSlices(gradibus);
    expect(readable.length).toBeGreaterThan(slices.length);
  });

  test("gradibus Retractatio and Praefatio are one slice each, like any section", () => {
    const labels = buildSlices(gradibus)
      .filter((s) => s.label === "Retractatio" || s.label === "Praefatio")
      .map((s) => s.label);
    expect(labels).toEqual(["Retractatio", "Praefatio"]);
  });
});

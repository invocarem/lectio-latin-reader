import { gradibus } from "../content/gradibus";
import { gradibusCourse } from "./gradibus";

describe("gradibus course", () => {
  test("total is the number of lectio units", () => {
    expect(gradibusCourse.total()).toBe(gradibus.lectio.length);
    expect(gradibusCourse.total()).toBeGreaterThan(150);
  });

  test("next walks from the cursor to the first unsat unit in order", () => {
    const order = gradibus.lectio.map((unit) => unit.id);
    const first = order[0];
    const second = order[1];
    expect(gradibusCourse.next(null, [])).toBe(first);
    expect(gradibusCourse.next(first, [])).toBe(second);
    // a sat step is skipped
    expect(gradibusCourse.next(null, [first])).toBe(second);
    expect(gradibusCourse.next(second, [first])).toBe(order[2]);
  });

  test("next wraps to the start when the tail is done", () => {
    const order = gradibus.lectio.map((unit) => unit.id);
    const first = order[0];
    // everything after the cursor is sat, the first unit is not
    const satAfter = order.slice(1);
    expect(gradibusCourse.next(order[0], satAfter)).toBe(first);
  });

  test("next returns null when every unit is sat", () => {
    const all = gradibus.lectio.map((unit) => unit.id);
    expect(gradibusCourse.next(null, all)).toBeNull();
  });

  test("steps are the lectio unit ids", () => {
    // every returned step exists in the lectio
    const ids = new Set(gradibus.lectio.map((unit) => unit.id));
    for (let i = 0; i < gradibus.lectio.length - 1; i++) {
      const step = gradibusCourse.next(gradibus.lectio[i].id, []);
      if (step) expect(ids.has(step)).toBe(true);
    }
  });
});

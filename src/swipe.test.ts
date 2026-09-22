/// <reference types="vitest/globals" />
import { EDGE_GUARD_PX, SWIPE_MIN_DX, swipeIntent } from "./swipe";

const touch = {
  pointerType: "touch",
  startX: 120,
  dy: 0,
};

describe("swipeIntent", () => {
  test("swipe left goes to the next unit", () => {
    expect(swipeIntent({ ...touch, dx: -80 })).toBe("next");
  });

  test("swipe right goes to the previous unit", () => {
    expect(swipeIntent({ ...touch, dx: 80 })).toBe("prev");
  });

  test("pen is treated like touch", () => {
    expect(
      swipeIntent({ pointerType: "pen", startX: 120, dx: -80, dy: 0 }),
    ).toBe("next");
  });

  test("mouse drag does not change units", () => {
    expect(
      swipeIntent({ pointerType: "mouse", startX: 120, dx: -80, dy: 0 }),
    ).toBeNull();
  });

  test("a small finger wobble is not a swipe", () => {
    expect(swipeIntent({ ...touch, dx: -(SWIPE_MIN_DX - 1) })).toBeNull();
  });

  test("vertical pan wins over a diagonal drag", () => {
    expect(swipeIntent({ ...touch, dx: -80, dy: -100 })).toBeNull();
  });

  test("swipes that start on the iOS back-edge are ignored", () => {
    expect(
      swipeIntent({ ...touch, startX: EDGE_GUARD_PX - 1, dx: -80 }),
    ).toBeNull();
  });

  test("a cancelled pointer is ignored", () => {
    expect(swipeIntent({ ...touch, dx: -80, cancelled: true })).toBeNull();
  });
});

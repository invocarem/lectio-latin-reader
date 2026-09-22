/// <reference types="vitest/globals" />
import {
  MAX_ZOOM,
  ZOOM_STEP,
  ZOOM_WHEEL_STEP,
  clampZoom,
  nextZoomWithWheel,
  panTarget,
  zoomAroundCursor,
} from "./plateZoom";

describe("clampZoom", () => {
  test("keeps a value already in range", () => {
    expect(clampZoom(1)).toBe(1);
    expect(clampZoom(2)).toBe(2);
    expect(clampZoom(MAX_ZOOM)).toBe(MAX_ZOOM);
  });

  test("clamps below 100% up to 1", () => {
    expect(clampZoom(0)).toBe(1);
    expect(clampZoom(0.5)).toBe(1);
  });

  test("clamps above the maximum down to MAX_ZOOM", () => {
    expect(clampZoom(7)).toBe(MAX_ZOOM);
    expect(clampZoom(100)).toBe(MAX_ZOOM);
  });

  test("rounds to two decimals", () => {
    expect(clampZoom(1.234)).toBe(1.23);
    expect(clampZoom(1.239)).toBe(1.24);
  });
});

describe("nextZoomWithWheel", () => {
  test("a negative deltaY zooms in by the wheel step", () => {
    expect(nextZoomWithWheel(1, -100)).toBeCloseTo(ZOOM_WHEEL_STEP);
    expect(nextZoomWithWheel(2, -1)).toBeCloseTo(2 * ZOOM_WHEEL_STEP);
  });

  test("a positive deltaY zooms out by the wheel step", () => {
    expect(nextZoomWithWheel(2, 100)).toBeCloseTo(2 / ZOOM_WHEEL_STEP);
  });

  test("cannot zoom out below 100%", () => {
    expect(nextZoomWithWheel(1, 100)).toBe(1);
  });

  test("cannot zoom in above the maximum", () => {
    expect(nextZoomWithWheel(MAX_ZOOM, -100)).toBe(MAX_ZOOM);
  });

  test("a zero deltaY zooms out (treated as non-in)", () => {
    expect(nextZoomWithWheel(2, 0)).toBeCloseTo(2 / ZOOM_WHEEL_STEP);
  });
});

describe("zoomAroundCursor", () => {
  test("zooming in keeps the cursor point fixed", () => {
    const { scrollLeft, scrollTop } = zoomAroundCursor({
      scrollLeft: 0,
      scrollTop: 0,
      offsetX: 100,
      offsetY: 50,
      from: 1,
      to: 2,
    });
    expect(scrollLeft).toBe(100);
    expect(scrollTop).toBe(50);
  });

  test("zooming in from an already-scrolled position", () => {
    const from = 2;
    const to = 4;
    const scrollLeft = 40;
    const scrollTop = 20;
    const offsetX = 100;
    const offsetY = 60;
    const beforeX = (scrollLeft + offsetX) / from;
    const beforeY = (scrollTop + offsetY) / from;
    const { scrollLeft: sl, scrollTop: st } = zoomAroundCursor({
      scrollLeft,
      scrollTop,
      offsetX,
      offsetY,
      from,
      to,
    });
    expect(sl).toBeCloseTo(beforeX * to - offsetX);
    expect(st).toBeCloseTo(beforeY * to - offsetY);
  });

  test("zooming out recedes the scroll position", () => {
    const { scrollLeft, scrollTop } = zoomAroundCursor({
      scrollLeft: 50,
      scrollTop: 25,
      offsetX: 50,
      offsetY: 25,
      from: 2,
      to: 1,
    });
    expect(scrollLeft).toBe(0);
    expect(scrollTop).toBe(0);
  });
});

describe("panTarget", () => {
  test("dragging right pans the content left", () => {
    expect(
      panTarget(
        { scrollLeft: 100, scrollTop: 50, startX: 10, startY: 10 },
        25,
        10,
      ),
    ).toEqual({ scrollLeft: 85, scrollTop: 50 });
  });

  test("dragging down pans the content up", () => {
    expect(
      panTarget(
        { scrollLeft: 100, scrollTop: 50, startX: 10, startY: 10 },
        10,
        40,
      ),
    ).toEqual({ scrollLeft: 100, scrollTop: 20 });
  });

  test("a no-op drag returns the starting scroll", () => {
    expect(
      panTarget(
        { scrollLeft: 30, scrollTop: 40, startX: 5, startY: 5 },
        5,
        5,
      ),
    ).toEqual({ scrollLeft: 30, scrollTop: 40 });
  });
});

describe("ZOOM_STEP", () => {
  test("is a positive fraction of the range", () => {
    expect(ZOOM_STEP).toBeGreaterThan(0);
    expect(ZOOM_STEP).toBeLessThanOrEqual(MAX_ZOOM - 1);
  });
});

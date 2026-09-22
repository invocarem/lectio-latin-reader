/**
 * Pure helpers for the facsimile (plate) zoom/pan feature in Reader study mode.
 * Kept free of DOM so the maths can be unit-tested directly.
 */

export const ZOOM_STEP = 0.25;
export const MAX_ZOOM = 6;
export const ZOOM_WHEEL_STEP = 1.2;

/** Clamp a zoom factor into [1, MAX_ZOOM], rounded to two decimals. */
export function clampZoom(z: number): number {
  return Math.min(MAX_ZOOM, Math.max(1, Math.round(z * 100) / 100));
}

/** Zoom level that results from a wheel event with the given deltaY. */
export function nextZoomWithWheel(z: number, deltaY: number): number {
  const factor = deltaY < 0 ? ZOOM_WHEEL_STEP : 1 / ZOOM_WHEEL_STEP;
  return clampZoom(z * factor);
}

export type ZoomAroundInput = {
  scrollLeft: number;
  scrollTop: number;
  offsetX: number;
  offsetY: number;
  from: number;
  to: number;
};

export type Point = { scrollLeft: number; scrollTop: number };

/**
 * Given the scroll position at the current zoom (`from`), return the new
 * scroll position after changing to `to` so the image point under the cursor
 * (`offsetX`/`offsetY`, relative to the viewport top-left) stays put.
 */
export function zoomAroundCursor({
  scrollLeft,
  scrollTop,
  offsetX,
  offsetY,
  from,
  to,
}: ZoomAroundInput): Point {
  const px = (scrollLeft + offsetX) / from;
  const py = (scrollTop + offsetY) / from;
  return {
    scrollLeft: px * to - offsetX,
    scrollTop: py * to - offsetY,
  };
}

export type PanStart = {
  scrollLeft: number;
  scrollTop: number;
  startX: number;
  startY: number;
};

/**
 * Where the scrolled content should sit after the pointer has moved from the
 * drag start by (`clientX`, `clientY`). Dragging right pans left (content
 * follows the hand), hence the subtraction.
 */
export function panTarget(start: PanStart, clientX: number, clientY: number): Point {
  return {
    scrollLeft: start.scrollLeft - (clientX - start.startX),
    scrollTop: start.scrollTop - (clientY - start.startY),
  };
}

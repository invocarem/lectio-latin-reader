export const SWIPE_MIN_DX = 56;
export const SWIPE_H_DOMINANCE = 1.2;
export const EDGE_GUARD_PX = 16;

export type SwipeIntent = "next" | "prev" | null;

export function isSwipePointer(pointerType: string): boolean {
  return pointerType === "touch" || pointerType === "pen";
}

/** Decide whether a completed pointer gesture should turn the lectio page. */
export function swipeIntent(input: {
  pointerType: string;
  startX: number;
  dx: number;
  dy: number;
  cancelled?: boolean;
}): SwipeIntent {
  if (!isSwipePointer(input.pointerType)) return null;
  if (input.cancelled) return null;
  if (input.startX < EDGE_GUARD_PX) return null;
  if (Math.abs(input.dx) < SWIPE_MIN_DX) return null;
  if (Math.abs(input.dx) < Math.abs(input.dy) * SWIPE_H_DOMINANCE) return null;
  return input.dx < 0 ? "next" : "prev";
}

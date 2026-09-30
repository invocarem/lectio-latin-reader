/**
 * What a work supplies. The session calls these two and does not walk
 * the work's own order.
 */
export type SessionCourse = {
  total(): number;
  next(cursor: string | null, satWith: readonly string[]): string | null;
};

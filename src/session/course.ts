/**
 * A session course tells the session how long a pass is and how to step
 * through it. The session only ever calls `total` and `next`; it never walks
 * a cursus or a treatise on its own.
 *
 * A step is a string the work chooses. The session stores that string, the
 * civil date it was opened, and any note. Progress is how many distinct steps
 * have been sat with, over `total()`.
 */
export interface SessionCourse {
  /**
   * The number of distinct steps that finish a pass. Called once per open.
   */
  total(): number;
  /**
   * The step to open next, walking on from `cursor`. Returns a step already
   * sat with if that step is offered again (a daily psalm); the count stays
   * where it is. Returns null when every step has been sat with.
   */
  next(cursor: string | null, satWith: readonly string[]): string | null;
}

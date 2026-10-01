/**
 * The session course registry: one course per session work. The cursus has
 * its own course; every other work that opts in (`session: true`) shares the
 * lectio course over its normalized `lectio`. Callers ask for a course by the
 * session work id and never special-case a work here.
 */

import { workById } from "../content/works";
import type { SessionWork } from "./document";
import type { SessionCourse } from "./course";
import { cursusCourse } from "./cursus";
import { makeLectioCourse } from "./lectio";

/** The course for a session work. The cursus is the psalter; every lectio work shares one course. */
export function courseFor(work: SessionWork): SessionCourse {
  if (work === "cursus") return cursusCourse;
  const reader = workById(work);
  if (!reader) throw new Error(`No course for session work "${work}"`);
  return makeLectioCourse(reader);
}

import type { ReaderWork, WorkId } from "../types";
import { gradibus } from "./gradibus";
import { psalter } from "./psalter";
import { rule } from "./rule";

/** All registered works, in display order (first is the default). */
export const works: ReaderWork[] = [gradibus, psalter, rule];

const byId = new Map<WorkId, ReaderWork>(works.map((work) => [work.id, work]));

export function workById(id: WorkId): ReaderWork | undefined {
  return byId.get(id);
}

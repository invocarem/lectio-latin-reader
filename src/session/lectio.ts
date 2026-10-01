/**
 * The shared lectio course: one pass is the whole work, read section by section.
 * A slice is a work's own section (caput 1.1, sermo 1.2, a psalm). `total` is
 * the number of slices; `next` returns the next section not yet sat with, in
 * reading order. There is no weekday and no hour.
 *
 * This is the one course every lectio work shares (gradibus, confessions,
 * rule, cantica, any future lectio work). A work opts in to a session with the
 * `session` flag; it gets this course, not its own structure.
 *
 * Two rules hold in every work alike:
 *  - A pure heading (a work title or a chapter title) is not a slice: it only
 *    labels a group and is never counted or stepped through.
 *  - A section is one slice however many lectio pages it is split into; the
 *    pages are like the verses of a psalm, not slices of their own. Every
 *    work follows the same rule, so Retractatio and Praefatio are one slice
 *    each, like any other section. A slice steps to the first page of its
 *    section.
 */

import type { ReaderWork, LectioUnit } from "../types";
import type { SessionCourse } from "./course";

/** A unit the pass counts and steps through: content, not a pure heading. */
export function isReadableSlice(unit: LectioUnit): boolean {
  return unit.kind !== "title" && unit.kind !== "chapter-title";
}

/** One pass step: a section (or a front-matter part), with its first page. */
export type LectioSlice = {
  /** Stable identity for counting and sat-marks. */
  key: string;
  /** The navigable lectio page this slice opens (the section's first page). */
  step: string;
  label: string;
  chapterId: string | undefined;
};

/** The identity a slice counts as: every lectio page of a section shares its source. */
function sliceKeyOf(unit: LectioUnit): string {
  return unit.sourceId;
}

function sliceLabel(unit: LectioUnit): string {
  if (unit.heading) return unit.heading;
  const label = (unit.label ?? "").trim();
  // A useful label (e.g. "Liber 1.1 · 1"), not a bare section number ("1").
  if (label && !/^\d+$/.test(label)) return label;
  // Gradibus section: "10.35 · Seraphim namque aliis…" — the citation on the first page's Latin.
  const number =
    unit.caput != null
      ? `${unit.caput}.${unit.section ?? ""}`
      : unit.section != null
        ? String(unit.section)
        : "";
  const latin = (unit.latin ?? "").trim();
  const opening = latin ? (latin.length > 48 ? `${latin.slice(0, 47)}…` : latin) : "";
  if (number && opening) return `${number} · ${opening}`;
  if (number) return number;
  if (opening) return opening;
  return unit.id;
}

/** The slices of a work in reading order, collapsing lectio pages to sections. */
export function buildSlices(work: ReaderWork): LectioSlice[] {
  const slices: LectioSlice[] = [];
  let currentKey: string | null = null;
  for (const unit of work.lectio) {
    if (!isReadableSlice(unit)) continue;
    const key = sliceKeyOf(unit);
    // Skip the later pages of a section already opened as a slice.
    if (key === currentKey) continue;
    currentKey = key;
    slices.push({ key, step: unit.id, label: sliceLabel(unit), chapterId: unit.chapterId });
  }
  return slices;
}

export function makeLectioCourse(work: ReaderWork): SessionCourse {
  const slices = buildSlices(work);
  const pageToKey = new Map<string, string>();
  for (const unit of work.lectio) {
    if (!isReadableSlice(unit)) continue;
    pageToKey.set(unit.id, sliceKeyOf(unit));
  }
  return {
    total: () => slices.length,
    next: (cursor, satWith) => {
      const satKeys = new Set(satWith.map((step) => pageToKey.get(step) ?? step));
      const start = cursor == null ? -1 : slices.findIndex((s) => s.step === cursor || s.key === cursor);
      // Walk on from the cursor; wrap to the start when the tail is all done.
      for (let i = start + 1; i < slices.length; i++) {
        if (!satKeys.has(slices[i].key)) return slices[i].step;
      }
      for (let i = 0; i <= start; i++) {
        if (!satKeys.has(slices[i].key)) return slices[i].step;
      }
      return null;
    },
  };
}

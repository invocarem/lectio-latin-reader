import type { Chapter, ReaderMode } from "./types";

/** Neighbours of a chapter in the TOC, used to jump to the previous/next chapter. */
export function chapterFocus(
  chapters: Chapter[],
  chapterId: string,
): { current: Chapter | null; prev: Chapter | null; next: Chapter | null } {
  const index = chapters.findIndex((chapter) => chapter.id === chapterId);
  if (index < 0) return { current: null, prev: null, next: null };
  return {
    current: chapters[index],
    prev: index > 0 ? chapters[index - 1] : null,
    next: index < chapters.length - 1 ? chapters[index + 1] : null,
  };
}

export function lectioFocus<T extends { id: string }>(
  units: T[],
  focusId: string,
): {
  current: T;
  index: number;
  prev: T | null;
  next: T | null;
} {
  const current = units.find((unit) => unit.id === focusId) ?? units[0];
  const index = units.findIndex((unit) => unit.id === current.id);
  return {
    current,
    index,
    prev: index > 0 ? units[index - 1] : null,
    next: index >= 0 && index < units.length - 1 ? units[index + 1] : null,
  };
}

/** The first lectio page to open: a readable page, skipping a leading work/chapter title. */
function firstReadableId(lectio: { id: string; kind?: string }[]): string {
  const first = lectio.find((unit) => unit.kind !== "title" && unit.kind !== "chapter-title");
  return (first ?? lectio[0]).id;
}

/** Study is per-work, and hidden when the screen is iPhone-sized. */
export function resolveSession(
  work: {
    studyEnabled: boolean;
    officeEnabled?: boolean;
    lectio: { id: string; kind?: string }[];
    study?: { units: { id: string }[] };
  },
  platformStudy: boolean,
  requested?: ReaderMode,
): { mode: ReaderMode; focusId: string } {
  let mode: ReaderMode = "lectio";
  if ((requested === "office" || requested === "office-lectio") && work.officeEnabled) {
    mode = requested;
  } else if (requested === "study" && work.studyEnabled && platformStudy) mode = "study";
  const focusId =
    mode === "study"
      ? work.study?.units[0]?.id ?? work.lectio[0].id
      : firstReadableId(work.lectio);
  return { mode, focusId };
}

import type { ReaderMode } from "./types";

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

/** Study is per-work and hidden on the native iPhone app. */
export function resolveSession(
  work: {
    studyEnabled: boolean;
    lectio: { id: string }[];
    study?: { units: { id: string }[] };
  },
  platformStudy: boolean,
  requested?: ReaderMode,
): { mode: ReaderMode; focusId: string } {
  const mode: ReaderMode =
    work.studyEnabled && platformStudy ? requested ?? "lectio" : "lectio";
  const focusId =
    mode === "study"
      ? work.study?.units[0]?.id ?? work.lectio[0].id
      : work.lectio[0].id;
  return { mode, focusId };
}

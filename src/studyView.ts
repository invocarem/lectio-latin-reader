import type { Unit } from "./types";

/** Units Study should mount. "caput" keeps only the focused sermon's blocks. */
export function studyUnitsInView<T extends Pick<Unit, "id" | "caput">>(
  units: T[],
  focusId: string,
  mount?: "caput",
): T[] {
  if (mount !== "caput") return units;
  const current = units.find((unit) => unit.id === focusId) ?? units[0];
  if (!current || current.caput == null) return units;
  return units.filter((unit) => unit.caput === current.caput);
}

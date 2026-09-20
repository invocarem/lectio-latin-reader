import type { Unit } from "../types";
import raw from "./de-gradibus.json";

export const units = raw as Unit[];

export const work = {
  latinTitle: "De gradibus humilitatis et superbiae",
  englishTitle: "The Steps of Humility and of Pride",
  authorLatin: "S. Bernardus Abbas Clarae-Vallensis",
  authorEnglish: "Saint Bernard of Clairvaux",
  edition: "Patrologia Latina 182, cols. 939–972",
  units,
};

export type Chapter = {
  id: string;
  caput: number | null;
  title: string;
  firstUnitId: string;
};

export function chaptersFrom(list: Unit[]): Chapter[] {
  const out: Chapter[] = [];
  for (const unit of list) {
    if (unit.kind === "retractatio" || unit.kind === "praefatio") {
      out.push({
        id: unit.id,
        caput: null,
        title: unit.heading ?? unit.label,
        firstUnitId: unit.id,
      });
    }
    if (unit.kind === "chapter-title" && unit.caput != null) {
      out.push({
        id: unit.id,
        caput: unit.caput,
        title: unit.heading ?? `Caput ${unit.caput}`,
        firstUnitId: unit.id,
      });
    }
  }
  return out;
}

export const chapters = chaptersFrom(units);

export function unitById(id: string): Unit | undefined {
  return units.find((unit) => unit.id === id);
}

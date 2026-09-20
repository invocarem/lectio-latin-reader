import type { LectioUnit, Unit } from "../types";
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

export function lectioFrom(list: Unit[]): LectioUnit[] {
  const out: LectioUnit[] = [];
  for (const unit of list) {
    const chunks =
      unit.chunks && unit.chunks.length > 0
        ? unit.chunks
        : [
            {
              id: unit.id,
              part: 1,
              parts: 1,
              latin: unit.latin,
              english: unit.english,
            },
          ];
    for (const chunk of chunks) {
      out.push({
        ...unit,
        id: chunk.id,
        sourceId: unit.id,
        latin: chunk.latin,
        english: chunk.english,
        part: chunk.part,
        parts: chunk.parts,
      });
    }
  }
  return out;
}

export const lectioUnits = lectioFrom(units);

export function lectioById(id: string): LectioUnit | undefined {
  return lectioUnits.find((unit) => unit.id === id);
}

export function firstLectioId(sourceId: string): string {
  return lectioUnits.find((unit) => unit.sourceId === sourceId)?.id ?? sourceId;
}

export function sourceIdOf(id: string): string {
  return lectioById(id)?.sourceId ?? id;
}

export function chapterKey(unit: Pick<Unit, "id" | "kind" | "caput">): string {
  if (unit.kind === "title") return "title";
  if (unit.kind === "retractatio") return "retractatio";
  if (unit.kind === "praefatio") return "praefatio";
  if (unit.caput != null) return `cap${unit.caput}-title`;
  return unit.id;
}

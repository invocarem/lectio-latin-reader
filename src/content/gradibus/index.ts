import type { Chapter, LectioUnit, ReaderWork, Unit } from "../../types";
import raw from "./de-gradibus.json";

/**
 * De gradibus humilitatis et superbiae, adapted from its legacy flat Unit[]
 * content into the common reader-facing ReaderWork shape. Study mode is
 * enabled (it has Patrologia facsimile plates + columns).
 */

export const units = raw as Unit[];

function chapterIdOf(unit: Unit): string {
  if (unit.kind === "title") return "title";
  if (unit.kind === "retractatio") return "retractatio";
  if (unit.kind === "praefatio") return "praefatio";
  if (unit.caput != null) return `cap${unit.caput}-title`;
  return unit.id;
}

function lectioFrom(list: Unit[]): LectioUnit[] {
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
        chapterId: chapterIdOf(unit),
        latin: chunk.latin,
        english: chunk.english,
        part: chunk.part,
        parts: chunk.parts,
      });
    }
  }
  return out;
}

function chaptersFrom(list: Unit[], firstIdOf: (sourceId: string) => string): Chapter[] {
  const out: Chapter[] = [];
  for (const unit of list) {
    if (unit.kind === "retractatio" || unit.kind === "praefatio") {
      out.push({
        id: unit.id,
        caput: null,
        title: unit.heading ?? unit.label,
        firstUnitId: firstIdOf(unit.id),
      });
    }
    if (unit.kind === "chapter-title" && unit.caput != null) {
      out.push({
        id: unit.id,
        caput: unit.caput,
        title: unit.heading ?? `Caput ${unit.caput}`,
        firstUnitId: firstIdOf(unit.id),
      });
    }
  }
  return out;
}

const lectio = lectioFrom(units);
const chapters = chaptersFrom(units, (sourceId) =>
  lectio.find((unit) => unit.sourceId === sourceId)?.id ?? sourceId,
);

export const gradibus: ReaderWork = {
  id: "gradibus",
  latinTitle: "De gradibus humilitatis et superbiae",
  englishTitle: "The Steps of Humility and of Pride",
  authorLatin: "S. Bernardus Abbas Clarae-Vallensis",
  authorEnglish: "Saint Bernard of Clairvaux",
  edition: "Patrologia Latina 182, cols. 939–972",
  brandShort: "De gradibus",
  brandLine: "Bernard of Clairvaux · PL 182",
  intro:
    "One short Latin paragraph at a time, with English at hand. Study mode keeps the full parallel columns of each Patrologia section.",
  studyEnabled: true,
  lectio,
  chapters,
  study: { units, chapters },
};

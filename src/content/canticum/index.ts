import type { Chapter, LectioUnit, ReaderWork } from "../../types";
import { canticum as source } from "./work";

/**
 * The Canticle of Canticles, adapted from the nested schema into the common
 * ReaderWork shape for Lectio. Each verse becomes one short reading.
 *
 * Lectio English is the aligned Challoner Douay-Rheims column.
 * Study mode is not enabled: there are no facsimile plates.
 */
function adapt(): ReaderWork {
  const lectio: LectioUnit[] = [];
  const chapters: Chapter[] = [];

  for (const part of source.parts) {
    for (const chapter of part.chapters) {
      const chapterId = chapter.id;
      let firstUnitId: string | undefined;
      for (const paragraph of chapter.paragraphs) {
        for (const segment of paragraph.segments) {
          const unitId = `${chapterId}:${segment.id}`;
          if (!firstUnitId) firstUnitId = unitId;
          const verseNo = paragraph.n;
          lectio.push({
            id: unitId,
            sourceId: unitId,
            chapterId,
            kind: "section",
            caput: null,
            section: verseNo ? Number(verseNo) : null,
            heading: null,
            latin: segment.latin,
            english: segment.translations.douay ?? "",
            column: 0,
            facsimile: null,
            label:
              chapter.number != null
                ? `Caput ${chapter.number}${verseNo ? ` · ${verseNo}` : ""}`
                : chapter.title,
            part: 1,
            parts: 1,
          });
        }
      }
      chapters.push({
        id: chapterId,
        caput: null,
        title: chapter.title,
        firstUnitId: firstUnitId ?? "",
      });
    }
  }

  return {
    id: "canticum",
    latinTitle: source.latinTitle,
    englishTitle: source.title,
    edition: source.edition,
    brandShort: "Canticum",
    brandLine: "Vulgata Clementina · Canticum Canticorum",
    intro:
      "The Song of Songs, one verse at a time — Clementine Latin with the Challoner Douay-Rheims at hand.",
    studyEnabled: false,
    lectio,
    chapters,
  };
}

export const canticum: ReaderWork = adapt();

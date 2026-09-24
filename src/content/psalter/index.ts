import type { Chapter, LectioUnit, ReaderWork } from "../../types";
import { psalter as source } from "./work";

/**
 * The Gallican Psalter, adapted from the nested schema (Work → parts →
 * chapters → paragraphs → segments) into the common ReaderWork shape for
 * Lectio. Each verse (segment) becomes one short reading.
 *
 * Lectio English defaults to the aligned Challoner Douay-Rheims column.
 * Study mode is not enabled yet: the psalter has no facsimile plates.
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
          // Segment ids (p1, p1.1) repeat in every psalm, so namespace them
          // with the chapter id to keep ids globally unique for navigation.
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
                ? `Psalmus ${chapter.number}${verseNo ? ` · ${verseNo}` : ""}`
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
    id: "psalter",
    latinTitle: source.latinTitle,
    englishTitle: source.title,
    edition: source.edition,
    brandShort: "Psalter",
    brandLine: "Vulgata Clementina · Psalterium Gallicanum",
    intro:
      "The Psalms, one verse at a time — Gallican Latin with the 1662 Coverdale and Challoner Douay-Rheims at hand.",
    studyEnabled: false,
    officeEnabled: true,
    lectio,
    chapters,
  };
}

export const psalter: ReaderWork = adapt();

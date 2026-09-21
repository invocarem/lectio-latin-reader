import type { Chapter, LectioUnit, ReaderWork } from "../../types";
import { rule as source } from "./work";

/**
 * The Rule of St Benedict, adapted from the nested schema (Work → parts →
 * chapters → paragraphs → segments) into the common ReaderWork shape for
 * Lectio. Each numbered block (paragraph) becomes one reading.
 *
 * Lectio English is the public-domain Boniface Verheyen (1949) rendering.
 * Study mode is not enabled yet: the Rule has no facsimile plates.
 */
function adapt(): ReaderWork {
  const lectio: LectioUnit[] = [];
  const chapters: Chapter[] = [];

  for (const part of source.parts) {
    for (const chapter of part.chapters) {
      const chapterId = chapter.id;
      const chapterLabel =
        chapter.number != null ? `Capitulum ${chapter.number}` : "Prologus";
      let firstUnitId: string | undefined;
      for (const paragraph of chapter.paragraphs) {
        for (const segment of paragraph.segments) {
          // Paragraph ids (p1, p1.1) repeat in every chapter, so namespace
          // them with the chapter id to keep ids globally unique.
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
            english: segment.translations.verheyen ?? "",
            column: 0,
            facsimile: null,
            label: verseNo ? `${chapterLabel} · ${verseNo}` : chapterLabel,
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
    id: "rule",
    latinTitle: source.latinTitle,
    englishTitle: source.title,
    edition: source.edition,
    brandShort: "Rule",
    brandLine: "Regula Sancti Benedicti",
    intro:
      "The Rule of St Benedict, one block at a time — monastic Latin with the public-domain Verheyen (1949) English at hand.",
    studyEnabled: false,
    lectio,
    chapters,
  };
}

export const rule: ReaderWork = adapt();

import type { Chapter, LectioUnit, ReaderWork } from "../../types";
import { chunkLectio } from "../splitLectio";
import { confessions as source } from "./work";

/**
 * Augustine's Confessions, adapted from the nested schema (Work → parts →
 * chapters → paragraphs → segments) into the common ReaderWork shape for
 * Lectio. Long PL paragraphs are broken into Gradibus-style lectio pages
 * (~60 Latin words) with the same sentence splitter, allowing O'Donnell's
 * all-lowercase Latin to count as sentence starts.
 *
 * Lectio English is the public-domain E. B. Pusey (1838) rendering.
 * Study mode is not enabled yet: the Confessions has no facsimile plates.
 */
function adapt(): ReaderWork {
  const lectio: LectioUnit[] = [];
  const chapters: Chapter[] = [];

  for (const part of source.parts) {
    for (const chapter of part.chapters) {
      const chapterId = chapter.id;
      const cite = chapterId.includes(":")
        ? chapterId.split(":").slice(1).join(":")
        : chapter.title;
      let firstUnitId: string | undefined;
      for (const paragraph of chapter.paragraphs) {
        for (const segment of paragraph.segments) {
          // Paragraph ids (p1, p1.1) repeat in every book, so namespace
          // them with the chapter id to keep ids globally unique.
          const baseId = `${chapterId}:${segment.id}`;
          const verseNo = paragraph.n;
          const chunks = chunkLectio(
            {
              id: baseId,
              kind: "section",
              latin: segment.latin,
              english: segment.translations.pusey ?? "",
            },
            { allowLowercase: true },
          );
          if (!firstUnitId) firstUnitId = chunks[0]?.id ?? baseId;
          for (const chunk of chunks) {
            lectio.push({
              id: chunk.id,
              sourceId: baseId,
              chapterId,
              kind: "section",
              caput: null,
              section: verseNo ? Number(verseNo) : null,
              heading: null,
              latin: chunk.latin,
              english: chunk.english,
              column: 0,
              facsimile: null,
              label: verseNo ? `Liber ${cite} · ${verseNo}` : `Liber ${cite}`,
              part: chunk.part,
              parts: chunk.parts,
            });
          }
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
    id: "confessions",
    latinTitle: source.latinTitle,
    englishTitle: source.title,
    authorLatin: "S. Aurelius Augustinus",
    authorEnglish: "Saint Augustine of Hippo",
    edition: source.edition,
    brandShort: "Confessions",
    brandLine: "Augustine · Confessiones",
    intro:
      "Augustine's Confessions, one short stretch at a time — O'Donnell's Latin with Pusey's 1838 English at hand.",
    studyEnabled: false,
    lectio,
    chapters,
  };
}

export const confessions: ReaderWork = adapt();

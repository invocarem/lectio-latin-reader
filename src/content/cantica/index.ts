import type { Chapter, LectioUnit, ReaderWork, Unit } from "../../types";
import { chunkLectio } from "../splitLectio";
import { cantica as source } from "./work";
import columnsFile from "./columns.json";

/**
 * Bernard's Sermones in Cantica Canticorum, adapted from the nested schema
 * into the common ReaderWork shape. Lectio breaks long PL paragraphs into
 * ~60-word pages; Study keeps each numbered block whole beside the Migne plate.
 *
 * Lectio English is a close, sentence-aligned rendering written for the
 * reader (one sentence per Latin sentence), so each Latin page pairs with
 * the English for the same material.
 */

type ColumnMap = {
  chapters: Record<string, Record<string, number>>;
};

const COLUMN_CHAPTERS = (columnsFile as ColumnMap).chapters;

function plateOf(column: number): string {
  const lo = column % 2 === 0 ? column - 1 : column;
  return `songs/pl-${lo}-${lo + 1}.png`;
}

function columnOf(sermon: number, key: string, fallback: number): number {
  return COLUMN_CHAPTERS[String(sermon)]?.[key] ?? fallback;
}

function adapt(): ReaderWork {
  const lectio: LectioUnit[] = [];
  const chapters: Chapter[] = [];
  const studyUnits: Unit[] = [];
  const studyChapters: Chapter[] = [];

  for (const part of source.parts) {
    for (const chapter of part.chapters) {
      const chapterId = chapter.id;
      const n = chapter.number;
      if (n == null) continue;
      let firstLectioId: string | undefined;
      const titleCol = columnOf(n, "title", 785);
      const titleId = `${chapterId}-title`;
      const heading = chapter.heading || chapter.title;
      studyUnits.push({
        id: titleId,
        kind: "chapter-title",
        caput: n,
        section: null,
        heading,
        latin: heading.endsWith(".") ? heading : `${heading}.`,
        english: "",
        column: titleCol,
        facsimile: plateOf(titleCol),
        label: `Sermo ${n}`,
      });
      let lastCol = titleCol;
      for (const paragraph of chapter.paragraphs) {
        const verseNo = paragraph.n;
        const col = columnOf(n, verseNo ?? "", lastCol);
        lastCol = col;
        for (const segment of paragraph.segments) {
          const baseId = `${chapterId}:${segment.id}`;
          const english = segment.translations.close ?? "";
          const chunks = chunkLectio(
            {
              id: baseId,
              kind: "section",
              latin: segment.latin,
              english,
            },
            { sentenceAligned: true },
          );
          if (!firstLectioId) firstLectioId = chunks[0]?.id ?? baseId;
          for (const chunk of chunks) {
            lectio.push({
              id: chunk.id,
              sourceId: baseId,
              chapterId,
              kind: "section",
              caput: null,
              section: verseNo ? Number(verseNo) : null,
              heading: chapter.heading || null,
              latin: chunk.latin,
              english: chunk.english,
              column: col,
              facsimile: plateOf(col),
              label:
                verseNo != null && verseNo !== ""
                  ? `Sermo ${n} · ${verseNo}`
                  : `Sermo ${n}`,
              part: chunk.part,
              parts: chunk.parts,
            });
          }
          studyUnits.push({
            id: baseId,
            kind: "section",
            caput: n,
            section: verseNo ? Number(verseNo) : null,
            heading: null,
            latin: segment.latin,
            english,
            column: col,
            facsimile: plateOf(col),
            label:
              verseNo != null && verseNo !== ""
                ? `Sermo ${n} · ${verseNo}`
                : `Sermo ${n}`,
          });
        }
      }
      chapters.push({
        id: chapterId,
        caput: null,
        title: chapter.heading ? `Sermo ${n} — ${chapter.heading}` : chapter.title,
        firstUnitId: firstLectioId ?? titleId,
      });
      studyChapters.push({
        id: `sermo-${n}`,
        caput: n,
        capLabel: "Sermo",
        title: heading,
        firstUnitId: titleId,
      });
    }
  }

  return {
    id: "cantica",
    latinTitle: source.latinTitle,
    englishTitle: source.title,
    authorLatin: "S. Bernardus Abbas Clarae-Vallensis",
    authorEnglish: "Saint Bernard of Clairvaux",
    edition: source.edition,
    brandShort: "Cantica",
    brandLine: "Bernard of Clairvaux · PL 183",
    intro:
      "Bernard's eighty-six sermons on the Song of Songs, one short stretch at a time — Patrologia Latina with a close English reading at hand. The cycle reaches Song 3:1.",
    studyEnabled: true,
    lectio,
    chapters,
    study: { units: studyUnits, chapters: studyChapters },
  };
}

export const cantica: ReaderWork = adapt();

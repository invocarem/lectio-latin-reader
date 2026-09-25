import type { Chapter, LectioUnit, ReaderWork, Unit } from "../../types";
import pagesFile from "./pages.json";
import { psalter as source } from "./work";

/**
 * The Gallican Psalter, adapted from the nested schema (Work → parts →
 * chapters → paragraphs → segments) into the common ReaderWork shape for
 * Lectio. Each verse (segment) becomes one short reading.
 *
 * Lectio English defaults to the aligned Challoner Douay-Rheims column.
 * Study mounts one psalm at a time beside its Vercellone 1861 Clementine page.
 */

type PageEntry = number | Record<string, number>;
type PageMap = {
  psalms: Record<string, PageEntry>;
};

const PSALM_PAGES = (pagesFile as PageMap).psalms;

function pageOf(psalm: number, verse: number): number {
  const entry = PSALM_PAGES[String(psalm)];
  if (typeof entry === "number") return entry;
  let page = 0;
  for (const [start, candidate] of Object.entries(entry ?? {})) {
    if (verse >= Number(start)) page = candidate;
  }
  return page;
}

function plateOf(page: number): string | null {
  return page > 0 ? `psalter/p-${page}.png` : null;
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
      let firstUnitId: string | undefined;
      for (const paragraph of chapter.paragraphs) {
        for (const segment of paragraph.segments) {
          // Segment ids (p1, p1.1) repeat in every psalm, so namespace them
          // with the chapter id to keep ids globally unique for navigation.
          const unitId = `${chapterId}:${segment.id}`;
          if (!firstUnitId) firstUnitId = unitId;
          const verseNo = paragraph.n ? Number(paragraph.n) : null;
          const page = n != null ? pageOf(n, verseNo ?? 1) : 0;
          const facsimile = plateOf(page);
          const label =
            n != null
              ? `Psalmus ${n}${verseNo ? ` · ${verseNo}` : ""}`
              : chapter.title;
          lectio.push({
            id: unitId,
            sourceId: unitId,
            chapterId,
            kind: "section",
            caput: null,
            section: verseNo,
            heading: null,
            latin: segment.latin,
            english: segment.translations.douay ?? "",
            column: page,
            facsimile,
            label,
            part: 1,
            parts: 1,
          });
          if (n != null) {
            studyUnits.push({
              id: unitId,
              kind: "section",
              caput: n,
              section: verseNo,
              heading: null,
              latin: segment.latin,
              english: segment.translations.douay ?? "",
              column: page,
              facsimile,
              label,
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
      if (n != null && firstUnitId) {
        studyChapters.push({
          id: chapterId,
          caput: n,
          capLabel: "Psalmus",
          title: chapter.title,
          firstUnitId,
        });
      }
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
      "The Psalms, one verse at a time — Gallican Latin with the 1662 Coverdale and Challoner Douay-Rheims at hand. Study mode opens the 1861 Clementine page for the psalm.",
    studyEnabled: true,
    lectio,
    chapters,
    study: {
      units: studyUnits,
      chapters: studyChapters,
      mount: "caput",
    },
  };
}

export const psalter: ReaderWork = adapt();

import { psalter as source } from "../psalter/work";
import type { PsalmSlice } from "./cursus";

export type OfficeVerse = {
  n: string;
  latin: string;
  english: string;
};

const byNumber = new Map<number, (typeof source.parts)[number]["chapters"][number]>();
for (const part of source.parts) {
  for (const chapter of part.chapters) {
    if (chapter.number != null) byNumber.set(chapter.number, chapter);
  }
}

/** Verses of a Gallican slice. The Latin is the psalter chapter, not a copy. */
export function sliceVerses(slice: PsalmSlice): OfficeVerse[] {
  const chapter = byNumber.get(slice.psalm);
  if (!chapter) return [];
  const from = slice.from ?? 1;
  const to = slice.to ?? Number.POSITIVE_INFINITY;
  const verses: OfficeVerse[] = [];
  for (const paragraph of chapter.paragraphs) {
    const n = Number(paragraph.n);
    if (!Number.isFinite(n) || n < from || n > to) continue;
    const segment = paragraph.segments[0];
    verses.push({
      n: paragraph.n ?? String(n),
      latin: segment?.latin ?? "",
      english: segment?.translations.douay ?? "",
    });
  }
  return verses;
}

export function sliceLabel(slice: PsalmSlice): string {
  if (slice.from == null || slice.to == null) return `Psalmus ${slice.psalm}`;
  return `Psalmus ${slice.psalm} · ${slice.from}–${slice.to}`;
}

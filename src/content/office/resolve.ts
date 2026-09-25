import { psalter as source } from "../psalter/work";
import type { PsalmSlice } from "./cursus";
import { VERSE_MAP, type OfficeLine, type OfficePiece, type VerseMapEntry } from "./verseMap";

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

type StoredVerse = { latin: string; english: string };

function versesInRange(psalm: number, from: number, to: number): Map<number, StoredVerse> {
  const chapter = byNumber.get(psalm);
  const verses = new Map<number, StoredVerse>();
  if (!chapter) return verses;
  for (const paragraph of chapter.paragraphs) {
    const n = Number(paragraph.n);
    if (!Number.isFinite(n) || n < from || n > to) continue;
    const segment = paragraph.segments[0];
    verses.set(n, {
      latin: segment?.latin ?? "",
      english: segment?.translations.douay ?? "",
    });
  }
  return verses;
}

function cutText(text: string, from?: string, through?: string): string {
  let start = 0;
  if (from) {
    const at = text.indexOf(from);
    if (at < 0) return "";
    start = at;
  }
  let end = text.length;
  if (through) {
    const at = text.indexOf(through, start);
    if (at < 0) return text.slice(start).trim();
    end = at + through.length;
  }
  return text.slice(start, end).trim();
}

function pieceText(piece: OfficePiece, stored: Map<number, StoredVerse>): { latin: string; english: string } {
  const verse = stored.get(piece.verse);
  if (!verse) return { latin: "", english: "" };
  let latin = verse.latin;
  if (piece.dropLatinPrefix && latin.startsWith(piece.dropLatinPrefix)) {
    latin = latin.slice(piece.dropLatinPrefix.length);
  }
  return {
    latin: cutText(latin, piece.latinFrom, piece.latinThrough),
    english: cutText(verse.english, piece.englishFrom, piece.englishThrough),
  };
}

function joinLine(line: OfficeLine, stored: Map<number, StoredVerse>, officeNumber: number): OfficeVerse {
  if (line.pieces) {
    const parts = line.pieces.map((piece) => pieceText(piece, stored));
    return {
      n: String(officeNumber),
      latin: parts.map((part) => part.latin).filter(Boolean).join(" "),
      english: parts.map((part) => part.english).filter(Boolean).join(" "),
    };
  }
  const parts = (line.sources ?? []).map((n) => stored.get(n)!);
  let latin = parts.map((part) => part.latin);
  const prefix = line.dropLatinPrefix;
  if (prefix && latin[0]?.startsWith(prefix)) latin[0] = latin[0].slice(prefix.length);
  return {
    n: String(officeNumber),
    latin: latin.join(" "),
    english: parts.map((part) => part.english).filter(Boolean).join(" "),
  };
}

/**
 * Verses of a Gallican slice, lined out for the Office when this psalm
 * has an entry in VERSE_MAP. Lines outside the slice are dropped, and the
 * lines that remain are numbered from 1. The Latin stays in the psalter chapter.
 */
export function sliceVerses(slice: PsalmSlice): OfficeVerse[] {
  const from = slice.from ?? 1;
  const to = slice.to ?? Number.POSITIVE_INFINITY;
  const stored = versesInRange(slice.psalm, from, to);
  return lineOut(stored, VERSE_MAP[slice.psalm]);
}

function asStored(stored: Map<number, StoredVerse>, dropLatinPrefix?: string): OfficeVerse[] {
  return [...stored.entries()]
    .sort(([a], [b]) => a - b)
    .map(([n, verse]) => {
      let latin = verse.latin;
      if (n === 1 && dropLatinPrefix && latin.startsWith(dropLatinPrefix)) {
        latin = latin.slice(dropLatinPrefix.length);
      }
      return { n: String(n), latin, english: verse.english };
    });
}

function lineOut(stored: Map<number, StoredVerse>, map: VerseMapEntry | undefined): OfficeVerse[] {
  if (!map) return asStored(stored);
  if (!Array.isArray(map)) return asStored(stored, map.dropLatinPrefix);
  const lines: OfficeVerse[] = [];
  for (const line of map) {
    const verses = line.pieces ? line.pieces.map((piece) => piece.verse) : line.sources ?? [];
    if (!verses.every((n) => stored.has(n))) continue;
    lines.push(joinLine(line, stored, lines.length + 1));
  }
  return lines;
}

export function sliceLabel(slice: PsalmSlice): string {
  if (slice.from == null || slice.to == null) return `Psalmus ${slice.psalm}`;
  return `Psalmus ${slice.psalm} · ${slice.from}–${slice.to}`;
}

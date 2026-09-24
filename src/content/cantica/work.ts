import type { Chapter, Segment, Work } from "../schema";
import { scaffoldChapters } from "./scaffold";
import close from "./renderings/close.json";

/**
 * Bernard's sermons on the Song of Songs are wired to the auto-generated
 * Latin scaffold. English is merged from content/cantica/renderings/close.json
 * so regenerating scaffold.ts does not wipe it. Keep latin.md authoritative.
 */

type RenderingFile = {
  source: string;
  chapters: Record<string, Record<string, string>>;
};

function applyRenderings(chapters: Chapter[]): Chapter[] {
  const eng = (close as RenderingFile).chapters;
  return chapters.map((chapter) => {
    const key = String(chapter.number ?? "");
    return {
      ...chapter,
      englishHeading: eng[key]?.title ?? undefined,
      paragraphs: chapter.paragraphs.map((paragraph) => ({
        ...paragraph,
        segments: paragraph.segments.map(
          (segment): Segment => ({
            ...segment,
            translations: {
              close: eng[key]?.[paragraph.n ?? ""] ?? "",
            },
          }),
        ),
      })),
    };
  });
}

const renderedChapters = applyRenderings(scaffoldChapters);

function numbered(lo: number, hi: number): Chapter[] {
  return renderedChapters.filter(
    (chapter) => chapter.number !== undefined && chapter.number >= lo && chapter.number <= hi,
  );
}

const GROUPS: Array<[string, string, number, number]> = [
  ["s1-20", "Sermones 1–20", 1, 20],
  ["s21-46", "Sermones 21–46", 21, 46],
  ["s47-66", "Sermones 47–66", 47, 66],
  ["s67-86", "Sermones 67–86", 67, 86],
];

export const cantica: Work = {
  id: "cantica",
  title: "Sermons on the Song of Songs",
  latinTitle: "Sermones in Cantica Canticorum",
  source:
    "Working Latin in content/cantica/latin.md (Patrologia Latina 183). The app never edits this file.",
  edition:
    "Patrologia Latina 183, cols. 785–1198, via Documenta Catholica Omnia. Bernard died in 1153; the 86 sermons reach Song 3:1.",
  translations: [
    {
      id: "close",
      label: "Close English",
      note: "A close, sentence-aligned English rendering made for the lectio reader: one English sentence per Latin sentence, so each lectio page pairs its Latin and English as one unit.",
    },
  ],
  parts: GROUPS.map(([id, title, lo, hi]) => ({
    id,
    title,
    chapters: numbered(lo, hi),
  })),
};

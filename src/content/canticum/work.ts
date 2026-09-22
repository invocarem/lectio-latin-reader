import type { Chapter, Segment, Work } from "../schema";
import { scaffoldChapters } from "./scaffold";
import douay from "./renderings/douay.json";

/**
 * Canticum Canticorum is wired to the auto-generated Latin scaffold. English
 * is merged from content/canticum/renderings/douay.json so regenerating
 * scaffold.ts does not wipe it. Keep latin.md authoritative.
 */

type RenderingFile = {
  source: string;
  chapters: Record<string, Record<string, string>>;
};

function applyRenderings(chapters: Chapter[]): Chapter[] {
  const eng = (douay as RenderingFile).chapters;
  return chapters.map((chapter) => {
    const key = String(chapter.number ?? "");
    return {
      ...chapter,
      paragraphs: chapter.paragraphs.map((paragraph) => ({
        ...paragraph,
        segments: paragraph.segments.map(
          (segment): Segment => ({
            ...segment,
            translations: {
              douay: eng[key]?.[paragraph.n ?? ""] ?? "",
            },
          }),
        ),
      })),
    };
  });
}

const renderedChapters = applyRenderings(scaffoldChapters);

export const canticum: Work = {
  id: "canticum",
  title: "Canticle of Canticles",
  latinTitle: "Canticum Canticorum",
  source:
    "Working Latin in content/canticum/latin.md (Vulgata Clementina). The app never edits this file.",
  edition:
    "Vulgata Clementina — Canticum Canticorum, per la.wikisource.org (The Clementine Vulgate Project).",
  translations: [
    {
      id: "douay",
      label: "Douay-Rheims (Challoner)",
      year: 1750,
      note: "Douay-Rheims, Challoner revision (1749–52). Public domain (Project Gutenberg #8324). Because it translates the Vulgate it aligns 1:1 with the working Clementine Latin.",
    },
  ],
  parts: [
    {
      id: "canticum",
      title: "Canticum Canticorum",
      chapters: renderedChapters,
    },
  ],
};

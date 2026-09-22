export type UnitKind =
  | "title"
  | "retractatio"
  | "praefatio"
  | "chapter-title"
  | "section";

export type LectioChunk = {
  id: string;
  part: number;
  parts: number;
  latin: string;
  english: string;
};

export type Unit = {
  id: string;
  kind: UnitKind;
  caput: number | null;
  section: number | null;
  heading: string | null;
  latin: string;
  english: string;
  column: number;
  facsimile: string | null;
  label: string;
  chunks?: LectioChunk[];
};

export type LectioUnit = Unit & {
  sourceId: string;
  part: number;
  parts: number;
  /** Chapter id used for TOC highlighting; set by each work's adapter. */
  chapterId?: string;
};

export type ReaderMode = "lectio" | "study";

/** Unique id of a registered library work. */
export type WorkId = "gradibus" | "psalter" | "rule" | "confessions";

/** A TOC chapter (a psalm, a treatise caput, etc.). */
export type Chapter = {
  id: string;
  caput: number | null;
  title: string;
  /** A Lectio unit id — the first readable unit inside this chapter. */
  firstUnitId: string;
};

/**
 * The reader-facing shape every work module exposes, normalized so the
 * Lectio and Study readers can be driven by it regardless of how each
 * work's content is stored.
 */
export type ReaderWork = {
  id: WorkId;
  latinTitle: string;
  englishTitle: string;
  authorLatin?: string;
  authorEnglish?: string;
  edition?: string;
  brandShort: string;
  brandLine: string;
  intro?: string;
  /** Per-work opt-in for Study mode (and subject to platform gating). */
  studyEnabled: boolean;
  /** One short reading at a time for Lectio. */
  lectio: LectioUnit[];
  /** TOC navigation for Lectio. */
  chapters: Chapter[];
  /** Flat units + chapters for Study mode, present only when studyEnabled. */
  study?: { units: Unit[]; chapters: Chapter[] };
};

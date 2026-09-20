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
};

export type ReaderMode = "lectio" | "study";

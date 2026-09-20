export type UnitKind =
  | "title"
  | "retractatio"
  | "praefatio"
  | "chapter-title"
  | "section";

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
};

/** One step of the psalter course. A whole psalm is one slice. A divided psalm is one slice per part. */

export const PSALM_118_LETTERS = [
  "aleph",
  "beth",
  "ghimel",
  "daleth",
  "he",
  "vau",
  "zain",
  "heth",
  "teth",
  "iod",
  "caph",
  "lamed",
  "mem",
  "nun",
  "samech",
  "ain",
  "phe",
  "sade",
  "coph",
  "res",
  "sin",
  "tau",
] as const;

export type Psalm118Letter = (typeof PSALM_118_LETTERS)[number];

/** Numeric half (`1`, `2`) or a Psalm 118 letter. Absent on a whole psalm. */
export type SlicePart = number | Psalm118Letter;

export type Slice = {
  psalm: number;
  part?: SlicePart;
};

/** The course's step id. Psalm 36's first half is `36:1`. Aleph is `118:aleph`. */
export function sliceId(slice: Slice): string {
  return slice.part == null ? String(slice.psalm) : `${slice.psalm}:${slice.part}`;
}

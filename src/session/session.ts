import type { OfficeHour, Weekday } from "../content/office/when";
import { sliceId, type Slice, type SlicePart } from "./slice";

export type SessionPace = 7 | 14;

/** The cursus place last opened. A daily psalm omits the weekday. */
export type SessionCursor = {
  weekday?: Weekday;
  hour: OfficeHour;
  psalm: number;
  part?: SlicePart;
};

/** One slice sat with. The same slice is stored once; `at` is the first day. */
export type Sitting = {
  psalm: number;
  part?: SlicePart;
  weekday?: Weekday;
  hour?: OfficeHour;
  at: string;
};

export type SessionFile = {
  id: string;
  work: "psalter";
  pace: SessionPace;
  started: string;
  cursor: SessionCursor | null;
  satWith: Sitting[];
  highlights: { psalm: number; line: string }[];
  notes: { psalm: number; line: string; text: string; at: string }[];
};

export function localDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/** Whole days from `started` to `today`. Both are `YYYY-MM-DD`. */
export function daysBetween(started: string, today: string): number {
  const [ys, ms, ds] = started.split("-").map(Number);
  const [yt, mt, dt] = today.split("-").map(Number);
  const from = Date.UTC(ys, ms - 1, ds);
  const to = Date.UTC(yt, mt - 1, dt);
  return Math.round((to - from) / 86_400_000);
}

export function startSession(today: string, pace: SessionPace = 14): SessionFile {
  return {
    id: today,
    work: "psalter",
    pace,
    started: today,
    cursor: null,
    satWith: [],
    highlights: [],
    notes: [],
  };
}

function isSitting(value: unknown): value is Sitting {
  if (!value || typeof value !== "object") return false;
  const sitting = value as Sitting;
  return typeof sitting.psalm === "number" && typeof sitting.at === "string";
}

/** Read a session file. Returns null when the text is not this cursus pass. */
export function sessionFromJson(raw: string): SessionFile | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    const session = parsed as SessionFile;
    if (session.work !== "psalter") return null;
    if (session.pace !== 7 && session.pace !== 14) return null;
    if (typeof session.started !== "string" || typeof session.id !== "string") return null;
    if (!Array.isArray(session.satWith) || !session.satWith.every(isSitting)) return null;
    return {
      ...session,
      cursor: session.cursor ?? null,
      highlights: Array.isArray(session.highlights) ? session.highlights : [],
      notes: Array.isArray(session.notes) ? session.notes : [],
    };
  } catch {
    return null;
  }
}

export function sittingSlice(sitting: Sitting): Slice {
  return sitting.part == null ? { psalm: sitting.psalm } : { psalm: sitting.psalm, part: sitting.part };
}

export function countDone(session: SessionFile): number {
  return new Set(session.satWith.map((sitting) => sliceId(sittingSlice(sitting)))).size;
}

const DAILY = new Set([3, 4, 50, 66, 90, 94, 133, 148, 149, 150]);

export function isDailyPsalm(psalm: number): boolean {
  return DAILY.has(psalm);
}

export function cursorFrom(place: {
  weekday: Weekday;
  hour: OfficeHour;
  slice: Slice;
}): SessionCursor {
  const cursor: SessionCursor = {
    hour: place.hour,
    psalm: place.slice.psalm,
  };
  if (!isDailyPsalm(place.slice.psalm)) cursor.weekday = place.weekday;
  if (place.slice.part != null) cursor.part = place.slice.part;
  return cursor;
}

function sittingFrom(
  place: { weekday: Weekday; hour: OfficeHour; slice: Slice },
  on: string,
): Sitting {
  const sitting: Sitting = {
    psalm: place.slice.psalm,
    hour: place.hour,
    at: on,
  };
  if (!isDailyPsalm(place.slice.psalm)) sitting.weekday = place.weekday;
  if (place.slice.part != null) sitting.part = place.slice.part;
  return sitting;
}

/** Remember the place. A slice already sat with keeps its first date. */
export function choosePlace(
  session: SessionFile,
  place: { weekday: Weekday; hour: OfficeHour; slice: Slice },
): SessionFile {
  return { ...session, cursor: cursorFrom(place) };
}

/** Mark the slice sat with on `on`, and leave the cursor on that place. */
export function sitWith(
  session: SessionFile,
  place: { weekday: Weekday; hour: OfficeHour; slice: Slice },
  on: string,
): SessionFile {
  const id = sliceId(place.slice);
  const already = session.satWith.some((sitting) => sliceId(sittingSlice(sitting)) === id);
  const cursor = cursorFrom(place);
  if (already) return { ...session, cursor };
  return { ...session, cursor, satWith: [...session.satWith, sittingFrom(place, on)] };
}

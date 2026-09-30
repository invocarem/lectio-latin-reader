/**
 * The psalter course on the weekly cursus (what the user calls "cursus").
 *
 * A step is a place in the cursus: a weekday and hour and psalm, except for a
 * psalm said every day, which is one step by hour and psalm. A divided psalm
 * counts each slice (Psalm 36 is two, Psalm 118 is twenty-two). Psalms 115 and
 * 116 share a Vespers slot and are two slices.
 *
 * `total` counts the distinct slices over the whole week — the same number for
 * a seven-day or a fourteen-day pass, because the fortnight only redistributes
 * the same Vigils slices. `next` walks the cursus on from the cursor.
 */

import { hourSlots, type PsalmSlice } from "../content/office/cursus";
import { sliceLabel } from "../content/office/resolve";
import { OFFICE_HOURS, WEEKDAYS, type OfficeHour, type Weekday } from "../content/office/when";
import type { SessionCourse } from "./course";

/** Psalms said every day (whole), each one a single slice in the pass. */
const DAILY = new Set([3, 4, 50, 66, 90, 94, 133, 148, 149, 150]);

export type SessionPace = 7 | 14;

/** A place opened in the cursus: what it is, where it lives, and its step. */
export type CursusPlace = {
  step: string;
  /** The slice identity that counts (dedupes daily and divided slices). */
  key: string;
  slice: PsalmSlice;
  /** Null for a daily psalm, which is offered every day under its hour. */
  weekday: Weekday | null;
  hour: OfficeHour;
  /** Which half a Vigils slice belongs to in a fortnight (0 = first six). */
  half: 0 | 1;
};

/** The slice identity. A whole psalm is its number; a divided psalm adds the range. */
export function sliceKey(slice: PsalmSlice): string {
  return slice.from == null ? String(slice.psalm) : `${slice.psalm}:${slice.from}-${slice.to}`;
}

export function encodeStep(
  weekday: Weekday | null,
  hour: OfficeHour,
  psalm: number,
  from?: number,
  to?: number,
): string {
  const range = from == null ? "" : `:${from}-${to}`;
  if (weekday == null) return `${hour}:${psalm}${range}`;
  return `${weekday}:${hour}:${psalm}${range}`;
}

export type ParsedStep = {
  weekday: Weekday | null;
  hour: OfficeHour;
  psalm: number;
  from?: number;
  to?: number;
};

export function parseStep(step: string): ParsedStep {
  const parts = step.split(":");
  let weekday: Weekday | null = null;
  let idx = 0;
  if (WEEKDAYS.includes(parts[0] as Weekday)) {
    weekday = parts[0] as Weekday;
    idx = 1;
  }
  const hour = parts[idx] as OfficeHour;
  const psalm = Number(parts[idx + 1]);
  let from: number | undefined;
  let to: number | undefined;
  if (parts[idx + 2]) {
    const [f, t] = parts[idx + 2].split("-").map(Number);
    from = f;
    to = t;
  }
  return { weekday, hour, psalm, from, to };
}

function buildPlaces(): CursusPlace[] {
  const places: CursusPlace[] = [];
  for (const weekday of WEEKDAYS) {
    for (const hour of OFFICE_HOURS) {
      const slots = hourSlots(weekday, hour);
      for (let si = 0; si < slots.length; si++) {
        for (const slice of slots[si].slices) {
          const daily = DAILY.has(slice.psalm) && slice.from == null;
          const key = sliceKey(slice);
          // In a fortnight the two sixes of each Vigils split the pass: the
          // first six (slots 2..7, after Psalms 3 and 94) in the first half,
          // the second six (slots 8..13) in the second. Day hours are first half.
          let half: 0 | 1 = 0;
          if (hour === "vigils" && !daily) half = si < 8 ? 0 : 1;
          places.push({
            step: encodeStep(daily ? null : weekday, hour, slice.psalm, slice.from, slice.to),
            key,
            slice,
            weekday: daily ? null : weekday,
            hour,
            half,
          });
        }
      }
    }
  }
  return places;
}

/** Every place in the week's cursus, in weekday then hour order. */
export const ALL_PLACES: CursusPlace[] = buildPlaces();

/** Distinct slices finish a pass, shared by both paces. */
const TOTAL = new Set(ALL_PLACES.map((place) => place.key)).size;

export function keyOfStep(step: string): string {
  const { psalm, from, to } = parseStep(step);
  return sliceKey({ psalm, from, to });
}

export const cursusCourse: SessionCourse = {
  total: () => TOTAL,
  next: (cursor, satWith) => nextStep(cursor, satWith),
};

/** The next place to open, walking the week on from `cursor`. */
export function nextStep(cursor: string | null, satWith: readonly string[]): string | null {
  const sat = new Set(satWith.map(keyOfStep));
  const open = ALL_PLACES.filter((place) => !sat.has(place.key));
  if (open.length === 0) return null;
  if (cursor == null) return open[0].step;
  const start = ALL_PLACES.findIndex((place) => place.step === cursor);
  if (start < 0) return open[0].step;
  const after = ALL_PLACES.slice(start + 1).concat(ALL_PLACES.slice(0, start + 1));
  for (const place of after) {
    if (!sat.has(place.key)) return place.step;
  }
  return null;
}

/** Civil "YYYY-MM-DD" for a local date (padded). */
export function isoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Whole civil days from `start` to `date` (0 on the start day). */
export function daysFrom(start: string, date: string): number {
  const [sy, sm, sd] = start.split("-").map(Number);
  const [yy, mm, dd] = date.split("-").map(Number);
  const a = Date.UTC(sy, sm - 1, sd);
  const b = Date.UTC(yy, mm - 1, dd);
  return Math.round((b - a) / 86_400_000);
}

/** A place as the session panel shows it. */
export type OpenPlace = {
  step: string;
  key: string;
  label: string;
  isToday: boolean;
  weekday: Weekday | null;
  hour: OfficeHour;
  psalm: number;
};

export const WEEKDAY_LABEL: Record<Weekday, string> = {
  sun: "Sunday",
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
};

export const HOUR_LABEL: Record<OfficeHour, string> = {
  vigils: "Vigils",
  lauds: "Lauds",
  prime: "Prime",
  terce: "Terce",
  sext: "Sext",
  none: "None",
  vespers: "Vespers",
  compline: "Compline",
};

export function placeLabel(place: CursusPlace): string {
  const where = place.weekday != null ? `${WEEKDAY_LABEL[place.weekday]} · ` : "";
  const psalm = psalmLabel(place);
  return `${where}${HOUR_LABEL[place.hour]} · ${psalm}`;
}

/**
 * A psalm-only label for a place, e.g. "Psalmus 10", "Psalmus 118 · Aleph",
 * or "Psalmus 9 · 1". Divided psalms use their name (the Psalm 118 section
 * letter, or the part number) instead of the verse range.
 */
export function psalmLabel(place: CursusPlace): string {
  return sliceLabel(place.slice);
}

/**
 * The full cursus for one weekday, in hour order. Daily psalms (said every
 * day) are included once at their hour. This is the locator the session panel
 * browses; it shows every psalm of the weekday, whether or not it has been
 * sat with in the current pass.
 */
export function dayPlaces(weekday: Weekday): CursusPlace[] {
  const result: CursusPlace[] = [];
  for (const hour of OFFICE_HOURS) {
    const slots = hourSlots(weekday, hour);
    for (let si = 0; si < slots.length; si++) {
      for (const slice of slots[si].slices) {
        const daily = DAILY.has(slice.psalm) && slice.from == null;
        let half: 0 | 1 = 0;
        if (hour === "vigils" && !daily) half = si < 8 ? 0 : 1;
        result.push({
          step: encodeStep(daily ? null : weekday, hour, slice.psalm, slice.from, slice.to),
          key: sliceKey(slice),
          slice,
          weekday: daily ? null : weekday,
          hour,
          half,
        });
      }
    }
  }
  return result;
}

/**
 * Every place in the week that holds `psalm`, deduped by slice key, in cursus
 * order. Psalm 10 is found under its own weekday (Wednesday Prime). A daily
 * psalm is returned once. A divided psalm returns each of its slices.
 */
export function psalmPlaces(psalm: number): CursusPlace[] {
  const seen = new Set<string>();
  const result: CursusPlace[] = [];
  for (const place of ALL_PLACES) {
    if (place.slice.psalm !== psalm) continue;
    if (seen.has(place.key)) continue;
    seen.add(place.key);
    result.push(place);
  }
  return result;
}

function dayContext(pace: SessionPace, started: string, today: string) {
  const day = daysFrom(started, today);
  const todayHalf: 0 | 1 = pace === 14 ? (day < 7 ? 0 : 1) : 0;
  const todayWeekday = WEEKDAYS[(((day % 7) + 7) % 7)];
  return { todayHalf, todayWeekday, todayIndex: WEEKDAYS.indexOf(todayWeekday) };
}

/**
 * The places open today, with today's offered first and earlier open places
 * under their own weekday and hour. Daily psalms are always open.
 */
export function openPlaces(
  pace: SessionPace,
  started: string,
  today: string,
  satWith: readonly string[],
): OpenPlace[] {
  const sat = new Set(satWith.map(keyOfStep));
  const { todayHalf, todayIndex } = dayContext(pace, started, today);
  const result: OpenPlace[] = [];
  const seen = new Set<string>();

  for (const place of ALL_PLACES) {
    if (sat.has(place.key)) continue;
    // A daily psalm appears at its hour on every weekday but is one slice:
    // list it once, not once per weekday.
    if (seen.has(place.key)) continue;
    seen.add(place.key);
    let available = false;
    let isToday = false;
    if (place.weekday == null) {
      // Daily psalm: always offered.
      available = true;
      isToday = true;
    } else {
      const placeIndex = WEEKDAYS.indexOf(place.weekday);
      if (pace === 7) {
        available = placeIndex <= todayIndex;
        isToday = placeIndex === todayIndex;
      } else if (pace === 14) {
        if (place.half === 0) {
          available = todayHalf === 1 || placeIndex <= todayIndex;
          isToday = todayHalf === 0 && placeIndex === todayIndex;
        } else {
          available = todayHalf === 1;
          isToday = todayHalf === 1 && placeIndex === todayIndex;
        }
      }
    }
    if (!available) continue;
    result.push({
      step: place.step,
      key: place.key,
      label: placeLabel(place),
      isToday,
      weekday: place.weekday,
      hour: place.hour,
      psalm: place.slice.psalm,
    });
  }

  const sortRank = (place: OpenPlace) => {
    const weekdayIndex = place.weekday ? WEEKDAYS.indexOf(place.weekday) : 999;
    const hourIndex = OFFICE_HOURS.indexOf(place.hour);
    const placeHalf = pace === 14 ? (place.weekday == null ? -1 : dayHalfOf(place.hour, place.weekday)) : 0;
    return {
      today: place.isToday ? 0 : 1,
      half: placeHalf,
      weekday: weekdayIndex,
      hour: hourIndex,
    };
  };

  result.sort((a, b) => {
    const ra = sortRank(a);
    const rb = sortRank(b);
    return ra.today - rb.today || ra.half - rb.half || ra.weekday - rb.weekday || ra.hour - rb.hour;
  });
  return result;
}

/** Which pass-half a fixed office place belongs to in a fortnight. */
function dayHalfOf(hour: OfficeHour, weekday: Weekday): 0 | 1 {
  const place = ALL_PLACES.find((p) => p.hour === hour && p.weekday === weekday);
  return place ? place.half : 0;
}

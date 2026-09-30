import { hourSlots } from "../content/office/cursus";
import type { PsalmSlice } from "../content/office/cursus";
import { hourLines, sliceLabel } from "../content/office/resolve";
import { OFFICE_HOURS, WEEKDAYS, type OfficeHour, type Weekday } from "../content/office/when";
import type { SessionCourse } from "./course";
import { daysBetween, isDailyPsalm } from "./session";
import { PSALM_118_LETTERS, sliceId, type Slice } from "./slice";

export type SliceBand = "opening" | "first" | "second" | "day";

/** A slice as the cursus places it. `label` is the Office heading. */
export type OfferedPlace = {
  weekday: Weekday;
  hour: OfficeHour;
  slice: Slice;
  band: SliceBand;
  label: string;
};

export function sliceFromCursus(raw: PsalmSlice): Slice {
  if (raw.psalm === 118 && raw.from != null) {
    const index = (raw.from - 1) / 8;
    const letter = PSALM_118_LETTERS[index];
    if (Number.isInteger(index) && letter) return { psalm: 118, part: letter };
  }
  if (raw.part != null) return { psalm: raw.psalm, part: raw.part };
  return { psalm: raw.psalm };
}

function vigilsBand(slotIndex: number): SliceBand {
  if (slotIndex < 2) return "opening";
  if (slotIndex < 8) return "first";
  return "second";
}

function placesOn(weekday: Weekday): OfferedPlace[] {
  const places: OfferedPlace[] = [];
  for (const hour of OFFICE_HOURS) {
    const slots = hourSlots(weekday, hour);
    slots.forEach((slot, slotIndex) => {
      const band = hour === "vigils" ? vigilsBand(slotIndex) : "day";
      for (const raw of slot.slices) {
        places.push({
          weekday,
          hour,
          slice: sliceFromCursus(raw),
          band,
          label: sliceLabel(raw),
        });
      }
    });
  }
  return places;
}

let cached: OfferedPlace[] | null = null;

function allPlaces(): OfferedPlace[] {
  if (cached) return cached;
  cached = WEEKDAYS.flatMap((weekday) => placesOn(weekday));
  return cached;
}

let cachedSlices: Slice[] | null = null;

/** Distinct slices in cursus order. A daily psalm appears once. */
export function psalterSlices(): Slice[] {
  if (cachedSlices) return cachedSlices;
  const seen = new Set<string>();
  const slices: Slice[] = [];
  for (const place of allPlaces()) {
    const id = sliceId(place.slice);
    if (seen.has(id)) continue;
    seen.add(id);
    slices.push(place.slice);
  }
  cachedSlices = slices;
  return slices;
}

function inWindow(
  place: OfferedPlace,
  pace: 7 | 14,
  half: 0 | 1,
  sat: ReadonlySet<string>,
  today: Weekday,
): boolean {
  if (isDailyPsalm(place.slice.psalm) && place.weekday === today) return true;
  if (pace === 7) return true;
  if (half === 0) return place.band !== "second";
  if (place.band === "second") return true;
  return !sat.has(sliceId(place.slice));
}

/**
 * Places the person may open. Today's hours come first, then earlier days
 * in the pass, then later days. A slice sat with drops out, except a daily
 * psalm, which stays on today's hour.
 */
export function offeredPlaces(input: {
  weekday: Weekday;
  started: string;
  today: string;
  pace: 7 | 14;
  satWith: readonly string[];
}): OfferedPlace[] {
  const sat = new Set(input.satWith);
  const half: 0 | 1 = input.pace === 14 && daysBetween(input.started, input.today) >= 7 ? 1 : 0;
  const todayAt = WEEKDAYS.indexOf(input.weekday);
  const todayPlaces: OfferedPlace[] = [];
  const earlier: OfferedPlace[] = [];
  const later: OfferedPlace[] = [];

  for (const place of allPlaces()) {
    if (!inWindow(place, input.pace, half, sat, input.weekday)) continue;
    const id = sliceId(place.slice);
    if (isDailyPsalm(place.slice.psalm)) {
      if (place.weekday !== input.weekday) continue;
    } else if (sat.has(id)) {
      continue;
    }
    const at = WEEKDAYS.indexOf(place.weekday);
    if (at === todayAt) todayPlaces.push(place);
    else if (at < todayAt) earlier.push(place);
    else later.push(place);
  }
  return [...todayPlaces, ...earlier, ...later];
}

export function createPsalterCourse(input: {
  weekday: Weekday;
  started: string;
  today: string;
  pace: 7 | 14;
}): SessionCourse {
  return {
    total: () => psalterSlices().length,
    next(cursor, satWith) {
      const places = offeredPlaces({ ...input, satWith });
      if (places.length === 0) return null;
      const openAfter = (from: number) =>
        places.slice(from).find((place) => !satWith.includes(sliceId(place.slice)));
      if (cursor == null) {
        const open = openAfter(0);
        return sliceId((open ?? places[0]).slice);
      }
      const at = places.findIndex((place) => sliceId(place.slice) === cursor);
      const open = openAfter(at < 0 ? 0 : at + 1);
      if (open) return sliceId(open.slice);
      const following = at >= 0 ? places[at + 1] : undefined;
      return following ? sliceId(following.slice) : null;
    },
  };
}

/** First office-lectio line of this place, or 0 when the hour has no such line. */
export function lectioIndex(place: OfferedPlace): number {
  const lines = hourLines(place.weekday, place.hour);
  const index = lines.findIndex((line) => line.label === place.label);
  return index < 0 ? 0 : index;
}

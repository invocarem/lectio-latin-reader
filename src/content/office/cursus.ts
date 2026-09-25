import type { OfficeHour, Weekday } from "./when";
import { OFFICE_HOURS, WEEKDAYS } from "./when";

/** A Gallican verse range. Omit `from` / `to` to take the whole psalm. */
export type PsalmSlice = {
  psalm: number;
  from?: number;
  to?: number;
};

/** One step in an hour. Joined psalms (115 with 116) share a slot. */
export type OfficeSlot = {
  slices: PsalmSlice[];
  /** Ferial Vigils twelve, custom under chapter 18. Psalm 3 and 94 are not custom. */
  custom?: boolean;
};

const whole = (psalm: number): PsalmSlice => ({ psalm });
const cut = (psalm: number, from: number, to: number): PsalmSlice => ({ psalm, from, to });

/** Psalm 118, one section of eight verses. Section 1 is verses 1–8. */
function p118(section: number): PsalmSlice {
  return cut(118, (section - 1) * 8 + 1, section * 8);
}

function sections(from: number, count: number): OfficeSlot[] {
  return Array.from({ length: count }, (_, i) => slot(p118(from + i)));
}

function slot(...slices: PsalmSlice[]): OfficeSlot {
  return { slices };
}

/** Received vigils distribution under chapter 18, not a verse of the Rule. */
function custom(...slices: PsalmSlice[]): OfficeSlot {
  return { slices, custom: true };
}

const COMPLINE: OfficeSlot[] = [slot(whole(4)), slot(whole(90)), slot(whole(133))];

const LAUDS_CLOSE: OfficeSlot[] = [slot(whole(148)), slot(whole(149)), slot(whole(150))];

function lauds(variable: number[]): OfficeSlot[] {
  return [slot(whole(66)), slot(whole(50)), ...variable.map((psalm) => slot(whole(psalm))), ...LAUDS_CLOSE];
}

const LITTLE_HOURS_WEEK: Record<"terce" | "sext" | "none", OfficeSlot[]> = {
  terce: [slot(whole(119)), slot(whole(120)), slot(whole(121))],
  sext: [slot(whole(122)), slot(whole(123)), slot(whole(124))],
  none: [slot(whole(125)), slot(whole(126)), slot(whole(127))],
};

function vigils(first: OfficeSlot[], second: OfficeSlot[]): OfficeSlot[] {
  return [slot(whole(3)), slot(whole(94)), ...first, ...second];
}

/**
 * Even splits of the longer vigils and vespers psalms, taken from the
 * verse counts in latin.md. The first half keeps the extra verse when the
 * count is odd. Psalms 9 and 17 are the Rule's Prime cuts, not these halves.
 * Psalm 144 follows the Vespers division after verse 9.
 */
const HALF = {
  32: [cut(32, 1, 11), cut(32, 12, 22)],
  36: [cut(36, 1, 20), cut(36, 21, 40)],
  39: [cut(39, 1, 9), cut(39, 10, 18)],
  43: [cut(43, 1, 13), cut(43, 14, 26)],
  67: [cut(67, 1, 18), cut(67, 19, 36)],
  68: [cut(68, 1, 19), cut(68, 20, 37)],
  72: [cut(72, 1, 14), cut(72, 15, 28)],
  73: [cut(73, 1, 12), cut(73, 13, 23)],
  77: [cut(77, 1, 36), cut(77, 37, 72)],
  138: [cut(138, 1, 12), cut(138, 13, 24)],
  143: [cut(143, 1, 8), cut(143, 9, 15)],
  144: [cut(144, 1, 9), cut(144, 10, 21)],
} as const;

const CURSUS: Record<Weekday, Record<OfficeHour, OfficeSlot[]>> = {
  sun: {
    vigils: vigils(
      [20, 21, 22, 23, 24, 25].map((psalm) => slot(whole(psalm))),
      [26, 27, 28, 29, 30, 31].map((psalm) => slot(whole(psalm))),
    ),
    lauds: lauds([117, 62]),
    prime: sections(1, 4),
    terce: sections(5, 3),
    sext: sections(8, 3),
    none: sections(11, 3),
    vespers: [109, 110, 111, 112].map((psalm) => slot(whole(psalm))),
    compline: COMPLINE,
  },
  mon: {
    vigils: vigils(
      [custom(HALF[32][0]), custom(HALF[32][1]), custom(whole(33)), custom(whole(34)), custom(HALF[36][0]), custom(HALF[36][1])],
      [custom(whole(37)), custom(whole(38)), custom(HALF[39][0]), custom(HALF[39][1]), custom(whole(40)), custom(whole(41))],
    ),
    lauds: lauds([5, 35]),
    prime: [slot(whole(1)), slot(whole(2)), slot(whole(6))],
    terce: sections(14, 3),
    sext: sections(17, 3),
    none: sections(20, 3),
    vespers: [slot(whole(113)), slot(whole(114)), slot(whole(115), whole(116)), slot(whole(128))],
    compline: COMPLINE,
  },
  tue: {
    vigils: vigils(
      [custom(HALF[43][0]), custom(HALF[43][1]), custom(whole(44)), custom(whole(45)), custom(whole(46)), custom(whole(47))],
      [48, 49, 51, 52, 53, 54].map((psalm) => custom(whole(psalm))),
    ),
    lauds: lauds([42, 56]),
    prime: [slot(whole(7)), slot(whole(8)), slot(cut(9, 2, 19))],
    ...LITTLE_HOURS_WEEK,
    vespers: [129, 130, 131, 132].map((psalm) => slot(whole(psalm))),
    compline: COMPLINE,
  },
  wed: {
    vigils: vigils(
      [55, 57, 58, 59, 60, 61].map((psalm) => custom(whole(psalm))),
      [custom(whole(65)), custom(HALF[67][0]), custom(HALF[67][1]), custom(HALF[68][0]), custom(HALF[68][1]), custom(whole(69))],
    ),
    lauds: lauds([63, 64]),
    prime: [slot(cut(9, 20, 39)), slot(whole(10)), slot(whole(11))],
    ...LITTLE_HOURS_WEEK,
    vespers: [134, 135, 136, 137].map((psalm) => slot(whole(psalm))),
    compline: COMPLINE,
  },
  thu: {
    vigils: vigils(
      [custom(whole(70)), custom(whole(71)), custom(HALF[72][0]), custom(HALF[72][1]), custom(HALF[73][0]), custom(HALF[73][1])],
      [custom(whole(74)), custom(whole(76)), custom(HALF[77][0]), custom(HALF[77][1]), custom(whole(78)), custom(whole(79))],
    ),
    lauds: lauds([87, 89]),
    prime: [slot(whole(12)), slot(whole(13)), slot(whole(14))],
    ...LITTLE_HOURS_WEEK,
    vespers: [slot(HALF[138][0]), slot(HALF[138][1]), slot(whole(139)), slot(whole(140))],
    compline: COMPLINE,
  },
  fri: {
    vigils: vigils(
      [80, 81, 82, 83, 84, 85].map((psalm) => custom(whole(psalm))),
      [86, 88, 92, 93, 95, 96].map((psalm) => custom(whole(psalm))),
    ),
    lauds: lauds([75, 91]),
    prime: [slot(whole(15)), slot(whole(16)), slot(cut(17, 2, 25))],
    ...LITTLE_HOURS_WEEK,
    vespers: [slot(whole(141)), slot(HALF[143][0]), slot(HALF[143][1]), slot(HALF[144][0])],
    compline: COMPLINE,
  },
  sat: {
    vigils: vigils(
      [97, 98, 99, 100, 101, 102].map((psalm) => custom(whole(psalm))),
      [103, 104, 105, 106, 107, 108].map((psalm) => custom(whole(psalm))),
    ),
    lauds: lauds([142]),
    prime: [slot(cut(17, 26, 51)), slot(whole(18)), slot(whole(19))],
    ...LITTLE_HOURS_WEEK,
    vespers: [slot(HALF[144][1]), slot(whole(145)), slot(whole(146)), slot(whole(147))],
    compline: COMPLINE,
  },
};

export function hourSlots(weekday: Weekday, hour: OfficeHour): OfficeSlot[] {
  return CURSUS[weekday][hour];
}

/** Every psalm number assigned in the week, including daily repeats. */
export function psalmsInWeek(): number[] {
  const numbers: number[] = [];
  for (const day of WEEKDAYS) {
    for (const hour of OFFICE_HOURS) {
      for (const officeSlot of hourSlots(day, hour)) {
        for (const slice of officeSlot.slices) numbers.push(slice.psalm);
      }
    }
  }
  return numbers;
}

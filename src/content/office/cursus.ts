import type { OfficeHour, Weekday } from "./when";
import { OFFICE_HOURS, WEEKDAYS } from "./when";

/** A Gallican verse range. Omit `from` / `to` to take the whole psalm. */
export type PsalmSlice = {
  psalm: number;
  from?: number;
  to?: number;
  /** Display label override when a psalm is sung in parts, e.g. 138/1. */
  part?: number;
};

/** One step in an hour. Joined psalms (115 with 116) share a slot. */
export type OfficeSlot = {
  slices: PsalmSlice[];
  /** Ferial Vigils twelve, custom under chapter 18. Psalm 3 and 94 are not custom. */
  custom?: boolean;
};

const whole = (psalm: number): PsalmSlice => ({ psalm });
const cut = (psalm: number, from: number, to: number): PsalmSlice => ({ psalm, from, to });
const part = (psalm: number, n: number, from: number, to: number): PsalmSlice => ({
  psalm,
  from,
  to,
  part: n,
});

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
 * Benedictine divisio of the longer vigils and vespers psalms, from Kate
 * Edwards' Matins table and the Vespers cuts. Psalms 9 and 17 are the
 * Rule's Prime cuts, not these halves. Vigils breaks: 36 after 26, 67 after
 * 18, 68 after 19, 77 after 35, 88 after 19, 103 after 24, 104 after 22,
 * 105 after 31, 106 after 24. Psalm 144 follows the Vespers division after
 * verse 9.
 */
const HALF = {
  36: [cut(36, 1, 26), cut(36, 27, 40)],
  67: [cut(67, 1, 18), cut(67, 19, 36)],
  68: [cut(68, 1, 19), cut(68, 20, 37)],
  77: [cut(77, 1, 35), cut(77, 36, 72)],
  88: [part(88, 1, 1, 19), part(88, 2, 20, 53)],
  103: [cut(103, 1, 24), cut(103, 25, 35)],
  104: [cut(104, 1, 22), cut(104, 23, 45)],
  105: [cut(105, 1, 31), cut(105, 32, 48)],
  106: [cut(106, 1, 24), cut(106, 25, 43)],
  138: [part(138, 1, 1, 10), part(138, 2, 11, 24)],
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
      [custom(whole(32)), custom(whole(33)), custom(whole(34)), custom(HALF[36][0]), custom(HALF[36][1]), custom(whole(37))],
      [custom(whole(38)), custom(whole(39)), custom(whole(40)), custom(whole(41)), custom(whole(43)), custom(whole(44))],
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
      [45, 46, 47, 48, 49, 51].map((psalm) => custom(whole(psalm))),
      [52, 53, 54, 55, 57, 58].map((psalm) => custom(whole(psalm))),
    ),
    lauds: lauds([42, 56]),
    prime: [slot(whole(7)), slot(whole(8)), slot(cut(9, 2, 19))],
    ...LITTLE_HOURS_WEEK,
    vespers: [129, 130, 131, 132].map((psalm) => slot(whole(psalm))),
    compline: COMPLINE,
  },
  wed: {
    vigils: vigils(
      [custom(whole(59)), custom(whole(60)), custom(whole(61)), custom(whole(65)), custom(HALF[67][0]), custom(HALF[67][1])],
      [custom(HALF[68][0]), custom(HALF[68][1]), custom(whole(69)), custom(whole(70)), custom(whole(71)), custom(whole(72))],
    ),
    lauds: lauds([63, 64]),
    prime: [slot(cut(9, 20, 39)), slot(whole(10)), slot(whole(11))],
    ...LITTLE_HOURS_WEEK,
    vespers: [134, 135, 136, 137].map((psalm) => slot(whole(psalm))),
    compline: COMPLINE,
  },
  thu: {
    vigils: vigils(
      [custom(whole(73)), custom(whole(74)), custom(whole(76)), custom(HALF[77][0]), custom(HALF[77][1]), custom(whole(78))],
      [79, 80, 81, 82, 83, 84].map((psalm) => custom(whole(psalm))),
    ),
    lauds: lauds([87, 89]),
    prime: [slot(whole(12)), slot(whole(13)), slot(whole(14))],
    ...LITTLE_HOURS_WEEK,
    vespers: [slot(HALF[138][0]), slot(HALF[138][1]), slot(whole(139)), slot(whole(140))],
    compline: COMPLINE,
  },
  fri: {
    vigils: vigils(
      [custom(whole(85)), custom(whole(86)), custom(HALF[88][0]), custom(HALF[88][1]), custom(whole(92)), custom(whole(93))],
      [95, 96, 97, 98, 99, 100].map((psalm) => custom(whole(psalm))),
    ),
    lauds: lauds([75, 91]),
    prime: [slot(whole(15)), slot(whole(16)), slot(cut(17, 2, 25))],
    ...LITTLE_HOURS_WEEK,
    vespers: [slot(whole(141)), slot(HALF[143][0]), slot(HALF[143][1]), slot(HALF[144][0])],
    compline: COMPLINE,
  },
  sat: {
    vigils: vigils(
      [custom(whole(101)), custom(whole(102)), custom(HALF[103][0]), custom(HALF[103][1]), custom(HALF[104][0]), custom(HALF[104][1])],
      [
        custom(HALF[105][0]),
        custom(HALF[105][1]),
        custom(HALF[106][0]),
        custom(HALF[106][1]),
        custom(whole(107)),
        custom(whole(108)),
      ],
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

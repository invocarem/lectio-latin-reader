/** Civil clock → the office the Rule is keeping at that moment. */

export type Weekday = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";

export type OfficeHour =
  | "vigils"
  | "lauds"
  | "prime"
  | "terce"
  | "sext"
  | "none"
  | "vespers"
  | "compline";

/** Chapter 8: Easter through the day before 1 November, otherwise winter. */
export type OfficeSeason = "winter" | "summer";

/**
 * Chapter 15. `after-pentecost` is Pentecost to the beginning of Lent
 * (the weeks a later calendar calls ordinary time after Pentecost).
 */
export type OfficeTime = "easter" | "after-pentecost" | "lent";

export type OfficeNow = {
  weekday: Weekday;
  hour: OfficeHour;
  season: OfficeSeason;
  time: OfficeTime;
};

export const WEEKDAYS: Weekday[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

export const OFFICE_HOURS: OfficeHour[] = [
  "vigils",
  "lauds",
  "prime",
  "terce",
  "sext",
  "none",
  "vespers",
  "compline",
];

/**
 * Fixed civil bands for a reader. The Rule counts seasonal hours from
 * sunrise; these bands keep 10:19 in Terce.
 * Vigils through 05:00, Lauds to 06:00, Prime to 09:00, Terce to 12:00,
 * Sext to 15:00, None to 18:00, Vespers to 20:00, then Compline.
 */
export function hourAt(date: Date): OfficeHour {
  const minutes = date.getHours() * 60 + date.getMinutes();
  if (minutes < 5 * 60) return "vigils";
  if (minutes < 6 * 60) return "lauds";
  if (minutes < 9 * 60) return "prime";
  if (minutes < 12 * 60) return "terce";
  if (minutes < 15 * 60) return "sext";
  if (minutes < 18 * 60) return "none";
  if (minutes < 20 * 60) return "vespers";
  return "compline";
}

/** Gregorian Easter Sunday, local calendar date. */
export function easterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  next.setDate(next.getDate() + days);
  return next;
}

function dateOnly(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function onOrAfter(date: Date, start: Date): boolean {
  return dateOnly(date) >= dateOnly(start);
}

function before(date: Date, end: Date): boolean {
  return dateOnly(date) < dateOnly(end);
}

/** Pentecost Sunday is the fiftieth day, forty-nine days after Easter. */
export function pentecostSunday(year: number): Date {
  return addDays(easterSunday(year), 49);
}

/** Ash Wednesday, the beginning of Lent (caput quadragesimae). */
export function ashWednesday(year: number): Date {
  return addDays(easterSunday(year), -46);
}

export function seasonAt(date: Date): OfficeSeason {
  const year = date.getFullYear();
  const easter = easterSunday(year);
  const winterStart = new Date(year, 10, 1);
  if (onOrAfter(date, easter) && before(date, winterStart)) return "summer";
  return "winter";
}

export function timeAt(date: Date): OfficeTime {
  const year = date.getFullYear();
  const easter = easterSunday(year);
  const pentecost = pentecostSunday(year);
  const ash = ashWednesday(year);
  if (onOrAfter(date, easter) && onOrAfter(pentecost, date)) return "easter";
  if (onOrAfter(date, ash) && before(date, easter)) return "lent";
  return "after-pentecost";
}

export function officeNow(date: Date): OfficeNow {
  return {
    weekday: WEEKDAYS[date.getDay()],
    hour: hourAt(date),
    season: seasonAt(date),
    time: timeAt(date),
  };
}

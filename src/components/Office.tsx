import { useMemo, useState } from "react";
import { hourSlots, type OfficeSlot } from "../content/office/cursus";
import { sliceLabel, sliceVerses } from "../content/office/resolve";
import {
  OFFICE_HOURS,
  WEEKDAYS,
  officeNow,
  type OfficeHour,
  type OfficeSeason,
  type OfficeTime,
  type Weekday,
} from "../content/office/when";
import type { ReaderWork } from "../types";
import { LatinText } from "./LatinText";

type OfficeProps = {
  work: ReaderWork;
  onHome: () => void;
};

const WEEKDAY_LABEL: Record<Weekday, string> = {
  sun: "Sunday",
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
};

const HOUR_LABEL: Record<OfficeHour, string> = {
  vigils: "Vigils",
  lauds: "Lauds",
  prime: "Prime",
  terce: "Terce",
  sext: "Sext",
  none: "None",
  vespers: "Vespers",
  compline: "Compline",
};

const SEASON_LABEL: Record<OfficeSeason, string> = {
  summer: "Summer",
  winter: "Winter",
};

const TIME_LABEL: Record<OfficeTime, string> = {
  easter: "Easter",
  "after-pentecost": "after Pentecost",
  lent: "Lent",
};

function progressLabel(slot: OfficeSlot | undefined, index: number, total: number): string {
  if (!slot || total === 0) return "0 / 0";
  const name = slot.slices.map((slice) => sliceLabel(slice)).join(" · ");
  return `${name} · ${index + 1} / ${total}`;
}

export function Office({ work, onHome }: OfficeProps) {
  const opened = useMemo(() => officeNow(new Date()), []);
  const [weekday, setWeekday] = useState<Weekday>(opened.weekday);
  const [hour, setHour] = useState<OfficeHour>(opened.hour);
  const [index, setIndex] = useState(0);
  const [showEnglish, setShowEnglish] = useState(true);

  const slots = hourSlots(weekday, hour);
  const safeIndex = Math.min(index, Math.max(slots.length - 1, 0));
  const current = slots[safeIndex];

  function chooseDay(next: Weekday) {
    setWeekday(next);
    setIndex(0);
  }

  function chooseHour(next: OfficeHour) {
    setHour(next);
    setIndex(0);
  }

  return (
    <div className="app-shell lectio-shell">
      <header className="topbar">
        <button className="brand" type="button" onClick={onHome}>
          <strong>{work.brandShort}</strong>
          <small>Divine Office · according to the Rule</small>
        </button>
        <div className="tools">
          <button
            type="button"
            aria-pressed={showEnglish}
            onClick={() => setShowEnglish((open) => !open)}
          >
            English
          </button>
        </div>
      </header>

      <div className="lectio-layout">
        <div className="lectio-stage">
          <article className="office-card">
            <p className="lectio-kicker">
              {WEEKDAY_LABEL[weekday]} · {HOUR_LABEL[hour]} · {SEASON_LABEL[opened.season]} ·{" "}
              {TIME_LABEL[opened.time]}
            </p>
            <div className="office-switch">
              <label>
                Day
                <select
                  value={weekday}
                  onChange={(event) => chooseDay(event.target.value as Weekday)}
                >
                  {WEEKDAYS.map((day) => (
                    <option key={day} value={day}>
                      {WEEKDAY_LABEL[day]}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Hour
                <select
                  value={hour}
                  onChange={(event) => chooseHour(event.target.value as OfficeHour)}
                >
                  {OFFICE_HOURS.map((item) => (
                    <option key={item} value={item}>
                      {HOUR_LABEL[item]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {current?.slices.map((slice) => {
              const verses = sliceVerses(slice);
              return (
                <section key={`${slice.psalm}:${slice.from ?? 1}:${slice.to ?? "end"}`}>
                  <h2 className="office-psalm">{sliceLabel(slice)}</h2>
                  {verses.map((verse) => (
                    <div key={verse.n} className="office-verse">
                      <span className="office-verse-n">{verse.n}</span>
                      <div className="office-latin" lang="la">
                        <LatinText
                          text={verse.latin}
                          unitId={`${slice.psalm}:${verse.n}`}
                          onWord={() => {}}
                        />
                      </div>
                      {showEnglish ? (
                        <p className="office-english" lang="en">
                          {verse.english}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </section>
              );
            })}
          </article>
        </div>
      </div>

      <nav className="lectio-nav" aria-label="Office psalms">
        <button type="button" disabled={safeIndex <= 0} onClick={() => setIndex(safeIndex - 1)}>
          Previous
        </button>
        <span className="lectio-progress">
          {progressLabel(current, safeIndex, slots.length)}
        </span>
        <button
          type="button"
          disabled={safeIndex >= slots.length - 1}
          onClick={() => setIndex(safeIndex + 1)}
        >
          Next
        </button>
      </nav>
    </div>
  );
}

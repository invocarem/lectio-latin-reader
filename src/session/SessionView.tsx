import { useMemo, useRef, useState } from "react";
import {
  HOUR_LABEL,
  WEEKDAY_LABEL,
  dayPlaces,
  psalmLabel,
  psalmPlaces,
  type SessionPace,
} from "./cursus";
import type { OpenPlace } from "./cursus";
import { OFFICE_HOURS, WEEKDAYS, type OfficeHour, type Weekday } from "../content/office/when";

export type SessionViewProps = {
  pace: SessionPace;
  /** The day the Lectio screen is currently showing; the panel filters default to it. */
  lectioWeekday: Weekday;
  /** The hour the Lectio screen is currently showing; the panel filters default to it. */
  lectioHour: OfficeHour;
  satKeys: ReadonlySet<string>;
  count: number;
  total: number;
  /** Whole civil days since the pass began (0 on the day it started). */
  elapsed: number;
  onPace: (pace: SessionPace) => void;
  /** Open the psalm in Lectio without closing the panel. */
  onLocate: (place: OpenPlace) => void;
  /** Toggle the psalm's "done" mark in the pass. */
  onToggleDone: (step: string) => void;
  onExport: () => void;
  onImport: (file: File | null) => void;
  onReport: () => void;
  onClose: () => void;
};

type Row = {
  id: string;
  step: string;
  weekday: Weekday | null;
  hour: OfficeHour;
  psalm: number;
  label: string;
  sat: boolean;
  group: string;
};

type Group = { title: string; rows: Row[] };

export function SessionView({
  pace,
  lectioWeekday,
  lectioHour,
  satKeys,
  count,
  total,
  elapsed,
  onPace,
  onLocate,
  onToggleDone,
  onExport,
  onImport,
  onReport,
  onClose,
}: SessionViewProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [day, setDay] = useState<Weekday>(lectioWeekday);
  const [hour, setHour] = useState<OfficeHour | "">(lectioHour);
  const [psalmText, setPsalmText] = useState("");

  const parsed = psalmText.trim() === "" ? null : Number(psalmText);
  const located =
    parsed != null && Number.isInteger(parsed) && parsed >= 1 && parsed <= 150 ? parsed : null;

  const rows = useMemo<Row[]>(() => {
    if (located != null) {
      return psalmPlaces(located).map((place) => ({
        id: place.key,
        step: place.step,
        weekday: place.weekday,
        hour: place.hour,
        psalm: place.slice.psalm,
        label: psalmLabel(place),
        sat: satKeys.has(place.key),
        group:
          place.weekday != null
            ? `${WEEKDAY_LABEL[place.weekday]} · ${HOUR_LABEL[place.hour]}`
            : HOUR_LABEL[place.hour],
      }));
    }
    return dayPlaces(day)
      .filter((place) => hour === "" || place.hour === hour)
      .map((place) => ({
        id: place.key,
        step: place.step,
        weekday: place.weekday,
        hour: place.hour,
        psalm: place.slice.psalm,
        label: psalmLabel(place),
        sat: satKeys.has(place.key),
        group: HOUR_LABEL[place.hour],
      }));
  }, [located, day, hour, satKeys]);

  const groups: Group[] = [];
  for (const row of rows) {
    let group = groups.find((item) => item.title === row.group);
    if (!group) {
      group = { title: row.group, rows: [] };
      groups.push(group);
    }
    group.rows.push(row);
  }

  const openPlace = (row: Row): OpenPlace => ({
    step: row.step,
    key: row.id,
    label: row.label,
    isToday: false,
    weekday: row.weekday,
    hour: row.hour,
    psalm: row.psalm,
  });

  return (
    <aside className="session-panel" aria-label="Session">
      <div className="session-head">
        <h2>
          Session <span className="session-count">{count} / {total}</span>
          <span className="session-days">
            · day {elapsed + 1} of {pace}
          </span>
        </h2>
        <button type="button" className="session-close" onClick={onClose} aria-label="Close session">
          ×
        </button>
      </div>

      <div className="session-filters">
        <label>
          <span>Day</span>
          <select value={day} onChange={(event) => setDay(event.target.value as Weekday)}>
            {WEEKDAYS.map((item) => (
              <option key={item} value={item}>
                {WEEKDAY_LABEL[item]}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Hour</span>
          <select value={hour} onChange={(event) => setHour(event.target.value as OfficeHour | "")}>
            <option value="">All hours</option>
            {OFFICE_HOURS.map((item) => (
              <option key={item} value={item}>
                {HOUR_LABEL[item]}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Psalm</span>
          <input
            type="number"
            min={1}
            max={150}
            placeholder="1–150"
            value={psalmText}
            onChange={(event) => setPsalmText(event.target.value)}
          />
        </label>
      </div>

      {located != null ? (
        <p className="session-find">
          <strong>Psalmus {located}</strong> across the week.
        </p>
      ) : (
        <p className="session-find">
          <strong>{WEEKDAY_LABEL[day]}</strong>
          {hour ? ` · ${HOUR_LABEL[hour]}` : ""} · click a psalm to open it, tick the box when done.
        </p>
      )}

      <div className="session-places">
        {groups.length === 0 ? (
          <p className="session-empty">No psalm matches this filter.</p>
        ) : (
          groups.map((group) => (
            <section className="session-group" key={group.title}>
              <h3>{group.title}</h3>
              <ul>
                {group.rows.map((row) => (
                  <li key={row.id}>
                    <button
                      type="button"
                      className="session-locate"
                      onClick={() => onLocate(openPlace(row))}
                    >
                      {row.label}
                    </button>
                    <label className="session-done">
                      <input
                        type="checkbox"
                        checked={row.sat}
                        onChange={() => onToggleDone(row.step)}
                        aria-label={`Mark ${row.label} as done`}
                      />
                    </label>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </div>

      <div className="session-pace">
        <label>
          <span>Days</span>
          <select value={pace} onChange={(event) => onPace(Number(event.target.value) as SessionPace)}>
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
            <option value={40}>40 days</option>
          </select>
        </label>
      </div>

      <div className="session-tools">
        <button type="button" onClick={onExport}>
          Export
        </button>
        <button type="button" onClick={() => fileRef.current?.click()}>
          Import
        </button>
        <button type="button" className="session-report" onClick={onReport}>
          Report
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(event) => {
            onImport(event.target.files?.[0] ?? null);
            event.target.value = "";
          }}
        />
      </div>
    </aside>
  );
}

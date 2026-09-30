import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { hourAt, OFFICE_HOURS, WEEKDAYS, type OfficeHour, type Weekday } from "../content/office/when";
import type { OfferedPlace } from "./psalter";
import { createPsalterCourse, offeredPlaces, placesOfPsalm } from "./psalter";
import {
  choosePlace,
  countDone,
  localDate,
  sitWith,
  type SessionFile,
  type SessionPace,
} from "./session";
import { sliceId } from "./slice";

type SessionViewProps = {
  session: SessionFile;
  today: Date;
  importError: string | null;
  onChange: (session: SessionFile) => void;
  onOpen: (place: OfferedPlace) => void;
  onExport: () => void;
  onImport: (file: File) => void;
};

const WEEKDAY_LABEL = {
  sun: "Sunday",
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
} as const;

const HOUR_LABEL = {
  vigils: "Vigils",
  lauds: "Lauds",
  prime: "Prime",
  terce: "Terce",
  sext: "Sext",
  none: "None",
  vespers: "Vespers",
  compline: "Compline",
} as const;

function weekdayOf(date: Date) {
  return (["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const)[date.getDay()];
}

type HourGroup = { hour: OfficeHour; places: OfferedPlace[] };
type DayCard = { weekday: Weekday; hours: HourGroup[] };

/** One card per weekday. Hours stay in the order of the day. */
function dayCards(places: OfferedPlace[]): DayCard[] {
  const days: DayCard[] = [];
  for (const place of places) {
    let day = days[days.length - 1];
    if (!day || day.weekday !== place.weekday) {
      day = { weekday: place.weekday, hours: [] };
      days.push(day);
    }
    let hour = day.hours[day.hours.length - 1];
    if (!hour || hour.hour !== place.hour) {
      hour = { hour: place.hour, places: [] };
      day.hours.push(hour);
    }
    hour.places.push(place);
  }
  for (const day of days) {
    day.hours.sort((a, b) => OFFICE_HOURS.indexOf(a.hour) - OFFICE_HOURS.indexOf(b.hour));
  }
  return days;
}

export function SessionView({
  session,
  today,
  importError,
  onChange,
  onOpen,
  onExport,
  onImport,
}: SessionViewProps) {
  const todayText = localDate(today);
  const weekday = weekdayOf(today);
  const course = useMemo(
    () =>
      createPsalterCourse({
        weekday,
        started: session.started,
        today: todayText,
        pace: session.pace,
      }),
    [weekday, session.started, session.pace, todayText],
  );
  const satWith = session.satWith.map((sitting) =>
    sitting.part == null ? String(sitting.psalm) : `${sitting.psalm}:${sitting.part}`,
  );
  const done = countDone(session);
  const [query, setQuery] = useState("");
  const [day, setDay] = useState<Weekday>(weekday);
  const psalmNumber = Number(query);
  const finding = query !== "" && Number.isInteger(psalmNumber);
  const found = finding ? placesOfPsalm(psalmNumber, weekday) : [];
  const card = dayCards(
    offeredPlaces({
      weekday,
      started: session.started,
      today: todayText,
      pace: session.pace,
      satWith,
    }).filter((place) => place.weekday === day),
  )[0];
  const cursorId = session.cursor
    ? session.cursor.part == null
      ? String(session.cursor.psalm)
      : `${session.cursor.psalm}:${session.cursor.part}`
    : null;
  const focusKey = session.cursor
    ? `${session.cursor.weekday ?? weekday}:${session.cursor.hour}`
    : `${weekday}:${hourAt(today)}`;
  const hereRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    hereRef.current?.scrollIntoView({ block: "nearest" });
  }, [cursorId, query]);

  function setPace(pace: SessionPace) {
    if (session.satWith.length > 0 || pace === session.pace) return;
    onChange({ ...session, pace });
  }

  function open(place: OfferedPlace) {
    onChange(choosePlace(session, place));
    onOpen(place);
  }

  return (
    <aside className="session-panel" id="session-panel">
      <div className="session-scroll">
      <header className="session-panel-bar">
        <p className="session-count">
          <strong>Session</strong>
          <span>
            {done} / {course.total()}
          </span>
        </p>
        <div className="session-file">
          <button type="button" onClick={onExport}>
            Export
          </button>
          <label className="session-import">
            Import
            <input
              type="file"
              accept="application/json,.json"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) onImport(file);
              }}
            />
          </label>
        </div>
      </header>
      {importError ? <p className="session-error">{importError}</p> : null}
      <div className="session-pace">
        <button
          type="button"
          aria-pressed={session.pace === 14}
          onClick={() => setPace(14)}
          disabled={session.satWith.length > 0}
        >
          14 days
        </button>
        <button
          type="button"
          aria-pressed={session.pace === 7}
          onClick={() => setPace(7)}
          disabled={session.satWith.length > 0}
        >
          7 days
        </button>
      </div>
      <p className="lectio-kicker">
        {session.pace === 14 ? "Fourteen days" : "Seven days"} · {WEEKDAY_LABEL[weekday]}
      </p>
      <div className="session-find">
        <label>
          Psalm
          <input
            inputMode="numeric"
            value={query}
            placeholder="4"
            aria-label="Find psalm"
            onChange={(event) => setQuery(event.target.value.replace(/\D/g, "").slice(0, 3))}
          />
        </label>
        <label>
          Day
          <select
            aria-label="Day"
            value={day}
            onChange={(event) => {
              const next = event.target.value;
              if ((WEEKDAYS as readonly string[]).includes(next)) setDay(next as Weekday);
            }}
          >
            {WEEKDAYS.map((value) => (
              <option key={value} value={value}>
                {WEEKDAY_LABEL[value]}
              </option>
            ))}
          </select>
        </label>
      </div>
      {finding && found.length === 0 ? <p className="session-miss">No psalm {query}.</p> : null}
      {finding ? (
        <PlaceList
          places={found}
          satWith={satWith}
          cursorId={cursorId}
          hereRef={hereRef}
          showWhere
          onOpen={open}
          onSit={(place) => onChange(sitWith(session, place, todayText))}
        />
      ) : card ? (
        <Fold
          className="session-day"
          title={WEEKDAY_LABEL[card.weekday]}
          count={String(card.hours.reduce((sum, hour) => sum + hour.places.length, 0))}
          initialOpen
        >
          {card.hours.map((hour) => (
            <Fold
              key={hour.hour}
              className="session-hour"
              title={HOUR_LABEL[hour.hour]}
              count={String(hour.places.length)}
              initialOpen={`${card.weekday}:${hour.hour}` === focusKey}
            >
              <PlaceList
                places={hour.places}
                satWith={satWith}
                cursorId={cursorId}
                hereRef={hereRef}
                onOpen={open}
                onSit={(place) => onChange(sitWith(session, place, todayText))}
              />
            </Fold>
          ))}
        </Fold>
      ) : (
        <p className="session-miss">Nothing open on {WEEKDAY_LABEL[day]}.</p>
      )}
      </div>
    </aside>
  );
}

function Fold({
  className,
  title,
  count,
  initialOpen = false,
  children,
}: {
  className: string;
  title: string;
  count: string;
  initialOpen?: boolean;
  children: ReactNode;
}) {
  const started = useRef(false);
  return (
    <details
      className={className}
      ref={(el) => {
        if (!el || started.current) return;
        started.current = true;
        el.open = initialOpen;
      }}
    >
      <summary>
        {title}
        <span>{count}</span>
      </summary>
      {children}
    </details>
  );
}

function PlaceList({
  places,
  satWith,
  cursorId,
  hereRef,
  showWhere = false,
  onOpen,
  onSit,
}: {
  places: OfferedPlace[];
  satWith: readonly string[];
  cursorId: string | null;
  hereRef: RefObject<HTMLLIElement | null>;
  showWhere?: boolean;
  onOpen: (place: OfferedPlace) => void;
  onSit: (place: OfferedPlace) => void;
}) {
  return (
    <ul className="session-list">
      {places.map((place) => {
        const id = sliceId(place.slice);
        const sat = satWith.includes(id);
        const current = cursorId === id;
        return (
          <li key={`${place.weekday}:${place.hour}:${id}`} ref={current ? hereRef : undefined} className="session-row">
            <button
              type="button"
              className="session-open"
              aria-current={current ? "true" : undefined}
              onClick={() => onOpen(place)}
            >
              {showWhere ? (
                <small>
                  {WEEKDAY_LABEL[place.weekday]} · {HOUR_LABEL[place.hour]}
                </small>
              ) : null}
              {place.label}
            </button>
            <button type="button" className="session-sat" aria-pressed={sat} onClick={() => onSit(place)}>
              {sat ? "Sat" : "Sat with"}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

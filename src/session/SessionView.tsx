import { useMemo } from "react";
import type { OfferedPlace } from "./psalter";
import { createPsalterCourse, offeredPlaces } from "./psalter";
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
  const places = offeredPlaces({
    weekday,
    started: session.started,
    today: todayText,
    pace: session.pace,
    satWith,
  });
  const done = countDone(session);
  const cursorId = session.cursor
    ? session.cursor.part == null
      ? String(session.cursor.psalm)
      : `${session.cursor.psalm}:${session.cursor.part}`
    : null;

  function setPace(pace: SessionPace) {
    if (session.satWith.length > 0 || pace === session.pace) return;
    onChange({ ...session, pace });
  }

  const groups: { key: string; title: string; places: OfferedPlace[] }[] = [];
  for (const place of places) {
    const key = `${place.weekday}:${place.hour}`;
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.places.push(place);
    else {
      groups.push({
        key,
        title: `${WEEKDAY_LABEL[place.weekday]} · ${HOUR_LABEL[place.hour]}`,
        places: [place],
      });
    }
  }

  return (
    <aside className="session-panel" id="session-panel">
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
      {groups.map((group) => (
        <section key={group.key} className="session-block">
          <h2>{group.title}</h2>
          <ul className="session-list">
            {group.places.map((place) => {
              const id = sliceId(place.slice);
              const sat = satWith.includes(id);
              const current = cursorId === id;
              return (
                <li key={id} className="session-row">
                  <button
                    type="button"
                    className="session-open"
                    aria-current={current ? "true" : undefined}
                    onClick={() => {
                      onChange(choosePlace(session, place));
                      onOpen(place);
                    }}
                  >
                    {place.label}
                  </button>
                  <button
                    type="button"
                    className="session-sat"
                    aria-pressed={sat}
                    onClick={() => onChange(sitWith(session, place, todayText))}
                  >
                    {sat ? "Sat" : "Sat with"}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </aside>
  );
}

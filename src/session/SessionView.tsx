import { useRef } from "react";
import type { OpenPlace, SessionPace } from "./cursus";

export type SessionViewProps = {
  pace: SessionPace;
  places: OpenPlace[];
  count: number;
  total: number;
  onPace: (pace: SessionPace) => void;
  onChoose: (place: OpenPlace) => void;
  onExport: () => void;
  onImport: (file: File | null) => void;
  onClose: () => void;
};

export function SessionView({
  pace,
  places,
  count,
  total,
  onPace,
  onChoose,
  onExport,
  onImport,
  onClose,
}: SessionViewProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const todayPlaces = places.filter((place) => place.isToday);
  const earlierPlaces = places.filter((place) => !place.isToday);

  return (
    <div className="session-panel">
      <div className="session-head">
        <h2>
          Session <span className="session-count">{count} / {total}</span>
        </h2>
        <button type="button" className="session-close" onClick={onClose} aria-label="Close session">
          ×
        </button>
      </div>

      <div className="session-pace" role="group" aria-label="Pass pace">
        <button
          type="button"
          className={pace === 14 ? "active" : undefined}
          onClick={() => onPace(14)}
        >
          Fourteen days
        </button>
        <button
          type="button"
          className={pace === 7 ? "active" : undefined}
          onClick={() => onPace(7)}
        >
          Seven days
        </button>
      </div>

      <div className="session-places">
        {todayPlaces.length > 0 ? (
          <PlaceGroup label="Today" places={todayPlaces} onChoose={onChoose} />
        ) : null}
        {earlierPlaces.length > 0 ? (
          <PlaceGroup label="Still open" places={earlierPlaces} onChoose={onChoose} />
        ) : null}
        {places.length === 0 ? (
          <p className="session-empty">
            Every slice of the psalter has been sat with. A finished pass stays available.
          </p>
        ) : null}
      </div>

      <div className="session-tools">
        <button type="button" onClick={onExport}>
          Export
        </button>
        <button type="button" onClick={() => fileRef.current?.click()}>
          Import
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
    </div>
  );
}

function PlaceGroup({
  label,
  places,
  onChoose,
}: {
  label: string;
  places: OpenPlace[];
  onChoose: (place: OpenPlace) => void;
}) {
  return (
    <section className="session-group">
      <h3>{label}</h3>
      <ul>
        {places.map((place) => (
          <li key={place.step}>
            <button type="button" onClick={() => onChoose(place)}>
              {place.label}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

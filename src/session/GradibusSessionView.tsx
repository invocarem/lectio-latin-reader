import { useMemo, useRef } from "react";
import { gradibus } from "../content/gradibus";
import type { Chapter, LectioUnit } from "../types";

/**
 * The De gradibus session panel. It lists the whole treatise unit by unit,
 * grouped by chapter, with the units already sat ticked. There is no weekday
 * and no hour: a step is one lectio unit, and the count is units sat over
 * `total()`.
 */

export type GradibusSessionViewProps = {
  count: number;
  total: number;
  /** The next unit not yet sat with (from the course), or null when the pass is done. */
  nextStep: string | null;
  satSteps: ReadonlySet<string>;
  onLocate: (step: string) => void;
  onToggleDone: (step: string) => void;
  onGoNext: (step: string) => void;
  onExport: () => void;
  onImport: (file: File | null) => void;
  onClose: () => void;
};

type Row = { step: string; sat: boolean; label: string };
type Group = { title: string; rows: Row[] };

function unitLabel(unit: LectioUnit): string {
  if (unit.heading) return unit.heading;
  const latin = (unit.latin ?? "").trim();
  if (latin) return latin.length > 48 ? `${latin.slice(0, 47)}…` : latin;
  return unit.id;
}

/** Group the lectio units in order by their chapter. */
function buildGroups(lectio: LectioUnit[], chapters: Chapter[]): Group[] {
  const byId = new Map<string, Chapter>();
  for (const chapter of chapters) byId.set(chapter.id, chapter);
  const groups: Group[] = [];
  for (const unit of lectio) {
    const chapter = unit.chapterId ? byId.get(unit.chapterId) : undefined;
    const title = chapter ? chapter.title : "Front matter";
    let group = groups[groups.length - 1];
    if (!group || group.title !== title) {
      group = { title, rows: [] };
      groups.push(group);
    }
    group.rows.push({ step: unit.id, sat: false, label: unitLabel(unit) });
  }
  return groups;
}

export function GradibusSessionView({
  count,
  total,
  nextStep,
  satSteps,
  onLocate,
  onToggleDone,
  onGoNext,
  onExport,
  onImport,
  onClose,
}: GradibusSessionViewProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const groups = useMemo(() => buildGroups(gradibus.lectio, gradibus.chapters), []);
  const sat = new Map(
    groups
      .flatMap((group) => group.rows)
      .map((row) => [row.step, satSteps.has(row.step)]),
  );

  return (
    <aside className="session-panel" aria-label="De gradibus session">
      <div className="session-head">
        <h2>
          De gradibus <span className="session-count">{count} / {total}</span>
        </h2>
        <button type="button" className="session-close" onClick={onClose} aria-label="Close session">
          ×
        </button>
      </div>

      {nextStep ? (
        <div className="session-next">
          <button type="button" onClick={() => onGoNext(nextStep)}>
            Open the next unit not yet read
          </button>
        </div>
      ) : (
        <p className="session-find">
          <strong>Every unit of the pass is read.</strong>
        </p>
      )}

      <div className="session-places">
        {groups.map((group) => (
          <section className="session-group" key={group.title}>
            <h3>{group.title}</h3>
            <ul>
              {group.rows.map((row) => (
                <li key={row.step}>
                  <button type="button" className="session-locate" onClick={() => onLocate(row.step)}>
                    {row.label}
                  </button>
                  <label className="session-done">
                    <input
                      type="checkbox"
                      checked={sat.get(row.step) ?? false}
                      onChange={() => onToggleDone(row.step)}
                      aria-label={`Mark ${row.label} as done`}
                    />
                  </label>
                </li>
              ))}
            </ul>
          </section>
        ))}
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
    </aside>
  );
}

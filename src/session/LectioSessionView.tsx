import { useMemo, useRef } from "react";
import type { ReaderWork, Chapter } from "../types";
import { buildSlices, type LectioSlice } from "./lectio";

/**
 * The shared lectio session panel, used by every work that opts in to a pass
 * (`session: true`). It lists the work slice by slice (one row per section),
 * grouped by chapter, with the sections already sat ticked. There is no
 * weekday and no hour: a step is one section, and the count is sections sat
 * over `total()`.
 *
 * A pure heading (a work title or a chapter title) never appears as a slice;
 * it only labels a group. The lectio pages inside a section are not separate
 * rows: they are one slice, stepped by its first page.
 */

export type LectioSessionViewProps = {
  work: ReaderWork;
  count: number;
  total: number;
  /** The next slice not yet sat with (from the course), or null when the pass is done. */
  nextStep: string | null;
  satSteps: ReadonlySet<string>;
  onLocate: (step: string) => void;
  onToggleDone: (step: string) => void;
  onGoNext: (step: string) => void;
  onExport: () => void;
  onImport: (file: File | null) => void;
};

type Row = { step: string; label: string };
type Group = { key: string; title: string; rows: Row[] };

/** Shorten a long chapter heading for the panel ("CAPUT PRIMUM. Christum esse viam…" → "CAPUT PRIMUM"). */
function shortTitle(title: string): string {
  const dot = title.indexOf(".");
  if (dot > 0 && dot <= 20) return title.slice(0, dot).trim();
  return title.length > 48 ? `${title.slice(0, 47)}…` : title;
}

/** Group the slices in order by their chapter. */
function groupSlices(slices: LectioSlice[], chapters: Chapter[]): Group[] {
  const byId = new Map<string, Chapter>();
  for (const chapter of chapters) byId.set(chapter.id, chapter);
  const groups: Group[] = [];
  for (const slice of slices) {
    const chapter = slice.chapterId ? byId.get(slice.chapterId) : undefined;
    const key = chapter ? chapter.id : "front";
    const title = chapter ? shortTitle(chapter.title) : "Front matter";
    let group = groups[groups.length - 1];
    if (!group || group.key !== key) {
      group = { key, title, rows: [] };
      groups.push(group);
    }
    group.rows.push({ step: slice.step, label: slice.label });
  }
  return groups;
}

export function LectioSessionView({
  work,
  count,
  total,
  nextStep,
  satSteps,
  onLocate,
  onToggleDone,
  onGoNext,
  onExport,
  onImport,
}: LectioSessionViewProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const groups = useMemo(() => groupSlices(buildSlices(work), work.chapters), [work]);

  return (
    <aside className="session-panel" aria-label={`${work.brandShort} session`}>
      <div className="session-head">
        <h2>
          {work.brandShort} <span className="session-count">{count} / {total}</span>
        </h2>
      </div>

      {nextStep ? (
        <div className="session-next">
          <button type="button" onClick={() => onGoNext(nextStep)}>
            Open the next slice not yet read
          </button>
        </div>
      ) : (
        <p className="session-find">
          <strong>Every slice of the pass is read.</strong>
        </p>
      )}

      <div className="session-places">
        {groups.map((group) => (
          <section className="session-group" key={group.key}>
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
                      checked={satSteps.has(row.step)}
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

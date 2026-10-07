import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { hourSlots, type OfficeSlot, type PsalmSlice } from "../content/office/cursus";
import { hourLines, sliceLabel, sliceVerses } from "../content/office/resolve";
import { normLatin } from "../latinNorm";
import {
  officeNow,
  type OfficeHour,
  type OfficeSeason,
  type OfficeTime,
  type Weekday,
} from "../content/office/when";
import { EDGE_GUARD_PX, isSwipePointer, swipeIntent } from "../swipe";
import { SessionView } from "../session/SessionView";
import { useSession } from "../session/useSession";
import { isAnnotated, annotationFor } from "../session/document";
import { parseStep, type OpenPlace } from "../session/cursus";
import type { ReaderWork } from "../types";
import { DictPopup } from "./DictPopup";
import { LatinText } from "./LatinText";
import { AppTitle } from "./AppTitle";
import { EnglishIcon, SessionIcon } from "./icons";
import { ThemeToggle } from "./ThemeToggle";

type DictState = {
  word: string;
  rect: DOMRect;
  tokenKey: string;
};

type OfficeProps = {
  work: ReaderWork;
  /** `line` is one office line. `hour` is the whole psalm of the hour. */
  reading: "line" | "hour";
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

/** The exact slice (psalm and verse range) a session place means. */
function sliceOf(place: OpenPlace): PsalmSlice {
  const parsed = parseStep(place.step);
  return { psalm: parsed.psalm, from: parsed.from, to: parsed.to };
}

function sameSlice(a: PsalmSlice, b: PsalmSlice): boolean {
  return a.psalm === b.psalm && a.from === b.from && a.to === b.to;
}

/** The index (a lectio line or an office slot) that holds exactly `place`'s slice. */
function indexForLocate(
  reading: "line" | "hour",
  targetWeekday: Weekday,
  targetHour: OfficeHour,
  place: OpenPlace,
): number {
  const target = sliceOf(place);
  const slots = hourSlots(targetWeekday, targetHour);
  const slotIndex = slots.findIndex((slot) => slot.slices.some((slice) => sameSlice(slice, target)));
  if (reading !== "line") return slotIndex < 0 ? 0 : slotIndex;

  // Line mode: office lines are laid out per slice, so match the slice by label
  // (Psalm 118's sections are distinct labels even though they share a number).
  const matched = slotIndex < 0 ? undefined : slots[slotIndex].slices.find((slice) => sameSlice(slice, target));
  if (!matched) return 0;
  const label = sliceLabel(matched);
  const at = hourLines(targetWeekday, targetHour).findIndex(
    (line) => line.psalm === target.psalm && line.label === label,
  );
  return at < 0 ? 0 : at;
}

/**
 * The Office position, kept only in memory for this app run. It is never
 * persisted, so a fresh start reopens the psalm of the current clock hour.
 */
type OfficePosition = { weekday: Weekday; hour: OfficeHour; index: number };

/**
 * The last Office place chosen during this app run per reading mode (Cursus
 * "hour" and Lectio "line" have different index spaces). Empty on a fresh start.
 */
const lastOfficePosition: Partial<Record<"line" | "hour", OfficePosition>> = {};

/**
 * Where the office should open on mount: the place last chosen in this app
 * run when there is one, otherwise the current clock hour at the first slot.
 */
function initialPosition(
  last: OfficePosition | null | undefined,
  clockWeekday: Weekday,
  clockHour: OfficeHour,
): OfficePosition {
  if (last) return last;
  return { weekday: clockWeekday, hour: clockHour, index: 0 };
}

export function Office({ work, reading, onHome }: OfficeProps) {
  const opened = useMemo(() => officeNow(new Date()), []);
  const session = useSession();
  // The first mount opens the psalm of the current clock hour (a fresh start),
  // or the place last chosen earlier in this same app run. The useState
  // initializers run only on mount, so this single computation is enough even
  // though it is re-derived on every render.
  const initial = initialPosition(lastOfficePosition[reading], opened.weekday, opened.hour);
  const [weekday, setWeekday] = useState<Weekday>(initial.weekday);
  const [hour, setHour] = useState<OfficeHour>(initial.hour);
  const [index, setIndex] = useState(initial.index);
  const [showEnglish, setShowEnglish] = useState(true);
  const [dict, setDict] = useState<DictState | null>(null);
  const closeDict = useCallback(() => setDict(null), []);
  const stageRef = useRef<HTMLDivElement>(null);

  /** Navigate Lectio to a psalm's place without closing the session panel. */
  const locateSessionPlace = useCallback(
    (place: OpenPlace) => {
      const targetWeekday = place.weekday ?? weekday;
      if (place.weekday) setWeekday(place.weekday);
      setHour(place.hour);
      setIndex(indexForLocate(reading, targetWeekday, place.hour, place));
      closeDict();
    },
    [reading, weekday, closeDict],
  );

  const slots = hourSlots(weekday, hour);
  const lines = useMemo(
    () => (reading === "line" ? hourLines(weekday, hour) : []),
    [reading, weekday, hour],
  );
  const total = reading === "line" ? lines.length : slots.length;
  const safeIndex = Math.min(index, Math.max(total - 1, 0));
  const current = slots[safeIndex];
  const line = lines[safeIndex];
  // Keep the place being read in memory (not persisted) so leaving to the menu
  // and returning within the same app run reopens the same psalm, while a
  // fresh start still opens the psalm of the current clock hour.
  useEffect(() => {
    lastOfficePosition[reading] = { weekday, hour, index: safeIndex };
  }, [reading, weekday, hour, safeIndex]);
  const highlighted = line != null && isAnnotated(session.doc, line.psalm, line.n);
  const note = line != null ? annotationFor(session.doc, line.psalm, line.n) : undefined;
  const [editingId, setEditingId] = useState<string | null>(null);
  const noteRef = useRef<HTMLTextAreaElement>(null);
  const growNote = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };
  const editing = line != null && editingId === line.id;
  useEffect(() => {
    setEditingId(null);
  }, [line?.id]);
  useEffect(() => {
    if (editing && noteRef.current) {
      noteRef.current.focus();
      growNote(noteRef.current);
    }
  }, [editing]);

  const goPrev = useCallback(() => {
    setIndex((at) => {
      if (at <= 0) return at;
      return at - 1;
    });
    closeDict();
  }, [closeDict]);

  const goNext = useCallback(() => {
    setIndex((at) => Math.min(at + 1, Math.max(total - 1, 0)));
    closeDict();
  }, [closeDict, total]);

  useEffect(() => {
    stageRef.current?.scrollTo({ top: 0 });
  }, [reading === "line" ? line?.id : current]);

  useEffect(() => {
    if (reading !== "line") return;
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const editing =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target?.isContentEditable;
      if (editing) return;
      if (event.key === "ArrowLeft" && safeIndex > 0) {
        event.preventDefault();
        goPrev();
      }
      if (event.key === "ArrowRight" && safeIndex < total - 1) {
        event.preventDefault();
        goNext();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [reading, safeIndex, total, goPrev, goNext]);

  useEffect(() => {
    if (reading !== "line") return;
    const el = stageRef.current;
    if (!el) return;

    let startX = 0;
    let startY = 0;
    let tracking = false;

    function onPointerDown(event: PointerEvent) {
      if (!isSwipePointer(event.pointerType)) return;
      if (event.clientX < EDGE_GUARD_PX) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("button, select, .dict")) return;
      tracking = true;
      startX = event.clientX;
      startY = event.clientY;
    }

    function finish(event: PointerEvent) {
      if (!tracking) return;
      tracking = false;
      const intent = swipeIntent({
        pointerType: event.pointerType,
        startX,
        dx: event.clientX - startX,
        dy: event.clientY - startY,
        cancelled: event.type === "pointercancel",
      });
      if (intent === "next" && safeIndex < total - 1) goNext();
      else if (intent === "prev" && safeIndex > 0) goPrev();
    }

    el.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", finish);
    window.addEventListener("pointercancel", finish);
    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", finish);
    };
  }, [reading, safeIndex, total, goPrev, goNext]);

  return (
    <div className="app-shell lectio-shell">
      <header className="topbar">
        <div className="topbar-left">
          <button
            type="button"
            className="tool-icon"
            aria-pressed={session.open}
            aria-label={session.open ? "Close session" : "Open session"}
            title={session.open ? "Close session" : "Open session"}
            onClick={session.toggle}
          >
            <SessionIcon />
          </button>
          <AppTitle
            line={`Cursus · ${reading === "line" ? "Lectio · " : ""}according to the Rule`}
            onHome={onHome}
          />
        </div>
        <div className="tools">
          <button
            type="button"
            className="tool-icon"
            aria-pressed={showEnglish}
            aria-label={showEnglish ? "Hide English translation" : "Show English translation"}
            title={showEnglish ? "Hide English translation" : "Show English translation"}
            onClick={() => setShowEnglish((open) => !open)}
          >
            <EnglishIcon />
          </button>
          <ThemeToggle />
        </div>
      </header>

      <div className={`lectio-layout${session.open ? " session-open" : ""}`}>
        <div className="lectio-stage" ref={stageRef}>
            <article className={reading === "line" ? "lectio-card" : "office-card"}>
            <p className="lectio-kicker">
              {WEEKDAY_LABEL[weekday]} · {HOUR_LABEL[hour]} · {SEASON_LABEL[opened.season]} ·{" "}
              {TIME_LABEL[opened.time]}
            </p>
            {reading === "line" && line ? (
              <>
                <div className="office-psalm-row">
                  <h2 className="office-psalm">
                    {line.label} · {line.n}
                  </h2>
                  <button
                    type="button"
                    className="highlight-marker"
                    aria-pressed={highlighted}
                    aria-label={highlighted ? "Clear highlight from this line" : "Highlight this line"}
                    title="Highlight this line"
                    onClick={() => session.toggleHighlight(line.psalm, line.n)}
                  />
                </div>
                <div className={`lectio-latin${highlighted ? " highlighted" : ""}`} lang="la">
                  <LatinText
                    text={line.latin}
                    unitId={line.id}
                    activeToken={dict?.tokenKey}
                    onWord={(word, el, tokenKey) => {
                      setDict({
                        word,
                        rect: el.getBoundingClientRect(),
                        tokenKey,
                      });
                    }}
                  />
                </div>
                {showEnglish ? (
                  <p className="lectio-english" lang="en">
                    {line.english}
                  </p>
                ) : null}
                {highlighted ? (
                  <div className="session-note">
                    <span className="session-note-label">Note</span>
                    {editing ? (
                      <textarea
                        ref={noteRef}
                        className="session-note-edit"
                        value={note?.text ?? ""}
                        rows={1}
                        placeholder="A note on this line"
                        onChange={(event) => {
                          session.writeNote(line.psalm, line.n, event.target.value);
                          growNote(event.target);
                        }}
                        onBlur={() => setEditingId(null)}
                        onKeyDown={(event) => {
                          if (event.key === "Escape") event.currentTarget.blur();
                        }}
                      />
                    ) : (
                      <button
                        type="button"
                        className={`session-note-view${note?.text ? "" : " empty"}`}
                        onClick={() => setEditingId(line.id)}
                        title="Tap to edit this note"
                      >
                        {note?.text || "Add a note…"}
                      </button>
                    )}
                  </div>
                ) : null}
              </>
            ) : (
              current?.slices.map((slice) => {
                const verses = sliceVerses(slice);
                return (
                  <section key={`${slice.psalm}:${slice.from ?? 1}:${slice.to ?? "end"}`}>
                    <h2 className="office-psalm">{sliceLabel(slice)}</h2>
                    {verses.map((verse) => (
                      <div key={verse.n} className="office-verse">
                        <span className="office-verse-n">{verse.n}</span>
                        <div className="office-latin" lang="la">
                          <LatinText
                            text={normLatin(verse.latin)}
                            unitId={`${slice.psalm}:${verse.n}`}
                            activeToken={dict?.tokenKey}
                            onWord={(word, el, tokenKey) => {
                              setDict({
                                word,
                                rect: el.getBoundingClientRect(),
                                tokenKey,
                              });
                            }}
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
              })
            )}
          </article>
        </div>
        {session.open ? (
          <SessionView
            pace={session.doc.pace ?? 7}
            lectioWeekday={weekday}
            lectioHour={hour}
            satKeys={session.satKeys}
            count={session.count}
            total={session.total}
            elapsed={session.elapsed}
            onPace={session.setPace}
            onLocate={locateSessionPlace}
            onToggleDone={session.toggleDone}
            onExport={session.exportSession}
            onImport={session.importSession}
            onReport={session.reportSession}
          />
        ) : null}
      </div>

      <nav className="lectio-nav" aria-label={reading === "line" ? "Office lectio" : "Office psalms"}>
        <button
          type="button"
          disabled={safeIndex <= 0}
          onClick={goPrev}
          aria-label="Previous"
          title="Previous"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="lectio-progress">
          {reading === "line"
            ? `${safeIndex + 1} / ${total}`
            : progressLabel(current, safeIndex, total)}
        </span>
        <button
          type="button"
          disabled={safeIndex >= total - 1}
          onClick={goNext}
          aria-label="Next"
          title="Next"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </nav>

      {dict ? (
        <DictPopup
          word={dict.word}
          anchor={dict.rect}
          workId={work.id}
          onClose={closeDict}
        />
      ) : null}
    </div>
  );
}

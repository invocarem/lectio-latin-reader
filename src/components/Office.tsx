import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { hourSlots, type OfficeSlot, type PsalmSlice } from "../content/office/cursus";
import { hourLines, sliceLabel, sliceVerses } from "../content/office/resolve";
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
import { isHighlighted, noteFor } from "../session/document";
import { parseStep, type OpenPlace } from "../session/cursus";
import type { ReaderWork } from "../types";
import { DictPopup } from "./DictPopup";
import { LatinText } from "./LatinText";

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

export function Office({ work, reading, onHome }: OfficeProps) {
  const opened = useMemo(() => officeNow(new Date()), []);
  const [weekday, setWeekday] = useState<Weekday>(opened.weekday);
  const [hour, setHour] = useState<OfficeHour>(opened.hour);
  const [index, setIndex] = useState(0);
  const [showEnglish, setShowEnglish] = useState(true);
  const [dict, setDict] = useState<DictState | null>(null);
  const closeDict = useCallback(() => setDict(null), []);
  const stageRef = useRef<HTMLDivElement>(null);
  const session = useSession();

  /** Navigate Lectio to a psalm's place without closing the session panel. */
  const locateSessionPlace = useCallback(
    (place: OpenPlace) => {
      const targetWeekday = place.weekday ?? weekday;
      if (place.weekday) setWeekday(place.weekday);
      setHour(place.hour);
      setIndex(indexForLocate(targetWeekday, place.hour, place));
      closeDict();
    },
    [weekday, closeDict],
  );

  /** The exact slice (psalm and verse range) a session place means. */
  function sliceOf(place: OpenPlace): PsalmSlice {
    const parsed = parseStep(place.step);
    return { psalm: parsed.psalm, from: parsed.from, to: parsed.to };
  }

  function sameSlice(a: PsalmSlice, b: PsalmSlice): boolean {
    return a.psalm === b.psalm && a.from === b.from && a.to === b.to;
  }

  /** The index (a lectio line or an office slot) that holds exactly `place`'s slice. */
  function indexForLocate(targetWeekday: Weekday, targetHour: OfficeHour, place: OpenPlace): number {
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

  const slots = hourSlots(weekday, hour);
  const lines = useMemo(
    () => (reading === "line" ? hourLines(weekday, hour) : []),
    [reading, weekday, hour],
  );
  const total = reading === "line" ? lines.length : slots.length;
  const safeIndex = Math.min(index, Math.max(total - 1, 0));
  const current = slots[safeIndex];
  const line = lines[safeIndex];
  const highlighted = line != null && isHighlighted(session.doc, line.psalm, line.n);
  const note = line != null ? noteFor(session.doc, line.psalm, line.n) : undefined;

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
        <button className="brand" type="button" onClick={onHome}>
          <strong>Cursus</strong>
          <small>
            {reading === "line" ? "Lectio" : "Cursus"} · according to the Rule
          </small>
        </button>
        <div className="tools">
          <button
            type="button"
            aria-pressed={showEnglish}
            onClick={() => setShowEnglish((open) => !open)}
          >
            English
          </button>
          <button
            type="button"
            aria-pressed={session.open}
            onClick={session.toggle}
            title="Session"
          >
            Session
          </button>
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
                  <label className="session-note">
                    <span className="session-note-label">Note</span>
                    <textarea
                      value={note?.text ?? ""}
                      rows={2}
                      placeholder="A note on this line"
                      onChange={(event) =>
                        session.writeNote(line.psalm, line.n, event.target.value)
                      }
                    />
                  </label>
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
                            text={verse.latin}
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
            onClose={session.toggle}
          />
        ) : null}
      </div>

      <nav className="lectio-nav" aria-label={reading === "line" ? "Office lectio" : "Office psalms"}>
        <button type="button" disabled={safeIndex <= 0} onClick={goPrev}>
          Previous
        </button>
        <span className="lectio-progress">
          {reading === "line"
            ? `${safeIndex + 1} / ${total}`
            : progressLabel(current, safeIndex, total)}
        </span>
        <button type="button" disabled={safeIndex >= total - 1} onClick={goNext}>
          Next
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

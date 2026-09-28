import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { hourSlots, type OfficeSlot } from "../content/office/cursus";
import { hourLines, sliceLabel, sliceVerses } from "../content/office/resolve";
import {
  OFFICE_HOURS,
  WEEKDAYS,
  officeNow,
  type OfficeHour,
  type OfficeSeason,
  type OfficeTime,
  type Weekday,
} from "../content/office/when";
import { EDGE_GUARD_PX, isSwipePointer, swipeIntent } from "../swipe";
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

  const slots = hourSlots(weekday, hour);
  const lines = useMemo(
    () => (reading === "line" ? hourLines(weekday, hour) : []),
    [reading, weekday, hour],
  );
  const total = reading === "line" ? lines.length : slots.length;
  const safeIndex = Math.min(index, Math.max(total - 1, 0));
  const current = slots[safeIndex];
  const line = lines[safeIndex];

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

  function chooseDay(next: Weekday) {
    closeDict();
    setWeekday(next);
    setIndex(0);
  }

  function chooseHour(next: OfficeHour) {
    closeDict();
    setHour(next);
    setIndex(0);
  }

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
          <strong>Office</strong>
          <small>
            {reading === "line" ? "Lectio" : "Divine Office"} · according to the Rule
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
        </div>
      </header>

      <div className="lectio-layout">
        <div className="lectio-stage" ref={stageRef}>
          <article className={reading === "line" ? "lectio-card" : "office-card"}>
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
            {reading === "line" && line ? (
              <>
                <h2 className="office-psalm">
                  {line.label} · {line.n}
                </h2>
                <div className="lectio-latin" lang="la">
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

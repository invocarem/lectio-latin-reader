import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { lectioFocus, chapterFocus } from "../lectioNav";
import { EDGE_GUARD_PX, isSwipePointer, swipeIntent } from "../swipe";
import type { LectioUnit, ReaderWork } from "../types";
import { DictPopup } from "./DictPopup";
import { LatinText } from "./LatinText";
import { CapitaIcon, EnglishIcon, SessionIcon } from "./icons";
import { ThemeToggle } from "./ThemeToggle";
import { LectioSessionView } from "../session/LectioSessionView";
import { courseFor } from "../session/courses";
import { useSession } from "../session/useSession";

type LectioProps = {
  work: ReaderWork;
  focusId: string;
  onFocus: (id: string) => void;
  onHome: () => void;
};

type DictState = {
  word: string;
  rect: DOMRect;
  tokenKey: string;
};

export function Lectio({ work, focusId, onFocus, onHome }: LectioProps) {
  const [showEnglish, setShowEnglish] = useState(true);
  const [showToc, setShowToc] = useState(false);
  const [dict, setDict] = useState<DictState | null>(null);
  const closeDict = useCallback(() => setDict(null), []);
  const stageRef = useRef<HTMLDivElement>(null);

  const sessionEnabled = work.session === true;
  const session = useSession(sessionEnabled ? work.id : "cursus", {
    persist: sessionEnabled,
  });

  const nextStep = useMemo(() => {
    if (!sessionEnabled) return null;
    return courseFor(work.id).next(
      session.doc.cursor,
      session.doc.satWith.map((mark) => mark.step),
    );
  }, [sessionEnabled, work.id, session.doc]);

  const locateStep = useCallback(
    (step: string) => {
      closeDict();
      onFocus(step);
    },
    [closeDict, onFocus],
  );

  const lectioUnits = work.lectio;
  const chapters = work.chapters;

  const { current, index, prev, next } = useMemo(
    () => lectioFocus(lectioUnits, focusId),
    [lectioUnits, focusId],
  );
  const activeChapter = current.chapterId ?? "";

  const { prev: prevChapter, next: nextChapter } = useMemo(
    () => chapterFocus(chapters, activeChapter),
    [chapters, activeChapter],
  );

  const goPrevChapter = useCallback(() => {
    if (!prevChapter) return;
    closeDict();
    onFocus(prevChapter.firstUnitId);
  }, [prevChapter, closeDict, onFocus]);

  const goNextChapter = useCallback(() => {
    if (!nextChapter) return;
    closeDict();
    onFocus(nextChapter.firstUnitId);
  }, [nextChapter, closeDict, onFocus]);

  const goPrev = useCallback(() => {
    if (!prev) return;
    closeDict();
    onFocus(prev.id);
  }, [prev, closeDict, onFocus]);

  const goNext = useCallback(() => {
    if (!next) return;
    closeDict();
    onFocus(next.id);
  }, [next, closeDict, onFocus]);

  useEffect(() => {
    stageRef.current?.scrollTo({ top: 0 });
  }, [current.id]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const editing =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target?.isContentEditable;
      if (!editing) {
        if (event.key === "ArrowLeft" && prev) {
          event.preventDefault();
          goPrev();
        }
        if (event.key === "ArrowRight" && next) {
          event.preventDefault();
          goNext();
        }
      }
      if (event.key === "Escape") setShowToc(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [prev, next, goPrev, goNext]);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    let startX = 0;
    let startY = 0;
    let tracking = false;

    function onPointerDown(event: PointerEvent) {
      if (!isSwipePointer(event.pointerType)) return;
      if (event.clientX < EDGE_GUARD_PX) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("button, .dict")) return;
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
      if (intent === "next") goNext();
      else if (intent === "prev") goPrev();
    }

    el.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", finish);
    window.addEventListener("pointercancel", finish);
    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", finish);
    };
  }, [goPrev, goNext]);

  return (
    <div className="app-shell lectio-shell">
      <header className="topbar">
        <div className="topbar-left">
          {sessionEnabled ? (
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
          ) : null}
          <button className="brand" type="button" onClick={onHome}>
            <strong>{work.brandShort}</strong>
            <small>{work.brandLine}</small>
          </button>
        </div>
        <div className="tools">
          {!sessionEnabled ? (
            <button
              type="button"
              className="tool-icon"
              aria-pressed={showToc}
              aria-label="Capita"
              title="Capita"
              onClick={() => setShowToc((open) => !open)}
            >
              <CapitaIcon />
            </button>
          ) : null}
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

      <div
        className={[
          "lectio-layout",
          !sessionEnabled && showToc ? "toc-open" : "",
          sessionEnabled && session.open ? "session-open" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {!sessionEnabled && showToc ? (
          <nav className="toc" aria-label="Chapters">
            <h2>Capita</h2>
            {chapters.map((chapter) => (
              <button
                key={chapter.id}
                type="button"
                className={chapter.id === activeChapter ? "active" : undefined}
                onClick={() => {
                  closeDict();
                  onFocus(chapter.firstUnitId);
                  setShowToc(false);
                }}
              >
                {chapter.caput != null ? (
                  <span className="cap">Caput {chapter.caput}</span>
                ) : null}
                <span className="ttl">{shortTitle(chapter.title)}</span>
              </button>
            ))}
          </nav>
        ) : null}

        <div className="lectio-stage" ref={stageRef}>
          <article className={`lectio-card${current.kind !== "section" && current.kind !== "retractatio" && current.kind !== "praefatio" ? " heading" : ""}`}>
            <div className="lectio-kicker-row">
              <p className="lectio-kicker">{kicker(current)}</p>
              {!sessionEnabled ? (
                <div className="lectio-chapter-nav">
                  <button
                    type="button"
                    disabled={!prevChapter}
                    onClick={goPrevChapter}
                    aria-label="Previous chapter"
                    title="Previous chapter"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    disabled={!nextChapter}
                    onClick={goNextChapter}
                    aria-label="Next chapter"
                    title="Next chapter"
                  >
                    ›
                  </button>
                </div>
              ) : null}
            </div>
            <div className="lectio-latin" lang="la">
              <LatinText
                text={current.latin}
                unitId={current.id}
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
                {current.english}
              </p>
            ) : null}
          </article>
        </div>

        {sessionEnabled && session.open ? (
          <LectioSessionView
            work={work}
            count={session.count}
            total={session.total}
            nextStep={nextStep}
            satSteps={session.satKeys}
            onLocate={locateStep}
            onToggleDone={session.toggleDone}
            onGoNext={locateStep}
            onExport={session.exportSession}
            onImport={session.importSession}
          />
        ) : null}
      </div>

      <nav className="lectio-nav" aria-label="Lectio steps">
        <button
          type="button"
          disabled={!prev}
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
          {index + 1} / {lectioUnits.length}
        </span>
        <button
          type="button"
          disabled={!next}
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

function kicker(unit: LectioUnit): string {
  const part =
    unit.parts > 1 ? ` · ${unit.part} / ${unit.parts}` : "";
  if (unit.kind === "title") return "Tractatus";
  if (unit.kind === "retractatio" || unit.kind === "praefatio") {
    return `${unit.heading ?? unit.label}${part}`;
  }
  if (unit.kind === "chapter-title" && unit.caput != null) {
    return `Caput ${unit.caput}`;
  }
  if (unit.caput != null && unit.section != null) {
    return `Caput ${unit.caput} · ${unit.section}${part}`;
  }
  return `${unit.label}${part}`;
}

function shortTitle(title: string): string {
  return title
    .replace(/^CAPUT\.?\s+[IVX]+.\s*/i, "")
    .replace(/^CAPUT PRIMUM.\s*/i, "")
    .replace(/^Retractatio.*/, "Retractatio")
    .replace(/^Praefatio.*/, "Praefatio");
}

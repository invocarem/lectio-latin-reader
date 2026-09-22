import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { lectioFocus } from "../lectioNav";
import { EDGE_GUARD_PX, isSwipePointer, swipeIntent } from "../swipe";
import type { LectioUnit, ReaderWork } from "../types";
import { DictPopup } from "./DictPopup";
import { LatinText } from "./LatinText";

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

  const lectioUnits = work.lectio;
  const chapters = work.chapters;

  const { current, index, prev, next } = useMemo(
    () => lectioFocus(lectioUnits, focusId),
    [lectioUnits, focusId],
  );
  const activeChapter = current.chapterId ?? "";

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
      if (event.key === "ArrowLeft" && prev) {
        event.preventDefault();
        goPrev();
      }
      if (event.key === "ArrowRight" && next) {
        event.preventDefault();
        goNext();
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
        <button className="brand" type="button" onClick={onHome}>
          <strong>{work.brandShort}</strong>
          <small>{work.brandLine}</small>
        </button>
        <div className="tools">
          <button
            type="button"
            aria-pressed={showToc}
            onClick={() => setShowToc((open) => !open)}
          >
            Capita
          </button>
          <button
            type="button"
            aria-pressed={showEnglish}
            onClick={() => setShowEnglish((open) => !open)}
          >
            English
          </button>
        </div>
      </header>

      <div className={showToc ? "lectio-layout toc-open" : "lectio-layout"}>
        {showToc ? (
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
            <p className="lectio-kicker">{kicker(current)}</p>
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
      </div>

      <nav className="lectio-nav" aria-label="Lectio steps">
        <button type="button" disabled={!prev} onClick={goPrev}>
          Previous
        </button>
        <span className="lectio-progress">
          {index + 1} / {lectioUnits.length}
        </span>
        <button type="button" disabled={!next} onClick={goNext}>
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

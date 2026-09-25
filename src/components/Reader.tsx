import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  MAX_ZOOM,
  ZOOM_STEP,
  clampZoom,
  nextZoomWithWheel,
  panTarget,
  zoomAroundCursor,
} from "../plateZoom";
import { studyUnitsInView } from "../studyView";
import type { ReaderWork, Unit } from "../types";
import { DictPopup } from "./DictPopup";
import { LatinText } from "./LatinText";

type ReaderProps = {
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

export function Reader({ work, focusId, onFocus, onHome }: ReaderProps) {
  const units = work.study?.units ?? [];
  const chapters = work.study?.chapters ?? [];
  const [showPlate, setShowPlate] = useState(work.study?.facsimile !== false);
  const [showEnglish, setShowEnglish] = useState(true);
  const [zoom, setZoomState] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [dict, setDict] = useState<DictState | null>(null);
  const latinRef = useRef<HTMLDivElement>(null);
  const englishRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const zoomImgRef = useRef<HTMLImageElement>(null);
  const zoomRef = useRef(1);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    scrollLeft: number;
    scrollTop: number;
  } | null>(null);
  const closeDict = useCallback(() => setDict(null), []);
  const current = useMemo(
    () => units.find((unit) => unit.id === focusId) ?? units[0],
    [units, focusId],
  );
  const visibleUnits = useMemo(
    () => studyUnitsInView(units, focusId, work.study?.mount),
    [units, focusId, work.study?.mount],
  );
  const activeChapter = current ? chapterKey(current, chapters) : "";

  useEffect(() => {
    const selector = `[data-unit="${current.id}"]`;
    latinRef.current?.querySelector(selector)?.scrollIntoView({
      block: "start",
      behavior: "smooth",
    });
    englishRef.current?.querySelector(selector)?.scrollIntoView({
      block: "start",
      behavior: "smooth",
    });
  }, [current.id]);

  const changeZoom = useCallback(
    (next: ((z: number) => number) | number) => {
      const v = clampZoom(
        typeof next === "function" ? next(zoomRef.current) : next,
      );
      zoomRef.current = v;
      setZoomState(v);
    },
    [],
  );

  const zoomIn = () => changeZoom((z) => z + ZOOM_STEP);
  const zoomOut = () => changeZoom((z) => z - ZOOM_STEP);

  const handlePlateWheel = useCallback(
    (event: WheelEvent) => {
      if (!current.facsimile) {
        event.preventDefault();
        return;
      }
      const viewport = viewportRef.current;
      const img = zoomImgRef.current;
      if (!viewport || !img) return;
      event.preventDefault();
      const rect = viewport.getBoundingClientRect();
      const offsetX = event.clientX - rect.left;
      const offsetY = event.clientY - rect.top;
      const oldZoom = zoomRef.current;
      const newZoom = nextZoomWithWheel(oldZoom, event.deltaY);
      if (newZoom === oldZoom) return;
      // Keep the image point under the cursor stationary while zooming.
      const target = zoomAroundCursor({
        scrollLeft: viewport.scrollLeft,
        scrollTop: viewport.scrollTop,
        offsetX,
        offsetY,
        from: oldZoom,
        to: newZoom,
      });
      changeZoom(newZoom);
      requestAnimationFrame(() => {
        viewport.scrollLeft = target.scrollLeft;
        viewport.scrollTop = target.scrollTop;
      });
    },
    [current.facsimile, changeZoom],
  );

  // Attach a non-passive wheel listener so preventDefault works.
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    viewport.addEventListener("wheel", handlePlateWheel, { passive: false });
    return () => viewport.removeEventListener("wheel", handlePlateWheel);
  }, [handlePlateWheel, showPlate]);

  // Start each plate back at the top-left once it is shown.
  useEffect(() => {
    viewportRef.current?.scrollTo({ top: 0, left: 0 });
  }, [current.id]);

  const startDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const viewport = viewportRef.current;
    if (!viewport || event.button !== 0 || !current.facsimile) return;
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      scrollLeft: viewport.scrollLeft,
      scrollTop: viewport.scrollTop,
    };
    setDragging(true);
    viewport.setPointerCapture(event.pointerId);
  };

  const moveDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const viewport = viewportRef.current;
    if (!drag || !viewport || event.pointerId !== drag.pointerId) return;
    const target = panTarget(drag, event.clientX, event.clientY);
    viewport.scrollLeft = target.scrollLeft;
    viewport.scrollTop = target.scrollTop;
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId === event.pointerId) {
      dragRef.current = null;
      setDragging(false);
    }
  };

  if (!current) return null;

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" type="button" onClick={onHome}>
          <strong>{work.brandShort}</strong>
          <small>{work.brandLine}</small>
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
            aria-pressed={showPlate}
            onClick={() => setShowPlate((open) => !open)}
          >
            Facsimile
          </button>
        </div>
      </header>

      <div
        className={[
          "reader",
          showPlate ? "" : "no-facsimile",
          showEnglish ? "" : "no-english",
        ]
          .filter(Boolean)
          .join(" ")}
      >
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
              }}
            >
              {chapter.caput != null ? (
                <span className="cap">
                  {chapter.capLabel ?? "Caput"} {chapter.caput}
                </span>
              ) : null}
              <span className="ttl">{shortTitle(chapter.title)}</span>
            </button>
          ))}
        </nav>

        <div className="columns">
          <div className="pane latin" ref={latinRef}>
            <div className="lang-label">Latina</div>
            {visibleUnits.map((unit) => (
              <UnitBlock
                key={`la-${unit.id}`}
                unit={unit}
                lang="latin"
                active={unit.id === current.id}
                activeToken={dict?.tokenKey}
                onSelect={(id) => {
                  closeDict();
                  onFocus(id);
                }}
                onWord={(word, el, tokenKey) => {
                  onFocus(unit.id);
                  setDict({ word, rect: el.getBoundingClientRect(), tokenKey });
                }}
              />
            ))}
          </div>
          <div className="pane english" ref={englishRef}>
            <div className="lang-label">English</div>
            {visibleUnits.map((unit) => (
              <UnitBlock
                key={`en-${unit.id}`}
                unit={unit}
                lang="english"
                active={unit.id === current.id}
                onSelect={(id) => {
                  closeDict();
                  onFocus(id);
                }}
              />
            ))}
          </div>
        </div>

        {dict ? (
          <DictPopup
            word={dict.word}
            anchor={dict.rect}
            workId={work.id}
            onClose={closeDict}
          />
        ) : null}

        {showPlate ? (
          <aside className="facsimile">
            <header>
              <span className="facsimile-title">
                <span>Plate</span>
                <span>{plateCaption(current)}</span>
              </span>
              <span
                className="facsimile-zoom"
                role="group"
                aria-label="Zoom"
              >
                <button
                  type="button"
                  aria-label="Zoom out"
                  onClick={zoomOut}
                  disabled={!current.facsimile || zoom <= 1}
                >
                  −
                </button>
                <span className="facsimile-zoom-label">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  type="button"
                  aria-label="Zoom in"
                  onClick={zoomIn}
                  disabled={!current.facsimile || zoom >= MAX_ZOOM}
                >
                  +
                </button>
                <button
                  type="button"
                  aria-label="Reset zoom"
                  onClick={() => changeZoom(1)}
                  disabled={!current.facsimile || zoom === 1}
                >
                  Reset
                </button>
              </span>
            </header>
            <div
              className={`facsimile-viewport${dragging ? " dragging" : ""}`}
              ref={viewportRef}
              onPointerDown={startDrag}
              onPointerMove={moveDrag}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
            >
              {current.facsimile ? (
                <img
                  ref={zoomImgRef}
                  src={`/facsimiles/${current.facsimile}`}
                  alt={plateCaption(current)}
                  draggable={false}
                  style={{ width: `${zoom * 100}%` }}
                />
              ) : (
                <img
                  className="facsimile-empty"
                  alt="No facsimile for this unit"
                />
              )}
            </div>
          </aside>
        ) : null}
      </div>
    </div>
  );
}

function UnitBlock({
  unit,
  lang,
  active,
  activeToken,
  onSelect,
  onWord,
}: {
  unit: Unit;
  lang: "latin" | "english";
  active: boolean;
  activeToken?: string;
  onSelect: (id: string) => void;
  onWord?: (word: string, el: HTMLElement, tokenKey: string) => void;
}) {
  const text = lang === "latin" ? unit.latin : unit.english;
  const heading = unit.kind !== "section";
  return (
    <article
      data-unit={unit.id}
      className={`unit${heading ? " heading" : ""}${active ? " active" : ""}`}
      onClick={() => onSelect(unit.id)}
    >
      {unit.section != null && !heading ? (
        <span className="num">{unit.section}.</span>
      ) : null}
      {lang === "latin" && onWord ? (
        <LatinText
          text={text}
          unitId={unit.id}
          activeToken={activeToken}
          onWord={onWord}
        />
      ) : (
        text
      )}
    </article>
  );
}

function shortTitle(title: string): string {
  return title
    .replace(/^CAPUT\.?\s+[IVX]+.\s*/i, "")
    .replace(/^CAPUT PRIMUM.\s*/i, "")
    .replace(/^Retractatio.*/, "Retractatio")
    .replace(/^Praefatio.*/, "Praefatio");
}

function plateCaption(unit: Unit): string {
  const columns = unit.facsimile?.match(/pl-(\d+)-(\d+)/);
  if (columns) return `cols. ${columns[1]}–${columns[2]}`;
  const page = unit.facsimile?.match(/p-(\d+)\.png$/);
  if (page) return `p. ${page[1]}`;
  return `cols. ${unit.column}`;
}

function chapterKey(
  unit: Pick<Unit, "id" | "kind" | "caput">,
  chapters: { id: string; caput: number | null }[],
): string {
  if (unit.kind === "title") return "title";
  if (unit.kind === "retractatio") return "retractatio";
  if (unit.kind === "praefatio") return "praefatio";
  if (unit.caput != null) {
    return (
      chapters.find((chapter) => chapter.caput === unit.caput)?.id ??
      `cap${unit.caput}-title`
    );
  }
  return unit.id;
}

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { chapterKey, chapters, units } from "../content/work";
import type { Unit } from "../types";
import { DictPopup } from "./DictPopup";
import { LatinText } from "./LatinText";

type ReaderProps = {
  focusId: string;
  onFocus: (id: string) => void;
  onHome: () => void;
};

type DictState = {
  word: string;
  rect: DOMRect;
  tokenKey: string;
};

export function Reader({ focusId, onFocus, onHome }: ReaderProps) {
  const [showPlate, setShowPlate] = useState(true);
  const [dict, setDict] = useState<DictState | null>(null);
  const latinRef = useRef<HTMLDivElement>(null);
  const englishRef = useRef<HTMLDivElement>(null);
  const closeDict = useCallback(() => setDict(null), []);
  const current = useMemo(
    () => units.find((unit) => unit.id === focusId) ?? units[0],
    [focusId],
  );
  const activeChapter = chapterKey(current);

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

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" type="button" onClick={onHome}>
          <strong>De gradibus</strong>
          <small>Bernard of Clairvaux · PL 182</small>
        </button>
        <div className="tools">
          <button
            type="button"
            aria-pressed={showPlate}
            onClick={() => setShowPlate((open) => !open)}
          >
            Facsimile
          </button>
        </div>
      </header>

      <div className={showPlate ? "reader" : "reader no-facsimile"}>
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
                <span className="cap">Caput {chapter.caput}</span>
              ) : null}
              <span className="ttl">{shortTitle(chapter.title)}</span>
            </button>
          ))}
        </nav>

        <div className="columns">
          <div className="pane latin" ref={latinRef}>
            <div className="lang-label">Latina</div>
            {units.map((unit) => (
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
            {units.map((unit) => (
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
          <DictPopup word={dict.word} anchor={dict.rect} onClose={closeDict} />
        ) : null}

        {showPlate ? (
          <aside className="facsimile">
            <header>
              <span>Plate</span>
              <span>cols. {plateLabel(current)}</span>
            </header>
            {current.facsimile ? (
              <img
                src={`/facsimiles/${current.facsimile}`}
                alt={`Patrologia Latina plate ${current.facsimile}`}
              />
            ) : (
              <img alt="No facsimile for this unit" />
            )}
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

function plateLabel(unit: Unit): string {
  const match = unit.facsimile?.match(/pl-(\d+)-(\d+)/);
  if (match) return `${match[1]}–${match[2]}`;
  return String(unit.column);
}

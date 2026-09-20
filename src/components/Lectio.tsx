import { useCallback, useEffect, useMemo, useState } from "react";
import {
  chapterKey,
  chapters,
  firstLectioId,
  lectioById,
  lectioUnits,
} from "../content/work";
import type { LectioUnit, ReaderMode } from "../types";
import { DictPopup } from "./DictPopup";
import { LatinText } from "./LatinText";
import { ModeSwitch } from "./ModeSwitch";

type LectioProps = {
  focusId: string;
  onFocus: (id: string) => void;
  onHome: () => void;
  onMode: (mode: ReaderMode) => void;
};

type DictState = {
  word: string;
  rect: DOMRect;
  tokenKey: string;
};

export function Lectio({ focusId, onFocus, onHome, onMode }: LectioProps) {
  const [showEnglish, setShowEnglish] = useState(true);
  const [showToc, setShowToc] = useState(false);
  const [dict, setDict] = useState<DictState | null>(null);
  const closeDict = useCallback(() => setDict(null), []);

  const current = useMemo(
    () => lectioById(focusId) ?? lectioUnits[0],
    [focusId],
  );
  const index = lectioUnits.findIndex((unit) => unit.id === current.id);
  const prev = index > 0 ? lectioUnits[index - 1] : null;
  const next =
    index >= 0 && index < lectioUnits.length - 1
      ? lectioUnits[index + 1]
      : null;
  const activeChapter = chapterKey(current);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "ArrowLeft" && prev) {
        event.preventDefault();
        closeDict();
        onFocus(prev.id);
      }
      if (event.key === "ArrowRight" && next) {
        event.preventDefault();
        closeDict();
        onFocus(next.id);
      }
      if (event.key === "Escape") setShowToc(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [prev, next, onFocus, closeDict]);

  return (
    <div className="app-shell lectio-shell">
      <header className="topbar">
        <button className="brand" type="button" onClick={onHome}>
          <strong>De gradibus</strong>
          <small>Bernard of Clairvaux · PL 182</small>
        </button>
        <div className="tools">
          <button
            type="button"
            aria-pressed={showToc}
            onClick={() => setShowToc((open) => !open)}
          >
            Capita
          </button>
          <ModeSwitch mode="lectio" onMode={onMode} />
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
                  onFocus(firstLectioId(chapter.firstUnitId));
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

        <div className="lectio-stage">
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
        <button
          type="button"
          disabled={!prev}
          onClick={() => {
            if (!prev) return;
            closeDict();
            onFocus(prev.id);
          }}
        >
          Previous
        </button>
        <span className="lectio-progress">
          {index + 1} / {lectioUnits.length}
        </span>
        <button
          type="button"
          disabled={!next}
          onClick={() => {
            if (!next) return;
            closeDict();
            onFocus(next.id);
          }}
        >
          Next
        </button>
      </nav>

      {dict ? (
        <DictPopup word={dict.word} anchor={dict.rect} onClose={closeDict} />
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

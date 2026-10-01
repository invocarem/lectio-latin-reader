import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createSession,
  parseSession,
  recordOpen,
  satCount,
  setNote,
  setPace,
  stepKey,
  toggleHighlight,
  toggleSat,
  type SessionDoc,
  type SessionWork,
} from "./document";
import { loadSession, saveSession } from "./store";
import { cursusCourse, isoDate, type OpenPlace, type SessionPace } from "./cursus";
import { gradibusCourse } from "./gradibus";
import { WEEKDAYS } from "../content/office/when";

/** Read-only progress for a work's pass, without opening or saving one. */
export function sessionProgress(work: SessionWork, storage?: Storage | null): { count: number; total: number } {
  const doc = loadSession(work, storage);
  const total = work === "cursus" ? cursusCourse.total() : gradibusCourse.total();
  return { count: doc ? satCount(doc) : 0, total };
}

/**
 * Owns the open session pass for one work and its local persistence. The switch
 * turns the panel on and off; everything else lives in this hook. Cursus and
 * De gradibus each keep an independent pass.
 */
export function useSession(work: SessionWork = "cursus", options: { persist?: boolean } = {}) {
  const { persist = true } = options;
  const today = useMemo(() => isoDate(new Date()), []);
  const todayWeekday = useMemo(() => WEEKDAYS[new Date().getDay()], []);
  const [doc, setDoc] = useState<SessionDoc>(() => loadSession(work) ?? createSession(work, today));
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!persist) return;
    saveSession(doc);
  }, [doc, persist]);

  const toggle = useCallback(() => setOpen((value) => !value), []);

  /** Open a place: record the sitting, close the panel, and drive Office. */
  const choose = useCallback(
    (place: OpenPlace): OpenPlace => {
      setDoc((current) => recordOpen(current, place.step, today));
      setOpen(false);
      return place;
    },
    [today],
  );

  const setPaceValue = useCallback((pace: SessionPace) => setDoc((current) => setPace(current, pace)), []);

  /** Mark a step done or not done (the pass's "done" checkbox), without navigating. */
  const toggleDone = useCallback(
    (step: string) => setDoc((current) => toggleSat(current, step, today)),
    [today],
  );

  const toggleLineHighlight = useCallback(
    (psalm: number, line: string) => setDoc((current) => toggleHighlight(current, psalm, line)),
    [],
  );

  const writeLineNote = useCallback(
    (psalm: number, line: string, text: string) => setDoc((current) => setNote(current, psalm, line, text, today)),
    [today],
  );

  const exportSession = useCallback(() => {
    const blob = new Blob([JSON.stringify(doc, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `session-${doc.work}-${doc.started}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }, [doc]);

  const importSession = useCallback((file: File | null) => {
    if (!file) return;
    file.text().then((text) => {
      const parsed = parseSession(text);
      if (parsed) setDoc(parsed);
    });
  }, []);

  const satKeys = useMemo(
    () => new Set(doc.satWith.map((mark) => stepKey(doc.work, mark.step))),
    [doc],
  );

  const total = work === "cursus" ? cursusCourse.total() : gradibusCourse.total();

  return {
    doc,
    today,
    todayWeekday,
    open,
    toggle,
    choose,
    setPace: setPaceValue,
    toggleDone,
    exportSession,
    importSession,
    satKeys,
    count: satCount(doc),
    total,
    toggleHighlight: toggleLineHighlight,
    writeNote: writeLineNote,
  };
}

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createSession,
  parseSession,
  recordOpen,
  satCount,
  setNote,
  setPace,
  toggleHighlight,
  toggleSat,
  type SessionDoc,
} from "./document";
import { loadSession, saveSession } from "./store";
import { cursusCourse, isoDate, keyOfStep, type OpenPlace, type SessionPace } from "./cursus";
import { WEEKDAYS } from "../content/office/when";

/**
 * Owns the open session pass and its local persistence. The switch turns the
 * panel on and off; everything else lives in this hook.
 */
export function useSession() {
  const today = useMemo(() => isoDate(new Date()), []);
  const todayWeekday = useMemo(() => WEEKDAYS[new Date().getDay()], []);
  const [doc, setDoc] = useState<SessionDoc>(() => loadSession() ?? createSession(14, today));
  const [open, setOpen] = useState(false);

  useEffect(() => {
    saveSession(doc);
  }, [doc]);

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

  /** Mark a place done or not done (the pass's "done" checkbox), without navigating. */
  const toggleDone = useCallback(
    (place: OpenPlace) => setDoc((current) => toggleSat(current, place.step, today)),
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
    anchor.download = `session-cursus-${doc.started}.json`;
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
    () => new Set(doc.satWith.map((mark) => keyOfStep(mark.step))),
    [doc],
  );

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
    total: cursusCourse.total(),
    toggleHighlight: toggleLineHighlight,
    writeNote: writeLineNote,
  };
}

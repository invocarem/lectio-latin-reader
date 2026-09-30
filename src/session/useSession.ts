import { useCallback, useEffect, useMemo, useState } from "react";
import { createSession, parseSession, recordOpen, satCount, setPace, type SessionDoc } from "./document";
import { loadSession, saveSession } from "./store";
import { cursusCourse, isoDate, openPlaces, type OpenPlace, type SessionPace } from "./cursus";

/**
 * Owns the open session pass and its local persistence. The switch turns the
 * panel on and off; everything else lives in this hook.
 */
export function useSession() {
  const today = useMemo(() => isoDate(new Date()), []);
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

  const places = useMemo(
    () => openPlaces(doc.pace, doc.started, today, doc.satWith.map((mark) => mark.step)),
    [doc, today],
  );

  return {
    doc,
    today,
    open,
    toggle,
    choose,
    setPace: setPaceValue,
    exportSession,
    importSession,
    places,
    count: satCount(doc),
    total: cursusCourse.total(),
  };
}

/**
 * The learning notes already on this device. A sync read fills the store.
 * This hook does not create or edit a note.
 */

import { useEffect, useMemo, useState } from "react";
import { indexedNoteFiles, loadLearningNotes, type NoteFiles } from "./noteStore";
import type { LearningNote } from "./notes";

export function useLearningNotes(files?: NoteFiles) {
  const bucket = useMemo(() => files ?? indexedNoteFiles(), [files]);
  const [notes, setNotes] = useState<LearningNote[]>([]);

  useEffect(() => {
    let cancelled = false;
    const reload = () => {
      void loadLearningNotes(bucket).then((list) => {
        if (!cancelled) setNotes(list);
      });
    };
    reload();
    window.addEventListener("lectio:notes", reload);
    return () => {
      cancelled = true;
      window.removeEventListener("lectio:notes", reload);
    };
  }, [bucket]);

  return { notes };
}

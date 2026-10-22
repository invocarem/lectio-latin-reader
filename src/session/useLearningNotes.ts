/**
 * The open device's learning notes. Writes go to the note store only.
 * A sitting or a line highlight does not pass through here.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { isoDate } from "./cursus";
import { indexedNoteFiles, loadLearningNotes, saveLearningNote, deleteLearningNote, type NoteFiles } from "./noteStore";
import {
  createLearningNote,
  editLearningNote,
  nextNoteId,
  notesForPlace,
  type LearningNote,
  type NotePlace,
} from "./notes";

export function useLearningNotes(files?: NoteFiles) {
  const bucket = useMemo(() => files ?? indexedNoteFiles(), [files]);
  const [notes, setNotes] = useState<LearningNote[]>([]);
  const [ready, setReady] = useState(false);
  const notesRef = useRef(notes);
  const tail = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    notesRef.current = notes;
  }, [notes]);

  useEffect(() => {
    const reload = () => {
      void loadLearningNotes(bucket).then((list) => setNotes(list));
    };
    window.addEventListener("lectio:notes", reload);
    return () => window.removeEventListener("lectio:notes", reload);
  }, [bucket]);

  useEffect(() => {
    let cancelled = false;
    loadLearningNotes(bucket).then(
      (list) => {
        if (cancelled) return;
        setNotes(list);
        setReady(true);
      },
      () => {
        if (!cancelled) setReady(true);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [bucket]);

  const writeFile = useCallback(
    (note: LearningNote) => {
      tail.current = tail.current.then(
        () => saveLearningNote(bucket, note),
        () => saveLearningNote(bucket, note),
      );
    },
    [bucket],
  );

  const add = useCallback(
    async (place: NotePlace): Promise<LearningNote | null> => {
      const id = nextNoteId(notesForPlace(notesRef.current, place).map((note) => note.id));
      if (!id) return null;
      const note = createLearningNote(place, id, isoDate(new Date()), new Date().toISOString());
      if (!note) return null;
      const next = [...notesRef.current, note];
      notesRef.current = next;
      setNotes(next);
      writeFile(note);
      return note;
    },
    [writeFile],
  );

  const write = useCallback(
    (note: LearningNote, title: string, body: string) => {
      const next = editLearningNote(note, title, body, new Date().toISOString());
      if (next === note) return;
      const list = notesRef.current.map((item) => (item.filename === next.filename ? next : item));
      notesRef.current = list;
      setNotes(list);
      writeFile(next);
    },
    [writeFile],
  );

  const remove = useCallback(
    (note: LearningNote) => {
      const list = notesRef.current.filter((item) => item.filename !== note.filename);
      notesRef.current = list;
      setNotes(list);
      const updated = new Date().toISOString();
      tail.current = tail.current.then(
        () => deleteLearningNote(bucket, note, updated),
        () => deleteLearningNote(bucket, note, updated),
      );
    },
    [bucket],
  );

  return { notes, ready, add, write, remove };
}

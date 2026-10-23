/**
 * The learning notes on one psalter place. The app displays the markdown
 * files. It does not create or edit them. A line highlight is a different control.
 *
 * The red label is closed until a click. The opened note is part of the page,
 * so the office stage scrolls it.
 */

import { useState } from "react";
import { NoteBody } from "./NoteBody";
import { noteTitle, notesForPlace, type LearningNote, type NotePlace } from "./notes";

type SectionNotesProps = {
  place: NotePlace;
  notes: readonly LearningNote[];
};

export function SectionNotes({ place, notes }: SectionNotesProps) {
  const list = notesForPlace(notes, place);
  const [open, setOpen] = useState(false);
  if (list.length === 0) return null;

  const panelId = `learning-notes-${place.psalm}-${place.section ?? "whole"}`;

  return (
    <section className="learning-notes">
      <button
        type="button"
        className="learning-notes-toggle"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        Learning notes
      </button>
      {open ? (
        <div id={panelId}>
          {list.map((note) => {
            const title = noteTitle(note);
            return (
              <article key={note.filename} className="learning-note">
                {title ? <span className="learning-note-title">{title}</span> : null}
                {note.body.trim() ? <NoteBody text={note.body} /> : null}
              </article>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}

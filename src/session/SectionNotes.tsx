/**
 * The learning notes on one psalter place. The app displays the markdown
 * files. It does not create or edit them. A line highlight is a different control.
 */

import { NoteBody } from "./NoteBody";
import { noteTitle, notesForPlace, type LearningNote, type NotePlace } from "./notes";

type SectionNotesProps = {
  place: NotePlace;
  notes: readonly LearningNote[];
};

export function SectionNotes({ place, notes }: SectionNotesProps) {
  const list = notesForPlace(notes, place);
  if (list.length === 0) return null;

  return (
    <section className="learning-notes" aria-label="Learning notes">
      <span className="session-note-label">Learning notes</span>
      {list.map((note) => (
        <article key={note.filename} className="learning-note">
          <span className="learning-note-title">{noteTitle(note)}</span>
          {note.body.trim() ? <NoteBody text={note.body} /> : null}
        </article>
      ))}
    </section>
  );
}

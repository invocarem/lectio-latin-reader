/**
 * The learning notes on one psalter place. The body is shown as written,
 * markdown marks included. A line highlight is a different control.
 */

import { useEffect, useRef, useState } from "react";
import { nextNoteId, noteTitle, notesForPlace, type LearningNote, type NotePlace } from "./notes";

type SectionNotesProps = {
  place: NotePlace;
  notes: readonly LearningNote[];
  ready: boolean;
  onAdd: (place: NotePlace) => Promise<LearningNote | null>;
  onWrite: (note: LearningNote, title: string, body: string) => void;
  onDelete: (note: LearningNote) => void;
};

function grow(el: HTMLTextAreaElement) {
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight}px`;
}

export function SectionNotes({ place, notes, ready, onAdd, onWrite, onDelete }: SectionNotesProps) {
  const list = notesForPlace(notes, place);
  const [editing, setEditing] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftBody, setDraftBody] = useState("");
  const titleRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const open = list.find((note) => note.filename === editing);

  useEffect(() => {
    if (!editing) return;
    // The add button takes focus from the click. Focus the title after that.
    const id = window.setTimeout(() => titleRef.current?.focus(), 0);
    return () => window.clearTimeout(id);
  }, [editing]);

  useEffect(() => {
    if (bodyRef.current) grow(bodyRef.current);
  }, [draftBody, editing]);

  if (!ready) return null;

  function edit(note: LearningNote, title: string, body: string) {
    setDraftTitle(title);
    setDraftBody(body);
    onWrite(note, title, body);
  }

  return (
    <section className="learning-notes" aria-label="Learning notes">
      <span className="session-note-label">Learning notes</span>
      {list.map((note) =>
        note.filename === editing && open ? (
          <div
            key={note.filename}
            className="learning-note-edit"
            onBlur={(event) => {
              const next = event.relatedTarget;
              if (next instanceof Node && event.currentTarget.contains(next)) return;
              setEditing(null);
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") setEditing(null);
            }}
          >
            <input
              ref={titleRef}
              className="session-note-edit"
              aria-label="Note title"
              placeholder="Title"
              value={draftTitle}
              onChange={(event) => edit(open, event.target.value, draftBody)}
            />
            <textarea
              ref={bodyRef}
              className="session-note-edit"
              aria-label="Note"
              placeholder="A learning note on this section"
              rows={3}
              value={draftBody}
              onChange={(event) => {
                edit(open, draftTitle, event.target.value);
                grow(event.target);
              }}
            />
            <button
              type="button"
              className="learning-note-delete"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onDelete(open);
                setEditing(null);
              }}
            >
              Delete note
            </button>
          </div>
        ) : (
          <button
            key={note.filename}
            type="button"
            className={`session-note-view${note.title || note.body ? "" : " empty"}`}
            onClick={() => {
              setDraftTitle(note.title);
              setDraftBody(note.body);
              setEditing(note.filename);
            }}
            title="Tap to edit this note"
          >
            <span className="learning-note-title">{noteTitle(note)}</span>
            <span className="learning-note-body">{note.body || "Write the note…"}</span>
          </button>
        ),
      )}
      {nextNoteId(list.map((note) => note.id)) != null ? (
        <button
          type="button"
          className="learning-note-add"
          onClick={() => {
            void onAdd(place).then((note) => {
              if (!note) return;
              setDraftTitle("");
              setDraftBody("");
              setEditing(note.filename);
            });
          }}
        >
          Add a learning note
        </button>
      ) : null}
    </section>
  );
}

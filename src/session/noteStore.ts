/**
 * Learning notes on this device, keyed by filename. The value is the markdown
 * file. This store is not `session.${work}` and a write here does not touch
 * the session document.
 */

import { openLectioDb, LEARNING_NOTES_STORE } from "./lectioDb";
import { formatNoteFile, notesFromFiles, type LearningNote } from "./notes";

export type NoteFile = { name: string; text: string };

export type NoteFiles = {
  list(): Promise<NoteFile[]>;
  write(name: string, text: string): Promise<void>;
  remove(name: string): Promise<void>;
};

export function memoryNoteFiles(initial: NoteFile[] = []): NoteFiles {
  const files = new Map(initial.map((file) => [file.name, file.text]));
  return {
    async list() {
      return [...files.entries()].map(([name, text]) => ({ name, text }));
    },
    async write(name, text) {
      files.set(name, text);
    },
    async remove(name) {
      files.delete(name);
    },
  };
}

/** The notes store in the shared `lectio` database. */
export function indexedNoteFiles(): NoteFiles {
  return {
    async list() {
      const db = await openLectioDb();
      return new Promise((resolve, reject) => {
        const files: NoteFile[] = [];
        const tx = db.transaction(LEARNING_NOTES_STORE, "readonly");
        const request = tx.objectStore(LEARNING_NOTES_STORE).openCursor();
        request.onsuccess = () => {
          const cursor = request.result;
          if (!cursor) return;
          files.push({ name: String(cursor.key), text: String(cursor.value) });
          cursor.continue();
        };
        tx.oncomplete = () => resolve(files);
        tx.onerror = () => reject(tx.error);
      });
    },
    async write(name, text) {
      const db = await openLectioDb();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(LEARNING_NOTES_STORE, "readwrite");
        tx.objectStore(LEARNING_NOTES_STORE).put(text, name);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    },
    async remove(name) {
      const db = await openLectioDb();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(LEARNING_NOTES_STORE, "readwrite");
        tx.objectStore(LEARNING_NOTES_STORE).delete(name);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    },
  };
}

let onRealEdit: (() => void) | undefined;

/** Called after a real change to the note store. Sync registers this. */
export function onLearningNoteEdit(listener: () => void): void {
  onRealEdit = listener;
}

export async function loadLearningNotes(files: NoteFiles): Promise<LearningNote[]> {
  const read = notesFromFiles(await files.list());
  return read.notes;
}

/**
 * Save one note. `silent` writes without telling sync, which uses it while
 * applying the folder so that write does not schedule another.
 */
export async function saveLearningNote(
  files: NoteFiles,
  note: LearningNote,
  options?: { silent?: boolean },
): Promise<void> {
  await files.write(note.filename, formatNoteFile(note));
  if (!options?.silent) onRealEdit?.();
}

/**
 * A delete keeps a tombstone, `09_psalm_118_nun.md.deleted`, whose text is
 * the `updated` timestamp, and removes the note file. The other device reads
 * the tombstone and does not put the note back.
 */
export async function deleteLearningNote(files: NoteFiles, note: LearningNote, updated: string): Promise<void> {
  await files.write(`${note.filename}.deleted`, `${updated}\n`);
  await files.remove(note.filename);
  onRealEdit?.();
}

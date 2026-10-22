import { hourSlots } from "../content/office/cursus";
import { sliceLabel } from "../content/office/resolve";
import { OFFICE_HOURS, WEEKDAYS } from "../content/office/when";
import { createSession, serializeSession, setAnnotation } from "./document";
import {
  createLearningNote,
  editLearningNote,
  formatNoteFile,
  nextNoteId,
  noteFilename,
  noteTitle,
  notesForPlace,
  notesFromFiles,
  parseNoteFile,
  parseNoteFilename,
  placeOfSlice,
  type LearningNote,
} from "./notes";

const NUN = { kind: "psalm" as const, psalm: 118, section: "nun" };

describe("learning note filenames", () => {
  test("09_psalm_118_nun.md is psalm 118, section nun, id 09", () => {
    expect(parseNoteFilename("09_psalm_118_nun.md")).toEqual({ id: "09", place: NUN });
    expect(placeOfSlice({ psalm: 118, from: 105, to: 112 })).toEqual(NUN);
  });

  test("a whole psalm omits the section", () => {
    expect(parseNoteFilename("03_psalm_50.md")).toEqual({
      id: "03",
      place: { kind: "psalm", psalm: 50 },
    });
  });

  test("a numbered part stays numeric", () => {
    expect(parseNoteFilename("02_psalm_36_1.md")).toEqual({
      id: "02",
      place: { kind: "psalm", psalm: 36, section: "1" },
    });
  });

  test("a name that does not parse is skipped", () => {
    const read = notesFromFiles([
      { name: "09_psalm_118_nun.md", text: "On Nun." },
      { name: "9_psalm_118_nun.md", text: "short id" },
      { name: "09_psalm_118_gimel.md", text: "wrong letter" },
      { name: "09_psalm_118_Nun.md", text: "uppercase" },
      { name: "09_psalm_118.md", text: "118 is not a whole psalm" },
      { name: "09_psalm_36.md", text: "36 is sung in parts" },
      { name: "09_psalm_36_3.md", text: "no part 3" },
      { name: "09_psalm_50_1.md", text: "50 is a whole psalm" },
      { name: "09_psalm_151.md", text: "outside 1–150" },
      { name: "09_gradibus_1.md", text: "not a psalm" },
      { name: "notes.txt", text: "nope" },
      { name: "lectio-sessions.json", text: "{}" },
    ]);
    expect(read.notes.map((note) => note.filename)).toEqual(["09_psalm_118_nun.md"]);
    expect(read.skipped).toEqual([
      "9_psalm_118_nun.md",
      "09_psalm_118_gimel.md",
      "09_psalm_118_Nun.md",
      "09_psalm_118.md",
      "09_psalm_36.md",
      "09_psalm_36_3.md",
      "09_psalm_50_1.md",
      "09_psalm_151.md",
      "09_gradibus_1.md",
      "notes.txt",
      "lectio-sessions.json",
    ]);
  });

  test("the next id is the lowest free number on that place", () => {
    expect(nextNoteId(["01", "03"])).toBe("02");
    expect(nextNoteId([])).toBe("01");
    const full = Array.from({ length: 99 }, (_, index) => String(index + 1).padStart(2, "0"));
    expect(nextNoteId(full)).toBeNull();
  });

  test("every cursus slice names a note place", () => {
    for (const day of WEEKDAYS) {
      for (const hour of OFFICE_HOURS) {
        for (const slot of hourSlots(day, hour)) {
          for (const slice of slot.slices) {
            const place = placeOfSlice(slice);
            expect(place, sliceLabel(slice)).not.toBeNull();
            expect(parseNoteFilename(noteFilename("01", place!))).toEqual({ id: "01", place });
            if (slice.psalm === 118) {
              const letter = sliceLabel(slice).split(" · ")[1]?.toLowerCase();
              expect(place?.section).toBe(letter);
            }
          }
        }
      }
    }
  });
});

describe("learning note files", () => {
  test("the header carries title, at, and updated, and the body is the note", () => {
    const note: LearningNote = {
      id: "09",
      place: NUN,
      filename: "09_psalm_118_nun.md",
      title: "Memoria verbi",
      at: "2026-10-22",
      updated: "2026-10-22T22:13:00.000Z",
      body: "The eighth verse of Nun...",
    };
    expect(parseNoteFile(note.filename, formatNoteFile(note))).toEqual(note);
  });

  test("a file with no header still parses", () => {
    const filename = "01_psalm_118_aleph.md";
    const note = parseNoteFile(filename, "Beati immaculati.");
    expect(note?.title).toBe("");
    expect(noteTitle(note!)).toBe(filename);
    expect(note?.at).toBeUndefined();
    expect(note?.updated).toBeUndefined();
    expect(note?.body).toBe("Beati immaculati.");
  });

  test("an empty body is a note that has been opened and not yet written", () => {
    const note = createLearningNote(NUN, "09", "2026-10-22", "2026-10-22T22:13:00.000Z");
    expect(note?.body).toBe("");
    expect(parseNoteFile(note!.filename, formatNoteFile(note!))?.body).toBe("");
  });

  test("a header field that is not a date is left absent", () => {
    const text = ["---", "title: Memoria verbi", "at: Tuesday", "updated: later", "---", "", "Hello"].join("\n");
    const note = parseNoteFile("09_psalm_118_nun.md", text);
    expect(note?.title).toBe("Memoria verbi");
    expect(note?.at).toBeUndefined();
    expect(note?.updated).toBeUndefined();
    expect(note?.body).toBe("Hello");
  });

  test("an unchanged edit keeps its timestamp", () => {
    const note = createLearningNote(NUN, "01", "2026-10-22", "2026-10-22T22:13:00.000Z");
    expect(editLearningNote(note!, note!.title, note!.body, "2026-10-22T23:00:00.000Z")).toBe(note);
    const written = editLearningNote(note!, "Memoria", "A line.", "2026-10-22T23:00:00.000Z");
    expect(written.updated).toBe("2026-10-22T23:00:00.000Z");
    expect(written.title).toBe("Memoria");
  });

  test("Nun lists the notes whose section is nun, in id order", () => {
    const files = notesFromFiles([
      { name: "09_psalm_118_nun.md", text: "Later." },
      { name: "01_psalm_118_aleph.md", text: "Aleph." },
      { name: "02_psalm_118_nun.md", text: "Earlier id." },
    ]);
    expect(notesForPlace(files.notes, NUN).map((note) => note.id)).toEqual(["02", "09"]);
    expect(nextNoteId(notesForPlace(files.notes, NUN).map((note) => note.id))).toBe("01");
  });

  test("a line highlight in the session file is not a learning note", () => {
    const doc = setAnnotation(createSession("cursus", "2026-10-22"), 118, "12", "a line note", "2026-10-22");
    const read = notesFromFiles([{ name: "lectio-sessions.json", text: serializeSession(doc) }]);
    expect(read.notes).toEqual([]);
    expect(read.skipped).toEqual(["lectio-sessions.json"]);
  });
});

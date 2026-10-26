# Learning notes

**Current step: done.** Tick a box here when that piece lands, and move the current-step line with it.

- [x] 0. Plan
- [x] 1. Parse
  - [x] `09_psalm_118_nun.md` is psalm 118, section `nun`, id `09`
  - [x] A whole psalm omits the section: `03_psalm_50.md`
  - [x] A numbered part stays numeric: `02_psalm_36_1.md`
  - [x] A name that does not parse is skipped
  - [x] The id is two digits, unique for that place; the next note takes the lowest free number
  - [x] The header carries `title`, `at`, and `updated`; the body is the note
- [x] 2. Show
  - [x] Notes live in their own local store, separate from `session.${work}`
  - [x] The open office slice lists the notes for that place
  - [x] Psalm 118 Nun (verses 105–112) lists the notes whose section is `nun`
  - [x] The body is shown as a reading view, under the section
  - [x] A line highlight stays on the line and is not turned into a file
- [x] 3. Folder
  - [x] The picked place is a folder: `lectio-sessions.json` beside `notes/`
  - [x] Desktop remembers a directory handle
  - [x] The phone bookmarks the folder
  - [x] Read the JSON and merge it as today; read each note into the local note store
  - [x] Write a changed note a few seconds after a real edit, not on each keystroke
- [x] 4. Service
  - [x] `LECTIO_SYNC_DIR` is that folder; `GET`/`PUT /lectio-sessions.json` still serves the JSON inside it
  - [x] `GET /notes` and `GET`/`PUT /notes/:name`, one etag per file
  - [x] The same name merges by `updated`; the later text wins and the other is reported
  - [x] A delete is a tombstone, so the other device does not put the file back

## Branch

This work is on `learning-notes`. `main` is what TestFlight ships. Merge when a note file parses, shows on its section, and a test covers that. An unfinished note sync does not go into a release.

## Goal

A learning note is the person's own writing on one place in the psalter: a whole psalm, a numbered part, or one section of Psalm 118. It is a markdown file in a folder. The filename is the binding key. The office shows the notes for the slice that is open.

`lectio-sessions.json` stays the progress file from `sync.md` and `service-sync.md`. Sittings, the cursor, the pace, and line highlights stay in that JSON. A learning note is a different object. A highlight marks one office line. A learning note belongs to the section, and there may be several on the same section.

The session file still stores no Latin and no English. The markdown file is where the person's words go, and it may quote the verse.

## Folder

The thing a device picks, and the directory the sync service reads, is one folder:

```
lectio-sessions/
  lectio-sessions.json
  notes/
    09_psalm_118_nun.md
    01_psalm_118_aleph.md
    03_psalm_50.md
```

`lectio-sessions.json` keeps the version-1 bundle (`BUNDLE_VERSION` in `src/session/bundle.ts`). Its merge does not change. `notes/` holds only the markdown files. A missing `notes/` directory is an empty note list, not an error.

The folder stays outside this repo. A fixture in a test is the only copy here.

## Filename

```
09_psalm_118_nun.md
│  │     │   └── section, when the place has one
│  │     └────── Gallican number
│  └──────────── kind; this plan uses psalm
└─────────────── note id, two digits, unique for that place
```

| Name | Place |
| --- | --- |
| `09_psalm_118_nun.md` | Psalm 118, section Nun |
| `01_psalm_118_aleph.md` | Psalm 118, section Aleph |
| `02_psalm_36_1.md` | Psalm 36, part 1 |
| `03_psalm_50.md` | Psalm 50, the whole psalm |

The id is scoped to the place. Nun and Aleph may each have an `01`. The app assigns the lowest free number from `01` to `99` for that place. Two devices collide only when both create the same next file for the same place, and that collision is the merge in step 4.

Psalm 118's section is the letter in lowercase ASCII, in the order already named in `src/content/office/resolve.ts`: aleph, beth, ghimel, daleth, he, vau, zain, heth, teth, iod, caph, lamed, mem, nun, samech, ain, phe, sade, coph, res, sin, tau. Aleph is verses 1–8. Nun is the fourteenth, verses 105–112. Any other section on 118 is skipped.

Another divided psalm uses the numeric `part` from `PsalmSlice` in `src/content/office/cursus.ts`. Psalm 36 is `1` and `2`. A whole psalm has no section piece.

A name is skipped when the id is not two digits, the kind is not `psalm`, the number is outside 1–150, the section is not the one that place uses, or the file is not `.md`. The other files in the folder still load. Skipping is reported the way an unknown work key is reported on bundle import.

## File

The filename is the identity. The header is what the screen shows and what the merge compares. The body is the note.

```md
---
title: Memoria verbi
at: 2026-10-22
updated: 2026-10-22T22:13:00.000Z
---

The eighth verse of Nun...
```

`title` is a single line. `at` is the civil date the note was written. `updated` is an ISO timestamp and moves when the body or the title changes. A file with no header still parses: the title is the filename, `at` and `updated` are absent, and an absent `updated` sorts as older than any present timestamp.

The body may be empty. An empty body is a note that has been opened and not yet written.

## Where it shows

The office already knows the open slice (`PsalmSlice`: psalm, and `from` / `to` or `part`). That slice is the place:

- Psalm 118: the section letter for `from`, lowercased. Verses 105–112 are `nun`.
- A slice with `part`: that number.
- A whole psalm: the number alone.

The notes for that place are listed on the section, under the English. Each one shows its title and its body as a reading view: paragraphs, lists, and pipe tables. The app displays the files. It does not create or edit them. The markdown is written in the folder, and a sync read brings it onto the device.

The line highlight stays where it is. `annotationForLine` in `src/components/Office.tsx` still reads `annotations` on the session document. Opening Nun does not copy those lines into files, and a markdown file does not write its body back into the JSON.

## Local store

`localStorage` remains the live store for the pass (`session.${work}`). Notes go in the existing IndexedDB database `lectio`, in a store of their own, keyed by filename. The value is the file text.

A change to a note does not rewrite the session document. A change to a sitting does not rewrite the note store. The two merges stay separate.

## Merge

Identity is the filename. Apply it once per name present on either side.

| Case | Rule |
| --- | --- |
| The name is on one side only | Keep it. |
| Both sides have the same body | Leave it. |
| Both texts differ | Keep the file with the later `updated`. Record the other text for a one-line notice. |
| One side has a tombstone and the other has the note | The later `updated` wins. A later tombstone removes the note. A later note restores it. |
| A name that does not parse | Skip it and name it in the notice. |

The notice is one line, in the same place the bundle merge already reports a diverged line note. Sittings are not part of this merge.

A delete writes a tombstone beside the note: `notes/09_psalm_118_nun.md.deleted`, whose body is the `updated` timestamp. The note file is removed. The tombstone is what the other device reads, so a later sync does not put the note back. Tombstones are kept. This plan does not garbage-collect them.

## Transports

`sync.md` merges the JSON. `service-sync.md` stores that JSON. This plan adds the folder around that file. One device still uses one transport at a time.

**Folder (step 3).** Desktop reopens the directory with the File System Access API. A handle left from the old single-file picker is ignored until a folder is chosen. The phone keeps a security-scoped bookmark of the folder. On launch, read `lectio-sessions.json` and merge it as today, then read `notes/` into the local note store. Write a note file a few seconds after a real edit. A pull reads notes and does not write them back.

**Service (step 4).** `LECTIO_SYNC_DIR` is the folder on the computer that runs the service. The path stays outside the repo. `GET` and `PUT /lectio-sessions.json` keep the route, the token, and the etag rule from `service-sync.md`, and they read `<dir>/lectio-sessions.json`. A process started with `LECTIO_SYNC_FILE` alone is unchanged, and it serves no notes.

Notes are their own routes. `GET /notes` lists each name with its etag, `updated`, and text, so a client can pull every note in that one response. `GET /notes/:name` returns the bytes. `PUT /notes/:name` replaces that file when `If-Match` is the current etag, through the same temp-file rename the bundle already uses. One lock per file. The body cap stays 1 MiB per file. The service stores the bytes as sent and does not merge. A `412` leaves this device's note in place for the next read.

`:name` accepts a note file or its tombstone, and nothing else. Any other path is `404`, as it is today.

## Where the code goes

- `src/session/notes.ts` — parse a filename, parse a file, list the notes for a place, choose the next id. The office calls this. It does not walk the cursus on its own.
- `src/session/notes.test.ts` — the names in the table above, a skipped name, a missing header, and the next free id.
- The IndexedDB note store, beside the file handle the sync database already keeps.
- `src/components/Office.tsx` — list and edit the notes for the open slice.
- `src/session/syncHost.ts` and `SyncFilePlugin.swift` — the folder, in step 3.
- `services/sync/server.ts` — the note routes, in step 4. The server still does not import `src/`.

## Order

The checklist at the top is the tracker. Do the steps in that order. Check an item when it opens in the app and a test covers it. Step 1 is the parser, so its tests are enough. Step 2 does not start until 1 is ticked. Step 4 does not start until a folder round-trip works.

Step 1's tests cover `09_psalm_118_nun.md`, a whole psalm, a numeric part, a bad name, a file with no header, and the next free id on a place that already has `01` and `03`.

## Out of scope

Putting the note body into `annotations` or into `lectio-sessions.json`. Replacing the progress JSON with one file per sitting. A markdown renderer. Notes on a library work (De gradibus, the Confessions, the Rule, the Sermons). Moving the merge into the service. Accounts. Calling the Google Drive API. Opening the service on the public internet. Putting the folder, the token, or a note in this repo. Syncing while the phone app is suspended. A CRDT. Last-write-wins on the whole folder.

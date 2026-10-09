# Sync across devices

**Current step: 1. Bundle and merge** (not started). Tick a box here when that piece lands, and move the current-step line with it.

- [x] 0. Plan
- [ ] 1. Bundle and merge
  - [ ] `cursorAt` and `touchedAt` on the session document
  - [ ] `mergeSession` and tests
  - [ ] Read and write `lectio-sessions.json`
  - [ ] Home export and import, with a short merge result
  - [ ] Single-work import writes `session.${work}` and does not replace a different open pass
- [ ] 2. Synced file
  - [ ] Pick the file once per device
  - [ ] Read it on launch
  - [ ] Write it a few seconds after a real edit, not on each keystroke
- [ ] 3. Resume
  - [ ] Read again when the app becomes active
  - [ ] Offline, keep the local copy and merge on the next successful read

Progress for a pass lives in `localStorage` on the device that wrote it (`session.${work}`). The phone app is a Capacitor shell, so its store is that WebView, separate from the browser. Export / Import moves one work’s file and replaces the open document. Two devices that both read in one day cannot be combined that way: the later file drops sittings and notes that exist only on the other side.

This plan keeps `localStorage` as the live store. Sync copies one bundle and merges it. The merge is the part that has to be right. The transport can follow.

## Bundle

`lectio-sessions.json` is a map of work id to that work’s session JSON. The value under each key is the same document already stored at `session.${work}` (`SessionDoc` in `src/session/document.ts`). A work with no stored pass is omitted.

`cursus` is a key even though it is not a library work id. The office pass is stored there. Library passes use their work id (`gradibus`, `canticum`, `cantica`, `rule`, `confessions`, and any later work that sets `session: true`).

```json
{
  "version": 1,
  "sessions": {
    "cursus": {
      "id": "2026-09-27",
      "work": "cursus",
      "pace": 7,
      "started": "2026-09-27",
      "cursor": "mon:prime:1",
      "cursorAt": "2026-10-09T22:15:00.000Z",
      "touchedAt": "2026-10-09T22:15:00.000Z",
      "satWith": [{ "step": "mon:prime:1", "at": "2026-10-09" }],
      "annotations": []
    },
    "gradibus": {
      "id": "2026-09-27",
      "work": "gradibus",
      "started": "2026-09-27",
      "cursor": "cap1-s2",
      "cursorAt": "2026-10-08T14:00:00.000Z",
      "touchedAt": "2026-10-08T14:00:00.000Z",
      "satWith": [{ "step": "cap1-s2", "at": "2026-10-08" }],
      "annotations": []
    }
  }
}
```

`version` is the only field besides `sessions`. It lets a later file shape be rejected or migrated. Unknown work keys are skipped. A value that `parseSession` rejects is skipped, and the other works still merge.

`cursorAt` and `touchedAt` are optional ISO timestamps added onto each session document:

- `touchedAt` moves when a sitting, a note, the cursor, or the pace changes.
- `cursorAt` moves only when the cursor changes.
- Opening a work and saving the empty default from `createSession` sets neither. That empty pass must not look newer than a real one.

Existing files and `localStorage` values without those fields still parse. Missing timestamps sort as older than any present timestamp.

## Merge

`mergeSession(local, remote)` is a pure function. Identity is the work id, not `SessionDoc.id` (today `id` is the start date). Apply it once per key present on either side. Then save each merged document with `saveSession`.

| Field | Rule |
| --- | --- |
| `satWith` | Union by `stepKey`. Keep the earlier `at`. |
| `annotations` | Union by psalm and line. A note with text beats an empty one. If both texts differ, keep the one with the later `at` and record the other for a one-line notice. |
| `cursor` | The side with the later `cursorAt`. A missing `cursorAt` does not move the cursor. |
| `pace` | The side with the later `touchedAt`. |
| `started` | The earlier date. |
| `id` | Keep the local id. |

Sittings never prompt. The only conflict notice is a note whose text diverged.

Import of a single-work session file writes `session.${parsed.work}` and must not replace the pass on screen unless that pass is the same work.

## Home

Sync controls live on Home and cover every pass in the bundle: export `lectio-sessions.json`, import it (merge, then a short result: sittings added, notes added, cursor moved), and later Sync now. The per-work Export / Import buttons stay.

## Transport

Phase 1 does not use the network. The file is downloaded and chosen by hand, which is enough to prove the merge.

Phase 2 writes that same file into a folder the devices already sync (iCloud Drive or Dropbox). Desktop reopens it with the File System Access API. iPhone keeps a document bookmark through Capacitor. The folder copies the bytes. The app still merges, because two devices can each write the file while the other is offline.

No account and no server in these two phases. A private GitHub file would still need this merge, and it would put a personal access token on every device.

## Order

The checklist at the top is the tracker. Do the steps in that order. Step 1’s tests cover union of sittings, a note whose text diverged, an empty pass that must not clobber, an unknown key skipped, and a single-work import that writes the right key.

## Out of scope

Replacing `localStorage` as the live store. Accounts. Syncing theme or reader position outside the session document. A CRDT. Last-write-wins on the whole file.

# Session

**Status.** One Session switch opens the cursus panel. The psalter course counts slices, a fortnight splits Vigils, and the panel browses the week, marks slices, and imports and exports the pass. De gradibus has its own pass: a panel groups its lectio units by chapter with a done box and a next-unread jump, and the card shows the count. Highlight and note are in hand. Each work keeps an independent pass. Implement one section at a time, and only when that section is the work in hand. Check an item only when it opens in the app and a test covers it.

## Branch

This work is on `phase2`. `main` is what TestFlight ships. Merge when the session view opens and its test passes. An unfinished session does not go into a release.

## Goal

A session is one pass through a work. It measures how much of that work is finished and opens the next step. The work decides what a step is, how many finish the pass, and which step comes next. The session stores the record and shows the count. It stores no Latin and no English.

The first course is the psalter, on the weekly cursus in `cursus.ts`. The cursus names the place of each psalm: weekday and hour. The sitting may be on another civil day. Psalm 21 belongs to Sunday Vigils (Matins). It may be opened on Tuesday, and it is still Sunday Vigils. Lectio and Cursus stay as they are. One Session switch opens the panel; it is not placed on a work.

The psalter view is for sitting with every slice of the psalter in seven days or fourteen. Fourteen is the pace offered first. Seven stays available. Vigils is a place in that pass, not an hour the person must keep.

## The interface

Each work that offers a session supplies a course:

```ts
interface SessionCourse {
  total(): number;
  next(cursor: string | null, satWith: readonly string[]): string | null;
}
```

`total` is the number of steps that finish a pass. `next` returns the step to open. The session calls these two. It does not walk a cursus or a treatise on its own.

A step is a string the work chooses. The session stores that string, the civil date, and any note. Progress is how many distinct steps have been sat with, over `total()`. When `next` returns a step already sat with, the view still opens it, and the count stays where it is.

**Psalter.** A step is a slice, the `PsalmSlice` already in `cursus.ts`. `total` is the number of distinct slices, which is more than 150. A whole psalm is one slice. A divided psalm counts each slice: Psalm 36 is two, and Psalm 118 is twenty-two, one letter each. `part` is the label on such a slice (`1`, `2`, or `aleph`), not the thing being counted. Psalms 115 and 116 share a Vespers slot and are two slices. A psalm said every day is one slice. `next` walks the cursus: an open place such as Sunday Vigils, or a daily psalm such as Psalm 4 at Compline. The course decides the order.

**De gradibus.** The same session. `total` is the number of lectio units in `gradibus.lectio`. `next` returns the next of those units not yet sat with, in that list's order. There is no weekday and no hour. The card shows the count of units sat with.

## Boundary

- The session file stores no Latin and no English. A psalm is a Gallican number. A divided psalm is that number plus the slice the cursus already uses. Other cuts keep a numeric `part` (Psalm 36 is 1 and 2). Psalm 118's `part` is the section letter in lowercase ASCII, in the order already named in `resolve.ts`: aleph, beth, ghimel, daleth, he, vau, zain, heth, teth, iod, caph, lamed, mem, nun, samech, ain, phe, sade, coph, res, sin, tau. Aleph is verses 1–8. A highlight is the psalm number plus the office line number Lectio already shows.
- Progress counts each slice once in the pass. Psalms 3, 4, 50, 66, 90, 94, 133, 148, 149, and 150 are said every day (Vigils 3 and 94, Lauds 66, 50, 148, 149, and 150, Compline 4, 90, and 133). Each of those is one slice. The first sitting counts it. Compline still offers Psalm 4 on a later day, and that sitting does not move the count. Skipping it on a later day does not leave the pass unfinished.
- The order is the cursus. A fortnight splits Vigils on the two sixes already in the vigils table. It does not invent another distribution.
- A mark names the cursus place that was opened: weekday, hour, and psalm. `at` is the civil date of the sitting. Sunday Vigils stays open after Sunday night, and may be sat with on Tuesday. The clock does not close a place when its hour has passed.
- One pass is open at a time. A finished pass stays in a short list and can be opened again.
- A note is the person's own words on a line. This section does not send a verse or a note out of the app.

## The file

Created when a pass starts. On the phone it stays in local storage. A fixture in a test is the only copy in the repo.

```json
{
  "id": "2026-09-27",
  "work": "cursus",
  "pace": 14,
  "started": "2026-09-27",
  "cursor": "sun:vigils:21",
  "satWith": [
    { "step": "sun:vigils:21", "at": "2026-09-29" },
    { "step": "compline:4", "at": "2026-09-27" },
    { "step": "sun:prime:118:1-8", "at": "2026-09-28" }
  ],
  "highlights": [{ "psalm": 50, "line": "12" }],
  "notes": [{ "psalm": 50, "line": "12", "text": "", "at": "2026-09-28" }]
}
```

`work` chooses the course; for the cursus it is `"cursus"` (the same psalms, on the weekly cursus). `pace` is 7 or 14 for the cursus; another work may omit it. `started` is the local date the pass began. `cursor` is the step last opened, as the string the work's `next` returns (or null before anything is opened). For the cursus a step is the encoded cursus place — weekday, hour, psalm, and range for a slice of a divided psalm. In the example, `"sun:vigils:21"` is Psalm 21 at Sunday Vigils, and `at` is the Tuesday it was sat with (`started` is Sunday 27 September 2026). A daily psalm carries no weekday: `"compline:4"` is Psalm 4 at Compline every day, and `at` is the first day it was sat with. `satWith` records each slice's `step` and the `at` of its first sitting. `highlights` mark one office line. `notes` are words on a highlighted line, with the date they were written.

## The places

The panel lists a weekday's whole cursus in hour order, whether or not a slice has been sat with. A place that belongs to one weekday is labeled with that weekday and hour, in the labels the app already uses; the civil day the pass is on does not re-label it. Sunday Vigils can be opened on Tuesday, and the psalm is still labeled Sunday Vigils.

A daily psalm stays on its hour and is listed once, though it recurs every day of the pass. Psalm 4 is Compline every day; after it is sat with, another sitting adds nothing to the total, because progress counts each slice once. The first sitting of a slice records its `at`.

**Seven days.** The whole week is the pass; every weekday's hours from Vigils through Compline are listed.

**Fourteen days.** The pass divides in half on `started`. In the first seven days, the first six of each night's Vigils run with the day hours; in the second seven, the second six run. Psalms 3 and 94 belong to the first time Vigils is opened in the pass.

A box beside each psalm marks it done in the pass. Opening a psalm locates Lectio on its place.

## The view

One Session switch sits on the office (cursus) screen. It is not a button on a work card. The pass it opens is the cursus. When the switch is on, the panel is shown; when it is off, the panel is hidden.

- The header shows slices sat with over `total()`.
- The panel browses the week: pick a day (or a psalm 1–150 to locate it across the week) and an hour filter, then tick each psalm's box when it is sat. It lists the whole weekday's cursus whether or not the slice has been sat with; the header count tracks the distinct slices marked.
- Opening a place locates Lectio on that psalm without closing the panel. The line number can be highlighted. A note on a highlighted line is shown under the English.
- Pace is 14 days by default, with 7 days available, chosen in the panel.
- Export writes the session file as JSON, and the browser saves it on this computer. Import reads that same file and replaces the open pass.

## Where the code goes

- `src/session/` — the slice, the session document, the course interface, and the session view. The view calls `total` for the count. It is not a reader component.
- `src/session/cursus.ts` — the psalter course on the weekly cursus. `total` counts distinct slices. `next` walks the cursus.
- `src/session/gradibus.ts` — the De gradibus course. `total` is its lectio length; `next` walks `gradibus.lectio`. `src/session/GradibusSessionView.tsx` is its chapter-grouped panel. Each work keeps an independent pass under its own storage key (`session.cursus`, `session.gradibus`).
- Local storage for the open pass. A pass records its `work`.
- Highlight and note are actions on the open step.

## Sections

- [x] Document, `satWith`, the count of distinct slices over `total()`, and the week browse with a done box. A daily psalm counts once; a place can be marked on a later civil day under its own weekday and hour. One Session switch opens the panel.
- [x] Fortnight: first six of Vigils with the day hours, then the second six.
- [x] Highlight one office line, and a note on that line.
- [x] Export and import the session file as the same JSON.
- [x] De gradibus: its own pass (one per work). `total` is its lectio units, `next` is the next unit not yet sat with, the panel groups units by chapter with a done box and a next-unread jump, and the card shows the count.

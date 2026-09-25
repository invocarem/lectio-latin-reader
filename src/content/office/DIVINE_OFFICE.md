# Divine Office according to the Rule

**Status.** Section 1 is on the `office` branch. Sections 2–6 are not started. Implement one section at a time, and only when that section is the work in hand. Check an item only when that slice is in the app and covered by a test.

## Branch and merge

`main` is what gets shipped. TestFlight builds whatever is on `main`. The office is built on a branch named `office`, cut from current `main`. This plan file may stay on `main`; it does not change the app.

Merge `office` back one section at a time. A section merges when that section opens in the app and its test passes. The branch is not held until all six sections are done.

- The first merge is section 1: the clock (10:19 on 24 Sep 2026 opens Thursday Terce, summer, after Pentecost), the weekly psalm cursus, and a reader that opens on that hour.
- Later sections (ordinary, winter and summer, alleluia, solemnities, hymns and collects) each merge the same way, with their own test.
- `main` only gains an Office slice someone can open. An unfinished mode does not go into a release.

**Goal.** A third reader mode, only on the psalter, beside Lectio and Study. It presents the Work of God in chapters 8–20 of the Rule (Vigils through Compline), using the Gallican psalms already in `latin.md`. Label it as the office according to the Rule, not as the Roman Liturgy of the Hours.

The Rule’s text in `src/content/rule/latin.md` (chapters 8–18) is the authority for structure. Where the Rule leaves a gap (“as the abbot appoints,” “as the Roman church sings,” or another weekly distribution if the whole psalter is still said), store one early monastic custom and label it as custom.

## Boundary

- One weekly psalm cursus. Tuesday Prime is always Psalms 7, 8, and Psalm 9 verses 2–19.
- Winter (kalends of November to Easter) and summer (Easter to the kalends of November) change only ferial Vigils lessons: three lessons from the book in winter, one short Old Testament lesson by heart in summer (chapters 9–10). Sunday Vigils stay the same (chapter 11).
- Alleluia follows chapter 15: Easter to Pentecost; Pentecost to the beginning of Lent; Sundays outside Lent. Lent does not replace the psalms.
- A solemnity uses the Sunday order (chapter 14). Only psalms, antiphons, and lessons may be proper. No feast ranks, octaves, or commemorations.
- Psalm text is never copied. A psalm element is a Gallican number plus an inclusive verse range, resolved against the existing chapters (`psalter:9`, and so on) in `index.ts`.

## Where the code goes

- `src/types.ts` — extend `ReaderMode` with `"office"`. Gate the mode on the psalter the way `studyEnabled` is gated. Office is available on the phone as well as the desktop; it does not need facsimile plates.
- `src/components/Home.tsx` — an Office action on the psalter card only.
- `src/App.tsx` and `src/lectioNav.ts` — branch beside Study. `resolveSession` must accept `"office"` for the psalter and ignore it for every other work.
- `src/content/office/` — cursus, ordinary texts, calendar. New.
- An office reader component — one element at a time, prev/next as in `src/lectioNav.ts`. Lectio and Study stay on whole psalms.

An hour is an ordered list of elements: opening versicle, hymn, antiphon, psalm slice, Gloria, capitulum or lesson, responsory, versicle, canticle, Kyrie, Pater, oratio. Each element is marked `winter`, `summer`, or both; an alleluia time; and `feria`, `sunday`, or `solemnity`. The reader keeps the elements that match the chosen day.

## Weekly psalm cursus

Psalm numbers are Gallican, as in `latin.md`. A letter means the psalm is split. Prime cuts are fixed by the plan. Other cuts are the received custom under chapter 18: divide the longer psalm as evenly as the verse numbers in `latin.md` allow, and record the inclusive range next to the slice when that section is implemented.

### Fixed by the Rule

**Prime.** Sunday is four sections of Psalm 118 (eight verses each: 1–8, 9–16, 17–24, 25–32). Monday through Saturday, three psalms a day:

| Day | Prime |
| --- | --- |
| Monday | 1; 2; 6 |
| Tuesday | 7; 8; 9 verses 2–19 |
| Wednesday | 9 verses 20–39; 10; 11 |
| Thursday | 12; 13; 14 |
| Friday | 15; 16; 17 verses 2–25 |
| Saturday | 17 verses 26–51; 18; 19 |

Verse 1 of Psalms 9 and 17 is the title and is not a sung half.

**Psalm 118, continued.** Sunday Terce, Sext, and None take the next nine sections (three each: verses 33–56, 57–80, 81–104). Monday Terce, Sext, and None take the remaining nine (verses 105–128, 129–152, 153–176).

**Little hours, Tuesday through Saturday** (the same every day): Terce 119, 120, 121; Sext 122, 123, 124; None 125, 126, 127.

**Lauds, the psalms the Rule names.** Every day: 66, then 50, then 148, 149, 150. Between 50 and the canticle: Sunday 117 and 62; Monday 5 and 35; Tuesday 42 and 56; Wednesday 63 and 64; Thursday 87 and 89; Friday 75 and 91; Saturday 142. The Saturday Deuteronomy canticle, divided into two Glorias, is a canticle (section 6), not a psalm slice.

**Compline, every day:** 4, 90, 133.

**Vespers, four psalms a day.** Psalms 115 and 116 are one slot. Psalms 138, 143, and 144 are each divided in two.

| Day | Vespers |
| --- | --- |
| Sunday | 109, 110, 111, 112 |
| Monday | 113, 114, 115+116, 128 |
| Tuesday | 129, 130, 131, 132 |
| Wednesday | 134, 135, 136, 137 |
| Thursday | 138 verses 1–12; 138 verses 13–24; 139; 140 |
| Friday | 141; 143 verses 1–8; 143 verses 9–15; 144 verses 1–9 |
| Saturday | 144 verses 10–21; 145; 146; 147 |

### Vigils (custom under chapter 18)

Every night opens with Psalm 3 and Psalm 94, then twelve further psalms. Sunday’s twelve are the consequence of the Rule (Vigils always begin at Psalm 20). The ferial twelve, and which of them are split, are custom: this is one arrangement that uses each remaining psalm once and gives twelve slots a night. Replace the whole table if a better one is chosen; do not mix rows from two schemes.

| Day | First six | Second six |
| --- | --- | --- |
| Sunday | 20, 21, 22, 23, 24, 25 | 26, 27, 28, 29, 30, 31 |
| Monday | 32 verses 1–11; 32 verses 12–22; 33; 34; 36 verses 1–20; 36 verses 21–40 | 37; 38; 39 verses 1–9; 39 verses 10–18; 40; 41 |
| Tuesday | 43 verses 1–13; 43 verses 14–26; 44; 45; 46; 47 | 48; 49; 51; 52; 53; 54 |
| Wednesday | 55; 57; 58; 59; 60; 61 | 65; 67 verses 1–18; 67 verses 19–36; 68 verses 1–19; 68 verses 20–37; 69 |
| Thursday | 70; 71; 72 verses 1–14; 72 verses 15–28; 73 verses 1–12; 73 verses 13–23 | 74; 76; 77 verses 1–36; 77 verses 37–72; 78; 79 |
| Friday | 80, 81, 82, 83, 84, 85 | 86, 88, 92, 93, 95, 96 |
| Saturday | 97, 98, 99, 100, 101, 102 | 103, 104, 105, 106, 107, 108 |

When this section is implemented, a test must show that Psalms 1–150 each appear in the week (daily psalms may repeat), and that no psalm is lost between the day hours and Vigils.

## The clock

The office opens on the hour the civil clock is in. When this is built, one function reads a local date and returns weekday, hour, season, and the chapter 15 time. The reader may still let someone step to another hour; the clock chooses the one that opens.

Civil bands, local time. The Rule counts hours from sunrise; these bands are the reader’s equivalent, and they put 10:19 in Terce.

| From | Until | Hour |
| --- | --- | --- |
| 00:00 | 05:00 | Vigils |
| 05:00 | 06:00 | Lauds |
| 06:00 | 09:00 | Prime |
| 09:00 | 12:00 | Terce |
| 12:00 | 15:00 | Sext |
| 15:00 | 18:00 | None |
| 18:00 | 20:00 | Vespers |
| 20:00 | 24:00 | Compline |

Season follows chapter 8. Summer is Easter through the day before 1 November. Winter is 1 November through the day before Easter.

The chapter 15 time, which a later calendar calls ordinary time after Pentecost when the date falls in the middle span:

- `easter` — Easter day through Pentecost day.
- `after-pentecost` — the day after Pentecost until the day before Ash Wednesday.
- `lent` — Ash Wednesday until the day before Easter.

Acceptance: 10:19 on 24 September 2026 is Thursday, Terce, summer, `after-pentecost`. Easter 2026 is 5 April; Pentecost is 24 May.

## Sections

After section 4 the office matches what the Rule describes. Sections 5 and 6 fill the places the Rule leaves open.

### 1. Weekly psalms

- [x] Clock, as specified above: 10:19 on 24 Sep 2026 opens Thursday Terce, summer, after Pentecost.
- [x] `ReaderMode` includes `"office"`. Home shows Office on the psalter only. `App` and `resolveSession` open it. Other works cannot request it. The reader opens on that clock.
- [x] Cursus table in `src/content/office/`, psalm slices only, ranges resolved from the Gallican chapters.
- [x] Prime cuts: Psalm 9 at 2–19 and 20–39; Psalm 17 at 2–25 and 26–51; Psalm 118 in sections of eight verses.
- [x] Vespers: 115 with 116; 138, 143, and 144 each in two ranges taken from `latin.md`.
- [x] Vigils table above, marked as custom.
- [x] Office reader: choose weekday and hour, walk the slices one at a time.
- [ ] Verse map for all 150 psalms, one psalm at a time, in `src/content/office/VERSE_MAP.md`. Psalms 1, 12–14, and 119–133 are entered (12 is relined, including cuts inside a Gallican verse; 13 drops *In finem. Psalmus David.*; 14 drops *Psalmus David.*; 119 is rejoined; 120–133 drop the *Canticum graduum* title). Every other psalm still shows the Gallican verses.

### 2. Ordinary of the hour

Texts the Rule names, repeated every day. Store the Latin with the office, not in `latin.md`.

- [ ] Vigils opening: *Domine, labia mea aperies* (three times, as chapter 9), then Psalm 3 and Gloria, then Psalm 94.
- [ ] *Deus, in adiutorium* and Gloria at the other hours.
- [ ] Gloria after each psalm. At Prime the three psalms are each under their own Gloria (chapter 17).
- [ ] Kyrie.
- [ ] Lord’s Prayer: the whole prayer aloud at Lauds and Vespers; at the other hours the ending only, *Sed libera nos a malo* (chapter 13).
- [ ] *Benedictus* at Lauds, *Magnificat* at Vespers.
- [ ] *Benedicite* (Daniel 3) at Sunday Lauds.
- [ ] Sunday Vigils: *Te Deum* and *Te decet laus*.

### 3. Winter and summer

- [ ] A season control: winter or summer.
- [ ] Ferial Vigils keep the same psalms. The lesson slot is three lessons from the book, each with a responsory, in winter, and one short Old Testament lesson by heart with a short responsory in summer.
- [ ] Sunday Vigils do not change with the season.

### 4. Alleluia

A flag on elements that already exist. Four times, from chapter 15:

- [ ] Easter to Pentecost: Alleluia throughout, in psalms and responsories.
- [ ] Pentecost to the beginning of Lent: Alleluia only with the last six psalms of Vigils.
- [ ] Sundays outside Lent: Alleluia at the canticles, Lauds, Prime, Terce, Sext, and None. Vespers keeps its antiphons.
- [ ] Responsories take Alleluia only from Easter to Pentecost.
- [ ] Lent uses this flag. It does not replace the weekly psalms.

### 5. Solemnities

A date marked solemn uses the Sunday list. Proper pieces override only their own slots.

- [ ] Day-kind on each element: feria, Sunday, or solemnity.
- [ ] First feasts, Sunday order, with a place for proper psalms, antiphons, and lessons: Christmas, Epiphany, Easter, Ascension, Pentecost.
- [ ] No ranks, octaves, or commemorations.

### 6. Texts the Rule does not print

Label each item hymn, canticle, or collect. These are custom, not verses of the Rule.

- [ ] Hymn of each hour.
- [ ] Ferial Old Testament canticles at Lauds (“as the Roman church sings”).
- [ ] Saturday Lauds: the Deuteronomy canticle in two Glorias.
- [ ] Three Sunday Vigil canticles (“as the abbot appoints”).
- [ ] Capitula and the collects of the hours.

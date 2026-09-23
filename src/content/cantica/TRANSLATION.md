# Cantica — Close English translation plan

**Goal.** Replace the ornamental 1895 Eales rendering of Bernard's *Sermones in
Cantica Canticorum* (86 sermons) with a **close, sentence-aligned English**,
so that each Lectio page pairs its Latin and English as one unit (no English
overflowing its Latin, as Eales does). Eales is dropped everywhere.

**Why sentence-aligned.** Lectio pages are split on **Latin sentence
boundaries** by `src/content/splitLectio.ts`. If the English has **one
sentence per Latin sentence, in the same order** (as *De gradibus* does), each
Latin page pairs with the matching English page. A close literal translation
therefore both removes the "decoration" *and* fixes the pairing.

Two enabling changes to `src/content/splitLectio.ts` (both low-risk):

- **`sentenceAligned` opt-in** (used only by cantica): slices the English with
  the *same sentence-index boundaries* as the Latin pages, so a page is the
  same material in both languages. All other callers (e.g. confessions) keep
  the legacy independent grouping. (With no code change, English pages could
  drift from their Latin whenever sentence lengths crossed the 12‑word merge
  threshold differently.)
- **Expanded `ABBREV` set** with the PL book abbreviations (Iudic, Isai, Ierem,
  Galat, Ephes, Iac, Esdr, Machab, etc.). PL citations like `(Isai. LI, 3)`
  were splitting the Latin into spurious "sentences"; this stops that. The
  validator keeps an identical list (`--scan` finds any forgotten one).

## Workflow per sermon

1. Run `node scripts/cantica_check.mjs --dump <n>` to read the sermon's Latin
   sentence-by-sentence (the sentence boundaries the alignment uses).
2. Write one English sentence per Latin sentence in
   `src/content/cantica/renderings/close.json` under
   `chapters["<sermon#>"]["<paragraph#>"]`. Use Arabic-numeral Bible refs
   (e.g. `(1 Cor. 3:2)`) so the English doesn't fracture, and do **not** carry
   the PL footnote markers (trailing `2`, `3`, …) into English.
3. Validate with `node scripts/cantica_check.mjs` — it reports any paragraph
   whose English sentence count differs from its Latin.
4. Do **not** edit `latin.md` or `scaffold.ts` (authoritative / regenerated).
   Only `work.ts`, `index.ts`, `splitLectio.ts` (already changed), and
   `renderings/close.json` change.

## Infrastructure status

- [x] `work.ts` points at `renderings/close.json` under translation id `close`
- [x] `index.ts` reads `segment.translations.close` (Lectio English)
- [x] Eales references removed from `work.ts` / `index.ts`
- [x] `renderings/eales.json` deleted
- [x] README table updated (cantica row: `renderings/close.json`)
- [x] `renderings/close.json` created (Sermones 1–18 translated)
- [x] validator `scripts/cantica_check.mjs` written (`--dump`, `--scan`, alignment check)
- [x] `splitLectio.ts`: `sentenceAligned` opt-in added (cantica-only)
- [x] `splitLectio.ts`/validator: PL `ABBREV` set extended; fracture scan clean
- [x] `npx tsc -b` check pending re-run after edits
- [ ] full `npm run build` passes once Sermo 1 is fully translated

## Sermon checklist (86)

`[x]` = translated in `close.json`, aligned by the validator, and reviewed.
Sermon numbers match the `chapters` keys in `close.json`.

### Sermones 1–20
- [x] 1
- [x] 2
- [x] 3
- [x] 4
- [x] 5
- [x] 6
- [x] 7
- [x] 8
- [x] 9
- [x] 10
- [x] 11
- [x] 12
- [x] 13
- [x] 14
- [x] 15
- [x] 16
- [x] 17
- [x] 18
- [x] 19
- [x] 20

### Sermones 21–46
- [x] 21
- [x] 22
- [x] 23
- [x] 24
- [x] 25
- [x] 26
- [x] 27
- [x] 28
- [x] 29
- [x] 30
- [x] 31
- [x] 32
- [x] 33
- [x] 34
- [x] 35
- [x] 36
- [x] 37
- [ ] 38
- [ ] 39
- [ ] 40
- [ ] 41
- [ ] 42
- [ ] 43
- [ ] 44
- [ ] 45
- [ ] 46

### Sermones 47–66
- [ ] 47
- [ ] 48
- [ ] 49
- [ ] 50
- [ ] 51
- [ ] 52
- [ ] 53
- [ ] 54
- [ ] 55
- [ ] 56
- [ ] 57
- [ ] 58
- [ ] 59
- [ ] 60
- [ ] 61
- [ ] 62
- [ ] 63
- [ ] 64
- [ ] 65
- [ ] 66

### Sermones 67–86
- [ ] 67
- [ ] 68
- [ ] 69
- [ ] 70
- [ ] 71
- [ ] 72
- [ ] 73
- [ ] 74
- [ ] 75
- [ ] 76
- [ ] 77
- [ ] 78
- [ ] 79
- [ ] 80
- [ ] 81
- [ ] 82
- [ ] 83
- [ ] 84
- [ ] 85
- [ ] 86

## Notes

- Keep each paragraph's English as one string in `close.json`; sentence
  boundaries are detected the same way the Latin is, so short sentences are
  coalesced identically on both sides.
- Cite verses in the same place/order as the Latin (e.g. `(1 Cor. 2:13, 6)`).
- Range of the cycle: reaches Song 3:1 at Sermo 86.

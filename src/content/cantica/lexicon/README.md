# Build the Cantica vocabulary

This folder is the closed word list for Bernard of Clairvaux's *Sermones in Cantica Canticorum* (86 sermons). The reader looks words up here. It does not call Whitaker on every click, and it does not ship a general dictionary.

The pipeline tools all take `--work cantica`:

```bash
python scripts/extract_wordlist.py --work cantica                  # forms.json word list
bash scripts/analyze-in-docker.sh --work cantica --limit 20        # smoke test
bash scripts/analyze-in-docker.sh --work cantica                   # full list
python scripts/parse_analyses.py --work cantica                    # analyses.json -> lexicon.json
python scripts/apply_overrides.py --work cantica                   # merge overrides.json
```

## Status

| File | Status |
| --- | --- |
| `forms.json` | Done. 25,132 forms / 162,392 tokens from `content/cantica/latin.md`. |
| `analyses.json` | Done (generated; gitignored). Whitaker Words, 0 misses. |
| `lexicon.json` | Done. 25,132 entries; Whitaker glosses + curated cards merged. |
| `overrides.json` | Done. 146 curated cards (proper nouns + real words Whitaker missed). |

## About the 304 forms with no Whitaker gloss

Whitaker defines 24,828 of the 25,132 forms. The remaining 304 are three different things:

- **Citation-apparatus noise** (~90) — Bible-book abbreviations (`cant`, `prov`, `sap`, `ephes`, `exod`, `thren`, `iac`, `eccle`, …) and Roman numerals (`iv`, `vii`, `xv`, …) that Bernard's inline references leak onto line text even outside parentheses. These are not Latin words.
- **Proper nouns** — biblical people and places, heretics and thinkers, plus Bernard's own milieu (`Girardus` = Gerald of Clairvaux). ~120 of these are curated in `overrides.json` so the popup shows an English identification.
- **OCRed / Medieval-script typos of the source** (~90) — e.g. `tubernaculum`, `deprebendendas`, `homiminumque`, `tanquan`, `vercaiter`. These are misexpansions in the Migne/DCO text, not dictionary heads; they are intentionally left as "(no gloss)".

`apply_overrides.py` is idempotent and was already run, so `edited`/`curated` are merged into `lexicon.json`. Curation is a **starter set**, not exhaustive: to add, edit `overrides.json` (key → `{lemma?, pos?, gloss, note?}`) and re-run the apply step; a missing key aborts so a dangling card can't slip in.

## Notes

- `content/cantica/latin.md` is the source (`## Sermo N`, numbered paragraphs). The app never edits it.
- `first` on each form is the sermon number (`1`..`86`) where the word first appears.
- The root `README.md` and its Lexicon section describe the shared pipeline; `content/gradibus/lexicon/README.md` is the same for the treatise.

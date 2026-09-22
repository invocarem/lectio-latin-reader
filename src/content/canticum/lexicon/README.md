# Build the Canticum vocabulary

This folder is the closed word list for the Song of Songs (*Canticum Canticorum*). The reader looks words up here. It does not call Whitaker on every click, and it does not ship a general dictionary.

The pipeline tools all take `--work canticum`:

```bash
python scripts/extract_wordlist.py --work canticum                  # forms.json word list
bash scripts/analyze-in-docker.sh --work canticum --limit 20        # smoke test
bash scripts/analyze-in-docker.sh --work canticum                   # full list
python scripts/parse_analyses.py --work canticum                    # analyses.json -> lexicon.json
python scripts/apply_overrides.py --work canticum                   # merge overrides.json
```

## Status

| File | Status |
| --- | --- |
| `forms.json` | Done. 829 forms / 1,799 tokens from `content/canticum/latin.md`. |
| `analyses.json` | Done (generated; gitignored). Whitaker Words, 0 misses. |
| `lexicon.json` | Done. 829 entries, Whitaker glosses + curated cards merged. |
| `overrides.json` | Done. 9 curated proper-noun cards (places/names Whitaker can't gloss). |

## Notes

- `content/canticum/latin.md` is the source (`## Caput N`, verse-numbered paragraphs). The app never edits it.
- `first` on each form is the chapter number (`1`..`8`) where the word first appears.
- Whitaker defines 820 of the 829 forms. The 9 it cannot gloss are all proper nouns (Galaad, Engaddi, Bether, Israël, Sion, Sanir, Hermon, Aminadab, Hesebon) — each has a curated `edited.gloss` in `overrides.json`, so the popup shows an English identification instead of "(no gloss)".
- `apply_overrides.py` is idempotent and was run, so `edited`/`curated` are already merged into `lexicon.json`.

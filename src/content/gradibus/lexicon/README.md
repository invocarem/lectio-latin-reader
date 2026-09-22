# Treatise vocabulary

Closed word list for *De gradibus humilitatis et superbiae*. The reader looks words up here. It does not call Whitaker on every click, and it does not ship a general dictionary.

Latin is taken from `src/content/latin-units.json` (j written as i). Rebuild `forms.json` after that file changes.

## Rebuild

Needs Docker and a Whitaker image (Words at `/opt/whitakers-words/bin/words`). This machine already has `whitaker-mcp`; otherwise:

```bash
docker build -t whitaker-mcp -f services/whitaker/Dockerfile services/whitaker
```

```bash
npm run lexicon:extract
bash scripts/analyze-in-docker.sh --limit 20    # smoke test
bash scripts/analyze-in-docker.sh               # full list (a few minutes)
npm run lexicon:parse
npm run lexicon:curate
```

`analyses.json` is gitignored. Tracked files are `forms.json`, `lexicon.json`, and `overrides.json`.

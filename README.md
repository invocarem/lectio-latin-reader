# Lectio

A parallel Latin–English reader for Bernard of Clairvaux’s *De gradibus humilitatis et superbiae* (*The Steps of Humility and of Pride*), from Migne, *Patrologia Latina* 182, columns 939–972. The retractatio stands on 939–940; the treatise itself begins with the praefatio on 941.

Latin is taken from the facsimile plates, with consonantal *j* written as *i* (*iam*, *iudicii*, *eius*). English is written to match each numbered section, so both columns stay on the same step of the lectio. Click a paragraph to highlight it in both languages and show the matching plate. Click a Latin word for a gloss from the treatise lexicon (curated Bernard cards where they exist, otherwise Whitaker).

## Run

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

```bash
npm run build    # production build
npm run preview  # serve the build
```

## Contents

The treatise is split into 82 units: retractatio, preface, twenty-two chapter titles, and numbered sections 1–57.

| Path | Role |
| --- | --- |
| [`public/facsimiles/`](public/facsimiles/) | PL plates, including `pl-939-940.png` (retractatio) and `pl-945-946.png` |
| [`src/content/de-gradibus.json`](src/content/de-gradibus.json) | Aligned Latin, English, and plate references |
| [`src/content/latin-units.json`](src/content/latin-units.json) | Latin units before English is merged |
| [`src/content/lexicon/`](src/content/lexicon/) | Closed word list: `lexicon.json` (reader), `overrides.json` (Bernard cards) |
| [`scripts/merge_english.py`](scripts/merge_english.py) | Rebuilds `de-gradibus.json` from the Latin units and English map |
| [`scripts/extract_wordlist.py`](scripts/extract_wordlist.py) | `latin-units.json` → `forms.json` |

The reader is a TypeScript Vite + React app. Chapter navigation is on the left; Latin and English run in parallel; the current facsimile can be toggled from the header.

## Lexicon

Do not ship a general dictionary, and do not call Whitaker on every click. Extract the treatise once, analyze it in Docker, look the answers up locally.

```bash
npm run lexicon:extract
bash scripts/analyze-in-docker.sh 20    # smoke test
npm run lexicon:analyze                 # full list
npm run lexicon:parse
npm run lexicon:curate
```

Needs a Whitaker image (Words at `/opt/whitakers-words/bin/words`). Build with `docker build -t whitaker-mcp -f services/whitaker/Dockerfile services/whitaker` if you do not already have one. Detail: [`src/content/lexicon/README.md`](src/content/lexicon/README.md).

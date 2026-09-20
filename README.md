# Lectio

A parallel Latin–English reader for Bernard of Clairvaux’s *De gradibus humilitatis et superbiae* (*The Steps of Humility and of Pride*), from Migne, *Patrologia Latina* 182, columns 939–972. The retractatio stands on 939–940; the treatise itself begins with the praefatio on 941.

Latin is taken from the facsimile plates. English is written to match each numbered section, so both columns stay on the same step of the lectio. Click a paragraph to highlight it in both languages and show the matching plate.

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
| [`scripts/merge_english.py`](scripts/merge_english.py) | Rebuilds `de-gradibus.json` from the Latin units and English map |

The reader is a TypeScript Vite + React app. Chapter navigation is on the left; Latin and English run in parallel; the current facsimile can be toggled from the header.

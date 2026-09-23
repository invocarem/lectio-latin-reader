# Lectio

A parallel Latin–English reader for Bernard of Clairvaux’s *De gradibus humilitatis et superbiae* (*The Steps of Humility and of Pride*), from Migne, *Patrologia Latina* 182, columns 939–972. The retractatio stands on 939–940; the treatise itself begins with the praefatio on 941.

**Lectio** is the default: one short Latin paragraph, with English underneath if you want it. **Study** is the older two-column view of each Patrologia section. Click a Latin word for a gloss from the treatise lexicon (curated Bernard cards where they exist, otherwise Whitaker).

Latin is taken from the facsimile plates, with consonantal *j* written as *i* (*iam*, *iudicii*, *eius*). English is written to match each numbered section.

## Run

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

```bash
npm run build    # production build
npm run preview  # serve the build
npm run content  # rebuild de-gradibus.json from latin-units.json
```

## iOS (Mac)

The iPhone app is a Capacitor shell around that Vite bundle, the same pattern as `~/code/lectio`. Xcode does **not** watch `src/`. It loads a copied snapshot in `ios/App/App/public`. `npm run dev` only updates the browser.

This project uses a **separate** bundle ID, `com.invocarem.lectiolatinreader`. Do not reuse Lectio’s `com.invocarem.lectio`: Apple treats the bundle ID as the app, so sharing it would upload this binary as a new TestFlight build of Lectio and replace that app for testers.

### First run

You need a Mac with Xcode (from the App Store; open it once to finish setup). The app targets iOS 15+.

```bash
npm install
npm run ios
```

That builds the web app, copies it into the iOS project, and opens `ios/App/App.xcodeproj`.

1. In Xcode, select the **App** scheme and your iPhone (or a simulator) in the destination menu.
2. Under **Signing & Capabilities**, choose your Apple Developer team. The bundle ID is `com.invocarem.lectiolatinreader`.
3. Press Run (⌘R). On a physical phone, if iOS asks you to trust the developer, open **Settings → General → VPN & Device Management** and trust the certificate.

### After changing web or UI code

```bash
npm run cap:sync
```

Then Run again in Xcode. That command is `npm run build` plus `npx cap sync ios`. Skipping it leaves Xcode on the old UI.

If the phone still shows the previous UI after a sync, delete the app from the device and Run again. WKWebView can keep the old bundle.

### TestFlight

You need a paid [Apple Developer Program](https://developer.apple.com/programs/) membership (this project’s team is already set: `RD9Q6XUA82`). Bundle ID is `com.invocarem.lectiolatinreader`.

1. Sync the web UI into the iOS project:

   ```bash
   npm run cap:sync
   ```

2. In [App Store Connect](https://appstoreconnect.apple.com) → **Apps** → **+**, create a new iOS app with bundle ID `com.invocarem.lectiolatinreader` (register that ID under [Certificates, Identifiers & Profiles](https://developer.apple.com/account/resources/identifiers/list) first if it is missing). You cannot attach this binary to the existing Lectio listing.

3. In Xcode, open `ios/App/App.xcodeproj`. Select the **App** target → **Signing & Capabilities** → your team, Automatic signing.

4. Destination menu: **Any iOS Device (arm64)** (not a simulator). **Product → Archive**.

5. In the Organizer, **Distribute App** → **App Store Connect** → **Upload**. Xcode will create an Apple Distribution certificate on first upload if needed.

6. Back in App Store Connect → the app → **TestFlight**. Wait until the build finishes processing (often 5–30 minutes).

7. Internal testers (people on your App Store Connect team) can install from the TestFlight app as soon as processing finishes. External testers need a group, a short “What to Test” note, and a first-time Beta App Review.

Each new TestFlight build needs a higher **Build** number (`CURRENT_PROJECT_VERSION` in the App target; it is `1` today). The marketing version (`1.0`) can stay the same.

## Contents

The treatise is split into 82 source units: retractatio, preface, twenty-two chapter titles, and numbered sections 1–57. Long units are broken into lectio paragraphs (`praefatio-s1`, `praefatio-s2`, …) when English is merged. `latin-units.json` is left unchanged.

| Path | Role |
| --- | --- |
| [`public/facsimiles/`](public/facsimiles/) | Per-work PL plates: [`gradibus/`](public/facsimiles/gradibus/) (`pl-939-940.png` retractatio, `pl-941-942.png` treatise) and [`songs/`](public/facsimiles/songs/) (PL 183 sermons) |
| [`src/content/gradibus/`](src/content/gradibus/) | The *De gradibus* work: `de-gradibus.json` (aligned Latin, English, plate references, lectio `chunks`), `latin-units.json` (source), `lexicon/` (Bernard word list) |
| [`src/content/canticum/`](src/content/canticum/) | The Song of Songs: `latin.md` + `scaffold.ts`/`work.ts`, `renderings/douay.json`, `lexicon/` |
| [`src/content/cantica/`](src/content/cantica/) | Bernard's *Sermones in Cantica Canticorum*: `latin.md` + `scaffold.ts`/`work.ts`, `renderings/close.json`, `columns.json` (PL 183 plate map), `lexicon/` |
| [`src/content/psalter/`](src/content/psalter/) | The Psalter work: `latin.md` + `scaffold.ts`/`work.ts`, `renderings/` (Coverdale, Douay-Rheims), `lexicon/` |
| [`src/content/rule/`](src/content/rule/) | The Rule of St Benedict work: `latin.md` + `scaffold.ts`/`work.ts`, `renderings/verheyen.json`, `lexicon/` |
| [`src/content/confessions/`](src/content/confessions/) | Augustine's *Confessiones*: `latin.md` + `scaffold.ts`/`work.ts`, `renderings/pusey.json`, `lexicon/` |
| [`src/content/schema.ts`](src/content/schema.ts) | Legacy nested content schema (Work → parts → chapters → paragraphs → segments) |
| [`src/content/works.ts`](src/content/works.ts) | Work registry listing every registered work for the reader |
| [`scripts/merge_english.py`](scripts/merge_english.py) | Rebuilds `de-gradibus.json` from the Latin units and English map |
| [`scripts/split_lectio.py`](scripts/split_lectio.py) | Breaks long units into lectio chunks |
| [`scripts/extract_cantica_plates.py`](scripts/extract_cantica_plates.py) | Maps PL 183 columns onto sermon paragraphs and renders `public/facsimiles/songs/` |

The reader is a TypeScript Vite + React app. Lectio shows one paragraph; study mode keeps chapter navigation on the left with Latin and English in parallel. The facsimile can be toggled from the study header.

## Lexicon

Do not ship a general dictionary, and do not call Whitaker on every click. Extract the word list once, analyze it in Docker, look the answers up locally. The pipeline tools take `--work` (default `gradibus`):

```bash
python scripts/extract_wordlist.py --work canticum      # build forms.json word list
bash scripts/analyze-in-docker.sh --work canticum --limit 20   # smoke test
bash scripts/analyze-in-docker.sh --work canticum       # full list
python scripts/parse_analyses.py --work canticum        # analyses.json -> lexicon.json
python scripts/apply_overrides.py --work canticum       # merge curated overrides.json
```

Needs a Whitaker image (Words at `/opt/whitakers-words/bin/words`). Build with `docker build -t whitaker-mcp -f services/whitaker/Dockerfile services/whitaker` if you do not already have one. Detail: [`src/content/lexicon/README.md`](src/content/lexicon/README.md).

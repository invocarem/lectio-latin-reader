# Lectio

A reader for a few Latin works, with a close English beside the Latin. The title is **Lectio**, and so is the name under the icon. On the home screen the line under the title is *Lectio per cancellos*.

The front of the home screen is the weekly cursus of the Psalms according to the Rule. Under **Other works** are Bernard’s *Steps of Humility and Pride*, his sermons on the Song of Songs, the Rule of St Benedict, Augustine’s *Confessions*, the Psalter, and the Song itself.

Each page is one short passage.

- **Lectio** reads a work section by section.
- **Cursus** reads the psalms of the hours.
- **Study**, on a wide screen, is the two-column view with the facsimile.

A control on the Lectio and Cursus pages sets the text to Latin, Latin and English, or English only. That choice is kept. Study keeps its own column switch. Tapping a Latin word opens a gloss from that work’s lexicon.

A **pass** counts the slices read, so a long work can be finished a little at a time. Progress and notes stay on the device. They can sync through a shared folder or the home sync service.

## Run

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5180`).

```bash
npm run build    # production build
npm run preview  # serve the build
npm run content  # rebuild de-gradibus.json from latin-units.json
```

## Sync service

These steps are for the computer that hosts the service. The phone and the other computers only enter its URL and token.

`services/sync` is a small HTTP store for `lectio-sessions.json` and, when `LECTIO_SYNC_DIR` is set, the `notes/` directory beside it. It is a plain conditional-write store (`GET`/`PUT` with an `ETag`/`If-Match`); the app still does the merge. A process started with `LECTIO_SYNC_FILE` alone serves the JSON and no notes. The full plan is in `service-sync.md`.

`GET /notes` includes each note’s text in that one list. Restart the service after updating this repo so a sync can pull the notes in a single request. An older service still works: the app then fetches the note files together, rather than one after another.

Run it directly on any machine with Node 22+ (no install step):

```bash
export LECTIO_SYNC_FILE=/path/to/lectio-sessions.json
export LECTIO_SYNC_TOKEN="$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")"
npm run sync:serve
```

It binds to `127.0.0.1:3010` by default and logs the listen address and file path. Publish it with Tailscale Serve so the phone reaches it over an HTTPS tailnet name; do not open the port to the LAN.

On a Docker host (e.g. the Linux box that already runs open-webui):

```bash
docker build -t lectio-sync services/sync
docker rm -f lectio-sync
docker run -d --restart unless-stopped \
  --name lectio-sync \
  -p 0.0.0.0:3010:3010 \
  -v "$HOME/code/hello:/data" \
  -e LECTIO_SYNC_HOST=0.0.0.0 \
  -e LECTIO_SYNC_FILE=/data/lectio-sessions.json \
  -e LECTIO_SYNC_TOKEN="$(openssl rand -hex 32)" \
  lectio-sync
```

`LECTIO_SYNC_HOST=0.0.0.0` is required. The image listens on `127.0.0.1` inside the container, and Docker forwards the published port to the container's other interface, so a process bound only to container loopback never accepts the connection. Publishing `0.0.0.0:3010` on the host lets other machines on the LAN reach ideacentre. `cloudflared` on that same computer still uses `http://127.0.0.1:3010`. `docker rm -f` removes a previous container of the same name and leaves the JSON in `$HOME/code/hello`.

To publish it with an HTTPS name from behind NAT without a router forward, run `cloudflared` as a service (`/etc/systemd/system/cloudflared-lectio.service`):

```ini
[Unit]
Description=Cloudflare tunnel for lectio sync
After=network-online.target
Wants=network-online.target

[Service]
ExecStart=/usr/local/bin/cloudflared tunnel --url http://127.0.0.1:3010
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now cloudflared-lectio
journalctl -u cloudflared-lectio -n 50 | grep -o 'https://[a-z0-9-]*\.trycloudflare\.com'
```

The quick tunnel's `*.trycloudflare.com` URL changes each time `cloudflared` restarts; enter the new one in the app after a reboot. A named tunnel with a domain keeps the URL stable.

The file path and token come from the environment, never from this repo. The route accepts only a version-1 bundle (`{"version":1,"sessions":{…}}`, matching `BUNDLE_VERSION` in `src/session/bundle.ts`), stores the bytes as sent, and does not merge. For a bare `node` process, `LECTIO_SYNC_HOST`, `LECTIO_SYNC_PORT`, and `LECTIO_SYNC_ORIGINS` are optional overrides (see `service-sync.md`). The Docker run above has to set `LECTIO_SYNC_HOST`.

In the app, Home → Progress → **Service** lets a device aim at this service instead of a picked folder. **Set and sync** saves the URL and token and pulls. Once those match what is saved, the button says **Sync now** and only pulls. A device uses either the folder or the service, one at a time. With `LECTIO_SYNC_DIR`, the service reads `lectio-sessions.json` and `notes/` inside that folder. The read is the `GET` and the write is the `PUT` (with the `ETag` as `If-Match`), so a device whose write races another is refused (`412`) and keeps its local progress and notes until the next sync.

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

*De gradibus* is taken from the facsimile plates, with consonantal *j* written as *i* (*iam*, *iudicii*, *eius*). The English is written to match each numbered section. The treatise is split into 82 source units: retractatio, preface, twenty-two chapter titles, and numbered sections 1–57. Long units are broken into lectio paragraphs (`praefatio-s1`, `praefatio-s2`, …) when English is merged. `latin-units.json` is left unchanged.

| Path | Role |
| --- | --- |
| [`public/facsimiles/`](public/facsimiles/) | Per-work plates: [`gradibus/`](public/facsimiles/gradibus/) (`pl-939-940.png` retractatio, `pl-941-942.png` treatise), [`songs/`](public/facsimiles/songs/) (PL 183 sermons), and [`psalter/`](public/facsimiles/psalter/) (Vercellone 1861 Clementine, pp. 340–387) |
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

The reader is a TypeScript Vite + React app. Lectio and Cursus show one passage, in Latin, English, or both. Study keeps chapter navigation on the left with Latin and English in parallel. The facsimile can be toggled from the study header.

## Lexicon

Do not ship a general dictionary, and do not call Whitaker on every click. Extract the word list once, analyze it in Docker, look the answers up locally. The pipeline tools take `--work` (default `gradibus`):

```bash
python scripts/extract_wordlist.py --work canticum      # build forms.json word list
bash scripts/analyze-in-docker.sh --work canticum --limit 20   # smoke test
bash scripts/analyze-in-docker.sh --work canticum       # full list
python scripts/parse_analyses.py --work canticum        # analyses.json -> lexicon.json
python scripts/apply_overrides.py --work canticum       # merge curated overrides.json
```

Needs a Whitaker image (Words at `/opt/whitakers-words/bin/words`). Build with `docker build -t whitaker-mcp -f services/whitaker/Dockerfile services/whitaker` if you do not already have one. Each work keeps its lexicon under its own `lexicon/` directory. The Steps list is [`src/content/gradibus/lexicon/README.md`](src/content/gradibus/lexicon/README.md).

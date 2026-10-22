# Home sync service

**Current step: done.**

- [x] 0. Plan
- [x] 1. File store
  - [x] A missing file reads as empty text
  - [x] Write only when `If-Match` is the current etag
  - [x] A writer that still holds the old etag leaves the file unchanged
  - [x] Two overlapping writes: one lands, the other does not
  - [x] Replace through a temp file in the same directory, then rename
- [x] 2. HTTP
  - [x] `GET` and `PUT` `/lectio-sessions.json`
  - [x] Bearer token, refused at startup when it is missing or short
  - [x] `ETag` on read, `If-Match` on write
  - [x] Reject a body that is not a version-1 bundle, and leave the file unchanged
  - [x] CORS for the iPhone origin and the Vite dev server
  - [x] Listen on `127.0.0.1` unless the host is set
- [x] 3. Run
  - [x] `npm run sync:serve`
  - [x] `services/sync/Dockerfile` and `.dockerignore`; `docker run` publishes to `127.0.0.1`, file and token from the environment via a bind mount
  - [x] File path and token come from the environment, never from the repo
  - [x] Tests for the store, the status table, and one live process
  - [x] Short run notes in the README (Docker on the Linux box, bare `node` elsewhere)
- [x] 4. Reader
  - [x] A transport whose `read` and `write` are the `GET` and the `PUT`
  - [x] A failed write leaves this device's progress in place for the next read
  - [x] The phone can keep the picked file (Google Drive), or save this service instead
  - [x] One device uses one of those at a time

`sync.md` already merges. This plan adds a place for that same file to live on one home computer. The service stores bytes. It does not merge, and it does not replace `localStorage`.

`services/whitaker` is a Docker image used while building the lexicon, then it stops. This process stays up. It still belongs under `services/`, because `webDir` is `dist/` and a program there is not copied into the iPhone app. It does not belong in a second repository: `lectio-sessions.json` and `BUNDLE_VERSION` are defined here.

## File

`LECTIO_SYNC_FILE` is the path of `lectio-sessions.json` on the computer that runs the service. Keep that path outside the repo. It may sit in the Google Drive folder that computer already syncs. Then Drive and this service are two doors to one file, not two copies.

A missing file is empty text, not an error. The first `PUT` creates it. The parent directory may be created on that write. The bytes are stored as sent. The service does not reformat them and does not run `mergeSession`.

The etag is a strong hash of those bytes, quoted. A write happens only inside one in-process lock: read the file, compare the etag, and replace it, or leave it. The replacement is a temp file beside the real one, then a rename over it. A crash may leave a `.tmp` beside the file. The next write overwrites that temp.

## HTTP

One route for the bundle: `/lectio-sessions.json`. A process started with `LECTIO_SYNC_FILE` alone serves no other path. `LECTIO_SYNC_DIR` adds the notes routes below. No account.

The token is `LECTIO_SYNC_TOKEN`. At least 16 characters, with no spaces. Compare it in constant time. Do not log the token, the `Authorization` header, or the body. Startup prints the listen address and the file path, then refuses to run when the token or the path is missing.

`OPTIONS` does not require the token. Browsers send it before `PUT`. Every other method does.

A browser `Origin` that is not on the list gets `403` and no `Access-Control-Allow-Origin`. A request with no `Origin` (curl on this machine) is allowed through, and still needs the token. Allowed origins are echoed back. `ETag` is exposed so the page can send it on the next write.

Default origins:

- `lectiolatinreader://localhost` (the iPhone app, scheme `LectioLatinReader`)
- `http://localhost:5180`
- `http://127.0.0.1:5180`

`LECTIO_SYNC_ORIGINS` replaces that list when it is set. Comma-separated.

The accepted bundle is the one `parseBundle` already accepts: JSON, `version` equal to `BUNDLE_VERSION` in `src/session/bundle.ts`, and `sessions` a plain object. A test reads that constant from `bundle.ts` so the two cannot drift. Invalid sessions inside the object are still stored. The app already skips a work it cannot parse.

Body cap is 1 MiB.

| Request | Result |
| --- | --- |
| `GET`, file missing | `200`, empty body, etag of the empty text |
| `GET`, file present | `200`, stored bytes, etag, `Cache-Control: no-store` |
| `PUT`, missing or wrong token | `401`, file unchanged |
| `PUT`, no `If-Match` | `428`, file unchanged |
| `PUT`, `If-Match` is not the current etag, including `*` | `412`, file unchanged, current etag returned |
| `PUT`, body is not a version-1 bundle | `400`, file unchanged |
| `PUT`, body larger than 1 MiB | `413`, file unchanged |
| `PUT`, etag matches | `204`, new etag, bytes stored as sent |
| `OPTIONS` from an allowed origin | `204`, CORS headers, no token |
| `Origin` present and not allowed | `403`, no allow-origin, file unchanged |
| Any other path | `404` |
| Any other method | `405` |

`Content-Type` on `PUT` may be missing or `application/json`. Anything else is `415`.

## Notes

`LECTIO_SYNC_DIR` is the folder `lectio-sessions/` : `lectio-sessions.json` beside `notes/`. When it is set, `GET` and `PUT /lectio-sessions.json` serve `<dir>/lectio-sessions.json` with the same token and etag rule, and `LECTIO_SYNC_FILE` is not read. A process started with `LECTIO_SYNC_FILE` alone is unchanged, and `GET /notes` is `404`.

The service stores each note as sent and does not merge. The app merges by filename and `updated`. A `412` leaves that device's note in place for the next read.

| Request | Result |
| --- | --- |
| `GET /notes`, directory missing | `200`, `{"files":[]}` |
| `GET /notes` | `200`, each name with its etag and `updated` |
| `GET /notes/:name`, file missing | `200`, empty body, etag of the empty text |
| `GET /notes/:name`, file present | `200`, stored bytes, that file's etag |
| `PUT /notes/:name`, etag matches | `204`, new etag, bytes stored as sent |
| `PUT` or `DELETE`, `If-Match` is stale | `412`, file unchanged |
| `DELETE /notes/:name`, etag matches | `204`, file removed |
| `:name` is not a note file or its `.deleted` tombstone | `404` |

`:name` is one path segment. The body cap is 1 MiB per file. One lock per file. A name the app cannot parse is not a route.

## Process

No new npm runtime dependency. Node's `http`, `fs`, and `crypto` are enough. One TypeScript file, `services/sync/server.ts`, with no imports of `src/`, so `node --experimental-strip-types` can run it on Node 22 without a compile step. Tests live in `services/sync/server.test.ts`. Vitest's include list has to grow to cover `services/**/*.test.ts`. `tsconfig.node.json` includes `services/sync/server.ts` and `services/sync/server.test.ts` so `tsc -b` checks them.

### Docker (delivery)

A Node base image runs the same single file, still with no build step and no compiled output. `services/sync/Dockerfile` and a `.dockerignore` are the only new files the repo needs; the token, path, origins, host, and port come from the environment, never the repo. `LECTIO_SYNC_FILE` is a host path bind-mounted in, so the JSON can sit in a normal home folder (inside or outside the container's lifetime).

On the Linux box that already runs Docker:

```bash
docker build -t lectio-sync services/sync
docker run -d --restart unless-stopped \
  --name lectio-sync \
  -p 127.0.0.1:3010:3010 \
  -v /path/to/a/folder:/data \
  -e LECTIO_SYNC_FILE=/data/lectio-sessions.json \
  -e LECTIO_SYNC_DIR=/data \
  -e LECTIO_SYNC_TOKEN="$(openssl rand -hex 32)" \
  lectio-sync
```

Publish to `127.0.0.1` only (never `0.0.0.0`), so the port is not open on the LAN by accident. Tailscale Serve on that host then gives the phone an HTTPS tailnet name and forwards to `127.0.0.1:3010`.

### Bare Node (local dev and tests)

The same server runs directly for tests and local runs, so a machine with Node needs no container:

```bash
export LECTIO_SYNC_FILE=/path/outside/the/repo/lectio-sessions.json
export LECTIO_SYNC_TOKEN="$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")"
npm run sync:serve
```

| Variable | Default | Role |
| --- | --- | --- |
| `LECTIO_SYNC_FILE` | none | Path of the bundle on this computer. Serves no notes |
| `LECTIO_SYNC_DIR` | none | The folder. Serves `<dir>/lectio-sessions.json` and `<dir>/notes`. When set, `LECTIO_SYNC_FILE` is not read |
| `LECTIO_SYNC_TOKEN` | none | Bearer token |
| `LECTIO_SYNC_HOST` | `127.0.0.1` | Bind address |
| `LECTIO_SYNC_PORT` | `3010` | Port. `0` is allowed so a test can take a free port |
| `LECTIO_SYNC_ORIGINS` | the three origins above | Replaces the default list when set |

The default bind is loopback so the process is not reachable on the LAN by accident. The iPhone build has no App Transport Security exception, so it will not call plain `http://`. Publish the port with Tailscale Serve. That gives the phone an HTTPS name on the tailnet, including over cellular, and forwards to `127.0.0.1:3010`. Do not add `NSAllowsArbitraryLoads` for this, and do not use a self-signed certificate.

While that computer is asleep, the service is down. If the file lives in the Drive folder, the phone can still open the last copy Drive uploaded. The app already keeps local progress when a read fails, and merges on the next one that succeeds.

## Reader

Step 4 waits until the service is ticked. `SyncTransport` is already `read()` and `write(text)`. A new transport saves the base URL and the token on the device, the same way the desktop remembers a file handle. `read` is the `GET`. `write` sends the merged text with the etag from that read.

`src/session/sync.ts` already turns a failed write into "could not reach sync" and leaves `localStorage` as it was. The next open reads again and merges. A `412` uses that same path. The service does not merge on the writer's behalf.

**Choose sync file** stays. That is Google Drive, iCloud, or any other file the phone can bookmark. The service is a second choice, not a replacement. One device uses one of them at a time. They only stay in step when both are aimed at the same file.

## Order

The checklist at the top is the tracker. Do the steps in that order. Step 1's tests cover an empty read, a matching write, a stale write, and two overlapping writes. Step 2's tests cover the status table. Step 3 starts the process from the environment and fetches it. Step 4 does not start until 1–3 are ticked.

## Out of scope

Moving the merge into the service. Replacing `localStorage`. Accounts, or more than one file. SSH, a git merge of the JSON, or a mounted folder. Calling the Google Drive API. Opening the service on the public internet. Putting the token or the progress file in this repo. Syncing while the phone app is suspended. A CRDT. Last-write-wins on the whole file.

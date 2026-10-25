import { useCallback, useEffect, useRef, useState } from "react";
import { workById } from "../content/works";
import {
  bundleFromStorage,
  describeMerge,
  importBundle,
  serializeBundle,
  sessionsFromFiles,
} from "../session/bundle";
import { downloadBytes } from "../session/download";
import type { SyncNotice } from "../session/sync";
import { configureSyncService, currentSyncFileName, currentSyncService, clearSyncService, sync } from "../session/syncHost";
import { validateEndpoint, type ServiceEndpoint } from "../session/serviceSync";
import { sessionProgress } from "../session/useSession";
import type { ReaderMode, ReaderWork, WorkId } from "../types";
import { AppTitle } from "./AppTitle";
import { ActiveIcon } from "./icons";
import { ThemeToggle } from "./ThemeToggle";

type HomeProps = {
  onOpen: (workId: ReaderWork["id"], mode: ReaderMode) => void;
  studyEnabled?: boolean;
};

const OTHER: WorkId[] = ["gradibus", "cantica", "rule", "confessions", "psalter", "canticum"];

export function Home({ onOpen, studyEnabled = true }: HomeProps) {
  const other = worksFor(OTHER);
  const [, setProgressRev] = useState(0);
  const refreshProgress = useCallback(() => setProgressRev((rev) => rev + 1), []);
  return (
    <main className="home">
      <header className="topbar">
        <div className="topbar-left">
          <AppTitle line="A Latin reader" />
        </div>
        <div className="tools">
          <ThemeToggle />
        </div>
      </header>
      <div className="home-body">
        <SyncBar onImported={refreshProgress} />
        <div className="home-featured">
          <OfficeCard onOpen={onOpen} />
        </div>
        <details className="home-other">
          <summary className="home-kicker">Other works</summary>
          <div className="home-other-list">
            {other.map((work) => (
              <WorkCard
                key={work.id}
                work={work}
                onOpen={onOpen}
                studyEnabled={studyEnabled}
                compact
              />
            ))}
          </div>
        </details>
      </div>
    </main>
  );
}

function SyncBar({ onImported }: { onImported: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [notice, setNotice] = useState<SyncNotice>(() => sync.current());
  const [fileNote, setFileNote] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const savedService = currentSyncService();
  const [serviceUrl, setServiceUrl] = useState(savedService?.baseUrl ?? "");
  const [serviceToken, setServiceToken] = useState(savedService?.token ?? "");
  const [serviceError, setServiceError] = useState<string | null>(null);
  const [showToken, setShowToken] = useState(false);
  const [busyOn, setBusyOn] = useState<"file" | "service" | null>(null);
  const [open, setOpen] = useState<"file" | "service" | null>(null);
  const service = currentSyncService();
  const current = currentPlace(service, notice);
  const filePicker = notice.mode !== "unsupported";
  // A chosen file stays on this device while a service is in use.
  const hasFile = fileName != null || current === "file";
  const busy = busyOn != null;

  const refreshFileName = useCallback(async () => {
    setFileName(await currentSyncFileName());
  }, []);

  useEffect(() => {
    setNotice(sync.current());
    void refreshFileName();
    return sync.subscribe((next) => {
      setFileNote(null);
      setNotice(next);
      void refreshFileName();
      if (next.refreshed) onImported();
    });
  }, [onImported, refreshFileName]);

  function exportPasses() {
    const text = serializeBundle(bundleFromStorage());
    const blob = new Blob([text], { type: "application/json" });
    void downloadBytes("lectio-sessions.json", blob);
  }

  function importPasses(list: FileList | null) {
    if (!list || list.length === 0) return;
    Promise.all([...list].map(async (file) => ({ name: file.name, text: await file.text() }))).then(
      (files) => {
        const read = sessionsFromFiles(files);
        if (!read.bundle) {
          const which = read.rejected.length > 0 ? read.rejected.join(", ") : "this file";
          setFileNote(`Could not read ${which}.`);
          return;
        }
        const outcome = importBundle(read.bundle);
        onImported();
        const skipped = read.rejected.length > 0 ? ` Skipped ${read.rejected.join(", ")}.` : "";
        setFileNote(`${describeMerge(outcome)}.${skipped}`);
      },
    );
  }

  function loadServiceForm() {
    const existing = currentSyncService();
    setServiceUrl(existing?.baseUrl ?? "");
    setServiceToken(existing?.token ?? "");
    setServiceError(null);
    setShowToken(false);
  }

  async function saveService() {
    const url = serviceUrl.trim();
    const token = serviceToken.trim();
    const error = validateEndpoint({ baseUrl: url, token });
    if (error) {
      setServiceError(error);
      return;
    }
    setServiceUrl(url);
    setServiceToken(token);
    setServiceError(null);
    setFileNote(null);
    setBusyOn("service");
    try {
      await configureSyncService({ baseUrl: url, token });
    } finally {
      setBusyOn(null);
    }
  }

  async function forgetService() {
    setServiceUrl("");
    setServiceToken("");
    setServiceError(null);
    setFileNote(null);
    setNotice({ mode: "none", text: "", refreshed: false });
    setBusyOn("service");
    try {
      await clearSyncService();
    } finally {
      setNotice(sync.current());
      setBusyOn(null);
    }
  }

  async function chooseFile() {
    setFileNote(null);
    setBusyOn("file");
    try {
      const result = await sync.choose();
      if (result === "opened") {
        loadServiceForm();
        void refreshFileName();
      } else if (result === "failed" && currentSyncService()) {
        setFileNote("The folder was not opened. This device is still using the service.");
      } else if (result === "failed") {
        setFileNote("The folder was not opened.");
      }
    } finally {
      setBusyOn(null);
    }
  }

  /** Make the retained file the backend this device syncs through. */
  async function useFile() {
    setFileNote(null);
    setBusyOn("file");
    try {
      await clearSyncService();
      loadServiceForm();
    } finally {
      setNotice(sync.current());
      setBusyOn(null);
      void refreshFileName();
    }
  }

  async function syncFile() {
    setFileNote(null);
    setBusyOn("file");
    try {
      await sync.syncNow({ pull: true });
    } finally {
      setBusyOn(null);
    }
  }

  const fileStatus =
    busyOn === "file"
      ? "Syncing…"
      : fileNote ??
        (notice.mode === "unsupported"
          ? notice.text
          : current === "file"
            ? standingResult(notice) ?? (notice.mode === "needs-gesture" ? notice.text : null)
            : null);

  const serviceStatus = busyOn === "service" ? "Syncing…" : current === "service" ? standingResult(notice) : null;

  function toggleOpen(place: "file" | "service") {
    setOpen((currentOpen) => (currentOpen === place ? null : place));
  }

  return (
    <section className="home-sync" aria-labelledby="progress-heading">
      <p id="progress-heading" className="home-kicker">
        Progress
      </p>
      <div className="home-sync-backends">
        <FileSyncControl
          open={open === "file"}
          onToggle={() => toggleOpen("file")}
          active={current === "file"}
          picker={filePicker}
          hasFile={hasFile}
          fileName={fileName}
          busy={busy}
          status={fileStatus}
          onChoose={() => void chooseFile()}
          onUse={() => void useFile()}
          onSync={() => void syncFile()}
          onExport={exportPasses}
          onImport={() => fileRef.current?.click()}
        />
        <ServiceSyncControl
          open={open === "service"}
          onToggle={() => toggleOpen("service")}
          active={current === "service"}
          saved={service != null}
          url={serviceUrl}
          token={serviceToken}
          showToken={showToken}
          busy={busy}
          status={serviceStatus}
          error={serviceError}
          onUrl={(value) => {
            setServiceError(null);
            setServiceUrl(value);
          }}
          onToken={(value) => {
            setServiceError(null);
            setServiceToken(value);
          }}
          onToggleToken={() => setShowToken((shown) => !shown)}
          onSave={() => void saveService()}
          onForget={() => void forgetService()}
        />
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        multiple
        hidden
        onChange={(event) => {
          importPasses(event.target.files);
          event.target.value = "";
        }}
      />
    </section>
  );
}

function FileSyncControl({
  open,
  onToggle,
  active,
  picker,
  hasFile,
  fileName,
  busy,
  status,
  onChoose,
  onUse,
  onSync,
  onExport,
  onImport,
}: {
  open: boolean;
  onToggle: () => void;
  active: boolean;
  picker: boolean;
  hasFile: boolean;
  fileName: string | null;
  busy: boolean;
  status: string | null;
  onChoose: () => void;
  onUse: () => void;
  onSync: () => void;
  onExport: () => void;
  onImport: () => void;
}) {
  const line = status ?? fileDescription(active, hasFile, fileName);
  return (
    <section
      className={open ? "home-sync-backend open" : "home-sync-backend"}
      aria-labelledby="sync-file-heading"
      aria-current={active ? "true" : undefined}
    >
      <h3 id="sync-file-heading" className="home-sync-heading">
        <button
          className="home-sync-row"
          type="button"
          aria-expanded={open}
          aria-controls="sync-file-panel"
          onClick={onToggle}
        >
          <span className="home-sync-row-title">
            <span className="home-kicker">File</span>
            {active ? <ActiveMark /> : null}
          </span>
          {hasFile ? <span className="home-sync-identity">{fileName ?? "Shared folder"}</span> : null}
        </button>
      </h3>
      {!open && status ? (
        <p className="home-sync-result home-sync-row-status" role="status">
          {status}
        </p>
      ) : null}
      {open ? (
        <div className="home-sync-panel" id="sync-file-panel">
          {line ? (
            <p className={status ? "home-sync-result" : "home-sync-where"} role={status ? "status" : undefined}>
              {line}
            </p>
          ) : null}
          <div className="home-sync-actions">
            {picker && hasFile && !active ? (
              <button className="start" type="button" disabled={busy} onClick={onUse}>
                Use this folder
              </button>
            ) : null}
            {picker ? (
              <button className={hasFile && !active ? "start ghost" : "start"} type="button" disabled={busy} onClick={onChoose}>
                {hasFile ? "Change folder…" : "Choose folder…"}
              </button>
            ) : null}
            {active ? (
              <button className="start ghost" type="button" disabled={busy} onClick={onSync}>
                Sync now
              </button>
            ) : null}
            <button className="start ghost" type="button" onClick={onExport}>
              Export
            </button>
            <button className="start ghost" type="button" onClick={onImport}>
              Import
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function ServiceSyncControl({
  open,
  onToggle,
  active,
  saved,
  url,
  token,
  showToken,
  busy,
  status,
  error,
  onUrl,
  onToken,
  onToggleToken,
  onSave,
  onForget,
}: {
  open: boolean;
  onToggle: () => void;
  active: boolean;
  saved: boolean;
  url: string;
  token: string;
  showToken: boolean;
  busy: boolean;
  status: string | null;
  error: string | null;
  onUrl: (value: string) => void;
  onToken: (value: string) => void;
  onToggleToken: () => void;
  onSave: () => void;
  onForget: () => void;
}) {
  const line = status;
  return (
    <section
      className={open ? "home-sync-backend open" : "home-sync-backend"}
      aria-labelledby="sync-service-heading"
      aria-current={active ? "true" : undefined}
    >
      <h3 id="sync-service-heading" className="home-sync-heading">
        <button
          className="home-sync-row"
          type="button"
          aria-expanded={open}
          aria-controls="sync-service-panel"
          onClick={onToggle}
        >
          <span className="home-sync-row-title">
            <span className="home-kicker">Service</span>
            {active ? <ActiveMark /> : null}
          </span>
        </button>
      </h3>
      {!open && status ? (
        <p className="home-sync-result home-sync-row-status" role="status">
          {status}
        </p>
      ) : null}
      {open ? (
        <form
          className="home-sync-panel"
          id="sync-service-panel"
          onSubmit={(event) => {
            event.preventDefault();
            onSave();
          }}
        >
          {line ? (
            <p className={status ? "home-sync-result" : "home-sync-where"} role={status ? "status" : undefined}>
              {line}
            </p>
          ) : null}
          <div className="home-sync-field">
            <label htmlFor="sync-service-url">Service URL</label>
            <input
              id="sync-service-url"
              type="url"
              value={url}
              onChange={(event) => onUrl(event.target.value)}
              placeholder="https://name.trycloudflare.com"
              autoComplete="url"
              spellCheck={false}
              disabled={busy}
            />
            <p>The https address of the computer running the sync service.</p>
          </div>
          <div className="home-sync-field">
            <label htmlFor="sync-service-token">Token</label>
            <div className="home-sync-token">
              <input
                id="sync-service-token"
                type={showToken ? "text" : "password"}
                value={token}
                onChange={(event) => onToken(event.target.value)}
                placeholder="Paste the token"
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                disabled={busy}
              />
              <button className="home-sync-reveal" type="button" aria-pressed={showToken} onClick={onToggleToken}>
                {showToken ? "Hide" : "Show"}
              </button>
            </div>
            <p>The LECTIO_SYNC_TOKEN from that same computer.</p>
          </div>
          {error ? (
            <p className="home-sync-service-error" role="alert">
              {error}
            </p>
          ) : null}
          <div className="home-sync-actions">
            <button className="start" type="submit" disabled={busy}>
              Set and sync
            </button>
            {saved ? (
              <button className="start ghost" type="button" disabled={busy} onClick={onForget}>
                Forget service
              </button>
            ) : null}
          </div>
        </form>
      ) : null}
    </section>
  );
}

function ActiveMark() {
  return (
    <span className="home-sync-active">
      <ActiveIcon />
      <span className="home-sync-active-label">Active</span>
    </span>
  );
}

function fileDescription(active: boolean, hasFile: boolean, fileName: string | null): string | null {
  if (!hasFile) return "Pick a folder to sync progress and notes from this device.";
  if (active) return `Progress and notes sync through ${fileName ?? "this folder"}.`;
  return "Saved on this device.";
}

function currentPlace(service: ServiceEndpoint | null, notice: SyncNotice): "service" | "file" | null {
  if (service) return "service";
  if (notice.mode === "ready" || notice.mode === "needs-gesture" || notice.mode === "offline") return "file";
  return null;
}

/** The sync outcome for the backend in use. "Synced." is a result, shown on its own. */
function standingResult(notice: SyncNotice): string | null {
  if (notice.mode === "offline" || notice.mode === "ready") return notice.text;
  return null;
}

function worksFor(ids: WorkId[]): ReaderWork[] {
  return ids.flatMap((id) => {
    const work = workById(id);
    return work ? [work] : [];
  });
}

function WorkCard({
  work,
  onOpen,
  studyEnabled,
  compact = false,
}: {
  work: ReaderWork;
  onOpen: HomeProps["onOpen"];
  studyEnabled: boolean;
  compact?: boolean;
}) {
  return (
    <article className="home-card">
      {compact ? null : <p className="home-kicker">{work.brandShort}</p>}
      <h2>
        {work.latinTitle}
        <span>{work.englishTitle}</span>
      </h2>
      {compact || !(work.authorEnglish ?? work.authorLatin) ? null : (
        <p className="home-meta">{work.authorEnglish ?? work.authorLatin}</p>
      )}
      <div className="home-actions">
        <button className="start" type="button" onClick={() => onOpen(work.id, "lectio")}>
          Lectio
        </button>
        {work.studyEnabled && studyEnabled ? (
          <button className="start ghost" type="button" onClick={() => onOpen(work.id, "study")}>
            Study
          </button>
        ) : null}
      </div>
      {work.session === true ? (
        <SessionProgress work={work.id} />
      ) : null}
    </article>
  );
}

function SessionProgress({ work }: { work: WorkId }) {
  const { count, total } = sessionProgress(work);
  return (
    <p className="home-session">
      Pass: <strong>{count} / {total}</strong> slices read
    </p>
  );
}

function OfficeCard({ onOpen }: { onOpen: HomeProps["onOpen"] }) {
  const { count, total } = sessionProgress("cursus");
  return (
    <article className="home-card home-card-main">
      <div className="home-card-copy">
        <p className="home-kicker">Cursus</p>
        <h2>
          Cursus psalmorum
          <span>Psalms of the hours</span>
        </h2>
        <p className="home-meta">according to the Rule</p>
      </div>
      <div className="home-actions">
        <button className="start" type="button" onClick={() => onOpen("psalter", "office-lectio")}>
          Lectio
        </button>
        <button className="start ghost" type="button" onClick={() => onOpen("psalter", "office")}>
          Cursus
        </button>
      </div>
      <p className="home-session">
        Pass: <strong>{count} / {total}</strong> slices read
      </p>
    </article>
  );
}

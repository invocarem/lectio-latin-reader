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
import { configureSyncService, currentSyncService, clearSyncService, sync } from "../session/syncHost";
import { validateEndpoint, type ServiceEndpoint } from "../session/serviceSync";
import { sessionProgress } from "../session/useSession";
import type { ReaderMode, ReaderWork, WorkId } from "../types";
import { AppTitle } from "./AppTitle";
import { ThemeToggle } from "./ThemeToggle";

type HomeProps = {
  onOpen: (workId: ReaderWork["id"], mode: ReaderMode) => void;
  studyEnabled?: boolean;
};

const FEATURED: WorkId[] = ["gradibus", "cantica"];
const OTHER: WorkId[] = ["rule", "confessions", "psalter", "canticum"];

export function Home({ onOpen, studyEnabled = true }: HomeProps) {
  const featured = worksFor(FEATURED);
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
          {featured.map((work) => (
            <WorkCard key={work.id} work={work} onOpen={onOpen} studyEnabled={studyEnabled} />
          ))}
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
  const [importNote, setImportNote] = useState<string | null>(null);
  const [serviceOpen, setServiceOpen] = useState(false);
  const [serviceUrl, setServiceUrl] = useState("");
  const [serviceToken, setServiceToken] = useState("");
  const [serviceError, setServiceError] = useState<string | null>(null);
  const [showToken, setShowToken] = useState(false);
  const [busy, setBusy] = useState(false);
  const service = currentSyncService();
  const place = syncPlace(service, notice, serviceOpen);
  const linked = service != null || notice.mode === "ready" || notice.mode === "needs-gesture" || notice.mode === "offline";

  useEffect(() => {
    setNotice(sync.current());
    return sync.subscribe((next) => {
      setImportNote(null);
      setNotice(next);
      if (next.refreshed) onImported();
    });
  }, [onImported]);

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
          setImportNote(`Could not read ${which}.`);
          return;
        }
        const outcome = importBundle(read.bundle);
        onImported();
        const skipped = read.rejected.length > 0 ? ` Skipped ${read.rejected.join(", ")}.` : "";
        setImportNote(`${describeMerge(outcome)}.${skipped}`);
      },
    );
  }

  function openServiceForm() {
    const existing = currentSyncService();
    setServiceUrl(existing?.baseUrl ?? "");
    setServiceToken(existing?.token ?? "");
    setServiceError(null);
    setShowToken(false);
    setServiceOpen((open) => !open);
  }

  async function saveService() {
    const url = serviceUrl.trim();
    const token = serviceToken.trim();
    const error = validateEndpoint({ baseUrl: url, token });
    if (error) {
      setServiceError(error);
      return;
    }
    setServiceOpen(false);
    setServiceUrl("");
    setServiceToken("");
    setServiceError(null);
    setImportNote(null);
    setBusy(true);
    try {
      await configureSyncService({ baseUrl: url, token });
    } finally {
      setBusy(false);
    }
  }

  async function forgetService() {
    setServiceUrl("");
    setServiceToken("");
    setServiceError(null);
    setImportNote(null);
    setNotice({ mode: "none", text: "", refreshed: false });
    setBusy(true);
    try {
      await clearSyncService();
    } finally {
      setNotice(sync.current());
      setBusy(false);
    }
  }

  async function syncNow() {
    setImportNote(null);
    setBusy(true);
    try {
      await sync.syncNow();
    } finally {
      setBusy(false);
    }
  }

  const outcome = busy ? "Syncing…" : (importNote ?? standingResult(notice) ?? syncCue(service, notice));

  return (
    <section className="home-sync" aria-labelledby="progress-heading">
      <p id="progress-heading" className="home-kicker">
        Progress
      </p>
      {service ? (
        <p className="home-sync-url">{serviceAddress(service)}</p>
      ) : place.title ? (
        <p className="home-sync-where">{place.title}</p>
      ) : null}
      <div className="home-actions">
        {linked ? (
          <button className="start" type="button" disabled={busy} onClick={() => void syncNow()}>
            Sync now
          </button>
        ) : null}
        {place.fileLabel ? (
          <button className="start ghost" type="button" onClick={() => void sync.choose()}>
            {place.fileLabel}
          </button>
        ) : null}
        <button className="start ghost" type="button" onClick={openServiceForm} aria-expanded={serviceOpen}>
          {place.serviceLabel}
        </button>
      </div>
      {serviceOpen ? (
        <form
          className="home-sync-service"
          onSubmit={(event) => {
            event.preventDefault();
            void saveService();
          }}
        >
          <div className="home-sync-field">
            <label htmlFor="sync-service-url">Service URL</label>
            <input
              id="sync-service-url"
              type="url"
              value={serviceUrl}
              onChange={(event) => setServiceUrl(event.target.value)}
              placeholder="https://name.trycloudflare.com"
              autoComplete="url"
              spellCheck={false}
            />
            <p>The https address of the computer running the sync service.</p>
          </div>
          <div className="home-sync-field">
            <label htmlFor="sync-service-token">Token</label>
            <div className="home-sync-token">
              <input
                id="sync-service-token"
                type={showToken ? "text" : "password"}
                value={serviceToken}
                onChange={(event) => setServiceToken(event.target.value)}
                placeholder="Paste the token"
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
              />
              <button
                className="home-sync-reveal"
                type="button"
                aria-pressed={showToken}
                onClick={() => setShowToken((shown) => !shown)}
              >
                {showToken ? "Hide" : "Show"}
              </button>
            </div>
            <p>The LECTIO_SYNC_TOKEN from that same computer.</p>
          </div>
          {serviceError ? (
            <p className="home-sync-service-error" role="alert">
              {serviceError}
            </p>
          ) : null}
          <div className="home-sync-service-actions">
            <button className="start" type="submit" disabled={busy}>
              Save and sync
            </button>
            {service ? (
              <button className="start ghost" type="button" disabled={busy} onClick={() => void forgetService()}>
                Forget service
              </button>
            ) : null}
          </div>
        </form>
      ) : null}
      <div className="home-sync-copy">
        <div className="home-actions">
          <button className="start ghost" type="button" onClick={exportPasses}>
            Export
          </button>
          <button className="start ghost" type="button" onClick={() => fileRef.current?.click()}>
            Import
          </button>
        </div>
      </div>
      {outcome ? (
        <p className="home-sync-result" role="status">
          {outcome}
        </p>
      ) : null}
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

function serviceAddress(endpoint: ServiceEndpoint): string {
  return endpoint.baseUrl.replace(/\/+$/, "");
}

function syncPlace(
  service: ServiceEndpoint | null,
  notice: SyncNotice,
  serviceOpen: boolean,
): { title: string | null; fileLabel: string | null; serviceLabel: string } {
  const serviceLabel = serviceOpen ? "Close" : service ? "Edit service" : "Sync service";
  if (service) {
    return {
      title: null,
      fileLabel: notice.mode === "unsupported" ? null : "Switch to file",
      serviceLabel,
    };
  }
  if (notice.mode === "unsupported") {
    return { title: null, fileLabel: null, serviceLabel };
  }
  if (notice.mode === "needs-gesture" || notice.mode === "ready" || notice.mode === "offline") {
    return {
      title: "Shared file",
      fileLabel: "Change file",
      serviceLabel: serviceOpen ? "Close" : "Switch to service",
    };
  }
  return { title: null, fileLabel: "Choose sync file", serviceLabel };
}

/** A result worth a status line. */
function standingResult(notice: SyncNotice): string | null {
  if (notice.mode === "offline" || notice.mode === "ready") return notice.text;
  return null;
}

function syncCue(service: ServiceEndpoint | null, notice: SyncNotice): string | null {
  if (service) return null;
  if (notice.mode === "needs-gesture" || notice.mode === "unsupported") return notice.text;
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
    <article className="home-card">
      <p className="home-kicker">Cursus</p>
      <h2>
        Cursus psalmorum
        <span>Psalms of the hours</span>
      </h2>
      <p className="home-meta">according to the Rule</p>
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

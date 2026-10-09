import { useRef, useState } from "react";
import { workById } from "../content/works";
import {
  bundleFromStorage,
  describeMerge,
  importBundle,
  serializeBundle,
  sessionsFromFiles,
} from "../session/bundle";
import { downloadBytes } from "../session/download";
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
  const [, refreshProgress] = useState(0);

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
        <SyncBar onImported={() => refreshProgress((rev) => rev + 1)} />
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
  const [message, setMessage] = useState<string | null>(null);

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
          setMessage(`Could not read ${which}.`);
          return;
        }
        const outcome = importBundle(read.bundle);
        onImported();
        const skipped = read.rejected.length > 0 ? ` Skipped ${read.rejected.join(", ")}.` : "";
        setMessage(`${describeMerge(outcome)}.${skipped}`);
      },
    );
  }

  return (
    <div className="home-sync">
      <p className="home-kicker">Progress</p>
      <div className="home-actions">
        <button className="start ghost" type="button" onClick={exportPasses}>
          Export
        </button>
        <button className="start ghost" type="button" onClick={() => fileRef.current?.click()}>
          Import
        </button>
      </div>
      {message ? (
        <p className="home-sync-result" role="status">
          {message}
        </p>
      ) : (
        <p className="home-sync-result">Export or import every pass as one file.</p>
      )}
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
    </div>
  );
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

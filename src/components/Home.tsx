import { workById } from "../content/works";
import type { ReaderMode, ReaderWork, WorkId } from "../types";

type HomeProps = {
  onOpen: (workId: ReaderWork["id"], mode: ReaderMode) => void;
  studyEnabled?: boolean;
};

const FEATURED: WorkId[] = ["gradibus", "cantica"];
const OTHER: WorkId[] = ["rule", "confessions", "psalter", "canticum"];

export function Home({ onOpen, studyEnabled = true }: HomeProps) {
  const featured = worksFor(FEATURED);
  const other = worksFor(OTHER);

  return (
    <main className="home">
      <header className="home-masthead">
        <p className="home-kicker">Lectio</p>
        <h1>A Latin reader</h1>
      </header>
      <div className="home-featured">
        {featured.map((work) => (
          <WorkCard key={work.id} work={work} onOpen={onOpen} studyEnabled={studyEnabled} />
        ))}
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
    </main>
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
    </article>
  );
}

function OfficeCard({ onOpen }: { onOpen: HomeProps["onOpen"] }) {
  return (
    <article className="home-card">
      <p className="home-kicker">Office</p>
      <h2>
        Officium divinum
        <span>Benedictine Divine Office</span>
      </h2>
      <p className="home-meta">according to the Rule</p>
      <div className="home-actions">
        <button className="start" type="button" onClick={() => onOpen("psalter", "office-lectio")}>
          Lectio
        </button>
        <button className="start ghost" type="button" onClick={() => onOpen("psalter", "office")}>
          Office
        </button>
      </div>
    </article>
  );
}

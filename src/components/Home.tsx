import { works } from "../content/works";
import type { ReaderMode, ReaderWork } from "../types";

type HomeProps = {
  onOpen: (workId: ReaderWork["id"], mode: ReaderMode) => void;
  studyEnabled?: boolean;
};

export function Home({ onOpen, studyEnabled = true }: HomeProps) {
  return (
    <main className="home">
      <header className="home-masthead">
        <p className="home-kicker">Lectio</p>
        <h1>A Latin reader</h1>
      </header>
      <div className="home-list">
        {works.map((work) => (
          <article className="home-card" key={work.id}>
            <p className="home-kicker">{work.brandShort}</p>
            <h2>
              {work.latinTitle}
              <span>{work.englishTitle}</span>
            </h2>
            {work.authorEnglish ?? work.authorLatin ? (
              <p className="home-meta">{work.authorEnglish ?? work.authorLatin}</p>
            ) : null}
            <div className="home-actions">
              <button
                className="start"
                type="button"
                onClick={() => onOpen(work.id, "lectio")}
              >
                Lectio
              </button>
              {work.studyEnabled && studyEnabled ? (
                <button
                  className="start ghost"
                  type="button"
                  onClick={() => onOpen(work.id, "study")}
                >
                  Study
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}

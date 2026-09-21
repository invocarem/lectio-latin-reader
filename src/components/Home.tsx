import { works } from "../content/works";
import type { ReaderMode, ReaderWork } from "../types";

type HomeProps = {
  onOpen: (workId: ReaderWork["id"], mode: ReaderMode) => void;
  studyEnabled?: boolean;
};

export function Home({ onOpen, studyEnabled = true }: HomeProps) {
  return (
    <main className="home">
      <div className="home-list">
        {works.map((work) => (
          <article className="home-card" key={work.id}>
            <p className="home-kicker">Lectio</p>
            <h1>
              {work.latinTitle}
              <span>{work.englishTitle}</span>
            </h1>
            {(work.authorEnglish ?? work.authorLatin) ? (
              <p className="home-meta">
                {work.authorEnglish ?? work.authorLatin}
                {work.edition ? (
                  <>
                    <br />
                    {work.edition}
                  </>
                ) : null}
              </p>
            ) : work.edition ? (
              <p className="home-meta">{work.edition}</p>
            ) : null}
            <hr className="home-rule" />
            {work.intro ? <p>{work.intro}</p> : null}
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

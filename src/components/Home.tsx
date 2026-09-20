import { work } from "../content/work";

type HomeProps = {
  onLectio: () => void;
  onStudy: () => void;
  studyEnabled?: boolean;
};

export function Home({ onLectio, onStudy, studyEnabled = true }: HomeProps) {
  return (
    <main className="home">
      <article className="home-card">
        <p className="home-kicker">Lectio</p>
        <h1>
          {work.latinTitle}
          <span>{work.englishTitle}</span>
        </h1>
        <p className="home-meta">
          {work.authorEnglish}
          <br />
          {work.edition}
        </p>
        <hr className="home-rule" />
        <p>
          One short Latin paragraph at a time, with English at hand.
          {studyEnabled ? (
            <> Study mode keeps the full parallel columns of each Patrologia section.</>
          ) : null}
        </p>
        <div className="home-actions">
          <button className="start" type="button" onClick={onLectio}>
            Lectio
          </button>
          {studyEnabled ? (
            <button className="start ghost" type="button" onClick={onStudy}>
              Study
            </button>
          ) : null}
        </div>
      </article>
    </main>
  );
}

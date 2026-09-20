import { work } from "../content/work";

type HomeProps = {
  onLectio: () => void;
  onStudy: () => void;
};

export function Home({ onLectio, onStudy }: HomeProps) {
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
          One short Latin paragraph at a time, with English at hand. Study mode
          keeps the full parallel columns of each Patrologia section.
        </p>
        <div className="home-actions">
          <button className="start" type="button" onClick={onLectio}>
            Begin lectio
          </button>
          <button className="start ghost" type="button" onClick={onStudy}>
            Study mode
          </button>
        </div>
      </article>
    </main>
  );
}

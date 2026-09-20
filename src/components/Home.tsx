import { work } from "../content/work";

type HomeProps = {
  onStart: () => void;
};

export function Home({ onStart }: HomeProps) {
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
          Latin is taken from the Migne plates of Bernard’s treatise. English is
          written to match each numbered section, so both columns keep the same
          step of the lectio.
        </p>
        <button className="start" type="button" onClick={onStart}>
          Begin reading
        </button>
      </article>
    </main>
  );
}

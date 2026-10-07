export const APP_TITLE = "Lectio per cancellos";

type AppTitleProps = {
  line: string;
  onHome?: () => void;
};

/**
 * The shared top-bar title. On the home screen it is the page heading.
 * In a work it is the control that returns home, with the work named underneath.
 */
export function AppTitle({ line, onHome }: AppTitleProps) {
  const copy = (
    <>
      <strong>{APP_TITLE}</strong>
      <small>{line}</small>
    </>
  );
  if (!onHome) {
    return <h1 className="brand">{copy}</h1>;
  }
  return (
    <button
      className="brand"
      type="button"
      onClick={onHome}
      aria-label={`${APP_TITLE}, home`}
      title="Home"
    >
      {copy}
    </button>
  );
}

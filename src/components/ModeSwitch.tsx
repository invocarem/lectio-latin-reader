import type { ReaderMode } from "../types";

type ModeSwitchProps = {
  mode: ReaderMode;
  onMode: (mode: ReaderMode) => void;
};

export function ModeSwitch({ mode, onMode }: ModeSwitchProps) {
  const isActive = (m: ReaderMode) => m === mode;
  return (
    <div className="mode-switch" role="tablist" aria-label="Reading mode">
      {isActive("lectio") ? (
        <button
          type="button"
          role="tab"
          aria-selected="true"
          aria-pressed="true"
          onClick={() => onMode("lectio")}
        >
          Lectio
        </button>
      ) : null}
      {isActive("study") ? (
        <button
          type="button"
          role="tab"
          aria-selected="true"
          aria-pressed="true"
          onClick={() => onMode("study")}
        >
          Study
        </button>
      ) : null}
    </div>
  );
}

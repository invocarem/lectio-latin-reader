import type { ReaderMode } from "../types";

type ModeSwitchProps = {
  mode: ReaderMode;
  onMode: (mode: ReaderMode) => void;
};

export function ModeSwitch({ mode, onMode }: ModeSwitchProps) {
  return (
    <div className="mode-switch" role="tablist" aria-label="Reading mode">
      <button
        type="button"
        role="tab"
        aria-selected={mode === "lectio"}
        aria-pressed={mode === "lectio"}
        onClick={() => onMode("lectio")}
      >
        Lectio
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={mode === "study"}
        aria-pressed={mode === "study"}
        onClick={() => onMode("study")}
      >
        Study
      </button>
    </div>
  );
}

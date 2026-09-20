import { useMemo, useState } from "react";
import { Home } from "./components/Home";
import { Lectio } from "./components/Lectio";
import { Reader } from "./components/Reader";
import { firstLectioId, lectioUnits, sourceIdOf, units } from "./content/work";
import { platformSupportsStudy } from "./native";
import type { ReaderMode } from "./types";

export default function App() {
  const startId = useMemo(() => lectioUnits[0].id, []);
  const [view, setView] = useState<"home" | "read">("home");
  const [mode, setMode] = useState<ReaderMode>("lectio");
  const [focusId, setFocusId] = useState(startId);

  // On the built mobile app (iPhone) only Lectio is available; Study is hidden.
  const studyEnabled = platformSupportsStudy();

  function goHome() {
    setView("home");
  }

  function start(nextMode: ReaderMode) {
    const effective: ReaderMode =
      studyEnabled ? nextMode : "lectio";
    setMode(effective);
    setFocusId(effective === "lectio" ? lectioUnits[0].id : units[0].id);
    setView("read");
  }

  function switchMode(nextMode: ReaderMode) {
    if (nextMode === mode) return;
    setFocusId(
      nextMode === "lectio" ? firstLectioId(sourceIdOf(focusId)) : sourceIdOf(focusId),
    );
    setMode(nextMode);
  }

  if (view === "home") {
    return (
      <Home
        onLectio={() => start("lectio")}
        onStudy={() => start("study")}
        studyEnabled={studyEnabled}
      />
    );
  }

  if (mode === "study" && studyEnabled) {
    return (
      <Reader
        focusId={focusId}
        onFocus={setFocusId}
        onHome={goHome}
        onMode={switchMode}
      />
    );
  }

  return (
    <Lectio
      focusId={focusId}
      onFocus={setFocusId}
      onHome={goHome}
      onMode={switchMode}
    />
  );
}

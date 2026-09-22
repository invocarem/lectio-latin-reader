import { useState } from "react";
import { Home } from "./components/Home";
import { Lectio } from "./components/Lectio";
import { Reader } from "./components/Reader";
import { workById, works } from "./content/works";
import { resolveSession } from "./lectioNav";
import { platformSupportsStudy } from "./native";
import type { ReaderMode, WorkId } from "./types";

export default function App() {
  const defaultWork = works[0];
  const [view, setView] = useState<"home" | "read">("home");
  const [workId, setWorkId] = useState<WorkId>(defaultWork.id);
  const [mode, setMode] = useState<ReaderMode>("lectio");
  const [focusId, setFocusId] = useState<string>(defaultWork.lectio[0].id);

  // On the built mobile app (iPhone) only Lectio is available; Study is hidden.
  const studyEnabled = platformSupportsStudy();

  function goHome() {
    setView("home");
  }

  function start(nextWorkId: WorkId, nextMode?: ReaderMode) {
    const work = workById(nextWorkId);
    if (!work) return;
    const { mode: effective, focusId: nextFocus } = resolveSession(
      work,
      studyEnabled,
      nextMode,
    );
    setWorkId(work.id);
    setMode(effective);
    setFocusId(nextFocus);
    setView("read");
  }

  if (view === "home") {
    return <Home onOpen={start} studyEnabled={studyEnabled} />;
  }

  const work = workById(workId) ?? defaultWork;

  if (work.studyEnabled && studyEnabled && mode === "study") {
    return (
      <Reader
        work={work}
        focusId={focusId}
        onFocus={setFocusId}
        onHome={goHome}
      />
    );
  }

  return (
    <Lectio
      work={work}
      focusId={focusId}
      onFocus={setFocusId}
      onHome={goHome}
    />
  );
}

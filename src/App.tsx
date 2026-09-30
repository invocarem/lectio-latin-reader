import { useState, type ReactNode } from "react";
import { Home } from "./components/Home";
import { Lectio } from "./components/Lectio";
import { Office } from "./components/Office";
import { Reader } from "./components/Reader";
import { workById, works } from "./content/works";
import { resolveSession } from "./lectioNav";
import { platformSupportsStudy } from "./native";
import { SessionView } from "./session/SessionView";
import { lectioIndex, type OfferedPlace } from "./session/psalter";
import { localDate, sessionFromJson, startSession, type SessionFile } from "./session/session";
import { exportSession, loadSession, saveSession } from "./session/store";
import type { ReaderMode, WorkId } from "./types";

export default function App() {
  const defaultWork = works[0];
  const [view, setView] = useState<"home" | "read">("home");
  const [workId, setWorkId] = useState<WorkId>(defaultWork.id);
  const [mode, setMode] = useState<ReaderMode>("lectio");
  const [focusId, setFocusId] = useState<string>(defaultWork.lectio[0].id);
  const [session, setSession] = useState<SessionFile | null>(() => loadSession());
  const [sessionOpen, setSessionOpen] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [officeAt, setOfficeAt] = useState<{ weekday: OfferedPlace["weekday"]; hour: OfferedPlace["hour"]; index: number } | null>(null);

  // Study and plates on desktop and iPad. iPhone stays on Lectio.
  const studyEnabled = platformSupportsStudy();

  function goHome() {
    setView("home");
  }

  function keepSession(next: SessionFile) {
    setSession(next);
    saveSession(next);
  }

  function toggleSession() {
    if (sessionOpen) {
      setSessionOpen(false);
      return;
    }
    if (!session) keepSession(startSession(localDate(new Date()), 14));
    setImportError(null);
    setSessionOpen(true);
  }

  function openPlace(place: OfferedPlace) {
    setOfficeAt({
      weekday: place.weekday,
      hour: place.hour,
      index: lectioIndex(place),
    });
    setWorkId("psalter");
    setMode("office-lectio");
    setSessionOpen(false);
    setView("read");
  }

  async function importSession(file: File) {
    const loaded = sessionFromJson(await file.text());
    if (!loaded) {
      setImportError("That file is not a session.");
      return;
    }
    keepSession(loaded);
    setImportError(null);
  }

  function start(nextWorkId: WorkId, nextMode?: ReaderMode) {
    const work = workById(nextWorkId);
    if (!work) return;
    const { mode: effective, focusId: nextFocus } = resolveSession(
      work,
      studyEnabled,
      nextMode,
    );
    setOfficeAt(null);
    setWorkId(work.id);
    setMode(effective);
    setFocusId(nextFocus);
    setView("read");
  }

  let page: ReactNode;
  if (view === "home") {
    page = <Home onOpen={start} studyEnabled={studyEnabled} />;
  } else {
    const work = workById(workId) ?? defaultWork;
    if (work.officeEnabled && (mode === "office" || mode === "office-lectio")) {
      page = (
        <Office
          work={work}
          reading={mode === "office-lectio" ? "line" : "hour"}
          onHome={goHome}
          start={officeAt}
          session={session}
          onSession={keepSession}
        />
      );
    } else if (work.studyEnabled && studyEnabled && mode === "study") {
      page = <Reader work={work} focusId={focusId} onFocus={setFocusId} onHome={goHome} />;
    } else {
      page = <Lectio work={work} focusId={focusId} onFocus={setFocusId} onHome={goHome} />;
    }
  }

  return (
    <>
      <button
        className="session-switch"
        type="button"
        aria-pressed={sessionOpen}
        aria-expanded={sessionOpen}
        aria-controls="session-panel"
        onClick={toggleSession}
      >
        Session
      </button>
      {sessionOpen && session ? (
        <SessionView
          session={session}
          today={new Date()}
          importError={importError}
          onChange={keepSession}
          onOpen={openPlace}
          onExport={() => exportSession(session)}
          onImport={(file) => void importSession(file)}
        />
      ) : null}
      {page}
    </>
  );
}

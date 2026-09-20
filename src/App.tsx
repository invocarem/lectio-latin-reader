import { useMemo, useState } from "react";
import { Home } from "./components/Home";
import { Reader } from "./components/Reader";
import { units } from "./content/work";

export default function App() {
  const startId = useMemo(() => units[0].id, []);
  const [view, setView] = useState<"home" | "read">("home");
  const [focusId, setFocusId] = useState(startId);

  if (view === "home") {
    return (
      <Home
        onStart={() => {
          setFocusId(startId);
          setView("read");
        }}
      />
    );
  }

  return (
    <Reader
      focusId={focusId}
      onFocus={setFocusId}
      onHome={() => setView("home")}
    />
  );
}

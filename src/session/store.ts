import { sessionFromJson, type SessionFile } from "./session";

const KEY = "lectio.session";

export function loadSession(): SessionFile | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return sessionFromJson(raw);
  } catch {
    return null;
  }
}

export function saveSession(session: SessionFile): void {
  localStorage.setItem(KEY, JSON.stringify(session));
}

/** Download the open pass. The browser saves the file on this computer. */
export function exportSession(session: SessionFile): void {
  const blob = new Blob([JSON.stringify(session, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `session-${session.id}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

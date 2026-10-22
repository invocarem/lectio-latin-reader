/**
 * The sync folder on this device. The desktop keeps a File System Access
 * directory handle. The phone keeps a security-scoped bookmark of that folder.
 * `lectio-sessions.json` and `notes/` live inside it.
 */

import { Capacitor, registerPlugin } from "@capacitor/core";
import { openLectioDb, SYNC_FILE_STORE } from "./lectioDb";
import { indexedNoteFiles, onLearningNoteEdit, type NoteFile } from "./noteStore";
import { onSessionEdit } from "./store";
import { createSync, type SyncController, type SyncTransport } from "./sync";
import {
  clearEndpoint,
  loadEndpoint,
  saveEndpoint,
  serviceTransport,
  type ServiceEndpoint,
} from "./serviceSync";

type NativeSync = {
  ready(): Promise<{ state: "ready" | "none"; name?: string }>;
  pick(): Promise<{ name: string }>;
  read(): Promise<{ text: string }>;
  write(options: { text: string }): Promise<void>;
  listNotes(): Promise<{ files: NoteFile[] }>;
  writeNote(options: { name: string; text: string }): Promise<void>;
  removeNote(options: { name: string }): Promise<void>;
};

const NativeSyncFile = registerPlugin<NativeSync>("SyncFile");

const HANDLE_KEY = "file";

const SESSIONS_FILE = "lectio-sessions.json";
const NOTES_DIR = "notes";

type PickerWindow = Window & {
  showDirectoryPicker?: (options?: { id?: string; mode?: "read" | "readwrite" }) => Promise<FileSystemDirectoryHandle>;
};

async function loadHandle(): Promise<FileSystemHandle | null> {
  const db = await openLectioDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SYNC_FILE_STORE, "readonly");
    const request = tx.objectStore(SYNC_FILE_STORE).get(HANDLE_KEY);
    request.onsuccess = () => resolve((request.result as FileSystemHandle | undefined) ?? null);
    request.onerror = () => reject(request.error);
  });
}

/** The picked folder. A handle left from the old single-file picker is ignored. */
async function loadDirectory(): Promise<FileSystemDirectoryHandle | null> {
  const handle = await loadHandle();
  if (!handle || handle.kind !== "directory") return null;
  return handle as FileSystemDirectoryHandle;
}

async function storeHandle(handle: FileSystemDirectoryHandle): Promise<void> {
  const db = await openLectioDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(SYNC_FILE_STORE, "readwrite");
    tx.objectStore(SYNC_FILE_STORE).put(handle, HANDLE_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

type PermissionedHandle = FileSystemDirectoryHandle & {
  queryPermission(descriptor: { mode: "readwrite" }): Promise<"granted" | "prompt" | "denied">;
  requestPermission(descriptor: { mode: "readwrite" }): Promise<"granted" | "prompt" | "denied">;
};

async function permission(handle: FileSystemDirectoryHandle, request: boolean): Promise<"granted" | "prompt" | "denied"> {
  const permitted = handle as PermissionedHandle;
  const mode = { mode: "readwrite" as const };
  const current = await permitted.queryPermission(mode);
  if (current === "granted" || !request) return current;
  return permitted.requestPermission(mode);
}

function missing(error: unknown): boolean {
  return error instanceof DOMException && error.name === "NotFoundError";
}

async function readSessions(dir: FileSystemDirectoryHandle): Promise<string> {
  try {
    const handle = await dir.getFileHandle(SESSIONS_FILE);
    return (await handle.getFile()).text();
  } catch (error) {
    if (missing(error)) return "";
    throw error;
  }
}

async function writeSessions(dir: FileSystemDirectoryHandle, text: string): Promise<void> {
  const handle = await dir.getFileHandle(SESSIONS_FILE, { create: true });
  const writable = await handle.createWritable();
  await writable.write(text);
  await writable.close();
}

async function notesDirectory(dir: FileSystemDirectoryHandle, create: boolean): Promise<FileSystemDirectoryHandle | null> {
  try {
    return await dir.getDirectoryHandle(NOTES_DIR, { create });
  } catch (error) {
    if (!create && missing(error)) return null;
    throw error;
  }
}

async function listNoteFiles(dir: FileSystemDirectoryHandle): Promise<NoteFile[]> {
  const notes = await notesDirectory(dir, false);
  if (!notes) return [];
  const files: NoteFile[] = [];
  const listing = notes as FileSystemDirectoryHandle & {
    entries(): AsyncIterable<[string, FileSystemHandle]>;
  };
  for await (const [name, handle] of listing.entries()) {
    if (handle.kind !== "file") continue;
    const file = await (handle as FileSystemFileHandle).getFile();
    files.push({ name, text: await file.text() });
  }
  return files;
}

async function writeNoteFile(dir: FileSystemDirectoryHandle, name: string, text: string): Promise<void> {
  const notes = await notesDirectory(dir, true);
  if (!notes) throw new Error("notes");
  const handle = await notes.getFileHandle(name, { create: true });
  const writable = await handle.createWritable();
  await writable.write(text);
  await writable.close();
}

async function removeNoteFile(dir: FileSystemDirectoryHandle, name: string): Promise<void> {
  const notes = await notesDirectory(dir, false);
  if (!notes) return;
  try {
    await notes.removeEntry(name);
  } catch (error) {
    if (!missing(error)) throw error;
  }
}

function webTransport(): SyncTransport {
  return {
    async status() {
      const handle = await loadDirectory();
      if (!handle) return "none";
      const state = await permission(handle, false);
      return state === "granted" ? "ready" : "needs-gesture";
    },
    async choose() {
      const picker = window as PickerWindow;
      if (!picker.showDirectoryPicker) throw new Error("unsupported");
      const handle = await picker.showDirectoryPicker({ id: "lectio-sessions", mode: "readwrite" });
      await permission(handle, true);
      await storeHandle(handle);
    },
    async prepare() {
      const handle = await loadDirectory();
      if (!handle) throw new Error("none");
      const state = await permission(handle, true);
      if (state !== "granted") throw new Error("denied");
    },
    async read() {
      const handle = await loadDirectory();
      if (!handle) throw new Error("none");
      return readSessions(handle);
    },
    async write(text) {
      const handle = await loadDirectory();
      if (!handle) throw new Error("none");
      await writeSessions(handle, text);
    },
    async listNotes() {
      const handle = await loadDirectory();
      if (!handle) return null;
      return listNoteFiles(handle);
    },
    async writeNote(name, text) {
      const handle = await loadDirectory();
      if (!handle) throw new Error("none");
      await writeNoteFile(handle, name, text);
    },
    async removeNote(name) {
      const handle = await loadDirectory();
      if (!handle) throw new Error("none");
      await removeNoteFile(handle, name);
    },
  };
}

function nativeTransport(): SyncTransport {
  return {
    async status() {
      try {
        const result = await NativeSyncFile.ready();
        return result.state === "ready" ? "ready" : "none";
      } catch {
        return "none";
      }
    },
    async choose() {
      await NativeSyncFile.pick();
    },
    async prepare() {
      await NativeSyncFile.pick();
    },
    async read() {
      const result = await NativeSyncFile.read();
      return result.text;
    },
    async write(text) {
      await NativeSyncFile.write({ text });
    },
    async listNotes() {
      const result = await NativeSyncFile.listNotes();
      return result.files ?? [];
    },
    async writeNote(name, text) {
      await NativeSyncFile.writeNote({ name, text });
    },
    async removeNote(name) {
      await NativeSyncFile.removeNote({ name });
    },
  };
}

function unsupportedTransport(): SyncTransport {
  return {
    status: async () => "unsupported",
    choose: async () => {
      throw new Error("unsupported");
    },
    prepare: async () => {
      throw new Error("unsupported");
    },
    read: async () => {
      throw new Error("unsupported");
    },
    write: async () => {
      throw new Error("unsupported");
    },
  };
}

export function fileTransport(): SyncTransport {
  if (Capacitor.isNativePlatform()) return nativeTransport();
  if (typeof window !== "undefined" && typeof (window as PickerWindow).showDirectoryPicker === "function") {
    return webTransport();
  }
  return unsupportedTransport();
}

/** The picked filename, when the backend can report it. Used only for the label, never for identity. */
export async function currentSyncFileName(): Promise<string | null> {
  if (Capacitor.isNativePlatform()) {
    try {
      const result = await NativeSyncFile.ready();
      return result.name ?? null;
    } catch {
      return null;
    }
  }
  if (typeof window !== "undefined" && typeof (window as PickerWindow).showDirectoryPicker === "function") {
    const handle = await loadDirectory();
    return handle?.name ?? null;
  }
  return null;
}

function serviceStorage(): Storage | null {
  return typeof window !== "undefined" ? window.localStorage : null;
}

/**
 * One device uses one backend at a time: a saved service endpoint means the
 * service, otherwise the picked file. Both setups are kept independently: a
 * chosen file handle is never deleted, and a saved service is never removed
 * except by an explicit fallback to the file. This routing decides which of
 * the two transports a call goes to.
 */
export function liveTransport(options: {
  file: SyncTransport;
  service: SyncTransport;
  /** True when a service endpoint is saved. */
  hasService: () => boolean;
  /** Called after the file is successfully picked (e.g. to clear the service). */
  onFileChosen: () => void;
}): SyncTransport {
  return {
    async status() {
      return options.hasService() ? options.service.status() : options.file.status();
    },
    async choose() {
      // Run the picker first: only a successful pick replaces a saved service.
      // A cancelled picker keeps the service as the active backend.
      await options.file.choose();
      options.onFileChosen();
    },
    async prepare() {
      return options.hasService() ? options.service.prepare() : options.file.prepare();
    },
    async read() {
      return options.hasService() ? options.service.read() : options.file.read();
    },
    async write(text) {
      return options.hasService() ? options.service.write(text) : options.file.write(text);
    },
    async listNotes() {
      const transport = options.hasService() ? options.service : options.file;
      if (!transport.listNotes) return null;
      return transport.listNotes();
    },
    async writeNote(name, text) {
      const transport = options.hasService() ? options.service : options.file;
      if (!transport.writeNote) return;
      await transport.writeNote(name, text);
    },
    async removeNote(name) {
      const transport = options.hasService() ? options.service : options.file;
      if (!transport.removeNote) return;
      await transport.removeNote(name);
    },
  };
}

export const sync: SyncController = createSync({
  transport: liveTransport({
    file: fileTransport(),
    service: serviceTransport({ load: () => loadEndpoint(serviceStorage()) }),
    hasService: () => !!loadEndpoint(serviceStorage()),
    onFileChosen: () => clearEndpoint(serviceStorage()),
  }),
  notes: indexedNoteFiles(),
  onRefreshed: () => {
    window.dispatchEvent(new Event("lectio:sessions"));
    window.dispatchEvent(new Event("lectio:notes"));
  },
});

/** Store the service address and token, then pull its pass. Progress edits upload on their own. */
export function configureSyncService(endpoint: ServiceEndpoint): Promise<void> {
  saveEndpoint(endpoint, serviceStorage());
  return sync.syncNow({ pull: true });
}

/** The service this device is aimed at, if it saved one. */
export function currentSyncService(): ServiceEndpoint | null {
  return loadEndpoint(serviceStorage());
}

/** Forget the saved service and pull the file. */
export function clearSyncService(): Promise<void> {
  clearEndpoint(serviceStorage());
  return sync.syncNow({ pull: true });
}

/** Remember edits, read the file if it is already allowed, and read again when the app is shown. */
export function startSync(): void {
  onSessionEdit(() => sync.noteEdit());
  onLearningNoteEdit(() => sync.noteEdit());
  void sync.start();
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") void sync.syncIfReady();
  });
}

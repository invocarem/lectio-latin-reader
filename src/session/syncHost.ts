/**
 * The sync file on this device. The desktop keeps a File System Access handle.
 * The phone keeps a security-scoped bookmark from the document picker.
 */

import { Capacitor, registerPlugin } from "@capacitor/core";
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
};

const NativeSyncFile = registerPlugin<NativeSync>("SyncFile");

const DB_NAME = "lectio";
const STORE = "sync-file";
const HANDLE_KEY = "file";

type PickerWindow = Window & {
  showOpenFilePicker?: (options: {
    multiple?: boolean;
    id?: string;
    types?: { description: string; accept: Record<string, string[]> }[];
  }) => Promise<FileSystemFileHandle[]>;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function loadHandle(): Promise<FileSystemFileHandle | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const request = tx.objectStore(STORE).get(HANDLE_KEY);
    request.onsuccess = () => resolve((request.result as FileSystemFileHandle | undefined) ?? null);
    request.onerror = () => reject(request.error);
  });
}

async function storeHandle(handle: FileSystemFileHandle): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(handle, HANDLE_KEY);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

type PermissionedHandle = FileSystemFileHandle & {
  queryPermission(descriptor: { mode: "readwrite" }): Promise<"granted" | "prompt" | "denied">;
  requestPermission(descriptor: { mode: "readwrite" }): Promise<"granted" | "prompt" | "denied">;
};

async function permission(handle: FileSystemFileHandle, request: boolean): Promise<"granted" | "prompt" | "denied"> {
  const permitted = handle as PermissionedHandle;
  const mode = { mode: "readwrite" as const };
  const current = await permitted.queryPermission(mode);
  if (current === "granted" || !request) return current;
  return permitted.requestPermission(mode);
}

function webTransport(): SyncTransport {
  return {
    async status() {
      const handle = await loadHandle();
      if (!handle) return "none";
      const state = await permission(handle, false);
      return state === "granted" ? "ready" : "needs-gesture";
    },
    async choose() {
      const picker = window as PickerWindow;
      if (!picker.showOpenFilePicker) throw new Error("unsupported");
      const [handle] = await picker.showOpenFilePicker({
        multiple: false,
        id: "lectio-sessions",
        types: [{ description: "Lectio progress", accept: { "application/json": [".json"] } }],
      });
      await permission(handle, true);
      await storeHandle(handle);
    },
    async prepare() {
      const handle = await loadHandle();
      if (!handle) throw new Error("none");
      const state = await permission(handle, true);
      if (state !== "granted") throw new Error("denied");
    },
    async read() {
      const handle = await loadHandle();
      if (!handle) throw new Error("none");
      const file = await handle.getFile();
      return file.text();
    },
    async write(text) {
      const handle = await loadHandle();
      if (!handle) throw new Error("none");
      const writable = await handle.createWritable();
      await writable.write(text);
      await writable.close();
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
  if (typeof window !== "undefined" && typeof (window as PickerWindow).showOpenFilePicker === "function") {
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
  if (typeof window !== "undefined" && typeof (window as PickerWindow).showOpenFilePicker === "function") {
    const handle = await loadHandle();
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
  };
}

export const sync: SyncController = createSync({
  transport: liveTransport({
    file: fileTransport(),
    service: serviceTransport({ load: () => loadEndpoint(serviceStorage()) }),
    hasService: () => !!loadEndpoint(serviceStorage()),
    onFileChosen: () => clearEndpoint(serviceStorage()),
  }),
  onRefreshed: () => window.dispatchEvent(new Event("lectio:sessions")),
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
  void sync.start();
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") void sync.syncIfReady();
  });
}

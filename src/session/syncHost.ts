/**
 * The sync file on this device. The desktop keeps a File System Access handle.
 * The phone keeps a security-scoped bookmark from the document picker.
 */

import { Capacitor, registerPlugin } from "@capacitor/core";
import { onSessionEdit } from "./store";
import { createSync, type SyncController, type SyncTransport } from "./sync";

type NativeSync = {
  ready(): Promise<{ state: "ready" | "none" }>;
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

export function liveTransport(): SyncTransport {
  if (Capacitor.isNativePlatform()) return nativeTransport();
  if (typeof window !== "undefined" && typeof (window as PickerWindow).showOpenFilePicker === "function") {
    return webTransport();
  }
  return unsupportedTransport();
}

export const sync: SyncController = createSync({
  transport: liveTransport(),
  onRefreshed: () => window.dispatchEvent(new Event("lectio:sessions")),
});

/** Remember edits, read the file if it is already allowed, and read again when the app is shown. */
export function startSync(): void {
  onSessionEdit(() => sync.noteEdit());
  void sync.start();
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") void sync.syncIfReady();
  });
}

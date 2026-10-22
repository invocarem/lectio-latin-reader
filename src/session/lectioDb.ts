/**
 * One IndexedDB database for this app. The sync file handle and the learning
 * notes share it, in different stores. Version 2 adds the notes store beside
 * the handle store from version 1.
 */

export const LECTIO_DB_NAME = "lectio";
export const LECTIO_DB_VERSION = 2;
export const SYNC_FILE_STORE = "sync-file";
export const LEARNING_NOTES_STORE = "notes";

export function openLectioDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(LECTIO_DB_NAME, LECTIO_DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(SYNC_FILE_STORE)) db.createObjectStore(SYNC_FILE_STORE);
      if (!db.objectStoreNames.contains(LEARNING_NOTES_STORE)) db.createObjectStore(LEARNING_NOTES_STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

import type { Snapshot } from "@/lib/vdj/types";

const DB_NAME = "kabina";
const STORE = "snapshot";
const HANDLES = "handles";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 2);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE);
      if (!request.result.objectStoreNames.contains(HANDLES)) request.result.createObjectStore(HANDLES);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("idb"));
  });
}

export async function loadSnapshot(): Promise<Snapshot | null> {
  if (typeof indexedDB === "undefined") return null;
  try {
    const db = await openDb();
    return await new Promise((resolve) => {
      const tx = db.transaction(STORE, "readonly");
      const get = tx.objectStore(STORE).get("current");
      get.onsuccess = () => {
        const value = get.result as Snapshot | undefined;
        resolve(value && value.v === 1 && Array.isArray(value.tracks) ? value : null);
      };
      get.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function saveSnapshot(snapshot: Snapshot): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(snapshot, "current");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("idb"));
  });
}

export async function deleteSnapshot(): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  const db = await openDb();
  await new Promise<void>((resolve) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete("current");
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
  });
}

export async function loadSourceFolder(): Promise<FileSystemDirectoryHandle | null> {
  if (typeof indexedDB === "undefined") return null;
  try {
    const db = await openDb();
    return await new Promise((resolve) => {
      const tx = db.transaction(HANDLES, "readonly");
      const get = tx.objectStore(HANDLES).get("vdj");
      get.onsuccess = () => resolve((get.result as FileSystemDirectoryHandle | undefined) ?? null);
      get.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function saveSourceFolder(handle: FileSystemDirectoryHandle): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(HANDLES, "readwrite");
    tx.objectStore(HANDLES).put(handle, "vdj");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("idb"));
  });
}

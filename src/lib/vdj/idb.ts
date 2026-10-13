import type { Snapshot } from "@/lib/vdj/types";
import type { ChartSong } from "@/lib/dfm-chart";

const DB_NAME = "kabina";
const STORE = "snapshot";
const HANDLES = "handles";
const CACHE = "cache";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 3);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE);
      if (!request.result.objectStoreNames.contains(HANDLES)) request.result.createObjectStore(HANDLES);
      if (!request.result.objectStoreNames.contains(CACHE)) request.result.createObjectStore(CACHE);
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

export async function loadDfmCache(): Promise<ChartSong[] | null> {
  if (typeof indexedDB === "undefined") return null;
  try {
    const db = await openDb();
    return await new Promise((resolve) => {
      const tx = db.transaction(CACHE, "readonly");
      const get = tx.objectStore(CACHE).get("dfm");
      get.onsuccess = () => {
        const value = get.result as { songs: ChartSong[]; at: number } | undefined;
        if (!value || !Array.isArray(value.songs) || Date.now() - value.at > 6 * 60 * 60 * 1000) {
          resolve(null);
          return;
        }
        resolve(value.songs);
      };
      get.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function saveDfmCache(songs: ChartSong[]): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  try {
    const db = await openDb();
    await new Promise<void>((resolve) => {
      const tx = db.transaction(CACHE, "readwrite");
      tx.objectStore(CACHE).put({ songs, at: Date.now() }, "dfm");
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {
    /* ignore */
  }
}

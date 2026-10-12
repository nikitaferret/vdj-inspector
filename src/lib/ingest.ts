import { ParseError, isHistoryM3u, isHistoryText, isLibraryText, parseDatabaseXml, parseHistory, parseHistoryM3u } from "@/lib/vdj/parse";
import { useLibrary } from "@/lib/store";
import type { RawPlay, RawSession, RawTrack } from "@/lib/vdj/types";

export type IngestResult = {
  ok: boolean;
  tracks: number;
  plays: number;
  sessions: number;
  ignored: string[];
  error?: "empty" | "unrecognized" | "no-songs" | "not-history";
};

export async function ingestFiles(files: File[]): Promise<IngestResult> {
  if (files.length === 0) return { ok: false, tracks: 0, plays: 0, sessions: 0, ignored: [], error: "empty" };

  const picked = classify(files);
  let library: { name: string; tracks: RawTrack[] } | null = null;
  const histories: { name: string; sessions: RawSession[]; plays: RawPlay[] }[] = [];
  const ignored: string[] = [];
  let sawHistory = false;

  const libraryFilePick = picked.library[0];
  if (libraryFilePick) {
    const text = (await libraryFilePick.text()).replace(/^\uFEFF/, "");
    if (!isLibraryText(text)) {
      ignored.push(libraryFilePick.webkitRelativePath || libraryFilePick.name);
    } else {
      try {
        library = { name: libraryFilePick.name, tracks: dedupeTracks(parseDatabaseXml(text)) };
      } catch (error) {
        if (error instanceof ParseError && error.code === "no-songs") {
          return { ok: false, tracks: 0, plays: 0, sessions: 0, ignored, error: "no-songs" };
        }
        throw error;
      }
    }
  }

  for (const file of picked.history) {
    const label = file.webkitRelativePath || file.name;
    const text = (await file.text()).replace(/^\uFEFF/, "");
    if (!(isHistoryText(text) || isHistoryM3u(text))) continue;
    sawHistory = true;
    try {
      const parsed = isHistoryText(text) ? parseHistory(text, label) : parseHistoryM3u(text, label);
      histories.push({ name: label, ...parsed });
    } catch (error) {
      if (error instanceof ParseError && error.code === "not-history") {
        ignored.push(label);
        continue;
      }
      throw error;
    }
  }

  if (!library && histories.length === 0) {
    return {
      ok: false,
      tracks: 0,
      plays: 0,
      sessions: 0,
      ignored,
      error: sawHistory ? "not-history" : "unrecognized",
    };
  }

  const current = useLibrary.getState();
  const keepUser = current.origin === "user";
  const tracks = library ? library.tracks : keepUser ? current.tracks : [];
  const sessions = histories.length
    ? histories.flatMap((item) => item.sessions)
    : keepUser
      ? current.sessions
      : [];
  const plays = dedupePlays(
    histories.length ? histories.flatMap((item) => item.plays) : keepUser ? current.plays : [],
  );
  const libraryFile = library ? library.name : keepUser ? current.libraryFile : null;
  const historyFile = histories.length
    ? histories.map((item) => item.name).join(", ")
    : keepUser
      ? current.historyFile
      : null;

  current.commit({ tracks, sessions, plays, libraryFile, historyFile });
  return { ok: true, tracks: tracks.length, plays: plays.length, sessions: sessions.length, ignored };
}

function relevantName(name: string): boolean {
  return /\.(xml|txt|m3u|m3u8)$/i.test(name);
}

function filePath(file: File): string {
  return (file.webkitRelativePath || file.name).replace(/\\/g, "/");
}

function classify(files: File[]): { library: File[]; history: File[] } {
  const usable = files.filter((file) => relevantName(file.name) && file.size <= 250_000_000);
  const rootPick = usable.some((file) => /(^|\/)history\//i.test(filePath(file)));
  const library: File[] = [];
  const history: File[] = [];
  for (const file of usable) {
    const path = filePath(file);
    const base = path.split("/").pop()?.toLowerCase() ?? "";
    const underHistory = /(^|\/)history\//i.test(path);
    if (rootPick) {
      if (underHistory && /\.(m3u8?|txt)$/i.test(base)) history.push(file);
      else if (!underHistory && base === "database.xml") library.push(file);
      continue;
    }
    if (/\.(m3u8?|txt)$/i.test(base)) history.push(file);
    else if (base.endsWith(".xml")) library.push(file);
  }
  library.sort((a, b) => filePath(a).length - filePath(b).length);
  return { library: library.slice(0, 1), history };
}

function dedupeTracks(tracks: RawTrack[]): RawTrack[] {
  const map = new Map<string, RawTrack>();
  for (const track of tracks) {
    const key = (track.filePath || `${track.artist}\0${track.title}`).toLowerCase();
    const prev = map.get(key);
    if (!prev || track.playCount >= prev.playCount) map.set(key, track);
  }
  return [...map.values()];
}

function dedupePlays(plays: RawPlay[]): RawPlay[] {
  const seen = new Set<string>();
  const out: RawPlay[] = [];
  for (const play of plays) {
    const key = `${play.sessionId}|${play.playedAt}|${(play.filePath || `${play.artist}\0${play.title}`).toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(play);
  }
  return out;
}

export async function collectDroppedFiles(transfer: DataTransfer): Promise<File[]> {
  const entries = [...transfer.items]
    .map((item) => item.webkitGetAsEntry())
    .filter((entry): entry is FileSystemEntry => entry != null);
  if (entries.length === 0) return [...transfer.files].filter((file) => relevantName(file.name));

  const out: File[] = [];
  const readFile = (entry: FileSystemFileEntry) => new Promise<File>((resolve, reject) => entry.file(resolve, reject));
  const readDir = (reader: FileSystemDirectoryReader) =>
    new Promise<FileSystemEntry[]>((resolve, reject) => reader.readEntries(resolve, reject));

  async function walk(entry: FileSystemEntry): Promise<void> {
    if (out.length > 8000) return;
    if (entry.isFile) {
      if (!relevantName(entry.name)) return;
      const file = await readFile(entry as FileSystemFileEntry);
      const relative = entry.fullPath.replace(/^\//, "");
      if (relative && relative !== file.name) {
        Object.defineProperty(file, "webkitRelativePath", { value: relative });
      }
      out.push(file);
      return;
    }
    if (!entry.isDirectory) return;
    const reader = (entry as FileSystemDirectoryEntry).createReader();
    for (;;) {
      const batch = await readDir(reader);
      if (batch.length === 0) break;
      for (const child of batch) await walk(child);
    }
  }

  for (const entry of entries) await walk(entry);
  return out;
}

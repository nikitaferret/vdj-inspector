import { formatKey, toCamelot } from "@/lib/vdj/keys";
import type {
  RawPlay,
  RawSession,
  RawTrack,
  Tunables,
  ViewPlay,
  ViewSession,
  ViewTrack,
} from "@/lib/vdj/types";

type GenreRule = { name: string; sources: string[] };

export function parseGenreMap(source: string): GenreRule[] {
  const rules: GenreRule[] = [];
  for (const line of source.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const split = trimmed.split(/[:=]/);
    if (split.length < 2) continue;
    const name = split[0].trim();
    const sources = split
      .slice(1)
      .join(":")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    if (!name || sources.length === 0) continue;
    rules.push({ name, sources });
  }
  return rules;
}

export function displayGenre(genre: string | null, rules: GenreRule[]): string {
  if (!genre) return "";
  const key = genre.trim().toLowerCase();
  for (const rule of rules) {
    if (rule.sources.some((source) => source.toLowerCase() === key)) return rule.name;
  }
  return genre;
}

export function resolveBpm(raw: number | null, tunables: Tunables): number | null {
  if (raw == null || !Number.isFinite(raw) || raw <= 0) return null;
  let bpm = raw;
  const asPeriod = tunables.bpmMode === "period" || (tunables.bpmMode === "auto" && raw < 10);
  if (asPeriod) bpm = 60 / raw;
  if (!Number.isFinite(bpm) || bpm <= 0) return null;
  if (tunables.foldBpm) {
    const floor = Math.min(tunables.bpmFloor, tunables.bpmCeil);
    const ceil = Math.max(tunables.bpmFloor, tunables.bpmCeil);
    let guard = 0;
    while (bpm < floor && bpm * 2 <= ceil + 30 && guard < 6) {
      bpm *= 2;
      guard += 1;
    }
    guard = 0;
    while (bpm > ceil && bpm / 2 >= Math.max(60, floor - 15) && guard < 6) {
      bpm /= 2;
      guard += 1;
    }
  }
  if (bpm < 40 || bpm > 260) return null;
  return Math.round(bpm * 10) / 10;
}

export function normalizeLabel(value: string, fuzzy: boolean): string {
  let text = value.normalize("NFKC").toLowerCase().trim();
  if (fuzzy) {
    text = text.replace(/\([^)]*\)|\[[^\]]*\]/g, " ");
    text = text.replace(/\b(feat|ft|featuring|prod)\.?\b/g, " ");
  }
  text = text.replace(/[^\p{L}\p{N}#]+/gu, " ");
  return text.replace(/\s+/g, " ").trim();
}

function pathKey(filePath: string): string {
  return filePath.replace(/\\/g, "/").replace(/\/+/g, "/").trim().toLowerCase();
}

function baseName(filePath: string): string {
  const key = pathKey(filePath);
  return key.split("/").pop() ?? "";
}

function matchKey(artist: string, title: string, mode: Tunables["matchMode"]): string | null {
  const fuzzy = mode === "fuzzy";
  const titleKey = normalizeLabel(title, fuzzy);
  if (!titleKey) return null;
  if (mode === "title") return `t:${titleKey}`;
  const artistKey = normalizeLabel(artist, fuzzy);
  if (!artistKey) return null;
  return `a:${artistKey}\u0000${titleKey}`;
}

function naiveUtc(value: string): number | null {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!match) return null;
  return Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]), Number(match[4]), Number(match[5]));
}

export function minutesBetween(start: string | null, end: string | null): number | null {
  if (!start || !end) return null;
  const a = naiveUtc(start);
  const b = naiveUtc(end);
  if (a == null || b == null) return null;
  return Math.max(0, Math.round((b - a) / 60000));
}

export type Derived = {
  tracks: ViewTrack[];
  plays: ViewPlay[];
  sessions: ViewSession[];
  genres: string[];
  keys: string[];
  genreRules: GenreRule[];
  kpis: { tracks: number; plays: number; sessions: number; played: number; matched: number };
  monthly: { key: string; total: number }[];
  hourly: { hour: number; total: number }[];
  topArtists: { artist: string; total: number }[];
  topTracks: { id: string; label: string; total: number; vdj: number | null }[];
  keyCounts: Record<string, number>;
};

export function derive(
  rawTracks: RawTrack[],
  rawSessions: RawSession[],
  rawPlays: RawPlay[],
  tunables: Tunables,
): Derived {
  const genreRules = parseGenreMap(tunables.genreMap);
  const baseTracks: ViewTrack[] = rawTracks.map((track) => {
    const camelot = toCamelot(track.musicalKey);
    return {
      ...track,
      bpm: resolveBpm(track.bpmRaw, tunables),
      camelot,
      keyLabel: formatKey(camelot, tunables),
      genreLabel: displayGenre(track.genre, genreRules),
      historyPlays: 0,
      lastHistoryAt: null,
    };
  });

  const lookup = new Map<string, string | null>();
  for (const track of baseTracks) {
    const key = matchKey(track.artist, track.title, tunables.matchMode);
    if (!key) continue;
    if (lookup.has(key)) lookup.set(key, null);
    else lookup.set(key, track.id);
  }

  const byPath = new Map<string, string | null>();
  const byBase = new Map<string, string | null>();
  for (const track of baseTracks) {
    const full = pathKey(track.filePath);
    if (full) {
      if (byPath.has(full)) byPath.set(full, null);
      else byPath.set(full, track.id);
    }
    const base = baseName(track.filePath);
    if (base) {
      if (byBase.has(base)) byBase.set(base, null);
      else byBase.set(base, track.id);
    }
  }

  const sessionDate = new Map(rawSessions.map((session) => [session.id, session.sessionDate]));
  const byId = new Map(baseTracks.map((track) => [track.id, track]));
  let matched = 0;

  const seenPlay = new Set<string>();
  const plays: ViewPlay[] = [];
  for (const play of rawPlays) {
    const stamp = play.playedAt.slice(0, 16);
    const duplicateKey = `${play.title.trim().toLowerCase()}|${stamp}`;
    if (seenPlay.has(duplicateKey)) continue;
    seenPlay.add(duplicateKey);

    let trackId: string | null = null;
    if (play.filePath) {
      trackId = byPath.get(pathKey(play.filePath)) ?? byBase.get(baseName(play.filePath)) ?? null;
    }
    if (!trackId) {
      const key = matchKey(play.artist, play.title, tunables.matchMode);
      trackId = key ? (lookup.get(key) ?? null) : null;
    }
    if (trackId) matched += 1;
    const track = trackId ? byId.get(trackId) : undefined;
    if (track) {
      track.historyPlays += 1;
      if (!track.lastHistoryAt || play.playedAt > track.lastHistoryAt) track.lastHistoryAt = play.playedAt;
    }
    plays.push({
      ...play,
      trackId,
      sessionDate: sessionDate.get(play.sessionId) ?? play.playedAt.slice(0, 10),
      bpm: track?.bpm ?? null,
      camelot: track?.camelot ?? null,
      keyLabel: track?.keyLabel ?? "—",
      genreLabel: track?.genreLabel ?? "",
    });
  }

  const sessions: ViewSession[] = rawSessions
    .map((session) => {
      const rows = plays.filter((play) => play.sessionId === session.id);
      const artists = new Set(rows.map((play) => play.artist).filter(Boolean));
      const bpms = rows.map((play) => play.bpm).filter((bpm): bpm is number => bpm != null);
      const matchedRows = rows.filter((play) => play.trackId).length;
      return {
        ...session,
        trackCount: rows.length,
        matched: matchedRows,
        artistCount: artists.size,
        avgBpm: bpms.length ? Math.round((bpms.reduce((sum, bpm) => sum + bpm, 0) / bpms.length) * 10) / 10 : null,
        spanMinutes: minutesBetween(session.startedAt, session.endedAt),
      };
    })
    .sort((a, b) => (b.startedAt ?? b.sessionDate).localeCompare(a.startedAt ?? a.sessionDate));

  const monthMap = new Map<string, number>();
  const hourBuckets = Array.from({ length: 24 }, (_, hour) => ({ hour, total: 0 }));
  const artistMap = new Map<string, number>();
  const trackMap = new Map<string, { id: string; label: string; total: number; vdj: number | null }>();
  for (const play of plays) {
    const month = play.playedAt.slice(0, 7);
    monthMap.set(month, (monthMap.get(month) ?? 0) + 1);
    const hour = Number(play.playedAt.slice(11, 13));
    if (hour >= 0 && hour <= 23) hourBuckets[hour].total += 1;
    if (play.artist) artistMap.set(play.artist, (artistMap.get(play.artist) ?? 0) + 1);
    const label = [play.artist, play.title].filter(Boolean).join(" — ") || play.title;
    const id = play.trackId ?? label.toLowerCase();
    const libraryTrack = play.trackId ? byId.get(play.trackId) : undefined;
    const row = trackMap.get(id) ?? { id, label, total: 0, vdj: libraryTrack ? libraryTrack.playCount : null };
    row.total += 1;
    trackMap.set(id, row);
  }

  const keyCounts: Record<string, number> = {};
  for (const track of baseTracks) {
    if (tunables.wheelRequireKey && !track.camelot) continue;
    if (track.playCount < tunables.wheelMinPlays) continue;
    if (!track.camelot) continue;
    keyCounts[track.camelot] = (keyCounts[track.camelot] ?? 0) + 1;
  }

  const genres = [...new Set(baseTracks.map((track) => track.genreLabel).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b),
  );
  const keys = [...new Set(baseTracks.map((track) => track.keyLabel).filter((key) => key && key !== "—"))].sort(
    (a, b) => a.localeCompare(b, undefined, { numeric: true }),
  );

  return {
    tracks: baseTracks,
    plays,
    sessions,
    genres,
    keys,
    genreRules,
    kpis: {
      tracks: baseTracks.length,
      plays: plays.length,
      sessions: sessions.length,
      played: baseTracks.filter((track) => track.playCount > 0).length,
      matched,
    },
    monthly: [...monthMap.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, total]) => ({ key, total })),
    hourly: hourBuckets,
    topArtists: [...artistMap.entries()]
      .map(([artist, total]) => ({ artist, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8),
    topTracks: [...trackMap.values()].sort((a, b) => b.total - a.total || a.label.localeCompare(b.label)),
    keyCounts,
  };
}

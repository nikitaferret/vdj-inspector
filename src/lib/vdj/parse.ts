import type { RawPlay, RawSession, RawTrack } from "@/lib/vdj/types";

export class ParseError extends Error {
  code: "no-songs" | "not-history";

  constructor(code: "no-songs" | "not-history") {
    super(code);
    this.code = code;
  }
}

function hash(value: string): string {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

const XML_AMP = "&" + "amp;";
const XML_QUOT = "&" + "quot;";
const XML_APOS = "&" + "apos;";
const XML_LT = "&" + "lt;";
const XML_GT = "&" + "gt;";

function decodeXml(value: string): string {
  return value
    .split(XML_QUOT)
    .join('"')
    .split(XML_APOS)
    .join("'")
    .split(XML_LT)
    .join("<")
    .split(XML_GT)
    .join(">")
    .split(XML_AMP)
    .join("&");
}

function readAttrs(source: string): Record<string, string> {
  const out: Record<string, string> = {};
  const re = /([A-Za-z_][\w:.-]*)\s*=\s*"([^"]*)"/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(source))) {
    out[match[1]] = decodeXml(match[2]);
  }
  return out;
}

function blockAttrs(inner: string, tag: string): Record<string, string> {
  const re = new RegExp(`<${tag}\\b([^>]*)\\/?>`, "i");
  const match = inner.match(re);
  return match ? readAttrs(match[1]) : {};
}

function num(value: string | undefined): number | null {
  if (value == null || value.trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function text(value: string | undefined): string | null {
  const next = value?.trim() ?? "";
  return next ? next : null;
}

function unixToIso(value: string | undefined): string | null {
  const seconds = num(value);
  if (seconds == null || seconds <= 0) return null;
  const date = new Date(seconds * 1000);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function fromPath(filePath: string): { artist: string; title: string } {
  const base = filePath.split(/[/\\]/).pop() ?? "";
  const name = base.replace(/\.[^.]+$/, "");
  const splitAt = name.indexOf(" - ");
  if (splitAt === -1) return { artist: "", title: name.trim() };
  return {
    artist: name.slice(0, splitAt).trim(),
    title: name.slice(splitAt + 3).trim(),
  };
}

export function parseDatabaseXml(xml: string): RawTrack[] {
  const source = xml.replace(/^\uFEFF/, "");
  const chunks = source.split(/<Song\b/i).slice(1);
  if (chunks.length === 0) throw new ParseError("no-songs");

  const tracks: RawTrack[] = [];
  const seen = new Set<string>();

  for (const chunk of chunks) {
    const openEnd = chunk.indexOf(">");
    if (openEnd === -1) continue;
    const open = chunk.slice(0, openEnd);
    const inner = chunk.slice(openEnd + 1).split(/<\/Song>/i)[0] ?? "";
    const song = readAttrs(open);
    const tags = blockAttrs(inner, "Tags");
    const infos = blockAttrs(inner, "Infos");
    const scan = blockAttrs(inner, "Scan");
    const filePath = text(song.FilePath);
    if (!filePath || seen.has(filePath)) continue;
    seen.add(filePath);

    const fallback = fromPath(filePath);
    const title = text(tags.Title) ?? fallback.title;
    const artist = text(tags.Author) ?? fallback.artist;
    if (!title) continue;

    const bpmRaw = num(scan.Bpm) ?? num(tags.Bpm);
    tracks.push({
      id: `t_${hash(filePath)}`,
      filePath,
      title,
      artist,
      remix: text(tags.Remix),
      genre: text(tags.Genre),
      year: num(tags.Year),
      bpmRaw,
      musicalKey: text(scan.Key) ?? text(tags.Key),
      durationSeconds: num(infos.SongLength),
      bitrate: num(infos.Bitrate),
      firstPlay: unixToIso(infos.FirstPlay),
      lastPlay: unixToIso(infos.LastPlay),
      playCount: Math.max(0, Math.round(num(infos.PlayCount) ?? 0)),
    });
  }

  if (tracks.length === 0) throw new ParseError("no-songs");
  return tracks;
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function stamp(year: number, month: number, day: number, hours: number, minutes: number): string {
  return `${year}-${pad(month)}-${pad(day)}T${pad(hours)}:${pad(minutes)}:00`;
}

function nextDay(year: number, month: number, day: number): { year: number; month: number; day: number } {
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const lengths = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (day < lengths[month - 1]) return { year, month, day: day + 1 };
  if (month < 12) return { year, month: month + 1, day: 1 };
  return { year: year + 1, month: 1, day: 1 };
}

function splitArtistTitle(value: string): { artist: string; title: string } {
  const splitAt = value.indexOf(" - ");
  if (splitAt === -1) return { artist: "", title: value.trim() };
  return {
    artist: value.slice(0, splitAt).trim(),
    title: value.slice(splitAt + 3).trim(),
  };
}

export function parseHistory(content: string, sourceFile = "tracklist.txt"): { sessions: RawSession[]; plays: RawPlay[] } {
  const lines = content.replace(/^\uFEFF/, "").split(/\r?\n/);
  const sessions: RawSession[] = [];
  const plays: RawPlay[] = [];

  let current: RawSession | null = null;
  let cursor: { year: number; month: number; day: number } | null = null;
  let lastMinute: number | null = null;

  for (let lineNumber = 0; lineNumber < lines.length; lineNumber += 1) {
    const line = lines[lineNumber].trim();
    const header = line.match(/^VirtualDJ History\s+(\d{4})\/(\d{2})\/(\d{2})/i);
    if (header) {
      const year = Number(header[1]);
      const month = Number(header[2]);
      const day = Number(header[3]);
      cursor = { year, month, day };
      lastMinute = null;
      current = {
        id: `s_${hash(`${sourceFile}:${lineNumber}`)}`,
        sessionDate: `${header[1]}-${header[2]}-${header[3]}`,
        startedAt: null,
        endedAt: null,
        sourceFile,
      };
      sessions.push(current);
      continue;
    }

    if (!current || !cursor) continue;
    const session = current;
    const play = line.match(/^(\d{1,2}):(\d{2})\s*:\s*(.+)$/);
    if (!play) continue;
    const hours = Number(play[1]);
    const minutes = Number(play[2]);
    if (hours > 23 || minutes > 59) continue;
    const minuteOfDay = hours * 60 + minutes;
    if (lastMinute != null && minuteOfDay < lastMinute) {
      cursor = nextDay(cursor.year, cursor.month, cursor.day);
    }
    lastMinute = minuteOfDay;
    const playedAt = stamp(cursor.year, cursor.month, cursor.day, hours, minutes);
    const originalText = play[3].trim();
    const meta = splitArtistTitle(originalText);
    if (!meta.title) continue;
    const position = plays.filter((item) => item.sessionId === session.id).length;
    plays.push({
      id: `p_${hash(`${session.id}:${position}`)}`,
      sessionId: session.id,
      position,
      playedAt,
      artist: meta.artist,
      title: meta.title,
      originalText,
    });
    current.startedAt ??= playedAt;
    current.endedAt = playedAt;
  }

  const used = new Set(plays.map((play) => play.sessionId));
  const kept = sessions.filter((session) => used.has(session.id));
  if (kept.length === 0) throw new ParseError("not-history");
  return { sessions: kept, plays };
}

export function isLibraryText(text: string): boolean {
  return /<VirtualDJ_Database\b/i.test(text) || (/<Song\b/i.test(text) && /<Tags\b/i.test(text));
}

export function isHistoryText(text: string): boolean {
  return /VirtualDJ History\s+\d{4}\/\d{2}\/\d{2}/i.test(text);
}

export function isHistoryM3u(text: string): boolean {
  return /#EXTVDJ\b/i.test(text) || (/^#EXTM3U/im.test(text) && /#EXTINF:/i.test(text));
}

function xmlTag(source: string, name: string): string {
  const match = source.match(new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)</${name}>`, "i"));
  return match ? decodeXml(match[1]).trim() : "";
}

function clock(value: string): { hours: number; minutes: number } | null {
  const match = value.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return { hours, minutes };
}

function localFromUnix(seconds: number): string | null {
  if (!Number.isFinite(seconds) || seconds <= 0) return null;
  const ms = seconds > 1e12 ? seconds : seconds * 1000;
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) return null;
  return stamp(date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes());
}

function dateInName(sourceFile: string): { year: number; month: number; day: number } | null {
  const match = sourceFile.match(/(\d{4})[-_](\d{2})[-_](\d{2})/);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return { year, month, day };
}

export function parseHistoryM3u(content: string, sourceFile = "history.m3u"): { sessions: RawSession[]; plays: RawPlay[] } {
  const lines = content.replace(/^\uFEFF/, "").split(/\r?\n/);
  const named = dateInName(sourceFile);
  let cursor = named;
  let lastMinute: number | null = null;
  const draft: Array<{ playedAt: string | null; artist: string; title: string; originalText: string; filePath: string | null }> = [];

  let pending: { artist: string; title: string; remix: string; playedAt: string | null; hours: number | null; minutes: number | null } | null = null;

  const pushPath = (filePath: string) => {
    const path = filePath.trim();
    const fromFile = path ? fromPath(path) : { artist: "", title: "" };
    const artist = pending?.artist || fromFile.artist;
    const title = pending?.title || fromFile.title;
    if (!title && !path) {
      pending = null;
      return;
    }
    let playedAt = pending?.playedAt ?? null;
    if (!playedAt && cursor && pending?.hours != null && pending.minutes != null) {
      const minuteOfDay = pending.hours * 60 + pending.minutes;
      if (lastMinute != null && minuteOfDay < lastMinute) cursor = nextDay(cursor.year, cursor.month, cursor.day);
      lastMinute = minuteOfDay;
      playedAt = stamp(cursor.year, cursor.month, cursor.day, pending.hours, pending.minutes);
    } else if (playedAt) {
      const hm = playedAt.match(/T(\d{2}):(\d{2})/);
      if (hm) lastMinute = Number(hm[1]) * 60 + Number(hm[2]);
    }
    const remix = pending?.remix ?? "";
    const label = artist && title ? `${artist} - ${title}` : title || artist || path;
    draft.push({
      playedAt,
      artist,
      title: title || fromFile.title || path,
      originalText: remix ? `${label} (${remix})` : label,
      filePath: path || null,
    });
    pending = null;
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (/^#EXTVDJ\b/i.test(line)) {
      if (pending) pushPath("");
      const unix = num(xmlTag(line, "lastplaytime"));
      const when = clock(xmlTag(line, "time"));
      pending = {
        artist: xmlTag(line, "artist"),
        title: xmlTag(line, "title"),
        remix: xmlTag(line, "remix"),
        playedAt: unix != null ? localFromUnix(unix) : null,
        hours: when?.hours ?? null,
        minutes: when?.minutes ?? null,
      };
      continue;
    }
    if (/^#EXTINF:/i.test(line)) {
      const label = line.replace(/^#EXTINF:[^,]*,/, "").trim();
      const meta = splitArtistTitle(label);
      pending = {
        artist: pending?.artist || meta.artist,
        title: pending?.title || meta.title,
        remix: pending?.remix ?? "",
        playedAt: pending?.playedAt ?? null,
        hours: pending?.hours ?? null,
        minutes: pending?.minutes ?? null,
      };
      continue;
    }
    if (line.startsWith("#")) continue;
    pushPath(line);
  }
  if (pending) pushPath("");

  if (draft.length === 0) throw new ParseError("not-history");

  const firstStamp = draft.find((row) => row.playedAt)?.playedAt ?? null;
  const sessionDate = named
    ? `${named.year}-${pad(named.month)}-${pad(named.day)}`
    : (firstStamp?.slice(0, 10) ?? "1970-01-01");
  const session: RawSession = {
    id: `s_${hash(sourceFile)}`,
    sessionDate,
    startedAt: null,
    endedAt: null,
    sourceFile,
  };
  const plays: RawPlay[] = draft.map((row, position) => {
    const playedAt = row.playedAt ?? `${sessionDate}T00:00:00`;
    if (!session.startedAt || playedAt < session.startedAt) session.startedAt = playedAt;
    if (!session.endedAt || playedAt > session.endedAt) session.endedAt = playedAt;
    return {
      id: `p_${hash(`${session.id}:${position}:${row.filePath ?? row.originalText}`)}`,
      sessionId: session.id,
      position,
      playedAt,
      artist: row.artist,
      title: row.title,
      originalText: row.originalText,
      filePath: row.filePath,
    };
  });
  return { sessions: [session], plays };
}

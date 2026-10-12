import { CAMELOT_NAMES } from "@/lib/vdj/keys";
import { parseDatabaseXml, parseHistory } from "@/lib/vdj/parse";
import type { RawPlay, RawSession, RawTrack } from "@/lib/vdj/types";

const ARTISTS = [
  "Night Dock",
  "Solara",
  "Kite Museum",
  "Vera North",
  "Low Pressure",
  "Marrow",
  "Hotel Kids",
  "Pale Circuit",
  "Juniper Vale",
  "Static Garden",
  "Room Tone",
  "Cedar Line",
];

const TITLES = [
  "Glass Hour",
  "Second Dock",
  "Paper Lantern",
  "Slow Mercury",
  "North Service",
  "Soft Alarm",
  "Minor Weather",
  "Late Platform",
  "Ivory Engine",
  "Quiet Voltage",
  "Salt & Radio",
  "Open Window",
  "Third Shift",
  "Little Harbor",
  "Cold Chorus",
  "Faded Ticket",
  "Silver Routine",
  "Low Ceiling",
];

const GENRES = [
  "Deep House",
  "Tech House",
  "Progressive House",
  "Techno",
  "Disco",
  "Hip-Hop",
  "Pop",
  "Drum & Bass",
  "Dubstep",
  "Ambient",
];

function esc(value: string): string {
  const amp = "&" + "amp;";
  const quot = "&" + "quot;";
  const lt = "&" + "lt;";
  return value.split("&").join(amp).split('"').join(quot).split("<").join(lt);
}

function codes(): string[] {
  const list: string[] = [];
  for (let n = 1; n <= 12; n += 1) list.push(`${n}A`, `${n}B`);
  return list;
}

type Row = {
  artist: string;
  title: string;
  genre: string;
  key: string;
  bpm: number;
  plays: number;
  remix: string;
  year: number;
  duration: number;
};

function buildRows(): Row[] {
  const wheel = codes();
  const rows: Row[] = [];
  for (let i = 0; i < 36; i += 1) {
    const code = wheel[i % wheel.length];
    rows.push({
      artist: ARTISTS[i % ARTISTS.length],
      title: TITLES[i % TITLES.length],
      genre: GENRES[i % GENRES.length],
      key: i % 4 === 0 ? code : CAMELOT_NAMES[code].sharp,
      bpm: i % 7 === 0 ? 74 : 104 + (i % 9) * 4,
      plays: i % 6 === 0 ? 0 : 2 + (i % 11),
      remix: i % 9 === 0 ? "Club Mix" : "",
      year: 2016 + (i % 10),
      duration: 176 + (i * 13) % 210,
    });
  }
  return rows;
}

function buildXml(rows: Row[]): string {
  const base = Math.floor(Date.UTC(2026, 8, 28) / 1000);
  const songs = rows
    .map((row, index) => {
      const path = `C:\\Music\\${row.artist} - ${row.title}.mp3`;
      const period = (60 / row.bpm).toFixed(6);
      const first = base - (400 - index) * 86400;
      const last = base - index * 86400;
      return ` <Song FilePath="${esc(path)}" FileSize="${4_000_000 + index * 1000}">
  <Tags Author="${esc(row.artist)}" Title="${esc(row.title)}" Genre="${esc(row.genre)}" Remix="${esc(row.remix)}" Year="${row.year}"/>
  <Infos SongLength="${row.duration}" FirstPlay="${first}" LastPlay="${last}" PlayCount="${row.plays}" Bitrate="320"/>
  <Scan Version="801" Bpm="${period}" Key="${esc(row.key)}"/>
 </Song>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<VirtualDJ_Database Version="2024">\n${songs}\n</VirtualDJ_Database>\n`;
}

const DATES = ["2025-11-08", "2025-12-20", "2026-02-14", "2026-04-04", "2026-07-18", "2026-09-27"];

function buildHistory(rows: Row[]): string {
  return DATES.map((date, sessionIndex) => {
    const [year, month, day] = date.split("-");
    const lines = [`VirtualDJ History ${year}/${month}/${day}`, ""];
    let minutes = sessionIndex === 2 ? 23 * 60 + 40 : 22 * 60 + 5;
    for (let play = 0; play < 9; play += 1) {
      const guest = play === 8;
      const row = rows[(sessionIndex * 5 + play * 3) % rows.length];
      const label = guest ? `Guest - Unknown Cut ${sessionIndex + 1}` : `${row.artist} - ${row.title}`;
      const hour = Math.floor(minutes / 60) % 24;
      const minute = minutes % 60;
      lines.push(
        `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")} : ${label}`,
      );
      minutes += play % 2 === 0 ? 4 : 3;
    }
    lines.push("");
    return lines.join("\n");
  }).join("\n");
}

const ROWS = buildRows();

export const SAMPLE_LIBRARY_XML = `<?xml version="1.0" encoding="UTF-8"?>
<VirtualDJ_Database Version="2024">
 <Song FilePath="C:\\Music\\Night Dock - Glass Hour.mp3" FileSize="8400000">
  <Tags Author="Night Dock" Title="Glass Hour" Genre="Deep House" Year="2024"/>
  <Infos SongLength="372" FirstPlay="1710000000" LastPlay="1750000000" PlayCount="6" Bitrate="320"/>
  <Scan Version="801" Bpm="0.491803" Key="Am"/>
 </Song>
 <Song FilePath="C:\\Music\\Solara - Paper Lantern.mp3" FileSize="7900000">
  <Tags Author="Solara" Title="Paper Lantern" Genre="Pop" Year="2023"/>
  <Infos SongLength="214" PlayCount="2" Bitrate="256"/>
  <Scan Bpm="0.508475" Key="8B"/>
 </Song>
</VirtualDJ_Database>
`;

export const SAMPLE_HISTORY_TXT = `VirtualDJ History 2026/09/27

22:12 : Night Dock - Glass Hour
22:18 : Solara - Paper Lantern
22:23 : Guest - Unknown Cut
`;

function loadDemo(): { tracks: RawTrack[]; sessions: RawSession[]; plays: RawPlay[] } {
  const tracks = parseDatabaseXml(buildXml(ROWS));
  const history = parseHistory(buildHistory(ROWS), "demo-tracklist.txt");
  return { tracks, sessions: history.sessions, plays: history.plays };
}

export const DEMO = loadDemo();

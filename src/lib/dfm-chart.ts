import { createServerFn } from "@tanstack/react-start";

export type ChartSong = {
  artist: string;
  title: string;
  plays: number;
};

const SOURCE = "https://radiotut.com/radio/dfmru/top_songs/";

function decode(value: string): string {
  return value
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&/g, "&")
    .replace(/"/g, '"')
    .replace(/'/g, "'")
    .replace(/&#0*39;/g, "'")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

export function parseDfmChart(html: string): ChartSong[] {
  const songs: ChartSong[] = [];
  const pattern =
    /<span class="artist_name">\s*([\s\S]*?)\s*<\/span>[\s\S]*?<span class="song_name">\s*([\s\S]*?)\s*<\/span>[\s\S]*?<div class="count"[^>]*>\s*(\d+)\s*<\/div>/g;
  for (const match of html.matchAll(pattern)) {
    const artist = decode(match[1] ?? "");
    const title = decode(match[2] ?? "");
    const plays = Number(match[3]);
    if (!title || !Number.isFinite(plays)) continue;
    songs.push({ artist, title, plays });
  }
  return songs.slice(0, 100);
}

export const getDfmChart = createServerFn({ method: "GET" }).handler(async (): Promise<{ songs: ChartSong[]; offline: boolean }> => {
  try {
    const response = await fetch(SOURCE, {
      headers: { accept: "text/html", "user-agent": "VDJInspector" },
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) return { songs: [], offline: true };
    return { songs: parseDfmChart(await response.text()), offline: false };
  } catch {
    return { songs: [], offline: true };
  }
});

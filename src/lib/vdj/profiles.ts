import type { Columns, Tunables, Widgets } from "@/lib/vdj/types";

export const DEFAULT_COMPAT: Tunables["compat"] = {
  same: true,
  adjacent: true,
  relative: true,
  twoSteps: false,
  diagonal: false,
};

export const DEFAULT_TUNABLES: Tunables = {
  keySystem: "camelot",
  preferFlats: false,
  wheelAnchor: "clock",
  bpmMode: "auto",
  foldBpm: false,
  bpmFloor: 90,
  bpmCeil: 180,
  wheelMinPlays: 0,
  wheelRequireKey: true,
  matchMode: "artist-title",
  pageSize: 25,
  genreMap: "",
  compat: DEFAULT_COMPAT,
};

export const DEFAULT_COLUMNS: Columns = {
  genre: true,
  bpm: true,
  key: true,
  duration: true,
  plays: true,
  last: true,
};

export const DEFAULT_WIDGETS: Widgets = {
  monthly: true,
  artists: true,
  hourly: true,
  recent: true,
};

const CLUB_MAP = `House: Deep House, Tech House, Progressive House
Bass: Drum & Bass, Dubstep`;

const OPEN_MAP = `Floor: Deep House, Tech House, Progressive House, Techno, Disco
Open: Hip-Hop, Pop
Bass: Drum & Bass, Dubstep`;

export const BUILTIN_PROFILES: { id: string; name: { ru: string; en: string }; tunables: Tunables }[] = [
  { id: "studio", name: { ru: "Студия", en: "Studio" }, tunables: DEFAULT_TUNABLES },
  {
    id: "club",
    name: { ru: "Клуб", en: "Club" },
    tunables: {
      ...DEFAULT_TUNABLES,
      foldBpm: true,
      bpmFloor: 120,
      bpmCeil: 136,
      wheelMinPlays: 1,
      genreMap: CLUB_MAP,
      compat: { same: true, adjacent: true, relative: true, twoSteps: false, diagonal: false },
    },
  },
  {
    id: "open",
    name: { ru: "Открытый формат", en: "Open format" },
    tunables: {
      ...DEFAULT_TUNABLES,
      keySystem: "traditional",
      foldBpm: true,
      bpmFloor: 85,
      bpmCeil: 130,
      matchMode: "fuzzy",
      compat: { same: true, adjacent: true, relative: true, twoSteps: true, diagonal: true },
      genreMap: OPEN_MAP,
    },
  },
  {
    id: "broadcast",
    name: { ru: "Эфир", en: "Broadcast" },
    tunables: {
      ...DEFAULT_TUNABLES,
      wheelMinPlays: 3,
      pageSize: 50,
      compat: { same: true, adjacent: true, relative: false, twoSteps: false, diagonal: false },
    },
  },
];

function enumOf<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

function bool(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function num(value: unknown, fallback: number, min: number, max: number): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

export function clampTunables(input: unknown, base: Tunables = DEFAULT_TUNABLES): Tunables {
  const source = input && typeof input === "object" ? (input as Partial<Tunables>) : {};
  const compatIn: Partial<Tunables["compat"]> =
    source.compat && typeof source.compat === "object" ? source.compat : {};
  let bpmFloor = num(source.bpmFloor, base.bpmFloor, 60, 200);
  let bpmCeil = num(source.bpmCeil, base.bpmCeil, 70, 220);
  if (bpmFloor > bpmCeil) {
    const swap = bpmFloor;
    bpmFloor = bpmCeil;
    bpmCeil = swap;
  }
  const pageSize = num(source.pageSize, base.pageSize, 25, 100);
  return {
    keySystem: enumOf(source.keySystem, ["camelot", "open", "traditional"] as const, base.keySystem),
    preferFlats: bool(source.preferFlats, base.preferFlats),
    wheelAnchor: enumOf(source.wheelAnchor, ["clock", "one"] as const, base.wheelAnchor),
    bpmMode: enumOf(source.bpmMode, ["auto", "period", "direct"] as const, base.bpmMode),
    foldBpm: bool(source.foldBpm, base.foldBpm),
    bpmFloor,
    bpmCeil,
    wheelMinPlays: Math.round(num(source.wheelMinPlays, base.wheelMinPlays, 0, 500)),
    wheelRequireKey: bool(source.wheelRequireKey, base.wheelRequireKey),
    matchMode: enumOf(source.matchMode, ["artist-title", "title", "fuzzy"] as const, base.matchMode),
    pageSize: pageSize >= 100 ? 100 : pageSize >= 50 ? 50 : 25,
    genreMap: typeof source.genreMap === "string" ? source.genreMap.slice(0, 4000) : base.genreMap,
    compat: {
      same: bool(compatIn.same, base.compat.same),
      adjacent: bool(compatIn.adjacent, base.compat.adjacent),
      relative: bool(compatIn.relative, base.compat.relative),
      twoSteps: bool(compatIn.twoSteps, base.compat.twoSteps),
      diagonal: bool(compatIn.diagonal, base.compat.diagonal),
    },
  };
}

export type KeySystem = "camelot" | "open" | "traditional";
export type BpmMode = "auto" | "period" | "direct";
export type MatchMode = "artist-title" | "title" | "fuzzy";
export type WheelAnchor = "clock" | "one";
export type PageSize = 25 | 50 | 100;

export type Compat = {
  same: boolean;
  adjacent: boolean;
  relative: boolean;
  twoSteps: boolean;
  diagonal: boolean;
};

export type Tunables = {
  keySystem: KeySystem;
  preferFlats: boolean;
  wheelAnchor: WheelAnchor;
  bpmMode: BpmMode;
  foldBpm: boolean;
  bpmFloor: number;
  bpmCeil: number;
  wheelMinPlays: number;
  wheelRequireKey: boolean;
  matchMode: MatchMode;
  pageSize: PageSize;
  genreMap: string;
  compat: Compat;
};

export type Columns = {
  genre: boolean;
  bpm: boolean;
  key: boolean;
  duration: boolean;
  plays: boolean;
  last: boolean;
};

export type Widgets = {
  monthly: boolean;
  artists: boolean;
  hourly: boolean;
  recent: boolean;
};

export type RawTrack = {
  id: string;
  filePath: string;
  title: string;
  artist: string;
  remix: string | null;
  genre: string | null;
  year: number | null;
  bpmRaw: number | null;
  musicalKey: string | null;
  durationSeconds: number | null;
  bitrate: number | null;
  firstPlay: string | null;
  lastPlay: string | null;
  playCount: number;
};

export type RawSession = {
  id: string;
  sessionDate: string;
  startedAt: string | null;
  endedAt: string | null;
  sourceFile: string;
};

export type RawPlay = {
  id: string;
  sessionId: string;
  position: number;
  playedAt: string;
  artist: string;
  title: string;
  originalText: string;
  filePath?: string | null;
};

export type Snapshot = {
  v: 1;
  tracks: RawTrack[];
  sessions: RawSession[];
  plays: RawPlay[];
  libraryFile: string | null;
  historyFile: string | null;
  importedAt: string;
};

export type ViewTrack = RawTrack & {
  bpm: number | null;
  camelot: string | null;
  keyLabel: string;
  genreLabel: string;
  historyPlays: number;
  lastHistoryAt: string | null;
};

export type ViewPlay = RawPlay & {
  trackId: string | null;
  sessionDate: string;
  bpm: number | null;
  camelot: string | null;
  keyLabel: string;
  genreLabel: string;
};

export type ViewSession = RawSession & {
  trackCount: number;
  matched: number;
  artistCount: number;
  avgBpm: number | null;
  spanMinutes: number | null;
};

export type Relation = "same" | "adjacent" | "relative" | "two" | "diagonal";

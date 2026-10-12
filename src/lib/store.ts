import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEMO } from "@/lib/vdj/demo";
import { derive, type Derived } from "@/lib/vdj/derive";
import { deleteSnapshot, saveSnapshot } from "@/lib/vdj/idb";
import { BUILTIN_PROFILES, clampTunables, DEFAULT_COLUMNS, DEFAULT_TUNABLES, DEFAULT_WIDGETS } from "@/lib/vdj/profiles";
import type { Columns, RawPlay, RawSession, RawTrack, Snapshot, Tunables, Widgets } from "@/lib/vdj/types";

export type ProfileRef = { kind: "builtin"; id: string } | { kind: "user"; id: string } | { kind: "custom" };

export type UserProfile = { id: string; name: string; tunables: Tunables };

type SettingsData = {
  locale: "ru" | "en";
  tunables: Tunables;
  columns: Columns;
  widgets: Widgets;
  profiles: UserProfile[];
  profileRef: ProfileRef;
  crateName: string;
  crateIds: string[];
};

type SettingsState = SettingsData & {
  setLocale: (locale: "ru" | "en") => void;
  patchTunables: (partial: Partial<Tunables>) => void;
  applyTunables: (tunables: Tunables, ref: ProfileRef) => void;
  saveProfile: (name: string) => void;
  deleteProfile: (id: string) => void;
  toggleColumn: (key: keyof Columns) => void;
  toggleWidget: (key: keyof Widgets) => void;
  setPageSize: (pageSize: Tunables["pageSize"]) => void;
  toggleCrate: (id: string) => void;
  clearCrate: () => void;
  moveCrate: (id: string, direction: -1 | 1) => void;
  renameCrate: (name: string) => void;
};

const settingsData: SettingsData = {
  locale: "ru",
  tunables: DEFAULT_TUNABLES,
  columns: DEFAULT_COLUMNS,
  widgets: DEFAULT_WIDGETS,
  profiles: [],
  profileRef: { kind: "builtin", id: "studio" },
  crateName: "",
  crateIds: [],
};

export const useSettings = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...settingsData,
      setLocale: (locale) => set({ locale }),
      patchTunables: (partial) =>
        set({
          tunables: clampTunables({ ...get().tunables, ...partial, compat: { ...get().tunables.compat, ...partial.compat } }),
          profileRef: { kind: "custom" },
        }),
      applyTunables: (tunables, profileRef) => set({ tunables: clampTunables(tunables), profileRef }),
      saveProfile: (name) => {
        const trimmed = name.trim().slice(0, 40);
        if (!trimmed) return;
        const profile: UserProfile = { id: `u_${Date.now().toString(36)}`, name: trimmed, tunables: get().tunables };
        set({ profiles: [...get().profiles, profile], profileRef: { kind: "user", id: profile.id } });
      },
      deleteProfile: (id) => {
        const ref = get().profileRef;
        set({
          profiles: get().profiles.filter((profile) => profile.id !== id),
          profileRef: ref.kind === "user" && ref.id === id ? { kind: "custom" } : ref,
        });
      },
      toggleColumn: (key) => set({ columns: { ...get().columns, [key]: !get().columns[key] } }),
      toggleWidget: (key) => set({ widgets: { ...get().widgets, [key]: !get().widgets[key] } }),
      setPageSize: (pageSize) => set({ tunables: { ...get().tunables, pageSize }, profileRef: { kind: "custom" } }),
      toggleCrate: (id) => {
        const ids = get().crateIds;
        set({ crateIds: ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id].slice(0, 500) });
      },
      clearCrate: () => set({ crateIds: [] }),
      moveCrate: (id, direction) => {
        const ids = [...get().crateIds];
        const index = ids.indexOf(id);
        const next = index + direction;
        if (index < 0 || next < 0 || next >= ids.length) return;
        const [item] = ids.splice(index, 1);
        ids.splice(next, 0, item);
        set({ crateIds: ids });
      },
      renameCrate: (crateName) => set({ crateName: crateName.slice(0, 40) }),
    }),
    {
      name: "kabina-settings",
      skipHydration: true,
      version: 1,
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<SettingsData>;
        const profiles = Array.isArray(saved.profiles)
          ? saved.profiles
              .filter((profile) => profile && typeof profile.name === "string" && profile.tunables)
              .map((profile) => ({
                id: String(profile.id),
                name: profile.name.slice(0, 40),
                tunables: clampTunables(profile.tunables),
              }))
          : [];
        return {
          ...current,
          locale: saved.locale === "en" ? "en" : "ru",
          tunables: clampTunables(saved.tunables, current.tunables),
          columns: { ...current.columns, ...(saved.columns ?? {}) },
          widgets: { ...current.widgets, ...(saved.widgets ?? {}) },
          profiles,
          profileRef: readProfileRef(saved.profileRef),
          crateName: typeof saved.crateName === "string" ? saved.crateName.slice(0, 40) : "",
          crateIds: Array.isArray(saved.crateIds) ? saved.crateIds.filter((id) => typeof id === "string").slice(0, 500) : [],
        };
      },
    },
  ),
);

type LibraryState = {
  tracks: RawTrack[];
  sessions: RawSession[];
  plays: RawPlay[];
  origin: "demo" | "user";
  dirty: boolean;
  libraryFile: string | null;
  historyFile: string | null;
  importedAt: string | null;
  importNonce: number;
  hydrate: (snapshot: Snapshot) => void;
  commit: (next: {
    tracks: RawTrack[];
    sessions: RawSession[];
    plays: RawPlay[];
    libraryFile: string | null;
    historyFile: string | null;
  }) => void;
  resetDemo: () => void;
  clearForReload: () => void;
};

export const useLibrary = create<LibraryState>((set, get) => ({
  tracks: DEMO.tracks,
  sessions: DEMO.sessions,
  plays: DEMO.plays,
  origin: "demo",
  dirty: false,
  libraryFile: null,
  historyFile: null,
  importedAt: null,
  importNonce: 0,
  hydrate: (snapshot) => {
    if (get().dirty) return;
    set({
      tracks: snapshot.tracks,
      sessions: snapshot.sessions,
      plays: snapshot.plays,
      origin: "user",
      dirty: false,
      libraryFile: snapshot.libraryFile,
      historyFile: snapshot.historyFile,
      importedAt: snapshot.importedAt,
    });
  },
  commit: (next) => {
    const importedAt = new Date().toISOString();
    set({ ...next, origin: "user", dirty: true, importedAt });
    void saveSnapshot({ v: 1, ...next, importedAt }).catch(() => undefined);
  },
  resetDemo: () => {
    set({
      tracks: DEMO.tracks,
      sessions: DEMO.sessions,
      plays: DEMO.plays,
      origin: "demo",
      dirty: true,
      libraryFile: null,
      historyFile: null,
      importedAt: null,
    });
    void deleteSnapshot();
  },
  clearForReload: () => {
    set({
      tracks: [],
      sessions: [],
      plays: [],
      origin: "user",
      dirty: true,
      libraryFile: null,
      historyFile: null,
      importedAt: null,
      importNonce: get().importNonce + 1,
    });
    void deleteSnapshot();
  },
}));

export function useDerived(): Derived {
  const tracks = useLibrary((state) => state.tracks);
  const sessions = useLibrary((state) => state.sessions);
  const plays = useLibrary((state) => state.plays);
  const tunables = useSettings((state) => state.tunables);
  return derive(tracks, sessions, plays, tunables);
}

function readProfileRef(value: unknown): ProfileRef {
  if (!value || typeof value !== "object") return { kind: "builtin", id: "studio" };
  const ref = value as ProfileRef;
  if (ref.kind === "custom") return { kind: "custom" };
  if ((ref.kind === "builtin" || ref.kind === "user") && typeof ref.id === "string") return { kind: ref.kind, id: ref.id };
  return { kind: "builtin", id: "studio" };
}

export function profileLabel(ref: ProfileRef, profiles: UserProfile[], locale: "ru" | "en", custom: string): string {
  if (ref.kind === "custom") return custom;
  if (ref.kind === "builtin") {
    return BUILTIN_PROFILES.find((profile) => profile.id === ref.id)?.name[locale] ?? custom;
  }
  return profiles.find((profile) => profile.id === ref.id)?.name ?? custom;
}

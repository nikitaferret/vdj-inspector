import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Button, Field, Panel, SelectField, Toggle } from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { displayGenre, parseGenreMap } from "@/lib/vdj/derive";
import { useLibrary, useSettings } from "@/lib/store";
import type { Columns, Tunables, Widgets } from "@/lib/vdj/types";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { t, locale } = useI18n();
  const tunables = useSettings((state) => state.tunables);
  const columns = useSettings((state) => state.columns);
  const widgets = useSettings((state) => state.widgets);
  const patchTunables = useSettings((state) => state.patchTunables);
  const toggleColumn = useSettings((state) => state.toggleColumn);
  const toggleWidget = useSettings((state) => state.toggleWidget);
  const setLocale = useSettings((state) => state.setLocale);
  const origin = useLibrary((state) => state.origin);
  const libraryFile = useLibrary((state) => state.libraryFile);
  const historyFile = useLibrary((state) => state.historyFile);
  const clearForReload = useLibrary((state) => state.clearForReload);
  const tracks = useLibrary((state) => state.tracks);
  const [note, setNote] = useState("");

  const collapsed = useMemo(() => {
    const rules = parseGenreMap(tunables.genreMap);
    const map = new Map<string, number>();
    for (const track of tracks) {
      if (!track.genre) continue;
      const next = displayGenre(track.genre, rules);
      if (next === track.genre) continue;
      const key = `${track.genre} → ${next}`;
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return [...map.entries()];
  }, [tracks, tunables.genreMap]);

  const columnKeys: { key: keyof Columns; label: string }[] = [
    { key: "genre", label: t.colGenre },
    { key: "bpm", label: t.colBpm },
    { key: "key", label: t.colKey },
    { key: "duration", label: t.colTime },
    { key: "plays", label: t.colPlays },
    { key: "last", label: t.colLast },
  ];
  const widgetKeys: { key: keyof Widgets; label: string }[] = [{ key: "recent", label: t.recentSessions }];

  return (
    <div>
      <h1 className="mb-4 font-display text-2xl tracking-tight">{t.navSettings}</h1>
      {note ? <p className="mb-3 rounded-md bg-elevated px-3 py-2 text-xs">{note}</p> : null}
      <div className="grid gap-3">
        <Panel>
          <h2 className="mb-2 text-sm font-medium text-muted">{t.language}</h2>
          <div className="flex gap-2">
            <Button size="sm" variant={locale === "ru" ? "default" : "outline"} onClick={() => setLocale("ru")}>
              Русский
            </Button>
            <Button size="sm" variant={locale === "en" ? "default" : "outline"} onClick={() => setLocale("en")}>
              English
            </Button>
          </div>
        </Panel>

        <Panel>
          <h2 className="mb-3 text-sm font-medium text-muted">{t.sectionHarmony}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <label>
              <span className="mb-1 block text-xs text-muted">{t.keySystem}</span>
              <SelectField value={tunables.keySystem} onChange={(e) => patchTunables({ keySystem: e.target.value as Tunables["keySystem"] })}>
                <option value="camelot">{t.camelot}</option>
                <option value="open">{t.openKey}</option>
                <option value="traditional">{t.traditional}</option>
              </SelectField>
            </label>
            <label>
              <span className="mb-1 block text-xs text-muted">{t.anchor}</span>
              <SelectField value={tunables.wheelAnchor} onChange={(e) => patchTunables({ wheelAnchor: e.target.value as Tunables["wheelAnchor"] })}>
                <option value="clock">{t.anchorClock}</option>
                <option value="one">{t.anchorOne}</option>
              </SelectField>
            </label>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-1 text-xs sm:grid-cols-3">
            <Toggle checked={tunables.preferFlats} onChange={(preferFlats) => patchTunables({ preferFlats })} label={t.preferFlats} />
            <Toggle checked={tunables.compat.same} onChange={(same) => patchTunables({ compat: { ...tunables.compat, same } })} label={t.sameKey} />
            <Toggle checked={tunables.compat.adjacent} onChange={(adjacent) => patchTunables({ compat: { ...tunables.compat, adjacent } })} label={t.adjacentKey} />
            <Toggle checked={tunables.compat.relative} onChange={(relative) => patchTunables({ compat: { ...tunables.compat, relative } })} label={t.relativeKey} />
            <Toggle checked={tunables.compat.twoSteps} onChange={(twoSteps) => patchTunables({ compat: { ...tunables.compat, twoSteps } })} label={t.twoKey} />
            <Toggle checked={tunables.compat.diagonal} onChange={(diagonal) => patchTunables({ compat: { ...tunables.compat, diagonal } })} label={t.diagonalKey} />
          </div>
        </Panel>

        <Panel>
          <h2 className="mb-3 text-sm font-medium text-muted">{t.sectionBpm}</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <label>
              <span className="mb-1 block text-xs text-muted">Mode</span>
              <SelectField value={tunables.bpmMode} onChange={(e) => patchTunables({ bpmMode: e.target.value as Tunables["bpmMode"] })}>
                <option value="auto">{t.bpmAuto}</option>
                <option value="period">{t.bpmPeriod}</option>
                <option value="direct">{t.bpmDirect}</option>
              </SelectField>
            </label>
            <label>
              <span className="mb-1 block text-xs text-muted">{t.floor}</span>
              <Field inputMode="numeric" value={String(tunables.bpmFloor)} onChange={(e) => patchTunables({ bpmFloor: Number(e.target.value) })} />
            </label>
            <label>
              <span className="mb-1 block text-xs text-muted">{t.ceil}</span>
              <Field inputMode="numeric" value={String(tunables.bpmCeil)} onChange={(e) => patchTunables({ bpmCeil: Number(e.target.value) })} />
            </label>
          </div>
          <div className="mt-2">
            <Toggle checked={tunables.foldBpm} onChange={(foldBpm) => patchTunables({ foldBpm })} label={t.foldBpm} />
          </div>
        </Panel>

        <Panel>
          <h2 className="mb-3 text-sm font-medium text-muted">{t.sectionMatch}</h2>
          <SelectField value={tunables.matchMode} onChange={(e) => patchTunables({ matchMode: e.target.value as Tunables["matchMode"] })}>
            <option value="artist-title">{t.matchPair}</option>
            <option value="title">{t.matchTitle}</option>
            <option value="fuzzy">{t.matchFuzzy}</option>
          </SelectField>
        </Panel>

        <Panel>
          <h2 className="mb-3 text-sm font-medium text-muted">{t.sectionWheel}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <label>
              <span className="mb-1 block text-xs text-muted">{t.minPlays}</span>
              <Field inputMode="numeric" value={String(tunables.wheelMinPlays)} onChange={(e) => patchTunables({ wheelMinPlays: Number(e.target.value) })} />
            </label>
            <label>
              <span className="mb-1 block text-xs text-muted">{t.pageSize}</span>
              <SelectField value={String(tunables.pageSize)} onChange={(e) => patchTunables({ pageSize: Number(e.target.value) as Tunables["pageSize"] })}>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </SelectField>
            </label>
          </div>
          <div className="mt-2">
            <Toggle checked={tunables.wheelRequireKey} onChange={(wheelRequireKey) => patchTunables({ wheelRequireKey })} label={t.requireKey} />
          </div>
        </Panel>

        <Panel>
          <h2 className="mb-2 text-sm font-medium text-muted">{t.sectionDash}</h2>
          {widgetKeys.map((item) => (
            <Toggle key={item.key} checked={widgets[item.key]} onChange={() => toggleWidget(item.key)} label={item.label} />
          ))}
        </Panel>

        <Panel>
          <h2 className="mb-2 text-sm font-medium text-muted">{t.sectionColumns}</h2>
          <div className="grid grid-cols-2 gap-1 text-xs sm:grid-cols-3">
            {columnKeys.map((item) => (
              <Toggle key={item.key} checked={columns[item.key]} onChange={() => toggleColumn(item.key)} label={item.label} />
            ))}
          </div>
        </Panel>

        <Panel>
          <h2 className="mb-2 text-sm font-medium text-muted">{t.sectionGenre}</h2>
          <textarea
            className="min-h-28 w-full rounded-md border border-white/15 bg-subtle p-2 font-mono text-xs"
            value={tunables.genreMap}
            onChange={(event) => patchTunables({ genreMap: event.target.value })}
          />
          {collapsed.length > 0 ? (
            <ul className="mt-2 space-y-0.5 text-xs text-muted">
              {collapsed.map(([label, count]) => (
                <li key={label}>
                  {label} · {count}
                </li>
              ))}
            </ul>
          ) : null}
        </Panel>

        <Panel>
          <h2 className="mb-2 text-sm font-medium text-muted">{t.sectionData}</h2>
          {origin === "user" ? (
            <p className="mb-2 text-xs text-muted">
              {libraryFile || "—"} · {historyFile || "—"}
            </p>
          ) : null}
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              clearForReload();
              setNote(t.resetReload);
            }}
          >
            {t.resetReload}
          </Button>
        </Panel>
      </div>
    </div>
  );
}

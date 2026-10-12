import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Button, Field, PageIntro, Panel, Toggle } from "@/components/ui";
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
      <PageIntro title={t.navSettings} lead={t.settingsLead} />
      <p className="mb-4 text-sm text-muted">{t.offlineHint}</p>
      {note ? <p className="mb-4 rounded-lg bg-elevated px-4 py-3 text-sm">{note}</p> : null}
      <div className="grid gap-3">
        <Panel>
          <h2 className="text-sm font-medium text-muted">{t.language}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant={locale === "ru" ? "primary" : "ghost"} onClick={() => setLocale("ru")}>
              Русский
            </Button>
            <Button variant={locale === "en" ? "primary" : "ghost"} onClick={() => setLocale("en")}>
              English
            </Button>
          </div>
        </Panel>

        <Panel>
          <h2 className="text-sm font-medium text-muted">{t.sectionHarmony}</h2>
          <fieldset className="mt-2">
            <legend className="text-sm">{t.keySystem}</legend>
            <Choice name="key" checked={tunables.keySystem === "camelot"} label={t.camelot} onChange={() => patchTunables({ keySystem: "camelot" })} />
            <Choice name="key" checked={tunables.keySystem === "open"} label={t.openKey} onChange={() => patchTunables({ keySystem: "open" })} />
            <Choice name="key" checked={tunables.keySystem === "traditional"} label={t.traditional} onChange={() => patchTunables({ keySystem: "traditional" })} />
            <Toggle checked={tunables.preferFlats} onChange={(preferFlats) => patchTunables({ preferFlats })} label={t.preferFlats} />
          </fieldset>
          <fieldset className="mt-2">
            <legend className="text-sm">{t.anchor}</legend>
            <Choice name="anchor" checked={tunables.wheelAnchor === "clock"} label={t.anchorClock} onChange={() => patchTunables({ wheelAnchor: "clock" })} />
            <Choice name="anchor" checked={tunables.wheelAnchor === "one"} label={t.anchorOne} onChange={() => patchTunables({ wheelAnchor: "one" })} />
          </fieldset>
          <div className="mt-2">
            <Toggle checked={tunables.compat.same} onChange={(same) => patchTunables({ compat: { ...tunables.compat, same } })} label={t.sameKey} />
            <Toggle checked={tunables.compat.adjacent} onChange={(adjacent) => patchTunables({ compat: { ...tunables.compat, adjacent } })} label={t.adjacentKey} />
            <Toggle checked={tunables.compat.relative} onChange={(relative) => patchTunables({ compat: { ...tunables.compat, relative } })} label={t.relativeKey} />
            <Toggle checked={tunables.compat.twoSteps} onChange={(twoSteps) => patchTunables({ compat: { ...tunables.compat, twoSteps } })} label={t.twoKey} />
            <Toggle checked={tunables.compat.diagonal} onChange={(diagonal) => patchTunables({ compat: { ...tunables.compat, diagonal } })} label={t.diagonalKey} />
          </div>
        </Panel>

        <Panel>
          <h2 className="text-sm font-medium text-muted">{t.sectionBpm}</h2>
          <p className="mt-2 text-sm text-muted">{t.bpmHelp}</p>
          <Choice name="bpm" checked={tunables.bpmMode === "auto"} label={t.bpmAuto} onChange={() => patchTunables({ bpmMode: "auto" })} />
          <Choice name="bpm" checked={tunables.bpmMode === "period"} label={t.bpmPeriod} onChange={() => patchTunables({ bpmMode: "period" })} />
          <Choice name="bpm" checked={tunables.bpmMode === "direct"} label={t.bpmDirect} onChange={() => patchTunables({ bpmMode: "direct" })} />
          <Toggle checked={tunables.foldBpm} onChange={(foldBpm) => patchTunables({ foldBpm })} label={t.foldBpm} />
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label>
              <span className="mb-1 block text-sm text-muted">{t.floor}</span>
              <Field
                inputMode="numeric"
                value={String(tunables.bpmFloor)}
                onChange={(event) => patchTunables({ bpmFloor: Number(event.target.value) })}
              />
            </label>
            <label>
              <span className="mb-1 block text-sm text-muted">{t.ceil}</span>
              <Field
                inputMode="numeric"
                value={String(tunables.bpmCeil)}
                onChange={(event) => patchTunables({ bpmCeil: Number(event.target.value) })}
              />
            </label>
          </div>
        </Panel>

        <Panel>
          <h2 className="text-sm font-medium text-muted">{t.sectionMatch}</h2>
          <Choice name="match" checked={tunables.matchMode === "artist-title"} label={t.matchPair} onChange={() => patchTunables({ matchMode: "artist-title" })} />
          <Choice name="match" checked={tunables.matchMode === "title"} label={t.matchTitle} onChange={() => patchTunables({ matchMode: "title" })} />
          <Choice name="match" checked={tunables.matchMode === "fuzzy"} label={t.matchFuzzy} onChange={() => patchTunables({ matchMode: "fuzzy" })} />
        </Panel>

        <Panel>
          <h2 className="text-sm font-medium text-muted">{t.sectionWheel}</h2>
          <label className="mt-3 block">
            <span className="mb-1 block text-sm text-muted">{t.minPlays}</span>
            <Field
              inputMode="numeric"
              value={String(tunables.wheelMinPlays)}
              onChange={(event) => patchTunables({ wheelMinPlays: Number(event.target.value) })}
            />
          </label>
          <Toggle checked={tunables.wheelRequireKey} onChange={(wheelRequireKey) => patchTunables({ wheelRequireKey })} label={t.requireKey} />
          <label className="mt-3 block">
            <span className="mb-1 block text-sm text-muted">{t.pageSize}</span>
            <select
              className="h-11 w-full rounded-sm border border-line bg-subtle px-3 text-sm"
              value={tunables.pageSize}
              onChange={(event) => patchTunables({ pageSize: Number(event.target.value) as Tunables["pageSize"] })}
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </label>
        </Panel>

        <Panel>
          <h2 className="text-sm font-medium text-muted">{t.sectionDash}</h2>
          {widgetKeys.map((item) => (
            <Toggle key={item.key} checked={widgets[item.key]} onChange={() => toggleWidget(item.key)} label={item.label} />
          ))}
        </Panel>

        <Panel>
          <h2 className="text-sm font-medium text-muted">{t.sectionColumns}</h2>
          {columnKeys.map((item) => (
            <Toggle key={item.key} checked={columns[item.key]} onChange={() => toggleColumn(item.key)} label={item.label} />
          ))}
        </Panel>

        <Panel>
          <h2 className="text-sm font-medium text-muted">{t.sectionGenre}</h2>
          <p className="mt-2 text-sm text-muted">{t.genreHelp}</p>
          <textarea
            className="mt-3 min-h-36 w-full rounded-sm border border-line bg-subtle p-3 font-mono text-sm"
            value={tunables.genreMap}
            onChange={(event) => patchTunables({ genreMap: event.target.value })}
          />
          <p className="mt-3 text-sm text-muted">{t.genrePreview}</p>
          {collapsed.length === 0 ? <p className="mt-2 text-sm text-faint">{t.genreNone}</p> : null}
          <ul className="mt-2 space-y-1 text-sm">
            {collapsed.map(([label, count]) => (
              <li key={label}>
                {label} · {count}
              </li>
            ))}
          </ul>
        </Panel>

        <Panel>
          <h2 className="text-sm font-medium text-muted">{t.sectionData}</h2>
          <p className="mt-2 text-sm text-muted">{t.resetHelp}</p>
          <p className="mt-2 text-sm text-muted">{t.writeBack}</p>
          {origin === "user" ? (
            <p className="mt-2 text-sm">
              {libraryFile || "—"} · {historyFile || "—"}
            </p>
          ) : null}
          <div className="mt-4">
            <Button
              variant="primary"
              onClick={() => {
                clearForReload();
                setNote(t.resetReload);
              }}
            >
              {t.resetReload}
            </Button>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Choice({
  name,
  checked,
  label,
  onChange,
}: {
  name: string;
  checked: boolean;
  label: string;
  onChange: () => void;
}) {
  return (
    <label className="flex min-h-11 items-center gap-3 text-sm">
      <input type="radio" name={name} checked={checked} onChange={onChange} />
      <span>{label}</span>
    </label>
  );
}

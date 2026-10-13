import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { HarmonicWheel } from "@/components/wheel";
import { Button, Field, RelationText } from "@/components/ui";
import { formatBpm } from "@/lib/format";
import { relationLabel, useI18n } from "@/lib/i18n";
import { compatibleKeys } from "@/lib/vdj/keys";
import { useDerived, useSettings } from "@/lib/store";

const REL_RANK: Record<string, number> = {
  same: 0,
  adjacent: 1,
  relative: 2,
  two: 3,
  diagonal: 4,
  jump: 5,
};

export const Route = createFileRoute("/wheel")({
  component: WheelPage,
});

function WheelPage() {
  const { t } = useI18n();
  const data = useDerived();
  const tunables = useSettings((state) => state.tunables);
  const crateIds = useSettings((state) => state.crateIds);
  const toggleCrate = useSettings((state) => state.toggleCrate);
  const [selected, setSelected] = useState<string | null>(null);
  const [anchorId, setAnchorId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const anchor = data.tracks.find((track) => track.id === anchorId) ?? null;

  const relations = useMemo(() => {
    if (!selected) return new Map<string, string>();
    return new Map(compatibleKeys(selected, tunables.compat).map((item) => [item.code, item.rel]));
  }, [selected, tunables.compat]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.tracks
      .filter((track) => {
        if (anchor && track.id === anchor.id) return false;
        if (tunables.wheelRequireKey && !track.camelot) return false;
        if (track.playCount < tunables.wheelMinPlays) return false;
        if (selected && (!track.camelot || !relations.has(track.camelot))) return false;
        if (!q) return true;
        return `${track.artist} ${track.title}`.toLowerCase().includes(q);
      })
      .sort((a, b) => compareNext(a, b, selected, relations, anchor));
  }, [anchor, data.tracks, query, relations, selected, tunables.wheelMinPlays, tunables.wheelRequireKey]);

  return (
    <div>
      <h1 className="mb-4 font-display text-2xl tracking-tight">{t.navWheel}</h1>
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,28rem)_1fr]">
        <div className="rounded-lg border border-white/10 bg-elevated p-4">
          <HarmonicWheel
            counts={data.keyCounts}
            selected={selected}
            anchor={tunables.wheelAnchor}
            keySystem={tunables.keySystem}
            preferFlats={tunables.preferFlats}
            compat={tunables.compat}
            onSelect={(code) => {
              setAnchorId(null);
              setSelected((current) => (current === code ? current : code));
            }}
          />
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-2 text-xs">
            <RelationText rel="same">{t.relSame}</RelationText>
            <RelationText rel="adjacent">{t.relAdjacent}</RelationText>
            <RelationText rel="relative">{t.relRelative}</RelationText>
            <RelationText rel="two">{t.relTwo}</RelationText>
            <RelationText rel="diagonal">{t.relDiagonal}</RelationText>
            <RelationText rel="jump">{t.relJump}</RelationText>
          </div>
          {selected ? (
            <Button
              className="mt-3"
              size="sm"
              onClick={() => {
                setSelected(null);
                setAnchorId(null);
              }}
            >
              {t.clearKey}
            </Button>
          ) : null}
        </div>
        <div>
          <Field value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.wheelSearch} />
          {anchor ? (
            <p className="mt-3 text-sm">
              <span className="text-muted">{t.wheelNext}: </span>
              {anchor.artist ? `${anchor.artist} — ` : ""}
              {anchor.title}
              <span className="text-muted">
                {" "}
                · {formatBpm(anchor.bpm)} · {anchor.keyLabel}
                {anchor.genreLabel ? ` · ${anchor.genreLabel}` : ""}
              </span>
            </p>
          ) : null}
          {rows.length === 0 ? <p className="mt-4 text-sm text-muted">{selected ? t.wheelEmpty : t.wheelHint}</p> : null}
          <ul className="mt-3 space-y-2">
            {rows.slice(0, 80).map((track) => (
              <li key={track.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-elevated p-3">
                <button
                  type="button"
                  className="min-w-0 flex-1 text-left"
                  onClick={() => {
                    if (!track.camelot) return;
                    setSelected(track.camelot);
                    setAnchorId(track.id);
                  }}
                >
                  <p className="truncate font-medium">{track.title}</p>
                  <p className="truncate text-sm text-muted">
                    {track.artist || "—"} · {formatBpm(track.bpm)} · {track.keyLabel}
                    {track.genreLabel ? ` · ${track.genreLabel}` : ""}
                  </p>
                  {track.camelot && relations.get(track.camelot) ? (
                    <p className="mt-1">
                      <RelationText rel={relations.get(track.camelot) ?? null}>
                        {relationLabel(t, relations.get(track.camelot) ?? null)}
                      </RelationText>
                    </p>
                  ) : null}
                </button>
                <Button size="sm" variant="outline" onClick={() => toggleCrate(track.id)}>
                  {crateIds.includes(track.id) ? t.inCrate : t.addCrate}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function compareNext(
  a: { camelot: string | null; bpm: number | null; genreLabel: string; title: string },
  b: { camelot: string | null; bpm: number | null; genreLabel: string; title: string },
  selected: string | null,
  relations: Map<string, string>,
  anchor: { bpm: number | null; genreLabel: string } | null,
): number {
  const rank = (camelot: string | null) => {
    if (!selected || !camelot) return 6;
    return REL_RANK[relations.get(camelot) ?? "jump"] ?? 6;
  };
  const byKey = rank(a.camelot) - rank(b.camelot);
  if (byKey) return byKey;
  const target = anchor?.bpm;
  const bpmDistance = (bpm: number | null) => (bpm == null ? 10_000 : target == null ? bpm : Math.abs(bpm - target));
  const byBpm = bpmDistance(a.bpm) - bpmDistance(b.bpm);
  if (byBpm) return byBpm;
  const genre = anchor?.genreLabel ?? "";
  if (genre) {
    const byGenre = Number(b.genreLabel === genre) - Number(a.genreLabel === genre);
    if (byGenre) return byGenre;
  }
  return a.genreLabel.localeCompare(b.genreLabel) || a.title.localeCompare(b.title);
}

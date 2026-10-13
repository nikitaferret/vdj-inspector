import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Check } from "lucide-react";
import { HarmonicWheel } from "@/components/wheel";
import { Button, Field, Panel, RelationText, cn } from "@/components/ui";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatBpm } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
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

function relColor(rel: string | null | undefined): string {
  if (rel === "same") return "text-rel-same";
  if (rel === "adjacent") return "text-rel-adjacent";
  if (rel === "relative") return "text-rel-relative";
  if (rel === "two" || rel === "diagonal") return "text-rel-mid";
  if (rel === "jump") return "text-rel-jump";
  return "text-muted";
}

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
      <div className="flex flex-col items-start gap-4 lg:flex-row lg:items-stretch">
        <div className="sticky top-16 shrink-0 self-start rounded-lg border border-white/10 bg-elevated p-4">
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
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5 text-xs">
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
        <Panel className="min-w-0 flex-1 overflow-hidden">
          <Field value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.wheelSearch} className="mb-3" />
          {anchor ? (
            <p className="mb-3 truncate text-sm">
              <span className="text-muted">{t.wheelNext}: </span>
              {anchor.artist ? <span className="text-muted">{anchor.artist} — </span> : null}
              {anchor.title}
              <span className="text-muted">
                {" "}· {formatBpm(anchor.bpm)} · {anchor.keyLabel}
                {anchor.genreLabel ? ` · ${anchor.genreLabel}` : ""}
              </span>
            </p>
          ) : null}
          {rows.length === 0 ? <p className="text-sm text-muted">{selected ? t.wheelEmpty : t.wheelHint}</p> : null}
          <ScrollArea className="h-[min(70vh,36rem)]">
            <ul className="space-y-0.5">
              {rows.slice(0, 80).map((track) => {
                const rel = track.camelot ? relations.get(track.camelot) ?? null : null;
                const inCrate = crateIds.includes(track.id);
                const label = track.artist ? `${track.artist} — ${track.title}` : track.title;
                return (
                  <li key={track.id} className="min-w-0">
                    <div className="flex min-w-0 items-center gap-3 rounded-md px-2 py-1.5 hover:bg-subtle">
                      <button
                        type="button"
                        className="min-w-0 flex-1 overflow-hidden text-left"
                        onClick={() => {
                          if (!track.camelot) return;
                          setSelected(track.camelot);
                          setAnchorId(track.id);
                        }}
                      >
                        <span className="block truncate text-sm" title={label}>
                          {track.artist ? <span className="text-muted">{track.artist} — </span> : null}
                          {track.title}
                        </span>
                        <span className="block truncate text-xs text-muted">
                          {formatBpm(track.bpm)}
                          {" · "}
                          <span className={cn("font-medium", relColor(rel))}>{track.keyLabel}</span>
                          {track.genreLabel ? ` · ${track.genreLabel}` : ""}
                        </span>
                      </button>
                      <button
                        type="button"
                        aria-label={inCrate ? t.inCrate : t.addCrate}
                        className={cn(
                          "flex size-7 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                          inCrate
                            ? "border-[#c8f500] bg-[#c8f500] text-[#0b0f00]"
                            : "border-[#c8f500]/70 text-[#c8f500] hover:border-[#c8f500] hover:bg-[#c8f500]/10",
                        )}
                        onClick={() => toggleCrate(track.id)}
                      >
                        {inCrate ? <Check className="size-3.5" /> : <Plus className="size-3.5" />}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        </Panel>
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

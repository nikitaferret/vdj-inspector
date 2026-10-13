import { useEffect, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Button, Field, PageIntro } from "@/components/ui";
import { downloadText, formatBpm, toM3u } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { useDerived, useSettings } from "@/lib/store";

export const Route = createFileRoute("/crate")({
  component: CratePage,
});

function CratePage() {
  const { t } = useI18n();
  const data = useDerived();
  const crateIds = useSettings((state) => state.crateIds);
  const crateName = useSettings((state) => state.crateName);
  const renameCrate = useSettings((state) => state.renameCrate);
  const clearCrate = useSettings((state) => state.clearCrate);
  const moveCrate = useSettings((state) => state.moveCrate);
  const toggleCrate = useSettings((state) => state.toggleCrate);
  const [name, setName] = useState(crateName);
  useEffect(() => {
    setName(crateName);
  }, [crateName]);
  const byId = new Map(data.tracks.map((track) => [track.id, track]));
  const rows = crateIds.flatMap((id) => {
    const track = byId.get(id);
    return track ? [track] : [];
  });
  const title = crateName.trim() || t.crateDefault;

  function exportTxt() {
    const lines = rows.map((track) => `${track.artist} - ${track.title} | ${formatBpm(track.bpm)} | ${track.keyLabel}`);
    downloadText(`${title}.txt`, lines.join("\n"));
  }

  function exportM3u() {
    downloadText(
      `${title}.m3u`,
      toM3u(
        rows.map((track) => ({
          artist: track.artist,
          title: track.title,
          seconds: track.durationSeconds,
          filePath: track.filePath,
        })),
      ),
      "audio/x-mpegurl",
    );
  }

  return (
    <div>
      <h1 className="mb-4 font-display text-2xl tracking-tight">{t.navCrate}</h1>
      <p className="mb-4 max-w-3xl text-sm text-muted">{t.crateExplain}</p>
      <form
        className="mb-4 flex flex-col gap-3 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          renameCrate(name);
        }}
      >
        <label className="min-w-0 flex-1">
          <span className="mb-1 block text-sm text-muted">{t.navCrate}</span>
          <Field value={name} onChange={(event) => setName(event.target.value)} placeholder={t.crateDefault} />
        </label>
        <div className="flex items-end">
          <Button type="submit">{t.saveProfile}</Button>
        </div>
      </form>
      <div className="mb-4 flex flex-wrap gap-2">
        <Button onClick={exportTxt} disabled={rows.length === 0}>
          {t.exportTxt}
        </Button>
        <Button onClick={exportM3u} disabled={rows.length === 0}>
          {t.exportM3u}
        </Button>
        <Button onClick={clearCrate} disabled={crateIds.length === 0}>
          {t.clearCrate}
        </Button>
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-muted">
          {crateIds.length > 0 ? t.crateMissing : t.crateEmpty}{" "}
          <Link to="/library" className="text-fg underline-offset-4 hover:underline">
            {t.browseLibrary}
          </Link>
        </p>
      ) : (
        <ol className="space-y-2">
          {rows.map((track, index) => (
            <li key={track.id} className="rounded-lg bg-elevated p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs tabular-nums text-faint">{index + 1}</p>
                  <p className="truncate font-medium">{track.title}</p>
                  <p className="truncate text-sm text-muted">
                    {track.artist || "—"} · {formatBpm(track.bpm)} · {track.keyLabel}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => moveCrate(track.id, -1)} disabled={index === 0}>
                    {t.moveUp}
                  </Button>
                  <Button onClick={() => moveCrate(track.id, 1)} disabled={index === rows.length - 1}>
                    {t.moveDown}
                  </Button>
                  <Button onClick={() => toggleCrate(track.id)}>{t.remove}</Button>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

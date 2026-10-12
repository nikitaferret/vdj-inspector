import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { formatBpm, formatDuration, formatStamp, toCsv, downloadText } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { useDerived, useSettings } from "@/lib/store";
import type { ViewTrack } from "@/lib/vdj/types";
import { Button, Field, PageIntro, Pager, SelectField } from "@/components/ui";

export const Route = createFileRoute("/library")({
  validateSearch: (search: Record<string, unknown>): { played?: 1 } =>
    search.played === "1" || search.played === 1 ? { played: 1 } : {},
  component: LibraryPage,
});

type SortKey = "artist" | "title" | "genre" | "bpm" | "key" | "plays" | "last";

function LibraryPage() {
  const { t, locale } = useI18n();
  const data = useDerived();
  const columns = useSettings((state) => state.columns);
  const pageSize = useSettings((state) => state.tunables.pageSize);
  const crateIds = useSettings((state) => state.crateIds);
  const toggleCrate = useSettings((state) => state.toggleCrate);
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("");
  const [key, setKey] = useState("");
  const [bpmFrom, setBpmFrom] = useState("");
  const [bpmTo, setBpmTo] = useState("");
  const { played } = Route.useSearch();
  const [playedOnly, setPlayedOnly] = useState(played === 1);
  const [sortKey, setSortKey] = useState<SortKey>("artist");
  const [sortDir, setSortDir] = useState<1 | -1>(1);
  const [page, setPage] = useState(0);

  useEffect(() => {
    setPage(0);
  }, [query, genre, key, bpmFrom, bpmTo, playedOnly, pageSize]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const min = bpmFrom === "" ? null : Number(bpmFrom);
    const max = bpmTo === "" ? null : Number(bpmTo);
    const activeKey = data.keys.includes(key) ? key : "";
    const filtered = data.tracks.filter((track) => {
      if (q) {
        const blob = `${track.artist} ${track.title} ${track.remix ?? ""} ${track.filePath} ${track.genreLabel} ${track.keyLabel} ${track.musicalKey ?? ""}`.toLowerCase();
        if (!blob.includes(q)) return false;
      }
      if (genre && track.genreLabel !== genre) return false;
      if (activeKey && track.keyLabel !== activeKey) return false;
      if (playedOnly && track.playCount <= 0) return false;
      if (min != null && Number.isFinite(min) && (track.bpm == null || track.bpm < min)) return false;
      if (max != null && Number.isFinite(max) && (track.bpm == null || track.bpm > max)) return false;
      return true;
    });
    const value = (track: ViewTrack) => {
      if (sortKey === "artist") return track.artist.toLowerCase();
      if (sortKey === "title") return track.title.toLowerCase();
      if (sortKey === "genre") return track.genreLabel.toLowerCase();
      if (sortKey === "key") return track.keyLabel;
      if (sortKey === "bpm") return track.bpm ?? -1;
      if (sortKey === "plays") return track.playCount;
      return track.lastHistoryAt ?? track.lastPlay ?? "";
    };
    return filtered.sort((a, b) => {
      const left = value(a);
      const right = value(b);
      if (left < right) return -1 * sortDir;
      if (left > right) return 1 * sortDir;
      return a.title.localeCompare(b.title);
    });
  }, [bpmFrom, bpmTo, data.keys, data.tracks, genre, key, playedOnly, query, sortDir, sortKey]);

  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(page, pages - 1);
  const visible = rows.slice(safePage * pageSize, safePage * pageSize + pageSize);

  function sortBy(next: SortKey) {
    if (sortKey === next) setSortDir((dir) => (dir === 1 ? -1 : 1));
    else {
      setSortKey(next);
      setSortDir(next === "plays" || next === "last" ? -1 : 1);
    }
  }

  function exportCsv() {
    const header = [t.colArtist, t.colTitle, t.colGenre, t.colBpm, t.colKey, t.colTime, t.colPlays, t.colLast];
    const body = rows.map((track) => [
      track.artist,
      track.remix ? `${track.title} (${track.remix})` : track.title,
      track.genreLabel,
      formatBpm(track.bpm),
      track.camelot ? track.keyLabel : (track.musicalKey ?? ""),
      formatDuration(track.durationSeconds),
      String(track.playCount),
      formatStamp(track.lastHistoryAt ?? track.lastPlay, locale),
    ]);
    downloadText("vdj-inspector-library.csv", toCsv([header, ...body]), "text/csv");
  }

  return (
    <div>
      <PageIntro title={t.navLibrary} lead={t.libraryLead} />
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <label className="md:col-span-2">
          <span className="mb-1 block text-sm text-muted">{t.search}</span>
          <Field value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
        <label>
          <span className="mb-1 block text-sm text-muted">{t.genre}</span>
          <SelectField value={genre} onChange={(event) => setGenre(event.target.value)}>
            <option value="">{t.anyGenre}</option>
            {data.genres.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </SelectField>
        </label>
        <label>
          <span className="mb-1 block text-sm text-muted">{t.key}</span>
          <SelectField value={data.keys.includes(key) ? key : ""} onChange={(event) => setKey(event.target.value)}>
            <option value="">{t.anyKey}</option>
            {data.keys.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </SelectField>
        </label>
        <label>
          <span className="mb-1 block text-sm text-muted">{t.bpmFrom}</span>
          <Field inputMode="decimal" value={bpmFrom} onChange={(event) => setBpmFrom(event.target.value)} />
        </label>
        <label>
          <span className="mb-1 block text-sm text-muted">{t.bpmTo}</span>
          <Field inputMode="decimal" value={bpmTo} onChange={(event) => setBpmTo(event.target.value)} />
        </label>
        <label className="flex min-h-11 items-end gap-3 pb-2 text-sm">
          <input type="checkbox" checked={playedOnly} onChange={(event) => setPlayedOnly(event.target.checked)} />
          {t.playedOnly}
        </label>
        <div className="flex items-end">
          <Button onClick={exportCsv}>{t.exportCsv}</Button>
        </div>
      </div>
      <p className="mt-4 text-sm text-muted">
        {t.results}: {visible.length === 0 ? 0 : safePage * pageSize + 1}–{safePage * pageSize + visible.length} / {rows.length}
      </p>
      {visible.length === 0 ? <p className="mt-6 text-sm text-muted">{t.noTracks}</p> : null}
      <ul className="mt-3 hidden space-y-3">
        {visible.map((track) => (
          <li key={track.id} className="rounded-lg bg-elevated p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium">{track.remix ? `${track.title} (${track.remix})` : track.title}</p>
                <p className="truncate text-sm text-muted">{track.artist || "—"}</p>
              </div>
              <Button onClick={() => toggleCrate(track.id)}>{crateIds.includes(track.id) ? t.inCrate : t.addCrate}</Button>
            </div>
            <p className="mt-3 text-sm text-muted">
              {[
                columns.genre ? track.genreLabel : "",
                columns.bpm ? formatBpm(track.bpm) : "",
                columns.key ? (track.camelot ? track.keyLabel : track.musicalKey || "—") : "",
                columns.duration ? formatDuration(track.durationSeconds) : "",
                columns.plays ? String(track.playCount) : "",
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </li>
        ))}
      </ul>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[720px] border-separate border-spacing-0 text-left text-sm">
          <thead className="sticky top-0 bg-bg">
            <tr className="text-muted">
              <Th onClick={() => sortBy("artist")} title={t.tipSort}>{t.colArtist}</Th>
              <Th onClick={() => sortBy("title")} title={t.tipSort}>{t.colTitle}</Th>
              {columns.genre ? <Th onClick={() => sortBy("genre")} title={t.tipSort}>{t.colGenre}</Th> : null}
              {columns.bpm ? <Th onClick={() => sortBy("bpm")} title={t.tipSort}>{t.colBpm}</Th> : null}
              {columns.key ? <Th onClick={() => sortBy("key")} title={t.tipSort}>{t.colKey}</Th> : null}
              {columns.duration ? <th className="px-2 py-2 font-medium">{t.colTime}</th> : null}
              {columns.plays ? (
                <Th onClick={() => sortBy("plays")} title={t.tipSort}>
                  {t.colPlays}
                </Th>
              ) : null}
              {columns.last ? <Th onClick={() => sortBy("last")} title={t.tipSort}>{t.colLast}</Th> : null}
              <th className="px-2 py-2 font-medium" />
            </tr>
          </thead>
          <tbody>
            {visible.map((track) => (
              <tr key={track.id} className="border-t border-line">
                <td className="max-w-40 truncate border-t border-line px-2 py-3">{track.artist || "—"}</td>
                <td className="max-w-56 truncate border-t border-line px-2 py-3">
                  {track.remix ? `${track.title} (${track.remix})` : track.title}
                </td>
                {columns.genre ? <td className="border-t border-line px-2 py-3 text-muted">{track.genreLabel || "—"}</td> : null}
                {columns.bpm ? <td className="border-t border-line px-2 py-3 tabular-nums">{formatBpm(track.bpm)}</td> : null}
                {columns.key ? (
                  <td className="border-t border-line px-2 py-3">{track.camelot ? track.keyLabel : track.musicalKey || "—"}</td>
                ) : null}
                {columns.duration ? (
                  <td className="border-t border-line px-2 py-3 tabular-nums">{formatDuration(track.durationSeconds)}</td>
                ) : null}
                {columns.plays ? (
                  <td className="border-t border-line px-2 py-3 tabular-nums" title={String(track.historyPlays)}>
                    {track.playCount}
                  </td>
                ) : null}
                {columns.last ? (
                  <td className="border-t border-line px-2 py-3 text-muted">
                    {formatStamp(track.lastHistoryAt ?? track.lastPlay, locale)}
                  </td>
                ) : null}
                <td className="border-t border-line px-2 py-3">
                  <Button onClick={() => toggleCrate(track.id)}>{crateIds.includes(track.id) ? t.inCrate : t.addCrate}</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pager page={safePage} pages={pages} onPage={setPage} prev={t.prev} next={t.next} label={t.page} />
    </div>
  );
}

function Th({ children, onClick, title }: { children: string; onClick: () => void; title?: string }) {
  return (
    <th className="px-2 py-2 font-medium" title={title}>
      <button type="button" className="text-left text-muted" onClick={onClick}>
        {children}
      </button>
    </th>
  );
}

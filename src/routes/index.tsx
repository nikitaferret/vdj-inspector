import { useEffect, useMemo, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { formatBpm, formatSpan, formatStamp, plural } from "@/lib/format";
import { getDfmChart, type ChartSong } from "@/lib/dfm-chart";
import { useI18n } from "@/lib/i18n";
import { normalizeLabel } from "@/lib/vdj/derive";
import { useDerived, useSettings } from "@/lib/store";
import { Panel } from "@/components/ui";
import { ScrollArea } from "@/components/ui/scroll-area";

export const Route = createFileRoute("/")({
  component: OverviewPage,
});

function OverviewPage() {
  const { t, locale } = useI18n();
  const data = useDerived();
  const widgets = useSettings((state) => state.widgets);

  return (
    <div>
      <h1 className="mb-4 font-display text-2xl tracking-tight">{t.navOverview}</h1>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat to="/library" label={t.kpiTracks} value={plural(locale, data.kpis.tracks, t.trackForms)} />
        <Stat to="/history" label={t.kpiPlays} value={plural(locale, data.kpis.plays, t.playForms)} />
        <Stat to="/sessions" label={t.kpiSessions} value={plural(locale, data.kpis.sessions, t.sessionForms)} />
        <Stat to="/library" search={{ played: 1 }} label={t.kpiPlayed} value={String(data.kpis.played)} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <DfmChart tracks={data.tracks} />
        <Panel>
          <h2 className="mb-3 text-sm font-medium text-muted">{t.topTracks}</h2>
          {data.topTracks.length === 0 ? (
            <p className="text-sm text-muted">{t.emptyChart}</p>
          ) : (
            <ScrollArea className="h-[min(70vh,28rem)]">
              <table className="w-full table-fixed text-left text-sm">
                <thead className="sticky top-0 bg-elevated text-muted">
                  <tr>
                    <th className="py-2 pr-3 font-medium">{t.colTitle}</th>
                    <th className="w-16 py-2 pr-2 text-right font-medium">{t.colPlays}</th>
                    <th className="w-14 py-2 text-right font-medium">VDJ</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topTracks.map((row) => {
                    const parts = row.label.split(" — ");
                    const artist = parts.length > 1 ? parts[0] : "";
                    const title = parts.length > 1 ? parts.slice(1).join(" — ") : row.label;
                    return (
                      <tr key={row.id}>
                        <td className="border-t border-line py-1.5 pr-3 align-middle">
                          <div className="truncate">
                            {artist ? <span className="text-muted">{artist} — </span> : null}
                            {title}
                          </div>
                        </td>
                        <td className="border-t border-line py-1.5 pr-2 text-right tabular-nums align-middle">{row.total}</td>
                        <td
                          className={`border-t border-line py-1.5 text-right tabular-nums align-middle ${row.vdj != null && row.vdj !== row.total ? "text-warn" : "text-muted"}`}
                        >
                          {row.vdj ?? "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </ScrollArea>
          )}
        </Panel>
      </div>

      {widgets.recent ? (
        <Panel className="mt-4">
          <h2 className="mb-3 text-sm font-medium text-muted">{t.recentSessions}</h2>
          <ScrollArea className={data.sessions.length > 8 ? "h-[18rem]" : undefined}>
            <ul className="space-y-1">
              {data.sessions.map((session) => (
                <li key={session.id}>
                  <Link
                    to="/sessions/$id"
                    params={{ id: session.id }}
                    className="flex min-h-10 items-center justify-between gap-3 rounded-md px-2 hover:bg-subtle"
                  >
                    <span className="text-sm">{formatStamp(session.startedAt ?? session.sessionDate, locale)}</span>
                    <span className="text-xs text-muted tabular-nums">
                      {session.trackCount} · {formatSpan(session.spanMinutes, locale)}
                      {session.avgBpm != null ? ` · ${formatBpm(session.avgBpm)}` : ""}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </Panel>
      ) : null}
    </div>
  );
}

function DfmChart({ tracks }: { tracks: { title: string }[] }) {
  const { t } = useI18n();
  const [songs, setSongs] = useState<ChartSong[] | null>(null);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      setOffline(true);
      return;
    }
    let cancel = false;
    void getDfmChart()
      .then((result) => {
        if (cancel) return;
        setSongs(result.songs);
        setOffline(result.offline);
      })
      .catch(() => {
        if (!cancel) setOffline(true);
      });
    return () => {
      cancel = true;
    };
  }, []);

  const titles = useMemo(() => {
    const set = new Set<string>();
    for (const track of tracks) {
      const title = normalizeLabel(track.title, true);
      if (title) set.add(title);
    }
    return set;
  }, [tracks]);

  return (
    <Panel>
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-medium text-muted">{t.dfmTitle}</h2>
        <a
          href="https://radiotut.com/radio/dfmru/top_songs/"
          className="text-xs text-muted hover:underline"
          target="_blank"
          rel="noreferrer"
        >
          radiotut.com
        </a>
      </div>
      {songs === null && !offline ? <p className="text-sm text-muted">{t.dfmLoading}</p> : null}
      {offline ? <p className="text-sm text-muted">{t.dfmOffline}</p> : null}
      {songs && songs.length === 0 && !offline ? <p className="text-sm text-muted">{t.dfmEmpty}</p> : null}
      {songs && songs.length > 0 ? (
        <ScrollArea className={songs.length > 10 ? "h-[22.5rem]" : undefined}>
          <table className="w-full table-fixed text-left text-sm">
            <tbody>
              {songs.map((song, index) => {
                const known = titleInLibrary(song.title, titles);
                return (
                  <tr key={`${song.artist}-${song.title}-${index}`}>
                    <td className="w-6 border-t border-line py-1.5 pr-1 tabular-nums text-faint align-middle">{index + 1}</td>
                    <td className="border-t border-line py-1.5 pr-2 align-middle">
                      <div className="truncate">
                        <span className="text-muted">{song.artist}</span>
                        {song.artist ? " — " : ""}
                        {song.title}
                      </div>
                    </td>
                    <td className="w-10 border-t border-line py-1.5 pr-2 text-right tabular-nums align-middle">{song.plays}</td>
                    <td className={`w-12 border-t border-line py-1.5 text-right align-middle ${known ? "text-good" : "text-faint"}`}>
                      {known ? t.dfmIn : t.dfmOut}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </ScrollArea>
      ) : null}
    </Panel>
  );
}

function titleInLibrary(title: string, titles: Set<string>): boolean {
  const name = normalizeLabel(title, true);
  if (name.length < 3) return false;
  if (titles.has(name)) return true;
  if (name.length < 6) return false;
  for (const have of titles) {
    if (have.length < 6) continue;
    if (have === name || have.includes(name) || name.includes(have)) return true;
  }
  return false;
}

function Stat({
  to,
  search,
  label,
  value,
}: {
  to: "/library" | "/history" | "/sessions";
  search?: { played: 1 };
  label: string;
  value: string;
}) {
  return (
    <Link
      to={to}
      search={search}
      className="rounded-lg border border-white/10 bg-elevated p-3 transition-colors hover:bg-subtle"
    >
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 font-display text-xl tabular-nums tracking-tight">{value}</p>
    </Link>
  );
}

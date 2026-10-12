import { useEffect, useMemo, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { formatBpm, formatSpan, formatStamp, plural } from "@/lib/format";
import { getDfmChart, type ChartSong } from "@/lib/dfm-chart";
import { useI18n } from "@/lib/i18n";
import { normalizeLabel } from "@/lib/vdj/derive";
import { profileLabel, useDerived, useLibrary, useSettings } from "@/lib/store";
import { PageIntro, Panel } from "@/components/ui";

export const Route = createFileRoute("/")({
  component: OverviewPage,
});

function OverviewPage() {
  const { t, locale } = useI18n();
  const data = useDerived();
  const origin = useLibrary((state) => state.origin);
  const widgets = useSettings((state) => state.widgets);
  const profileRef = useSettings((state) => state.profileRef);
  const profiles = useSettings((state) => state.profiles);
  const rules = profileLabel(profileRef, profiles, locale, t.customRules);

  return (
    <div>
      <PageIntro title={t.navOverview} lead={t.overviewLead} />
      <p className="mb-5 max-w-3xl rounded-lg bg-elevated px-4 py-3 text-sm text-muted">
        {origin === "demo" ? t.demoBanner : t.userBanner}{" "}
        <Link to="/settings" className="text-fg underline-offset-4 hover:underline">
          {t.changeRules}
        </Link>
        <span className="text-faint"> · {rules}</span>
      </p>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat to="/library" label={t.kpiTracks} value={plural(locale, data.kpis.tracks, t.trackForms)} hint={t.tipTracks} />
        <Stat to="/history" label={t.kpiPlays} value={plural(locale, data.kpis.plays, t.playForms)} hint={t.tipPlays} />
        <Stat to="/sessions" label={t.kpiSessions} value={plural(locale, data.kpis.sessions, t.sessionForms)} hint={t.tipSessions} />
        <Stat to="/library" search={{ played: 1 }} label={t.kpiPlayed} value={String(data.kpis.played)} hint={t.tipPlayed} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <DfmChart tracks={data.tracks} />
        <Panel>
          <h2 className="text-sm font-medium text-muted">{t.topTracks}</h2>
          <p className="mt-2 mb-4 max-w-3xl text-sm text-muted">{t.playCountNote}</p>
          {data.topTracks.length === 0 ? (
            <p className="text-sm text-muted">{t.emptyChart}</p>
          ) : (
            <div className="max-h-[70vh] overflow-auto [scrollbar-gutter:stable]">
              <table className="w-full min-w-[20rem] text-left text-sm">
                <thead className="sticky top-0 bg-elevated text-muted">
                  <tr>
                    <th className="py-2 pr-3 font-medium">{t.colTitle}</th>
                    <th className="w-20 py-2 pr-4 text-right font-medium">{t.colPlays}</th>
                    <th className="w-24 py-2 pr-2 text-right font-medium">{t.vdjCount}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topTracks.map((row) => (
                    <tr key={row.id}>
                      <td className="border-t border-line py-2 pr-3">{row.label}</td>
                      <td className="border-t border-line py-2 pr-4 text-right tabular-nums">{row.total}</td>
                      <td
                        className={`border-t border-line py-2 pr-2 text-right tabular-nums ${row.vdj != null && row.vdj !== row.total ? "text-warn" : "text-muted"}`}
                      >
                        {row.vdj ?? "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>

      {widgets.recent ? (
        <Panel className="mt-4">
          <h2 className="mb-4 text-sm font-medium text-muted">{t.recentSessions}</h2>
          <ul className={data.sessions.length > 10 ? "max-h-[22.5rem] space-y-2 overflow-y-auto pr-1" : "space-y-2"}>
            {data.sessions.map((session) => (
              <li key={session.id}>
                <Link
                  to="/sessions/$id"
                  params={{ id: session.id }}
                  className="flex min-h-11 items-center justify-between gap-3 rounded-sm px-2 hover:bg-subtle"
                >
                  <span>
                    <span className="block text-sm">{formatStamp(session.startedAt ?? session.sessionDate, locale)}</span>
                    <span className="text-xs text-muted">
                      {session.trackCount} · {formatSpan(session.spanMinutes, locale)}
                      {session.avgBpm != null ? ` · ${formatBpm(session.avgBpm)}` : ""}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-faint">{t.spanNote}</p>
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
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-medium text-muted">{t.dfmTitle}</h2>
        <a
          href="https://radiotut.com/radio/dfmru/top_songs/"
          className="text-sm text-muted underline-offset-4 hover:underline"
          target="_blank"
          rel="noreferrer"
        >
          radiotut.com
        </a>
      </div>
      <p className="mt-2 mb-4 max-w-3xl text-sm text-muted">{t.dfmNote}</p>
      {songs === null && !offline ? <p className="text-sm text-muted">{t.dfmLoading}</p> : null}
      {offline ? <p className="text-sm text-muted">{t.dfmOffline}</p> : null}
      {songs && songs.length === 0 && !offline ? <p className="text-sm text-muted">{t.dfmEmpty}</p> : null}
      {songs && songs.length > 0 ? (
        <div className={songs.length > 10 ? "max-h-[22.5rem] overflow-auto pr-1 [scrollbar-gutter:stable]" : undefined}>
          <table className="w-full text-left text-sm">
            <tbody>
              {songs.map((song, index) => {
                const known = titleInLibrary(song.title, titles);
                return (
                  <tr key={`${song.artist}-${song.title}-${index}`}>
                    <td className="w-8 border-t border-line py-2 pr-2 tabular-nums text-faint">{index + 1}</td>
                    <td className="border-t border-line py-2 pr-3">
                      <span className="text-muted">{song.artist}</span>
                      {song.artist ? " — " : ""}
                      {song.title}
                    </td>
                    <td className="w-16 border-t border-line py-2 pr-3 text-right tabular-nums">{song.plays}</td>
                    <td className={`w-28 border-t border-line py-2 text-right ${known ? "text-good" : "text-faint"}`}>
                      {known ? t.dfmIn : t.dfmOut}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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
  hint,
}: {
  to: "/library" | "/history" | "/sessions";
  search?: { played: 1 };
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <Link
      to={to}
      search={search}
      title={hint}
      className="rounded-lg bg-elevated p-4 transition-colors duration-150 hover:bg-subtle"
    >
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 font-display text-[clamp(1.35rem,2vw,1.75rem)] tabular-nums tracking-tight">{value}</p>
    </Link>
  );
}

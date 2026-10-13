import { Link, createFileRoute } from "@tanstack/react-router";
import { formatBpm, formatSpan, formatStamp, downloadText } from "@/lib/format";
import { relationLabel, useI18n } from "@/lib/i18n";
import { relationBetween } from "@/lib/vdj/keys";
import { useDerived, useSettings } from "@/lib/store";
import { Button, RelationText } from "@/components/ui";

export const Route = createFileRoute("/sessions/$id")({
  component: SessionDetailPage,
});

function SessionDetailPage() {
  const { id } = Route.useParams();
  const { t, locale } = useI18n();
  const data = useDerived();
  const compat = useSettings((state) => state.tunables.compat);
  const session = data.sessions.find((item) => item.id === id);
  const plays = data.plays.filter((play) => play.sessionId === id).sort((a, b) => a.position - b.position);

  if (!session) {
    return (
      <div>
        <h1 className="mb-4 font-display text-2xl tracking-tight">{t.navSessions}</h1>
        <p className="mb-3 text-sm text-muted">{t.missingSession}</p>
        <Link to="/sessions" className="text-sm underline-offset-4 hover:underline">
          {t.back}
        </Link>
      </div>
    );
  }

  function exportText() {
    const lines = plays.map((play, index) => {
      const prev = index === 0 ? null : plays[index - 1].camelot;
      const rel = relationBetween(prev, play.camelot, compat);
      const bits = [play.playedAt.slice(11, 16), play.artist, play.title, play.keyLabel !== "—" ? play.keyLabel : "", relationLabel(t, rel)];
      return bits.filter(Boolean).join(" — ");
    });
    downloadText(`session-${session?.sessionDate ?? "set"}.txt`, lines.join("\n"));
  }

  return (
    <div>
      <Link to="/sessions" className="mb-3 inline-flex min-h-9 items-center text-sm text-muted underline-offset-4 hover:underline">
        {t.back}
      </Link>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl tracking-tight">{formatStamp(session.startedAt ?? session.sessionDate, locale)}</h1>
          <p className="mt-1 text-xs text-muted">
            {session.trackCount} · {session.artistCount} {t.sessionArtists} · {session.matched} {t.sessionMatched} · {formatSpan(session.spanMinutes, locale)}
            {session.avgBpm != null ? ` · ${formatBpm(session.avgBpm)}` : ""}
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={exportText}>
          {t.exportTxt}
        </Button>
      </div>
      <ol className="space-y-1">
        {plays.map((play, index) => {
          const prev = index === 0 ? null : plays[index - 1].camelot;
          const rel = relationBetween(prev, play.camelot, compat);
          return (
            <li key={play.id} className="flex items-center justify-between gap-3 rounded-md bg-elevated px-3 py-2">
              <div className="min-w-0">
                <p className="text-xs tabular-nums text-faint">{play.playedAt.slice(11, 16)}</p>
                <p className="truncate text-sm">
                  {play.artist ? <span className="text-muted">{play.artist} — </span> : null}
                  {play.title}
                </p>
              </div>
              <div className="shrink-0 text-right text-xs">
                <p>{play.trackId ? play.keyLabel : t.notInLibrary}</p>
                <p className="tabular-nums text-muted">{formatBpm(play.bpm)}</p>
                {index > 0 ? (
                  <p className="mt-0.5">
                    <RelationText rel={rel}>{relationLabel(t, rel)}</RelationText>
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

import { Link, createFileRoute } from "@tanstack/react-router";
import { formatBpm, formatSpan, formatStamp, downloadText } from "@/lib/format";
import { relationLabel, useI18n } from "@/lib/i18n";
import { relationBetween } from "@/lib/vdj/keys";
import { useDerived, useSettings } from "@/lib/store";
import { Button, PageIntro, RelationText } from "@/components/ui";

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
        <PageIntro title={t.navSessions} lead={t.missingSession} />
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
      <Link to="/sessions" className="mb-3 inline-flex min-h-11 items-center text-sm text-muted underline-offset-4 hover:underline">
        {t.back}
      </Link>
      <PageIntro
        title={formatStamp(session.startedAt ?? session.sessionDate, locale)}
        lead={`${session.trackCount} · ${session.artistCount} ${t.sessionArtists} · ${session.matched} ${t.sessionMatched} · ${formatSpan(session.spanMinutes, locale)}${session.avgBpm != null ? ` · ${formatBpm(session.avgBpm)}` : ""}`}
      />
      <Button onClick={exportText}>{t.exportTxt}</Button>
      <section className="mt-4 rounded-lg bg-elevated p-4 text-sm text-muted">
        <h2 className="text-sm font-medium text-fg">{t.relHelpTitle}</h2>
        <p className="mt-2" title={t.relHelpAdjacent}>
          <RelationText rel="adjacent">{t.relAdjacent}.</RelationText> {t.relHelpAdjacent}
        </p>
        <p className="mt-2" title={t.relHelpRelative}>
          <RelationText rel="relative">{t.relRelative}.</RelationText> {t.relHelpRelative}
        </p>
        <p className="mt-2">
          <RelationText rel="same">{t.relSame}.</RelationText> {t.relHelpSame}
        </p>
        <p className="mt-2" title={t.relHelpJump}>
          <RelationText rel="jump">{t.relJump}.</RelationText> {t.relHelpJump}
        </p>
      </section>
      <ol className="mt-4 space-y-2">
        {plays.map((play, index) => {
          const prev = index === 0 ? null : plays[index - 1].camelot;
          const rel = relationBetween(prev, play.camelot, compat);
          return (
            <li key={play.id} className="rounded-lg bg-elevated p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs tabular-nums text-faint">{play.playedAt.slice(11, 16)}</p>
                  <p className="truncate font-medium">{play.title}</p>
                  <p className="truncate text-sm text-muted">{play.artist || "—"}</p>
                </div>
                <div className="text-right text-sm">
                  <p>{play.trackId ? play.keyLabel : t.notInLibrary}</p>
                  <p className="tabular-nums text-muted">{formatBpm(play.bpm)}</p>
                  {index > 0 ? (
                    <p className="mt-1">
                      <RelationText
                        rel={rel}
                        title={
                          rel === "adjacent"
                            ? t.relHelpAdjacent
                            : rel === "relative"
                              ? t.relHelpRelative
                              : rel === "jump"
                                ? t.relHelpJump
                                : undefined
                        }
                      >
                        {relationLabel(t, rel)}
                      </RelationText>
                    </p>
                  ) : null}
                </div>
              </div>
              {play.genreLabel ? <p className="mt-2 text-xs text-faint">{play.genreLabel}</p> : null}
            </li>
          );
        })}
      </ol>
      <p className="mt-4 text-xs text-faint">{t.spanNote}</p>
    </div>
  );
}

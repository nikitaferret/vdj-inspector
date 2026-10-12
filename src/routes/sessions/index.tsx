import { Link, createFileRoute } from "@tanstack/react-router";
import { formatBpm, formatSpan, formatStamp } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { useDerived } from "@/lib/store";
import { PageIntro } from "@/components/ui";

export const Route = createFileRoute("/sessions/")({
  component: SessionsPage,
});

function SessionsPage() {
  const { t, locale } = useI18n();
  const data = useDerived();

  return (
    <div>
      <PageIntro title={t.navSessions} lead={t.sessionsLead} />
      {data.sessions.length === 0 ? <p className="text-sm text-muted">{t.emptyChart}</p> : null}
      <ul className="grid gap-3">
        {data.sessions.map((session) => (
          <li key={session.id}>
            <Link
              to="/sessions/$id"
              params={{ id: session.id }}
              className="block rounded-lg bg-elevated p-4 hover:bg-subtle"
            >
              <p className="font-display text-xl tracking-tight">{formatStamp(session.startedAt ?? session.sessionDate, locale)}</p>
              <p className="mt-2 text-sm text-muted">
                {session.trackCount} · {session.artistCount} {t.sessionArtists} · {session.matched} {t.sessionMatched} ·{" "}
                {formatSpan(session.spanMinutes, locale)}
                {session.avgBpm != null ? ` · ${formatBpm(session.avgBpm)} ${t.avgBpm}` : ""}
              </p>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-faint">{t.spanNote}</p>
    </div>
  );
}

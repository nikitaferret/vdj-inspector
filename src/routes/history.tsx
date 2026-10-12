import { useEffect, useMemo, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { formatStamp } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { useDerived, useSettings } from "@/lib/store";
import { Field, PageIntro, Pager, SelectField, Toggle } from "@/components/ui";

export const Route = createFileRoute("/history")({
  component: HistoryPage,
});

function HistoryPage() {
  const { t, locale } = useI18n();
  const data = useDerived();
  const pageSize = useSettings((state) => state.tunables.pageSize);
  const [query, setQuery] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [missingOnly, setMissingOnly] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("when");
  const [sortDir, setSortDir] = useState<1 | -1>(-1);
  const [page, setPage] = useState(0);

  useEffect(() => {
    setPage(0);
  }, [query, from, to, sessionId, missingOnly, pageSize, sortKey, sortDir]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = data.plays.filter((play) => {
      if (missingOnly && play.trackId) return false;
      if (sessionId && play.sessionId !== sessionId) return false;
      const day = play.playedAt.slice(0, 10);
      if (from && day < from) return false;
      if (to && day > to) return false;
      if (!q) return true;
      return `${play.artist} ${play.title} ${play.originalText}`.toLowerCase().includes(q);
    });
    return filtered.sort((a, b) => {
      const left = sortValue(a, sortKey);
      const right = sortValue(b, sortKey);
      if (left < right) return -1 * sortDir;
      if (left > right) return 1 * sortDir;
      return 0;
    });
  }, [data.plays, from, missingOnly, query, sessionId, sortDir, sortKey, to]);

  const pages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(page, pages - 1);
  const visible = rows.slice(safePage * pageSize, safePage * pageSize + pageSize);
  const matched = rows.filter((play) => play.trackId).length;

  function sortBy(next: SortKey) {
    if (sortKey === next) setSortDir((dir) => (dir === 1 ? -1 : 1));
    else {
      setSortKey(next);
      setSortDir(next === "when" ? -1 : 1);
    }
  }

  return (
    <div>
      <PageIntro title={t.navHistory} lead={t.historyLead} />
      <p className="mb-4 text-sm text-muted">
        {rows.length} · {matched} {t.matchedOf}
      </p>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <label className="md:col-span-2">
          <span className="mb-1 block text-sm text-muted">{t.search}</span>
          <Field value={query} onChange={(event) => setQuery(event.target.value)} />
        </label>
        <label>
          <span className="mb-1 block text-sm text-muted">{t.colSession}</span>
          <SelectField value={sessionId} onChange={(event) => setSessionId(event.target.value)}>
            <option value="">{t.anySession}</option>
            {data.sessions.map((session) => (
              <option key={session.id} value={session.id}>
                {session.sessionDate}
              </option>
            ))}
          </SelectField>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label>
            <span className="mb-1 block text-sm text-muted">{t.dateFrom}</span>
            <Field type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
          </label>
          <label>
            <span className="mb-1 block text-sm text-muted">{t.dateTo}</span>
            <Field type="date" value={to} onChange={(event) => setTo(event.target.value)} />
          </label>
        </div>
      </div>
      <div className="mt-3">
        <Toggle checked={missingOnly} onChange={setMissingOnly} label={t.missingOnly} />
      </div>
      <ul className="mt-4 hidden space-y-3">
        {visible.map((play) => (
          <li key={play.id} className="rounded-lg bg-elevated p-4">
            <p className="font-medium">{play.title}</p>
            <p className="text-sm text-muted">{play.artist || "—"}</p>
            <p className="mt-2 text-sm text-muted">
              {formatStamp(play.playedAt, locale)} · {play.trackId ? play.keyLabel : t.notInLibrary}
            </p>
            <Link to="/sessions/$id" params={{ id: play.sessionId }} className="mt-2 inline-flex min-h-11 items-center text-sm underline-offset-4 hover:underline">
              {play.sessionDate}
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="text-muted">
            <tr>
              <Th label={t.colWhen} onClick={() => sortBy("when")} title={t.tipSort} />
              <Th label={t.colArtist} onClick={() => sortBy("artist")} title={t.tipSort} />
              <Th label={t.colTitle} onClick={() => sortBy("title")} title={t.tipSort} />
              <Th label={t.colKey} onClick={() => sortBy("key")} title={t.tipSort} />
              <Th label={t.colSession} onClick={() => sortBy("session")} title={t.tipSort} />
            </tr>
          </thead>
          <tbody>
            {visible.map((play) => (
              <tr key={play.id}>
                <td className="border-t border-line px-2 py-3 tabular-nums">{formatStamp(play.playedAt, locale)}</td>
                <td className="border-t border-line px-2 py-3">{play.artist || "—"}</td>
                <td className="border-t border-line px-2 py-3">{play.title}</td>
                <td className="border-t border-line px-2 py-3 text-muted">{play.trackId ? play.keyLabel : t.notInLibrary}</td>
                <td className="border-t border-line px-2 py-3">
                  <Link to="/sessions/$id" params={{ id: play.sessionId }} className="underline-offset-4 hover:underline">
                    {play.sessionDate}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 ? <p className="mt-6 text-sm text-muted">{t.noTracks}</p> : null}
      <Pager page={safePage} pages={pages} onPage={setPage} prev={t.prev} next={t.next} label={t.page} />
    </div>
  );
}

type SortKey = "when" | "artist" | "title" | "key" | "session";

function sortValue(
  play: { playedAt: string; artist: string; title: string; keyLabel: string; sessionDate: string; trackId: string | null },
  key: SortKey,
): string {
  if (key === "when") return play.playedAt;
  if (key === "artist") return play.artist.toLowerCase();
  if (key === "title") return play.title.toLowerCase();
  if (key === "key") return play.trackId ? play.keyLabel : "";
  return play.sessionDate;
}

function Th({ label, onClick, title }: { label: string; onClick: () => void; title: string }) {
  return (
    <th className="px-2 py-2 font-medium">
      <button type="button" className="min-h-11 text-left text-muted" title={title} onClick={onClick}>
        {label}
      </button>
    </th>
  );
}

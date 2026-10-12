import { S as require_jsx_runtime, b as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { E as formatStamp, M as relationBetween, S as formatBpm, T as formatSpan, c as useSettings, g as PageIntro, i as useI18n, n as Route, o as useDerived, p as Button, r as relationLabel, x as downloadText } from "./_ssr/router-BFBNLgf_.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_id-Bpryai_y.js
var import_jsx_runtime = require_jsx_runtime();
function SessionDetailPage() {
	const { id } = Route.useParams();
	const { t, locale } = useI18n();
	const data = useDerived();
	const compat = useSettings((state) => state.tunables.compat);
	const session = data.sessions.find((item) => item.id === id);
	const plays = data.plays.filter((play) => play.sessionId === id).sort((a, b) => a.position - b.position);
	if (!session) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageIntro, {
		title: t.navSessions,
		lead: t.missingSession
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/sessions",
		className: "text-sm underline-offset-4 hover:underline",
		children: t.back
	})] });
	function exportText() {
		const lines = plays.map((play, index) => {
			const prev = index === 0 ? null : plays[index - 1].camelot;
			const rel = relationBetween(prev, play.camelot, compat);
			return [
				play.playedAt.slice(11, 16),
				play.artist,
				play.title,
				play.keyLabel !== "—" ? play.keyLabel : "",
				relationLabel(t, rel)
			].filter(Boolean).join(" — ");
		});
		downloadText(`session-${session?.sessionDate ?? "set"}.txt`, lines.join("\n"));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
			to: "/sessions",
			className: "mb-3 inline-flex min-h-11 items-center text-sm text-muted underline-offset-4 hover:underline",
			children: t.back
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageIntro, {
			title: formatStamp(session.startedAt ?? session.sessionDate, locale),
			lead: `${session.trackCount} · ${session.artistCount} ${t.sessionArtists} · ${session.matched} ${t.sessionMatched} · ${formatSpan(session.spanMinutes, locale)}${session.avgBpm != null ? ` · ${formatBpm(session.avgBpm)}` : ""}`
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			onClick: exportText,
			children: t.exportTxt
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
			className: "mt-4 space-y-2",
			children: plays.map((play, index) => {
				const prev = index === 0 ? null : plays[index - 1].camelot;
				const rel = relationBetween(prev, play.camelot, compat);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-lg bg-elevated p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs tabular-nums text-faint",
									children: play.playedAt.slice(11, 16)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate font-medium",
									children: play.title
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-sm text-muted",
									children: play.artist || "—"
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-right text-sm",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: play.trackId ? play.keyLabel : t.notInLibrary }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "tabular-nums text-muted",
									children: formatBpm(play.bpm)
								}),
								index > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-muted",
									children: relationLabel(t, rel)
								}) : null
							]
						})]
					}), play.genreLabel ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs text-faint",
						children: play.genreLabel
					}) : null]
				}, play.id);
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-4 text-xs text-faint",
			children: t.spanNote
		})
	] });
}
//#endregion
export { SessionDetailPage as component };

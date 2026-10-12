import { S as require_jsx_runtime, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { E as formatStamp, S as formatBpm, T as formatSpan, g as PageIntro, i as useI18n, o as useDerived } from "./router-BFBNLgf_.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/sessions-CiMMpi2T.js
var import_jsx_runtime = require_jsx_runtime();
function SessionsPage() {
	const { t, locale } = useI18n();
	const data = useDerived();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageIntro, {
			title: t.navSessions,
			lead: t.sessionsLead
		}),
		data.sessions.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted",
			children: t.emptyChart
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "grid gap-3",
			children: data.sessions.map((session) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/sessions/$id",
				params: { id: session.id },
				className: "block rounded-lg bg-elevated p-4 hover:bg-subtle",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-xl tracking-tight",
					children: formatStamp(session.startedAt ?? session.sessionDate, locale)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-sm text-muted",
					children: [
						session.trackCount,
						" · ",
						session.artistCount,
						" ",
						t.sessionArtists,
						" · ",
						session.matched,
						" ",
						t.sessionMatched,
						" ·",
						" ",
						formatSpan(session.spanMinutes, locale),
						session.avgBpm != null ? ` · ${formatBpm(session.avgBpm)} ${t.avgBpm}` : ""
					]
				})]
			}) }, session.id))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-4 text-xs text-faint",
			children: t.spanNote
		})
	] });
}
//#endregion
export { SessionsPage as component };

import { S as require_jsx_runtime, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { D as plural, E as formatStamp, S as formatBpm, T as formatSpan, a as profileLabel, c as useSettings, g as PageIntro, h as MeterList, i as useI18n, o as useDerived, s as useLibrary, v as Panel, w as formatMonth } from "./router-BFBNLgf_.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-ovNOnjbc.js
var import_jsx_runtime = require_jsx_runtime();
function OverviewPage() {
	const { t, locale } = useI18n();
	const data = useDerived();
	const origin = useLibrary((state) => state.origin);
	const widgets = useSettings((state) => state.widgets);
	const profileRef = useSettings((state) => state.profileRef);
	const profiles = useSettings((state) => state.profiles);
	const rules = profileLabel(profileRef, profiles, locale, t.customRules);
	const maxHour = Math.max(1, ...data.hourly.map((row) => row.total));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageIntro, {
			title: t.navOverview,
			lead: t.overviewLead
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mb-5 max-w-3xl rounded-lg bg-elevated px-4 py-3 text-sm text-muted",
			children: [
				origin === "demo" ? t.demoBanner : t.userBanner,
				" ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/settings",
					className: "text-fg underline-offset-4 hover:underline",
					children: t.changeRules
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-faint",
					children: [" · ", rules]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-2 gap-3 lg:grid-cols-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: t.kpiTracks,
					value: plural(locale, data.kpis.tracks, t.trackForms)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: t.kpiPlays,
					value: plural(locale, data.kpis.plays, t.playForms)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: t.kpiSessions,
					value: plural(locale, data.kpis.sessions, t.sessionForms)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: t.kpiPlayed,
					value: String(data.kpis.played)
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid gap-3 lg:grid-cols-2",
			children: [
				widgets.monthly ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-4 text-sm font-medium text-muted",
					children: t.monthly
				}), data.monthly.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: t.emptyChart
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeterList, { rows: data.monthly.map((row) => ({
					label: formatMonth(row.key, locale),
					total: row.total
				})) })] }) : null,
				widgets.artists ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mb-4 text-sm font-medium text-muted",
					children: t.topArtists
				}), data.topArtists.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: t.emptyChart
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MeterList, { rows: data.topArtists.map((row) => ({
					label: row.artist,
					total: row.total
				})) })] }) : null,
				widgets.hourly ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mb-4 text-sm font-medium text-muted",
						children: t.hourly
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex h-32 items-end gap-1",
						children: data.hourly.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex h-full min-w-0 flex-1 items-end",
							title: `${row.hour}: ${row.total}`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "w-full rounded-sm bg-accent",
								style: { height: row.total ? `${Math.max(8, Math.round(row.total / maxHour * 100))}%` : "0%" }
							})
						}, row.hour))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex justify-between text-xs tabular-nums text-faint",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "0" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "6" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "12" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "18" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "23" })
						]
					})
				] }) : null,
				widgets.recent ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mb-4 text-sm font-medium text-muted",
						children: t.recentSessions
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "space-y-2",
						children: data.sessions.slice(0, 5).map((session) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/sessions/$id",
							params: { id: session.id },
							className: "flex min-h-11 items-center justify-between gap-3 rounded-sm px-2 hover:bg-subtle",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block text-sm",
								children: formatStamp(session.startedAt ?? session.sessionDate, locale)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs text-muted",
								children: [
									session.trackCount,
									" · ",
									formatSpan(session.spanMinutes, locale),
									session.avgBpm != null ? ` · ${formatBpm(session.avgBpm)}` : ""
								]
							})] })
						}) }, session.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-xs text-faint",
						children: t.spanNote
					})
				] }) : null
			]
		})
	] });
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
		className: "rounded-lg bg-elevated p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 font-display text-2xl tabular-nums tracking-tight",
			children: value
		})]
	});
}
//#endregion
export { OverviewPage as component };

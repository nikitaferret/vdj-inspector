import { i as __toESM } from "../_runtime.mjs";
import { J as require_react, S as require_jsx_runtime, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { E as formatStamp, _ as Pager, c as useSettings, g as PageIntro, i as useI18n, m as Field, o as useDerived, y as SelectField } from "./router-BFBNLgf_.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/history-D2Qy_Rh-.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function HistoryPage() {
	const { t, locale } = useI18n();
	const data = useDerived();
	const pageSize = useSettings((state) => state.tunables.pageSize);
	const [query, setQuery] = (0, import_react.useState)("");
	const [from, setFrom] = (0, import_react.useState)("");
	const [to, setTo] = (0, import_react.useState)("");
	const [sessionId, setSessionId] = (0, import_react.useState)("");
	const [page, setPage] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		setPage(0);
	}, [
		query,
		from,
		to,
		sessionId,
		pageSize
	]);
	const rows = (0, import_react.useMemo)(() => {
		const q = query.trim().toLowerCase();
		return data.plays.filter((play) => {
			if (sessionId && play.sessionId !== sessionId) return false;
			const day = play.playedAt.slice(0, 10);
			if (from && day < from) return false;
			if (to && day > to) return false;
			if (!q) return true;
			return `${play.artist} ${play.title} ${play.originalText}`.toLowerCase().includes(q);
		}).sort((a, b) => b.playedAt.localeCompare(a.playedAt));
	}, [
		data.plays,
		from,
		query,
		sessionId,
		to
	]);
	const pages = Math.max(1, Math.ceil(rows.length / pageSize));
	const safePage = Math.min(page, pages - 1);
	const visible = rows.slice(safePage * pageSize, safePage * pageSize + pageSize);
	const matched = rows.filter((play) => play.trackId).length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageIntro, {
			title: t.navHistory,
			lead: t.historyLead
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mb-4 text-sm text-muted",
			children: [
				rows.length,
				" · ",
				matched,
				" ",
				t.matchedOf
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-3 md:grid-cols-2 lg:grid-cols-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "md:col-span-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mb-1 block text-sm text-muted",
						children: t.search
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						value: query,
						onChange: (event) => setQuery(event.target.value)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mb-1 block text-sm text-muted",
					children: t.colSession
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectField, {
					value: sessionId,
					onChange: (event) => setSessionId(event.target.value),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "",
						children: t.anySession
					}), data.sessions.map((session) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: session.id,
						children: session.sessionDate
					}, session.id))]
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-2 gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mb-1 block text-sm text-muted",
						children: t.dateFrom
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						type: "date",
						value: from,
						onChange: (event) => setFrom(event.target.value)
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "mb-1 block text-sm text-muted",
						children: t.dateTo
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						type: "date",
						value: to,
						onChange: (event) => setTo(event.target.value)
					})] })]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-4 space-y-3 md:hidden",
			children: visible.map((play) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "rounded-lg bg-elevated p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium",
						children: play.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: play.artist || "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-sm text-muted",
						children: [
							formatStamp(play.playedAt, locale),
							" · ",
							play.trackId ? play.keyLabel : t.notInLibrary
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/sessions/$id",
						params: { id: play.sessionId },
						className: "mt-2 inline-flex min-h-11 items-center text-sm underline-offset-4 hover:underline",
						children: play.sessionDate
					})
				]
			}, play.id))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 hidden overflow-x-auto md:block",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full min-w-[680px] text-left text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "text-muted",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-2 py-2 font-medium",
							children: t.colWhen
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-2 py-2 font-medium",
							children: t.colArtist
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-2 py-2 font-medium",
							children: t.colTitle
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-2 py-2 font-medium",
							children: t.colKey
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-2 py-2 font-medium",
							children: t.colSession
						})
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: visible.map((play) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "border-t border-line px-2 py-3 tabular-nums",
						children: formatStamp(play.playedAt, locale)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "border-t border-line px-2 py-3",
						children: play.artist || "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "border-t border-line px-2 py-3",
						children: play.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "border-t border-line px-2 py-3 text-muted",
						children: play.trackId ? play.keyLabel : t.notInLibrary
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
						className: "border-t border-line px-2 py-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/sessions/$id",
							params: { id: play.sessionId },
							className: "underline-offset-4 hover:underline",
							children: play.sessionDate
						})
					})
				] }, play.id)) })]
			})
		}),
		rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-6 text-sm text-muted",
			children: t.noTracks
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pager, {
			page: safePage,
			pages,
			onPage: setPage,
			prev: t.prev,
			next: t.next,
			label: t.page
		})
	] });
}
//#endregion
export { HistoryPage as component };

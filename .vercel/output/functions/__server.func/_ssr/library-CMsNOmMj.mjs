import { i as __toESM } from "../_runtime.mjs";
import { J as require_react, S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { C as formatDuration, E as formatStamp, O as toCsv, S as formatBpm, _ as Pager, c as useSettings, g as PageIntro, i as useI18n, m as Field, o as useDerived, p as Button, x as downloadText, y as SelectField } from "./router-BFBNLgf_.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/library-CMsNOmMj.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function LibraryPage() {
	const { t, locale } = useI18n();
	const data = useDerived();
	const columns = useSettings((state) => state.columns);
	const pageSize = useSettings((state) => state.tunables.pageSize);
	const crateIds = useSettings((state) => state.crateIds);
	const toggleCrate = useSettings((state) => state.toggleCrate);
	const [query, setQuery] = (0, import_react.useState)("");
	const [genre, setGenre] = (0, import_react.useState)("");
	const [key, setKey] = (0, import_react.useState)("");
	const [bpmFrom, setBpmFrom] = (0, import_react.useState)("");
	const [bpmTo, setBpmTo] = (0, import_react.useState)("");
	const [playedOnly, setPlayedOnly] = (0, import_react.useState)(false);
	const [sortKey, setSortKey] = (0, import_react.useState)("artist");
	const [sortDir, setSortDir] = (0, import_react.useState)(1);
	const [page, setPage] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		setPage(0);
	}, [
		query,
		genre,
		key,
		bpmFrom,
		bpmTo,
		playedOnly,
		pageSize
	]);
	const rows = (0, import_react.useMemo)(() => {
		const q = query.trim().toLowerCase();
		const min = bpmFrom === "" ? null : Number(bpmFrom);
		const max = bpmTo === "" ? null : Number(bpmTo);
		const activeKey = data.keys.includes(key) ? key : "";
		const filtered = data.tracks.filter((track) => {
			if (q) {
				if (!`${track.artist} ${track.title} ${track.remix ?? ""} ${track.filePath} ${track.genreLabel} ${track.keyLabel} ${track.musicalKey ?? ""}`.toLowerCase().includes(q)) return false;
			}
			if (genre && track.genreLabel !== genre) return false;
			if (activeKey && track.keyLabel !== activeKey) return false;
			if (playedOnly && track.playCount <= 0) return false;
			if (min != null && Number.isFinite(min) && (track.bpm == null || track.bpm < min)) return false;
			if (max != null && Number.isFinite(max) && (track.bpm == null || track.bpm > max)) return false;
			return true;
		});
		const value = (track) => {
			if (sortKey === "artist") return track.artist.toLowerCase();
			if (sortKey === "title") return track.title.toLowerCase();
			if (sortKey === "genre") return track.genreLabel.toLowerCase();
			if (sortKey === "key") return track.keyLabel;
			if (sortKey === "bpm") return track.bpm ?? -1;
			if (sortKey === "plays") return track.playCount;
			return track.lastHistoryAt ?? track.lastPlay ?? "";
		};
		return filtered.sort((a, b) => {
			const left = value(a);
			const right = value(b);
			if (left < right) return -1 * sortDir;
			if (left > right) return 1 * sortDir;
			return a.title.localeCompare(b.title);
		});
	}, [
		bpmFrom,
		bpmTo,
		data.keys,
		data.tracks,
		genre,
		key,
		playedOnly,
		query,
		sortDir,
		sortKey
	]);
	const pages = Math.max(1, Math.ceil(rows.length / pageSize));
	const safePage = Math.min(page, pages - 1);
	const visible = rows.slice(safePage * pageSize, safePage * pageSize + pageSize);
	function sortBy(next) {
		if (sortKey === next) setSortDir((dir) => dir === 1 ? -1 : 1);
		else {
			setSortKey(next);
			setSortDir(next === "plays" || next === "last" ? -1 : 1);
		}
	}
	function exportCsv() {
		const header = [
			t.colArtist,
			t.colTitle,
			t.colGenre,
			t.colBpm,
			t.colKey,
			t.colTime,
			t.colPlays,
			t.colLast
		];
		const body = rows.map((track) => [
			track.artist,
			track.remix ? `${track.title} (${track.remix})` : track.title,
			track.genreLabel,
			formatBpm(track.bpm),
			track.camelot ? track.keyLabel : track.musicalKey ?? "",
			formatDuration(track.durationSeconds),
			String(track.playCount),
			formatStamp(track.lastHistoryAt ?? track.lastPlay, locale)
		]);
		downloadText("kabina-library.csv", toCsv([header, ...body]), "text/csv");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageIntro, {
			title: t.navLibrary,
			lead: t.libraryLead
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
					children: t.genre
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectField, {
					value: genre,
					onChange: (event) => setGenre(event.target.value),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "",
						children: t.anyGenre
					}), data.genres.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: item,
						children: item
					}, item))]
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mb-1 block text-sm text-muted",
					children: t.key
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectField, {
					value: data.keys.includes(key) ? key : "",
					onChange: (event) => setKey(event.target.value),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "",
						children: t.anyKey
					}), data.keys.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: item,
						children: item
					}, item))]
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mb-1 block text-sm text-muted",
					children: t.bpmFrom
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					inputMode: "decimal",
					value: bpmFrom,
					onChange: (event) => setBpmFrom(event.target.value)
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mb-1 block text-sm text-muted",
					children: t.bpmTo
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					inputMode: "decimal",
					value: bpmTo,
					onChange: (event) => setBpmTo(event.target.value)
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "flex min-h-11 items-end gap-3 pb-2 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "checkbox",
						checked: playedOnly,
						onChange: (event) => setPlayedOnly(event.target.checked)
					}), t.playedOnly]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-end",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: exportCsv,
						children: t.exportCsv
					})
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-4 text-sm text-muted",
			children: [
				t.results,
				": ",
				visible.length === 0 ? 0 : safePage * pageSize + 1,
				"–",
				safePage * pageSize + visible.length,
				" / ",
				rows.length
			]
		}),
		visible.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-6 text-sm text-muted",
			children: t.noTracks
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-3 space-y-3 md:hidden",
			children: visible.map((track) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "rounded-lg bg-elevated p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate font-medium",
							children: track.remix ? `${track.title} (${track.remix})` : track.title
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-sm text-muted",
							children: track.artist || "—"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: () => toggleCrate(track.id),
						children: crateIds.includes(track.id) ? t.inCrate : t.addCrate
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-muted",
					children: [
						columns.genre ? track.genreLabel : "",
						columns.bpm ? formatBpm(track.bpm) : "",
						columns.key ? track.camelot ? track.keyLabel : track.musicalKey || "—" : "",
						columns.duration ? formatDuration(track.durationSeconds) : "",
						columns.plays ? String(track.playCount) : ""
					].filter(Boolean).join(" · ")
				})]
			}, track.id))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-3 hidden overflow-x-auto md:block",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full min-w-[720px] border-separate border-spacing-0 text-left text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "sticky top-0 bg-bg",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "text-muted",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
								onClick: () => sortBy("artist"),
								children: t.colArtist
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
								onClick: () => sortBy("title"),
								children: t.colTitle
							}),
							columns.genre ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
								onClick: () => sortBy("genre"),
								children: t.colGenre
							}) : null,
							columns.bpm ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
								onClick: () => sortBy("bpm"),
								children: t.colBpm
							}) : null,
							columns.key ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
								onClick: () => sortBy("key"),
								children: t.colKey
							}) : null,
							columns.duration ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-2 py-2 font-medium",
								children: t.colTime
							}) : null,
							columns.plays ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
								onClick: () => sortBy("plays"),
								title: t.playsHint,
								children: t.colPlays
							}) : null,
							columns.last ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Th, {
								onClick: () => sortBy("last"),
								children: t.colLast
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "px-2 py-2 font-medium" })
						]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: visible.map((track) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-t border-line",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "max-w-40 truncate border-t border-line px-2 py-3",
							children: track.artist || "—"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "max-w-56 truncate border-t border-line px-2 py-3",
							children: track.remix ? `${track.title} (${track.remix})` : track.title
						}),
						columns.genre ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "border-t border-line px-2 py-3 text-muted",
							children: track.genreLabel || "—"
						}) : null,
						columns.bpm ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "border-t border-line px-2 py-3 tabular-nums",
							children: formatBpm(track.bpm)
						}) : null,
						columns.key ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "border-t border-line px-2 py-3",
							children: track.camelot ? track.keyLabel : track.musicalKey || "—"
						}) : null,
						columns.duration ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "border-t border-line px-2 py-3 tabular-nums",
							children: formatDuration(track.durationSeconds)
						}) : null,
						columns.plays ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "border-t border-line px-2 py-3 tabular-nums",
							title: String(track.historyPlays),
							children: track.playCount
						}) : null,
						columns.last ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "border-t border-line px-2 py-3 text-muted",
							children: formatStamp(track.lastHistoryAt ?? track.lastPlay, locale)
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "border-t border-line px-2 py-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								onClick: () => toggleCrate(track.id),
								children: crateIds.includes(track.id) ? t.inCrate : t.addCrate
							})
						})
					]
				}, track.id)) })]
			})
		}),
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
function Th({ children, onClick, title }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
		className: "px-2 py-2 font-medium",
		title,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			className: "text-left text-muted",
			onClick,
			children
		})
	});
}
//#endregion
export { LibraryPage as component };

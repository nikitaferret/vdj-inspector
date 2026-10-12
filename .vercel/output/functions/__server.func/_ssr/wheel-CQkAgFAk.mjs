import { i as __toESM } from "../_runtime.mjs";
import { J as require_react, S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { A as compatibleKeys, N as secondaryKey, S as formatBpm, c as useSettings, g as PageIntro, i as useI18n, j as formatKey, m as Field, o as useDerived, p as Button, r as relationLabel } from "./router-BFBNLgf_.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/wheel-CQkAgFAk.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function point(radius, angle) {
	return [50 + Math.cos(angle) * radius, 50 + Math.sin(angle) * radius];
}
function slice(inner, outer, start, end) {
	const large = end - start > Math.PI ? 1 : 0;
	const [x0, y0] = point(outer, start);
	const [x1, y1] = point(outer, end);
	const [x2, y2] = point(inner, end);
	const [x3, y3] = point(inner, start);
	return `M ${x0} ${y0} A ${outer} ${outer} 0 ${large} 1 ${x1} ${y1} L ${x2} ${y2} A ${inner} ${inner} 0 ${large} 0 ${x3} ${y3} Z`;
}
function centerAngle(n, anchor) {
	return (anchor === "clock" ? n % 12 / 12 : (n - 1) / 12) * Math.PI * 2 - Math.PI / 2;
}
function HarmonicWheel({ counts, selected, anchor, keySystem, preferFlats, compat, onSelect }) {
	const tunables = {
		keySystem,
		preferFlats
	};
	const allowed = new Set(selected ? compatibleKeys(selected, compat).map((item) => item.code) : []);
	const half = Math.PI / 12 - .035;
	const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 100 100",
		className: "mx-auto w-full max-w-md",
		role: "group",
		children: [
			Array.from({ length: 12 }, (_, index) => {
				const n = index + 1;
				const angle = centerAngle(n, anchor);
				return [{
					code: `${n}B`,
					inner: 32.5,
					outer: 46,
					labelR: 39.2
				}, {
					code: `${n}A`,
					inner: 17.5,
					outer: 31.5,
					labelR: 24.5
				}].map((ring) => {
					const on = ring.code === selected;
					const near = !on && allowed.has(ring.code);
					const count = counts[ring.code] ?? 0;
					const [lx, ly] = point(ring.labelR, angle);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", {
						role: "button",
						tabIndex: 0,
						"aria-pressed": on,
						"aria-label": `${ring.code} ${formatKey(ring.code, tunables)} ${count}`,
						onClick: () => onSelect(ring.code),
						onKeyDown: (event) => {
							if (event.key === "Enter" || event.key === " ") {
								event.preventDefault();
								onSelect(ring.code);
							}
						},
						className: "cursor-pointer outline-none",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
								d: slice(ring.inner, ring.outer, angle - half, angle + half),
								className: on ? "fill-accent" : near ? "fill-accent/35" : "fill-subtle"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
								x: lx,
								y: ly - 1.1,
								textAnchor: "middle",
								className: on ? "fill-accent-fg" : "fill-fg",
								fontSize: "3.15",
								children: ring.code
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
								x: lx,
								y: ly + 2.15,
								textAnchor: "middle",
								className: on ? "fill-accent-fg" : "fill-muted",
								fontSize: "2.15",
								children: count
							})
						]
					}, ring.code);
				});
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "50",
				cy: "50",
				r: "14.5",
				className: "fill-bg"
			}),
			selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
				x: "50",
				y: "48",
				textAnchor: "middle",
				className: "fill-fg",
				fontSize: "5.2",
				children: formatKey(selected, tunables)
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
				x: "50",
				y: "55",
				textAnchor: "middle",
				className: "fill-muted",
				fontSize: "2.8",
				children: secondaryKey(selected, tunables)
			})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
				x: "50",
				y: "52",
				textAnchor: "middle",
				className: "fill-fg",
				fontSize: "6",
				children: total
			})
		]
	});
}
function WheelPage() {
	const { t } = useI18n();
	const data = useDerived();
	const tunables = useSettings((state) => state.tunables);
	const crateIds = useSettings((state) => state.crateIds);
	const toggleCrate = useSettings((state) => state.toggleCrate);
	const [selected, setSelected] = (0, import_react.useState)(null);
	const [query, setQuery] = (0, import_react.useState)("");
	const relations = (0, import_react.useMemo)(() => {
		if (!selected) return /* @__PURE__ */ new Map();
		return new Map(compatibleKeys(selected, tunables.compat).map((item) => [item.code, item.rel]));
	}, [selected, tunables.compat]);
	const rows = (0, import_react.useMemo)(() => {
		const q = query.trim().toLowerCase();
		return data.tracks.filter((track) => {
			if (tunables.wheelRequireKey && !track.camelot) return false;
			if (track.playCount < tunables.wheelMinPlays) return false;
			if (selected && (!track.camelot || !relations.has(track.camelot))) return false;
			if (!q) return true;
			return `${track.artist} ${track.title}`.toLowerCase().includes(q);
		}).sort((a, b) => (a.bpm ?? 0) - (b.bpm ?? 0));
	}, [
		data.tracks,
		query,
		relations,
		selected,
		tunables.wheelMinPlays,
		tunables.wheelRequireKey
	]);
	const active = [
		tunables.compat.same ? t.relSame : "",
		tunables.compat.adjacent ? t.relAdjacent : "",
		tunables.compat.relative ? t.relRelative : "",
		tunables.compat.twoSteps ? t.relTwo : "",
		tunables.compat.diagonal ? t.relDiagonal : ""
	].filter(Boolean).join(" · ");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageIntro, {
			title: t.navWheel,
			lead: t.wheelLead
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mb-4 text-sm text-muted",
			children: [
				active || "—",
				" · play count ≥ ",
				tunables.wheelMinPlays,
				tunables.foldBpm ? ` · BPM ${tunables.bpmFloor}–${tunables.bpmCeil}` : ""
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid items-start gap-4 lg:grid-cols-[minmax(0,28rem)_1fr]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg bg-elevated p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HarmonicWheel, {
						counts: data.keyCounts,
						selected,
						anchor: tunables.wheelAnchor,
						keySystem: tunables.keySystem,
						preferFlats: tunables.preferFlats,
						compat: tunables.compat,
						onSelect: (code) => setSelected((current) => current === code ? current : code)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex flex-wrap gap-3 text-xs text-muted",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "inline-flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "inline-block size-3 rounded-sm bg-accent" }), t.legendOn]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "inline-flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "inline-block size-3 rounded-sm bg-accent/35" }), t.legendNear]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "inline-flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "inline-block size-3 rounded-sm bg-subtle" }), t.legendOff]
							})
						]
					}),
					selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "mt-3",
						onClick: () => setSelected(null),
						children: t.clearKey
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-muted",
						children: t.wheelHint
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mb-1 block text-sm text-muted",
					children: t.wheelSearch
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					value: query,
					onChange: (event) => setQuery(event.target.value)
				})] }),
				rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-sm text-muted",
					children: selected ? t.wheelEmpty : t.wheelHint
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-3 space-y-2",
					children: rows.slice(0, 80).map((track) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center justify-between gap-3 rounded-lg bg-elevated p-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate font-medium",
								children: track.title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "truncate text-sm text-muted",
								children: [
									track.artist || "—",
									" · ",
									formatBpm(track.bpm),
									" · ",
									track.keyLabel,
									track.camelot && relations.get(track.camelot) ? ` · ${relationLabel(t, relations.get(track.camelot) ?? null)}` : ""
								]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: () => toggleCrate(track.id),
							children: crateIds.includes(track.id) ? t.inCrate : t.addCrate
						})]
					}, track.id))
				})
			] })]
		})
	] });
}
//#endregion
export { WheelPage as component };

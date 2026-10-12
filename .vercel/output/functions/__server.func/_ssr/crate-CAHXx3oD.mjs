import { i as __toESM } from "../_runtime.mjs";
import { J as require_react, S as require_jsx_runtime, b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { S as formatBpm, c as useSettings, g as PageIntro, i as useI18n, k as toM3u, m as Field, o as useDerived, p as Button, x as downloadText } from "./router-BFBNLgf_.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/crate-CAHXx3oD.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CratePage() {
	const { t } = useI18n();
	const data = useDerived();
	const crateIds = useSettings((state) => state.crateIds);
	const crateName = useSettings((state) => state.crateName);
	const renameCrate = useSettings((state) => state.renameCrate);
	const clearCrate = useSettings((state) => state.clearCrate);
	const moveCrate = useSettings((state) => state.moveCrate);
	const toggleCrate = useSettings((state) => state.toggleCrate);
	const [name, setName] = (0, import_react.useState)(crateName);
	(0, import_react.useEffect)(() => {
		setName(crateName);
	}, [crateName]);
	const byId = new Map(data.tracks.map((track) => [track.id, track]));
	const rows = crateIds.flatMap((id) => {
		const track = byId.get(id);
		return track ? [track] : [];
	});
	const title = crateName.trim() || t.crateDefault;
	function exportTxt() {
		const lines = rows.map((track) => `${track.artist} - ${track.title} | ${formatBpm(track.bpm)} | ${track.keyLabel}`);
		downloadText(`${title}.txt`, lines.join("\n"));
	}
	function exportM3u() {
		downloadText(`${title}.m3u`, toM3u(rows.map((track) => ({
			artist: track.artist,
			title: track.title,
			seconds: track.durationSeconds,
			filePath: track.filePath
		}))), "audio/x-mpegurl");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageIntro, {
			title: t.navCrate,
			lead: t.crateLead
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			className: "mb-4 flex flex-col gap-3 sm:flex-row",
			onSubmit: (event) => {
				event.preventDefault();
				renameCrate(name);
			},
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mb-1 block text-sm text-muted",
					children: t.navCrate
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					value: name,
					onChange: (event) => setName(event.target.value),
					placeholder: t.crateDefault
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex items-end",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					children: t.saveProfile
				})
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4 flex flex-wrap gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: exportTxt,
					disabled: rows.length === 0,
					children: t.exportTxt
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: exportM3u,
					disabled: rows.length === 0,
					children: t.exportM3u
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: clearCrate,
					disabled: crateIds.length === 0,
					children: t.clearCrate
				})
			]
		}),
		rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "text-sm text-muted",
			children: [
				crateIds.length > 0 ? t.crateMissing : t.crateEmpty,
				" ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/library",
					className: "text-fg underline-offset-4 hover:underline",
					children: t.browseLibrary
				})
			]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
			className: "space-y-2",
			children: rows.map((track, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
				className: "rounded-lg bg-elevated p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs tabular-nums text-faint",
								children: index + 1
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate font-medium",
								children: track.title
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "truncate text-sm text-muted",
								children: [
									track.artist || "—",
									" · ",
									formatBpm(track.bpm),
									" · ",
									track.keyLabel
								]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								onClick: () => moveCrate(track.id, -1),
								disabled: index === 0,
								children: t.moveUp
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								onClick: () => moveCrate(track.id, 1),
								disabled: index === rows.length - 1,
								children: t.moveDown
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								onClick: () => toggleCrate(track.id),
								children: t.remove
							})
						]
					})]
				})
			}, track.id))
		})
	] });
}
//#endregion
export { CratePage as component };

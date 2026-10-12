import { i as __toESM } from "../_runtime.mjs";
import { J as require_react, S as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as profileLabel, b as Toggle, c as useSettings, d as displayGenre, f as parseGenreMap, g as PageIntro, i as useI18n, l as BUILTIN_PROFILES, m as Field, p as Button, s as useLibrary, u as clampTunables, v as Panel, x as downloadText } from "./router-BFBNLgf_.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-DPHOi7YS.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SettingsPage() {
	const { t, locale } = useI18n();
	const tunables = useSettings((state) => state.tunables);
	const columns = useSettings((state) => state.columns);
	const widgets = useSettings((state) => state.widgets);
	const profiles = useSettings((state) => state.profiles);
	const profileRef = useSettings((state) => state.profileRef);
	const patchTunables = useSettings((state) => state.patchTunables);
	const applyTunables = useSettings((state) => state.applyTunables);
	const saveProfile = useSettings((state) => state.saveProfile);
	const deleteProfile = useSettings((state) => state.deleteProfile);
	const toggleColumn = useSettings((state) => state.toggleColumn);
	const toggleWidget = useSettings((state) => state.toggleWidget);
	const setLocale = useSettings((state) => state.setLocale);
	const origin = useLibrary((state) => state.origin);
	const libraryFile = useLibrary((state) => state.libraryFile);
	const historyFile = useLibrary((state) => state.historyFile);
	const resetDemo = useLibrary((state) => state.resetDemo);
	const tracks = useLibrary((state) => state.tracks);
	const [profileName, setProfileName] = (0, import_react.useState)("");
	const [note, setNote] = (0, import_react.useState)("");
	const [armed, setArmed] = (0, import_react.useState)(false);
	const active = profileLabel(profileRef, profiles, locale, t.customRules);
	const collapsed = (0, import_react.useMemo)(() => {
		const rules = parseGenreMap(tunables.genreMap);
		const map = /* @__PURE__ */ new Map();
		for (const track of tracks) {
			if (!track.genre) continue;
			const next = displayGenre(track.genre, rules);
			if (next === track.genre) continue;
			const key = `${track.genre} → ${next}`;
			map.set(key, (map.get(key) ?? 0) + 1);
		}
		return [...map.entries()];
	}, [tracks, tunables.genreMap]);
	function downloadProfile() {
		downloadText("kabina-profile.json", JSON.stringify({
			version: 1,
			name: active,
			tunables
		}, null, 2), "application/json");
	}
	async function onProfileFile(file) {
		try {
			const parsed = JSON.parse(await file.text());
			const next = clampTunables(parsed.tunables, tunables);
			const name = typeof parsed.name === "string" && parsed.name.trim() ? parsed.name.trim().slice(0, 40) : "JSON";
			applyTunables(next, { kind: "custom" });
			saveProfile(name);
			setNote(t.profileImported);
		} catch {
			setNote(t.profileInvalid);
		}
	}
	const columnKeys = [
		{
			key: "genre",
			label: t.colGenre
		},
		{
			key: "bpm",
			label: t.colBpm
		},
		{
			key: "key",
			label: t.colKey
		},
		{
			key: "duration",
			label: t.colTime
		},
		{
			key: "plays",
			label: t.colPlays
		},
		{
			key: "last",
			label: t.colLast
		}
	];
	const widgetKeys = [
		{
			key: "monthly",
			label: t.monthly
		},
		{
			key: "artists",
			label: t.topArtists
		},
		{
			key: "hourly",
			label: t.hourly
		},
		{
			key: "recent",
			label: t.recentSessions
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageIntro, {
			title: t.navSettings,
			lead: t.settingsLead
		}),
		note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-4 rounded-lg bg-elevated px-4 py-3 text-sm",
			children: note
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-medium text-muted",
					children: t.language
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: locale === "ru" ? "primary" : "ghost",
						onClick: () => setLocale("ru"),
						children: "Русский"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: locale === "en" ? "primary" : "ghost",
						onClick: () => setLocale("en"),
						children: "English"
					})]
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "text-sm font-medium text-muted",
						children: [
							t.profiles,
							": ",
							active
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: BUILTIN_PROFILES.map((profile) => {
							const on = profileRef.kind === "builtin" && profileRef.id === profile.id;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: on ? "primary" : "ghost",
								onClick: () => applyTunables(profile.tunables, {
									kind: "builtin",
									id: profile.id
								}),
								children: profile.name[locale]
							}, profile.id);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "mt-4 flex flex-col gap-3 sm:flex-row",
						onSubmit: (event) => {
							event.preventDefault();
							if (!profileName.trim()) return;
							saveProfile(profileName);
							setProfileName("");
							setNote(t.profileSaved);
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							value: profileName,
							placeholder: t.profileName,
							onChange: (event) => setProfileName(event.target.value)
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							variant: "primary",
							children: t.saveProfile
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted",
								children: t.yourProfiles
							}),
							profiles.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-faint",
								children: t.noProfiles
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-2 space-y-2",
								children: profiles.map((profile) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex flex-wrap items-center justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-sm",
										children: profile.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											onClick: () => applyTunables(profile.tunables, {
												kind: "user",
												id: profile.id
											}),
											children: t.apply
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											onClick: () => deleteProfile(profile.id),
											children: t.delete
										})]
									})]
								}, profile.id))
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							onClick: downloadProfile,
							children: t.exportProfile
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "inline-flex h-11 cursor-pointer items-center rounded-sm border border-line bg-elevated px-4 text-sm font-medium",
							children: [t.importProfile, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								className: "sr-only",
								type: "file",
								accept: "application/json,.json",
								onChange: (event) => {
									const file = event.target.files?.[0];
									event.target.value = "";
									if (file) onProfileFile(file);
								}
							})]
						})]
					})
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-medium text-muted",
						children: t.sectionHarmony
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
						className: "mt-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
								className: "text-sm",
								children: t.keySystem
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
								name: "key",
								checked: tunables.keySystem === "camelot",
								label: t.camelot,
								onChange: () => patchTunables({ keySystem: "camelot" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
								name: "key",
								checked: tunables.keySystem === "open",
								label: t.openKey,
								onChange: () => patchTunables({ keySystem: "open" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
								name: "key",
								checked: tunables.keySystem === "traditional",
								label: t.traditional,
								onChange: () => patchTunables({ keySystem: "traditional" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
								checked: tunables.preferFlats,
								onChange: (preferFlats) => patchTunables({ preferFlats }),
								label: t.preferFlats
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("fieldset", {
						className: "mt-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
								className: "text-sm",
								children: t.anchor
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
								name: "anchor",
								checked: tunables.wheelAnchor === "clock",
								label: t.anchorClock,
								onChange: () => patchTunables({ wheelAnchor: "clock" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
								name: "anchor",
								checked: tunables.wheelAnchor === "one",
								label: t.anchorOne,
								onChange: () => patchTunables({ wheelAnchor: "one" })
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
								checked: tunables.compat.same,
								onChange: (same) => patchTunables({ compat: {
									...tunables.compat,
									same
								} }),
								label: t.sameKey
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
								checked: tunables.compat.adjacent,
								onChange: (adjacent) => patchTunables({ compat: {
									...tunables.compat,
									adjacent
								} }),
								label: t.adjacentKey
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
								checked: tunables.compat.relative,
								onChange: (relative) => patchTunables({ compat: {
									...tunables.compat,
									relative
								} }),
								label: t.relativeKey
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
								checked: tunables.compat.twoSteps,
								onChange: (twoSteps) => patchTunables({ compat: {
									...tunables.compat,
									twoSteps
								} }),
								label: t.twoKey
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
								checked: tunables.compat.diagonal,
								onChange: (diagonal) => patchTunables({ compat: {
									...tunables.compat,
									diagonal
								} }),
								label: t.diagonalKey
							})
						]
					})
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-medium text-muted",
						children: t.sectionBpm
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: t.bpmHelp
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
						name: "bpm",
						checked: tunables.bpmMode === "auto",
						label: t.bpmAuto,
						onChange: () => patchTunables({ bpmMode: "auto" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
						name: "bpm",
						checked: tunables.bpmMode === "period",
						label: t.bpmPeriod,
						onChange: () => patchTunables({ bpmMode: "period" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
						name: "bpm",
						checked: tunables.bpmMode === "direct",
						label: t.bpmDirect,
						onChange: () => patchTunables({ bpmMode: "direct" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
						checked: tunables.foldBpm,
						onChange: (foldBpm) => patchTunables({ foldBpm }),
						label: t.foldBpm
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 grid gap-3 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mb-1 block text-sm text-muted",
							children: t.floor
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							inputMode: "numeric",
							value: String(tunables.bpmFloor),
							onChange: (event) => patchTunables({ bpmFloor: Number(event.target.value) })
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mb-1 block text-sm text-muted",
							children: t.ceil
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							inputMode: "numeric",
							value: String(tunables.bpmCeil),
							onChange: (event) => patchTunables({ bpmCeil: Number(event.target.value) })
						})] })]
					})
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-medium text-muted",
						children: t.sectionMatch
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
						name: "match",
						checked: tunables.matchMode === "artist-title",
						label: t.matchPair,
						onChange: () => patchTunables({ matchMode: "artist-title" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
						name: "match",
						checked: tunables.matchMode === "title",
						label: t.matchTitle,
						onChange: () => patchTunables({ matchMode: "title" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Choice, {
						name: "match",
						checked: tunables.matchMode === "fuzzy",
						label: t.matchFuzzy,
						onChange: () => patchTunables({ matchMode: "fuzzy" })
					})
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-medium text-muted",
						children: t.sectionWheel
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "mt-3 block",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mb-1 block text-sm text-muted",
							children: t.minPlays
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							inputMode: "numeric",
							value: String(tunables.wheelMinPlays),
							onChange: (event) => patchTunables({ wheelMinPlays: Number(event.target.value) })
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
						checked: tunables.wheelRequireKey,
						onChange: (wheelRequireKey) => patchTunables({ wheelRequireKey }),
						label: t.requireKey
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "mt-3 block",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "mb-1 block text-sm text-muted",
							children: t.pageSize
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							className: "h-11 w-full rounded-sm border border-line bg-subtle px-3 text-sm",
							value: tunables.pageSize,
							onChange: (event) => patchTunables({ pageSize: Number(event.target.value) }),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: 25,
									children: "25"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: 50,
									children: "50"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: 100,
									children: "100"
								})
							]
						})]
					})
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-medium text-muted",
					children: t.sectionDash
				}), widgetKeys.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
					checked: widgets[item.key],
					onChange: () => toggleWidget(item.key),
					label: item.label
				}, item.key))] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-medium text-muted",
					children: t.sectionColumns
				}), columnKeys.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
					checked: columns[item.key],
					onChange: () => toggleColumn(item.key),
					label: item.label
				}, item.key))] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-medium text-muted",
						children: t.sectionGenre
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: t.genreHelp
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						className: "mt-3 min-h-36 w-full rounded-sm border border-line bg-subtle p-3 font-mono text-sm",
						value: tunables.genreMap,
						onChange: (event) => patchTunables({ genreMap: event.target.value })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm text-muted",
						children: t.genrePreview
					}),
					collapsed.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-faint",
						children: t.genreNone
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-2 space-y-1 text-sm",
						children: collapsed.map(([label, count]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
							label,
							" · ",
							count
						] }, label))
					})
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-sm font-medium text-muted",
						children: t.sectionData
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted",
						children: origin === "demo" ? t.dataIsDemo : t.dataIsUser
					}),
					origin === "user" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-sm",
						children: [
							libraryFile || "—",
							" · ",
							historyFile || "—"
						]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex flex-wrap gap-2",
						children: [
							origin === "user" && !armed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								onClick: () => setArmed(true),
								children: t.clearData
							}) : null,
							origin === "user" && armed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "primary",
								onClick: () => {
									resetDemo();
									setArmed(false);
								},
								children: t.clearSure
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								onClick: () => setArmed(false),
								children: t.cancel
							})] }) : null,
							origin === "demo" ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								onClick: resetDemo,
								children: t.restoreDemo
							})
						]
					})
				] })
			]
		})
	] });
}
function Choice({ name, checked, label, onChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "flex min-h-11 items-center gap-3 text-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			type: "radio",
			name,
			checked,
			onChange
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label })]
	});
}
//#endregion
export { SettingsPage as component };

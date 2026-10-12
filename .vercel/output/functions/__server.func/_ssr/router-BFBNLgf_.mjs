import { i as __toESM } from "../_runtime.mjs";
import { J as require_react, S as require_jsx_runtime, _ as lazyRouteComponent, b as Link, d as Scripts, f as HeadContent, g as Outlet, h as createRouter, p as useRouterState, v as createFileRoute, x as useRouter, y as createRootRoute } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as ListMusic, c as History, i as Music2, l as Ellipsis, n as TriangleAlert, o as Library, r as Settings2, s as LayoutDashboard, t as Upload, u as Disc3 } from "../_libs/lucide-react.mjs";
import { a as union, i as string, n as number, r as object, t as literal } from "../_libs/zod.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-BFBNLgf_.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";
function errorMessage(error) {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === "string" && error) return error;
	return FALLBACK_MESSAGE;
}
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: errorMessage(error)
			})
		]
	});
}
/**
* Path-based preview hosts serve the dev server under `/{port_id}/` and strip
* that prefix before forwarding, so SSR sees `/` while the browser URL keeps the
* prefix. TanStack Start resets `basepath` on hydration, so a `rewrite` keeps
* client routing and generated links aligned with the public URL.
*/
var PATH_BASED_PREVIEW_HOSTS = /* @__PURE__ */ new Set([
	"preview.grok.genai.mil",
	"preview.grok.mil",
	"preview.grokgsac.com"
]);
var PORT_ID_PREFIX = /^\/hds-[a-z0-9]+-\d+-[a-z0-9]+(?=\/|$)/i;
function previewPathPrefix(hostname, pathname) {
	if (!PATH_BASED_PREVIEW_HOSTS.has(hostname.toLowerCase())) return void 0;
	return PORT_ID_PREFIX.exec(pathname)?.[0];
}
function prefixRewrite(prefix) {
	return {
		input: ({ url }) => {
			if (url.pathname === prefix) url.pathname = "/";
			else if (url.pathname.startsWith(`${prefix}/`)) url.pathname = url.pathname.slice(prefix.length);
			return url;
		},
		output: ({ url }) => {
			url.pathname = `${prefix}${url.pathname}`;
			return url;
		}
	};
}
function previewPathRewrite() {
	if (typeof window === "undefined") return void 0;
	const prefix = previewPathPrefix(window.location.hostname, window.location.pathname);
	return prefix ? prefixRewrite(prefix) : void 0;
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
var CONNECTOR_TOKEN_READY_EVENT = "grok:connector-token-ready";
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
var ConnectorTokenReadySchema = EnvelopeSchema.extend({ type: literal("connector-token-ready") });
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Origin of the Grok embedder framing this page, or null when the page runs
* top-level (download/export, local `npm run dev`, deployed sites) or under a
* non-Grok parent. Client-only; null during SSR.
*/
function resolveCurrentEmbedderOrigin() {
	if (typeof window === "undefined") return null;
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	return resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	const parentOrigin = resolveCurrentEmbedderOrigin();
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onHello = (data) => {
		if (!HelloSchema.safeParse(data).success) return;
		announce();
	};
	const onNavigate = (data) => {
		const parsed = NavigateSchema.safeParse(data);
		if (!parsed.success) return;
		navigate(parsed.data.path);
		queueMicrotask(reportLocation);
	};
	const onHistory = (data) => {
		const parsed = HistorySchema.safeParse(data);
		if (!parsed.success) return;
		if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
		window.history.go(parsed.data.delta);
	};
	const onConnectorTokenReady = (data) => {
		if (!ConnectorTokenReadySchema.safeParse(data).success) return;
		window.dispatchEvent(new Event(CONNECTOR_TOKEN_READY_EVENT));
	};
	const hostMessageHandlers = /* @__PURE__ */ new Map([
		["hello", onHello],
		["navigate", onNavigate],
		["history", onHistory],
		["connector-token-ready", onConnectorTokenReady]
	]);
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		hostMessageHandlers.get(envelope.data.type)?.(event.data);
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
var CAMELOT_NAMES = {
	"1A": {
		sharp: "G#m",
		flat: "Abm"
	},
	"2A": {
		sharp: "D#m",
		flat: "Ebm"
	},
	"3A": {
		sharp: "A#m",
		flat: "Bbm"
	},
	"4A": {
		sharp: "Fm",
		flat: "Fm"
	},
	"5A": {
		sharp: "Cm",
		flat: "Cm"
	},
	"6A": {
		sharp: "Gm",
		flat: "Gm"
	},
	"7A": {
		sharp: "Dm",
		flat: "Dm"
	},
	"8A": {
		sharp: "Am",
		flat: "Am"
	},
	"9A": {
		sharp: "Em",
		flat: "Em"
	},
	"10A": {
		sharp: "Bm",
		flat: "Bm"
	},
	"11A": {
		sharp: "F#m",
		flat: "Gbm"
	},
	"12A": {
		sharp: "C#m",
		flat: "Dbm"
	},
	"1B": {
		sharp: "B",
		flat: "Cb"
	},
	"2B": {
		sharp: "F#",
		flat: "Gb"
	},
	"3B": {
		sharp: "C#",
		flat: "Db"
	},
	"4B": {
		sharp: "G#",
		flat: "Ab"
	},
	"5B": {
		sharp: "D#",
		flat: "Eb"
	},
	"6B": {
		sharp: "A#",
		flat: "Bb"
	},
	"7B": {
		sharp: "F",
		flat: "F"
	},
	"8B": {
		sharp: "C",
		flat: "C"
	},
	"9B": {
		sharp: "G",
		flat: "G"
	},
	"10B": {
		sharp: "D",
		flat: "D"
	},
	"11B": {
		sharp: "A",
		flat: "A"
	},
	"12B": {
		sharp: "E",
		flat: "E"
	}
};
Object.keys(CAMELOT_NAMES);
function normalizeSpelling(raw) {
	let s = raw.trim().toLowerCase().replace(/♭/g, "b").replace(/♯/g, "#").replace(/\s+/g, "");
	s = s.replace(/sharp/g, "#").replace(/flat/g, "b");
	s = s.replace(/minor|min|moll/g, "m").replace(/major|maj|dur/g, "");
	return s;
}
var TRAD = {};
for (const [code, names] of Object.entries(CAMELOT_NAMES)) {
	TRAD[normalizeSpelling(names.sharp)] = code;
	TRAD[normalizeSpelling(names.flat)] = code;
}
function toCamelot(raw) {
	if (!raw) return null;
	const compact = raw.trim().toLowerCase().replace(/♭/g, "b").replace(/♯/g, "#").replace(/\s+/g, "");
	const camelot = compact.match(/^(\d{1,2})([ab])$/);
	if (camelot) {
		const n = Number(camelot[1]);
		if (n >= 1 && n <= 12) return `${n}${camelot[2].toUpperCase()}`;
	}
	const open = compact.match(/^(\d{1,2})([md])$/);
	if (open) {
		const n = Number(open[1]);
		if (n >= 1 && n <= 12) return `${n}${open[2] === "m" ? "A" : "B"}`;
	}
	return TRAD[normalizeSpelling(raw)] ?? null;
}
function formatKey(camelot, tunables) {
	if (!camelot || !CAMELOT_NAMES[camelot]) return "—";
	if (tunables.keySystem === "camelot") return camelot;
	if (tunables.keySystem === "open") return `${camelot.slice(0, -1)}${camelot.endsWith("A") ? "m" : "d"}`;
	const names = CAMELOT_NAMES[camelot];
	return tunables.preferFlats ? names.flat : names.sharp;
}
function secondaryKey(camelot, tunables) {
	if (!camelot || !CAMELOT_NAMES[camelot]) return "";
	if (tunables.keySystem === "camelot") return tunables.preferFlats ? CAMELOT_NAMES[camelot].flat : CAMELOT_NAMES[camelot].sharp;
	return camelot;
}
function wrap(n) {
	return (n - 1 + 12) % 12 + 1;
}
var RANK = {
	same: 0,
	adjacent: 1,
	relative: 2,
	two: 3,
	diagonal: 4
};
function compatibleKeys(code, rules) {
	if (!CAMELOT_NAMES[code]) return [];
	const n = Number(code.slice(0, -1));
	const mode = code.slice(-1);
	const other = mode === "A" ? "B" : "A";
	const found = [];
	const push = (next, rel) => {
		if (!CAMELOT_NAMES[next]) return;
		const prev = found.find((item) => item.code === next);
		if (!prev) found.push({
			code: next,
			rel
		});
		else if (RANK[rel] < RANK[prev.rel]) prev.rel = rel;
	};
	if (rules.same) push(code, "same");
	if (rules.adjacent) {
		push(`${wrap(n - 1)}${mode}`, "adjacent");
		push(`${wrap(n + 1)}${mode}`, "adjacent");
	}
	if (rules.relative) push(`${n}${other}`, "relative");
	if (rules.twoSteps) {
		push(`${wrap(n - 2)}${mode}`, "two");
		push(`${wrap(n + 2)}${mode}`, "two");
	}
	if (rules.diagonal) {
		push(`${wrap(n - 1)}${other}`, "diagonal");
		push(`${wrap(n + 1)}${other}`, "diagonal");
	}
	return found;
}
function relationBetween(from, to, rules) {
	if (!from || !to) return null;
	const hit = compatibleKeys(from, rules).find((item) => item.code === to);
	return hit ? hit.rel : "jump";
}
var ParseError = class extends Error {
	code;
	constructor(code) {
		super(code);
		this.code = code;
	}
};
function hash(value) {
	let h = 2166136261;
	for (let i = 0; i < value.length; i += 1) {
		h ^= value.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	return (h >>> 0).toString(36);
}
var XML_AMP = "&amp;";
var XML_QUOT = "&quot;";
var XML_APOS = "&apos;";
var XML_LT = "&lt;";
var XML_GT = "&gt;";
function decodeXml(value) {
	return value.split(XML_QUOT).join("\"").split(XML_APOS).join("'").split(XML_LT).join("<").split(XML_GT).join(">").split(XML_AMP).join("&");
}
function readAttrs(source) {
	const out = {};
	const re = /([A-Za-z_][\w:.-]*)\s*=\s*"([^"]*)"/g;
	let match;
	while (match = re.exec(source)) out[match[1]] = decodeXml(match[2]);
	return out;
}
function blockAttrs(inner, tag) {
	const re = new RegExp(`<${tag}\\b([^>]*)\\/?>`, "i");
	const match = inner.match(re);
	return match ? readAttrs(match[1]) : {};
}
function num$1(value) {
	if (value == null || value.trim() === "") return null;
	const n = Number(value);
	return Number.isFinite(n) ? n : null;
}
function text(value) {
	const next = value?.trim() ?? "";
	return next ? next : null;
}
function unixToIso(value) {
	const seconds = num$1(value);
	if (seconds == null || seconds <= 0) return null;
	const date = /* @__PURE__ */ new Date(seconds * 1e3);
	return Number.isNaN(date.getTime()) ? null : date.toISOString();
}
function fromPath(filePath) {
	const name = (filePath.split(/[/\\]/).pop() ?? "").replace(/\.[^.]+$/, "");
	const splitAt = name.indexOf(" - ");
	if (splitAt === -1) return {
		artist: "",
		title: name.trim()
	};
	return {
		artist: name.slice(0, splitAt).trim(),
		title: name.slice(splitAt + 3).trim()
	};
}
function parseDatabaseXml(xml) {
	const chunks = xml.replace(/^\uFEFF/, "").split(/<Song\b/i).slice(1);
	if (chunks.length === 0) throw new ParseError("no-songs");
	const tracks = [];
	const seen = /* @__PURE__ */ new Set();
	for (const chunk of chunks) {
		const openEnd = chunk.indexOf(">");
		if (openEnd === -1) continue;
		const open = chunk.slice(0, openEnd);
		const inner = chunk.slice(openEnd + 1).split(/<\/Song>/i)[0] ?? "";
		const song = readAttrs(open);
		const tags = blockAttrs(inner, "Tags");
		const infos = blockAttrs(inner, "Infos");
		const scan = blockAttrs(inner, "Scan");
		const filePath = text(song.FilePath);
		if (!filePath || seen.has(filePath)) continue;
		seen.add(filePath);
		const fallback = fromPath(filePath);
		const title = text(tags.Title) ?? fallback.title;
		const artist = text(tags.Author) ?? fallback.artist;
		if (!title) continue;
		const bpmRaw = num$1(scan.Bpm) ?? num$1(tags.Bpm);
		tracks.push({
			id: `t_${hash(filePath)}`,
			filePath,
			title,
			artist,
			remix: text(tags.Remix),
			genre: text(tags.Genre),
			year: num$1(tags.Year),
			bpmRaw,
			musicalKey: text(scan.Key) ?? text(tags.Key),
			durationSeconds: num$1(infos.SongLength),
			bitrate: num$1(infos.Bitrate),
			firstPlay: unixToIso(infos.FirstPlay),
			lastPlay: unixToIso(infos.LastPlay),
			playCount: Math.max(0, Math.round(num$1(infos.PlayCount) ?? 0))
		});
	}
	if (tracks.length === 0) throw new ParseError("no-songs");
	return tracks;
}
function pad(value) {
	return String(value).padStart(2, "0");
}
function stamp(year, month, day, hours, minutes) {
	return `${year}-${pad(month)}-${pad(day)}T${pad(hours)}:${pad(minutes)}:00`;
}
function nextDay(year, month, day) {
	if (day < [
		31,
		year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28,
		31,
		30,
		31,
		30,
		31,
		31,
		30,
		31,
		30,
		31
	][month - 1]) return {
		year,
		month,
		day: day + 1
	};
	if (month < 12) return {
		year,
		month: month + 1,
		day: 1
	};
	return {
		year: year + 1,
		month: 1,
		day: 1
	};
}
function splitArtistTitle(value) {
	const splitAt = value.indexOf(" - ");
	if (splitAt === -1) return {
		artist: "",
		title: value.trim()
	};
	return {
		artist: value.slice(0, splitAt).trim(),
		title: value.slice(splitAt + 3).trim()
	};
}
function parseHistory(content, sourceFile = "tracklist.txt") {
	const lines = content.replace(/^\uFEFF/, "").split(/\r?\n/);
	const sessions = [];
	const plays = [];
	let current = null;
	let cursor = null;
	let lastMinute = null;
	for (let lineNumber = 0; lineNumber < lines.length; lineNumber += 1) {
		const line = lines[lineNumber].trim();
		const header = line.match(/^VirtualDJ History\s+(\d{4})\/(\d{2})\/(\d{2})/i);
		if (header) {
			cursor = {
				year: Number(header[1]),
				month: Number(header[2]),
				day: Number(header[3])
			};
			lastMinute = null;
			current = {
				id: `s_${hash(`${sourceFile}:${lineNumber}`)}`,
				sessionDate: `${header[1]}-${header[2]}-${header[3]}`,
				startedAt: null,
				endedAt: null,
				sourceFile
			};
			sessions.push(current);
			continue;
		}
		if (!current || !cursor) continue;
		const session = current;
		const play = line.match(/^(\d{1,2}):(\d{2})\s*:\s*(.+)$/);
		if (!play) continue;
		const hours = Number(play[1]);
		const minutes = Number(play[2]);
		if (hours > 23 || minutes > 59) continue;
		const minuteOfDay = hours * 60 + minutes;
		if (lastMinute != null && minuteOfDay < lastMinute) cursor = nextDay(cursor.year, cursor.month, cursor.day);
		lastMinute = minuteOfDay;
		const playedAt = stamp(cursor.year, cursor.month, cursor.day, hours, minutes);
		const originalText = play[3].trim();
		const meta = splitArtistTitle(originalText);
		if (!meta.title) continue;
		const position = plays.filter((item) => item.sessionId === session.id).length;
		plays.push({
			id: `p_${hash(`${session.id}:${position}`)}`,
			sessionId: session.id,
			position,
			playedAt,
			artist: meta.artist,
			title: meta.title,
			originalText
		});
		current.startedAt ??= playedAt;
		current.endedAt = playedAt;
	}
	const used = new Set(plays.map((play) => play.sessionId));
	const kept = sessions.filter((session) => used.has(session.id));
	if (kept.length === 0) throw new ParseError("not-history");
	return {
		sessions: kept,
		plays
	};
}
function isLibraryText(text) {
	return /<VirtualDJ_Database\b/i.test(text) || /<Song\b/i.test(text) && /<Tags\b/i.test(text);
}
function isHistoryText(text) {
	return /VirtualDJ History\s+\d{4}\/\d{2}\/\d{2}/i.test(text);
}
var ARTISTS = [
	"Night Dock",
	"Solara",
	"Kite Museum",
	"Vera North",
	"Low Pressure",
	"Marrow",
	"Hotel Kids",
	"Pale Circuit",
	"Juniper Vale",
	"Static Garden",
	"Room Tone",
	"Cedar Line"
];
var TITLES = [
	"Glass Hour",
	"Second Dock",
	"Paper Lantern",
	"Slow Mercury",
	"North Service",
	"Soft Alarm",
	"Minor Weather",
	"Late Platform",
	"Ivory Engine",
	"Quiet Voltage",
	"Salt & Radio",
	"Open Window",
	"Third Shift",
	"Little Harbor",
	"Cold Chorus",
	"Faded Ticket",
	"Silver Routine",
	"Low Ceiling"
];
var GENRES = [
	"Deep House",
	"Tech House",
	"Progressive House",
	"Techno",
	"Disco",
	"Hip-Hop",
	"Pop",
	"Drum & Bass",
	"Dubstep",
	"Ambient"
];
function esc(value) {
	return value.split("&").join("&amp;").split("\"").join("&quot;").split("<").join("&lt;");
}
function codes() {
	const list = [];
	for (let n = 1; n <= 12; n += 1) list.push(`${n}A`, `${n}B`);
	return list;
}
function buildRows() {
	const wheel = codes();
	const rows = [];
	for (let i = 0; i < 36; i += 1) {
		const code = wheel[i % wheel.length];
		rows.push({
			artist: ARTISTS[i % ARTISTS.length],
			title: TITLES[i % TITLES.length],
			genre: GENRES[i % GENRES.length],
			key: i % 4 === 0 ? code : CAMELOT_NAMES[code].sharp,
			bpm: i % 7 === 0 ? 74 : 104 + i % 9 * 4,
			plays: i % 6 === 0 ? 0 : 2 + i % 11,
			remix: i % 9 === 0 ? "Club Mix" : "",
			year: 2016 + i % 10,
			duration: 176 + i * 13 % 210
		});
	}
	return rows;
}
function buildXml(rows) {
	const base = Math.floor(Date.UTC(2026, 8, 28) / 1e3);
	return `<?xml version="1.0" encoding="UTF-8"?>\n<VirtualDJ_Database Version="2024">\n${rows.map((row, index) => {
		const path = `C:\\Music\\${row.artist} - ${row.title}.mp3`;
		const period = (60 / row.bpm).toFixed(6);
		const first = base - (400 - index) * 86400;
		const last = base - index * 86400;
		return ` <Song FilePath="${esc(path)}" FileSize="${4e6 + index * 1e3}">
  <Tags Author="${esc(row.artist)}" Title="${esc(row.title)}" Genre="${esc(row.genre)}" Remix="${esc(row.remix)}" Year="${row.year}"/>
  <Infos SongLength="${row.duration}" FirstPlay="${first}" LastPlay="${last}" PlayCount="${row.plays}" Bitrate="320"/>
  <Scan Version="801" Bpm="${period}" Key="${esc(row.key)}"/>
 </Song>`;
	}).join("\n")}\n</VirtualDJ_Database>\n`;
}
var DATES = [
	"2025-11-08",
	"2025-12-20",
	"2026-02-14",
	"2026-04-04",
	"2026-07-18",
	"2026-09-27"
];
function buildHistory(rows) {
	return DATES.map((date, sessionIndex) => {
		const [year, month, day] = date.split("-");
		const lines = [`VirtualDJ History ${year}/${month}/${day}`, ""];
		let minutes = sessionIndex === 2 ? 1420 : 1325;
		for (let play = 0; play < 9; play += 1) {
			const guest = play === 8;
			const row = rows[(sessionIndex * 5 + play * 3) % rows.length];
			const label = guest ? `Guest - Unknown Cut ${sessionIndex + 1}` : `${row.artist} - ${row.title}`;
			const hour = Math.floor(minutes / 60) % 24;
			const minute = minutes % 60;
			lines.push(`${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")} : ${label}`);
			minutes += play % 2 === 0 ? 4 : 3;
		}
		lines.push("");
		return lines.join("\n");
	}).join("\n");
}
var ROWS = buildRows();
var SAMPLE_LIBRARY_XML = `<?xml version="1.0" encoding="UTF-8"?>
<VirtualDJ_Database Version="2024">
 <Song FilePath="C:\\Music\\Night Dock - Glass Hour.mp3" FileSize="8400000">
  <Tags Author="Night Dock" Title="Glass Hour" Genre="Deep House" Year="2024"/>
  <Infos SongLength="372" FirstPlay="1710000000" LastPlay="1750000000" PlayCount="6" Bitrate="320"/>
  <Scan Version="801" Bpm="0.491803" Key="Am"/>
 </Song>
 <Song FilePath="C:\\Music\\Solara - Paper Lantern.mp3" FileSize="7900000">
  <Tags Author="Solara" Title="Paper Lantern" Genre="Pop" Year="2023"/>
  <Infos SongLength="214" PlayCount="2" Bitrate="256"/>
  <Scan Bpm="0.508475" Key="8B"/>
 </Song>
</VirtualDJ_Database>
`;
var SAMPLE_HISTORY_TXT = `VirtualDJ History 2026/09/27

22:12 : Night Dock - Glass Hour
22:18 : Solara - Paper Lantern
22:23 : Guest - Unknown Cut
`;
function loadDemo() {
	const tracks = parseDatabaseXml(buildXml(ROWS));
	const history = parseHistory(buildHistory(ROWS), "demo-tracklist.txt");
	return {
		tracks,
		sessions: history.sessions,
		plays: history.plays
	};
}
var DEMO = loadDemo();
var MONTHS = {
	ru: [
		"янв",
		"фев",
		"мар",
		"апр",
		"мая",
		"июн",
		"июл",
		"авг",
		"сен",
		"окт",
		"ноя",
		"дек"
	],
	en: [
		"Jan",
		"Feb",
		"Mar",
		"Apr",
		"May",
		"Jun",
		"Jul",
		"Aug",
		"Sep",
		"Oct",
		"Nov",
		"Dec"
	]
};
function formatStamp(value, locale) {
	if (!value) return "—";
	const match = value.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/);
	if (!match) return value;
	const date = `${Number(match[3])} ${MONTHS[locale][Number(match[2]) - 1] ?? match[2]} ${match[1]}`;
	return match[4] ? `${date}, ${match[4]}:${match[5]}` : date;
}
function formatMonth(key, locale) {
	const match = key.match(/^(\d{4})-(\d{2})$/);
	if (!match) return key;
	return `${MONTHS[locale][Number(match[2]) - 1] ?? match[2]} ${match[1]}`;
}
function formatSpan(mins, locale) {
	if (mins == null) return "—";
	const hours = Math.floor(mins / 60);
	const minutes = mins % 60;
	if (locale === "ru") return hours > 0 ? `${hours} ч ${minutes} мин` : `${minutes} мин`;
	return hours > 0 ? `${hours} h ${minutes} min` : `${minutes} min`;
}
function formatDuration(seconds) {
	if (seconds == null || !Number.isFinite(seconds)) return "—";
	const total = Math.max(0, Math.round(seconds));
	return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}
function formatBpm(bpm) {
	if (bpm == null) return "—";
	return Number.isInteger(bpm) ? String(bpm) : bpm.toFixed(1);
}
function plural(locale, count, forms) {
	if (locale === "en") return `${count} ${count === 1 ? forms.one : forms.many}`;
	const mod10 = count % 10;
	const mod100 = count % 100;
	if (mod10 === 1 && mod100 !== 11) return `${count} ${forms.one}`;
	if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${count} ${forms.few}`;
	return `${count} ${forms.many}`;
}
function downloadText(filename, text, type = "text/plain") {
	const blob = new Blob([text], { type });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	link.click();
	URL.revokeObjectURL(url);
}
function toCsv(rows) {
	const cell = (value) => /[",\n;]/.test(value) ? `"${value.replace(/"/g, "\"\"")}"` : value;
	return `\uFEFF${rows.map((row) => row.map((value) => cell(value)).join(",")).join("\n")}`;
}
function toM3u(rows) {
	const lines = ["#EXTM3U"];
	for (const row of rows) {
		const seconds = row.seconds == null ? -1 : Math.round(row.seconds);
		lines.push(`#EXTINF:${seconds},${row.artist} - ${row.title}`);
		lines.push(row.filePath);
	}
	return `${lines.join("\n")}\n`;
}
function cn(...parts) {
	return clsx(parts);
}
function Panel({ children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		className: cn("rounded-lg bg-elevated p-4", className),
		children
	});
}
function PageIntro({ title, lead }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "mb-5 max-w-3xl",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-3xl tracking-tight text-fg",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm text-muted",
			children: lead
		})]
	});
}
function Button({ variant = "ghost", className, type = "button", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type,
		className: cn("inline-flex h-11 items-center justify-center gap-2 rounded-sm px-4 text-sm font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40", variant === "primary" ? "bg-accent text-accent-fg" : "border border-line bg-elevated text-fg", className),
		...props
	});
}
var fieldClass = "h-11 w-full rounded-sm border border-line bg-subtle px-3 text-sm text-fg placeholder:text-faint";
function Field(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		...props,
		className: cn(fieldClass, props.className)
	});
}
function SelectField(props) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
		...props,
		className: cn(fieldClass, props.className)
	});
}
function Toggle({ checked, onChange, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "flex min-h-11 items-center gap-3 text-sm",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			type: "checkbox",
			checked,
			onChange: (event) => onChange(event.target.checked)
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label })]
	});
}
function MeterList({ rows }) {
	const max = Math.max(1, ...rows.map((row) => row.total));
	if (rows.length === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "space-y-3",
		children: rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-1 flex items-baseline justify-between gap-3 text-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "min-w-0 truncate",
				children: row.label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "shrink-0 tabular-nums text-muted",
				children: row.total
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-2 rounded-sm bg-subtle",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-2 rounded-sm bg-accent",
				style: { width: `${Math.max(6, Math.round(row.total / max * 100))}%` }
			})
		})] }, row.label))
	});
}
function Pager({ page, pages, onPage, prev, next, label }) {
	if (pages <= 1) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-4 flex items-center justify-between gap-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				disabled: page === 0,
				onClick: () => onPage(page - 1),
				children: prev
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm tabular-nums text-muted",
				children: [
					label,
					" ",
					page + 1,
					" / ",
					pages
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				disabled: page >= pages - 1,
				onClick: () => onPage(page + 1),
				children: next
			})
		]
	});
}
function describeIngest(result, t) {
	if (!result.ok) {
		if (result.error === "empty") return t.importEmpty;
		if (result.error === "no-songs") return t.importNoSongs;
		if (result.error === "not-history") return t.importNotHistory;
		return t.importUnrecognized;
	}
	const skipped = result.ignored.length ? ` ${t.ignored}: ${result.ignored.join(", ")}.` : "";
	return `${result.tracks} ${t.importedTracks}. ${result.plays} ${t.importedPlays}.${skipped}`;
}
function ImportDialog({ t, busy, onClose, onFiles }) {
	const [hot, setHot] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 flex items-end justify-center bg-bg/80 p-4 sm:items-center",
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			role: "dialog",
			"aria-modal": "true",
			"aria-labelledby": "import-title",
			className: "max-h-[85dvh] w-full max-w-lg overflow-y-auto rounded-lg bg-elevated p-4",
			onClick: (event) => event.stopPropagation(),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						id: "import-title",
						className: "font-display text-2xl tracking-tight",
						children: t.importTitle
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: onClose,
						children: t.close
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-muted",
					children: t.importHelp
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: `mt-4 flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed px-4 text-center text-sm ${hot ? "border-accent bg-subtle" : "border-line"}`,
					onDragOver: (event) => {
						event.preventDefault();
						setHot(true);
					},
					onDragLeave: () => setHot(false),
					onDrop: (event) => {
						event.preventDefault();
						setHot(false);
						onFiles([...event.dataTransfer.files]);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: busy ? t.importBusy : t.importDrop }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						className: "sr-only",
						type: "file",
						multiple: true,
						accept: ".xml,.txt,text/xml,text/plain",
						onChange: (event) => {
							const files = event.target.files ? [...event.target.files] : [];
							event.target.value = "";
							if (files.length) onFiles(files);
						}
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex flex-wrap gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: () => downloadText("database-sample.xml", SAMPLE_LIBRARY_XML, "application/xml"),
						children: t.sampleXml
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: () => downloadText("tracklist-sample.txt", SAMPLE_HISTORY_TXT),
						children: t.sampleTxt
					})]
				})
			]
		})
	});
}
function parseGenreMap(source) {
	const rules = [];
	for (const line of source.split(/\r?\n/)) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith("#")) continue;
		const split = trimmed.split(/[:=]/);
		if (split.length < 2) continue;
		const name = split[0].trim();
		const sources = split.slice(1).join(":").split(",").map((item) => item.trim()).filter(Boolean);
		if (!name || sources.length === 0) continue;
		rules.push({
			name,
			sources
		});
	}
	return rules;
}
function displayGenre(genre, rules) {
	if (!genre) return "";
	const key = genre.trim().toLowerCase();
	for (const rule of rules) if (rule.sources.some((source) => source.toLowerCase() === key)) return rule.name;
	return genre;
}
function resolveBpm(raw, tunables) {
	if (raw == null || !Number.isFinite(raw) || raw <= 0) return null;
	let bpm = raw;
	if (tunables.bpmMode === "period" || tunables.bpmMode === "auto" && raw < 10) bpm = 60 / raw;
	if (!Number.isFinite(bpm) || bpm <= 0) return null;
	if (tunables.foldBpm) {
		const floor = Math.min(tunables.bpmFloor, tunables.bpmCeil);
		const ceil = Math.max(tunables.bpmFloor, tunables.bpmCeil);
		let guard = 0;
		while (bpm < floor && bpm * 2 <= ceil + 30 && guard < 6) {
			bpm *= 2;
			guard += 1;
		}
		guard = 0;
		while (bpm > ceil && bpm / 2 >= Math.max(60, floor - 15) && guard < 6) {
			bpm /= 2;
			guard += 1;
		}
	}
	if (bpm < 40 || bpm > 260) return null;
	return Math.round(bpm * 10) / 10;
}
function normalizeLabel(value, fuzzy) {
	let text = value.normalize("NFKC").toLowerCase().trim();
	if (fuzzy) {
		text = text.replace(/\([^)]*\)|\[[^\]]*\]/g, " ");
		text = text.replace(/\b(feat|ft|featuring|prod)\.?\b/g, " ");
	}
	text = text.replace(/[^\p{L}\p{N}#]+/gu, " ");
	return text.replace(/\s+/g, " ").trim();
}
function matchKey(artist, title, mode) {
	const fuzzy = mode === "fuzzy";
	const titleKey = normalizeLabel(title, fuzzy);
	if (!titleKey) return null;
	if (mode === "title") return `t:${titleKey}`;
	const artistKey = normalizeLabel(artist, fuzzy);
	if (!artistKey) return null;
	return `a:${artistKey}\u0000${titleKey}`;
}
function naiveUtc(value) {
	const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
	if (!match) return null;
	return Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]), Number(match[4]), Number(match[5]));
}
function minutesBetween(start, end) {
	if (!start || !end) return null;
	const a = naiveUtc(start);
	const b = naiveUtc(end);
	if (a == null || b == null) return null;
	return Math.max(0, Math.round((b - a) / 6e4));
}
function derive(rawTracks, rawSessions, rawPlays, tunables) {
	const genreRules = parseGenreMap(tunables.genreMap);
	const baseTracks = rawTracks.map((track) => {
		const camelot = toCamelot(track.musicalKey);
		return {
			...track,
			bpm: resolveBpm(track.bpmRaw, tunables),
			camelot,
			keyLabel: formatKey(camelot, tunables),
			genreLabel: displayGenre(track.genre, genreRules),
			historyPlays: 0,
			lastHistoryAt: null
		};
	});
	const lookup = /* @__PURE__ */ new Map();
	for (const track of baseTracks) {
		const key = matchKey(track.artist, track.title, tunables.matchMode);
		if (!key) continue;
		if (lookup.has(key)) lookup.set(key, null);
		else lookup.set(key, track.id);
	}
	const sessionDate = new Map(rawSessions.map((session) => [session.id, session.sessionDate]));
	const byId = new Map(baseTracks.map((track) => [track.id, track]));
	let matched = 0;
	const plays = rawPlays.map((play) => {
		const key = matchKey(play.artist, play.title, tunables.matchMode);
		const trackId = key ? lookup.get(key) ?? null : null;
		if (trackId) matched += 1;
		const track = trackId ? byId.get(trackId) : void 0;
		if (track) {
			track.historyPlays += 1;
			if (!track.lastHistoryAt || play.playedAt > track.lastHistoryAt) track.lastHistoryAt = play.playedAt;
		}
		return {
			...play,
			trackId,
			sessionDate: sessionDate.get(play.sessionId) ?? play.playedAt.slice(0, 10),
			bpm: track?.bpm ?? null,
			camelot: track?.camelot ?? null,
			keyLabel: track?.keyLabel ?? "—",
			genreLabel: track?.genreLabel ?? ""
		};
	});
	const sessions = rawSessions.map((session) => {
		const rows = plays.filter((play) => play.sessionId === session.id);
		const artists = new Set(rows.map((play) => play.artist).filter(Boolean));
		const bpms = rows.map((play) => play.bpm).filter((bpm) => bpm != null);
		const matchedRows = rows.filter((play) => play.trackId).length;
		return {
			...session,
			trackCount: rows.length,
			matched: matchedRows,
			artistCount: artists.size,
			avgBpm: bpms.length ? Math.round(bpms.reduce((sum, bpm) => sum + bpm, 0) / bpms.length * 10) / 10 : null,
			spanMinutes: minutesBetween(session.startedAt, session.endedAt)
		};
	}).sort((a, b) => (b.startedAt ?? b.sessionDate).localeCompare(a.startedAt ?? a.sessionDate));
	const monthMap = /* @__PURE__ */ new Map();
	const hourBuckets = Array.from({ length: 24 }, (_, hour) => ({
		hour,
		total: 0
	}));
	const artistMap = /* @__PURE__ */ new Map();
	for (const play of plays) {
		const month = play.playedAt.slice(0, 7);
		monthMap.set(month, (monthMap.get(month) ?? 0) + 1);
		const hour = Number(play.playedAt.slice(11, 13));
		if (hour >= 0 && hour <= 23) hourBuckets[hour].total += 1;
		if (play.artist) artistMap.set(play.artist, (artistMap.get(play.artist) ?? 0) + 1);
	}
	const keyCounts = {};
	for (const track of baseTracks) {
		if (tunables.wheelRequireKey && !track.camelot) continue;
		if (track.playCount < tunables.wheelMinPlays) continue;
		if (!track.camelot) continue;
		keyCounts[track.camelot] = (keyCounts[track.camelot] ?? 0) + 1;
	}
	return {
		tracks: baseTracks,
		plays,
		sessions,
		genres: [...new Set(baseTracks.map((track) => track.genreLabel).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
		keys: [...new Set(baseTracks.map((track) => track.keyLabel).filter((key) => key && key !== "—"))].sort((a, b) => a.localeCompare(b, void 0, { numeric: true })),
		genreRules,
		kpis: {
			tracks: baseTracks.length,
			plays: plays.length,
			sessions: sessions.length,
			played: baseTracks.filter((track) => track.playCount > 0).length,
			matched
		},
		monthly: [...monthMap.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([key, total]) => ({
			key,
			total
		})),
		hourly: hourBuckets,
		topArtists: [...artistMap.entries()].map(([artist, total]) => ({
			artist,
			total
		})).sort((a, b) => b.total - a.total).slice(0, 8),
		keyCounts
	};
}
var DB_NAME = "kabina";
var STORE = "snapshot";
function openDb() {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, 1);
		request.onupgradeneeded = () => {
			if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE);
		};
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error ?? /* @__PURE__ */ new Error("idb"));
	});
}
async function loadSnapshot() {
	if (typeof indexedDB === "undefined") return null;
	try {
		const db = await openDb();
		return await new Promise((resolve) => {
			const get = db.transaction(STORE, "readonly").objectStore(STORE).get("current");
			get.onsuccess = () => {
				const value = get.result;
				resolve(value && value.v === 1 && Array.isArray(value.tracks) ? value : null);
			};
			get.onerror = () => resolve(null);
		});
	} catch {
		return null;
	}
}
async function saveSnapshot(snapshot) {
	if (typeof indexedDB === "undefined") return;
	const db = await openDb();
	await new Promise((resolve, reject) => {
		const tx = db.transaction(STORE, "readwrite");
		tx.objectStore(STORE).put(snapshot, "current");
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error ?? /* @__PURE__ */ new Error("idb"));
	});
}
async function deleteSnapshot() {
	if (typeof indexedDB === "undefined") return;
	const db = await openDb();
	await new Promise((resolve) => {
		const tx = db.transaction(STORE, "readwrite");
		tx.objectStore(STORE).delete("current");
		tx.oncomplete = () => resolve();
		tx.onerror = () => resolve();
	});
}
var DEFAULT_TUNABLES = {
	keySystem: "camelot",
	preferFlats: false,
	wheelAnchor: "clock",
	bpmMode: "auto",
	foldBpm: false,
	bpmFloor: 90,
	bpmCeil: 180,
	wheelMinPlays: 0,
	wheelRequireKey: true,
	matchMode: "artist-title",
	pageSize: 25,
	genreMap: "",
	compat: {
		same: true,
		adjacent: true,
		relative: true,
		twoSteps: false,
		diagonal: false
	}
};
var DEFAULT_COLUMNS = {
	genre: true,
	bpm: true,
	key: true,
	duration: true,
	plays: true,
	last: true
};
var DEFAULT_WIDGETS = {
	monthly: true,
	artists: true,
	hourly: true,
	recent: true
};
var CLUB_MAP = `House: Deep House, Tech House, Progressive House
Bass: Drum & Bass, Dubstep`;
var OPEN_MAP = `Floor: Deep House, Tech House, Progressive House, Techno, Disco
Open: Hip-Hop, Pop
Bass: Drum & Bass, Dubstep`;
var BUILTIN_PROFILES = [
	{
		id: "studio",
		name: {
			ru: "Студия",
			en: "Studio"
		},
		tunables: DEFAULT_TUNABLES
	},
	{
		id: "club",
		name: {
			ru: "Клуб",
			en: "Club"
		},
		tunables: {
			...DEFAULT_TUNABLES,
			foldBpm: true,
			bpmFloor: 120,
			bpmCeil: 136,
			wheelMinPlays: 1,
			genreMap: CLUB_MAP,
			compat: {
				same: true,
				adjacent: true,
				relative: true,
				twoSteps: false,
				diagonal: false
			}
		}
	},
	{
		id: "open",
		name: {
			ru: "Открытый формат",
			en: "Open format"
		},
		tunables: {
			...DEFAULT_TUNABLES,
			keySystem: "traditional",
			foldBpm: true,
			bpmFloor: 85,
			bpmCeil: 130,
			matchMode: "fuzzy",
			compat: {
				same: true,
				adjacent: true,
				relative: true,
				twoSteps: true,
				diagonal: true
			},
			genreMap: OPEN_MAP
		}
	},
	{
		id: "broadcast",
		name: {
			ru: "Эфир",
			en: "Broadcast"
		},
		tunables: {
			...DEFAULT_TUNABLES,
			wheelMinPlays: 3,
			pageSize: 50,
			compat: {
				same: true,
				adjacent: true,
				relative: false,
				twoSteps: false,
				diagonal: false
			}
		}
	}
];
function enumOf(value, allowed, fallback) {
	return typeof value === "string" && allowed.includes(value) ? value : fallback;
}
function bool(value, fallback) {
	return typeof value === "boolean" ? value : fallback;
}
function num(value, fallback, min, max) {
	const n = typeof value === "number" ? value : Number(value);
	if (!Number.isFinite(n)) return fallback;
	return Math.min(max, Math.max(min, n));
}
function clampTunables(input, base = DEFAULT_TUNABLES) {
	const source = input && typeof input === "object" ? input : {};
	const compatIn = source.compat && typeof source.compat === "object" ? source.compat : {};
	let bpmFloor = num(source.bpmFloor, base.bpmFloor, 60, 200);
	let bpmCeil = num(source.bpmCeil, base.bpmCeil, 70, 220);
	if (bpmFloor > bpmCeil) {
		const swap = bpmFloor;
		bpmFloor = bpmCeil;
		bpmCeil = swap;
	}
	const pageSize = num(source.pageSize, base.pageSize, 25, 100);
	return {
		keySystem: enumOf(source.keySystem, [
			"camelot",
			"open",
			"traditional"
		], base.keySystem),
		preferFlats: bool(source.preferFlats, base.preferFlats),
		wheelAnchor: enumOf(source.wheelAnchor, ["clock", "one"], base.wheelAnchor),
		bpmMode: enumOf(source.bpmMode, [
			"auto",
			"period",
			"direct"
		], base.bpmMode),
		foldBpm: bool(source.foldBpm, base.foldBpm),
		bpmFloor,
		bpmCeil,
		wheelMinPlays: Math.round(num(source.wheelMinPlays, base.wheelMinPlays, 0, 500)),
		wheelRequireKey: bool(source.wheelRequireKey, base.wheelRequireKey),
		matchMode: enumOf(source.matchMode, [
			"artist-title",
			"title",
			"fuzzy"
		], base.matchMode),
		pageSize: pageSize >= 100 ? 100 : pageSize >= 50 ? 50 : 25,
		genreMap: typeof source.genreMap === "string" ? source.genreMap.slice(0, 4e3) : base.genreMap,
		compat: {
			same: bool(compatIn.same, base.compat.same),
			adjacent: bool(compatIn.adjacent, base.compat.adjacent),
			relative: bool(compatIn.relative, base.compat.relative),
			twoSteps: bool(compatIn.twoSteps, base.compat.twoSteps),
			diagonal: bool(compatIn.diagonal, base.compat.diagonal)
		}
	};
}
var settingsData = {
	locale: "ru",
	tunables: DEFAULT_TUNABLES,
	columns: DEFAULT_COLUMNS,
	widgets: DEFAULT_WIDGETS,
	profiles: [],
	profileRef: {
		kind: "builtin",
		id: "studio"
	},
	crateName: "",
	crateIds: []
};
var useSettings = create()(persist((set, get) => ({
	...settingsData,
	setLocale: (locale) => set({ locale }),
	patchTunables: (partial) => set({
		tunables: clampTunables({
			...get().tunables,
			...partial,
			compat: {
				...get().tunables.compat,
				...partial.compat
			}
		}),
		profileRef: { kind: "custom" }
	}),
	applyTunables: (tunables, profileRef) => set({
		tunables: clampTunables(tunables),
		profileRef
	}),
	saveProfile: (name) => {
		const trimmed = name.trim().slice(0, 40);
		if (!trimmed) return;
		const profile = {
			id: `u_${Date.now().toString(36)}`,
			name: trimmed,
			tunables: get().tunables
		};
		set({
			profiles: [...get().profiles, profile],
			profileRef: {
				kind: "user",
				id: profile.id
			}
		});
	},
	deleteProfile: (id) => {
		const ref = get().profileRef;
		set({
			profiles: get().profiles.filter((profile) => profile.id !== id),
			profileRef: ref.kind === "user" && ref.id === id ? { kind: "custom" } : ref
		});
	},
	toggleColumn: (key) => set({ columns: {
		...get().columns,
		[key]: !get().columns[key]
	} }),
	toggleWidget: (key) => set({ widgets: {
		...get().widgets,
		[key]: !get().widgets[key]
	} }),
	setPageSize: (pageSize) => set({
		tunables: {
			...get().tunables,
			pageSize
		},
		profileRef: { kind: "custom" }
	}),
	toggleCrate: (id) => {
		const ids = get().crateIds;
		set({ crateIds: ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id].slice(0, 500) });
	},
	clearCrate: () => set({ crateIds: [] }),
	moveCrate: (id, direction) => {
		const ids = [...get().crateIds];
		const index = ids.indexOf(id);
		const next = index + direction;
		if (index < 0 || next < 0 || next >= ids.length) return;
		const [item] = ids.splice(index, 1);
		ids.splice(next, 0, item);
		set({ crateIds: ids });
	},
	renameCrate: (crateName) => set({ crateName: crateName.slice(0, 40) })
}), {
	name: "kabina-settings",
	skipHydration: true,
	version: 1,
	merge: (persisted, current) => {
		const saved = persisted ?? {};
		const profiles = Array.isArray(saved.profiles) ? saved.profiles.filter((profile) => profile && typeof profile.name === "string" && profile.tunables).map((profile) => ({
			id: String(profile.id),
			name: profile.name.slice(0, 40),
			tunables: clampTunables(profile.tunables)
		})) : [];
		return {
			...current,
			locale: saved.locale === "en" ? "en" : "ru",
			tunables: clampTunables(saved.tunables, current.tunables),
			columns: {
				...current.columns,
				...saved.columns ?? {}
			},
			widgets: {
				...current.widgets,
				...saved.widgets ?? {}
			},
			profiles,
			profileRef: readProfileRef(saved.profileRef),
			crateName: typeof saved.crateName === "string" ? saved.crateName.slice(0, 40) : "",
			crateIds: Array.isArray(saved.crateIds) ? saved.crateIds.filter((id) => typeof id === "string").slice(0, 500) : []
		};
	}
}));
var useLibrary = create((set, get) => ({
	tracks: DEMO.tracks,
	sessions: DEMO.sessions,
	plays: DEMO.plays,
	origin: "demo",
	dirty: false,
	libraryFile: null,
	historyFile: null,
	importedAt: null,
	hydrate: (snapshot) => {
		if (get().dirty) return;
		set({
			tracks: snapshot.tracks,
			sessions: snapshot.sessions,
			plays: snapshot.plays,
			origin: "user",
			dirty: false,
			libraryFile: snapshot.libraryFile,
			historyFile: snapshot.historyFile,
			importedAt: snapshot.importedAt
		});
	},
	commit: (next) => {
		const importedAt = (/* @__PURE__ */ new Date()).toISOString();
		set({
			...next,
			origin: "user",
			dirty: true,
			importedAt
		});
		saveSnapshot({
			v: 1,
			...next,
			importedAt
		}).catch(() => void 0);
	},
	resetDemo: () => {
		set({
			tracks: DEMO.tracks,
			sessions: DEMO.sessions,
			plays: DEMO.plays,
			origin: "demo",
			dirty: true,
			libraryFile: null,
			historyFile: null,
			importedAt: null
		});
		deleteSnapshot();
	}
}));
function useDerived() {
	return derive(useLibrary((state) => state.tracks), useLibrary((state) => state.sessions), useLibrary((state) => state.plays), useSettings((state) => state.tunables));
}
function readProfileRef(value) {
	if (!value || typeof value !== "object") return {
		kind: "builtin",
		id: "studio"
	};
	const ref = value;
	if (ref.kind === "custom") return { kind: "custom" };
	if ((ref.kind === "builtin" || ref.kind === "user") && typeof ref.id === "string") return {
		kind: ref.kind,
		id: ref.id
	};
	return {
		kind: "builtin",
		id: "studio"
	};
}
function profileLabel(ref, profiles, locale, custom) {
	if (ref.kind === "custom") return custom;
	if (ref.kind === "builtin") return BUILTIN_PROFILES.find((profile) => profile.id === ref.id)?.name[locale] ?? custom;
	return profiles.find((profile) => profile.id === ref.id)?.name ?? custom;
}
var ru = {
	tagline: "Аналитика VirtualDJ",
	rules: "Правила",
	customRules: "Свои правила",
	demoData: "Пример",
	yourData: "Ваша библиотека",
	import: "Импорт",
	close: "Закрыть",
	more: "Ещё",
	navOverview: "Обзор",
	navLibrary: "Библиотека",
	navHistory: "История",
	navSessions: "Сеты",
	navWheel: "Колесо",
	navCrate: "Крейт",
	navSettings: "Настройки",
	demoBanner: "Сейчас открыт пример. Загрузите database.xml и History/tracklist.txt — файлы останутся только в этом браузере.",
	userBanner: "Библиотека хранится на этом устройстве. Можно заменить файлы или сменить правила.",
	changeRules: "Изменить правила",
	kpiTracks: "Треки",
	kpiPlays: "Проигрывания",
	kpiSessions: "Сеты",
	kpiPlayed: "С play count",
	monthly: "По месяцам",
	topArtists: "Артисты в истории",
	hourly: "Час старта",
	recentSessions: "Недавние сеты",
	emptyChart: "Пока нет истории",
	spanNote: "Длительность — между первым и последним стартом трека, не длина всего сета.",
	search: "Поиск",
	genre: "Жанр",
	anyGenre: "Все жанры",
	anySession: "Все сеты",
	dateFrom: "Дата от",
	dateTo: "Дата до",
	key: "Тональность",
	anyKey: "Все тональности",
	bpmFrom: "BPM от",
	bpmTo: "BPM до",
	playedOnly: "Только с play count",
	exportCsv: "CSV",
	addCrate: "В крейт",
	inCrate: "В крейте",
	noTracks: "Ничего не нашлось. Снимите фильтр или смените правила BPM.",
	colArtist: "Артист",
	colTitle: "Название",
	colGenre: "Жанр",
	colBpm: "BPM",
	colKey: "Тональность",
	colTime: "Время",
	colPlays: "Плеи",
	colLast: "Последний",
	colWhen: "Когда",
	colSession: "Сет",
	colTransition: "Переход",
	historyLead: "Строки из tracklist.txt. Несопоставленные треки не выбрасываются.",
	matchedOf: "склеено с библиотекой",
	sessionsLead: "Ночь из истории. Клик открывает порядок и гармонические переходы по текущим правилам.",
	sessionArtists: "артистов",
	sessionMatched: "в библиотеке",
	back: "Все сеты",
	missingSession: "Такого сета нет в загруженных данных.",
	notInLibrary: "нет в библиотеке",
	wheelLead: "Внутреннее кольцо — минор (A), внешнее — мажор (B). Счётчики зависят от порога play count.",
	wheelHint: "Выберите сегмент",
	wheelEmpty: "В этих правилах нет совместимых треков.",
	wheelSearch: "Фильтр списка",
	relSame: "та же",
	relAdjacent: "сосед",
	relRelative: "родственник",
	relTwo: "через одну",
	relDiagonal: "диагональ",
	relJump: "скачок",
	legendOn: "Выбрано",
	legendNear: "Совместимо",
	legendOff: "Остальные",
	clearKey: "Сбросить выбор",
	crateLead: "Личный список. Экспорт M3U сохраняет пути из VirtualDJ — их можно открыть обратно в программе.",
	crateEmpty: "Крейт пуст. Добавляйте треки из библиотеки или с колеса.",
	crateMissing: "Сохранённые треки не нашлись в текущей библиотеке.",
	crateDefault: "Мой крейт",
	clearCrate: "Очистить",
	exportM3u: "M3U",
	exportTxt: "Текст",
	moveUp: "Выше",
	moveDown: "Ниже",
	remove: "Убрать",
	browseLibrary: "Открыть библиотеку",
	settingsLead: "Правила сразу меняют BPM, склейку истории, колесо, жанры и карточки. Сохраните набор под свой формат.",
	language: "Язык",
	profiles: "Профили",
	saveProfile: "Сохранить текущие",
	profileName: "Имя профиля",
	delete: "Удалить",
	apply: "Включить",
	yourProfiles: "Ваши профили",
	noProfiles: "Пока только встроенные.",
	sectionHarmony: "Гармония",
	sectionBpm: "Чтение BPM",
	sectionMatch: "Склейка истории",
	sectionWheel: "Колесо",
	sectionDash: "Карточки обзора",
	sectionColumns: "Колонки библиотеки",
	sectionGenre: "Словарь жанров",
	sectionData: "Данные",
	keySystem: "Как показывать тональность",
	camelot: "Camelot",
	openKey: "Open Key",
	traditional: "Классическая",
	preferFlats: "Предпочитать бемоли",
	anchor: "Ноль колеса",
	anchorClock: "Как часы: 12 сверху",
	anchorOne: "Классика: 1 сверху",
	sameKey: "Та же тональность",
	adjacentKey: "Соседи ±1",
	relativeKey: "Параллельный мажор / минор",
	twoKey: "Через одну ±2",
	diagonalKey: "Диагональ: ±1 и другой лад",
	bpmMode: "Как записан BPM в database.xml",
	bpmAuto: "Авто: меньше 10 — это период доли",
	bpmPeriod: "Всегда период (60 / значение)",
	bpmDirect: "Всегда готовый BPM",
	foldBpm: "Складывать half-time в диапазон",
	floor: "Нижняя граница",
	ceil: "Верхняя граница",
	bpmHelp: "VirtualDJ часто пишет не 128, а длительность доли в секундах. Авто различает это само.",
	matchPair: "Артист и название, без двусмысленных",
	matchTitle: "Только название",
	matchFuzzy: "Мягко: без скобок и feat.",
	minPlays: "Минимум play count на колесе",
	requireKey: "Только треки с распознанной тональностью",
	pageSize: "Строк на странице",
	genreHelp: "Строка: Новое имя: Старое, Другое. Пустая строка и # — комментарий.",
	genrePreview: "Как схлопнутся жанры сейчас",
	genreNone: "Словарь пуст — жанры как в библиотеке.",
	exportProfile: "Скачать профиль",
	importProfile: "Загрузить профиль",
	profileImported: "Профиль включён",
	profileInvalid: "Файл профиля не подошёл",
	profileSaved: "Профиль сохранён",
	clearData: "Удалить мои файлы",
	clearSure: "Точно удалить",
	restoreDemo: "Вернуть пример",
	dataIsDemo: "Сейчас пример, удалять нечего.",
	dataIsUser: "Удаление стирает библиотеку только в этом браузере. Правила и крейт останутся.",
	importTitle: "Импорт VirtualDJ",
	importHelp: "Перетащите database.xml и tracklist.txt вместе или по отдельности. Папка на Windows: %LOCALAPPDATA%\\VirtualDJ. На Mac: Documents/VirtualDJ или Application Support/VirtualDJ.",
	importDrop: "Бросьте файлы сюда или выберите",
	importBusy: "Читаем…",
	importUnrecognized: "Не узнали формат",
	importEmpty: "Выберите хотя бы один файл",
	importNoSongs: "В XML нет треков Song",
	importNotHistory: "В тексте нет заголовков VirtualDJ History",
	sampleXml: "Пример XML",
	sampleTxt: "Пример истории",
	chooseFiles: "Выбрать файлы",
	ignored: "Пропущены",
	importedTracks: "треков в библиотеке",
	importedPlays: "проигрываний",
	prev: "Назад",
	next: "Дальше",
	page: "Страница",
	results: "Показано",
	playsHint: "Счётчик VirtualDJ, не число строк истории",
	overviewLead: "Сводка по библиотеке и ночам из истории.",
	libraryLead: "Поиск идёт по артисту, названию, пути, жанру и тональности.",
	avgBpm: "средний BPM",
	cancel: "Отмена",
	trackForms: {
		one: "трек",
		few: "трека",
		many: "треков"
	},
	playForms: {
		one: "проигрывание",
		few: "проигрывания",
		many: "проигрываний"
	},
	sessionForms: {
		one: "сет",
		few: "сета",
		many: "сетов"
	}
};
var en = {
	tagline: "VirtualDJ analytics",
	rules: "Rules",
	customRules: "Custom rules",
	demoData: "Sample",
	yourData: "Your library",
	import: "Import",
	close: "Close",
	more: "More",
	navOverview: "Overview",
	navLibrary: "Library",
	navHistory: "History",
	navSessions: "Sessions",
	navWheel: "Wheel",
	navCrate: "Crate",
	navSettings: "Settings",
	demoBanner: "You are looking at a sample. Upload database.xml and History/tracklist.txt — files stay in this browser.",
	userBanner: "The library stays on this device. Replace the files or switch the rules whenever you want.",
	changeRules: "Edit rules",
	kpiTracks: "Tracks",
	kpiPlays: "Plays",
	kpiSessions: "Sessions",
	kpiPlayed: "With play count",
	monthly: "By month",
	topArtists: "Artists in history",
	hourly: "Start hour",
	recentSessions: "Recent sessions",
	emptyChart: "No history yet",
	spanNote: "Duration is the span from the first track start to the last, not the full performance.",
	search: "Search",
	genre: "Genre",
	anyGenre: "All genres",
	anySession: "All sessions",
	dateFrom: "Date from",
	dateTo: "Date to",
	key: "Key",
	anyKey: "All keys",
	bpmFrom: "BPM from",
	bpmTo: "BPM to",
	playedOnly: "Play count only",
	exportCsv: "CSV",
	addCrate: "Add to crate",
	inCrate: "In crate",
	noTracks: "Nothing matched. Clear a filter or relax the BPM rules.",
	colArtist: "Artist",
	colTitle: "Title",
	colGenre: "Genre",
	colBpm: "BPM",
	colKey: "Key",
	colTime: "Time",
	colPlays: "Plays",
	colLast: "Last",
	colWhen: "When",
	colSession: "Session",
	colTransition: "Transition",
	historyLead: "Lines from tracklist.txt. Unmatched plays are kept.",
	matchedOf: "linked to the library",
	sessionsLead: "A night from history. Open one to see order and harmonic moves under the current rules.",
	sessionArtists: "artists",
	sessionMatched: "in the library",
	back: "All sessions",
	missingSession: "That session is not in the loaded data.",
	notInLibrary: "not in the library",
	wheelLead: "Inner ring is minor (A), outer ring is major (B). Counts follow the play-count rule.",
	wheelHint: "Pick a segment",
	wheelEmpty: "No compatible tracks under these rules.",
	wheelSearch: "Filter the list",
	relSame: "same",
	relAdjacent: "neighbor",
	relRelative: "relative",
	relTwo: "two steps",
	relDiagonal: "diagonal",
	relJump: "jump",
	legendOn: "Selected",
	legendNear: "Compatible",
	legendOff: "Other",
	clearKey: "Clear selection",
	crateLead: "A private list. M3U export keeps VirtualDJ file paths so you can open it back in the app.",
	crateEmpty: "The crate is empty. Add tracks from the library or the wheel.",
	crateMissing: "Saved tracks are not in the current library.",
	crateDefault: "My crate",
	clearCrate: "Clear",
	exportM3u: "M3U",
	exportTxt: "Text",
	moveUp: "Up",
	moveDown: "Down",
	remove: "Remove",
	browseLibrary: "Open library",
	settingsLead: "Rules immediately change BPM, history matching, the wheel, genres, and overview cards. Save a set for each format you play.",
	language: "Language",
	profiles: "Profiles",
	saveProfile: "Save current",
	profileName: "Profile name",
	delete: "Delete",
	apply: "Use",
	yourProfiles: "Your profiles",
	noProfiles: "Only the built-in profiles so far.",
	sectionHarmony: "Harmony",
	sectionBpm: "BPM reading",
	sectionMatch: "History matching",
	sectionWheel: "Wheel",
	sectionDash: "Overview cards",
	sectionColumns: "Library columns",
	sectionGenre: "Genre dictionary",
	sectionData: "Data",
	keySystem: "How to show key",
	camelot: "Camelot",
	openKey: "Open Key",
	traditional: "Traditional",
	preferFlats: "Prefer flats",
	anchor: "Wheel zero",
	anchorClock: "Like a clock: 12 on top",
	anchorOne: "Classic: 1 on top",
	sameKey: "Same key",
	adjacentKey: "Neighbors ±1",
	relativeKey: "Relative major / minor",
	twoKey: "Two steps ±2",
	diagonalKey: "Diagonal: ±1 and the other mode",
	bpmMode: "How BPM is stored in database.xml",
	bpmAuto: "Auto: under 10 means a beat period",
	bpmPeriod: "Always a period (60 / value)",
	bpmDirect: "Always a ready BPM",
	foldBpm: "Fold half-time into the range",
	floor: "Floor",
	ceil: "Ceiling",
	bpmHelp: "VirtualDJ often stores the seconds between beats, not 128. Auto mode tells them apart.",
	matchPair: "Artist and title, skip ambiguous pairs",
	matchTitle: "Title only",
	matchFuzzy: "Loose: ignore brackets and feat.",
	minPlays: "Minimum play count on the wheel",
	requireKey: "Only tracks with a recognized key",
	pageSize: "Rows per page",
	genreHelp: "One line: New name: Old, Other. Blank lines and # are comments.",
	genrePreview: "How genres collapse right now",
	genreNone: "No dictionary — genres stay as imported.",
	exportProfile: "Download profile",
	importProfile: "Upload profile",
	profileImported: "Profile applied",
	profileInvalid: "That profile file did not fit",
	profileSaved: "Profile saved",
	clearData: "Delete my files",
	clearSure: "Delete for sure",
	restoreDemo: "Restore sample",
	dataIsDemo: "The sample is showing. Nothing of yours to delete.",
	dataIsUser: "This removes the library from this browser only. Rules and the crate stay.",
	importTitle: "Import VirtualDJ",
	importHelp: "Drop database.xml and tracklist.txt together or one at a time. On Windows: %LOCALAPPDATA%\\VirtualDJ. On Mac: Documents/VirtualDJ or Application Support/VirtualDJ.",
	importDrop: "Drop files here or choose them",
	importBusy: "Reading…",
	importUnrecognized: "Format not recognized",
	importEmpty: "Choose at least one file",
	importNoSongs: "The XML has no Song entries",
	importNotHistory: "The text has no VirtualDJ History headers",
	sampleXml: "Sample XML",
	sampleTxt: "Sample history",
	chooseFiles: "Choose files",
	ignored: "Skipped",
	importedTracks: "tracks in the library",
	importedPlays: "plays",
	prev: "Previous",
	next: "Next",
	page: "Page",
	results: "Showing",
	playsHint: "VirtualDJ play count, not history rows",
	overviewLead: "A read of the library and the nights in your history.",
	libraryLead: "Search covers artist, title, path, genre, and key.",
	avgBpm: "average BPM",
	cancel: "Cancel",
	trackForms: {
		one: "track",
		few: "tracks",
		many: "tracks"
	},
	playForms: {
		one: "play",
		few: "plays",
		many: "plays"
	},
	sessionForms: {
		one: "session",
		few: "sessions",
		many: "sessions"
	}
};
function useI18n() {
	const locale = useSettings((state) => state.locale);
	return {
		locale,
		t: locale === "en" ? en : ru
	};
}
function relationLabel(t, rel) {
	if (rel === "same") return t.relSame;
	if (rel === "adjacent") return t.relAdjacent;
	if (rel === "relative") return t.relRelative;
	if (rel === "two") return t.relTwo;
	if (rel === "diagonal") return t.relDiagonal;
	if (rel === "jump") return t.relJump;
	return "—";
}
async function ingestFiles(files) {
	if (files.length === 0) return {
		ok: false,
		tracks: 0,
		plays: 0,
		sessions: 0,
		ignored: [],
		error: "empty"
	};
	let library = null;
	const histories = [];
	const ignored = [];
	for (const file of files) {
		const text = (await file.text()).replace(/^\uFEFF/, "");
		if (isLibraryText(text)) {
			try {
				library = {
					name: file.name,
					tracks: parseDatabaseXml(text)
				};
			} catch (error) {
				if (error instanceof ParseError && error.code === "no-songs") return {
					ok: false,
					tracks: 0,
					plays: 0,
					sessions: 0,
					ignored,
					error: "no-songs"
				};
				throw error;
			}
			continue;
		}
		if (isHistoryText(text)) {
			try {
				const parsed = parseHistory(text, file.name);
				histories.push({
					name: file.name,
					...parsed
				});
			} catch (error) {
				if (error instanceof ParseError) return {
					ok: false,
					tracks: 0,
					plays: 0,
					sessions: 0,
					ignored,
					error: "not-history"
				};
				throw error;
			}
			continue;
		}
		ignored.push(file.name);
	}
	if (!library && histories.length === 0) return {
		ok: false,
		tracks: 0,
		plays: 0,
		sessions: 0,
		ignored,
		error: "unrecognized"
	};
	const current = useLibrary.getState();
	const keepUser = current.origin === "user";
	const tracks = library ? library.tracks : keepUser ? current.tracks : [];
	const sessions = histories.length ? histories.flatMap((item) => item.sessions) : keepUser ? current.sessions : [];
	const plays = histories.length ? histories.flatMap((item) => item.plays) : keepUser ? current.plays : [];
	const libraryFile = library ? library.name : keepUser ? current.libraryFile : null;
	const historyFile = histories.length ? histories.map((item) => item.name).join(", ") : keepUser ? current.historyFile : null;
	current.commit({
		tracks,
		sessions,
		plays,
		libraryFile,
		historyFile
	});
	return {
		ok: true,
		tracks: tracks.length,
		plays: plays.length,
		sessions: sessions.length,
		ignored
	};
}
var LINKS = [
	{
		href: "/",
		key: "navOverview",
		icon: LayoutDashboard
	},
	{
		href: "/library",
		key: "navLibrary",
		icon: Library
	},
	{
		href: "/history",
		key: "navHistory",
		icon: History
	},
	{
		href: "/sessions",
		key: "navSessions",
		icon: ListMusic
	},
	{
		href: "/wheel",
		key: "navWheel",
		icon: Disc3
	},
	{
		href: "/crate",
		key: "navCrate",
		icon: Music2
	},
	{
		href: "/settings",
		key: "navSettings",
		icon: Settings2
	}
];
function isActive(path, href) {
	if (href === "/") return path === "/";
	return path === href || path.startsWith(`${href}/`);
}
function Shell({ children }) {
	const { t, locale } = useI18n();
	const path = useRouterState({ select: (state) => state.location.pathname });
	const origin = useLibrary((state) => state.origin);
	const trackCount = useLibrary((state) => state.tracks.length);
	const profileRef = useSettings((state) => state.profileRef);
	const profiles = useSettings((state) => state.profiles);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [more, setMore] = (0, import_react.useState)(false);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [banner, setBanner] = (0, import_react.useState)(null);
	const [dragging, setDragging] = (0, import_react.useState)(false);
	const rules = profileLabel(profileRef, profiles, locale, t.customRules);
	(0, import_react.useEffect)(() => {
		useSettings.persist.rehydrate();
		loadSnapshot().then((snapshot) => {
			if (snapshot) useLibrary.getState().hydrate(snapshot);
		});
	}, []);
	(0, import_react.useEffect)(() => {
		const onKey = (event) => {
			if (event.key === "Escape") {
				setOpen(false);
				setMore(false);
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);
	async function takeFiles(files) {
		setBusy(true);
		try {
			const result = await ingestFiles(files);
			setBanner(describeIngest(result, t));
			if (result.ok) setOpen(false);
		} finally {
			setBusy(false);
			setDragging(false);
		}
	}
	(0, import_react.useEffect)(() => {
		let depth = 0;
		const hasFiles = (event) => event.dataTransfer?.types.includes("Files");
		const onOver = (event) => {
			if (!hasFiles(event)) return;
			event.preventDefault();
		};
		const onEnter = (event) => {
			if (!hasFiles(event)) return;
			event.preventDefault();
			depth += 1;
			setDragging(true);
		};
		const onLeave = () => {
			depth -= 1;
			if (depth <= 0) {
				depth = 0;
				setDragging(false);
			}
		};
		const onDrop = (event) => {
			if (!hasFiles(event)) return;
			event.preventDefault();
			depth = 0;
			setDragging(false);
			const files = event.dataTransfer?.files;
			if (files && files.length) takeFiles([...files]);
		};
		window.addEventListener("dragover", onOver);
		window.addEventListener("dragenter", onEnter);
		window.addEventListener("dragleave", onLeave);
		window.addEventListener("drop", onDrop);
		return () => {
			window.removeEventListener("dragover", onOver);
			window.removeEventListener("dragenter", onEnter);
			window.removeEventListener("dragleave", onLeave);
			window.removeEventListener("drop", onDrop);
		};
	}, [t]);
	const mobile = [
		LINKS[0],
		LINKS[1],
		LINKS[4],
		LINKS[3]
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "fixed inset-y-0 left-0 z-20 hidden w-60 flex-col border-r border-line bg-elevated px-3 py-5 md:flex",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "px-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-2xl tracking-tight",
							children: "Кабина"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted",
							children: t.tagline
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
						className: "mt-6 flex flex-1 flex-col gap-1",
						children: LINKS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: item.href,
							"aria-current": isActive(path, item.href) ? "page" : void 0,
							className: cn("flex min-h-11 items-center gap-3 rounded-sm px-3 text-sm", isActive(path, item.href) ? "bg-subtle text-fg" : "text-muted"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, {
								className: "size-4 shrink-0",
								"aria-hidden": "true"
							}), t[item.key]]
						}, item.href))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 space-y-3 px-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm text-muted",
								children: [
									t.rules,
									": ",
									rules
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm text-fg",
								children: [
									origin === "demo" ? t.demoData : t.yourData,
									" · ",
									trackCount
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								className: "w-full",
								variant: "primary",
								onClick: () => setOpen(true),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, {
									className: "size-4",
									"aria-hidden": "true"
								}), t.import]
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "md:pl-60",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "sticky top-0 z-20 flex h-14 items-center justify-between border-b border-line bg-bg px-4 md:hidden",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-lg leading-none",
						children: "Кабина"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: rules
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						onClick: () => setOpen(true),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, {
							className: "size-4",
							"aria-hidden": "true"
						}), t.import]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
					className: "app-main mx-auto w-full max-w-6xl px-4 pt-4 md:px-6 md:pt-6",
					children: [banner ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-4 flex items-start justify-between gap-3 rounded-lg bg-elevated px-4 py-3 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: banner }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "shrink-0 text-muted",
							onClick: () => setBanner(null),
							children: t.close
						})]
					}) : null, children]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "fixed inset-x-0 bottom-0 z-30 border-t border-line bg-elevated md:hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-5",
					children: [mobile.map((item) => {
						const Icon = item.icon;
						const active = isActive(path, item.href);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: item.href,
							"aria-current": active ? "page" : void 0,
							className: cn("flex min-h-14 flex-col items-center justify-center gap-1 px-1 text-xs", active ? "text-fg" : "text-muted"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
								className: "size-5",
								"aria-hidden": "true"
							}), t[item.key]]
						}, item.href);
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						className: cn("flex min-h-14 flex-col items-center justify-center gap-1 text-xs", more ? "text-fg" : "text-muted"),
						onClick: () => setMore((value) => !value),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, {
							className: "size-5",
							"aria-hidden": "true"
						}), t.more]
					})]
				})
			}),
			more ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-40 bg-bg/80 md:hidden",
				onClick: () => setMore(false),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "sheet-above-nav absolute inset-x-3 rounded-lg border border-line bg-elevated p-3",
					onClick: (event) => event.stopPropagation(),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-1",
						children: [
							LINKS[2],
							LINKS[5],
							LINKS[6]
						].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: item.href,
							onClick: () => setMore(false),
							className: "flex min-h-11 items-center rounded-sm px-3 text-sm",
							children: t[item.key]
						}, item.href))
					})
				})
			}) : null,
			dragging ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none fixed inset-0 z-40 border-2 border-dashed border-accent bg-bg/70" }) : null,
			open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImportDialog, {
				t,
				busy,
				onClose: () => setOpen(false),
				onFiles: (files) => void takeFiles(files)
			}) : null
		]
	});
}
var styles_default = "/assets/styles-BoMa8a64.css";
var Route$8 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "Кабина" },
			{
				name: "theme-color",
				content: "#0c0e11"
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=Outfit:wght@500;600&display=swap"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			}
		]
	}),
	component: RootComponent
});
function RootComponent() {
	const locale = useSettings((state) => state.locale);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: locale,
		className: "antialiased",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
		] })]
	});
}
var $$splitComponentImporter$7 = () => import("./routes-ovNOnjbc.mjs");
var Route$7 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter$7, "component") });
var $$splitComponentImporter$6 = () => import("./crate-CAHXx3oD.mjs");
var Route$6 = createFileRoute("/crate")({ component: lazyRouteComponent($$splitComponentImporter$6, "component") });
var $$splitComponentImporter$5 = () => import("./history-D2Qy_Rh-.mjs");
var Route$5 = createFileRoute("/history")({ component: lazyRouteComponent($$splitComponentImporter$5, "component") });
var $$splitComponentImporter$4 = () => import("./library-CMsNOmMj.mjs");
var Route$4 = createFileRoute("/library")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
var $$splitComponentImporter$3 = () => import("./settings-DPHOi7YS.mjs");
var Route$3 = createFileRoute("/settings")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitComponentImporter$2 = () => import("./wheel-CQkAgFAk.mjs");
var Route$2 = createFileRoute("/wheel")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var $$splitComponentImporter$1 = () => import("./sessions-CiMMpi2T.mjs");
var Route$1 = createFileRoute("/sessions/")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
var $$splitComponentImporter = () => import("../_id-Bpryai_y.mjs");
var Route = createFileRoute("/sessions/$id")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var IndexRoute = Route$7.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$8
});
var CrateRoute = Route$6.update({
	id: "/crate",
	path: "/crate",
	getParentRoute: () => Route$8
});
var HistoryRoute = Route$5.update({
	id: "/history",
	path: "/history",
	getParentRoute: () => Route$8
});
var LibraryRoute = Route$4.update({
	id: "/library",
	path: "/library",
	getParentRoute: () => Route$8
});
var SettingsRoute = Route$3.update({
	id: "/settings",
	path: "/settings",
	getParentRoute: () => Route$8
});
var WheelRoute = Route$2.update({
	id: "/wheel",
	path: "/wheel",
	getParentRoute: () => Route$8
});
var SessionsIndexRoute = Route$1.update({
	id: "/sessions/",
	path: "/sessions/",
	getParentRoute: () => Route$8
});
var rootRouteChildren = {
	IndexRoute,
	CrateRoute,
	HistoryRoute,
	LibraryRoute,
	SettingsRoute,
	WheelRoute,
	SessionsIdRoute: Route.update({
		id: "/sessions/$id",
		path: "/sessions/$id",
		getParentRoute: () => Route$8
	}),
	SessionsIndexRoute
};
var routeTree = Route$8._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		rewrite: previewPathRewrite(),
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { compatibleKeys as A, formatDuration as C, plural as D, formatStamp as E, relationBetween as M, secondaryKey as N, toCsv as O, formatBpm as S, formatSpan as T, Pager as _, profileLabel as a, Toggle as b, useSettings as c, displayGenre as d, parseGenreMap as f, PageIntro as g, MeterList as h, useI18n as i, formatKey as j, toM3u as k, BUILTIN_PROFILES as l, Field as m, Route as n, useDerived as o, Button as p, relationLabel as r, useLibrary as s, router_exports as t, clampTunables as u, Panel as v, formatMonth as w, downloadText as x, SelectField as y };

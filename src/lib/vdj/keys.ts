import type { Compat, Relation, Tunables } from "@/lib/vdj/types";

export const CAMELOT_NAMES: Record<string, { sharp: string; flat: string }> = {
  "1A": { sharp: "G#m", flat: "Abm" },
  "2A": { sharp: "D#m", flat: "Ebm" },
  "3A": { sharp: "A#m", flat: "Bbm" },
  "4A": { sharp: "Fm", flat: "Fm" },
  "5A": { sharp: "Cm", flat: "Cm" },
  "6A": { sharp: "Gm", flat: "Gm" },
  "7A": { sharp: "Dm", flat: "Dm" },
  "8A": { sharp: "Am", flat: "Am" },
  "9A": { sharp: "Em", flat: "Em" },
  "10A": { sharp: "Bm", flat: "Bm" },
  "11A": { sharp: "F#m", flat: "Gbm" },
  "12A": { sharp: "C#m", flat: "Dbm" },
  "1B": { sharp: "B", flat: "Cb" },
  "2B": { sharp: "F#", flat: "Gb" },
  "3B": { sharp: "C#", flat: "Db" },
  "4B": { sharp: "G#", flat: "Ab" },
  "5B": { sharp: "D#", flat: "Eb" },
  "6B": { sharp: "A#", flat: "Bb" },
  "7B": { sharp: "F", flat: "F" },
  "8B": { sharp: "C", flat: "C" },
  "9B": { sharp: "G", flat: "G" },
  "10B": { sharp: "D", flat: "D" },
  "11B": { sharp: "A", flat: "A" },
  "12B": { sharp: "E", flat: "E" },
};

const CODES = Object.keys(CAMELOT_NAMES);

function normalizeSpelling(raw: string): string {
  let s = raw
    .trim()
    .toLowerCase()
    .replace(/♭/g, "b")
    .replace(/♯/g, "#")
    .replace(/\s+/g, "");
  s = s.replace(/sharp/g, "#").replace(/flat/g, "b");
  s = s.replace(/minor|min|moll/g, "m").replace(/major|maj|dur/g, "");
  return s;
}

const TRAD: Record<string, string> = {};
for (const [code, names] of Object.entries(CAMELOT_NAMES)) {
  TRAD[normalizeSpelling(names.sharp)] = code;
  TRAD[normalizeSpelling(names.flat)] = code;
}

export function toCamelot(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const compact = raw
    .trim()
    .toLowerCase()
    .replace(/♭/g, "b")
    .replace(/♯/g, "#")
    .replace(/\s+/g, "");
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
  const spelled = normalizeSpelling(raw);
  return TRAD[spelled] ?? null;
}

export function formatKey(
  camelot: string | null,
  tunables: Pick<Tunables, "keySystem" | "preferFlats">,
): string {
  if (!camelot || !CAMELOT_NAMES[camelot]) return "—";
  if (tunables.keySystem === "camelot") return camelot;
  if (tunables.keySystem === "open") {
    return `${camelot.slice(0, -1)}${camelot.endsWith("A") ? "m" : "d"}`;
  }
  const names = CAMELOT_NAMES[camelot];
  return tunables.preferFlats ? names.flat : names.sharp;
}

export function secondaryKey(
  camelot: string | null,
  tunables: Pick<Tunables, "keySystem" | "preferFlats">,
): string {
  if (!camelot || !CAMELOT_NAMES[camelot]) return "";
  if (tunables.keySystem === "camelot") {
    return tunables.preferFlats ? CAMELOT_NAMES[camelot].flat : CAMELOT_NAMES[camelot].sharp;
  }
  return camelot;
}

function wrap(n: number): number {
  return ((n - 1 + 12) % 12) + 1;
}

const RANK: Record<Relation, number> = {
  same: 0,
  adjacent: 1,
  relative: 2,
  two: 3,
  diagonal: 4,
};

export function compatibleKeys(code: string, rules: Compat): { code: string; rel: Relation }[] {
  if (!CAMELOT_NAMES[code]) return [];
  const n = Number(code.slice(0, -1));
  const mode = code.slice(-1);
  const other = mode === "A" ? "B" : "A";
  const found: { code: string; rel: Relation }[] = [];
  const push = (next: string, rel: Relation) => {
    if (!CAMELOT_NAMES[next]) return;
    const prev = found.find((item) => item.code === next);
    if (!prev) found.push({ code: next, rel });
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

export function relationBetween(from: string | null, to: string | null, rules: Compat): Relation | "jump" | null {
  if (!from || !to) return null;
  const hit = compatibleKeys(from, rules).find((item) => item.code === to);
  return hit ? hit.rel : "jump";
}

export function wheelOrder(anchor: Tunables["wheelAnchor"]): string[] {
  const minors: string[] = [];
  const majors: string[] = [];
  for (let n = anchor === "clock" ? 12 : 1; minors.length < 12; n = n === 12 ? 1 : n + 1) {
    minors.push(`${n}A`);
    majors.push(`${n}B`);
    if (anchor === "one" && n === 12) break;
    if (anchor === "clock" && n === 11) break;
  }
  return [...majors, ...minors];
}

export const ALL_CODES = CODES;

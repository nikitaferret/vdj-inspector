import { useEffect } from "react";
import { compatibleKeys, formatKey, secondaryKey } from "@/lib/vdj/keys";
import type { Compat, WheelAnchor } from "@/lib/vdj/types";

type Props = {
  counts: Record<string, number>;
  selected: string | null;
  anchor: WheelAnchor;
  keySystem: "camelot" | "open" | "traditional";
  preferFlats: boolean;
  compat: Compat;
  onSelect: (code: string) => void;
};

function point(radius: number, angle: number): [number, number] {
  return [50 + Math.cos(angle) * radius, 50 + Math.sin(angle) * radius];
}

function slice(inner: number, outer: number, start: number, end: number): string {
  const large = end - start > Math.PI ? 1 : 0;
  const [x0, y0] = point(outer, start);
  const [x1, y1] = point(outer, end);
  const [x2, y2] = point(inner, end);
  const [x3, y3] = point(inner, start);
  return `M ${x0} ${y0} A ${outer} ${outer} 0 ${large} 1 ${x1} ${y1} L ${x2} ${y2} A ${inner} ${inner} 0 ${large} 0 ${x3} ${y3} Z`;
}

function centerAngle(n: number, anchor: WheelAnchor): number {
  const turn = anchor === "clock" ? (n % 12) / 12 : (n - 1) / 12;
  return turn * Math.PI * 2 - Math.PI / 2;
}

function moveKey(code: string, dir: "left" | "right" | "up" | "down"): string {
  const match = /^(\d+)([AB])$/.exec(code);
  if (!match) return code;
  let n = Number(match[1]);
  let mode = match[2];
  if (dir === "left") n = n === 1 ? 12 : n - 1;
  if (dir === "right") n = n === 12 ? 1 : n + 1;
  if (dir === "up" || dir === "down") mode = mode === "A" ? "B" : "A";
  return `${n}${mode}`;
}

export function HarmonicWheel({ counts, selected, anchor, keySystem, preferFlats, compat, onSelect }: Props) {
  const tunables = { keySystem, preferFlats };
  const relationByCode = new Map(selected ? compatibleKeys(selected, compat).map((item) => [item.code, item.rel]) : []);
  const gap = 0.035;
  const half = Math.PI / 12 - gap;
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      if (!selected && (event.key === "ArrowLeft" || event.key === "ArrowRight" || event.key === "ArrowUp" || event.key === "ArrowDown")) {
        event.preventDefault();
        onSelect("1A");
        return;
      }
      if (!selected) return;
      const dir =
        event.key === "ArrowLeft"
          ? "left"
          : event.key === "ArrowRight"
            ? "right"
            : event.key === "ArrowUp"
              ? "up"
              : event.key === "ArrowDown"
                ? "down"
                : null;
      if (!dir) return;
      event.preventDefault();
      onSelect(moveKey(selected, dir));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, onSelect]);

  return (
    <svg viewBox="0 0 100 100" className="mx-auto h-[28rem] w-[28rem] shrink-0" role="group" tabIndex={0}>
      {Array.from({ length: 12 }, (_, index) => {
        const n = index + 1;
        const angle = centerAngle(n, anchor);
        const rings = [
          { code: `${n}B`, inner: 32.5, outer: 46, labelR: 39.2 },
          { code: `${n}A`, inner: 17.5, outer: 31.5, labelR: 24.5 },
        ];
        return rings.map((ring) => {
          const on = ring.code === selected;
          const rel = on ? "same" : (relationByCode.get(ring.code) ?? (selected ? "jump" : null));
          const fill =
            rel === "same"
              ? "fill-rel-same"
              : rel === "adjacent"
                ? "fill-rel-adjacent"
                : rel === "relative"
                  ? "fill-rel-relative"
                  : rel === "two" || rel === "diagonal"
                    ? "fill-rel-mid"
                    : rel === "jump"
                      ? "fill-rel-jump"
                      : "fill-subtle";
          const ink = rel ? "fill-accent-fg" : "fill-fg";
          const countInk = rel ? "fill-accent-fg" : "fill-muted";
          const count = counts[ring.code] ?? 0;
          const [lx, ly] = point(ring.labelR, angle);
          return (
            <g
              key={ring.code}
              role="button"
              tabIndex={0}
              aria-pressed={on}
              aria-label={`${ring.code} ${formatKey(ring.code, tunables)} ${count}`}
              onClick={() => onSelect(ring.code)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelect(ring.code);
                }
              }}
              className="cursor-pointer outline-none"
            >
              <path
                d={slice(ring.inner, ring.outer, angle - half, angle + half)}
                className={fill}
              />
              <text
                x={lx}
                y={ly - 1.1}
                textAnchor="middle"
                className={ink}
                fontSize="3.15"
              >
                {ring.code}
              </text>
              <text
                x={lx}
                y={ly + 2.15}
                textAnchor="middle"
                className={countInk}
                fontSize="2.15"
              >
                {count}
              </text>
            </g>
          );
        });
      })}
      <circle cx="50" cy="50" r="14.5" className="fill-bg" />
      {selected ? (
        <>
          <text x="50" y="48" textAnchor="middle" className="fill-fg" fontSize="5.2">
            {formatKey(selected, tunables)}
          </text>
          <text x="50" y="55" textAnchor="middle" className="fill-muted" fontSize="2.8">
            {secondaryKey(selected, tunables)}
          </text>
        </>
      ) : (
        <text x="50" y="52" textAnchor="middle" className="fill-fg" fontSize="6">
          {total}
        </text>
      )}
    </svg>
  );
}

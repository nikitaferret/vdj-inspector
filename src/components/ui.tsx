import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import { clsx } from "clsx";

export function cn(...parts: Array<string | false | null | undefined>): string {
  return clsx(parts);
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn("rounded-lg bg-elevated p-4", className)}>{children}</section>;
}

export function PageIntro({ title, lead }: { title: string; lead: string }) {
  return (
    <header className="mb-5 max-w-3xl">
      <h1 className="font-display text-[clamp(1.75rem,4vw,2.25rem)] tracking-tight text-fg">{title}</h1>
      <p className="mt-2 text-sm text-muted">{lead}</p>
    </header>
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" };

export function Button({ variant = "ghost", className, type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-[7px] px-4 text-sm font-semibold tracking-wide",
        "transition-[background-color,border-color,color,transform,filter] duration-[120ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
        "active:scale-[0.97] active:brightness-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100",
        variant === "primary"
          ? "bg-[#c8f500] text-[#0b0f00] hover:brightness-105 hover:shadow-[0_0_0_1px_rgba(200,245,0,0.4)]"
          : "border border-white/10 bg-elevated text-fg hover:border-white/25 hover:bg-subtle",
        className,
      )}
      {...props}
    />
  );
}

const fieldClass =
  "h-11 w-full rounded-[7px] border border-white/10 bg-subtle px-3 text-sm text-fg placeholder:text-faint focus:border-[#c8f500]/60 focus:outline-none";

export function Field(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(fieldClass, props.className)} />;
}

export function SelectField(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn(fieldClass, props.className)} />;
}

export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex min-h-11 items-center gap-3 text-sm">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="accent-[#c8f500]" />
      <span>{label}</span>
    </label>
  );
}

export function MeterList({ rows }: { rows: { id?: string; label: string; total: number }[] }) {
  const max = Math.max(1, ...rows.map((row) => row.total));
  if (rows.length === 0) return null;
  return (
    <ul className="space-y-3">
      {rows.map((row) => (
        <li key={row.id ?? row.label}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate">{row.label}</span>
            <span className="shrink-0 tabular-nums text-muted">{row.total}</span>
          </div>
          <div className="h-2 rounded-sm bg-subtle">
            <div
              className="h-2 rounded-sm bg-[#c8f500]"
              style={{ width: `${Math.max(6, Math.round((row.total / max) * 100))}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function RelationText({ rel, children, title }: { rel: string | null; children: ReactNode; title?: string }) {
  const tone =
    rel === "same"
      ? "text-rel-same"
      : rel === "adjacent"
        ? "text-rel-adjacent"
        : rel === "relative"
          ? "text-rel-relative"
          : rel === "two" || rel === "diagonal"
            ? "text-rel-mid"
            : rel === "jump"
              ? "text-rel-jump"
              : "text-muted";
  const dot =
    rel === "same"
      ? "bg-rel-same"
      : rel === "adjacent"
        ? "bg-rel-adjacent"
        : rel === "relative"
          ? "bg-rel-relative"
          : rel === "two" || rel === "diagonal"
            ? "bg-rel-mid"
            : rel === "jump"
              ? "bg-rel-jump"
              : "bg-faint";
  return (
    <span title={title} className={cn("inline-flex items-center justify-end gap-1.5", tone)}>
      <i className={cn("inline-block size-2 shrink-0 rounded-full", dot)} aria-hidden="true" />
      {children}
    </span>
  );
}

export function Pager({
  page,
  pages,
  onPage,
  prev,
  next,
  label,
}: {
  page: number;
  pages: number;
  onPage: (page: number) => void;
  prev: string;
  next: string;
  label: string;
}) {
  if (pages <= 1) return null;
  return (
    <div className="mt-4 flex items-center justify-between gap-3">
      <Button disabled={page === 0} onClick={() => onPage(page - 1)}>
        {prev}
      </Button>
      <p className="text-sm tabular-nums text-muted">
        {label} {page + 1} / {pages}
      </p>
      <Button disabled={page >= pages - 1} onClick={() => onPage(page + 1)}>
        {next}
      </Button>
    </div>
  );
}

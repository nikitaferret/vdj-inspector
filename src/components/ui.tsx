import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import { clsx } from "clsx";

export function cn(...parts: Array<string | false | null | undefined>): string {
  return clsx(parts);
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-lg border border-white/10 bg-elevated p-4 shadow-sm", className)}>
      {children}
    </section>
  );
}

export function PageIntro({ title, lead }: { title: string; lead: string }) {
  return (
    <header className="mb-5 max-w-3xl">
      <h1 className="font-display text-[clamp(1.75rem,4vw,2.25rem)] tracking-tight text-fg">{title}</h1>
      <p className="mt-2 text-sm text-muted">{lead}</p>
    </header>
  );
}

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c8f500]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-[#c8f500] text-[#0b0f00] hover:bg-[#c8f500]/90",
        primary: "bg-[#c8f500] text-[#0b0f00] hover:bg-[#c8f500]/90",
        outline: "border border-white/15 bg-transparent hover:bg-white/5 hover:border-white/30",
        secondary: "bg-subtle text-fg hover:bg-subtle/80",
        ghost: "hover:bg-white/5 hover:text-fg",
        link: "text-[#c8f500] underline-offset-4 hover:underline",
        destructive: "bg-bad text-white hover:bg-bad/90",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export function Button({ className, variant, size, asChild = false, type = "button", ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp type={asChild ? undefined : type} className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { buttonVariants };

const fieldClass =
  "flex h-10 w-full rounded-md border border-white/15 bg-subtle px-3 py-2 text-sm text-fg placeholder:text-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c8f500]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:cursor-not-allowed disabled:opacity-50";

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
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="size-4 rounded border-white/20 accent-[#c8f500]" />
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
          <div className="h-2 rounded-full bg-subtle">
            <div
              className="h-2 rounded-full bg-[#c8f500]"
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
      <Button variant="outline" size="sm" disabled={page === 0} onClick={() => onPage(page - 1)}>
        {prev}
      </Button>
      <p className="text-sm tabular-nums text-muted">
        {label} {page + 1} / {pages}
      </p>
      <Button variant="outline" size="sm" disabled={page >= pages - 1} onClick={() => onPage(page + 1)}>
        {next}
      </Button>
    </div>
  );
}

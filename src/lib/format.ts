const MONTHS = {
  ru: ["янв", "фев", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
} as const;

export function formatStamp(value: string | null | undefined, locale: "ru" | "en"): string {
  if (!value) return "—";
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?/);
  if (!match) return value;
  const day = Number(match[3]);
  const month = MONTHS[locale][Number(match[2]) - 1] ?? match[2];
  const date = `${day} ${month} ${match[1]}`;
  return match[4] ? `${date}, ${match[4]}:${match[5]}` : date;
}

export function formatMonth(key: string, locale: "ru" | "en"): string {
  const match = key.match(/^(\d{4})-(\d{2})$/);
  if (!match) return key;
  const month = MONTHS[locale][Number(match[2]) - 1] ?? match[2];
  return `${month} ${match[1]}`;
}

export function formatSpan(mins: number | null, locale: "ru" | "en"): string {
  if (mins == null) return "—";
  const hours = Math.floor(mins / 60);
  const minutes = mins % 60;
  if (locale === "ru") return hours > 0 ? `${hours} ч ${minutes} мин` : `${minutes} мин`;
  return hours > 0 ? `${hours} h ${minutes} min` : `${minutes} min`;
}

export function formatDuration(seconds: number | null): string {
  if (seconds == null || !Number.isFinite(seconds)) return "—";
  const total = Math.max(0, Math.round(seconds));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

export function formatBpm(bpm: number | null): string {
  if (bpm == null) return "—";
  return Number.isInteger(bpm) ? String(bpm) : bpm.toFixed(1);
}

export function plural(
  locale: "ru" | "en",
  count: number,
  forms: { one: string; few: string; many: string },
): string {
  if (locale === "en") return `${count} ${count === 1 ? forms.one : forms.many}`;
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return `${count} ${forms.one}`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${count} ${forms.few}`;
  return `${count} ${forms.many}`;
}

export function downloadText(filename: string, text: string, type = "text/plain"): void {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function toCsv(rows: string[][]): string {
  const cell = (value: string) => (/[",\n;]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);
  return `\uFEFF${rows.map((row) => row.map((value) => cell(value)).join(",")).join("\n")}`;
}

export function toM3u(rows: { artist: string; title: string; seconds: number | null; filePath: string }[]): string {
  const lines = ["#EXTM3U"];
  for (const row of rows) {
    const seconds = row.seconds == null ? -1 : Math.round(row.seconds);
    lines.push(`#EXTINF:${seconds},${row.artist} - ${row.title}`);
    lines.push(row.filePath);
  }
  return `${lines.join("\n")}\n`;
}

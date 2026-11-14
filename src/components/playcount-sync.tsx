import { useState } from "react";
import { Button, Panel } from "@/components/ui";
import { syncHistoryPlayCounts, type PlayCountSyncResult } from "@/lib/vdj/playcount-sync";
import type { ViewTrack } from "@/lib/vdj/types";

type PickerWindow = Window & {
  showDirectoryPicker?: (options: { id: string; mode: "readwrite" }) => Promise<FileSystemDirectoryHandle>;
};

export function PlayCountSync({ tracks }: { tracks: ViewTrack[] }) {
  const [folder, setFolder] = useState<FileSystemDirectoryHandle | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<PlayCountSyncResult | null>(null);

  async function chooseFolder() {
    const picker = (window as PickerWindow).showDirectoryPicker;
    if (!picker) {
      setMessage("Для записи в database.xml откройте приложение в актуальном Chrome или Edge.");
      return;
    }
    try {
      const handle = await picker({ id: "vdj-inspector-write", mode: "readwrite" });
      setFolder(handle);
      setMessage("");
      setResult(null);
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") setMessage(error.message);
    }
  }

  async function runSync() {
    if (!folder) return;
    if (!window.confirm("Заменить Infos.PlayCount в database.xml значениями из History? Перед записью будет создана резервная копия.")) return;
    setBusy(true);
    setMessage("");
    setResult(null);
    try {
      const permission = await folder.requestPermission?.({ mode: "readwrite" });
      if (permission && permission !== "granted") throw new Error("Нет разрешения на запись в выбранную папку.");
      const summary = await syncHistoryPlayCounts(folder, tracks);
      setResult(summary);
      setMessage(summary.changed > 0 ? "Счётчики записаны и проверены." : "Изменений не требуется.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Не удалось выполнить синхронизацию.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Panel className="mb-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-medium">Синхронизация счётчиков VirtualDJ</h2>
          <p className="mt-1 text-xs text-muted">
            {folder ? "Папка базы выбрана. Будет изменён только Infos.PlayCount." : "Выберите папку VirtualDJ, где находится database.xml."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => void chooseFolder()} disabled={busy}>
            {folder ? "Сменить папку" : "Выбрать папку"}
          </Button>
          <Button size="sm" onClick={() => void runSync()} disabled={!folder || busy || tracks.length === 0}>
            {busy ? "Синхронизация…" : "Синхронизировать"}
          </Button>
        </div>
      </div>
      {message ? <p className="mt-3 text-sm text-muted" role="status">{message}</p> : null}
      {result ? (
        <p className="mt-2 text-xs text-muted">
          Обработано: {result.updated} · Изменено: {result.changed} · Пропущено: {result.skipped}
          {result.backupName ? ` · Резервная копия: ${result.backupName}` : ""}
        </p>
      ) : null}
    </Panel>
  );
}

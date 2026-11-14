import { useMemo, useState } from "react";
import { Button, Panel } from "@/components/ui";
import { setVdjPlayCount, syncHistoryPlayCounts, type PlayCountSyncResult } from "@/lib/vdj/playcount-sync";
import type { ViewTrack } from "@/lib/vdj/types";

type WritableDirectory = FileSystemDirectoryHandle & { requestPermission?: (descriptor: { mode: "readwrite" }) => Promise<PermissionState> };
type PickerWindow = Window & {
  showDirectoryPicker?: (options: { id: string; mode: "readwrite" }) => Promise<FileSystemDirectoryHandle>;
};

export function PlayCountSync({ tracks }: { tracks: ViewTrack[] }) {
  const [folder, setFolder] = useState<WritableDirectory | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<PlayCountSyncResult | null>(null);
  const [selectedId, setSelectedId] = useState("");
  const [manualCount, setManualCount] = useState("");
  const selectedTrack = useMemo(() => tracks.find((track) => track.id === selectedId) ?? null, [selectedId, tracks]);

  async function chooseFolder() {
    const picker = (window as PickerWindow).showDirectoryPicker;
    if (!picker) {
      setMessage("Для записи в database.xml откройте приложение в актуальном Chrome или Edge.");
      return;
    }
    try {
      const handle = await picker({ id: "vdj-inspector-write", mode: "readwrite" }) as WritableDirectory;
      setFolder(handle);
      setMessage("");
      setResult(null);
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") setMessage(error.message);
    }
  }

  async function withWritePermission(): Promise<void> {
    if (!folder) throw new Error("Сначала выберите папку VirtualDJ.");
    const permission = await folder.requestPermission?.({ mode: "readwrite" });
    if (permission && permission !== "granted") throw new Error("Нет разрешения на запись в выбранную папку.");
  }

  async function runSync() {
    if (!folder) return;
    if (!window.confirm("Заменить Infos.PlayCount в database.xml значениями из History? Перед записью будет создана и проверена резервная копия.")) return;
    setBusy(true);
    setMessage("");
    setResult(null);
    try {
      await withWritePermission();
      const summary = await syncHistoryPlayCounts(folder, tracks);
      setResult(summary);
      setMessage(summary.changed > 0 ? "Счётчики записаны и проверены." : "Изменений не требуется.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Не удалось выполнить синхронизацию.");
    } finally {
      setBusy(false);
    }
  }

  async function saveManualCount() {
    if (!folder || !selectedTrack) return;
    const count = Number(manualCount);
    if (!Number.isSafeInteger(count) || count < 0) {
      setMessage("Введите целое неотрицательное число.");
      return;
    }
    if (!window.confirm("Изменить VDJ-счётчик для выбранного трека? Будет создана отдельная резервная копия database.xml.")) return;
    setBusy(true);
    setMessage("");
    try {
      await withWritePermission();
      const backup = await setVdjPlayCount(folder, selectedTrack.filePath, count);
      setMessage("VDJ-счётчик записан. Резервная копия: " + backup);
      setManualCount("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Не удалось изменить счётчик.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Panel className="mb-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-medium">Счётчики VirtualDJ</h2>
          <p className="mt-1 text-xs text-muted">
            {folder ? "Папка базы выбрана. Изменяется только Infos.PlayCount." : "Выберите папку VirtualDJ, где находится database.xml."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => void chooseFolder()} disabled={busy}>
            {folder ? "Сменить папку" : "Выбрать папку"}
          </Button>
          <Button size="sm" onClick={() => void runSync()} disabled={!folder || busy || tracks.length === 0}>
            {busy ? "Обработка…" : "Синхронизировать с History"}
          </Button>
        </div>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-[minmax(0,1fr)_7rem_auto]">
        <select
          aria-label="Трек для ручного изменения VDJ-счётчика"
          className="h-9 min-w-0 rounded-md border border-white/15 bg-subtle px-2 text-sm"
          value={selectedId}
          onChange={(event) => {
            const track = tracks.find((item) => item.id === event.target.value);
            setSelectedId(event.target.value);
            setManualCount(track ? String(track.playCount) : "");
            setMessage("");
          }}
        >
          <option value="">Выберите трек для ручного изменения…</option>
          {tracks.map((track) => (
            <option key={track.id} value={track.id}>{track.artist} — {track.title}</option>
          ))}
        </select>
        <input
          aria-label="Новое значение VDJ-счётчика"
          className="h-9 rounded-md border border-white/15 bg-subtle px-2 text-sm tabular-nums"
          type="number"
          min="0"
          step="1"
          value={manualCount}
          onChange={(event) => setManualCount(event.target.value)}
          disabled={!selectedTrack || busy}
          placeholder="VDJ"
        />
        <Button size="sm" variant="outline" onClick={() => void saveManualCount()} disabled={!folder || !selectedTrack || busy || manualCount === ""}>
          Сохранить VDJ
        </Button>
      </div>
      {message ? <p className="mt-3 text-sm text-muted" role="status">{message}</p> : null}
      {result ? (
        <p className="mt-2 text-xs text-muted">
          Обработано: {result.updated} · Изменено: {result.changed} · Пропущено: {result.skipped}
          {result.backupName ? " · Резервная копия: " + result.backupName : ""}
        </p>
      ) : null}
    </Panel>
  );
}

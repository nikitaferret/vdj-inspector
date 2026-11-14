import type { RawTrack } from "@/lib/vdj/types";
import { parseDatabaseXml } from "@/lib/vdj/parse";

export type PlayCountSyncResult = {
  updated: number;
  changed: number;
  skipped: number;
  backupName: string | null;
};

type SyncTrack = Pick<RawTrack, "filePath"> & { historyPlays: number };

function pathKey(value: string): string {
  return value.replace(/\\/g, "/").replace(/\/+/g, "/").trim().toLowerCase();
}

function decodeXml(value: string): string {
  return value.replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
}

async function writeText(handle: FileSystemFileHandle, value: string): Promise<void> {
  const writer = await handle.createWritable();
  try {
    await writer.write(value);
    await writer.close();
  } catch (error) {
    await writer.abort().catch(() => undefined);
    throw error;
  }
}

function backupFileName(): string {
  return "database.xml.backup-" + new Date().toISOString().replace(/[:.]/g, "-") + "-" + Math.random().toString(36).slice(2, 8);
}

async function createVerifiedBackup(root: FileSystemDirectoryHandle, original: string): Promise<string> {
  const name = backupFileName();
  const handle = await root.getFileHandle(name, { create: true });
  await writeText(handle, original);
  if ((await (await handle.getFile()).text()) !== original) throw new Error("Резервная копия не прошла проверку. База не изменена.");
  return name;
}

async function writeAndVerify(handle: FileSystemFileHandle, original: string, next: string): Promise<void> {
  try {
    await writeText(handle, next);
    if ((await (await handle.getFile()).text()) !== next) throw new Error("Не удалось проверить записанную database.xml");
  } catch (error) {
    await writeText(handle, original).catch(() => undefined);
    throw error;
  }
}

export async function syncHistoryPlayCounts(
  root: FileSystemDirectoryHandle,
  tracks: SyncTrack[],
): Promise<PlayCountSyncResult> {
  const databaseHandle = await root.getFileHandle("database.xml");
  const original = await (await databaseHandle.getFile()).text();
  const counts = new Map<string, number>();
  const ambiguous = new Set<string>();

  for (const track of tracks) {
    const key = pathKey(track.filePath);
    if (!key || track.historyPlays <= 0) continue;
    if (counts.has(key)) ambiguous.add(key);
    else counts.set(key, Math.max(0, Math.round(track.historyPlays)));
  }
  for (const key of ambiguous) counts.delete(key);

  let updated = 0;
  let changed = 0;
  let skipped = ambiguous.size;
  const seen = new Set<string>();
  const next = original.replace(/<Song\b([^>]*)>([\s\S]*?)<\/Song>/gi, (whole, attrs: string, body: string) => {
    const pathMatch = attrs.match(/\bFilePath\s*=\s*"([^"]*)"/i);
    const key = pathKey(pathMatch ? decodeXml(pathMatch[1]) : "");
    if (!key || !counts.has(key)) return whole;
    if (seen.has(key)) {
      skipped += 1;
      return whole;
    }
    seen.add(key);
    const count = counts.get(key)!;
    const infos = body.match(/<Infos\b([^>]*)\/?>/i);
    if (!infos) {
      skipped += 1;
      return whole;
    }
    const current = infos[1].match(/\bPlayCount\s*=\s*"([^"]*)"/i)?.[1];
    const currentNumber = current == null ? null : Number(current);
    const updatedAttrs = /\bPlayCount\s*=\s*"[^"]*"/i.test(infos[1])
      ? infos[1].replace(/\bPlayCount\s*=\s*"[^"]*"/i, "PlayCount=\"" + count + "\"")
      : infos[1] + " PlayCount=\"" + count + "\"";
    const replacement = infos[0].replace(infos[1], updatedAttrs);
    updated += 1;
    if (currentNumber !== count) changed += 1;
    return whole.replace(infos[0], replacement);
  });

  skipped += [...counts.keys()].filter((key) => !seen.has(key)).length;
  if (changed === 0) return { updated, changed, skipped, backupName: null };

  // Validate the complete XML with the same parser used by the importer before touching the source file.
  const verifiedTracks = parseDatabaseXml(next);
  if (verifiedTracks.length === 0) throw new Error("Проверка XML не пройдена. База не изменена.");

  const backupName = await createVerifiedBackup(root, original);
  await writeAndVerify(databaseHandle, original, next);
  return { updated, changed, skipped, backupName };
}

export async function setVdjPlayCount(
  root: FileSystemDirectoryHandle,
  filePath: string,
  count: number,
): Promise<string> {
  if (!Number.isSafeInteger(count) || count < 0) throw new Error("Счётчик должен быть целым неотрицательным числом.");
  const databaseHandle = await root.getFileHandle("database.xml");
  const original = await (await databaseHandle.getFile()).text();
  const wanted = pathKey(filePath);
  let matches = 0;
  let changed = false;
  const next = original.replace(/<Song\b([^>]*)>([\s\S]*?)<\/Song>/gi, (whole, attrs: string, body: string) => {
    const pathMatch = attrs.match(/\bFilePath\s*=\s*"([^"]*)"/i);
    if (pathKey(pathMatch ? decodeXml(pathMatch[1]) : "") !== wanted) return whole;
    matches += 1;
    const infos = body.match(/<Infos\b([^>]*)\/?>/i);
    if (!infos) throw new Error("У записи трека отсутствует блок Infos.");
    const old = infos[1].match(/\bPlayCount\s*=\s*"[^"]*"/i)?.[0];
    const attrsNext = old
      ? infos[1].replace(old, "PlayCount=\"" + count + "\"")
      : infos[1] + " PlayCount=\"" + count + "\"";
    changed = true;
    return whole.replace(infos[0], infos[0].replace(infos[1], attrsNext));
  });
  if (matches !== 1) throw new Error(matches === 0 ? "Трек не найден в database.xml." : "Путь трека неоднозначен. Изменение отменено.");
  if (!changed) throw new Error("Не удалось подготовить изменение.");
  const backupName = await createVerifiedBackup(root, original);
  await writeAndVerify(databaseHandle, original, next);
  return backupName;
}


type DirectoryWithEntries = FileSystemDirectoryHandle & {
  entries(): AsyncIterable<[string, FileSystemHandle]>;
};

export async function listPlayCountBackups(root: FileSystemDirectoryHandle): Promise<string[]> {
  const folder = root as DirectoryWithEntries;
  if (!folder.entries) return [];
  const names: string[] = [];
  for await (const [name, handle] of folder.entries()) {
    if (handle.kind === "file" && /^database\.xml\.backup-/.test(name)) names.push(name);
  }
  return names.sort().reverse();
}

export async function restorePlayCountBackup(root: FileSystemDirectoryHandle, backupName: string): Promise<string> {
  if (!/^database\.xml\.backup-[\wT.:-]+$/.test(backupName)) throw new Error("Недопустимое имя резервной копии.");
  const databaseHandle = await root.getFileHandle("database.xml");
  const backupHandle = await root.getFileHandle(backupName);
  const original = await (await databaseHandle.getFile()).text();
  const backup = await (await backupHandle.getFile()).text();
  if (!/<Song\b/i.test(backup)) throw new Error("Файл резервной копии не похож на database.xml.");
  const safetyBackup = await createVerifiedBackup(root, original);
  await writeAndVerify(databaseHandle, original, backup);
  return safetyBackup;
}

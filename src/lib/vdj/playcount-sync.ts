import type { RawTrack } from "@/lib/vdj/types";

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

function writeText(handle: FileSystemFileHandle, value: string): Promise<void> {
  return handle.createWritable().then(async (writer) => {
    try {
      await writer.write(value);
      await writer.close();
    } catch (error) {
      await writer.abort().catch(() => undefined);
      throw error;
    }
  });
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
  let skipped = 0;
  const seen = new Set<string>();
  const next = original.replace(/<Song\\b([^>]*)>([\\s\\S]*?)<\\/Song>/gi, (whole, attrs: string, body: string) => {
    const pathMatch = attrs.match(/\\bFilePath\\s*=\\s*"([^"]*)"/i);
    const filePath = pathMatch ? decodeXml(pathMatch[1]) : "";
    const key = pathKey(filePath);
    if (!key || !counts.has(key)) return whole;
    if (seen.has(key)) {
      skipped += 1;
      return whole;
    }
    seen.add(key);
    const count = counts.get(key)!;
    const infos = body.match(/<Infos\\b([^>]*)\\/?>/i);
    if (!infos) {
      skipped += 1;
      return whole;
    }
    const current = infos[1].match(/\\bPlayCount\\s*=\\s*"([^"]*)"/i)?.[1];
    const currentNumber = current == null ? null : Number(current);
    const updatedAttrs = /\\bPlayCount\\s*=\\s*"[^"]*"/i.test(infos[1])
      ? infos[1].replace(/\\bPlayCount\\s*=\\s*"[^"]*"/i, `PlayCount="${count}"`)
      : `${infos[1]} PlayCount="${count}"`;
    const replacement = infos[0].replace(infos[1], updatedAttrs);
    updated += 1;
    if (currentNumber !== count) changed += 1;
    return whole.replace(infos[0], replacement);
  });

  skipped += [...counts.keys()].filter((key) => !seen.has(key)).length;
  if (changed === 0) return { updated, changed, skipped, backupName: null };

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupName = `database.xml.backup-${stamp}`;
  const backupHandle = await root.getFileHandle(backupName, { create: true });
  await writeText(backupHandle, original);

  try {
    await writeText(databaseHandle, next);
    const verified = await (await databaseHandle.getFile()).text();
    if (verified !== next) throw new Error("Не удалось проверить записанную database.xml");
  } catch (error) {
    await writeText(databaseHandle, original).catch(() => undefined);
    throw error;
  }

  return { updated, changed, skipped, backupName };
}

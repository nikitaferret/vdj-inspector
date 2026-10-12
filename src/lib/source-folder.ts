const HISTORY_FILE = /\.(m3u8?|txt)$/i;

type ReadableFolder = FileSystemDirectoryHandle & {
  entries(): AsyncIterable<[string, FileSystemHandle]>;
  queryPermission?(descriptor: { mode: "read" }): Promise<PermissionState>;
  requestPermission?(descriptor: { mode: "read" }): Promise<PermissionState>;
};

export function canPickFolder(): boolean {
  return typeof window !== "undefined" && "showDirectoryPicker" in window;
}

export function pickSourceFolder(): Promise<FileSystemDirectoryHandle> {
  const picker = (window as unknown as {
    showDirectoryPicker: (options: { id: string; mode: "read" }) => Promise<FileSystemDirectoryHandle>;
  }).showDirectoryPicker;
  return picker({ id: "vdj-inspector", mode: "read" });
}

export async function allowFolder(handle: FileSystemDirectoryHandle): Promise<boolean> {
  const folder = handle as ReadableFolder;
  if (!folder.queryPermission || !folder.requestPermission) return true;
  if ((await folder.queryPermission({ mode: "read" })) === "granted") return true;
  return (await folder.requestPermission({ mode: "read" })) === "granted";
}

export async function readSourceFolder(root: FileSystemDirectoryHandle): Promise<File[]> {
  const files: File[] = [];
  try {
    const database = await root.getFileHandle("database.xml");
    files.push(await withPath(await database.getFile(), "database.xml"));
  } catch {
    // The chosen folder may be History itself.
  }

  const history = await findHistory(root);
  if (history) {
    for await (const [name, handle] of (history.handle as ReadableFolder).entries()) {
      if (files.length > 8000) break;
      if (handle.kind !== "file" || !HISTORY_FILE.test(name)) continue;
      files.push(await withPath(await (handle as FileSystemFileHandle).getFile(), `${history.prefix}${name}`));
    }
  }
  return files;
}

async function findHistory(
  root: FileSystemDirectoryHandle,
): Promise<{ handle: FileSystemDirectoryHandle; prefix: string } | null> {
  for (const name of ["History", "history"]) {
    try {
      return { handle: await root.getDirectoryHandle(name), prefix: `${name}/` };
    } catch {
      // try the next spelling
    }
  }
  return { handle: root, prefix: "" };
}

async function withPath(file: File, path: string): Promise<File> {
  if (path && path !== file.name) Object.defineProperty(file, "webkitRelativePath", { value: path });
  return file;
}

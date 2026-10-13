import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { collectDroppedFiles, type IngestResult } from "@/lib/ingest";
import type { Copy } from "@/lib/i18n";
import { Button } from "@/components/ui";

export function describeIngest(result: IngestResult, t: Copy): string {
  if (!result.ok) {
    if (result.error === "empty") return t.importEmpty;
    if (result.error === "no-songs") return t.importNoSongs;
    if (result.error === "not-history") return t.importNotHistory;
    return t.importUnrecognized;
  }
  const skipped = result.ignored.length ? ` ${t.ignored}: ${result.ignored.join(", ")}.` : "";
  return `${result.tracks} ${t.importedTracks}. ${result.plays} ${t.importedPlays}.${skipped}`;
}

export function ImportDialog({
  t,
  busy,
  onClose,
  onFiles,
}: {
  t: Copy;
  busy: boolean;
  onClose: () => void;
  onFiles: (files: File[]) => void;
}) {
  const [hot, setHot] = useState(false);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (!open) onClose();
  }, [open, onClose]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-bg/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-[81] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-white/10 bg-elevated p-4 shadow-lg"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="flex items-center justify-between gap-3">
            <Dialog.Title className="font-display text-lg tracking-tight">{t.importTitle}</Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="ghost" size="sm">
                {t.close}
              </Button>
            </Dialog.Close>
          </div>

          <Dialog.Description className="mt-2 text-xs text-muted">{t.importHelp}</Dialog.Description>

          <label
            className={`relative mt-4 flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed px-4 text-center text-sm transition-colors ${
              hot ? "border-[#c8f500] bg-[#c8f500]/5" : "border-white/15 hover:border-white/30"
            }`}
            onDragOver={(event) => {
              event.preventDefault();
              setHot(true);
            }}
            onDragLeave={() => setHot(false)}
            onDrop={(event) => {
              event.preventDefault();
              setHot(false);
              const transfer = event.dataTransfer;
              if (!transfer) return;
              void collectDroppedFiles(transfer).then((files) => {
                if (files.length) onFiles(files);
              });
            }}
          >
            <span className="pointer-events-none text-muted">{busy ? t.importBusy : t.importDrop}</span>
            <input
              className="absolute inset-0 cursor-pointer opacity-0"
              type="file"
              multiple
              accept=".xml,.txt,.m3u,.m3u8,text/xml,text/plain,audio/x-mpegurl"
              onChange={(event) => {
                const files = event.target.files ? [...event.target.files] : [];
                event.target.value = "";
                if (files.length) onFiles(files);
              }}
            />
          </label>

          <div className="mt-3 flex gap-2">
            <label className="relative inline-flex">
              <span className="pointer-events-none inline-flex h-9 items-center justify-center rounded-md border border-white/15 px-3 text-sm hover:bg-white/5">
                {t.importFolder}
              </span>
              <input
                className="absolute inset-0 cursor-pointer opacity-0"
                type="file"
                multiple
                ref={(node) => {
                  node?.setAttribute("webkitdirectory", "");
                }}
                onChange={(event) => {
                  const files = event.target.files ? [...event.target.files] : [];
                  event.target.value = "";
                  if (files.length) onFiles(files);
                }}
              />
            </label>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setReady(true), 250);
    return () => window.clearTimeout(id);
  }, []);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-bg/80 p-4 sm:items-center"
      onMouseDown={(event) => {
        if (!ready) return;
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="import-title"
        className="max-h-[85dvh] w-full max-w-lg overflow-y-auto rounded-lg bg-elevated p-4"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id="import-title" className="font-display text-2xl tracking-tight">
            {t.importTitle}
          </h2>
          <Button onClick={onClose}>{t.close}</Button>
        </div>
        <p className="mt-3 text-sm text-muted">{t.importHelp}</p>
        <label
          className={`relative mt-4 flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed px-4 text-center text-sm ${hot ? "border-accent bg-subtle" : "border-line"}`}
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
          <span className="pointer-events-none">{busy ? t.importBusy : t.importDrop}</span>
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
        <label className="relative mt-3 inline-flex">
          <span className="pointer-events-none inline-flex h-11 items-center justify-center rounded-sm border border-line bg-elevated px-4 text-sm font-medium">
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
    </div>,
    document.body,
  );
}

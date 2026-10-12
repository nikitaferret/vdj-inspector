import { useEffect, useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Disc3, History, LayoutDashboard, Library, ListMusic, MoreHorizontal, Music2, Settings2, Upload } from "lucide-react";
import { ImportDialog, describeIngest } from "@/components/import-dialog";
import { Button, cn } from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { ingestFiles, collectDroppedFiles } from "@/lib/ingest";
import { readSourceFolder, allowFolder, canPickFolder, pickSourceFolder } from "@/lib/source-folder";
import { loadSnapshot, loadSourceFolder, saveSourceFolder } from "@/lib/vdj/idb";
import { profileLabel, useLibrary, useSettings } from "@/lib/store";

const LINKS = [
  { href: "/", key: "navOverview", tip: "navTipOverview", icon: LayoutDashboard },
  { href: "/library", key: "navLibrary", tip: "navTipLibrary", icon: Library },
  { href: "/history", key: "navHistory", tip: "navTipHistory", icon: History },
  { href: "/sessions", key: "navSessions", tip: "navTipSessions", icon: ListMusic },
  { href: "/wheel", key: "navWheel", tip: "navTipWheel", icon: Disc3 },
  { href: "/crate", key: "navCrate", tip: "navTipCrate", icon: Music2 },
  { href: "/settings", key: "navSettings", tip: "navTipSettings", icon: Settings2 },
] as const;

function isActive(path: string, href: string): boolean {
  if (href === "/") return path === "/";
  return path === href || path.startsWith(`${href}/`);
}

export function Shell({ children }: { children: ReactNode }) {
  const { t, locale } = useI18n();
  const path = useRouterState({ select: (state) => state.location.pathname });
  const origin = useLibrary((state) => state.origin);
  const trackCount = useLibrary((state) => state.tracks.length);
  const profileRef = useSettings((state) => state.profileRef);
  const profiles = useSettings((state) => state.profiles);
  const [open, setOpen] = useState(false);
  const [more, setMore] = useState(false);
  const [busy, setBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const rules = profileLabel(profileRef, profiles, locale, t.customRules);

  const [offline, setOffline] = useState(false);
  const importNonce = useLibrary((state) => state.importNonce);

  useEffect(() => {
    if (importNonce > 0) setOpen(true);
  }, [importNonce]);

  useEffect(() => {
    void useSettings.persist.rehydrate();
    void loadSnapshot().then((snapshot) => {
      if (snapshot) useLibrary.getState().hydrate(snapshot);
    });
  }, []);

  useEffect(() => {
    const sync = () => setOffline(typeof navigator !== "undefined" && !navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        setMore(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function refreshData() {
    if (!canPickFolder()) {
      setBanner(t.refreshUnsupported);
      setOpen(true);
      return;
    }
    setBusy(true);
    setRefreshing(true);
    try {
      let handle = await loadSourceFolder();
      if (!handle) {
        handle = await pickSourceFolder();
        await saveSourceFolder(handle);
      }
      if (!(await allowFolder(handle))) {
        setBanner(t.refreshDenied);
        return;
      }
      const files = await readSourceFolder(handle);
      setBanner(describeIngest(await ingestFiles(files), t));
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setBanner(t.refreshUnsupported);
    } finally {
      setBusy(false);
      setRefreshing(false);
    }
  }

  async function takeFiles(files: File[]) {
    setBusy(true);
    try {
      const result = await ingestFiles(files);
      setBanner(describeIngest(result, t));
      if (result.ok) setOpen(false);
    } finally {
      setBusy(false);
      setDragging(false);
    }
  }

  useEffect(() => {
    let depth = 0;
    const hasFiles = (event: DragEvent) => event.dataTransfer?.types.includes("Files");
    const onOver = (event: DragEvent) => {
      if (!hasFiles(event)) return;
      event.preventDefault();
    };
    const onEnter = (event: DragEvent) => {
      if (!hasFiles(event)) return;
      event.preventDefault();
      depth += 1;
      setDragging(true);
    };
    const onLeave = () => {
      depth -= 1;
      if (depth <= 0) {
        depth = 0;
        setDragging(false);
      }
    };
    const onDrop = (event: DragEvent) => {
      if (!hasFiles(event)) return;
      event.preventDefault();
      depth = 0;
      setDragging(false);
      const transfer = event.dataTransfer;
      if (!transfer) return;
      void collectDroppedFiles(transfer).then((files) => {
        if (files.length) void takeFiles(files);
      });
    };
    const resetDrag = () => {
      depth = 0;
      setDragging(false);
    };
    window.addEventListener("dragover", onOver);
    window.addEventListener("dragenter", onEnter);
    window.addEventListener("dragleave", onLeave);
    window.addEventListener("drop", onDrop);
    window.addEventListener("pointerdown", resetDrag);
    return () => {
      window.removeEventListener("dragover", onOver);
      window.removeEventListener("dragenter", onEnter);
      window.removeEventListener("dragleave", onLeave);
      window.removeEventListener("drop", onDrop);
      window.removeEventListener("pointerdown", resetDrag);
    };
  }, [t]);

  const mobile = [
    LINKS[0],
    LINKS[1],
    LINKS[4],
    LINKS[3],
  ] as const;

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 flex-col border-r border-line bg-elevated px-3 py-5 md:flex">
        <div className="px-3">
          <p className="font-display text-2xl tracking-tight">{t.appName}</p>
          <p className="text-sm text-muted">{t.tagline}</p>
        </div>
        <nav className="mt-6 flex flex-1 flex-col gap-1">
          {LINKS.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              title={t[item.tip]}
              aria-current={isActive(path, item.href) ? "page" : undefined}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-sm px-3 text-sm",
                isActive(path, item.href) ? "bg-subtle text-fg" : "text-muted",
              )}
            >
              <item.icon className="size-4 shrink-0" aria-hidden="true" />
              {t[item.key]}
            </Link>
          ))}
        </nav>
        <div className="mt-4 space-y-3 px-3">
          <p className="text-sm text-muted">
            {t.rules}: {rules}
          </p>
          <p className="text-sm text-fg">
            {origin === "demo" ? t.demoData : t.yourData} · {trackCount}
          </p>
        </div>
      </aside>

      <div className="md:pl-60">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-line bg-bg px-4">
          <div className="min-w-0">
            <p className="font-display text-lg leading-none md:hidden">{t.appName}</p>
            <p className="truncate text-xs text-muted md:text-sm">{rules}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button onClick={() => void refreshData()} disabled={busy}>
              {refreshing ? t.refreshBusy : t.refreshData}
            </Button>
            <Button variant="primary" onClick={() => setOpen(true)} disabled={busy}>
              <Upload className="size-4" aria-hidden="true" />
              {t.import}
            </Button>
          </div>
        </header>
        <main className="app-main mx-auto w-full max-w-6xl px-4 pt-4 md:px-6 md:pt-6">
          {offline ? (
            <div className="mb-4 rounded-lg bg-elevated px-4 py-3 text-sm">{t.offlineBanner}</div>
          ) : null}
          {banner ? (
            <div className="mb-4 flex items-start justify-between gap-3 rounded-lg bg-elevated px-4 py-3 text-sm">
              <p>{banner}</p>
              <button type="button" className="shrink-0 text-muted" onClick={() => setBanner(null)}>
                {t.close}
              </button>
            </div>
          ) : null}
          {children}
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-elevated md:hidden">
        <div className="grid grid-cols-5">
          {mobile.map((item) => {
            const Icon = item.icon;
            const active = isActive(path, item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                title={t[item.tip]}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 px-1 text-xs",
                  active ? "text-fg" : "text-muted",
                )}
              >
                <Icon className="size-5" aria-hidden="true" />
                {t[item.key]}
              </Link>
            );
          })}
          <button
            type="button"
            className={cn("flex min-h-14 flex-col items-center justify-center gap-1 text-xs", more ? "text-fg" : "text-muted")}
            onClick={() => setMore((value) => !value)}
          >
            <MoreHorizontal className="size-5" aria-hidden="true" />
            {t.more}
          </button>
        </div>
      </nav>

      {more ? (
        <div className="fixed inset-0 z-40 bg-bg/80 md:hidden" onClick={() => setMore(false)}>
          <div className="sheet-above-nav absolute inset-x-3 rounded-lg border border-line bg-elevated p-3" onClick={(event) => event.stopPropagation()}>
            <div className="grid gap-1">
              {[LINKS[2], LINKS[5], LINKS[6]].map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMore(false)}
                  className="flex min-h-11 items-center rounded-sm px-3 text-sm"
                >
                  {t[item.key]}
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {dragging ? (
        <div
          className="pointer-events-none fixed inset-0 z-40 border-2 border-dashed border-accent bg-bg/70"
          style={{ pointerEvents: "none" }}
        />
      ) : null}

      {open ? <ImportDialog t={t} busy={busy} onClose={() => setOpen(false)} onFiles={(files) => void takeFiles(files)} /> : null}
    </div>
  );
}

import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { useSettings } from "@/lib/store";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "VDJ Inspector" },
      { name: "theme-color", content: "#080a0c" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;600;700&display=swap",
      },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  const locale = useSettings((state) => state.locale);
  return (
    <html lang={locale} className="antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <Shell>
          <Outlet />
        </Shell>
        <Scripts />
      </body>
    </html>
  );
}

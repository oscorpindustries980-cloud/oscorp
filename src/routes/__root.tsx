import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { PortalProvider } from "@/lib/portal-store";
import { SiteHeader } from "@/components/site-header";
import { SuspensionBanner } from "@/components/suspension-banner";
import { AiAssistant } from "@/components/ai-assistant";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Oscorp Industries — Advanced Enterprise Quotation & Contract Portal" },
      { name: "description", content: "Oscorp Industries Corporation's enterprise portal for vendor quotations, contract approvals, personnel verification and secure document dispatch." },
      { name: "author", content: "Oscorp Industries Corporation" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "Oscorp Industries — Advanced Enterprise Quotation & Contract Portal" },
      { name: "twitter:title", content: "Oscorp Industries — Advanced Enterprise Quotation & Contract Portal" },
      { property: "og:description", content: "Oscorp Industries Corporation's enterprise portal for vendor quotations, contract approvals, personnel verification and secure document dispatch." },
      { name: "twitter:description", content: "Oscorp Industries Corporation's enterprise portal for vendor quotations, contract approvals, personnel verification and secure document dispatch." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/b5474182-8720-479f-add4-37590107c243" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/b5474182-8720-479f-add4-37590107c243" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700&family=Inter+Tight:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <PortalProvider>
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <SuspensionBanner />
          <main className="flex-1">
            <Outlet />
          </main>
          <footer className="border-t border-border bg-background">
            <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:px-6">
              <div className="space-y-1">
                <p className="font-medium text-primary">Oscorp Industries Corporation</p>
                <p>1 Oscorp Plaza, Manhattan, New York · CIN U29100NY1961PLC004512</p>
                <p>© 2026 Oscorp Industries Corporation. All rights reserved.</p>
              </div>
              <div className="space-y-1 sm:ml-auto sm:text-right">
                <p>
                  Contracts desk ·{" "}
                  <span className="font-mono text-primary">contracts@oscorp.com</span>
                </p>
                <p>Vendor helpline · +1 (212) 555-0142 · Mon–Fri, 09:00–18:00 ET</p>
                <p>ISO 9001:2015 · ISO 45001 · GDPR &amp; SOC 2 Type II aligned</p>
              </div>
            </div>
          </footer>
          <AiAssistant />
        </div>
        <Toaster position="top-right" richColors />
      </PortalProvider>
    </QueryClientProvider>
  );
}

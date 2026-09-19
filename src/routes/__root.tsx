import { createRootRoute, HeadContent, Link, Outlet, Scripts } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { NavProgress } from "@/components/nav-progress";
import { DeferredWhatsApp } from "@/components/whatsapp-widget";
import { PwaServiceWorker } from "@/components/pwa-service-worker";
import { I18nProvider, useI18n, usePageTitle } from "@/lib/i18n";
import { AppErrorComponent } from "@/lib/error-component";
import { SITE } from "@/lib/site";
import { PWA } from "@/lib/pwa";
import {
  NOT_FOUND_SEO,
  canonicalUrlFromMatches,
  documentFallbackTitle,
  documentRobots,
  isNotFoundDocument,
} from "@/lib/canonical";
import appCss from "../styles.css?url";

const CompareBar = lazy(() => import("@/components/compare-bar").then((mod) => ({ default: mod.CompareBar })));
const PwaInstallTip = lazy(() =>
  import("@/components/pwa-install-tip").then((mod) => ({ default: mod.PwaInstallTip })),
);
const AiStaffPanel = lazy(() => import("@/components/ai-staff").then((mod) => ({ default: mod.AiStaffPanel })));
const FirstVisitTour = lazy(() =>
  import("@/components/first-visit-tour").then((mod) => ({ default: mod.FirstVisitTour })),
);

export const Route = createRootRoute({
  head: ({ matches }) => {
    const pageUrl = canonicalUrlFromMatches(matches);
    const notFoundDoc = isNotFoundDocument(matches);
    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { title: documentFallbackTitle(matches) },
        { name: "description", content: notFoundDoc ? NOT_FOUND_SEO.description : SITE.description },
        { name: "theme-color", content: PWA.themeColor },
        { name: "apple-mobile-web-app-title", content: SITE.name },
        { name: "apple-mobile-web-app-capable", content: "yes" },
        { name: "mobile-web-app-capable", content: "yes" },
        { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
        { name: "robots", content: documentRobots(matches) },
        ...(notFoundDoc ? [] : [{ property: "og:url", content: pageUrl }]),
      ],
      links: [
        ...(notFoundDoc ? [] : [{ rel: "canonical", href: pageUrl }]),
        { rel: "icon", href: "/favicon.ico", sizes: "48x48" },
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
        { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32.png" },
        { rel: "icon", type: "image/png", sizes: "48x48", href: "/favicon-48.png" },
        { rel: "icon", type: "image/png", sizes: "96x96", href: "/favicon-96.png" },
        { rel: "icon", type: "image/png", sizes: "192x192", href: "/icon-192.png" },
        { rel: "icon", type: "image/png", sizes: "512x512", href: "/icon-512.png" },
        { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
        { rel: "stylesheet", href: appCss },
        { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      ],
    };
  },
  notFoundComponent: NotFound,
  errorComponent: AppErrorComponent,
  component: RootLayout,
});

function NotFoundInner() {
  const { t } = useI18n();
  usePageTitle(`${t("notFound")}｜${SITE.name}`);
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <h1 className="text-title font-semibold">{t("notFound")}</h1>
      <p className="mt-3 text-muted">{t("notFoundLead")}</p>
      <Link to="/" className="mt-6 inline-flex h-11 items-center rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground">
        {t("backHome")}
      </Link>
    </div>
  );
}

/** Global 404 can replace the root layout, so it must carry its own provider. */
function NotFound() {
  return (
    <I18nProvider>
      <NotFoundInner />
    </I18nProvider>
  );
}

function SkipLink() {
  const { t } = useI18n();
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
    >
      {t("skipMain")}
    </a>
  );
}

function PageShell() {
  return (
    <main id="main" className="flex-1">
      <div className="page-shell">
        <Outlet />
      </div>
    </main>
  );
}

function RootLayout() {
  return (
    <html lang="zh-HK" className="antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="min-h-dvh bg-bg text-fg">
        <PreviewHostBridge />
        <PwaServiceWorker />
        <NavProgress />
        <I18nProvider>
          <AuthProvider>
            <SkipLink />
            <div className="flex min-h-dvh flex-col">
              <SiteHeader />
              <PageShell />
              <SiteFooter />
            </div>
            <Suspense fallback={null}>
              <CompareBar />
              <PwaInstallTip />
              <AiStaffPanel />
              <FirstVisitTour />
            </Suspense>
            <DeferredWhatsApp />
          </AuthProvider>
        </I18nProvider>
        <Scripts />
      </body>
    </html>
  );
}

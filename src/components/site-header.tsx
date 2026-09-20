import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { AiBetaMark } from "@/components/ai-beta-mark";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { LogoMarkLooking } from "@/components/logo-mark-looking";
import { LangToggle } from "@/components/lang-toggle";
import { useDesk, useHydrateDesk } from "@/lib/desk";
import { useI18n } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";
import type { MessageKey } from "@/lib/messages";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const href = useRouterState({ select: (s) => s.location.href });
  const currentCat = new URL(href, "https://quote.local").searchParams.get("cat");
  useHydrateDesk();
  const compareCount = useDesk((s) => s.compare.length);
  const aiOpen = useDesk((s) => s.aiOpen);
  const toggleAi = useDesk((s) => s.toggleAi);
  const { t, updated, locale } = useI18n();
  const spendLabel = locale === "en" ? "Personal spend" : "個人月費開銷";

  const links: {
    to: "/plans" | "/guides" | "/about" | "/estates" | "/spend";
    label: string;
    search?: { cat: "broadband" | "home5g" | "mobile" | "business" };
  }[] = [
    { to: "/plans", label: t("navFibre"), search: { cat: "broadband" } },
    { to: "/plans", label: t("navHome5g"), search: { cat: "home5g" } },
    { to: "/plans", label: t("navMobile"), search: { cat: "mobile" } },
    { to: "/plans", label: t("navBusiness"), search: { cat: "business" } },
    { to: "/estates", label: t("navEstates") },
    { to: "/spend", label: spendLabel },
    { to: "/guides", label: t("navGuides") },
    { to: "/about", label: t("navAbout") },
  ];

  function isActive(link: (typeof links)[number]) {
    if (link.to === "/spend") return pathname === "/spend";
    if (!link.search) return pathname === link.to;
    return pathname === "/plans" && (currentCat ?? "broadband") === link.search.cat;
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card sm:bg-card/95 sm:backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-3 sm:gap-4 sm:px-4">
        <Logo className="shrink-0" />
        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <Link
              key={link.label + (link.search?.cat ?? "")}
              to={link.to}
              search={link.search}
              className={cn(
                "flex h-11 items-center rounded-full px-3 text-sm font-medium transition-[background-color,color] duration-150",
                isActive(link) ? "bg-surface text-fg" : "text-muted hover:text-fg",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex min-w-0 shrink items-center gap-1 sm:gap-2">
          <LangToggle className="max-sm:w-20" />
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link to="/compare">
              {t("navCompare")}
              {compareCount ? ` ${compareCount}` : ""}
            </Link>
          </Button>
          <div className="relative shrink-0">
            <Button
              type="button"
              size="sm"
              aria-expanded={aiOpen}
              aria-label={`${t("aiStaff")}（${t("aiBeta")}）`}
              className={cn("max-sm:h-11 max-sm:px-2 sm:px-3", aiOpen && "ai-header-live")}
              onClick={() => {
                setOpen(false);
                toggleAi();
              }}
            >
              <LogoMarkLooking className="!size-5" />
              <span className="sm:hidden">{t("aiStaffTiny")}</span>
              <span className="hidden sm:inline lg:hidden">{t("aiStaffShort")}</span>
              <span className="hidden lg:inline">{t("aiStaff")}</span>
              <AiBetaMark className="hidden text-primary-foreground/80 sm:inline" />
            </Button>
            <AiBetaMark className="pointer-events-none absolute inset-x-0 bottom-0.5 text-center text-[8px] leading-none text-primary-foreground/85 sm:hidden" />
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="lg:hidden shrink-0"
            aria-label={open ? t("menuClose") : t("menuOpen")}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>
      <p className="border-t border-border bg-bg px-3 py-1.5 text-[11px] font-medium leading-snug text-fg sm:px-4">
        <span className="mx-auto block max-w-6xl">{t("headerStrip", { date: updated })}</span>
      </p>
      <div className={cn("sheet-fold border-t border-border bg-bg lg:hidden", open && "open")}>
        <div className="sheet-fold-inner">
          <nav className="flex flex-col px-4 py-4">
            {links.map((link) => (
              <Link
                key={link.label + (link.search?.cat ?? "menu")}
                to={link.to}
                search={link.search}
                className={cn("flex h-12 items-center text-base font-medium", isActive(link) && "text-primary")}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link to="/compare" className="flex h-12 items-center text-base font-medium" onClick={() => setOpen(false)}>
              {t("navCompare")}
              {compareCount ? `（${compareCount}）` : ""}
            </Link>
            <button
              type="button"
              className="flex h-12 items-center gap-1.5 text-base font-medium"
              onClick={() => {
                setOpen(false);
                toggleAi();
              }}
            >
              {t("aiStaff")}
              <AiBetaMark className="text-muted" />
            </button>
            <a
              href={`https://wa.me/${SITE.whatsappE164}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 items-center text-base font-medium"
              onClick={() => setOpen(false)}
            >
              {t("waQuoteWithNumber", { phone: SITE.phoneDisplay })}
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}

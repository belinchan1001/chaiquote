import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { QuoteLink } from "@/components/quote-link";
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
  const { t } = useI18n();

  const links: { to: "/plans" | "/"; labelKey: MessageKey; search?: { cat: "broadband" | "home5g" | "mobile" | "business" } }[] = [
    { to: "/plans", labelKey: "navFibre", search: { cat: "broadband" } },
    { to: "/plans", labelKey: "navHome5g", search: { cat: "home5g" } },
    { to: "/plans", labelKey: "navMobile", search: { cat: "mobile" } },
    { to: "/plans", labelKey: "navBusiness", search: { cat: "business" } },
  ];

  function isActive(link: (typeof links)[number]) {
    if (!link.search) return pathname === link.to;
    return pathname === "/plans" && (currentCat ?? "broadband") === link.search.cat;
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Logo />
        <nav className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <Link
              key={link.labelKey}
              to={link.to}
              search={link.search}
              className={cn(
                "flex h-11 items-center rounded-full px-3 text-sm font-medium transition-[background-color,color] duration-150",
                isActive(link) ? "bg-surface text-fg" : "text-muted hover:text-fg",
              )}
            >
              {t(link.labelKey)}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            to="/"
            hash="estate-search"
            className="flex h-11 items-center px-2 text-sm font-medium text-muted hover:text-fg"
          >
            搜屋苑
          </Link>
          <LangToggle />
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link to="/compare">
              {t("navCompare")}
              {compareCount ? ` ${compareCount}` : ""}
            </Link>
          </Button>
          <QuoteLink size="sm" pulse="header">
            {t("waHeader")}
          </QuoteLink>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="lg:hidden"
            aria-label={open ? t("menuClose") : t("menuOpen")}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>
      <div className={cn("sheet-fold border-t border-border bg-bg lg:hidden", open && "open")}>
        <div className="sheet-fold-inner">
          <nav className="flex flex-col px-4 py-4">
            {links.map((link) => (
              <Link
                key={link.labelKey}
                to={link.to}
                search={link.search}
                className={cn("flex h-12 items-center text-base font-medium", isActive(link) && "text-primary")}
                onClick={() => setOpen(false)}
              >
                {t(link.labelKey)}
              </Link>
            ))}
            <Link to="/" hash="estate-search" className="flex h-12 items-center text-base font-medium" onClick={() => setOpen(false)}>
              搜屋苑
            </Link>
            <Link to="/compare" className="flex h-12 items-center text-base font-medium" onClick={() => setOpen(false)}>
              {t("navCompare")}
              {compareCount ? `（${compareCount}）` : ""}
            </Link>
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

import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { QuoteLink } from "@/components/quote-link";
import { useDesk, useHydrateDesk } from "@/lib/desk";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

const LINKS = [
  { to: "/plans", label: "光纖寬頻", search: { cat: "broadband" as const } },
  { to: "/plans", label: "5G 家居", search: { cat: "home5g" as const } },
  { to: "/plans", label: "手機月費", search: { cat: "mobile" as const } },
  { to: "/plans", label: "商業寬頻", search: { cat: "business" as const } },
  { to: "/guides", label: "點揀" },
  { to: "/about", label: "關於我們" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const href = useRouterState({ select: (s) => s.location.href });
  const currentCat = new URL(href, "https://quote.local").searchParams.get("cat");
  useHydrateDesk();
  const compareCount = useDesk((s) => s.compare.length);

  function isActive(link: (typeof LINKS)[number]) {
    if (!("search" in link)) return pathname === link.to;
    return pathname === "/plans" && (currentCat ?? "broadband") === link.search.cat;
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Logo />
        <nav className="hidden items-center gap-1 lg:flex">
          {LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              search={"search" in link ? link.search : undefined}
              className={cn(
                "flex h-11 items-center rounded-full px-3 text-sm font-medium transition-[background-color,color] duration-150",
                isActive(link) ? "bg-surface text-fg" : "text-muted hover:text-fg",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link to="/compare">比較月費{compareCount ? ` ${compareCount}` : ""}</Link>
          </Button>
          <QuoteLink size="sm" className="hidden sm:inline-flex" />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="lg:hidden"
            aria-label={open ? "閂選單" : "開選單"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>
      {open ? (
        <div className="border-t border-border bg-bg px-4 py-4 lg:hidden">
          <nav className="flex flex-col">
            {LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                search={"search" in link ? link.search : undefined}
                className={cn(
                  "flex h-12 items-center text-base font-medium",
                  isActive(link) && "text-primary",
                )}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link to="/compare" className="flex h-12 items-center text-base font-medium" onClick={() => setOpen(false)}>
              比較月費{compareCount ? `（${compareCount}）` : ""}
            </Link>
            <a
              href={`https://wa.me/${SITE.whatsappE164}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 items-center text-base font-medium"
              onClick={() => setOpen(false)}
            >
              WhatsApp 報價 {SITE.phoneDisplay}
            </a>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

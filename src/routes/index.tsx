import { createFileRoute, Link } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { ArrowRight } from "lucide-react";
import { IdleMount } from "@/components/idle-mount";
import { ServiceSearch } from "@/components/service-search";
import { ESTATE_COUNT } from "@/lib/estate-count";
import { PLAN_COUNT } from "@/lib/plan-count";
import { HOME_SEARCH_V2, SITE } from "@/lib/site";
import { useI18n, usePageTitle } from "@/lib/i18n";
import type { MessageKey } from "@/lib/messages";
import { HOME_SEO, canonicalUrl, homeJsonLd, shareHead } from "@/lib/canonical";
import { JsonLd } from "@/components/json-ld";

const SearchPanel = lazy(() =>
  import("@/components/search-panel").then((mod) => ({ default: mod.SearchPanel })),
);
const HomeBestPicks = lazy(() =>
  import("@/components/home-best-picks").then((mod) => ({ default: mod.HomeBestPicks })),
);
const HomeFeatured = lazy(() =>
  import("@/components/home-featured").then((mod) => ({ default: mod.HomeFeatured })),
);
const HomeNewsRail = lazy(() =>
  import("@/components/home-news-rail").then((mod) => ({ default: mod.HomeNewsRail })),
);

export const Route = createFileRoute("/")({
  component: Home,
  head: () => {
    const seo = shareHead(HOME_SEO, canonicalUrl("/"));
    return {
      meta: seo.meta,
      links: [
        ...(seo.links ?? []),
        {
          rel: "preload",
          href: "/images/hero-home-768.webp",
          as: "image",
          type: "image/webp",
          media: "(max-width: 767px)",
        },
        {
          rel: "preload",
          href: "/images/hero-home.webp",
          as: "image",
          type: "image/webp",
          media: "(min-width: 768px)",
        },
      ],
    };
  },
});

function Home() {
  const { t } = useI18n();
  usePageTitle(HOME_SEO.title);
  const categories: {
    to: "/guides/$slug";
    slug: "fiber" | "home5g" | "mobile" | "business";
    src: string;
    webp: string;
    label: MessageKey;
    text: MessageKey;
    planCat: "broadband" | "home5g" | "mobile" | "business";
  }[] = [
    { to: "/guides/$slug", slug: "fiber", src: "/images/cat-broadband.jpg", webp: "/images/cat-broadband.webp", label: "catBroadband", text: "catFibreText", planCat: "broadband" },
    { to: "/guides/$slug", slug: "home5g", src: "/images/cat-home5g.jpg", webp: "/images/cat-home5g.webp", label: "catHome5g", text: "catHome5gText", planCat: "home5g" },
    { to: "/guides/$slug", slug: "mobile", src: "/images/cat-mobile.jpg", webp: "/images/cat-mobile.webp", label: "catMobile", text: "catMobileText", planCat: "mobile" },
    { to: "/guides/$slug", slug: "business", src: "/images/cat-business.jpg", webp: "/images/cat-business.webp", label: "catBusiness", text: "catBusinessText", planCat: "business" },
  ];
  const faqs: { q: MessageKey; a: MessageKey }[] = [
    { q: "faq1q", a: "faq1a" },
    { q: "faq2q", a: "faq2a" },
    { q: "faq3q", a: "faq3a" },
    { q: "faq4q", a: "faq4a" },
    { q: "faq5q", a: "faq5a" },
    { q: "faq6q", a: "faq6a" },
  ];

  return (
    <div>
      <JsonLd data={homeJsonLd()} />
      <section className="relative overflow-hidden">
        <picture>
          <source
            srcSet="/images/hero-home-768.webp 768w, /images/hero-home.webp 1280w"
            type="image/webp"
            sizes="100vw"
          />
          <img
            src="/images/hero-home.jpg"
            alt=""
            width={1280}
            height={720}
            fetchPriority="high"
            className="absolute inset-0 size-full object-cover"
          />
        </picture>
        <div className="absolute inset-0 bg-primary/55" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/50 to-primary/25" />
        <div className="relative mx-auto grid max-w-6xl gap-5 px-4 py-7 lg:grid-cols-2 lg:gap-8 lg:py-14">
          <div className="page-enter text-primary-foreground">
            <h1 className="font-display text-display font-semibold leading-none tracking-tight">
              {t("heroTitle1")}
            </h1>
            <p className="mt-3 max-w-lg text-sm text-primary-foreground/80 sm:mt-5 sm:text-lead">{t("heroLead")}</p>
            <div className="mt-8 hidden gap-6 text-sm text-primary-foreground/75 sm:flex">
              <p className="flex items-baseline gap-1.5">
                <span className="font-display text-lg font-semibold tabular-nums text-primary-foreground">8</span>
                {t("statProvidersUnit")}
              </p>
              <p className="flex items-baseline gap-1.5">
                <span className="font-display text-lg font-semibold tabular-nums text-primary-foreground">{PLAN_COUNT}</span>
                {t("statPlansUnit")}
              </p>
              <p className="flex items-baseline gap-1.5">
                <span className="font-display text-lg font-semibold tabular-nums text-primary-foreground">{ESTATE_COUNT}</span>
                {t("statEstatesUnit")}
              </p>
            </div>
          </div>
          {HOME_SEARCH_V2 ? (
            <ServiceSearch />
          ) : (
            <Suspense fallback={null}>
              <SearchPanel />
            </Suspense>
          )}
        </div>
      </section>

      <IdleMount>
        <Suspense fallback={null}>
          <HomeBestPicks />
        </Suspense>
      </IdleMount>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {categories.map((item) => (
            <div
              key={item.label}
              className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card shadow-[var(--shadow-home-tile)]"
            >
              <Link to={item.to} params={{ slug: item.slug }} className="group flex min-h-0 flex-1 flex-col">
                <picture className="photo-strip photo-strip-card">
                  <source srcSet={item.webp} type="image/webp" />
                  <img
                    src={item.src}
                    alt={t(item.label)}
                    width={800}
                    height={600}
                    loading="lazy"
                    decoding="async"
                    className="outline outline-1 -outline-offset-1 outline-fg/10"
                  />
                </picture>
                <div className="flex flex-1 flex-col gap-1.5 p-3 pb-2 sm:p-3.5">
                  <p className="text-sm font-semibold">
                    {t(item.label)}
                    <ArrowRight className="ml-1 inline size-4 opacity-0 transition-[opacity,transform] duration-150 group-hover:translate-x-0.5 group-hover:opacity-100" />
                  </p>
                  <p className="text-xs leading-normal text-muted">{t(item.text)}</p>
                </div>
              </Link>
              <div className="mt-auto px-3 pb-3 text-xs sm:px-3.5 sm:pb-3.5">
                <p>
                  <Link
                    to="/plans"
                    search={{ cat: item.planCat }}
                    className="font-semibold text-accent underline-offset-4 hover:underline"
                  >
                    {t("goCompare")}
                  </Link>
                </p>
                <p className="mt-1">
                  <Link
                    to="/guides/$slug"
                    params={{ slug: item.slug }}
                    className="text-muted underline-offset-4 hover:underline"
                  >
                    {t("orReadGuide")}
                  </Link>
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <IdleMount>
        <Suspense fallback={null}>
          <HomeNewsRail />
        </Suspense>
      </IdleMount>

      <IdleMount>
        <Suspense fallback={null}>
          <HomeFeatured />
        </Suspense>
      </IdleMount>

      <section className="home-below-fold border-t border-border">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
          <div className="rounded-lg border border-border bg-card p-4 shadow-[var(--shadow-home)] sm:p-5">
            <h2 className="home-section-title">{t("faqTitle")}</h2>
            <div className="mt-3 divide-y divide-border">
              {faqs.map((item) => (
                <details key={item.q} className="group py-2.5 first:pt-0 last:pb-0">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-left text-sm font-semibold">
                    {t(item.q)}
                    <span className="text-muted transition-transform duration-150 group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-2 text-xs leading-relaxed text-muted">{t(item.a, { phone: SITE.phoneDisplay, email: SITE.leadEmail })}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

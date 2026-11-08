import { createFileRoute, Link } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { ArrowRight } from "lucide-react";
import { ServiceSearch } from "@/components/service-search";
import { ESTATE_COUNT } from "@/lib/estate-count";
import { PLAN_COUNT } from "@/lib/plan-count";
import { HOME_SEARCH_V2, SITE } from "@/lib/site";
import { useI18n, usePageTitle } from "@/lib/i18n";
import type { MessageKey } from "@/lib/messages";
import { HOME_SEO, canonicalUrl, homeJsonLd, shareHead } from "@/lib/canonical";
import { JsonLd } from "@/components/json-ld";
import { CARD_IMAGE_SIZES, webpSrcSet } from "@/lib/image-src";
import { IdleMount } from "@/components/idle-mount";

/** Matches PROVIDERS.length. The homepage shell must not import the plan catalogue. */
const HOME_PROVIDER_COUNT = 8;

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
  const { t, locale } = useI18n();
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
    { q: "faq7q", a: "faq7a" },
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
            <p className="mt-3 max-w-lg text-sm text-primary-foreground/80 sm:mt-4 sm:text-lead">{t("heroLead")}</p>
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

      <IdleMount fallback={<PicksSkeleton />}>
        <Suspense fallback={<PicksSkeleton />}>
          <HomeBestPicks />
        </Suspense>
      </IdleMount>

      <section className="home-below-fold mx-auto max-w-6xl px-4 py-8 sm:py-10">
        <Link
          to="/new-intake"
          className="mb-3 flex flex-col gap-4 rounded-lg border border-border bg-card p-4 shadow-[var(--shadow-home-tile)] sm:flex-row sm:items-center sm:justify-between sm:p-5"
        >
          <span>
            <span className="inline-flex rounded-full bg-intake px-2.5 py-1 text-sm font-medium text-intake-foreground">
              {t("estatesNewIntakeTag")}
            </span>
            <span className="mt-2 block text-lg font-semibold">{t("newIntakeTitle")}</span>
            <span className="mt-1 block text-sm leading-relaxed text-muted">{t("newIntakeHome")}</span>
          </span>
          <span className="inline-flex h-11 w-full items-center justify-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground sm:w-auto sm:shrink-0">
            {t("newIntakeHomeCta")}
            <ArrowRight className="ml-1 size-4" />
          </span>
        </Link>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {categories.map((item) => {
            return (
            <div
              key={item.label}
              className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card shadow-[var(--shadow-home-tile)]"
            >
              <Link to={item.to} params={{ slug: item.slug }} className="group flex min-h-0 flex-1 flex-col">
                <picture className="photo-strip photo-strip-card">
                  <source srcSet={webpSrcSet(item.webp)} sizes={CARD_IMAGE_SIZES} type="image/webp" />
                  <img
                    src={item.src}
                    alt={t(item.label)}
                    width={800}
                    height={550}
                    sizes={CARD_IMAGE_SIZES}
                    loading="lazy"
                    fetchPriority="low"
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
                {item.slug === "fiber" ? (
                  <p className="mt-1">
                    <Link
                      to="/guides/$slug"
                      params={{ slug: "home-broadband-2026" }}
                      className="text-muted underline-offset-4 hover:underline"
                    >
                      {locale === "en" ? "Six-carrier 1000M reference fees" : "六大電訊 1000M 參考月費表"}
                    </Link>
                  </p>
                ) : null}
              </div>
            </div>
            );
          })}
        </div>
      </section>

      <IdleMount fallback={<NewsSkeleton />}>
        <Suspense fallback={<NewsSkeleton />}>
          <HomeNewsRail />
        </Suspense>
      </IdleMount>

      <IdleMount fallback={<FeaturedSkeleton />}>
        <Suspense fallback={<FeaturedSkeleton />}>
          <HomeFeatured />
        </Suspense>
      </IdleMount>

      <section className="home-below-fold border-t border-border">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
          <p className="text-sm leading-relaxed text-muted">
            {t("heroAnswer", {
              name: SITE.name,
              providers: HOME_PROVIDER_COUNT,
              plans: PLAN_COUNT,
              estates: ESTATE_COUNT,
              date: SITE.updated,
            })}
          </p>
          <div className="mt-6 rounded-lg border border-border bg-card p-4 shadow-[var(--shadow-home)] sm:p-5">
            <h2 className="home-section-title">{t("faqTitle")}</h2>
            <div className="mt-3 divide-y divide-border">
              {faqs.map((item) => (
                <details key={item.q} className="group py-2.5 first:pt-0 last:pb-0">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-left text-sm font-semibold">
                    {t(item.q)}
                    <span className="text-muted transition-transform duration-150 group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-2 text-xs leading-relaxed text-muted">
                    {t(item.a, {
                      phone: SITE.phoneDisplay,
                      email: SITE.leadEmail,
                      date: SITE.updated,
                      providers: HOME_PROVIDER_COUNT,
                      plans: PLAN_COUNT,
                      estates: ESTATE_COUNT,
                    })}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function PicksSkeleton() {
  return (
    <section className="home-below-fold border-b border-border" aria-hidden="true">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-7">
        <div className="h-5 w-36 rounded bg-surface" />
        <div className="mt-2 h-9 max-w-xl rounded bg-surface" />
        <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {["a", "b", "c", "d"].map((id) => (
            <div key={id} className="min-h-[5.5rem] rounded-lg border border-border bg-card" />
          ))}
        </div>
      </div>
    </section>
  );
}

function NewsSkeleton() {
  return (
    <section className="home-below-fold border-t border-border" aria-hidden="true">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-7">
        <div className="h-5 w-28 rounded bg-surface" />
        <div className="mt-3 h-24 rounded bg-surface" />
      </div>
    </section>
  );
}

function FeaturedSkeleton() {
  return (
    <section className="home-below-fold bg-surface" aria-hidden="true">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
        <div className="h-5 w-32 rounded bg-card" />
        <div className="mt-2 h-8 max-w-md rounded bg-card" />
        <div className="mt-5 h-40 rounded-2xl border border-border bg-card" />
      </div>
    </section>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PlanCard } from "@/components/plan-card";
import { SearchPanel } from "@/components/search-panel";
import { Button } from "@/components/ui/button";
import { ESTATES } from "@/lib/estates";
import { PLANS, formatFee, getPlan, cheapestPlan, cheapestVillageBroadbandPlan } from "@/lib/plans";
import { SITE } from "@/lib/site";
import { useI18n, usePageTitle } from "@/lib/i18n";
import type { MessageKey } from "@/lib/messages";
import { HOME_SEO, canonicalUrl, homeJsonLd, shareHead } from "@/lib/canonical";
import { JsonLd } from "@/components/json-ld";

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

const FEATURED_IDS = [
  "hkbn-ftth-1000-36m-98",
  "hgc-ftth-1000-public-36m",
  "cmhk-home5g-350-48-88",
  "three-45g-10-58",
] as const;

function Home() {
  const featured = FEATURED_IDS.map(getPlan).filter((p): p is NonNullable<typeof p> => Boolean(p));
  const bestPicks = (
    [
      ["catBroadband", cheapestPlan("broadband")],
      ["catHome5g", cheapestPlan("home5g")],
      ["catMobile", cheapestPlan("mobile")],
      ["villageFibre", cheapestVillageBroadbandPlan()],
    ] as const
  ).flatMap(([label, plan]) => (plan ? [{ label, plan }] : []));
  const { t, updated } = useI18n();
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
            decoding="async"
            className="absolute inset-0 size-full object-cover"
          />
        </picture>
        <div className="absolute inset-0 bg-primary/55" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/50 to-primary/25" />
        <div className="relative mx-auto grid max-w-6xl gap-5 px-4 py-7 lg:grid-cols-2 lg:gap-8 lg:py-14">
          <div className="page-enter text-primary-foreground">
            <p className="text-xs font-medium tracking-widest text-primary-foreground/75">
              {t("hkUpdated", { date: updated })}
            </p>
            <h1 className="mt-2 font-display text-display font-semibold leading-none tracking-tight sm:mt-3">
              {t("heroTitle1")}
              <br />
              {t("heroTitle2")}
            </h1>
            <p className="mt-3 max-w-lg text-sm text-primary-foreground/80 sm:mt-5 sm:text-lead">{t("heroLead")}</p>
            <div className="mt-8 hidden gap-6 text-sm text-primary-foreground/75 sm:flex">
              <p className="flex items-baseline gap-1.5">
                <span className="font-display text-lg font-semibold tabular-nums text-primary-foreground">8</span>
                {t("statProvidersUnit")}
              </p>
              <p className="flex items-baseline gap-1.5">
                <span className="font-display text-lg font-semibold tabular-nums text-primary-foreground">{PLANS.length}</span>
                {t("statPlansUnit")}
              </p>
              <p className="flex items-baseline gap-1.5">
                <span className="font-display text-lg font-semibold tabular-nums text-primary-foreground">{ESTATES.length}</span>
                {t("statEstatesUnit")}
              </p>
            </div>
          </div>
          <SearchPanel />
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:py-7">
          <div>
            <h2 className="home-section-title">{t("bestPicksTitle")}</h2>
            <p className="home-section-lead">{t("bestPicksLead")}</p>
          </div>
          <ul className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {bestPicks.map((item) => (
              <li key={item.label} className="min-h-0">
                <Link
                  to="/plans/$planId"
                  params={{ planId: item.plan.id }}
                  className="group flex h-full min-h-[5.5rem] flex-col rounded-lg border border-border bg-card px-3.5 py-3 shadow-[var(--shadow-home-tile)] transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-border-hover)]"
                >
                  <p className="text-[11px] font-semibold tracking-wider text-muted">{t(item.label)}</p>
                  <p className="mt-1 font-display text-lg font-semibold tracking-tight tabular-nums text-primary">
                    {t("fromFee", { fee: formatFee(item.plan.monthlyFee) })}
                  </p>
                  <p className="mt-auto pt-2 text-[11px] font-semibold text-accent">
                    {t("bestPicksCta")}
                    <ArrowRight className="ml-1 inline size-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {categories.map((item) => (
            <div
              key={item.label}
              className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card shadow-[var(--shadow-home-tile)]"
            >
              <Link to={item.to} params={{ slug: item.slug }} className="group flex min-h-0 flex-1 flex-col">
                <picture>
                  <source srcSet={item.webp} type="image/webp" />
                  <img
                    src={item.src}
                    alt={t(item.label)}
                    width={800}
                    height={600}
                    loading="lazy"
                    decoding="async"
                    className="aspect-[16/10] h-auto w-full object-cover outline outline-1 -outline-offset-1 outline-fg/10"
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

      <section className="bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
          <div>
            <h2 className="home-section-title">{t("featuredTitle")}</h2>
            <p className="home-section-lead">{t("featuredLead")}</p>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {featured.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
          <Button asChild size="lg" className="mt-6 w-full sm:w-auto">
            <Link to="/plans" search={{ cat: "broadband" }}>
              {t("seeAllPlans")}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="border-t border-border">
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

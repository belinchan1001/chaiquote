import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PlanCard } from "@/components/plan-card";
import { AiFilterEntry } from "@/components/ai-filter-entry";
import { SearchPanel } from "@/components/search-panel";
import { Button } from "@/components/ui/button";
import { ESTATES } from "@/lib/estates";
import { PLANS, formatFee, getPlan, cheapestPlan, cheapestVillageBroadbandPlan } from "@/lib/plans";
import { SITE } from "@/lib/site";
import { useI18n, usePageTitle } from "@/lib/i18n";
import type { MessageKey } from "@/lib/messages";
import { HOME_SEO, canonicalUrl, shareHead } from "@/lib/canonical";
import { JsonLd } from "@/components/json-ld";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => shareHead(HOME_SEO, canonicalUrl("/")),
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
    label: MessageKey;
    text: MessageKey;
    planCat: "broadband" | "home5g" | "mobile" | "business";
  }[] = [
    { to: "/guides/$slug", slug: "fiber", src: "/images/cat-broadband.jpg", label: "catBroadband", text: "catFibreText", planCat: "broadband" },
    { to: "/guides/$slug", slug: "home5g", src: "/images/cat-home5g.jpg", label: "catHome5g", text: "catHome5gText", planCat: "home5g" },
    { to: "/guides/$slug", slug: "mobile", src: "/images/cat-mobile.jpg", label: "catMobile", text: "catMobileText", planCat: "mobile" },
    { to: "/guides/$slug", slug: "business", src: "/images/cat-business.jpg", label: "catBusiness", text: "catBusinessText", planCat: "business" },
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
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((item) => ({
            "@type": "Question",
            name: t(item.q),
            acceptedAnswer: {
              "@type": "Answer",
              text: t(item.a, { phone: SITE.phoneDisplay }),
            },
          })),
        }}
      />
      <section className="relative overflow-hidden">
        <img
          src="/images/hero-home.jpg"
          alt=""
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 size-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/55" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/50 to-primary/25" />
        <div className="relative mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-2 lg:gap-10 lg:py-16">
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
          <div>
            <SearchPanel />
            <AiFilterEntry tone="hero" className="mt-3" />
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <div>
            <h2 className="font-semibold">{t("bestPicksTitle")}</h2>
            <p className="mt-1 text-xs text-muted">{t("bestPicksLead")}</p>
          </div>
          <ul className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {bestPicks.map((item) => (
              <li key={item.label}>
                <Link
                  to="/plans/$planId"
                  params={{ planId: item.plan.id }}
                  className="group flex h-full min-h-11 flex-col justify-center rounded-xl bg-bg px-4 py-3 shadow-[var(--shadow-border)] transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-border-hover)]"
                >
                  <p className="text-xs font-medium tracking-wider text-muted">{t(item.label)}</p>
                  <p className="mt-1 font-display text-lg font-semibold tabular-nums">
                    {t("fromFee", { fee: formatFee(item.plan.monthlyFee) })}
                  </p>
                  <p className="mt-2 text-xs font-medium text-accent">
                    {t("bestPicksCta")}
                    <ArrowRight className="ml-1 inline size-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((item) => (
            <div
              key={item.label}
              className="overflow-hidden rounded-xl bg-card shadow-[var(--shadow-border)]"
            >
              <Link to={item.to} params={{ slug: item.slug }} className="group block">
                <img src={item.src} alt={t(item.label)} loading="lazy" decoding="async" className="h-40 w-full object-cover outline outline-1 -outline-offset-1 outline-fg/10" />
                <div className="p-5 pb-2">
                  <p className="font-medium">
                    {t(item.label)}
                    <ArrowRight className="ml-1 inline size-4 opacity-0 transition-[opacity,transform] duration-150 group-hover:translate-x-0.5 group-hover:opacity-100" />
                  </p>
                  <p className="mt-1 text-sm text-muted">{t(item.text)}</p>
                </div>
              </Link>
              <p className="px-5 pb-5 text-sm">
                <Link
                  to="/plans"
                  search={{ cat: item.planCat }}
                  className="text-accent underline-offset-4 hover:underline"
                >
                  {t("goCompare")}
                </Link>
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div>
            <h2 className="text-title font-semibold">{t("featuredTitle")}</h2>
            <p className="mt-2 text-sm text-muted">{t("featuredLead")}</p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {featured.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
          <Button asChild size="lg" className="mt-8 w-full sm:w-auto">
            <Link to="/plans" search={{ cat: "broadband" }}>
              {t("seeAllPlans")}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-3xl px-4 py-12">
          <h2 className="text-title font-semibold">{t("faqTitle")}</h2>
          <div className="mt-6 divide-y divide-border">
            {faqs.map((item) => (
              <details key={item.q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-medium">
                  {t(item.q)}
                  <span className="text-subtle transition-transform duration-150 group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted">{t(item.a, { phone: SITE.phoneDisplay })}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

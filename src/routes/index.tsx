import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PlanCard } from "@/components/plan-card";
import { SearchPanel } from "@/components/search-panel";
import { Button } from "@/components/ui/button";
import { ESTATES } from "@/lib/estates";
import { PLANS, formatFee, getPlan, minMonthlyFee, minVillageBroadbandFee } from "@/lib/plans";
import { SITE } from "@/lib/site";
import { useI18n, usePageTitle } from "@/lib/i18n";
import type { MessageKey } from "@/lib/messages";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [{ title: `${SITE.name} · ${SITE.tagline}` }],
  }),
});

const FEATURED_IDS = [
  "hkbn-ftth-1000-36m-98",
  "hgc-ftth-1000-public-36m",
  "cmhk-home5g-350-48-88",
  "three-45g-44",
] as const;

function Home() {
  const featured = FEATURED_IDS.map(getPlan).filter((p): p is NonNullable<typeof p> => Boolean(p));
  const fiberFrom = minMonthlyFee("broadband");
  const home5gFrom = minMonthlyFee("home5g");
  const mobileFrom = minMonthlyFee("mobile");
  const villageFrom = minVillageBroadbandFee();
  const { t, updated } = useI18n();
  usePageTitle(`${SITE.name} · ${t("tagline")}`);
  const categories: { to: "/plans"; search: { cat: "broadband" | "home5g" | "mobile" | "business" }; src: string; label: MessageKey; text: MessageKey }[] = [
    { to: "/plans", search: { cat: "broadband" }, src: "/images/cat-broadband.jpg", label: "catBroadband", text: "catFibreText" },
    { to: "/plans", search: { cat: "home5g" }, src: "/images/cat-home5g.jpg", label: "catHome5g", text: "catHome5gText" },
    { to: "/plans", search: { cat: "mobile" }, src: "/images/cat-mobile.jpg", label: "catMobile", text: "catMobileText" },
    { to: "/plans", search: { cat: "business" }, src: "/images/cat-business.jpg", label: "catBusiness", text: "catBusinessText" },
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
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-2 lg:py-16">
          <div className="page-enter text-primary-foreground">
            <p className="text-xs font-medium tracking-widest text-primary-foreground/75">
              {t("hkUpdated", { date: updated })}
            </p>
            <h1 className="mt-3 font-display text-display font-semibold leading-none tracking-tight">
              {t("heroTitle1")}
              <br />
              {t("heroTitle2")}
            </h1>
            <p className="mt-5 max-w-lg text-lead text-primary-foreground/80">{t("heroLead")}</p>
            <div className="mt-8 hidden gap-6 text-sm text-primary-foreground/75 sm:flex">
              <p>
                <span className="font-display text-lg font-semibold tabular-nums text-primary-foreground">8</span>{" "}
                {t("statProviders", { n: 8 }).replace("8 ", "")}
              </p>
              <p>
                <span className="font-display text-lg font-semibold tabular-nums text-primary-foreground">{PLANS.length}</span>{" "}
                {t("statPlans", { n: PLANS.length }).replace(`${PLANS.length} `, "")}
              </p>
              <p>
                <span className="font-display text-lg font-semibold tabular-nums text-primary-foreground">{ESTATES.length}</span>{" "}
                {t("statEstates", { n: ESTATES.length }).replace(`${ESTATES.length} `, "")}
              </p>
            </div>
          </div>
          <SearchPanel />
        </div>
      </section>

      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: t("catBroadband"), value: t("fromFee", { fee: formatFee(fiberFrom) }) },
            { label: t("catHome5g"), value: t("fromFee", { fee: formatFee(home5gFrom) }) },
            { label: t("catMobile"), value: t("fromFee", { fee: formatFee(mobileFrom) }) },
            { label: t("villageFibre"), value: t("fromFee", { fee: formatFee(villageFrom) }) },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-xs font-medium tracking-wider text-muted">{item.label}</p>
              <p className="mt-1 font-display text-lg font-semibold tabular-nums">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              search={item.search}
              className="group overflow-hidden rounded-xl bg-card shadow-[var(--shadow-border)] transition-[box-shadow,transform] duration-150 hover:shadow-[var(--shadow-border-hover)]"
            >
              <img src={item.src} alt={t(item.label)} loading="lazy" decoding="async" className="h-40 w-full object-cover outline outline-1 -outline-offset-1 outline-fg/10" />
              <div className="p-5">
                <p className="font-medium">
                  {t(item.label)}
                  <ArrowRight className="ml-1 inline size-4 opacity-0 transition-[opacity,transform] duration-150 group-hover:translate-x-0.5 group-hover:opacity-100" />
                </p>
                <p className="mt-1 text-sm text-muted">{t(item.text)}</p>
              </div>
            </Link>
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

import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { WhatsAppTip } from "@/components/whatsapp-tip";
import { PlanCard } from "@/components/plan-card";
import { ProviderMark } from "@/components/provider-mark";
import { useHydrateDesk } from "@/lib/desk";
import { useI18n, usePageTitle } from "@/lib/i18n";
import {
  averageFee,
  formatFee,
  formatInstall,
  formatPlanSpeed,
  getPlan,
  isNetvigatorVillage,
} from "@/lib/plans";
import { parseEstateParam, parseHousingParam, relatedComparePlans } from "@/lib/related-plans";
import { canonicalUrl, notFoundHead } from "@/lib/canonical";
import { resolvePlan } from "@/lib/plan-overrides";
import { planJsonLd, planSeoDescription, planSeoTitle } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";

export const Route = createFileRoute("/plans_/$planId")({
  validateSearch: (search: Record<string, unknown>) => {
    const housing = parseHousingParam(search.housing);
    const estate = parseEstateParam(search.estate);
    return {
      ...(housing ? { housing } : {}),
      ...(estate ? { estate } : {}),
    };
  },
  component: PlanDetailPage,
  pendingMs: 0,
  pendingComponent: PlanDetailPending,
  loader: ({ params }) => {
    const plan = resolvePlan(getPlan(params.planId));
    if (!plan || plan.staffOffer || plan.unpublished) throw notFound();
    return { plan };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return notFoundHead();
    const { plan } = loaderData;
    const title = planSeoTitle(plan);
    const description = planSeoDescription(plan);
    const url = canonicalUrl(`/plans/${plan.id}`);
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        ...(plan.staffOffer ? [{ name: "robots", content: "noindex, nofollow" }] : []),
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
});

function PlanDetailPending() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8" aria-busy="true">
      <div className="h-5 w-28 rounded bg-surface" />
      <article className="relative mt-6 max-w-3xl rounded-xl bg-card p-5 pb-12 shadow-[var(--shadow-border)]">
        <div className="h-10 w-40 rounded bg-surface" />
        <div className="mt-4 h-3 w-32 rounded bg-surface" />
        <div className="mt-2 h-8 w-2/3 rounded bg-surface" />
        <div className="mt-6 h-12 w-36 rounded bg-surface" />
        <div className="mt-6 grid grid-cols-2 gap-3 border-t border-border pt-5">
          <div className="h-12 rounded bg-surface" />
          <div className="h-12 rounded bg-surface" />
          <div className="h-12 rounded bg-surface" />
          <div className="h-12 rounded bg-surface" />
        </div>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <div className="h-11 flex-1 rounded-md bg-surface" />
          <div className="h-11 flex-1 rounded-md bg-surface" />
        </div>
      </article>
    </div>
  );
}

function PlanDetailPage() {
  const { plan } = Route.useLoaderData();
  const { housing, estate } = Route.useSearch();
  useHydrateDesk();
  const avg = averageFee(plan);
  const related = relatedComparePlans(plan, housing, estate);
  const { t, tx, categoryLabel, housingList } = useI18n();
  usePageTitle(planSeoTitle(plan));

  const dash = t("dash");
  const rows: [string, string | undefined][] = [
    [t("rowProvider"), undefined],
    [t("rowCategory"), categoryLabel(plan.category)],
    [t("rowNetwork"), tx(plan.network)],
    [t("rowFee"), formatFee(plan.monthlyFee)],
    [t("rowFree"), plan.freeMonths ? t("months", { n: plan.freeMonths }) : t("none")],
    [t("rowAvg"), formatFee(avg)],
    [t("rowContract"), t("months", { n: plan.contractMonths })],
    [t("speed"), formatPlanSpeed(plan)],
    [
      t("data"),
      plan.highSpeedGb
        ? `${plan.highSpeedGb}GB`
        : plan.dataGb
          ? `${plan.dataGb}GB`
          : t("dependsPlan"),
    ],
    [t("rowAfterUsage"), plan.fupNote ? tx(plan.fupNote) : dash],
    [t("rowVoice"), plan.voice ? tx(plan.voice) : dash],
    [t("rowRoamCn"), plan.roaming ? tx(plan.roaming) : dash],
    [t("install"), tx(formatInstall(plan))],
    [t("prepaid"), plan.prepaid ? tx(plan.prepaid) : t("none")],
    [t("rowHousing"), housingList(plan.housing)],
    [t("rowNotes"), plan.limits ? tx(plan.limits) : dash],
  ];

  return (
    <div className="plan-detail-enter mx-auto max-w-6xl px-4 py-8">
      <JsonLd data={planJsonLd(plan)} />
      <Link
        to="/plans"
        search={{ cat: plan.category }}
        className="inline-flex items-center py-1 text-sm font-medium text-muted hover:text-fg"
      >
        {t("backTo", { cat: categoryLabel(plan.category) })}
      </Link>

      <h1 className="sr-only">{tx(plan.name)}</h1>
      <div className="mt-6 max-w-3xl">
        <PlanCard plan={plan} />
      </div>
      <WhatsAppTip className="mt-3 max-w-3xl" />
      <div className="mt-3 max-w-3xl">
        <Button asChild variant="outline">
          <Link to="/quote" search={{ plan: plan.id }}>
            {t("formQuote")}
          </Link>
        </Button>
      </div>

      <div className="mt-8 max-w-3xl rounded-xl bg-surface p-5">
        <p className="text-xs tracking-wider text-muted">{t("serviceLimits")}</p>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {t("installCoverage")} {t("referencePrice")} {t("disclaimer1")}
        </p>
      </div>

      <dl className="mt-8 max-w-3xl divide-y divide-border overflow-hidden rounded-xl bg-card shadow-[var(--shadow-border)]">
        {rows.map(([label, value]) => (
          <div key={label} className="grid grid-cols-1 gap-1 px-4 py-3 text-sm sm:grid-cols-4 sm:gap-4">
            <dt className="text-muted">{label}</dt>
            <dd className="font-medium sm:col-span-3">
              {label === t("rowProvider") ? <ProviderMark id={plan.providerId} size="sm" /> : value}
              {label === t("install") && isNetvigatorVillage(plan) ? (
                <p className="mt-1 text-xs font-normal leading-relaxed text-muted">{t("villageFeeNote")}</p>
              ) : null}
            </dd>
          </div>
        ))}
      </dl>

      {related.length ? (
        <div className="mt-12">
          <h2 className="text-lg font-semibold">{t("othersCompare")}</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {related.map((item) => (
              <PlanCard key={item.id} plan={item} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

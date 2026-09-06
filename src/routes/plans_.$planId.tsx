import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Bookmark, GitCompareArrows } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuoteLink } from "@/components/quote-link";
import { WhatsAppTip } from "@/components/whatsapp-tip";
import { ProviderMark } from "@/components/provider-mark";
import { PlanCard } from "@/components/plan-card";
import { useDesk, useHydrateDesk } from "@/lib/desk";
import { useI18n, usePageTitle } from "@/lib/i18n";
import {
  averageFee,
  formatFee,
  formatInstall,
  formatPlanSpeed,
  getPlan,
  PLANS,
} from "@/lib/plans";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/plans_/$planId")({
  component: PlanDetailPage,
  loader: ({ params }) => {
    const plan = getPlan(params.planId);
    if (!plan) throw notFound();
    return { plan };
  },
  head: ({ loaderData }) => ({
    meta: [{ title: loaderData ? `${loaderData.plan.name} · ${SITE.name}` : SITE.name }],
  }),
});

function PlanDetailPage() {
  const { plan } = Route.useLoaderData();
  useHydrateDesk();
  const compare = useDesk((s) => s.compare);
  const saved = useDesk((s) => s.saved);
  const toggleCompare = useDesk((s) => s.toggleCompare);
  const toggleSaved = useDesk((s) => s.toggleSaved);
  const avg = averageFee(plan);
  const related = PLANS.filter(
    (p) => p.category === plan.category && p.id !== plan.id && p.providerId !== plan.providerId,
  ).slice(0, 2);
  const { t, tx, categoryLabel, housingList } = useI18n();
  usePageTitle(`${tx(plan.name)} · ${SITE.name}`);

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
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link to="/plans" search={{ cat: plan.category }} className="text-sm text-muted hover:text-fg">
        {t("backTo", { cat: categoryLabel(plan.category) })}
      </Link>

      <div className="mt-6 max-w-3xl">
        <ProviderMark id={plan.providerId} />
        <h1 className="mt-4 text-title font-semibold">{tx(plan.name)}</h1>
        <p className="mt-2 text-muted">{tx(plan.bestFor)}</p>
        <div className="mt-6 flex items-end gap-3">
          <p className="font-display text-5xl font-semibold tabular-nums leading-none">
            {formatFee(plan.monthlyFee)}
          </p>
          <p className="pb-1 text-muted">{t("perMo")}</p>
        </div>
        {avg !== plan.monthlyFee ? (
          <p className="mt-2 text-accent">
            {t("avgFeeFree", { fee: formatFee(avg), n: plan.freeMonths })}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Button type="button" variant={compare.includes(plan.id) ? "accent" : "outline"} onClick={() => toggleCompare(plan.id)}>
            <GitCompareArrows />
            {compare.includes(plan.id) ? t("inCompare") : t("navCompare")}
          </Button>
          <Button type="button" variant="ghost" onClick={() => toggleSaved(plan.id)}>
            <Bookmark className={cn(saved.includes(plan.id) && "fill-fg")} />
            {saved.includes(plan.id) ? t("savedPlan") : t("savePlan")}
          </Button>
          <QuoteLink plan={plan} />
          <Button asChild variant="outline">
            <Link to="/quote" search={{ plan: plan.id }}>
              {t("formQuote")}
            </Link>
          </Button>
        </div>
        <WhatsAppTip className="mt-3" />

        <div className="mt-8 rounded-xl bg-surface p-5">
          <p className="text-xs tracking-wider text-muted">{t("serviceLimits")}</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {t("installCoverage")} {t("referencePrice")} {t("disclaimer1")}
          </p>
        </div>

        <dl className="mt-8 divide-y divide-border overflow-hidden rounded-xl bg-card shadow-[var(--shadow-border)]">
          {rows.map(([label, value]) => (
            <div key={label} className="grid grid-cols-1 gap-1 px-4 py-3 text-sm sm:grid-cols-4 sm:gap-4">
              <dt className="text-muted">{label}</dt>
              <dd className="font-medium sm:col-span-3">
                {label === t("rowProvider") ? <ProviderMark id={plan.providerId} size="sm" /> : value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-8">
          <h2 className="text-lg font-semibold">{t("rowPerks")}</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            {plan.perks.map((perk) => (
              <li key={perk}>{tx(perk)}</li>
            ))}
            {plan.portInPerk ? <li className="text-accent">{tx(plan.portInPerk)}</li> : null}
          </ul>
        </div>
      </div>

      {related.length ? (
        <div className="mt-12">
          <h2 className="text-lg font-semibold">{t("othersCompare")}</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {related.map((item) => (
              <PlanCard key={item.id} plan={item} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

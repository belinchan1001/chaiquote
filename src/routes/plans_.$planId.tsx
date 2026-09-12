import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Bookmark, GitCompareArrows } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuoteLink } from "@/components/quote-link";
import { WhatsAppTip } from "@/components/whatsapp-tip";
import { PlanBadges } from "@/components/plan-badges";
import { CertifiedStaffNote } from "@/components/certified-staff-note";
import { LogoMark } from "@/components/logo";
import { ProviderMark } from "@/components/provider-mark";
import { PlanCard } from "@/components/plan-card";
import { PlanShareButton } from "@/components/plan-share-button";
import { useDesk, useHydrateDesk } from "@/lib/desk";
import { useI18n, usePageTitle } from "@/lib/i18n";
import {
  averageFee,
  formatFee,
  formatInstall,
  formatPlanSpeed,
  formatPrepaidShort,
  getPlan,
  hasCertifiedStaff,
  isNetvigatorVillage,
  planPerks,
  PLANS,
  type Plan,
} from "@/lib/plans";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";
import { canonicalUrl } from "@/lib/canonical";
import { planJsonLd, planSeoDescription, planSeoTitle } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";

export const Route = createFileRoute("/plans_/$planId")({
  component: PlanDetailPage,
  loader: ({ params }) => {
    const plan = getPlan(params.planId);
    if (!plan) throw notFound();
    return { plan };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: SITE.name }] };
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

function PlanDetailPage() {
  const { plan } = Route.useLoaderData();
  useHydrateDesk();
  const compare = useDesk((s) => s.compare);
  const saved = useDesk((s) => s.saved);
  const toggleCompare = useDesk((s) => s.toggleCompare);
  const toggleSaved = useDesk((s) => s.toggleSaved);
  const avg = averageFee(plan);
  const related = PLANS.filter(
    (p) =>
      p.category === plan.category &&
      p.id !== plan.id &&
      p.providerId !== plan.providerId &&
      !p.staffOffer,
  ).slice(0, 2);
  const perks = planPerks(plan);
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
    <div className="mx-auto max-w-6xl px-4 py-8">
      <JsonLd data={planJsonLd(plan)} />
      <Link
        to="/plans"
        search={{ cat: plan.category }}
        className="inline-flex items-center py-1 text-sm font-medium text-muted hover:text-fg"
      >
        {t("backTo", { cat: categoryLabel(plan.category) })}
      </Link>

      <article className="relative mt-6 max-w-3xl rounded-xl bg-card p-5 pb-12 shadow-[var(--shadow-border)]">
        <ProviderMark id={plan.providerId} />

        <PlanBadges plan={plan} />

        <p className="mt-4 text-xs tracking-wider text-subtle uppercase">
          {categoryLabel(plan.category)} · {tx(plan.network)}
        </p>
        <h1 className="mt-1 text-title font-semibold leading-snug">{tx(plan.name)}</h1>
        <p className="mt-2 text-muted">{tx(plan.bestFor)}</p>

        <div className="mt-6 flex items-end gap-3">
          <p className="font-display text-5xl font-semibold tabular-nums leading-none">
            {formatFee(plan.monthlyFee)}
          </p>
          <p className="pb-1 text-muted">{t("perMonth", { n: plan.contractMonths })}</p>
        </div>
        {avg !== plan.monthlyFee ? (
          <p className="mt-2 text-accent">
            {t("avgFeeFree", { fee: formatFee(avg), n: plan.freeMonths })}
          </p>
        ) : null}

        <PlanDetailFacts plan={plan} />

        {perks.length || plan.portInPerk ? (
          <div className="mt-6 border-t border-border pt-5">
            <h2 className="text-sm font-semibold">{t("rowPerks")}</h2>
            <ul className="mt-3 space-y-1.5 text-sm text-muted">
              {perks.map((perk) => (
                <li key={perk}>{tx(perk)}</li>
              ))}
              {plan.portInPerk ? <li className="text-accent">{tx(plan.portInPerk)}</li> : null}
            </ul>
          </div>
        ) : null}

        {hasCertifiedStaff(plan) ? <CertifiedStaffNote plan={plan} className="mt-6" /> : null}
        <div className={cn("flex flex-col gap-2 sm:flex-row sm:flex-wrap", hasCertifiedStaff(plan) ? "mt-3" : "mt-6")}>
          <Button type="button" variant={compare.includes(plan.id) ? "accent" : "outline"} onClick={() => toggleCompare(plan.id)}>
            <GitCompareArrows />
            {compare.includes(plan.id) ? t("inCompare") : t("navCompare")}
          </Button>
          <Button type="button" variant="ghost" onClick={() => toggleSaved(plan.id)}>
            <Bookmark className={cn(saved.includes(plan.id) && "fill-fg")} />
            {saved.includes(plan.id) ? t("savedPlan") : t("savePlan")}
          </Button>
          <div className="flex min-w-0 flex-1 gap-2">
            <QuoteLink plan={plan} className="flex-1" />
            <PlanShareButton plan={plan} />
          </div>
          <Button asChild variant="outline">
            <Link to="/quote" search={{ plan: plan.id }}>
              {t("formQuote")}
            </Link>
          </Button>
        </div>
        <WhatsAppTip className="mt-3" />
        {plan.category === "business" ? (
          <p className="mt-3 text-xs leading-relaxed text-muted">{t("businessDisclaimer")}</p>
        ) : null}
        <p className="mt-3 text-[11px] leading-relaxed text-subtle">{t("referencePrice")}</p>
        <span
          aria-hidden="true"
          className="pointer-events-none !absolute right-5 bottom-3 z-[1] inline-flex items-center gap-1 font-display text-[13px] font-medium tracking-tight text-subtle/50 select-none"
        >
          <LogoMark className="size-5" />
          <span>{SITE.name}</span>
        </span>
      </article>

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

function PlanDetailFacts({ plan }: { plan: Plan }) {
  const { t, tx } = useI18n();
  return (
    <div className="mt-6 border-t border-border pt-5">
      <dl className="grid grid-cols-2 gap-3 text-sm">
        {plan.category === "home5g" || plan.speedMbps ? (
          <div className={plan.category === "home5g" ? "col-span-2" : undefined}>
            <dt className="text-xs text-subtle">{t("speed")}</dt>
            <dd className="font-medium">{formatPlanSpeed(plan)}</dd>
            {plan.category === "home5g" ? (
              <p className="mt-1 text-xs text-muted">{t("speedNote")}</p>
            ) : null}
          </div>
        ) : null}
        {plan.highSpeedGb || plan.dataGb ? (
          <div>
            <dt className="text-xs text-subtle">{t("data")}</dt>
            <dd className="font-medium">{plan.highSpeedGb ?? plan.dataGb}GB</dd>
          </div>
        ) : null}
        <div>
          <dt className="text-xs text-subtle">{t("rowContract")}</dt>
          <dd className="font-medium">{t("months", { n: plan.contractMonths })}</dd>
        </div>
        {plan.voice ? (
          <div>
            <dt className="text-xs text-subtle">{t("rowVoice")}</dt>
            <dd className="font-medium leading-snug">{tx(plan.voice)}</dd>
          </div>
        ) : null}
        {plan.category === "mobile" && plan.fupNote ? (
          <div className="col-span-2">
            <dt className="text-xs text-subtle">{t("rowAfterUsage")}</dt>
            <dd className="font-medium">{tx(plan.fupNote)}</dd>
          </div>
        ) : null}
        {plan.prepaid ? (
          <div>
            <dt className="text-xs text-subtle">{t("prepaid")}</dt>
            <dd className="font-medium">{tx(formatPrepaidShort(plan.prepaid))}</dd>
          </div>
        ) : null}
        {plan.category !== "mobile" ? (
          <div>
            <dt className="text-xs text-subtle">{t("install")}</dt>
            <dd className="font-medium">{tx(formatInstall(plan))}</dd>
          </div>
        ) : null}
      </dl>
      {isNetvigatorVillage(plan) ? (
        <p className="mt-3 text-xs leading-relaxed text-muted">{t("villageFeeNote")}</p>
      ) : null}
    </div>
  );
}

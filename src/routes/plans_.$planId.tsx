import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Bookmark, GitCompareArrows } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuoteLink } from "@/components/quote-link";
import { ProviderMark } from "@/components/provider-mark";
import { PlanCard } from "@/components/plan-card";
import { useDesk, useHydrateDesk } from "@/lib/desk";
import {
  averageFee,
  CATEGORY_LABEL,
  formatFee,
  formatInstall,
  formatPlanSpeed,
  getPlan,
  HOUSING_LABEL,
  PLANS,
} from "@/lib/plans";
import { DISCLAIMER, SITE } from "@/lib/site";
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

  const rows = [
    ["網絡供應商", undefined],
    ["類別", CATEGORY_LABEL[plan.category]],
    ["網絡", plan.network],
    ["月費", formatFee(plan.monthlyFee)],
    ["免月費", plan.freeMonths ? `${plan.freeMonths} 個月` : "無"],
    ["平均月費", formatFee(avg)],
    ["合約期", `${plan.contractMonths} 個月`],
    ["網絡速度", formatPlanSpeed(plan)],
    ["高速數據", plan.highSpeedGb ? `${plan.highSpeedGb}GB` : plan.dataGb ? `${plan.dataGb}GB` : "視計劃"],
    ["其後用量", plan.fupNote ?? "—"],
    ["通話", plan.voice ?? "—"],
    ["漫遊／中澳", plan.roaming ?? "—"],
    ["安裝費", formatInstall(plan)],
    ["預繳", plan.prepaid ?? "無"],
    ["適合樓宇", plan.housing === "all" ? "不限" : plan.housing.map((h) => HOUSING_LABEL[h]).join("、")],
    ["注意事項", plan.limits ?? "—"],
  ] as const;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link to="/plans" search={{ cat: plan.category }} className="text-sm text-muted hover:text-fg">
        ← 返去{CATEGORY_LABEL[plan.category]}
      </Link>

      <div className="mt-6 max-w-3xl">
        <ProviderMark id={plan.providerId} />
        <h1 className="mt-4 text-title font-semibold">{plan.name}</h1>
        <p className="mt-2 text-muted">{plan.bestFor}</p>
        <div className="mt-6 flex items-end gap-3">
          <p className="font-display text-5xl font-semibold tabular-nums leading-none">
            {formatFee(plan.monthlyFee)}
          </p>
          <p className="pb-1 text-muted">／月</p>
        </div>
        {avg !== plan.monthlyFee ? (
          <p className="mt-2 text-accent">平均月費 {formatFee(avg)}／月（已計免月費 {plan.freeMonths} 個月）</p>
        ) : null}

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Button type="button" variant={compare.includes(plan.id) ? "accent" : "outline"} onClick={() => toggleCompare(plan.id)}>
            <GitCompareArrows />
            {compare.includes(plan.id) ? "已加入比較" : "比較月費"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => toggleSaved(plan.id)}>
            <Bookmark className={cn(saved.includes(plan.id) && "fill-fg")} />
            {saved.includes(plan.id) ? "已收藏" : "收藏"}
          </Button>
          <QuoteLink plan={plan} />
          <Button asChild variant="outline">
            <Link to="/quote" search={{ plan: plan.id }}>
              填表問價
            </Link>
          </Button>
        </div>

        <div className="mt-8 rounded-xl bg-surface p-5">
          <p className="text-xs tracking-wider text-muted">服務限制</p>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            實際安裝費用及網絡覆蓋視乎個別大廈基礎設施而定。{DISCLAIMER[0]}
          </p>
        </div>

        <dl className="mt-8 divide-y divide-border overflow-hidden rounded-xl bg-card shadow-[var(--shadow-border)]">
          {rows.map(([label, value]) => (
            <div key={label} className="grid grid-cols-1 gap-1 px-4 py-3 text-sm sm:grid-cols-4 sm:gap-4">
              <dt className="text-muted">{label}</dt>
              <dd className="font-medium sm:col-span-3">
                {label === "網絡供應商" ? <ProviderMark id={plan.providerId} size="sm" /> : value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-8">
          <h2 className="text-lg font-semibold">賣點</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            {plan.perks.map((perk) => (
              <li key={perk}>{perk}</li>
            ))}
            {plan.portInPerk ? <li className="text-accent">{plan.portInPerk}</li> : null}
          </ul>
        </div>
      </div>

      {related.length ? (
        <div className="mt-12">
          <h2 className="text-lg font-semibold">其他人亦比較</h2>
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

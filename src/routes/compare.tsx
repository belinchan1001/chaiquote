import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { QuoteLink } from "@/components/quote-link";
import { ProviderMark } from "@/components/provider-mark";
import { useDesk, useHydrateDesk } from "@/lib/desk";
import {
  averageFee,
  CATEGORY_LABEL,
  formatFee,
  formatPlanSpeed,
  getPlan,
} from "@/lib/plans";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/compare")({
  component: ComparePage,
  head: () => ({ meta: [{ title: `格價比較 · ${SITE.name}` }] }),
});

function ComparePage() {
  useHydrateDesk();
  const ids = useDesk((s) => s.compare);
  const removeCompare = useDesk((s) => s.removeCompare);
  const clearCompare = useDesk((s) => s.clearCompare);
  const plans = ids.map(getPlan).filter((p): p is NonNullable<typeof p> => Boolean(p));

  if (plans.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-title font-semibold">未揀計劃嚟比較</h1>
        <p className="mt-3 text-muted">喺計劃度撳「比較月費」，最多可以對 3 個計劃。</p>
        <Button asChild className="mt-8">
          <Link to="/plans" search={{ cat: "broadband" }}>
            去睇計劃
          </Link>
        </Button>
      </div>
    );
  }

  const rows: { label: string; value: (i: number) => string }[] = [
    { label: "類別", value: (i) => CATEGORY_LABEL[plans[i].category] },
    { label: "月費", value: (i) => formatFee(plans[i].monthlyFee) },
    { label: "平均月費", value: (i) => formatFee(averageFee(plans[i])) },
    { label: "合約期", value: (i) => `${plans[i].contractMonths} 個月` },
    { label: "免月費", value: (i) => (plans[i].freeMonths ? `${plans[i].freeMonths} 個月` : "無") },
    { label: "網絡速度", value: (i) => formatPlanSpeed(plans[i]) },
    {
      label: "高速數據",
      value: (i) =>
        plans[i].highSpeedGb ? `${plans[i].highSpeedGb}GB` : plans[i].dataGb ? `${plans[i].dataGb}GB` : "—",
    },
    { label: "其後", value: (i) => plans[i].fupNote ?? "—" },
    { label: "通話", value: (i) => plans[i].voice ?? "—" },
    { label: "漫遊", value: (i) => plans[i].roaming ?? "—" },
    { label: "安裝費", value: (i) => plans[i].install },
    { label: "轉台", value: (i) => plans[i].portInPerk ?? "—" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="text-title font-semibold">比較 {plans.length} 個計劃</h1>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={clearCompare}>
            清空
          </Button>
          <QuoteLink plans={plans}>就呢幾個報價</QuoteLink>
        </div>
      </div>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-3xl border-separate border-spacing-0 bg-card text-sm shadow-[var(--shadow-border)]">
          <thead>
            <tr>
              <th className="sticky left-0 bg-card px-4 py-4 text-left font-medium text-muted">項目</th>
              {plans.map((plan) => (
                <th key={plan.id} className="min-w-48 px-4 py-4 text-left font-medium">
                  <ProviderMark id={plan.providerId} size="sm" />
                  <Link
                    to="/plans/$planId"
                    params={{ planId: plan.id }}
                    className="mt-2 block hover:underline"
                  >
                    {plan.name}
                  </Link>
                  <button
                    type="button"
                    className="mt-2 text-xs text-subtle hover:text-fg"
                    onClick={() => removeCompare(plan.id)}
                  >
                    移出
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-t border-border">
                <th className="sticky left-0 bg-card px-4 py-3 text-left font-medium text-muted">
                  {row.label}
                </th>
                {plans.map((plan, i) => (
                  <td key={plan.id} className="px-4 py-3">
                    {row.value(i)}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <th className="sticky left-0 bg-card px-4 py-3 text-left font-medium text-muted">賣點</th>
              {plans.map((plan) => (
                <td key={plan.id} className="px-4 py-3">
                  <ul className="space-y-1 text-muted">
                    {plan.perks.map((perk) => (
                      <li key={perk}>{perk}</li>
                    ))}
                  </ul>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

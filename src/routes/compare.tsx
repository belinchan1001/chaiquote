import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { QuoteLink } from "@/components/quote-link";
import { WhatsAppTip } from "@/components/whatsapp-tip";
import { ProviderMark } from "@/components/provider-mark";
import { useDesk, useHydrateDesk } from "@/lib/desk";
import { useI18n, usePageTitle } from "@/lib/i18n";
import {
  averageFee,
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
  const { t, tx, categoryLabel } = useI18n();
  usePageTitle(`${t("navCompare")} · ${SITE.name}`);

  if (plans.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-title font-semibold">{t("compareNoneTitle")}</h1>
        <p className="mt-3 text-muted">{t("compareNoneLead")}</p>
        <Button asChild className="mt-8">
          <Link to="/plans" search={{ cat: "broadband" }}>
            {t("seePlans")}
          </Link>
        </Button>
      </div>
    );
  }

  const dash = t("dash");
  const rows: { label: string; value: (i: number) => string }[] = [
    { label: t("rowCategory"), value: (i) => categoryLabel(plans[i].category) },
    { label: t("rowFee"), value: (i) => formatFee(plans[i].monthlyFee) },
    { label: t("rowAvg"), value: (i) => formatFee(averageFee(plans[i])) },
    { label: t("rowContract"), value: (i) => t("months", { n: plans[i].contractMonths }) },
    { label: t("rowFree"), value: (i) => (plans[i].freeMonths ? t("months", { n: plans[i].freeMonths }) : t("none")) },
    { label: t("speed"), value: (i) => formatPlanSpeed(plans[i]) },
    {
      label: t("data"),
      value: (i) =>
        plans[i].highSpeedGb ? `${plans[i].highSpeedGb}GB` : plans[i].dataGb ? `${plans[i].dataGb}GB` : dash,
    },
    { label: t("rowAfter"), value: (i) => (plans[i].fupNote ? tx(plans[i].fupNote) : dash) },
    { label: t("rowVoice"), value: (i) => (plans[i].voice ? tx(plans[i].voice) : dash) },
    { label: t("rowRoam"), value: (i) => (plans[i].roaming ? tx(plans[i].roaming) : dash) },
    { label: t("install"), value: (i) => tx(plans[i].install) },
    { label: t("rowPort"), value: (i) => (plans[i].portInPerk ? tx(plans[i].portInPerk) : dash) },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="text-title font-semibold">{t("compareN", { n: plans.length })}</h1>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={clearCompare}>
            {t("compareClear")}
          </Button>
          <QuoteLink plans={plans}>{t("quoteThese")}</QuoteLink>
        </div>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted">{t("referencePrice")}</p>
      <WhatsAppTip className="mt-2" />

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-3xl border-separate border-spacing-0 bg-card text-sm shadow-[var(--shadow-border)]">
          <thead>
            <tr>
              <th className="sticky left-0 bg-card px-4 py-4 text-left font-medium text-muted">{t("rowItem")}</th>
              {plans.map((plan) => (
                <th key={plan.id} className="min-w-48 px-4 py-4 text-left font-medium">
                  <ProviderMark id={plan.providerId} size="sm" />
                  <Link
                    to="/plans/$planId"
                    params={{ planId: plan.id }}
                    className="mt-2 block hover:underline"
                  >
                    {tx(plan.name)}
                  </Link>
                  <button
                    type="button"
                    className="mt-2 text-xs text-subtle hover:text-fg"
                    onClick={() => removeCompare(plan.id)}
                  >
                    {t("remove")}
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
              <th className="sticky left-0 bg-card px-4 py-3 text-left font-medium text-muted">{t("rowPerks")}</th>
              {plans.map((plan) => (
                <td key={plan.id} className="px-4 py-3">
                  <ul className="space-y-1 text-muted">
                    {plan.perks.map((perk) => (
                      <li key={perk}>{tx(perk)}</li>
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

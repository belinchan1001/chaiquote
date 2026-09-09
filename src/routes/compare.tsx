import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronsLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuoteLink } from "@/components/quote-link";
import { WhatsAppTip } from "@/components/whatsapp-tip";
import { CertifiedStaffNote } from "@/components/certified-staff-note";
import { ProviderLogo, ProviderMark } from "@/components/provider-mark";
import { useDesk, useHydrateDesk } from "@/lib/desk";
import { useI18n, usePageTitle } from "@/lib/i18n";
import {
  compareFieldValue,
  planSpecToken,
  shortProviderName,
  visibleCompareFields,
} from "@/lib/compare";
import { formatFee, getPlan, planPerks } from "@/lib/plans";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

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
  const { t, tx, categoryLabel, locale } = useI18n();
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

  const copy = {
    dash: t("dash"),
    none: t("none"),
    months: (n: number) => t("months", { n }),
    categoryLabel,
    tx,
  };
  const rows = visibleCompareFields(plans, copy).map((field) => ({
    ...field,
    label: t(
      (
        {
          category: "rowCategory",
          fee: "rowFee",
          avg: "rowAvg",
          contract: "rowContract",
          free: "rowFree",
          speed: "speed",
          data: "data",
          after: "rowAfter",
          voice: "rowVoice",
          roam: "rowRoam",
          install: "install",
          port: "rowPort",
        } as const
      )[field.key],
    ),
    values: plans.map((plan) => compareFieldValue(plan, field.key, copy)),
  }));
  const showPerks = plans.some((plan) => planPerks(plan).length > 0);
  const showSwipe = plans.length > 1;

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
      {plans.length ? <CertifiedStaffNote plans={plans} className="mt-2" /> : null}
      <WhatsAppTip className="mt-2" />

      {showSwipe ? (
        <p className="mt-6 flex items-center gap-1.5 text-xs text-muted md:hidden">
          <ChevronsLeftRight className="size-3.5 shrink-0" aria-hidden />
          {t("compareSwipe")}
        </p>
      ) : null}

      <div className={cn("relative", showSwipe ? "mt-2 md:mt-8" : "mt-8")}>
        <div className="compare-scroll overflow-x-auto overscroll-x-contain">
          <table className="w-max min-w-full border-separate border-spacing-0 bg-card text-sm shadow-[var(--shadow-border)]">
            <thead>
              <tr>
                <th className="compare-label sticky left-0 z-20 bg-card px-1.5 py-2 text-left align-bottom text-[11px] leading-tight font-medium text-muted sm:px-4 sm:py-4 sm:text-sm">
                  {t("rowItem")}
                </th>
                {plans.map((plan) => (
                  <th
                    key={plan.id}
                    className="compare-plan w-[6.75rem] min-w-[6.75rem] max-w-[6.75rem] px-2 py-2 text-left align-bottom font-medium sm:w-auto sm:min-w-48 sm:max-w-none sm:px-4 sm:py-4"
                  >
                    <div className="sm:hidden">
                      <div className="flex items-center gap-1">
                        <ProviderLogo id={plan.providerId} size="sm" />
                        <p className="min-w-0 truncate text-[11px] leading-tight">
                          {shortProviderName(plan.providerId, locale)}
                        </p>
                      </div>
                      <Link
                        to="/plans/$planId"
                        params={{ planId: plan.id }}
                        className="mt-1 block text-xs leading-snug hover:underline"
                      >
                        {planSpecToken(plan) || tx(plan.name)}
                      </Link>
                      <p className="mt-0.5 font-display text-base font-semibold tabular-nums leading-none">
                        {formatFee(plan.monthlyFee)}
                      </p>
                      {plan.freeMonths ? (
                        <p className="mt-0.5 text-[11px] leading-tight text-accent">
                          {t("months", { n: plan.freeMonths })}
                        </p>
                      ) : null}
                    </div>
                    <div className="hidden sm:block">
                      <ProviderMark id={plan.providerId} size="sm" />
                      <Link
                        to="/plans/$planId"
                        params={{ planId: plan.id }}
                        className="mt-2 block hover:underline"
                      >
                        {tx(plan.name)}
                      </Link>
                    </div>
                    <button
                      type="button"
                      className="mt-1.5 text-[11px] text-subtle hover:text-fg sm:mt-2 sm:text-xs"
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
                <tr key={row.key} className="border-t border-border">
                  <th
                    className={cn(
                      "compare-label sticky left-0 z-10 bg-card px-1.5 py-2 text-left align-top text-[11px] leading-tight font-medium text-muted sm:px-4 sm:py-3 sm:text-sm",
                      row.highlight && "bg-surface text-fg",
                    )}
                  >
                    {row.label}
                  </th>
                  {row.values.map((value, i) => (
                    <td
                      key={plans[i].id}
                      className={cn(
                        "compare-plan w-[6.75rem] min-w-[6.75rem] max-w-[6.75rem] px-2 py-2 align-top break-words sm:w-auto sm:min-w-48 sm:max-w-none sm:px-4 sm:py-3",
                        row.highlight && "bg-surface font-semibold tabular-nums",
                        row.key === "fee" && "font-display text-base",
                      )}
                    >
                      {value}
                    </td>
                  ))}
                </tr>
              ))}
              {showPerks ? (
                <tr>
                  <th className="compare-label sticky left-0 z-10 bg-card px-1.5 py-2 text-left align-top text-[11px] leading-tight font-medium text-muted sm:px-4 sm:py-3 sm:text-sm">
                    {t("rowPerks")}
                  </th>
                  {plans.map((plan) => (
                    <td
                      key={plan.id}
                      className="compare-plan w-[6.75rem] min-w-[6.75rem] max-w-[6.75rem] px-2 py-2 align-top break-words sm:w-auto sm:min-w-48 sm:max-w-none sm:px-4 sm:py-3"
                    >
                      <ul className="space-y-1 text-xs break-words text-muted sm:text-sm">
                        {planPerks(plan).map((perk) => (
                          <li key={perk}>{tx(perk)}</li>
                        ))}
                      </ul>
                    </td>
                  ))}
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        {showSwipe ? (
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-bg to-transparent md:hidden"
            aria-hidden
          />
        ) : null}
      </div>
    </div>
  );
}

import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { cheapestPlan, cheapestVillageBroadbandPlan, formatFee } from "@/lib/plans";
import { useI18n } from "@/lib/i18n";
import type { MessageKey } from "@/lib/messages";

export function HomeBestPicks() {
  const { t } = useI18n();
  const bestPicks = (
    [
      ["catBroadband", cheapestPlan("broadband")],
      ["catHome5g", cheapestPlan("home5g")],
      ["catMobile", cheapestPlan("mobile")],
      ["villageFibre", cheapestVillageBroadbandPlan()],
    ] as const satisfies readonly [MessageKey, ReturnType<typeof cheapestPlan>][]
  ).flatMap(([label, plan]) => (plan ? [{ label, plan }] : []));

  return (
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
  );
}

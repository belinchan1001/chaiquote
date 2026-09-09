import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { Bookmark, GitCompareArrows } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlanBadges } from "@/components/plan-badges";
import { ProviderMark } from "@/components/provider-mark";
import { QuoteLink } from "@/components/quote-link";
import { useDesk } from "@/lib/desk";
import { useI18n } from "@/lib/i18n";
import {
  averageFee,
  formatPlanSpeed,
  formatFee,
  formatInstall,
  formatPrepaidShort,
  planPerks,
  type Plan,
} from "@/lib/plans";
import { cn } from "@/lib/utils";

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function playFoilSweep(el: HTMLElement) {
  if (prefersReducedMotion()) return;
  el.classList.remove("is-foil-sweep");
  void el.offsetWidth;
  el.classList.add("is-foil-sweep");
}

export function PlanCard({ plan }: { plan: Plan }) {
  const shineRef = useRef<HTMLElement>(null);
  const compare = useDesk((s) => s.compare);
  const saved = useDesk((s) => s.saved);
  const toggleCompare = useDesk((s) => s.toggleCompare);
  const toggleSaved = useDesk((s) => s.toggleSaved);
  const inCompare = compare.includes(plan.id);
  const inSaved = saved.includes(plan.id);
  const avg = averageFee(plan);
  const { t, tx, categoryLabel } = useI18n();

  useEffect(() => {
    if (!plan.quotePick) return;
    const el = shineRef.current;
    if (!el || prefersReducedMotion()) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          playFoilSweep(el);
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);

    const onEnd = (event: AnimationEvent) => {
      if (event.animationName !== "foil-sweep") return;
      el.classList.remove("is-foil-sweep");
    };
    el.addEventListener("animationend", onEnd);

    return () => {
      io.disconnect();
      el.removeEventListener("animationend", onEnd);
    };
  }, [plan.quotePick, plan.id]);

  return (
    <article
      ref={shineRef}
      onPointerDown={plan.quotePick ? () => {
        const el = shineRef.current;
        if (el) playFoilSweep(el);
      } : undefined}
      className={cn(
        "flex flex-col rounded-xl bg-card p-5 shadow-[var(--shadow-border)] transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-border-hover)]",
        plan.quotePick && "plan-card-shine",
      )}
    >
      {plan.quotePick ? <span className="foil" aria-hidden="true" /> : null}
      <div className="flex items-start justify-between gap-3">
        <ProviderMark id={plan.providerId} />
        <div className="flex items-center gap-1">
          <PlanBadges plan={plan} />
          <button
            type="button"
            aria-label={inSaved ? t("unsave") : t("save")}
            aria-pressed={inSaved}
            onClick={() => toggleSaved(plan.id)}
            className="relative flex size-11 items-center justify-center text-muted transition-[color] duration-150 hover:text-fg"
          >
            <Bookmark className={cn("size-4", inSaved && "fill-fg text-fg")} />
          </button>
        </div>
      </div>

      <p className="mt-4 text-xs tracking-wider text-subtle uppercase">
        {categoryLabel(plan.category)} · {tx(plan.network)}
      </p>
      <h3 className="mt-1 text-lg font-semibold leading-snug">
        <Link to="/plans/$planId" params={{ planId: plan.id }} className="hover:underline">
          {tx(plan.name)}
        </Link>
      </h3>

      <div className="mt-4 flex items-end gap-2">
        <p className="font-display text-3xl font-semibold tabular-nums leading-none">
          {formatFee(plan.monthlyFee)}
        </p>
        <p className="pb-0.5 text-sm text-muted">{t("perMonth", { n: plan.contractMonths })}</p>
      </div>
      {avg !== plan.monthlyFee ? (
        <p className="mt-1 text-sm text-accent">{t("avgFee", { fee: formatFee(avg) })}</p>
      ) : null}

      <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
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

      <ul className="mt-4 space-y-1 text-sm text-muted">
        {planPerks(plan).slice(0, 4).map((perk) => (
          <li key={perk}>{tx(perk)}</li>
        ))}
        {plan.portInPerk ? <li className="text-accent">{tx(plan.portInPerk)}</li> : null}
      </ul>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          variant={inCompare ? "accent" : "outline"}
          className="flex-1"
          onClick={() => toggleCompare(plan.id)}
        >
          <GitCompareArrows />
          {inCompare ? t("navCompare") : t("compare")}
        </Button>
        <QuoteLink plan={plan} className="flex-1">
          {t("askWa")}
        </QuoteLink>
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-subtle">{t("referencePrice")}</p>
    </article>
  );
}

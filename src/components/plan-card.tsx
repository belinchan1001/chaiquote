import { useEffect, useRef } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Bookmark, Check, GitCompareArrows } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlanBadges } from "@/components/plan-badges";
import { OfferCountdown } from "@/components/offer-countdown";
import { CertifiedStaffNote } from "@/components/certified-staff-note";
import { LogoMark } from "@/components/logo";
import { ProviderMark } from "@/components/provider-mark";
import { PlanShareButton } from "@/components/plan-share-button";
import { QuoteLink } from "@/components/quote-link";
import { useDesk } from "@/lib/desk";
import { registerFoilCard } from "@/lib/foil-scroll";
import { useI18n } from "@/lib/i18n";
import {
  averageFee,
  formatPlanSpeed,
  formatFee,
  formatInstall,
  formatPrepaidShort,
  hasCertifiedStaff,
  isNetvigatorVillage,
  planPerks,
  type Category,
  type Plan,
} from "@/lib/plans";
import { parseEstateParam, parseHousingParam } from "@/lib/related-plans";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

const SERVICE_TONE: Record<Category, string> = {
  broadband: "bg-[#EFF6FF] text-[#1D4ED8]",
  home5g: "bg-[#FAF5FF] text-[#7E22CE]",
  mobile: "bg-[#F0FDF4] text-[#15803D]",
  business: "bg-[#FFF7ED] text-[#C2410C]",
};

function cardSpecLines(plan: Plan) {
  const lines: string[] = [];
  if (plan.category === "home5g" || plan.speedMbps) lines.push(formatPlanSpeed(plan));
  if (plan.category !== "mobile" && plan.install) lines.push(formatInstall(plan));
  if (plan.highSpeedGb || plan.dataGb) lines.push(`${plan.highSpeedGb ?? plan.dataGb}GB`);
  if (plan.voice) lines.push(plan.voice);
  for (const perk of planPerks(plan)) lines.push(perk);
  if (plan.portInPerk) lines.push(plan.portInPerk);
  const seen = new Set<string>();
  return lines.filter((line) => {
    const key = line.trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
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
  const { t, tx, categoryLabel, locale } = useI18n();
  const housing = useRouterState({
    select: (s) => {
      try {
        return parseHousingParam(new URL(s.location.href, "https://quote.local").searchParams.get("housing"));
      } catch {
        return undefined;
      }
    },
  });
  const estate = useRouterState({
    select: (s) => {
      try {
        return parseEstateParam(new URL(s.location.href, "https://quote.local").searchParams.get("estate"));
      } catch {
        return undefined;
      }
    },
  });
  const esportsGlow = useRouterState({
    select: (s) => {
      try {
        const flag = new URL(s.location.href, "https://quote.local").searchParams.get("esports");
        return flag === "1" || flag === "true";
      } catch {
        return false;
      }
    },
  });

  useEffect(() => {
    if (!plan.quotePick) return;
    const el = shineRef.current;
    if (!el) return;
    return registerFoilCard(el);
  }, [plan.quotePick, plan.id]);

  const specs = cardSpecLines(plan);
  const face = specs.slice(0, 3);
  const more = specs.slice(3);
  const detailBits = [
    ...more,
    plan.prepaid ? formatPrepaidShort(plan.prepaid) : "",
    plan.fupNote ?? "",
    plan.limits ?? "",
    plan.bestFor ?? "",
    isNetvigatorVillage(plan) ? t("villageFeeNote") : "",
  ].filter(Boolean);

  return (
    <article
      ref={shineRef}
      className={cn(
        "relative flex min-h-[320px] flex-col rounded-2xl border border-[#E5E7EB] bg-white p-5 pb-12 transition-[box-shadow,border-color] duration-150 hover:border-[#0F62FE] hover:shadow-md",
        esportsGlow && "plan-card-esports",
        plan.quotePick && "plan-card-shine",
      )}
    >
      {plan.quotePick ? <span className="foil" aria-hidden="true" /> : null}
      {plan.adImageUrl ? (
        <img src={plan.adImageUrl} alt="" className="mb-3 h-28 w-full rounded-lg object-cover" />
      ) : null}
      <div className="flex items-start justify-between gap-3">
        <ProviderMark id={plan.providerId} />
        <button
          type="button"
          aria-label={inSaved ? t("unsave") : t("save")}
          aria-pressed={inSaved}
          onClick={() => toggleSaved(plan.id)}
          className="relative flex size-11 shrink-0 items-center justify-center text-muted transition-[color] duration-150 hover:text-fg"
        >
          <Bookmark className={cn("size-4", inSaved && "fill-fg text-fg")} />
        </button>
      </div>

      <p className={cn("mt-3 inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-medium", SERVICE_TONE[plan.category])}>
        {categoryLabel(plan.category)}
      </p>
      <PlanBadges plan={plan} />
      <OfferCountdown plan={plan} />

      <h3 className="mt-3 text-lg font-semibold leading-snug">
        {plan.staffOffer ? (
          tx(plan.name)
        ) : (
          <Link
            to="/plans/$planId"
            params={{ planId: plan.id }}
            search={{
              ...(housing ? { housing } : {}),
              ...(estate ? { estate } : {}),
            }}
            className="hover:underline"
          >
            {tx(plan.name)}
          </Link>
        )}
      </h3>

      <div className="mt-4 flex flex-wrap items-end gap-2">
        <p className="font-display text-[32px] font-bold tabular-nums leading-none">{formatFee(plan.monthlyFee)}</p>
        <span className="mb-0.5 rounded-full bg-[#F3F4F6] px-2.5 py-1 text-sm font-normal text-[#374151]">
          {t("perMonth", { n: plan.contractMonths })}
        </span>
      </div>
      {avg !== plan.monthlyFee ? (
        <p className="mt-1 text-sm text-accent">{t("avgFee", { fee: formatFee(avg) })}</p>
      ) : null}

      <ul className="mt-4 min-h-[78px] space-y-1.5 text-sm text-[#4B5563]">
        {face.map((line) => (
          <li key={line} className="flex items-start gap-2">
            <Check className="mt-0.5 size-3.5 shrink-0 text-[#0F62FE]" aria-hidden="true" />
            <span>{tx(line)}</span>
          </li>
        ))}
      </ul>

      {detailBits.length || plan.category === "business" ? (
        <details className="mt-3 text-xs leading-relaxed text-muted">
          <summary className="cursor-pointer text-[#6B7280]">
            {locale === "en" ? "Details: prepay, cooling-off and terms" : "睇詳情：預繳、冷靜期等"}
          </summary>
          <div className="mt-2 space-y-1">
            {detailBits.map((line) => (
              <p key={line}>{tx(line)}</p>
            ))}
          </div>
        </details>
      ) : null}

      {hasCertifiedStaff(plan) ? <CertifiedStaffNote plan={plan} className="mt-4" /> : null}
      {plan.category === "business" ? (
        <p className="mt-3 text-xs leading-relaxed text-muted">{t("businessDisclaimer")}</p>
      ) : null}
      <div className={cn("mt-auto flex flex-col gap-2 pt-4", hasCertifiedStaff(plan) ? "mt-2" : "")}>
        <QuoteLink plan={plan}
          variant="default"
          className="h-11 w-full rounded-full bg-[#0F62FE] text-white hover:bg-[#0F62FE]/90"
        >
          {locale === "en" ? "WhatsApp this plan" : "WhatsApp 問呢個Plan"}
        </QuoteLink>
        <p className="text-center text-[11px] leading-relaxed text-[#6B7280]">
          {hasCertifiedStaff(plan)
            ? locale === "en"
              ? "A verified authorised salesperson replies"
              : "由已核實身份嘅授權銷售回覆"
            : t("referencePrice")}
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={inCompare ? "accent" : "outline"}
            className="flex-1"
            onClick={() => toggleCompare(plan.id)}
          >
            <GitCompareArrows />
            {inCompare ? t("navCompare") : t("compare")}
          </Button>
          {plan.staffOffer ? null : <PlanShareButton plan={plan} />}
        </div>
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-subtle">{t("referencePrice")}</p>
      <span
        aria-hidden="true"
        className="pointer-events-none !absolute right-5 bottom-3 z-[1] inline-flex items-center gap-1 font-display text-[13px] font-medium tracking-tight text-subtle/50 select-none"
      >
        <LogoMark className="size-5" />
        <span>{SITE.name}</span>
      </span>
    </article>
  );
}

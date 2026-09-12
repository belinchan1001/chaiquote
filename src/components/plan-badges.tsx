import { useI18n } from "@/lib/i18n";
import type { Plan } from "@/lib/plans";
import { cn } from "@/lib/utils";

const pillClass = "rounded-full bg-hot px-2.5 py-1 text-sm font-medium text-hot-foreground";
const quotePickClass = "rounded-full bg-fg px-2.5 py-1 text-sm font-medium text-white";
const intakeClass = "rounded-full bg-intake px-2.5 py-1 text-sm font-medium text-intake-foreground";
const flashClass = "rounded-full bg-flash px-2.5 py-1 text-sm font-medium text-flash-foreground";

export function PlanBadges({ plan, className }: { plan: Plan; className?: string }) {
  const { t } = useI18n();
  if (!plan.quotePick && !plan.latestOffer && !plan.hot && !plan.newIntakeOffer && !plan.flashOffer) return null;

  return (
    <div className={cn("mt-3 flex flex-wrap items-center gap-1.5", className)}>
      {plan.flashOffer ? <span className={flashClass}>{t("flashOffer")}</span> : null}
      {plan.newIntakeOffer ? <span className={intakeClass}>{t("newIntakeOffer")}</span> : null}
      {plan.quotePick ? <span className={quotePickClass}>👍 {t("quotePick")}</span> : null}
      {plan.latestOffer ? <span className={pillClass}>{t("latestOffer")}</span> : null}
      {plan.hot ? <span className={pillClass}>{t("hot")}</span> : null}
    </div>
  );
}

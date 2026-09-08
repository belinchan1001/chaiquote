import { useI18n } from "@/lib/i18n";
import type { Plan } from "@/lib/plans";
import { cn } from "@/lib/utils";

const pillClass = "rounded-full bg-hot px-2 py-1 text-xs font-medium text-hot-foreground";
const quotePickClass = "rounded-full bg-fg px-2 py-1 text-xs font-medium text-white";

export function PlanBadges({ plan, className }: { plan: Plan; className?: string }) {
  const { t } = useI18n();
  if (!plan.quotePick && !plan.latestOffer && !plan.hot) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-1", className)}>
      {plan.quotePick ? <span className={quotePickClass}>👍 {t("quotePick")}</span> : null}
      {plan.latestOffer ? <span className={pillClass}>{t("latestOffer")}</span> : null}
      {plan.hot ? <span className={pillClass}>{t("hot")}</span> : null}
    </div>
  );
}

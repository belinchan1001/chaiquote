import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDesk, useHydrateDesk } from "@/lib/desk";
import { useI18n } from "@/lib/i18n";
import { formatFee, getPlan } from "@/lib/plans";
import { cn } from "@/lib/utils";

export function CompareBar() {
  const ready = useHydrateDesk();
  const compare = useDesk((s) => s.compare);
  const notice = useDesk((s) => s.notice);
  const removeCompare = useDesk((s) => s.removeCompare);
  const clearCompare = useDesk((s) => s.clearCompare);
  const clearNotice = useDesk((s) => s.clearNotice);
  const { t, tx } = useI18n();
  const show = ready && (compare.length > 0 || Boolean(notice));

  return (
    <>
      <div
        className={cn("shrink-0 transition-[height] duration-200 ease-out", show ? "h-24" : "h-0")}
        aria-hidden
      />
      <div
        className={cn(
          "compare-dock fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-sm transition-transform duration-200 ease-out",
          show ? "translate-y-0" : "pointer-events-none translate-y-full",
        )}
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            {compare.map((id) => {
              const plan = getPlan(id);
              if (!plan) return null;
              return (
                <span
                  key={id}
                  className="inline-flex items-center gap-2 rounded-full bg-surface px-3 py-2 text-sm"
                >
                  <span className="max-w-40 truncate">
                    {tx(plan.name)}
                    <span className="ml-2 font-display tabular-nums">{formatFee(plan.monthlyFee)}</span>
                  </span>
                  <button
                    type="button"
                    aria-label={t("removeCompare", { name: tx(plan.name) })}
                    onClick={() => removeCompare(id)}
                    className="relative size-6 after:absolute after:inset-1/2 after:size-10 after:-translate-x-1/2 after:-translate-y-1/2"
                  >
                    <X className="size-4" />
                  </button>
                </span>
              );
            })}
            {notice ? (
              <p className="text-sm text-accent">
                {t("compareMax")}{" "}
                <button type="button" className="underline" onClick={clearNotice}>
                  {t("compareBarKnow")}
                </button>
              </p>
            ) : null}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={clearCompare}>
              {t("compareClear")}
            </Button>
            <Button asChild size="sm">
              <Link to="/compare">{t("compareCount", { n: compare.length })}</Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

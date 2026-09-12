import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDesk, useHydrateDesk } from "@/lib/desk";
import { useI18n } from "@/lib/i18n";
import { compareChipLabel } from "@/lib/compare";
import { getPlan } from "@/lib/plans";
import { cn } from "@/lib/utils";

export function CompareBar() {
  const ready = useHydrateDesk();
  const compare = useDesk((s) => s.compare);
  const notice = useDesk((s) => s.notice);
  const removeCompare = useDesk((s) => s.removeCompare);
  const clearCompare = useDesk((s) => s.clearCompare);
  const clearNotice = useDesk((s) => s.clearNotice);
  const { t, locale } = useI18n();
  const show = ready && (compare.length > 0 || Boolean(notice));

  return (
    <>
      <div
        className={cn(
          "shrink-0 transition-[height] duration-200 ease-out",
          show ? "h-[calc(6rem+env(safe-area-inset-bottom))] sm:h-14" : "h-0",
        )}
        aria-hidden
      />
      <div
        className={cn(
          "compare-dock fixed inset-x-0 bottom-0 z-40 overflow-hidden border-t border-border bg-card/95 px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur-sm transition-transform duration-200 ease-out",
          show ? "translate-y-0" : "pointer-events-none translate-y-full",
        )}
      >
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 sm:flex-row sm:items-center">
          <div className="min-w-0 w-full sm:flex-1 sm:overflow-x-auto">
            <div className="flex w-full items-center gap-1.5 sm:w-max">
              {compare.map((id) => {
                const plan = getPlan(id);
                if (!plan) return null;
                const label = compareChipLabel(plan, locale);
                return (
                  <span
                    key={id}
                    className="inline-flex h-7 min-w-0 flex-1 items-center gap-1 rounded-full bg-surface pl-2.5 pr-0.5 text-xs sm:flex-none"
                  >
                    <span className="min-w-0 truncate">{label}</span>
                    <button
                      type="button"
                      aria-label={t("removeCompare", { name: label })}
                      onClick={() => removeCompare(id)}
                      className="relative flex size-6 shrink-0 items-center justify-center after:absolute after:inset-1/2 after:size-10 after:-translate-x-1/2 after:-translate-y-1/2"
                    >
                      <X className="size-3.5" />
                    </button>
                  </span>
                );
              })}
              {notice ? (
                <p className="max-w-56 shrink-0 text-xs text-accent sm:max-w-none">
                  {t("compareMax")}{" "}
                  <button type="button" className="underline" onClick={clearNotice}>
                    {t("compareBarKnow")}
                  </button>
                </p>
              ) : null}
            </div>
          </div>
          <div className="flex shrink-0 gap-1">
            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={clearCompare}>
              {t("compareClear")}
            </Button>
            <Button asChild size="sm" className="h-8 px-2.5 text-xs">
              <Link to="/compare">{t("compareCount", { n: compare.length })}</Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import {
  SHARE_SUCCESS_CUE_MS,
  SHARE_SUCCESS_TOAST_MS,
  defaultShareSuccessResumeHost,
  defaultShareSuccessToastHost,
  isPlanShareSuccess,
  playShareSuccessDing,
  scheduleShareSuccessReveal,
  shareOrCopyPlan,
  startShareSuccessToast,
  type PlanSharePlan,
} from "@/lib/plan-share";
import { cn } from "@/lib/utils";

type Cue = "idle" | "copied" | "failed";

export function PlanShareButton({ plan, className }: { plan: PlanSharePlan; className?: string }) {
  const { t } = useI18n();
  const [cue, setCue] = useState<Cue>("idle");
  const [toast, setToast] = useState(false);
  const [hot, setHot] = useState(false);
  const timer = useRef(0);
  const stopToast = useRef<(() => void) | undefined>(undefined);
  const cancelPending = useRef<(() => void) | undefined>(undefined);

  useEffect(
    () => () => {
      window.clearTimeout(timer.current);
      stopToast.current?.();
      cancelPending.current?.();
    },
    [],
  );

  function flash(next: Exclude<Cue, "idle">) {
    setCue(next);
    window.clearTimeout(timer.current);
    const holdMs = next === "copied" ? SHARE_SUCCESS_CUE_MS : 2000;
    timer.current = window.setTimeout(() => setCue("idle"), holdMs);
  }

  function showSuccessToast() {
    stopToast.current?.();
    stopToast.current = startShareSuccessToast(
      SHARE_SUCCESS_TOAST_MS,
      defaultShareSuccessToastHost({
        show: () => setToast(true),
        hide: () => setToast(false),
      }),
    );
  }

  function revealSuccess() {
    flash("copied");
    playShareSuccessDing();
    showSuccessToast();
  }

  async function onShare() {
    setHot(true);
    cancelPending.current?.();
    cancelPending.current = undefined;
    try {
      const result = await shareOrCopyPlan(plan);
      if (result === "aborted") {
        cancelPending.current?.();
        cancelPending.current = undefined;
        return;
      }
      if (isPlanShareSuccess(result)) {
        cancelPending.current = scheduleShareSuccessReveal(
          result,
          revealSuccess,
          defaultShareSuccessResumeHost(),
        );
      }
    } catch {
      cancelPending.current?.();
      cancelPending.current = undefined;
      flash("failed");
    } finally {
      setHot(false);
    }
  }

  const label = cue === "copied" ? t("shareCopied") : cue === "failed" ? t("shareFailed") : t("share");

  return (
    <>
      <Button
        type="button"
        variant="outline"
        aria-label={label}
        aria-live="polite"
        aria-busy={hot}
        onClick={() => void onShare()}
        className={cn(
          "shrink-0",
          hot && "action-hot",
          cue === "copied" && "action-done bg-accent text-accent-foreground",
          className,
        )}
      >
        {cue === "copied" ? <Check /> : <Share2 />}
        {label}
      </Button>
      {toast
        ? createPortal(
            <div className="share-success-toast" role="status" aria-live="polite">
              <div className="share-success-toast-card">
                <div className="share-success-toast-mark">
                  <Check strokeWidth={2.75} />
                </div>
                <p className="share-success-toast-label">{t("shareSuccessToast")}</p>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

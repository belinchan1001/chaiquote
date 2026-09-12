import { useEffect, useRef, useState } from "react";
import { Check, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { shareOrCopyPlan, type PlanSharePlan } from "@/lib/plan-share";
import { cn } from "@/lib/utils";

type Cue = "idle" | "copied" | "failed";

export function PlanShareButton({ plan, className }: { plan: PlanSharePlan; className?: string }) {
  const { t } = useI18n();
  const [cue, setCue] = useState<Cue>("idle");
  const timer = useRef(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function flash(next: Exclude<Cue, "idle">) {
    setCue(next);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCue("idle"), 2000);
  }

  async function onShare() {
    try {
      const result = await shareOrCopyPlan(plan);
      if (result === "copied") flash("copied");
    } catch {
      flash("failed");
    }
  }

  const label = cue === "copied" ? t("shareCopied") : cue === "failed" ? t("shareFailed") : t("share");

  return (
    <Button
      type="button"
      variant="outline"
      aria-label={label}
      aria-live="polite"
      onClick={() => void onShare()}
      className={cn("shrink-0", className)}
    >
      {cue === "copied" ? <Check /> : <Share2 />}
      {label}
    </Button>
  );
}

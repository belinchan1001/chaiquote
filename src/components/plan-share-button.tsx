import { useEffect, useRef, useState } from "react";
import { Check, Share2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { shareOrCopyPlan, type PlanSharePlan } from "@/lib/plan-share";

type Cue = "idle" | "copied" | "failed";

export function PlanShareButton({ plan }: { plan: PlanSharePlan }) {
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
    <button
      type="button"
      aria-label={label}
      aria-live="polite"
      onClick={() => void onShare()}
      className="relative flex size-11 shrink-0 items-center justify-center text-muted transition-[color] duration-150 hover:text-fg"
    >
      {cue === "copied" ? <Check className="size-4" /> : <Share2 className="size-4" />}
    </button>
  );
}

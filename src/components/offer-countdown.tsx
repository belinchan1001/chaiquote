import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { remainingOfferMs, type Plan } from "@/lib/plans";

function parts(ms: number) {
  const total = Math.floor(ms / 1000);
  const s = total % 60;
  const m = Math.floor(total / 60) % 60;
  const h = Math.floor(total / 3600) % 24;
  const d = Math.floor(total / 86400);
  const pad = (n: number) => String(n).padStart(2, "0");
  return { d: String(d), h: pad(h), m: pad(m), s: pad(s) };
}

export function OfferCountdown({ plan }: { plan: Plan }) {
  const { t } = useI18n();
  const [ms, setMs] = useState(() => remainingOfferMs(plan));

  useEffect(() => {
    if (!plan.offerEndsAt) return;
    const tick = () => setMs(remainingOfferMs(plan));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [plan.offerEndsAt, plan.id]);

  if (!plan.offerEndsAt) return null;

  const live = ms > 0;
  const clock = parts(ms);

  return (
    <div
      className="mt-3 rounded-lg bg-flash px-3 py-2 text-flash-foreground"
      role="timer"
      aria-label={live ? t("flashCountdown", clock) : t("flashCountdownEnded")}
    >
      <p className="text-[11px] font-medium tracking-wide">{t("flashBookBy")}</p>
      <p className="mt-0.5 font-display text-sm font-semibold tabular-nums">
        {live ? t("flashCountdown", clock) : t("flashCountdownEnded")}
      </p>
    </div>
  );
}

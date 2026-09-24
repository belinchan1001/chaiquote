import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { flashBookByLabel, remainingOfferMs, type Plan } from "@/lib/plans";

function parts(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const s = total % 60;
  const m = Math.floor(total / 60) % 60;
  const h = Math.floor(total / 3600) % 24;
  const d = Math.floor(total / 86400);
  const pad = (n: number) => String(n).padStart(2, "0");
  return { d: pad(d), h: pad(h), m: pad(m), s: pad(s) };
}

const COPY = {
  zh: {
    ended: "快閃已完結",
    units: ["日", "時", "分", "秒"] as const,
  },
  en: {
    ended: "Flash offer ended",
    units: ["days", "hrs", "min", "sec"] as const,
  },
};

function Digit({ value, label }: { value: string; label: string }) {
  return (
    <div className="min-w-0 flex-1 text-center">
      <p className="digital-clock-digit">{value}</p>
      <p className="digital-clock-unit">{label}</p>
    </div>
  );
}

function Colon() {
  return (
    <span className="digital-clock-colon" aria-hidden="true">
      :
    </span>
  );
}

export function OfferCountdown({ plan }: { plan: Plan }) {
  const { locale } = useI18n();
  const [ms, setMs] = useState(() => remainingOfferMs(plan));

  useEffect(() => {
    if (!plan.offerEndsAt) return;
    const tick = () => setMs(remainingOfferMs(plan));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [plan.offerEndsAt, plan.id]);

  if (!plan.offerEndsAt) return null;

  const copy = COPY[locale] ?? COPY.zh;
  const bookBy = flashBookByLabel(plan.offerEndsAt, locale === "en" ? "en" : "zh");
  const live = ms > 0;
  const clock = parts(ms);
  const values = [clock.d, clock.h, clock.m, clock.s];
  const aria = live
    ? `${bookBy} ${values.map((value, i) => `${value} ${copy.units[i]}`).join(" ")}`
    : copy.ended;

  return (
    <div className="digital-clock mt-3" role="timer" aria-live="polite" aria-label={aria}>
      <p className="digital-clock-caption">{bookBy}</p>
      {live ? (
        <div className="mt-2 flex items-start justify-center">
          <Digit value={clock.d} label={copy.units[0]} />
          <Colon />
          <Digit value={clock.h} label={copy.units[1]} />
          <Colon />
          <Digit value={clock.m} label={copy.units[2]} />
          <Colon />
          <Digit value={clock.s} label={copy.units[3]} />
        </div>
      ) : (
        <p className="digital-clock-ended">{copy.ended}</p>
      )}
    </div>
  );
}

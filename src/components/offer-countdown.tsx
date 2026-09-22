import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { remainingOfferMs, type Plan } from "@/lib/plans";
import { cn } from "@/lib/utils";

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
    bookBy: "須於 9 月 30 日前成功預約安裝",
    ended: "快閃已完結",
    units: ["日", "時", "分", "秒"] as const,
  },
  en: {
    bookBy: "Must book installation by 30 Sep",
    ended: "Flash offer ended",
    units: ["days", "hrs", "min", "sec"] as const,
  },
};

function Unit({ value, label, pulse }: { value: string; label: string; pulse?: boolean }) {
  return (
    <div
      className={cn(
        "min-w-0 flex-1 rounded-md bg-flash-foreground/15 px-1 py-1.5 text-center",
        pulse && "countdown-sec",
      )}
    >
      <p className="font-display text-xl font-bold tabular-nums leading-none tracking-wide">{value}</p>
      <p className="mt-1 text-[10px] font-medium tracking-wide opacity-75">{label}</p>
    </div>
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
  const live = ms > 0;
  const clock = parts(ms);
  const values = [clock.d, clock.h, clock.m, clock.s];
  const aria = live
    ? `${copy.bookBy} ${values.map((value, i) => `${value} ${copy.units[i]}`).join(" ")}`
    : copy.ended;

  return (
    <div
      className="mt-3 rounded-lg bg-flash px-3 py-2.5 text-flash-foreground"
      role="timer"
      aria-live="polite"
      aria-label={aria}
    >
      <p className="text-[11px] font-medium tracking-wide">{copy.bookBy}</p>
      {live ? (
        <div className="mt-2 flex gap-1.5">
          {values.map((value, i) => (
            <Unit key={copy.units[i]} value={value} label={copy.units[i]} pulse={i === 3} />
          ))}
        </div>
      ) : (
        <p className="mt-1 font-display text-sm font-semibold">{copy.ended}</p>
      )}
    </div>
  );
}

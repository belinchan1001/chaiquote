import { useEffect, useRef, useState, type PointerEvent } from "react";
import { Link } from "@tanstack/react-router";
import { ProviderMark } from "@/components/provider-mark";
import { QuoteLink } from "@/components/quote-link";
import { useI18n } from "@/lib/i18n";
import { formatFee, type Plan } from "@/lib/plans";
import { homeQuotePlans } from "@/lib/home-quotes";
import { cn } from "@/lib/utils";

const INTERVAL_MS = 6000;

function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState<boolean | null>(null);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(mq.matches);
    const onChange = () => setReduce(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduce;
}

function PromoCard({ plan }: { plan: Plan }) {
  const { t, tx, housingList } = useI18n();
  return (
    <article className="flex h-full flex-col rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
      <p className="text-xs font-medium tracking-wider text-accent">齊Quote 推介</p>
      <div className="mt-3">
        <ProviderMark id={plan.providerId} />
      </div>
      <h3 className="mt-3 text-base font-semibold leading-snug">
        <Link to="/plans/$planId" params={{ planId: plan.id }} className="hover:underline">
          {tx(plan.name)}
        </Link>
      </h3>
      <p className="mt-3 font-display text-3xl font-semibold tabular-nums leading-none">
        {formatFee(plan.monthlyFee)}
        <span className="ml-1 text-sm font-sans font-medium text-muted">{t("perMonth", { n: plan.contractMonths })}</span>
      </p>
      <p className="mt-2 text-sm text-muted">{housingList(plan.housing)}</p>
      <div className="mt-4 pt-1">
        <QuoteLink plan={plan} className="w-full">
          {t("askWa")}
        </QuoteLink>
      </div>
    </article>
  );
}

export function QuotePromo() {
  const plans = homeQuotePlans();
  const reduce = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const startX = useRef<number | null>(null);

  useEffect(() => {
    if (reduce !== false || paused || plans.length < 2) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % plans.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [reduce, paused, plans.length]);

  if (!plans.length) return null;

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest("a,button")) return;
    startX.current = event.clientX;
    setPaused(true);
  }
  function onPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (startX.current === null) {
      setPaused(false);
      return;
    }
    if (startX.current !== null) {
      const delta = event.clientX - startX.current;
      if (delta > 40) setIndex((current) => (current - 1 + plans.length) % plans.length);
      else if (delta < -40) setIndex((current) => (current + 1) % plans.length);
    }
    startX.current = null;
    setPaused(false);
  }

  return (
    <div>
      <div className="hidden gap-4 lg:grid lg:grid-cols-3">
        {plans.map((plan) => (
          <PromoCard key={plan.id} plan={plan} />
        ))}
      </div>

      <div
        className="lg:hidden"
        onPointerEnter={() => setPaused(true)}
        onPointerLeave={() => setPaused(false)}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          startX.current = null;
          setPaused(false);
        }}
      >
        <div className="overflow-hidden">
          <div
            className="flex"
            style={{
              transform: `translateX(-${index * 100}%)`,
              transition: reduce ? "none" : "transform 400ms ease",
            }}
          >
            {plans.map((plan) => (
              <div key={plan.id} className="w-full shrink-0 px-0.5">
                <PromoCard plan={plan} />
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 flex justify-center gap-2">
          {plans.map((plan, i) => (
            <button
              key={plan.id}
              type="button"
              aria-label={`推介 ${i + 1}`}
              aria-current={i === index}
              className="flex size-11 items-center justify-center"
              onClick={() => setIndex(i)}
            >
              <span className={cn("size-3 rounded-full", i === index ? "bg-primary" : "bg-border")} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

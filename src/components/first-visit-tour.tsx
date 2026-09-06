import { useEffect, useId, useState } from "react";
import { MapPin, MessageCircle, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { useI18n } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";
import type { MessageKey } from "@/lib/messages";

const TOUR_KEY = "chaiquote-tour-done";

const STEPS = [
  { title: "tour1Title", text: "tour1Text", icon: MapPin },
  { title: "tour2Title", text: "tour2Text", icon: SlidersHorizontal },
  { title: "tour3Title", text: "tour3Text", icon: MessageCircle },
] as const satisfies { title: MessageKey; text: MessageKey; icon: typeof MapPin }[];

export function FirstVisitTour() {
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const { t } = useI18n();

  useEffect(() => {
    try {
      if (localStorage.getItem(TOUR_KEY) === "1") return;
    } catch {
      return;
    }
    const timer = window.setTimeout(() => setOpen(true), 400);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") finish();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function finish() {
    try {
      localStorage.setItem(TOUR_KEY, "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  }

  if (!open) return null;

  const current = STEPS[step];
  const last = step === STEPS.length - 1;
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-fg/45"
        aria-label={t("tourSkip")}
        onClick={finish}
      />
      {last ? (
        <div
          className="pointer-events-none absolute right-4 bottom-6 size-14 rounded-full ring-4 ring-whatsapp"
          aria-hidden
        />
      ) : null}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative m-4 w-full max-w-md rounded-2xl bg-card p-5 shadow-[var(--shadow-border-hover)] sm:p-6 popover-in"
      >
        <p className="text-xs font-medium tracking-wider text-muted">
          {t("tourStep", { n: step + 1, total: STEPS.length })}
        </p>
        <div className="mt-4 flex size-11 items-center justify-center rounded-full bg-surface text-primary">
          {last ? <WhatsAppIcon className="size-5" /> : <Icon className="size-5" aria-hidden />}
        </div>
        <h2 id={titleId} className="mt-4 text-lg font-semibold">
          {t(current.title)}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {t(current.text, { phone: SITE.phoneDisplay })}
        </p>
        <div className="mt-4 flex gap-1.5" aria-hidden>
          {STEPS.map((item, i) => (
            <span
              key={item.title}
              className={cn("h-1.5 flex-1 rounded-full", i <= step ? "bg-primary" : "bg-surface")}
            />
          ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {last ? (
            <Button type="button" className="flex-1" onClick={finish}>
              {t("tourDone")}
            </Button>
          ) : (
            <Button type="button" className="flex-1" onClick={() => setStep((n) => n + 1)}>
              {t("tourNext")}
            </Button>
          )}
          <Button type="button" variant="ghost" onClick={finish}>
            {t("tourSkip")}
          </Button>
        </div>
      </div>
    </div>
  );
}

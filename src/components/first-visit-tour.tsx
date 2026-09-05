import { useEffect, useId, useState } from "react";
import { MapPin, MessageCircle, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { SITE } from "@/lib/site";
import { cn } from "@/lib/utils";

const TOUR_KEY = "chaiquote-tour-done";

const STEPS = [
  {
    title: "第一步：講你住邊",
    text: "輸入屋苑、大廈或街道。系統會判斷公屋、居屋、私人樓或村屋，再撳「自動篩選計劃」，就只睇啱你地址嘅月費。",
    icon: MapPin,
  },
  {
    title: "第二步：篩選同比較",
    text: "可以再揀網速、電訊商同預算。最多同時比較 3 個計劃，月費、合約同禮遇一次過睇晒。",
    icon: SlidersHorizontal,
  },
  {
    title: "即刻問？撳 WhatsApp",
    text: `右下角綠色掣可以直接 WhatsApp ${SITE.phoneDisplay}。篩過地址再問，訊息會自動帶你嘅申請地址。`,
    icon: MessageCircle,
  },
] as const;

export function FirstVisitTour() {
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

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
        aria-label="略過教學"
        onClick={finish}
      />
      {last ? (
        <div
          className="pointer-events-none absolute right-4 bottom-6 size-16 rounded-full ring-4 ring-accent"
          aria-hidden
        />
      ) : null}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative m-4 w-full max-w-md rounded-2xl bg-card p-5 shadow-[var(--shadow-border-hover)] sm:p-6"
      >
        <p className="text-xs font-medium tracking-wider text-muted">
          快速教學 {step + 1}／{STEPS.length}
        </p>
        <div className="mt-4 flex size-11 items-center justify-center rounded-full bg-surface text-primary">
          {last ? <WhatsAppIcon className="size-5" /> : <Icon className="size-5" aria-hidden />}
        </div>
        <h2 id={titleId} className="mt-4 text-lg font-semibold">
          {current.title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">{current.text}</p>
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
              開始比較
            </Button>
          ) : (
            <Button type="button" className="flex-1" onClick={() => setStep((n) => n + 1)}>
              下一頁
            </Button>
          )}
          <Button type="button" variant="ghost" onClick={finish}>
            略過
          </Button>
        </div>
      </div>
    </div>
  );
}

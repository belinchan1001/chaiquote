import { useEffect, useState, type ComponentType } from "react";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { useDesk, useHydrateDesk } from "@/lib/desk";
import { useI18n } from "@/lib/i18n";
import type { Plan } from "@/lib/plans";
import { quoteWhatsappDisplay, quoteWhatsappE164 } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

export function DeferredWhatsApp() {
  const [Widget, setWidget] = useState<ComponentType | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  useHydrateDesk();
  const compare = useDesk((s) => s.compare);
  const inquiry = useDesk((s) => s.inquiry);
  const lifted = compare.length > 0;
  const { t } = useI18n();
  const deskE164 = quoteWhatsappE164(plans, inquiry);
  const deskPhone = quoteWhatsappDisplay(plans, inquiry);

  useEffect(() => {
    if (!compare.length) {
      setPlans([]);
      return;
    }
    let cancel = false;
    void import("@/lib/plans").then(({ getPlan }) => {
      if (cancel) return;
      setPlans(compare.map((id) => getPlan(id)).filter((plan): plan is Plan => Boolean(plan)));
    });
    return () => {
      cancel = true;
    };
  }, [compare]);

  useEffect(() => {
    let cancel = false;
    let idle = 0;
    let timeout = 0;
    const load = () => {
      if (cancel) return;
      void import("@/components/whatsapp-widget").then((mod) => {
        if (!cancel) setWidget(() => mod.WhatsAppWidget);
      });
    };
    const start = () => {
      const ric = window.requestIdleCallback;
      if (typeof ric === "function") idle = ric(load, { timeout: 4000 });
      else timeout = window.setTimeout(load, 4000);
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      cancel = true;
      window.removeEventListener("load", start);
      if (idle && typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idle);
      if (timeout) window.clearTimeout(timeout);
    };
  }, []);

  if (Widget) return <Widget />;

  return (
    <a
      href={`https://wa.me/${deskE164}`}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "wa-pulse wa-pulse-fab fixed right-4 z-50 flex size-14 items-center justify-center rounded-full bg-whatsapp text-whatsapp-foreground shadow-[var(--shadow-border-hover)]",
        lifted ? "bottom-[calc(6.5rem+env(safe-area-inset-bottom))] sm:bottom-20" : "bottom-6",
      )}
      aria-label={t("waQuoteWithNumber", { phone: deskPhone })}
    >
      <WhatsAppIcon className="size-7" />
    </a>
  );
}

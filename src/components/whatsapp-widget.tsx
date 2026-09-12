import { useEffect, useId, useRef, useState } from "react";
import { X } from "lucide-react";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { WhatsAppTip } from "@/components/whatsapp-tip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDesk, useHydrateDesk } from "@/lib/desk";
import { useI18n } from "@/lib/i18n";
import { getPlan } from "@/lib/plans";
import { SITE } from "@/lib/site";
import { QUICK_REPLIES, quoteMessage, whatsappHref, withInquiry } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import type { MessageKey } from "@/lib/messages";

type Bubble = { id: string; from: "biz" | "me"; text: string };

const QUICK_LABEL: Record<(typeof QUICK_REPLIES)[number]["id"], MessageKey> = {
  broadband: "catBroadband",
  mobile: "catMobile",
  business: "catBusiness",
  home5g: "catHome5g",
};

export function WhatsAppWidget() {
  const panelId = useId();
  const [draft, setDraft] = useState("");
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const endRef = useRef<HTMLDivElement>(null);
  useHydrateDesk();
  const compare = useDesk((s) => s.compare);
  const inquiry = useDesk((s) => s.inquiry);
  const open = useDesk((s) => s.waOpen);
  const toggleWa = useDesk((s) => s.toggleWa);
  const closeWa = useDesk((s) => s.closeWa);
  const plans = compare.map(getPlan).filter((p): p is NonNullable<typeof p> => Boolean(p));
  const lifted = compare.length > 0;
  const { t, locale } = useI18n();

  useEffect(() => {
    setBubbles([
      {
        id: "w1",
        from: "biz",
        text: t("waWelcome", { name: SITE.name, phone: SITE.phoneDisplay }),
      },
    ]);
  }, [locale, t]);

  useEffect(() => {
    if (!open) return;
    endRef.current?.scrollIntoView({ block: "end" });
  }, [open, bubbles.length]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeWa();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeWa]);

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    setBubbles((prev) => [
      ...prev,
      { id: `${Date.now()}`, from: "me", text: trimmed },
      {
        id: `${Date.now()}-ack`,
        from: "biz",
        text: t("waAck"),
      },
    ]);
    setDraft("");
    window.open(whatsappHref(withInquiry(trimmed, inquiry, locale)), "_blank", "noopener,noreferrer");
  }

  return (
    <div
      className={cn(
        "fab-lift fixed right-4 z-50 flex flex-col items-end gap-3 transition-[bottom] duration-200 ease-out",
        lifted ? "bottom-28 sm:bottom-20" : "bottom-6",
      )}
    >
      <div
        className={cn(
          "wa-panel grid origin-bottom-right transition-[grid-template-rows,opacity,transform] duration-200 ease-out",
          open ? "grid-rows-[1fr] scale-100 opacity-100" : "pointer-events-none grid-rows-[0fr] scale-[0.96] opacity-0",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div
            id={panelId}
            role="dialog"
            aria-hidden={!open}
            aria-label={t("waDialog")}
            className="flex h-96 w-80 flex-col overflow-hidden rounded-xl bg-card shadow-[var(--shadow-border-hover)]"
          >
          <div className="flex items-center gap-3 bg-whatsapp px-4 py-3 text-whatsapp-foreground">
            <span className="flex size-11 items-center justify-center bg-card text-whatsapp">
              <WhatsAppIcon className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{SITE.name}</p>
              <p className="truncate text-xs text-whatsapp-foreground/80">
                WhatsApp · {SITE.phoneDisplay}
              </p>
            </div>
            <button
              type="button"
              aria-label={t("waClose")}
              className="flex size-11 items-center justify-center"
              onClick={() => closeWa()}
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-surface px-4 py-4">
            {bubbles.map((bubble) => (
              <p
                key={bubble.id}
                className={cn(
                  "max-w-xs whitespace-pre-wrap px-3 py-2 text-sm leading-relaxed",
                  bubble.from === "biz"
                    ? "bg-card text-fg shadow-[var(--shadow-border)]"
                    : "ml-auto bg-whatsapp text-whatsapp-foreground",
                )}
              >
                {bubble.text}
              </p>
            ))}
            <div className="flex flex-wrap gap-2">
              {QUICK_REPLIES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="h-11 rounded-full bg-card px-3 text-sm font-medium shadow-[var(--shadow-border)]"
                  onClick={() => send(locale === "en" ? item.textEn : item.text)}
                >
                  {t(QUICK_LABEL[item.id])}
                </button>
              ))}
              {plans.length ? (
                <button
                  type="button"
                  className="h-11 rounded-full bg-accent px-3 text-sm font-medium text-accent-foreground"
                  onClick={() => send(quoteMessage(plans, inquiry, locale))}
                >
                  {t("waQuoteThese")}
                </button>
              ) : null}
            </div>
            <div ref={endRef} />
          </div>

          <form
            className="flex gap-2 border-t border-border bg-card p-3"
            onSubmit={(e) => {
              e.preventDefault();
              send(draft);
            }}
          >
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={t("waDraft")}
              aria-label={t("waMsg")}
              className="flex-1"
            />
            <Button type="submit" variant="whatsapp">
              {t("waSend")}
            </Button>
          </form>
          <div className="border-t border-border bg-card px-3 pb-3">
            <WhatsAppTip />
          </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? t("waCloseFab") : t("waOpenNum", { phone: SITE.phoneDisplay })}
        className={cn(
          "ml-auto flex size-14 items-center justify-center rounded-full bg-whatsapp text-whatsapp-foreground shadow-[var(--shadow-border-hover)] transition-transform duration-150 ease-out active:scale-[0.96]",
          !open && "wa-pulse wa-pulse-fab",
        )}
        onClick={() => toggleWa()}
      >
        <WhatsAppIcon className="size-7" />
      </button>
    </div>
  );
}

export function DeferredWhatsApp() {
  const [ready, setReady] = useState(false);
  const { t } = useI18n();
  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), 1);
    return () => window.clearTimeout(timer);
  }, []);
  if (!ready) {
    return (
      <a
        href={`https://wa.me/${SITE.whatsappE164}`}
        target="_blank"
        rel="noopener noreferrer"
        className="wa-pulse wa-pulse-fab fixed right-4 bottom-6 z-50 flex size-14 items-center justify-center rounded-full bg-whatsapp text-whatsapp-foreground shadow-[var(--shadow-border-hover)]"
        aria-label={t("waQuoteWithNumber", { phone: SITE.phoneDisplay })}
      >
        <WhatsAppIcon className="size-7" />
      </a>
    );
  }
  return <WhatsAppWidget />;
}

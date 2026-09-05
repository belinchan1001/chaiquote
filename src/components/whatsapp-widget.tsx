import { useEffect, useId, useRef, useState } from "react";
import { X } from "lucide-react";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDesk, useHydrateDesk } from "@/lib/desk";
import { getPlan } from "@/lib/plans";
import { SITE } from "@/lib/site";
import { QUICK_REPLIES, quoteMessage, whatsappHref, withInquiry } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

type Bubble = { id: string; from: "biz" | "me"; text: string };

const WELCOME: Bubble[] = [
  {
    id: "w1",
    from: "biz",
    text: `你好，呢度係 ${SITE.name}。報價會直達 ${SITE.phoneDisplay}。撳下面掣，或者直接打字。`,
  },
];

export function WhatsAppWidget() {
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [bubbles, setBubbles] = useState<Bubble[]>(WELCOME);
  const endRef = useRef<HTMLDivElement>(null);
  useHydrateDesk();
  const compare = useDesk((s) => s.compare);
  const inquiry = useDesk((s) => s.inquiry);
  const plans = compare.map(getPlan).filter((p): p is NonNullable<typeof p> => Boolean(p));
  const lifted = compare.length > 0;

  useEffect(() => {
    if (!open) return;
    endRef.current?.scrollIntoView({ block: "end" });
  }, [open, bubbles.length]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    setBubbles((prev) => [
      ...prev,
      { id: `${Date.now()}`, from: "me", text: trimmed },
      {
        id: `${Date.now()}-ack`,
        from: "biz",
        text: "好，而家幫你開 WhatsApp，將呢段訊息傳去我哋。",
      },
    ]);
    setDraft("");
    window.open(whatsappHref(withInquiry(trimmed, inquiry)), "_blank", "noopener,noreferrer");
  }

  return (
    <div
      className={cn(
        "fixed right-4 z-50 flex flex-col items-end gap-3",
        lifted ? "bottom-32" : "bottom-6",
      )}
    >
      {open ? (
        <div
          id={panelId}
          role="dialog"
          aria-label="WhatsApp 即時問價"
          className="flex h-80 w-80 flex-col overflow-hidden rounded-xl bg-card shadow-[var(--shadow-border-hover)]"
        >
          <div className="flex items-center gap-3 bg-primary px-4 py-3 text-primary-foreground">
            <span className="flex size-11 items-center justify-center bg-accent text-accent-foreground">
              <WhatsAppIcon className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{SITE.name}</p>
              <p className="truncate text-xs text-primary-foreground/70">
                WhatsApp Business · {SITE.phoneDisplay}
              </p>
            </div>
            <button
              type="button"
              aria-label="閂對話"
              className="flex size-11 items-center justify-center"
              onClick={() => setOpen(false)}
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
                    : "ml-auto bg-primary text-primary-foreground",
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
                  onClick={() => send(item.text)}
                >
                  {item.label}
                </button>
              ))}
              {plans.length ? (
                <button
                  type="button"
                  className="h-11 rounded-full bg-accent px-3 text-sm font-medium text-accent-foreground"
                  onClick={() => send(quoteMessage(plans, inquiry))}
                >
                  報呢幾個
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
              placeholder="想問咩 plan…"
              aria-label="WhatsApp 訊息"
              className="flex-1"
            />
            <Button type="submit">
              送出
            </Button>
          </form>
        </div>
      ) : null}

      <button
        type="button"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label={open ? "閂 WhatsApp" : `開 WhatsApp ${SITE.phoneDisplay}`}
        className="ml-auto flex h-14 items-center gap-2 rounded-full bg-accent px-4 text-sm font-medium text-accent-foreground shadow-[var(--shadow-border-hover)]"
        onClick={() => setOpen((v) => !v)}
      >
        <WhatsAppIcon className="size-5" />
        <span className="hidden sm:inline">WhatsApp {SITE.phoneDisplay}</span>
      </button>
    </div>
  );
}

export function DeferredWhatsApp() {
  const [ready, setReady] = useState(false);
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
        className="fixed right-4 bottom-6 z-50 flex h-14 items-center gap-2 rounded-full bg-accent px-4 text-sm font-medium text-accent-foreground shadow-[var(--shadow-border-hover)]"
        aria-label={`WhatsApp ${SITE.phoneDisplay}`}
      >
        <WhatsAppIcon className="size-5" />
        <span className="hidden sm:inline">WhatsApp {SITE.phoneDisplay}</span>
      </a>
    );
  }
  return <WhatsAppWidget />;
}


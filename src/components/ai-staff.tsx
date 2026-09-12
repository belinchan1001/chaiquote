import { useEffect, useId, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Sparkles, X } from "lucide-react";
import { ProviderMark } from "@/components/provider-mark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { askAiDesk } from "@/lib/ai-ask";
import { fallbackReply, QUESTION_CHIPS, retrievePlansForAsk } from "@/lib/ai-desk";
import { useDesk, useHydrateDesk } from "@/lib/desk";
import { useI18n } from "@/lib/i18n";
import { formatFee, getPlan } from "@/lib/plans";
import { quoteMessage, whatsappHref } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

type Bubble = { id: string; from: "biz" | "me"; text: string; planIds?: string[] };

const SESSION_KEY = "chaiquote-ai-session";

function sessionId() {
  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const next = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, next);
    return next;
  } catch {
    return "anon";
  }
}

export function AiStaffPanel() {
  const panelId = useId();
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const endRef = useRef<HTMLDivElement>(null);
  useHydrateDesk();
  const open = useDesk((s) => s.aiOpen);
  const closeAi = useDesk((s) => s.closeAi);
  const inquiry = useDesk((s) => s.inquiry);
  const { t, locale, tx } = useI18n();

  useEffect(() => {
    setBubbles([
      { id: "a1", from: "biz", text: t("aiWelcome") },
      { id: "a2", from: "biz", text: t("aiHint") },
    ]);
  }, [locale, t]);

  useEffect(() => {
    if (!open) return;
    endRef.current?.scrollIntoView({ block: "end" });
  }, [open, bubbles.length, busy]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeAi();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeAi]);

  async function sendToAi(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    const mineId = `${Date.now()}`;
    setBubbles((prev) => [...prev, { id: mineId, from: "me", text: trimmed }]);
    setDraft("");
    setBusy(true);
    const local = retrievePlansForAsk({
      message: trimmed,
      estate: inquiry.estate,
      housing: inquiry.housing,
    });
    const localIds = local.plans.slice(0, 3).map((plan) => plan.id);
    const localReply = fallbackReply(localIds.length > 0, locale);
    try {
      const result = await askAiDesk({
        data: {
          message: trimmed,
          estate: inquiry.estate,
          housing: inquiry.housing,
          locale,
          sessionId: sessionId(),
        },
      });
      const reply =
        result.ok === false && result.reason === "budget"
          ? t("aiBudget")
          : result.ok === false && result.reason === "rate"
            ? t("aiRate")
            : result.reply || localReply;
      setBubbles((prev) => [
        ...prev,
        {
          id: `${mineId}-ai`,
          from: "biz",
          text: reply,
          planIds: result.planIds?.length ? result.planIds : localIds,
        },
      ]);
    } catch {
      setBubbles((prev) => [
        ...prev,
        { id: `${mineId}-ai`, from: "biz", text: localReply, planIds: localIds },
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        tabIndex={open ? 0 : -1}
        aria-hidden={!open}
        aria-label={t("aiClose")}
        className={cn(
          "fixed inset-x-0 bottom-0 top-16 z-40 bg-fg/40 transition-opacity duration-200 lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={closeAi}
      />
      <div
        className={cn(
          "fixed z-[45] origin-bottom transition-[opacity,transform] duration-200 ease-out",
          "inset-x-0 bottom-24 w-full",
          "lg:inset-x-auto lg:bottom-auto lg:left-4 lg:top-20 lg:w-[min(20rem,calc(100vw-2rem))] lg:origin-top-left",
          open
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-full opacity-0 lg:translate-y-0 lg:scale-[0.96]",
        )}
      >
        <div
          id={panelId}
          role="dialog"
          aria-hidden={!open}
          aria-label={t("aiStaff")}
          className="flex h-[min(22rem,44dvh)] max-h-[44dvh] flex-col overflow-hidden rounded-t-2xl bg-card shadow-[var(--shadow-border-hover)] lg:h-[28rem] lg:max-h-[calc(100dvh-9rem)] lg:rounded-xl"
        >
          <div className="flex items-center gap-3 bg-primary px-4 py-3 text-primary-foreground">
            <span className="flex size-11 items-center justify-center bg-accent text-accent-foreground">
              <Sparkles className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{t("aiStaff")}</p>
              <p className="truncate text-xs text-primary-foreground/70">{t("aiStaffLead")}</p>
            </div>
            <button
              type="button"
              aria-label={t("aiClose")}
              className="flex size-11 items-center justify-center"
              onClick={closeAi}
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-surface px-4 py-4">
            {bubbles.map((bubble) => (
              <div key={bubble.id} className={cn(bubble.from === "me" && "ml-auto w-fit max-w-xs")}>
                <p
                  className={cn(
                    "max-w-xs whitespace-pre-wrap px-3 py-2 text-sm leading-relaxed",
                    bubble.from === "biz"
                      ? "bg-card text-fg shadow-[var(--shadow-border)]"
                      : "bg-primary text-primary-foreground",
                  )}
                >
                  {bubble.text}
                </p>
                {bubble.planIds?.length ? (
                  <div className="mt-2 space-y-2">
                    {bubble.planIds.map((id) => {
                      const plan = getPlan(id);
                      if (!plan) return null;
                      return (
                        <Link
                          key={id}
                          to="/plans/$planId"
                          params={{ planId: plan.id }}
                          className="block bg-card px-3 py-2 text-sm shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]"
                        >
                          <ProviderMark id={plan.providerId} size="sm" showEn={false} />
                          <p className="mt-1 font-medium leading-snug">{tx(plan.name)}</p>
                          <p className="mt-1 tabular-nums">
                            {formatFee(plan.monthlyFee)}{" "}
                            <span className="text-xs text-muted">{t("months", { n: plan.contractMonths })}</span>
                          </p>
                          <p className="mt-0.5 text-[11px] text-subtle">{t("aiCardRef")}</p>
                        </Link>
                      );
                    })}
                    <p className="text-xs text-muted">{t("aiFeeNote")}</p>
                    <a
                      href={whatsappHref(
                        quoteMessage(
                          bubble.planIds.map(getPlan).filter((p): p is NonNullable<typeof p> => Boolean(p)),
                          inquiry,
                          locale,
                        ),
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-11 items-center rounded-full bg-whatsapp px-3 text-sm font-medium text-whatsapp-foreground"
                    >
                      {t("aiWaCta")}
                    </a>
                  </div>
                ) : null}
              </div>
            ))}
            {busy ? (
              <p className="bg-card px-3 py-2 text-sm text-muted shadow-[var(--shadow-border)]">{t("aiThinking")}</p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              {QUESTION_CHIPS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="h-11 rounded-full bg-card px-3 text-sm font-medium shadow-[var(--shadow-border)]"
                  onClick={() => void sendToAi(locale === "en" ? item.en : item.zh)}
                >
                  {locale === "en" ? item.en : item.zh}
                </button>
              ))}
            </div>
            <div ref={endRef} />
          </div>

          <form
            className="flex gap-2 border-t border-border bg-card p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
            onSubmit={(e) => {
              e.preventDefault();
              void sendToAi(draft);
            }}
          >
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={t("aiDraft")}
              aria-label={t("aiDraft")}
              className="flex-1"
              disabled={busy}
            />
            <Button type="submit" disabled={busy}>
              {t("waSend")}
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}

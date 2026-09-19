import { useEffect, useId, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { X } from "lucide-react";
import { LogoMarkLooking } from "@/components/logo-mark-looking";
import { ProviderMark } from "@/components/provider-mark";
import { AiBetaMark } from "@/components/ai-beta-mark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { askAiDesk } from "@/lib/ai-ask";
import {
  fallbackReply,
  inquiryFromAiParse,
  mergeFilterParse,
  plansForAiCards,
  plansSearchFromAiParse,
  QUESTION_CHIPS,
  retrievePlansForAsk,
  shouldHoldForIntake,
  type FilterParse,
} from "@/lib/ai-desk";
import { useDesk, useHydrateDesk, type Inquiry } from "@/lib/desk";
import { useI18n } from "@/lib/i18n";
import { formatFee, type Category } from "@/lib/plans";
import {
  currentOptions,
  EXPIRY_OPTIONS,
  portInQuoteFromInquiry,
  type InquiryQuote,
} from "@/lib/port-in";
import type { MessageKey } from "@/lib/messages";
import { compactSearch } from "@/lib/search";
import { filterPlans } from "@/lib/plan-filter";
import { quoteWhatsappE164, whatsappHref } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

type Bubble = {
  id: string;
  from: "biz" | "me";
  text: string;
  planIds?: string[];
  quote?: InquiryQuote;
  ask?: "current" | "expiry";
  askCat?: Category;
};

const SESSION_KEY = "chaiquote-ai-session";
const AI_CLOSE_MS = 180;

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function useAiPresence(open: boolean) {
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(open);

  useEffect(() => {
    if (open) {
      setMounted(true);
      let inner = 0;
      const outer = requestAnimationFrame(() => {
        inner = requestAnimationFrame(() => setShown(true));
      });
      return () => {
        cancelAnimationFrame(outer);
        cancelAnimationFrame(inner);
      };
    }
    setShown(false);
    const id = window.setTimeout(() => setMounted(false), prefersReducedMotion() ? 0 : AI_CLOSE_MS);
    return () => window.clearTimeout(id);
  }, [open]);

  return { mounted, shown };
}

export function aiWelcomeCopy(t: (key: "aiWelcome" | "aiWelcomeTrial") => string) {
  return `${t("aiWelcome")}\n${t("aiWelcomeTrial")}`;
}

export { AiBetaMark };

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

const SLOT_KEYS = [
  { id: "serviceType", label: "aiSlotService" },
  { id: "estate", label: "aiSlotEstate" },
  { id: "currentProvider", label: "aiSlotCurrent" },
  { id: "expiry", label: "aiSlotExpiry" },
] as const;

function IntakeProgress({
  inquiry,
  t,
}: {
  inquiry: Inquiry;
  t: (key: MessageKey, vars?: Record<string, string | number>) => string;
}) {
  const slots = SLOT_KEYS.map((slot) => ({
    id: slot.id,
    label: t(slot.label),
    value: inquiry[slot.id].trim(),
  }));
  const missing = slots.filter((slot) => !slot.value).map((slot) => slot.label);
  return (
    <div className="border-t border-primary-foreground/15 px-4 pb-3">
      <ul className="flex flex-wrap gap-1.5">
        {slots.map((slot) => (
          <li
            key={slot.id}
            className={cn(
              "max-w-[9.5rem] truncate rounded-full px-2 py-0.5 text-[11px] leading-5",
              slot.value
                ? "bg-primary-foreground/15 text-primary-foreground"
                : "bg-primary-foreground/5 text-primary-foreground/55",
            )}
          >
            {slot.value || slot.label}
          </li>
        ))}
      </ul>
      <p className="mt-1.5 text-[11px] leading-snug text-primary-foreground/70">
        {missing.length ? t("aiStillNeed", { items: missing.join("、") }) : t("aiReady")}
      </p>
    </div>
  );
}

export function AiStaffPanel() {
  const panelId = useId();
  const navigate = useNavigate();
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const sessionParse = useRef<FilterParse | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  useHydrateDesk();
  const open = useDesk((s) => s.aiOpen);
  const closeAi = useDesk((s) => s.closeAi);
  const { mounted, shown } = useAiPresence(open);
  const inquiry = useDesk((s) => s.inquiry);
  const setInquiry = useDesk((s) => s.setInquiry);
  const { t, locale, tx } = useI18n();
  const asking = [...bubbles].reverse().find((bubble) => bubble.from === "biz")?.ask;

  useEffect(() => {
    setBubbles([
      { id: "a1", from: "biz", text: aiWelcomeCopy(t) },
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
    const waitingCurrent = inquiry.source === "ai" && !inquiry.currentProvider;
    const local = retrievePlansForAsk({
      message: trimmed,
      estate: inquiry.estate,
      housing: inquiry.housing,
      looseCurrent: waitingCurrent,
    });
    const merged = local.parsed
      ? mergeFilterParse(local.parsed, inquiry, sessionParse.current ?? undefined)
      : local.parsed;
    if (merged) sessionParse.current = merged;
    const quote = merged ? inquiryFromAiParse(merged, inquiry) : { ...inquiry, source: "ai" as const };
    setInquiry(quote);
    if (merged && shouldHoldForIntake(trimmed, merged)) {
      const ask = !merged.current ? "current" : "expiry";
      setBubbles((prev) => [
        ...prev,
        {
          id: `${mineId}-ai`,
          from: "biz",
          text: t(ask === "current" ? "aiAskCurrent" : "aiAskExpiry"),
          quote,
          ask,
          askCat: merged.cat,
        },
      ]);
      setBusy(false);
      return;
    }
    if (merged && !shouldHoldForIntake(trimmed, merged)) {
      const search = compactSearch(plansSearchFromAiParse(merged, inquiry));
      const localIds = filterPlans(search)
        .slice(0, 3)
        .map((plan) => plan.id);
      if (localIds.length) {
        const localReply = fallbackReply(true, locale);
        setBubbles((prev) => [
          ...prev,
          { id: `${mineId}-ai`, from: "biz", text: localReply, planIds: localIds, quote },
        ]);
        setBusy(false);
        closeAi();
        void navigate({ to: "/plans", search });
        return;
      }
    }
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
          quote,
        },
      ]);
    } catch {
      setBubbles((prev) => [
        ...prev,
        { id: `${mineId}-ai`, from: "biz", text: localReply, planIds: localIds, quote },
      ]);
    } finally {
      setBusy(false);
    }
  }

  if (!mounted) return null;

  return (
    <>
      <button
        type="button"
        tabIndex={shown ? 0 : -1}
        aria-hidden={!shown}
        aria-label={t("aiClose")}
        className={cn("ai-overlay fixed inset-x-0 bottom-0 top-16 z-40 bg-fg/40 lg:hidden", shown && "is-open")}
        onClick={closeAi}
      />
      <div
        className={cn(
          "ai-panel fixed z-[45] origin-bottom",
          "inset-x-0 bottom-24 w-full",
          "lg:inset-x-auto lg:bottom-auto lg:left-4 lg:top-20 lg:w-[min(20rem,calc(100vw-2rem))] lg:origin-top-left",
          shown && "is-open",
        )}
      >
        <div
          id={panelId}
          role="dialog"
          aria-hidden={!shown}
          aria-label={t("aiStaff")}
          inert={!shown}
          className="flex h-[min(28rem,58dvh)] max-h-[58dvh] flex-col overflow-hidden rounded-t-2xl bg-card shadow-[var(--shadow-border-hover)] lg:h-[32rem] lg:max-h-[calc(100dvh-9rem)] lg:rounded-xl"
        >
          <div className="bg-primary text-primary-foreground">
            <div className="flex items-center gap-3 bg-primary px-4 py-3 text-primary-foreground">
            <span className="flex size-11 items-center justify-center bg-accent text-accent-foreground">
              <LogoMarkLooking className="size-7" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex min-w-0 items-baseline gap-1.5">
                <span className="truncate font-medium">{t("aiStaff")}</span>
                <AiBetaMark className="shrink-0 text-primary-foreground/75" />
              </p>
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
            <IntakeProgress inquiry={inquiry} t={t} />
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
                {bubble.ask ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(bubble.ask === "current" && bubble.askCat
                      ? currentOptions(bubble.askCat)
                      : EXPIRY_OPTIONS
                    ).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className="h-11 rounded-full bg-card px-3 text-sm font-medium shadow-[var(--shadow-border)]"
                        onClick={() => void sendToAi(item.label)}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                ) : null}
                {bubble.planIds?.length ? (
                  <div className="mt-2 space-y-2">
                    {plansForAiCards(bubble.planIds).map((plan) => (
                      <div key={plan.id} className="space-y-2">
                        <Link
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
                        <a
                          href={whatsappHref(
                            portInQuoteFromInquiry(bubble.quote ?? inquiry, plan),
                            quoteWhatsappE164([plan]),
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-11 w-full items-center justify-center rounded-full bg-whatsapp px-3 text-sm font-medium text-whatsapp-foreground"
                        >
                          {t("aiWaCta")}
                        </a>
                      </div>
                    ))}
                    <p className="text-xs text-muted">{t("aiFeeNote")}</p>
                  </div>
                ) : null}
              </div>
            ))}
            {busy ? (
              <p className="bg-card px-3 py-2 text-sm text-muted shadow-[var(--shadow-border)]">{t("aiThinking")}</p>
            ) : null}
            <details
              className="rounded-lg bg-card px-3 shadow-[var(--shadow-border)]"
              open={!asking}
            >
              <summary className="flex h-11 cursor-pointer list-none items-center text-sm font-medium">
                {t("aiFaqMore")}
              </summary>
              <div className="flex flex-wrap gap-2 pb-3">
              {QUESTION_CHIPS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="h-11 rounded-full bg-surface px-3 text-sm font-medium shadow-[var(--shadow-border)]"
                  onClick={() => void sendToAi(locale === "en" ? item.en : item.zh)}
                >
                  {locale === "en" ? item.en : item.zh}
                </button>
              ))}
              </div>
            </details>
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

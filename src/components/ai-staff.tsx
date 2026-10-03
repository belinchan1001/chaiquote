import { useEffect, useId, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { LogoMarkLooking } from "@/components/logo-mark-looking";
import { ProviderMark } from "@/components/provider-mark";
import { AiBetaMark } from "@/components/ai-beta-mark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { askAiDesk } from "@/lib/ai-ask";
import {
  detectCategoryHint,
  fallbackReply,
  inquiryFromAiParse,
  mergeFilterParse,
  plansForAiCards,
  pickScreenPlans,
  plansSearchFromAiParse,
  QUESTION_CHIPS,
  retrievePlansForAsk,
  screenSummary,
  shouldHoldForIntake,
  type FilterParse,
  type ScreenRole,
} from "@/lib/ai-desk";
import { useDesk, useHydrateDesk, type Inquiry } from "@/lib/desk";
import { useI18n } from "@/lib/i18n";
import { formatFee, type Category, type Housing } from "@/lib/plans";
import {
  currentOptions,
  EXPIRY_OPTIONS,
  expiryIdFromLabel,
  portInQuoteFromInquiry,
  serviceTypeLabel,
  type CurrentId,
  type InquiryQuote,
} from "@/lib/port-in";
import type { MessageKey } from "@/lib/messages";
import { compactSearch } from "@/lib/search";
import { filterPlans } from "@/lib/plan-filter";
import { quoteWhatsappE164, whatsappHref } from "@/lib/whatsapp";
import { quoteWhatsAppActivateProps } from "@/lib/wa-quote-open";
import { cn } from "@/lib/utils";

type Bubble = {
  id: string;
  from: "biz" | "me";
  text: string;
  planIds?: string[];
  planRoles?: ScreenRole[];
  search?: ReturnType<typeof compactSearch>;
  quote?: InquiryQuote;
};

const SCREEN_EXAMPLES = [
  { zh: "村屋，而家香港寬頻，下個月到期", en: "Village house, now on HKBN, ends next month" },
  { zh: "手機用緊 3香港，想要三地數據", en: "Mobile on 3HK, want three-region data" },
  { zh: "公屋，未有寬頻", en: "Public housing, no broadband yet" },
] as const;

const ROLE_KEY = { low: "aiRoleLow", pick: "aiRolePick", short: "aiRoleShort" } as const;
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

const GUIDE_STEPS = [
  { id: "serviceType", n: 1, label: "aiSlotService" },
  { id: "currentProvider", n: 2, label: "aiSlotCurrent" },
  { id: "expiry", n: 3, label: "aiSlotExpiry" },
] as const;

type GuideStep = "service" | "current" | "expiry" | "estate";

const SERVICE_CHIPS: { cat: Category; key: MessageKey }[] = [
  { cat: "broadband", key: "catBroadband" },
  { cat: "mobile", key: "catMobile" },
  { cat: "home5g", key: "catHome5g" },
  { cat: "business", key: "catBusiness" },
];

function categoryFromInquiry(inquiry: Inquiry): Category {
  const label = inquiry.serviceType;
  if (label.includes("手機") || /mobile/i.test(label)) return "mobile";
  if (label.includes("商業") || /business/i.test(label)) return "business";
  if (label.includes("5G") || /home/i.test(label)) return "home5g";
  return "broadband";
}

function nextGuideStep(inquiry: Inquiry): GuideStep | null {
  if (!inquiry.serviceType.trim()) return "service";
  if (!inquiry.currentProvider.trim()) return "current";
  if (!inquiry.expiry.trim()) return "expiry";
  if (categoryFromInquiry(inquiry) === "broadband" && !inquiry.estate.trim()) return "estate";
  return null;
}

function askKey(step: GuideStep): MessageKey {
  if (step === "current") return "aiAskCurrent";
  if (step === "expiry") return "aiAskExpiry";
  if (step === "estate") return "aiAskEstate";
  return "aiAskService";
}

function draftKey(step: GuideStep | null): MessageKey {
  if (step === "current") return "aiDraftCurrent";
  if (step === "expiry") return "aiDraftExpiry";
  if (step === "estate") return "aiDraftEstate";
  if (step === "service") return "aiDraftService";
  return "aiDraft";
}

function blankGuide(from?: Inquiry): Inquiry {
  return {
    estate: from?.estate ?? "",
    housing: from?.housing ?? "",
    district: from?.district ?? "",
    block: from?.block ?? "",
    currentProvider: "",
    targetProvider: "",
    expiry: "",
    customerExpiry: "",
    need: "",
    serviceType: "",
    esports: false,
    source: "ai",
  };
}

function clearGuideField(guide: Inquiry, id: (typeof GUIDE_STEPS)[number]["id"]): Inquiry {
  if (id === "serviceType") {
    return { ...guide, serviceType: "", currentProvider: "", need: "", esports: false };
  }
  if (id === "currentProvider") return { ...guide, currentProvider: "" };
  return { ...guide, expiry: "" };
}

function housingFromInquiry(inquiry: Inquiry): Housing | undefined {
  return (["public", "hos", "private", "village"] as Housing[]).includes(inquiry.housing as Housing)
    ? (inquiry.housing as Housing)
    : undefined;
}

function parseFromGuide(guide: Inquiry): FilterParse {
  const cat = categoryFromInquiry(guide);
  const current = currentOptions(cat).find((item) => item.label === guide.currentProvider)?.id as CurrentId | undefined;
  const expiry = expiryIdFromLabel(guide.expiry) || undefined;
  return {
    cat,
    current,
    exclude: current && current !== "none" && current !== "other" ? current : undefined,
    expiry,
    estate: guide.estate || undefined,
    housing: housingFromInquiry(guide),
    esports: guide.esports,
    gaming: guide.esports,
  };
}

function IntakeProgress({
  inquiry,
  t,
  onClear,
}: {
  inquiry: Inquiry;
  t: (key: MessageKey, vars?: Record<string, string | number>) => string;
  onClear: (id: (typeof GUIDE_STEPS)[number]["id"]) => void;
}) {
  const step = nextGuideStep(inquiry);
  const missing = GUIDE_STEPS.filter((item) => !inquiry[item.id].trim()).map((item) => t(item.label));
  const currentN = step === "current" ? 2 : step === "expiry" || step === "estate" ? 3 : step === "service" ? 1 : 4;
  return (
    <div className="border-t border-primary-foreground/15 px-4 pb-3">
      <p className="mb-2 text-xs font-medium leading-snug text-primary-foreground">{t("aiAutoFilter")}</p>
      <p className="mb-2 text-[11px] text-primary-foreground/70">
        {missing.length ? t("aiStillNeed", { items: missing.join("、") }) : t("aiReady")}
        {step ? ` · ${t("aiNowStep", { n: Math.min(currentN, 3) })}` : ""}
      </p>
      <ol className="grid grid-cols-3 gap-1.5">
        {GUIDE_STEPS.map((item) => {
          const value = inquiry[item.id].trim();
          const active =
            (item.id === "serviceType" && step === "service") ||
            (item.id === "currentProvider" && step === "current") ||
            (item.id === "expiry" && (step === "expiry" || step === "estate"));
          return (
            <li key={item.id}>
              <button
                type="button"
                disabled={!value}
                aria-label={value ? t("aiClearStep", { label: t(item.label) }) : undefined}
                onClick={() => onClear(item.id)}
                className={cn(
                  "w-full rounded-lg px-2 py-1.5 text-center",
                  value
                    ? "bg-primary-foreground/15 text-primary-foreground"
                    : active
                      ? "bg-accent text-accent-foreground"
                      : "bg-primary-foreground/5 text-primary-foreground/55",
                )}
              >
                <p className="text-[10px] leading-none opacity-80">
                  {item.n}. {t(item.label)}
                </p>
                <p className="mt-1 flex items-center justify-center gap-0.5 truncate text-[11px] font-medium leading-tight">
                  <span className="min-w-0 truncate">{value || "—"}</span>
                  {value ? <span aria-hidden="true">×</span> : null}
                </p>
              </button>
            </li>
          );
        })}
      </ol>
      <p className="mt-1.5 text-[11px] leading-snug text-primary-foreground/70">{t("aiTapToClear")}</p>
    </div>
  );
}

export function AiStaffPanel() {
  const panelId = useId();
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [guide, setGuide] = useState<Inquiry>(() => blankGuide());
  const sessionParse = useRef<FilterParse | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  useHydrateDesk();
  const open = useDesk((s) => s.aiOpen);
  const closeAi = useDesk((s) => s.closeAi);
  const inquiry = useDesk((s) => s.inquiry);
  const setInquiry = useDesk((s) => s.setInquiry);
  const { mounted, shown } = useAiPresence(open);
  const { t, locale, tx } = useI18n();

  useEffect(() => {
    if (!open) return;
    sessionParse.current = null;
    setGuide(blankGuide(inquiry));
    setBubbles([
      { id: "a1", from: "biz", text: aiWelcomeCopy(t) },
      { id: "a2", from: "biz", text: t("aiHint") },
    ]);
  }, [open, locale, t]);

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

  function decorate(base: string, quote: Inquiry) {
    const summary = screenSummary({
      estate: quote.estate,
      housing: quote.housing,
      currentProvider: quote.currentProvider,
      expiry: quote.expiry,
      locale,
    });
    const expiryId = expiryIdFromLabel(quote.expiry);
    const note = expiryId === "1m" ? t("aiUrgentNote") : expiryId === "6m+" ? t("aiLaterNote") : "";
    return [summary, base, note].filter(Boolean).join("\n");
  }

  function cardsFor(parsed: FilterParse | null | undefined, quote: Inquiry) {
    if (!parsed?.current) return { ids: [] as string[], roles: [] as ScreenRole[], search: undefined };
    const search = compactSearch(plansSearchFromAiParse(parsed, quote));
    const picked = pickScreenPlans(filterPlans(search));
    return {
      ids: picked.map((item) => item.plan.id),
      roles: picked.map((item) => item.role),
      search,
    };
  }

  function stagePlans(next: Inquiry, parsed: FilterParse) {
    sessionParse.current = parsed;
    setInquiry(next);
    return cardsFor(parsed, next);
  }

  async function sendToAi(text: string, opts?: { silent?: boolean; snap?: Inquiry }) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    const snap = opts?.snap ?? guide;
    const mineId = `${Date.now()}`;
    if (!opts?.silent) {
      setBubbles((prev) => [...prev, { id: mineId, from: "me", text: trimmed }]);
    }
    setDraft("");
    setBusy(true);
    const waitingCurrent = snap.source === "ai" && !snap.currentProvider;
    const local = retrievePlansForAsk({
      message: trimmed,
      estate: snap.estate,
      housing: snap.housing,
      looseCurrent: waitingCurrent,
    });
    const merged = local.parsed
      ? mergeFilterParse(local.parsed, snap, sessionParse.current ?? undefined)
      : local.parsed;
    if (merged && !detectCategoryHint(trimmed) && !snap.serviceType) {
      merged.cat = sessionParse.current?.cat ?? merged.cat;
    }
    if (merged && !snap.serviceType && !detectCategoryHint(trimmed) && merged.cat === "broadband" && !sessionParse.current?.cat) {
      merged.cat = "broadband";
    }
    if (merged) sessionParse.current = merged;
    let quote: Inquiry = merged
      ? {
          ...snap,
          ...inquiryFromAiParse(merged, snap),
          block: snap.block,
          source: "ai",
        }
      : { ...snap, source: "ai" };
    if (!snap.serviceType && !detectCategoryHint(trimmed)) {
      quote = { ...quote, serviceType: "" };
    }
    if (nextGuideStep(snap) === "estate" && !quote.estate.trim()) {
      quote = { ...quote, estate: trimmed };
    }
    setGuide(quote);
    const still = nextGuideStep(quote);
    const isQuestion =
      /[？?]/.test(trimmed) || QUESTION_CHIPS.some((item) => item.zh === trimmed || item.en === trimmed);
    if (still && !opts?.silent && !isQuestion) {
      setBubbles((prev) => [...prev, { id: `${mineId}-ai`, from: "biz", text: decorate(t(askKey(still)), quote) }]);
      setBusy(false);
      return;
    }
    if (merged && !shouldHoldForIntake(trimmed, merged) && !still) {
      const staged = stagePlans(quote, merged);
      const localReply = decorate(fallbackReply(staged.ids.length > 0, locale), quote);
      setBubbles((prev) => [
        ...prev,
        {
          id: `${mineId}-ai`,
          from: "biz",
          text: localReply,
          planIds: staged.ids,
          planRoles: staged.roles,
          search: staged.search,
          quote,
        },
      ]);
      setBusy(false);
      return;
    }
    if (merged && shouldHoldForIntake(trimmed, merged) && !isQuestion) {
      const ask = !merged.current ? "current" : "expiry";
      setBubbles((prev) => [
        ...prev,
        { id: `${mineId}-ai`, from: "biz", text: decorate(t(ask === "current" ? "aiAskCurrent" : "aiAskExpiry"), quote), quote },
      ]);
      setBusy(false);
      return;
    }
    const staged = merged?.current ? cardsFor(merged, quote) : { ids: [] as string[], roles: [] as ScreenRole[], search: undefined };
    const localReply = fallbackReply(staged.ids.length > 0, locale);
    try {
      const result = await askAiDesk({
        data: {
          message: trimmed,
          estate: snap.estate,
          housing: snap.housing,
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
          text: decorate(reply, quote),
          planIds: staged.ids,
          planRoles: staged.roles,
          search: staged.search,
          quote,
        },
      ]);
    } catch {
      setBubbles((prev) => [
        ...prev,
        { id: `${mineId}-ai`, from: "biz", text: decorate(localReply, quote), planIds: staged.ids, planRoles: staged.roles, search: staged.search, quote },
      ]);
    } finally {
      setBusy(false);
    }
  }

  function pickGuide(spoken: string, patch: Partial<Inquiry>) {
    if (busy) return;
    const next: Inquiry = { ...guide, ...patch, source: "ai" };
    setGuide(next);
    sessionParse.current = parseFromGuide(next);
    setBubbles((prev) => [...prev, { id: `${Date.now()}`, from: "me", text: spoken }]);
    const step = nextGuideStep(next);
    if (step) {
      setBubbles((prev) => [...prev, { id: `${Date.now()}-ai`, from: "biz", text: decorate(t(askKey(step)), next) }]);
      return;
    }
    const parsed = parseFromGuide(next);
    const staged = stagePlans(next, parsed);
    setBubbles((prev) => [
      ...prev,
      {
        id: `${Date.now()}-ai`,
        from: "biz",
        text: decorate(fallbackReply(staged.ids.length > 0, locale), next),
        planIds: staged.ids,
        planRoles: staged.roles,
        search: staged.search,
        quote: next,
      },
    ]);
  }

  function clearStep(id: (typeof GUIDE_STEPS)[number]["id"]) {
    if (busy) return;
    setGuide((prev) => {
      const next = clearGuideField(prev, id);
      sessionParse.current = next.serviceType ? parseFromGuide(next) : null;
      return next;
    });
  }

  const guideStep = nextGuideStep(guide);
  const guideCat = categoryFromInquiry(guide);

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
            <IntakeProgress inquiry={guide} t={t} onClear={clearStep} />
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
                    {bubble.planIds.map((id, index) => {
                      const plan = plansForAiCards(bubble.planIds ?? []).find((item) => item.id === id);
                      if (!plan) return null;
                      const role = bubble.planRoles?.[index];
                      const showRole = role === "pick" || role === "short" || (role === "low" && index === 0);
                      const waPhone = quoteWhatsappE164([plan]);
                      const baseText = portInQuoteFromInquiry(bubble.quote ?? guide, plan);
                      const waText =
                        expiryIdFromLabel((bubble.quote ?? guide).expiry ?? "") === "1m"
                          ? `${baseText}\n⏰ 跟進：急單`
                          : baseText;
                      return (
                        <div key={plan.id} className="space-y-2">
                          <Link
                            to="/plans/$planId"
                            params={{ planId: plan.id }}
                            className="block bg-card px-3 py-2 text-sm shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]"
                          >
                            {showRole && role ? (
                              <p className="text-[11px] font-semibold text-accent">{t(ROLE_KEY[role])}</p>
                            ) : null}
                            <ProviderMark id={plan.providerId} size="sm" showEn={false} />
                            <p className="mt-1 font-medium leading-snug">{tx(plan.name)}</p>
                            <p className="mt-1 tabular-nums">
                              {formatFee(plan.monthlyFee)}{" "}
                              <span className="text-xs text-muted">{t("months", { n: plan.contractMonths })}</span>
                            </p>
                            <p className="mt-0.5 text-[11px] text-subtle">{t("aiCardRef")}</p>
                          </Link>
                          <a
                            href={whatsappHref(waText, waPhone)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-11 w-full items-center justify-center rounded-full bg-whatsapp px-3 text-sm font-medium text-whatsapp-foreground"
                            {...quoteWhatsAppActivateProps(waText, waPhone, {
                              source: "ai_staff",
                              planIds: [plan.id],
                              waPhone,
                            })}
                          >
                            {t("aiWaCta")}
                          </a>
                        </div>
                      );
                    })}
                    {bubble.search ? (
                      <Link to="/plans" search={bubble.search} hash="plan-list" className="inline-flex text-sm font-medium text-accent">
                        {t("aiSeeAll")}
                      </Link>
                    ) : null}
                    <p className="text-xs text-muted">{t("aiFeeNote")}</p>
                  </div>
                ) : null}
              </div>
            ))}
            {busy ? (
              <p className="bg-card px-3 py-2 text-sm text-muted shadow-[var(--shadow-border)]">{t("aiThinking")}</p>
            ) : null}
            {!guide.serviceType ? (
              <div className="flex flex-wrap gap-2">
                {SCREEN_EXAMPLES.map((item) => (
                  <button
                    key={item.zh}
                    type="button"
                    className="h-11 rounded-full bg-card px-3 text-left text-sm font-medium shadow-[var(--shadow-border)]"
                    onClick={() => void sendToAi(locale === "en" ? item.en : item.zh)}
                  >
                    {locale === "en" ? item.en : item.zh}
                  </button>
                ))}
              </div>
            ) : null}
            <details className="rounded-lg bg-card px-3 shadow-[var(--shadow-border)]">
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

          {guideStep ? (
            <div className="border-t border-border bg-surface px-3 py-2">
              <p className="text-sm font-medium text-fg">{t(askKey(guideStep))}</p>
              <p className="text-[11px] text-muted">{t("aiCoach")}</p>
              {guideStep !== "estate" ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {(guideStep === "service"
                    ? SERVICE_CHIPS.map((item) => ({ id: item.cat, label: t(item.key) }))
                    : guideStep === "current"
                      ? currentOptions(guideCat)
                      : EXPIRY_OPTIONS
                  ).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className="h-11 rounded-full bg-card px-3 text-sm font-medium shadow-[var(--shadow-border)]"
                      onClick={() => {
                        if (guideStep === "service") {
                          const cat = item.id as Category;
                          pickGuide(t(SERVICE_CHIPS.find((row) => row.cat === cat)?.key ?? "catBroadband"), {
                            serviceType: serviceTypeLabel(cat),
                          });
                          return;
                        }
                        if (guideStep === "current") {
                          pickGuide(item.label, { currentProvider: item.label });
                          return;
                        }
                        pickGuide(item.label, { expiry: item.label });
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

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
              placeholder={t(draftKey(guideStep))}
              aria-label={t(draftKey(guideStep))}
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

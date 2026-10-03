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
  matchKnowledge,
  needsCsHandoff,
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
  MOBILE_CURRENT,
  portInQuoteFromInquiry,
  serviceTypeLabel,
  type CurrentId,
  type InquiryQuote,
  type MobileNeedId,
} from "@/lib/port-in";
import type { MessageKey } from "@/lib/messages";
import { compactSearch } from "@/lib/search";
import { filterPlans } from "@/lib/plan-filter";
import { quoteWhatsappE164, salesQuoteMessage, whatsappHref } from "@/lib/whatsapp";
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
  handoff?: boolean;
  pageHref?: string;
  pageLabel?: string;
  cs?: boolean;
};

function isQuestionIntentClient(message: string) {
  return /[？?]|有冇|係咪|點樣|點做|點解|幾多|幾點|邊度|分別|包唔包|可唔可以|如何|什麼|甚麼|why|how |what |does |can /i.test(
    message,
  );
}

const ROLE_KEY = { flash: "aiRoleFlash", pick: "aiRolePick", low: "aiRoleLow" } as const;
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
  return t("aiWelcome");
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
  { id: "housing", n: 2, label: "aiSlotHousing" },
  { id: "currentProvider", n: 3, label: "aiSlotCurrent" },
] as const;

type GuideStep = "service" | "housing" | "current" | "mobileLine" | "mobileData" | "mobileExpiry";

const MOBILE_DATA: { id: MobileNeedId; label: string }[] = [
  { id: "local30", label: "30G 以下" },
  { id: "local100", label: "30 至 100G" },
  { id: "tri", label: "三地共用" },
  { id: "gba", label: "大灣區" },
];

const SERVICE_CHIPS: { cat: Category; key: MessageKey }[] = [
  { cat: "broadband", key: "aiSvcFibre" },
  { cat: "mobile", key: "aiSvcMobile" },
  { cat: "home5g", key: "aiSvcHome5g" },
  { cat: "business", key: "aiSvcBusiness" },
];

const HOUSING_CHIPS: { id: Housing; key: MessageKey; spoken: string }[] = [
  { id: "public", key: "housingPublic", spoken: "公屋" },
  { id: "hos", key: "housingHos", spoken: "居屋" },
  { id: "private", key: "housingPrivate", spoken: "私樓" },
  { id: "village", key: "housingVillage", spoken: "村屋" },
];

function categoryFromInquiry(inquiry: Inquiry): Category {
  const label = inquiry.serviceType;
  if (label.includes("手機") || /mobile/i.test(label)) return "mobile";
  if (label.includes("商業") || /business/i.test(label)) return "business";
  if (label.includes("5G") || /home/i.test(label)) return "home5g";
  return "broadband";
}

function hasAddress(inquiry: Inquiry) {
  return Boolean(inquiry.estate.trim() || inquiry.housing.trim());
}

function isNewMobileLine(inquiry: Inquiry) {
  return /新號碼|新開戶|無用緊|New number/i.test(inquiry.currentProvider);
}

function needsAddress(cat: Category) {
  return cat === "broadband" || cat === "home5g" || cat === "business";
}

function nextGuideStep(inquiry: Inquiry): GuideStep | null {
  if (!inquiry.serviceType.trim()) return "service";
  if (categoryFromInquiry(inquiry) === "mobile") {
    if (!inquiry.currentProvider.trim()) return "mobileLine";
    if (!inquiry.need.trim()) return "mobileData";
    if (!isNewMobileLine(inquiry) && !inquiry.expiry.trim()) return "mobileExpiry";
    return null;
  }
  if (needsAddress(categoryFromInquiry(inquiry)) && !hasAddress(inquiry)) return "housing";
  if (!inquiry.currentProvider.trim()) return "current";
  return null;
}

function askKey(step: GuideStep, inquiry?: Inquiry): MessageKey {
  const cat = inquiry ? categoryFromInquiry(inquiry) : "broadband";
  if (step === "current") {
    if (cat === "home5g") return "aiAskCurrent5g";
    if (cat === "business") return "aiAskCurrentBiz";
    return "aiAskCurrent";
  }
  if (step === "housing") {
    if (cat === "home5g") return "aiAskHousing5g";
    if (cat === "business") return "aiAskHousingBiz";
    return "aiAskHousing";
  }
  if (step === "mobileLine") return "aiAskMobileLine";
  if (step === "mobileData") return "aiAskMobileData";
  if (step === "mobileExpiry") return "aiAskMobileExpiry";
  return "aiAskService";
}

function draftKey(step: GuideStep | null): MessageKey {
  if (step === "current") return "aiDraftCurrent";
  if (step === "housing") return "aiDraftEstate";
  if (step === "service") return "aiDraftService";
  return "aiDraft";
}

function blankGuide(): Inquiry {
  return {
    estate: "",
    housing: "",
    district: "",
    block: "",
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

function clearGuideField(guide: Inquiry, id: "serviceType" | "housing" | "currentProvider" | "need"): Inquiry {
  if (id === "serviceType") {
    return {
      ...guide,
      serviceType: "",
      housing: "",
      estate: "",
      currentProvider: "",
      need: "",
      expiry: "",
      esports: false,
    };
  }
  if (id === "housing") return { ...guide, housing: "", estate: "" };
  if (id === "need") return { ...guide, need: "", expiry: "" };
  return { ...guide, currentProvider: "", need: "", expiry: "" };
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
    mobileNeed: MOBILE_DATA.find((item) => item.label === guide.need)?.id,
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
  onClear: (id: "serviceType" | "housing" | "currentProvider" | "need") => void;
}) {
  const step = nextGuideStep(inquiry);
  const mobile = Boolean(inquiry.serviceType.trim()) && categoryFromInquiry(inquiry) === "mobile";
  const addressStep = !inquiry.serviceType.trim() || needsAddress(categoryFromInquiry(inquiry));
  const slots = mobile
    ? [
        { id: "serviceType" as const, n: 1, label: "aiSlotService" as const, value: inquiry.serviceType.trim() },
        { id: "currentProvider" as const, n: 2, label: "aiSlotMobileLine" as const, value: inquiry.currentProvider.trim() },
        { id: "need" as const, n: 3, label: "aiSlotData" as const, value: inquiry.need.trim() },
      ]
    : GUIDE_STEPS.map((item) => ({
        id: item.id,
        n: item.n,
        label: item.label,
        value:
          item.id === "housing"
            ? inquiry.estate.trim() ||
              (inquiry.housing === "private"
                ? "私樓"
                : inquiry.housing === "public"
                  ? "公屋"
                  : inquiry.housing === "hos"
                    ? "居屋"
                    : inquiry.housing === "village"
                      ? "村屋"
                      : "")
            : inquiry[item.id].trim(),
      }));
  const missing = slots
    .filter((item) => {
      if (item.id === "housing" && !addressStep) return false;
      if (item.id === "housing") return !hasAddress(inquiry);
      return !item.value;
    })
    .map((item) => t(item.label));
  const currentN = step === "housing" || step === "mobileLine" ? 2 : step === "current" || step === "mobileData" || step === "mobileExpiry" ? 3 : step === "service" ? 1 : 4;
  return (
    <div className="border-t border-primary-foreground/15 px-4 pb-3">
      <p className="mb-2 text-xs font-medium leading-snug text-primary-foreground">{t("aiAutoFilter")}</p>
      <p className="mb-2 text-[11px] text-primary-foreground/70">
        {missing.length ? t("aiStillNeed", { items: missing.join("、") }) : t("aiReady")}
        {step ? ` · ${t("aiNowStep", { n: Math.min(currentN, 3) })}` : ""}
      </p>
      <ol className="grid grid-cols-3 gap-1.5">
        {slots.map((item) => {
          const value = item.value;
          const active =
            (item.id === "serviceType" && step === "service") ||
            (item.id === "housing" && step === "housing") ||
            (item.id === "currentProvider" && (step === "current" || step === "mobileLine")) ||
            (item.id === "need" && (step === "mobileData" || step === "mobileExpiry"));
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
  const setInquiry = useDesk((s) => s.setInquiry);
  const { mounted, shown } = useAiPresence(open);
  const { t, locale, tx } = useI18n();

  useEffect(() => {
    if (!open) return;
    sessionParse.current = null;
    setGuide(blankGuide());
    setBubbles([{ id: "a1", from: "biz", text: aiWelcomeCopy(t) }]);
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
    const picked = pickScreenPlans(filterPlans(search), parsed.exclude);
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
    if (nextGuideStep(snap) === "housing" && !quote.estate.trim() && !quote.housing.trim()) {
      quote = { ...quote, estate: trimmed };
    }
    setGuide(quote);
    const known = isQuestionIntentClient(trimmed) ? matchKnowledge(trimmed) : undefined;
    if (known) {
      setBubbles((prev) => [
        ...prev,
        {
          id: `${mineId}-ai`,
          from: "biz",
          text: locale === "en" ? known.en : known.zh,
          pageHref: known.href,
          pageLabel: locale === "en" ? known.linkEn : known.linkZh,
          cs: true,
        },
      ]);
      setBusy(false);
      return;
    }
    if (needsCsHandoff(trimmed)) {
      setBubbles((prev) => [
        ...prev,
        { id: `${mineId}-ai`, from: "biz", text: t("aiCsHandoff"), handoff: true },
      ]);
      setBusy(false);
      return;
    }
    const still = nextGuideStep(quote);
    const isQuestion =
      /[？?]/.test(trimmed) || QUESTION_CHIPS.some((item) => item.zh === trimmed || item.en === trimmed);
    if (still && !opts?.silent && !isQuestion) {
      setBubbles((prev) => [...prev, { id: `${mineId}-ai`, from: "biz", text: t(askKey(still, quote)) }]);
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
      setBubbles((prev) => [...prev, { id: `${mineId}-ai`, from: "biz", text: t("aiAskCurrent"), quote }]);
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
      setBubbles((prev) => [...prev, { id: `${Date.now()}-ai`, from: "biz", text: t(askKey(step, next)) }]);
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

  function csQuote() {
    const housing =
      guide.housing === "private"
        ? "私樓"
        : guide.housing === "public"
          ? "公屋"
          : guide.housing === "hos"
            ? "居屋"
            : guide.housing === "village"
              ? "村屋"
              : "";
    return salesQuoteMessage({
      serviceType: guide.serviceType,
      address: guide.estate,
      housing,
      currentProvider: guide.currentProvider,
      expiry: guide.customerExpiry || guide.expiry,
      need: guide.need,
      esports: guide.esports,
      source: "ai",
    });
  }

  function clearStep(id: "serviceType" | "housing" | "currentProvider" | "need") {
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
          "inset-x-0 bottom-24 top-16 w-full",
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
          className="flex h-full max-h-full flex-col overflow-hidden rounded-t-2xl bg-card shadow-[var(--shadow-border-hover)] lg:h-[32rem] lg:max-h-[calc(100dvh-9rem)] lg:rounded-xl"
        >
          <div className="bg-primary text-primary-foreground">
            <div className="flex justify-center pt-2 lg:hidden" aria-hidden="true">
              <span className="h-1 w-10 rounded-full bg-primary-foreground/40" />
            </div>
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
                {bubble.pageHref ? (
                  <a href={bubble.pageHref} className="mt-2 inline-flex text-sm font-medium text-accent">
                    {bubble.pageLabel ?? t("aiOnSite")}
                  </a>
                ) : null}
                {bubble.cs || bubble.handoff ? (
                  <div className="mt-2 space-y-2">
                    <p className="text-sm text-fg">{t("aiCsWelcome")}</p>
                    <a
                      href={whatsappHref(csQuote())}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-11 w-full items-center justify-center rounded-full bg-whatsapp px-3 text-sm font-medium text-whatsapp-foreground"
                    >
                      {t("aiCsCta")}
                    </a>
                    <a
                      href={whatsappHref(csQuote())}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex text-sm font-medium text-accent underline"
                    >
                      {t("aiCsLink")}
                    </a>
                  </div>
                ) : null}
                {bubble.planIds?.length ? (
                  <div className="mt-2 space-y-2">
                    {bubble.planIds.map((id, index) => {
                      const plan = plansForAiCards(bubble.planIds ?? []).find((item) => item.id === id);
                      if (!plan) return null;
                      const role = bubble.planRoles?.[index];
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
                            {role ? <p className="text-[11px] font-semibold text-accent">{t(ROLE_KEY[role])}</p> : null}
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
                      <Link
                        to="/plans"
                        search={bubble.search}
                        hash="plan-list"
                        className="inline-flex text-sm font-medium text-accent"
                        onClick={() => closeAi()}
                      >
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
            <div ref={endRef} />
          </div>

          {guideStep ? (
            <div className="border-t border-border bg-surface px-3 py-2">
              <p className="text-sm font-medium text-fg">{t(askKey(guideStep, guide))}</p>
              <p className="text-[11px] text-muted">{t("aiCoach")}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(guideStep === "service"
                  ? SERVICE_CHIPS.map((item) => ({ id: item.cat, label: t(item.key) }))
                  : guideStep === "housing"
                    ? HOUSING_CHIPS.map((item) => ({ id: item.id, label: item.spoken }))
                    : guideStep === "mobileLine"
                      ? MOBILE_CURRENT.map((item) => ({ id: item.id, label: item.label }))
                      : guideStep === "mobileData"
                        ? MOBILE_DATA.map((item) => ({ id: item.id, label: item.label }))
                        : guideStep === "mobileExpiry"
                          ? EXPIRY_OPTIONS.map((item) => ({ id: item.id, label: item.label }))
                          : currentOptions(guideCat)
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="h-11 rounded-full bg-card px-3 text-sm font-medium shadow-[var(--shadow-border)]"
                    onClick={() => {
                      if (guideStep === "service") {
                        const cat = item.id as Category;
                        pickGuide(t(SERVICE_CHIPS.find((row) => row.cat === cat)?.key ?? "aiSvcFibre"), {
                          serviceType: serviceTypeLabel(cat),
                          estate: "",
                          housing: "",
                          currentProvider: "",
                          need: "",
                          expiry: "",
                        });
                        return;
                      }
                      if (guideStep === "housing") {
                        pickGuide(item.label, { housing: item.id, estate: "" });
                        return;
                      }
                      if (guideStep === "mobileLine") {
                        pickGuide(item.label, { currentProvider: item.label, need: "", expiry: "" });
                        return;
                      }
                      if (guideStep === "mobileData") {
                        pickGuide(item.label, { need: item.label });
                        return;
                      }
                      if (guideStep === "mobileExpiry") {
                        pickGuide(item.label, { expiry: item.label });
                        return;
                      }
                      pickGuide(item.label, { currentProvider: item.label });
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
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

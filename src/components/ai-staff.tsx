import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { LogoMarkLooking } from "@/components/logo-mark-looking";
import { PlanCard } from "@/components/plan-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CS_HREF,
  CS_LABEL,
  DISCLAIMER,
  PRODUCT_NAME,
} from "@/lib/ai-quote-copy";
import {
  applyUserMessage,
  createQuoteSession,
  handoffNeed,
  openingTurn,
  placeholderFor,
  suggestionChips,
  type AssistantTurn,
  type QuoteSession,
} from "@/lib/ai-quote";
import { useDesk, useHydrateDesk } from "@/lib/desk";
import { useI18n } from "@/lib/i18n";
import { getPlan } from "@/lib/plans";
import { currentLabel, serviceTypeLabel } from "@/lib/port-in";
import { SITE } from "@/lib/site";
import { bareWhatsAppActivateProps } from "@/lib/wa-quote-open";
import { cn } from "@/lib/utils";

type ThreadItem = AssistantTurn & { from: "biz" | "me" };

const AI_CLOSE_MS = 180;

const PAGE_LINKS: Record<string, { to: "/plans" | "/spend" | "/new-intake" | "/guides/$slug"; slug?: string }> = {
  計劃目錄: { to: "/plans" },
  個人月費對照: { to: "/spend" },
  新入伙屋苑寬頻: { to: "/new-intake" },
  轉台寬頻攻略: { to: "/guides/$slug", slug: "switch-broadband" },
  村屋光纖點算: { to: "/guides/$slug", slug: "village" },
};

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

function LinkedCopy({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  const pattern = /(轉台寬頻攻略|新入伙屋苑寬頻|村屋光纖點算|個人月費對照|計劃目錄)/g;
  let last = 0;
  let key = 0;
  for (const match of text.matchAll(pattern)) {
    const label = match[1] ?? "";
    const index = match.index ?? 0;
    if (index > last) parts.push(text.slice(last, index));
    const link = PAGE_LINKS[label];
    if (link?.to === "/guides/$slug" && link.slug) {
      parts.push(
        <Link
          key={key}
          to="/guides/$slug"
          params={{ slug: link.slug }}
          search={{ lang: undefined }}
          className="font-medium text-primary underline underline-offset-2"
        >
          {label}
        </Link>,
      );
    } else if (link && link.to !== "/guides/$slug") {
      parts.push(
        <Link key={key} to={link.to} search={{ lang: undefined }} className="font-medium text-primary underline underline-offset-2">
          {label}
        </Link>,
      );
    } else {
      parts.push(label);
    }
    key += 1;
    last = index + label.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

export function AiStaffPanel() {
  const panelId = useId();
  const [draft, setDraft] = useState("");
  const [session, setSession] = useState<QuoteSession>(() => createQuoteSession());
  const [items, setItems] = useState<ThreadItem[]>(() => [{ ...openingTurn(), from: "biz" }]);
  const endRef = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);
  useHydrateDesk();
  const open = useDesk((s) => s.aiOpen);
  const closeAi = useDesk((s) => s.closeAi);
  const setInquiry = useDesk((s) => s.setInquiry);
  const { mounted, shown } = useAiPresence(open);
  const { t } = useI18n();

  useEffect(() => {
    if (open && !wasOpen.current) {
      const next = createQuoteSession();
      setSession(next);
      setItems([{ ...openingTurn(), from: "biz" }]);
      setDraft("");
    }
    wasOpen.current = open;
  }, [open]);

  useEffect(() => {
    if (!open) return;
    endRef.current?.scrollIntoView({ block: "end" });
  }, [open, items.length]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") closeAi();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeAi]);

  function sendToAi(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const result = applyUserMessage(session, trimmed);
    setSession(result.session);
    setItems((prev) => [
      ...prev,
      { id: `me-${session.seq}`, from: "me", text: trimmed },
      ...result.turns.map((turn) => ({ ...turn, from: "biz" as const })),
    ]);
    setDraft("");
    if (result.session.hasAddress) {
      setInquiry({
        estate: result.session.estateName || result.session.addressText,
        housing: result.session.housing ?? "",
        district: "",
        block: "",
        currentProvider: result.session.newOrNone
          ? "新開戶／無用緊"
          : result.session.providerId
            ? currentLabel(result.session.providerId)
            : "",
        targetProvider: "",
        need: handoffNeed(result.session),
        serviceType: serviceTypeLabel("broadband"),
        esports: result.session.esports,
        source: "ai",
      });
    }
  }

  const chips = suggestionChips(session);
  const placeholder = placeholderFor(session);

  if (!mounted) return null;

  return (
    <>
      <button
        type="button"
        tabIndex={shown ? 0 : -1}
        aria-hidden={!shown}
        aria-label={t("aiClose")}
        className={cn("ai-overlay fixed inset-x-0 bottom-0 top-[6.1rem] z-40 bg-bg", shown && "is-open")}
        onClick={closeAi}
      />
      <div
        className={cn(
          "ai-panel fixed inset-x-0 bottom-0 top-[6.1rem] z-[45] flex justify-center",
          shown && "is-open",
        )}
      >
        <div
          id={panelId}
          role="dialog"
          aria-hidden={!shown}
          aria-label={PRODUCT_NAME}
          inert={!shown}
          className="flex h-full w-full max-w-xl flex-col bg-bg"
        >
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <h1 className="min-w-0 flex-1 text-lg font-semibold text-fg">{t("aiStaff")}</h1>
            <button
              type="button"
              aria-label={t("aiClose")}
              className="flex size-11 items-center justify-center"
              onClick={closeAi}
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4">
            {items.map((item) =>
              item.from === "me" ? (
                <div key={item.id} className="ml-auto w-fit max-w-[85%]">
                  <p className="rounded-2xl bg-primary px-3 py-2 text-sm leading-relaxed text-primary-foreground">{item.text}</p>
                </div>
              ) : (
                <div key={item.id} className="flex items-start gap-2">
                  <span className="ai-quote-idle mt-0.5 flex size-8 shrink-0 items-center justify-center" aria-hidden="true">
                    <LogoMarkLooking className="size-8" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="max-w-full rounded-2xl bg-card px-3 py-2 text-sm leading-relaxed text-fg shadow-[var(--shadow-border)]">
                      <LinkedCopy text={item.text} />
                    </p>
                    {item.disclaimer ? <p className="mt-1.5 text-xs leading-relaxed text-muted">{DISCLAIMER}</p> : null}
                    {item.cs ? (
                      <a
                        href={CS_HREF}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex h-11 items-center justify-center rounded-full border border-border bg-card px-4 text-sm font-medium text-fg"
                        {...bareWhatsAppActivateProps(SITE.whatsappE164, { source: "ai_staff", waPhone: SITE.whatsappE164 })}
                      >
                        {CS_LABEL}
                      </a>
                    ) : null}
                    {item.planIds?.length ? (
                      <div className="mt-3 flex flex-col gap-3">
                        {item.planIds.map((id) => {
                          const plan = getPlan(id);
                          if (!plan) return null;
                          return <PlanCard key={plan.id} plan={plan} />;
                        })}
                      </div>
                    ) : null}
                  </div>
                </div>
              ),
            )}
            <div ref={endRef} />
          </div>

          {chips.length ? (
            <div className="flex flex-wrap gap-2 border-t border-border px-4 py-2">
              {chips.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  className="h-10 rounded-full border border-border bg-card px-3 text-sm font-medium text-fg"
                  onClick={() => sendToAi(chip.label)}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          ) : null}

          <form
            className="flex items-center gap-2 border-t border-border bg-bg px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
            onSubmit={(event) => {
              event.preventDefault();
              sendToAi(draft);
            }}
          >
            <Input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={placeholder}
              aria-label={placeholder}
              className="h-11 flex-1 rounded-full"
            />
            <Button type="submit" className="size-11 shrink-0 rounded-full px-0" aria-label={t("waSend")}>
              →
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}

import { canonicalUrl } from "./canonical.ts";
import { formatFee, type Plan } from "./plans.ts";
import { SITE } from "./site.ts";

/** Locked zh-HK share sentence. Do not paraphrase; must keep 僅供參考＋實際以電訊商確認為準. */
export const PLAN_SHARE_SENTENCE = "呢個計劃月費僅供參考，實際以電訊商確認為準。";
export const PLAN_SHARE_DISCLAIMER = "僅供參考，實際以電訊商確認為準";

export type PlanSharePlan = Pick<Plan, "id" | "name" | "monthlyFee">;

export type PlanSharePayload = {
  title: string;
  text: string;
  url: string;
};

export type PlanShareHost = {
  share?: (data: PlanSharePayload) => Promise<void>;
  canShare?: (data: PlanSharePayload) => boolean;
  writeText?: (text: string) => Promise<void>;
};

export type PlanShareResult = "shared" | "copied" | "aborted";

export function planShareUrl(planId: string): string {
  return canonicalUrl(`/plans/${planId}`);
}

/** Plan facts that must live in the message body, not only the OG card. */
export function planShareFactsLine(plan: Pick<Plan, "name" | "monthlyFee">): string {
  return `${plan.name}｜月費 ${formatFee(plan.monthlyFee)}`;
}

export function planShareBody(plan: PlanSharePlan): string {
  return `${planShareFactsLine(plan)}\n${PLAN_SHARE_SENTENCE}\n${planShareUrl(plan.id)}`;
}

export function planSharePayload(plan: PlanSharePlan): PlanSharePayload {
  const url = planShareUrl(plan.id);
  return {
    title: `${plan.name}｜${SITE.name}`,
    text: planShareBody(plan),
    url,
  };
}

export function planShareClipboardText(plan: PlanSharePlan): string {
  return planSharePayload(plan).text;
}

export function isShareAbortError(error: unknown): boolean {
  return Boolean(
    error && typeof error === "object" && "name" in error && (error as { name: string }).name === "AbortError",
  );
}

export function defaultShareHost(): PlanShareHost {
  if (typeof navigator === "undefined") return {};
  const nav = navigator;
  return {
    share: typeof nav.share === "function" ? (data) => nav.share(data) : undefined,
    canShare: typeof nav.canShare === "function" ? (data) => nav.canShare(data) : undefined,
    writeText:
      nav.clipboard && typeof nav.clipboard.writeText === "function"
        ? (text) => nav.clipboard.writeText(text)
        : undefined,
  };
}

export async function shareOrCopyPlan(
  plan: PlanSharePlan,
  host: PlanShareHost = defaultShareHost(),
): Promise<PlanShareResult> {
  const payload = planSharePayload(plan);
  if (typeof host.share === "function") {
    const allowed = typeof host.canShare !== "function" || host.canShare(payload);
    if (allowed) {
      try {
        await host.share(payload);
        return "shared";
      } catch (error) {
        if (isShareAbortError(error)) return "aborted";
      }
    }
  }
  if (typeof host.writeText !== "function") {
    throw new Error("clipboard-unavailable");
  }
  await host.writeText(planShareClipboardText(plan));
  return "copied";
}

/** How long the optional in-button check / 「已分享連結」 cue stays visible. */
export const SHARE_SUCCESS_CUE_MS = 700;

/** How long the center success toast stays visible while the page is in the foreground. */
export const SHARE_SUCCESS_TOAST_MS = 1000;

export function isPlanShareSuccess(result: PlanShareResult): boolean {
  return result === "shared" || result === "copied";
}

/** Clipboard success is immediate; native share waits if the page is behind the sheet. */
export function shouldRevealShareSuccessNow(result: "shared" | "copied", hidden: boolean): boolean {
  return result === "copied" || !hidden;
}

export type ShareSuccessResumeHost = {
  hidden: () => boolean;
  addResumeListener: (fn: () => void) => void;
  removeResumeListener: (fn: () => void) => void;
};

export function defaultShareSuccessResumeHost(): ShareSuccessResumeHost {
  return {
    hidden: () => typeof document !== "undefined" && document.hidden,
    addResumeListener: (fn) => {
      document.addEventListener("visibilitychange", fn);
      window.addEventListener("pageshow", fn);
    },
    removeResumeListener: (fn) => {
      document.removeEventListener("visibilitychange", fn);
      window.removeEventListener("pageshow", fn);
    },
  };
}

/**
 * Reveal toast now, or wait until the document is visible again after Web Share.
 * `copied` always reveals immediately. Cancel the returned stopper on abort / unmount.
 */
export function scheduleShareSuccessReveal(
  result: "shared" | "copied",
  reveal: () => void,
  host: ShareSuccessResumeHost = defaultShareSuccessResumeHost(),
): () => void {
  if (shouldRevealShareSuccessNow(result, host.hidden())) {
    reveal();
    return () => {};
  }

  let cancelled = false;
  const onResume = () => {
    if (cancelled || host.hidden()) return;
    cancelled = true;
    host.removeResumeListener(onResume);
    reveal();
  };
  host.addResumeListener(onResume);
  return () => {
    if (cancelled) return;
    cancelled = true;
    host.removeResumeListener(onResume);
  };
}

export type ShareSuccessToastHost = {
  hidden: () => boolean;
  show: () => void;
  hide: () => void;
  setTimeout: (fn: () => void, ms: number) => number;
  clearTimeout: (id: number) => void;
  addVisibilityListener: (fn: () => void) => void;
  removeVisibilityListener: (fn: () => void) => void;
};

export function defaultShareSuccessToastHost(handlers: {
  show: () => void;
  hide: () => void;
}): ShareSuccessToastHost {
  return {
    hidden: () => typeof document !== "undefined" && document.hidden,
    show: handlers.show,
    hide: handlers.hide,
    setTimeout: (fn, ms) => window.setTimeout(fn, ms),
    clearTimeout: (id) => window.clearTimeout(id),
    addVisibilityListener: (fn) => {
      document.addEventListener("visibilitychange", fn);
      window.addEventListener("pageshow", fn);
    },
    removeVisibilityListener: (fn) => {
      document.removeEventListener("visibilitychange", fn);
      window.removeEventListener("pageshow", fn);
    },
  };
}

/**
 * Show the toast immediately, but only count the hold while the page is visible.
 * Hidden → visible (returning from WhatsApp) restarts the hold so the check is seen.
 */
export function startShareSuccessToast(
  holdMs: number = SHARE_SUCCESS_TOAST_MS,
  host: ShareSuccessToastHost,
): () => void {
  let timer = 0;
  let stopped = false;

  const clearTimer = () => {
    if (!timer) return;
    host.clearTimeout(timer);
    timer = 0;
  };

  const finish = () => {
    if (stopped || host.hidden()) return;
    stopped = true;
    clearTimer();
    host.removeVisibilityListener(onVis);
    host.hide();
  };

  const arm = () => {
    if (stopped) return;
    clearTimer();
    if (host.hidden()) return;
    timer = host.setTimeout(finish, holdMs);
  };

  const onVis = () => {
    if (stopped) return;
    if (host.hidden()) {
      clearTimer();
      return;
    }
    arm();
  };

  host.show();
  host.addVisibilityListener(onVis);
  arm();

  return () => {
    if (stopped) return;
    stopped = true;
    clearTimer();
    host.removeVisibilityListener(onVis);
    host.hide();
  };
}

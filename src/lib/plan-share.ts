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

/** How long the optional in-button check / 「已複製」 cue stays visible. */
export const SHARE_SUCCESS_CUE_MS = 700;

/** How long the center success toast stays visible while the page is in the foreground. */
export const SHARE_SUCCESS_TOAST_MS = 1000;

export function isPlanShareSuccess(result: PlanShareResult): boolean {
  return result === "shared" || result === "copied";
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
    addVisibilityListener: (fn) => document.addEventListener("visibilitychange", fn),
    removeVisibilityListener: (fn) => document.removeEventListener("visibilitychange", fn),
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

export type ShareSuccessDingHost = {
  hidden?: boolean;
  muted?: boolean;
  reducedMotion?: boolean;
  /** false when the click gesture has already been consumed (e.g. after a share sheet). */
  userGestureActive?: boolean;
};

type AudioContextCtor = typeof AudioContext;

export function readShareSuccessDingHost(): ShareSuccessDingHost {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return { hidden: true, userGestureActive: false };
  }
  const doc = document as Document & { muted?: boolean };
  return {
    hidden: document.hidden,
    muted: Boolean(doc.muted),
    reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    userGestureActive: navigator.userActivation ? navigator.userActivation.isActive : true,
  };
}

export function shouldPlayShareSuccessDing(host: ShareSuccessDingHost): boolean {
  if (host.hidden || host.muted || host.reducedMotion) return false;
  if (host.userGestureActive === false) return false;
  return true;
}

function audioContextCtor(): AudioContextCtor | undefined {
  const scope = globalThis as typeof globalThis & {
    AudioContext?: AudioContextCtor;
    webkitAudioContext?: AudioContextCtor;
  };
  return scope.AudioContext ?? scope.webkitAudioContext;
}

/** Quiet one-shot oscillator blip. Never loops; skip when motion/audio is suppressed. */
export function playShareSuccessDing(host: ShareSuccessDingHost = readShareSuccessDingHost()): void {
  if (!shouldPlayShareSuccessDing(host)) return;
  const Ctor = audioContextCtor();
  if (!Ctor) return;

  let ctx: AudioContext;
  try {
    ctx = new Ctor();
  } catch {
    return;
  }
  if (ctx.state === "closed") return;

  // iOS starts AudioContext suspended; resume during the tap gesture so the blip can play.
  if (ctx.state !== "running") {
    void ctx.resume().catch(() => {
      void ctx.close();
    });
  }

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const t = ctx.currentTime;
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, t);
    osc.frequency.exponentialRampToValueAtTime(1320, t + 0.045);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.055, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.11);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.12);
    osc.addEventListener("ended", () => {
      void ctx.close();
    });
  } catch {
    void ctx.close();
  }
}

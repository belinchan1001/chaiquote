import { canonicalUrl } from "./canonical.ts";
import { formatFee, type Plan } from "./plans.ts";
import { SITE } from "./site.ts";

/** Locked zh-HK share sentence. Do not paraphrase; must keep 僅供參考. */
export const PLAN_SHARE_SENTENCE = "呢個計劃月費僅供參考，實際以電訊商確認為準。";

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
  return planShareBody(plan);
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

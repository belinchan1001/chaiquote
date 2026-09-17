import { recordSiteEvent } from "@/lib/track-fn";
import { inferTrackSource, type TrackEventName, type TrackPayload } from "@/lib/track";

export function trackEvent(input: TrackPayload) {
  if (typeof window === "undefined") return;
  const payload: TrackPayload = {
    ...input,
    path: input.path ?? `${window.location.pathname}${window.location.search}`,
    source: input.source ?? inferTrackSource(window.location.pathname),
  };
  void recordSiteEvent({ data: payload }).catch(() => undefined);
}

export function trackWaClick(input: Omit<TrackPayload, "event"> = {}) {
  trackEvent({ event: "wa_click", ...input });
}

export function trackPlanOpen(planId: string, source?: string) {
  trackEvent({ event: "plan_open", planIds: [planId], source });
}

export function trackPlanView(planId: string) {
  trackEvent({ event: "plan_view", planIds: [planId], source: "plan_detail" });
}

export function trackLeadSubmit(planIds: string[] = []) {
  trackEvent({ event: "lead_submit", planIds, source: "quote" });
}

export function trackNamed(event: TrackEventName, planIds: string[] = [], extra?: TrackPayload["extra"]) {
  trackEvent({ event, planIds, extra });
}

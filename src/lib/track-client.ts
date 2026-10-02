import { recordSiteEvent } from "@/lib/track-fn";
import { inferTrackSource, type TrackEventName, type TrackPayload } from "@/lib/track";
import { fireAdsQuoteConversion } from "@/lib/ads-gtag";
import { classifyLeadSource, readLeadTouch } from "@/lib/ads-attribution";

export function trackEvent(input: TrackPayload) {
  if (typeof window === "undefined") return;
  const payload: TrackPayload = {
    ...input,
    path: input.path ?? `${window.location.pathname}${window.location.search}`,
    source: input.source ?? inferTrackSource(window.location.pathname),
  };
  void recordSiteEvent({ data: payload }).catch(() => undefined);
  if (payload.event === "wa_click") fireAdsQuoteConversion();
}

export function trackWaClick(input: Omit<TrackPayload, "event"> = {}) {
  const touch = readLeadTouch();
  const label = classifyLeadSource(touch);
  trackEvent({
    event: "wa_click",
    ...input,
    extra: {
      lead: label.source,
      ...(label.campaign ? { campaign: label.campaign } : {}),
      ...(touch.cat ? { cat: touch.cat } : {}),
      ...(touch.housing ? { housing: touch.housing } : {}),
      ...input.extra,
    },
  });
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

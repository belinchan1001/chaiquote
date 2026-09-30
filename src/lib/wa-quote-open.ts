import type { MouseEvent, PointerEvent } from "react";
import { trackWaClick } from "@/lib/track-client";
import type { TrackPayload } from "@/lib/track";
import { quoteWhatsappHref } from "@/lib/whatsapp";
import { shouldRecordQuoteOpen } from "./wa-open-guard.ts";

type QuoteActivateEvent = {
  type: string;
  button?: number;
  currentTarget: EventTarget | null;
};

export function stampQuoteWhatsAppHref(event: QuoteActivateEvent, text: string, phone: string) {
  const el = event.currentTarget;
  if (el instanceof HTMLAnchorElement) el.href = quoteWhatsappHref(text, phone);
}

/** Stamp the outbound href, then record the open. Pointer-down only updates the href. */
export function handleQuoteWhatsAppEvent(
  event: QuoteActivateEvent,
  text: string,
  phone: string,
  track?: Omit<TrackPayload, "event">,
) {
  stampQuoteWhatsAppHref(event, text, phone);
  if (!shouldRecordQuoteOpen(event.type, event.button)) return;
  trackWaClick({ waPhone: phone, ...track });
}

export function quoteWhatsAppActivateProps(
  text: string,
  phone: string,
  track?: Omit<TrackPayload, "event">,
) {
  const run = (event: QuoteActivateEvent) => handleQuoteWhatsAppEvent(event, text, phone, track);
  return {
    onPointerDown: (event: PointerEvent<HTMLAnchorElement>) => run(event),
    onClick: (event: MouseEvent<HTMLAnchorElement>) => run(event),
    onAuxClick: (event: MouseEvent<HTMLAnchorElement>) => run(event),
  };
}

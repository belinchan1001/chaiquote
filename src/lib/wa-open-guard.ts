/** True only for a primary click or a middle-click that opens the link. */
export function shouldRecordQuoteOpen(eventType: string, button?: number): boolean {
  if (eventType === "pointerdown") return false;
  if (eventType === "auxclick") return button === 1;
  return eventType === "click";
}

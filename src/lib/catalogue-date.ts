/**
 * Site-wide catalogue display date.
 * Computed from the clock in Asia/Hong_Kong. Call it when rendering;
 * do not snapshot it into article `published` / `modified`, legal last-updated
 * copy, or sitemap `lastmod`.
 */
export function hongKongCalendarDate(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Hong_Kong",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const pick = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  const year = pick("year");
  const month = pick("month");
  const day = pick("day");
  return `${year}-${month}-${day}`;
}

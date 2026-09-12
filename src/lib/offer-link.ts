export const OFFER_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const OFFER_SESSION_MAX_AGE = 24 * 60 * 60;

export function offerCookieName(offerId: string) {
  return `cq_o_${offerId}`;
}

export function offerViewPath(offerId: string, token: string) {
  return `/offers/${offerId}?k=${encodeURIComponent(token)}`;
}

export function isLinkPreviewBot(userAgent: string | null | undefined) {
  return /WhatsApp|facebookexternalhit|Facebot|Twitterbot|Slackbot|TelegramBot|Discordbot|LinkedInBot|Googlebot|bingbot|Applebot|Embedly|preview/i.test(
    userAgent ?? "",
  );
}

export function isOfferTokenFormat(token: string) {
  return /^[A-Za-z0-9_-]{20,64}$/.test(token);
}

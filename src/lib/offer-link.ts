export const OFFER_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;
export const OFFER_SESSION_MAX_AGE = 24 * 60 * 60;

export function offerCookieName(offerId: string) {
  return `cq_o_${offerId}`;
}

export function offerViewPath(offerId: string, token: string) {
  return `/offers/${offerId}?k=${encodeURIComponent(token)}`;
}

export function isLinkPreviewBot(userAgent: string | null | undefined) {
  const ua = userAgent ?? "";
  if (!ua) return false;
  if (
    /facebookexternalhit|Facebot|Twitterbot|Slackbot|TelegramBot|Discordbot|LinkedInBot|Googlebot|bingbot|Applebot|Embedly/i.test(
      ua,
    )
  ) {
    return true;
  }
  // Preview crawler is typically "WhatsApp/2.x", not a Mozilla in-app browser.
  if (/WhatsApp/i.test(ua) && !/Mozilla\/|AppleWebKit|Safari|Chrome/i.test(ua)) return true;
  return false;
}

export function isOfferTokenFormat(token: string) {
  return /^[a-z0-9]+-\d+-[0-9a-f]{24}-[0-9a-f]{32}$/i.test(token) || /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(token);
}

function randomHex(bytes: number) {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return [...arr].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i += 1) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

async function hmacHex(secret: string, body: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return [...new Uint8Array(sig)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32);
}

export async function createOfferToken(offerId: string, secret: string, now = Date.now()) {
  const exp = Math.floor((now + OFFER_TOKEN_TTL_MS) / 1000);
  const nonce = randomHex(12);
  const mac = await hmacHex(secret, `${offerId}.${exp}.${nonce}`);
  return `${offerId}-${exp}-${nonce}-${mac}`;
}

export async function parseOfferToken(token: string, secret: string, now = Date.now()) {
  const match = /^([a-z0-9]+)-(\d+)-([0-9a-f]{24})-([0-9a-f]{32})$/i.exec(token.trim());
  if (!match) return null;
  const offerId = match[1];
  const expStr = match[2];
  const nonce = match[3].toLowerCase();
  const mac = match[4].toLowerCase();
  const expected = await hmacHex(secret, `${offerId}.${expStr}.${nonce}`);
  if (!safeEqual(mac, expected)) return null;
  const exp = Number(expStr) * 1000;
  if (!Number.isFinite(exp) || exp <= now) return null;
  return { o: offerId, e: exp, n: nonce };
}

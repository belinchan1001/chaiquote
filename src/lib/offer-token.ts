import { randomBytes } from "node:crypto";
import { createServerFn } from "@tanstack/react-start";
import {
  isLinkPreviewBot,
  isOfferTokenFormat,
  offerCookieName,
  OFFER_SESSION_MAX_AGE,
  OFFER_TOKEN_TTL_MS,
  offerViewPath,
} from "@/lib/offer-link";
import { staffOfferPlans, type Plan } from "@/lib/plans";

export type OfferViewStatus = "mint" | "landing" | "ready" | "used" | "invalid";

export type OfferView = {
  status: OfferViewStatus;
  plans: Plan[];
};

function plansFor(offerId: string) {
  return staffOfferPlans(offerId);
}

function newToken() {
  return randomBytes(24).toString("base64url");
}

async function readCookie(offerId: string) {
  const { getCookie } = await import("@tanstack/react-start/server");
  return getCookie(offerCookieName(offerId)) ?? "";
}

async function writeSessionCookie(offerId: string, sessionId: string) {
  const { setCookie } = await import("@tanstack/react-start/server");
  setCookie(offerCookieName(offerId), sessionId, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: OFFER_SESSION_MAX_AGE,
  });
}

async function requestUserAgent() {
  try {
    const { getRequest } = await import("@tanstack/react-start/server");
    return getRequest().headers.get("user-agent") ?? "";
  } catch {
    return "";
  }
}

type TokenRow = {
  token: string;
  offer_id: string;
  expired: boolean;
  claimed: boolean;
  session_id: string | null;
};

function asBool(value: unknown) {
  return value === true || value === "t" || value === "true";
}

async function loadToken(offerId: string, token: string) {
  const { getSql } = await import("@/lib/db");
  const sql = await getSql();
  const rows = await sql<TokenRow>`
    select
      token,
      offer_id,
      (expires_at <= now()) as expired,
      (claimed_at is not null) as claimed,
      session_id
    from offer_tokens
    where token = ${token} and offer_id = ${offerId}
    limit 1
  `;
  const row = rows[0];
  if (!row) return null;
  return { ...row, expired: asBool(row.expired), claimed: asBool(row.claimed) };
}

export const peekOfferView = createServerFn({ method: "GET" })
  .inputValidator((data: { offerId: string; token?: string }) => data)
  .handler(async ({ data }): Promise<OfferView> => {
    const plans = plansFor(data.offerId);
    if (!plans.length) return { status: "invalid", plans: [] };
    const token = data.token?.trim() ?? "";
    if (!token) return { status: "mint", plans: [] };
    if (!isOfferTokenFormat(token)) return { status: "invalid", plans: [] };
    const row = await loadToken(data.offerId, token);
    if (!row) return { status: "invalid", plans: [] };
    if (!row.claimed && row.expired) return { status: "invalid", plans: [] };
    if (!row.claimed) return { status: "landing", plans: [] };
    const cookie = await readCookie(data.offerId);
    if (row.session_id && cookie === row.session_id) return { status: "ready", plans };
    return { status: "used", plans: [] };
  });

export const claimOfferView = createServerFn({ method: "POST" })
  .inputValidator((data: { offerId: string; token: string }) => data)
  .handler(async ({ data }): Promise<OfferView> => {
    const plans = plansFor(data.offerId);
    if (!plans.length) return { status: "invalid", plans: [] };
    const token = data.token.trim();
    if (!isOfferTokenFormat(token)) return { status: "invalid", plans: [] };
    if (isLinkPreviewBot(await requestUserAgent())) return { status: "landing", plans: [] };

    const cookie = await readCookie(data.offerId);
    const existing = await loadToken(data.offerId, token);
    if (!existing) return { status: "invalid", plans: [] };
    if (existing.claimed) {
      if (existing.session_id && cookie === existing.session_id) return { status: "ready", plans };
      return { status: "used", plans: [] };
    }
    if (existing.expired) return { status: "invalid", plans: [] };

    const sessionId = newToken();
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const claimed = await sql<{ token: string }>`
      update offer_tokens
      set claimed_at = now(), session_id = ${sessionId}
      where token = ${token}
        and offer_id = ${data.offerId}
        and claimed_at is null
        and expires_at > now()
      returning token
    `;
    if (!claimed.length) {
      const again = await loadToken(data.offerId, token);
      if (again?.claimed && again.session_id && cookie === again.session_id) {
        return { status: "ready", plans };
      }
      return { status: "used", plans: [] };
    }
    await writeSessionCookie(data.offerId, sessionId);
    return { status: "ready", plans };
  });

export const issueOfferLink = createServerFn({ method: "POST" })
  .inputValidator((data: { offerId: string }) => data)
  .handler(async ({ data }) => {
    if (!plansFor(data.offerId).length) return { ok: false as const, path: "" };
    const token = newToken();
    const expiresAt = new Date(Date.now() + OFFER_TOKEN_TTL_MS).toISOString();
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    await sql`
      insert into offer_tokens (token, offer_id, expires_at)
      values (${token}, ${data.offerId}, ${expiresAt})
    `;
    return { ok: true as const, path: offerViewPath(data.offerId, token) };
  });

export const hasOfferSession = createServerFn({ method: "GET" })
  .inputValidator((data: { offerId: string }) => data)
  .handler(async ({ data }) => {
    if (!plansFor(data.offerId).length) return false;
    const cookie = await readCookie(data.offerId);
    if (!cookie) return false;
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const rows = await sql<{ token: string }>`
      select token from offer_tokens
      where offer_id = ${data.offerId} and session_id = ${cookie} and claimed_at is not null
      limit 1
    `;
    return rows.length > 0;
  });

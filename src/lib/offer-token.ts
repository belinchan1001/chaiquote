import { createServerFn } from "@tanstack/react-start";
import { SITE } from "@/lib/site";
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

type SignedPayload = { o: string; e: number; n: string };

const usedNonces = (globalThis as typeof globalThis & {
  __cqOfferUsed__?: Map<string, string>;
}).__cqOfferUsed__ ??= new Map<string, string>();

function plansFor(offerId: string) {
  return staffOfferPlans(offerId);
}

function hasDatabase() {
  return Boolean(process.env.DATABASE_URL?.trim());
}

function offerSecret() {
  return process.env.OFFER_TOKEN_SECRET?.trim() || `chaiquote-offer:${SITE.url}`;
}

async function randomId() {
  const { randomBytes } = await import("node:crypto");
  return randomBytes(18).toString("base64url");
}

async function signPayload(payload: SignedPayload) {
  const { createHmac } = await import("node:crypto");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const mac = createHmac("sha256", offerSecret()).update(body).digest("base64url");
  return `${body}.${mac}`;
}

async function readSignedToken(token: string): Promise<SignedPayload | null> {
  const { createHmac, timingSafeEqual } = await import("node:crypto");
  const dot = token.lastIndexOf(".");
  if (dot < 1) return null;
  const body = token.slice(0, dot);
  const mac = token.slice(dot + 1);
  const expected = createHmac("sha256", offerSecret()).update(body).digest("base64url");
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as SignedPayload;
    if (!payload?.o || !payload.n || typeof payload.e !== "number") return null;
    if (payload.e <= Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
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

async function loadDbToken(offerId: string, token: string) {
  if (!hasDatabase()) return null;
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

function memoryStatus(offerId: string, nonce: string, cookie: string): OfferViewStatus | null {
  const key = `${offerId}:${nonce}`;
  const claimed = usedNonces.get(key);
  if (!claimed) return null;
  if (cookie && cookie === claimed) return "ready";
  return "used";
}

export const peekOfferView = createServerFn({ method: "GET" })
  .inputValidator((data: { offerId: string; token?: string }) => data)
  .handler(async ({ data }): Promise<OfferView> => {
    const plans = plansFor(data.offerId);
    if (!plans.length) return { status: "invalid", plans: [] };
    const token = data.token?.trim() ?? "";
    if (!token) return { status: "mint", plans: [] };
    if (!isOfferTokenFormat(token)) return { status: "invalid", plans: [] };

    const cookie = await readCookie(data.offerId);

    if (hasDatabase() && !token.includes(".")) {
      const row = await loadDbToken(data.offerId, token);
      if (!row) return { status: "invalid", plans: [] };
      if (!row.claimed && row.expired) return { status: "invalid", plans: [] };
      if (!row.claimed) return { status: "landing", plans: [] };
      if (row.session_id && cookie === row.session_id) return { status: "ready", plans };
      return { status: "used", plans: [] };
    }

    const payload = await readSignedToken(token);
    if (!payload || payload.o !== data.offerId) return { status: "invalid", plans: [] };
    const mem = memoryStatus(data.offerId, payload.n, cookie);
    if (mem === "ready") return { status: "ready", plans };
    if (mem === "used") return { status: "used", plans: [] };
    if (cookie && cookie === payload.n) return { status: "ready", plans };
    return { status: "landing", plans: [] };
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

    if (hasDatabase() && !token.includes(".")) {
      const existing = await loadDbToken(data.offerId, token);
      if (!existing) return { status: "invalid", plans: [] };
      if (existing.claimed) {
        if (existing.session_id && cookie === existing.session_id) return { status: "ready", plans };
        return { status: "used", plans: [] };
      }
      if (existing.expired) return { status: "invalid", plans: [] };
      const sessionId = await randomId();
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
      if (!claimed.length) return { status: "used", plans: [] };
      await writeSessionCookie(data.offerId, sessionId);
      return { status: "ready", plans };
    }

    const payload = await readSignedToken(token);
    if (!payload || payload.o !== data.offerId) return { status: "invalid", plans: [] };
    const key = `${data.offerId}:${payload.n}`;
    const already = usedNonces.get(key);
    if (already) {
      if (cookie === already) {
        await writeSessionCookie(data.offerId, already);
        return { status: "ready", plans };
      }
      return { status: "used", plans: [] };
    }
    usedNonces.set(key, payload.n);
    await writeSessionCookie(data.offerId, payload.n);
    return { status: "ready", plans };
  });

export const issueOfferLink = createServerFn({ method: "POST" })
  .inputValidator((data: { offerId: string }) => data)
  .handler(async ({ data }) => {
    if (!plansFor(data.offerId).length) return { ok: false as const, path: "" };
    try {
      const nonce = await randomId();
      const token = await signPayload({
        o: data.offerId,
        e: Date.now() + OFFER_TOKEN_TTL_MS,
        n: nonce,
      });
      if (hasDatabase()) {
        try {
          const { getSql } = await import("@/lib/db");
          const sql = await getSql();
          await sql`
            insert into offer_tokens (token, offer_id, expires_at)
            values (${nonce}, ${data.offerId}, ${new Date(Date.now() + OFFER_TOKEN_TTL_MS).toISOString()})
          `;
        } catch {
          // Signed token still works if the table is missing.
        }
      }
      return { ok: true as const, path: offerViewPath(data.offerId, token) };
    } catch {
      return { ok: false as const, path: "" };
    }
  });

export const hasOfferSession = createServerFn({ method: "GET" })
  .inputValidator((data: { offerId: string }) => data)
  .handler(async ({ data }) => {
    if (!plansFor(data.offerId).length) return false;
    const cookie = await readCookie(data.offerId);
    if (!cookie) return false;
    if ([...usedNonces.entries()].some(([key, session]) => key.startsWith(`${data.offerId}:`) && session === cookie)) {
      return true;
    }
    if (!hasDatabase()) return Boolean(cookie);
    try {
      const { getSql } = await import("@/lib/db");
      const sql = await getSql();
      const rows = await sql<{ token: string }>`
        select token from offer_tokens
        where offer_id = ${data.offerId} and session_id = ${cookie} and claimed_at is not null
        limit 1
      `;
      return rows.length > 0;
    } catch {
      return Boolean(cookie);
    }
  });

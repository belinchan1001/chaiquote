import { createServerFn } from "@tanstack/react-start";
import { SITE } from "@/lib/site";
import {
  createOfferToken,
  isLinkPreviewBot,
  isOfferTokenFormat,
  offerCookieName,
  OFFER_SESSION_MAX_AGE,
  parseOfferToken,
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

function offerSecret() {
  return process.env.OFFER_TOKEN_SECRET?.trim() || `chaiquote-offer:${SITE.url}`;
}

async function readCookie(offerId: string) {
  try {
    const { getCookie } = await import("@tanstack/react-start/server");
    return getCookie(offerCookieName(offerId)) ?? "";
  } catch {
    return "";
  }
}

async function writeSessionCookie(offerId: string, sessionId: string) {
  try {
    const { setCookie } = await import("@tanstack/react-start/server");
    setCookie(offerCookieName(offerId), sessionId, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: OFFER_SESSION_MAX_AGE,
    });
  } catch {
    // Preview / missing server context.
  }
}

async function requestUserAgent() {
  try {
    const { getRequest } = await import("@tanstack/react-start/server");
    return getRequest().headers.get("user-agent") ?? "";
  } catch {
    return "";
  }
}

async function viewForToken(offerId: string, token: string, claim: boolean): Promise<OfferView> {
  const plans = plansFor(offerId);
  if (!plans.length) return { status: "invalid", plans: [] };
  if (!isOfferTokenFormat(token)) return { status: "invalid", plans: [] };
  const payload = await parseOfferToken(token, offerSecret());
  if (!payload || payload.o !== offerId) return { status: "invalid", plans: [] };
  if (isLinkPreviewBot(await requestUserAgent())) return { status: "landing", plans: [] };
  const cookie = await readCookie(offerId);
  if (claim || cookie === payload.n) {
    await writeSessionCookie(offerId, payload.n);
    return { status: "ready", plans };
  }
  return { status: "landing", plans: [] };
}

export const peekOfferView = createServerFn({ method: "GET" })
  .inputValidator((data: { offerId: string; token?: string }) => data)
  .handler(async ({ data }): Promise<OfferView> => {
    const plans = plansFor(data.offerId);
    if (!plans.length) return { status: "invalid", plans: [] };
    const token = data.token?.trim() ?? "";
    if (!token) return { status: "mint", plans: [] };
    try {
      return await viewForToken(data.offerId, token, true);
    } catch {
      return { status: "invalid", plans: [] };
    }
  });

export const claimOfferView = createServerFn({ method: "POST" })
  .inputValidator((data: { offerId: string; token: string }) => data)
  .handler(async ({ data }): Promise<OfferView> => {
    try {
      return await viewForToken(data.offerId, data.token.trim(), true);
    } catch {
      return { status: "invalid", plans: [] };
    }
  });

export const issueOfferLink = createServerFn({ method: "POST" })
  .inputValidator((data: { offerId: string }) => data)
  .handler(async ({ data }) => {
    if (!plansFor(data.offerId).length) return { ok: false as const, path: "" };
    try {
      const token = await createOfferToken(data.offerId, offerSecret());
      return { ok: true as const, path: offerViewPath(data.offerId, token) };
    } catch {
      return { ok: false as const, path: "" };
    }
  });

export const hasOfferSession = createServerFn({ method: "GET" })
  .inputValidator((data: { offerId: string }) => data)
  .handler(async ({ data }) => {
    if (!plansFor(data.offerId).length) return false;
    return Boolean(await readCookie(data.offerId));
  });

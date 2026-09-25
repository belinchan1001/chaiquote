import { createHmac, randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCb);
const COOKIE = "cq_desk";
const MAX_AGE = 60 * 60 * 24 * 14;

export function normalizeUsername(value: string): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "")
    .slice(0, 40);
}

export function isValidUsername(value: string): boolean {
  return /^[a-z0-9][a-z0-9._-]{1,39}$/.test(normalizeUsername(value));
}

function sessionSecret(): string {
  return (
    process.env.STAFF_DESK_SECRET ||
    process.env.BETTER_AUTH_SECRET ||
    process.env.AUTH_SECRET ||
    "chaiquote-desk-session"
  );
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = (await scrypt(password, salt, 32)) as Buffer;
  return `scrypt$${salt.toString("hex")}$${key.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = String(stored ?? "").split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const salt = Buffer.from(parts[1], "hex");
  const expected = Buffer.from(parts[2], "hex");
  if (!salt.length || expected.length !== 32) return false;
  const actual = (await scrypt(password, salt, 32)) as Buffer;
  return timingSafeEqual(actual, expected);
}

function sign(payload: string): string {
  return createHmac("sha256", sessionSecret()).update(payload).digest("hex");
}

export async function writeDeskSession(username: string): Promise<void> {
  const exp = Date.now() + MAX_AGE * 1000;
  const payload = `${normalizeUsername(username)}.${exp}`;
  const value = `${payload}.${sign(payload)}`;
  const { setCookie } = await import("@tanstack/react-start/server");
  setCookie(COOKIE, value, {
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: MAX_AGE,
  });
}

export async function clearDeskSession(): Promise<void> {
  const { setCookie } = await import("@tanstack/react-start/server");
  setCookie(COOKIE, "", { path: "/", httpOnly: true, secure: true, sameSite: "lax", maxAge: 0 });
}

export async function readDeskUsername(): Promise<string | null> {
  try {
    const { getCookie } = await import("@tanstack/react-start/server");
    const raw = getCookie(COOKIE);
    if (!raw) return null;
    const parts = raw.split(".");
    if (parts.length !== 3) return null;
    const [username, exp, mac] = parts;
    const payload = `${username}.${exp}`;
    const expected = sign(payload);
    const a = Buffer.from(mac);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    if (Number(exp) < Date.now()) return null;
    const name = normalizeUsername(username);
    return isValidUsername(name) ? name : null;
  } catch {
    return null;
  }
}

export function envOwnerUsername(): string {
  return normalizeUsername(process.env.STAFF_DESK_USER ?? "");
}

export function envOwnerPassword(): string {
  return process.env.STAFF_DESK_PASSWORD ?? "";
}

import { createHmac, randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import pg from "pg";

const scrypt = promisify(scryptCb);
const COOKIE = "cq_office";
const GROUPS = {
  hkt: "HKT（網上行 / csl. / CSL 5G 家居）",
  hkbn: "香港寬頻",
  cmhk: "中國移動香港",
  smartone: "數碼通",
  three: "3香港",
  hgc: "HGC 寬頻",
  icable: "有線寬頻",
};
const GROUP_PROVIDERS = {
  hkt: ["netvigator", "csl"],
  hkbn: ["hkbn"],
  cmhk: ["cmhk"],
  smartone: ["smartone"],
  three: ["three"],
  hgc: ["hgc"],
  icable: ["icable"],
};

function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...extra },
  });
}

function secret() {
  return process.env.STAFF_DESK_SECRET || process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET || "chaiquote-office";
}

function normUser(value) {
  return String(value || "").trim().toLowerCase().replace(/[^a-z0-9._-]/g, "").slice(0, 40);
}

function validUser(value) {
  return /^[a-z0-9][a-z0-9._-]{1,39}$/.test(normUser(value));
}

async function hashPassword(password) {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, 32);
  return `scrypt$${salt.toString("hex")}$${key.toString("hex")}`;
}

async function verifyPassword(password, stored) {
  const parts = String(stored || "").split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const salt = Buffer.from(parts[1], "hex");
  const expected = Buffer.from(parts[2], "hex");
  const actual = await scrypt(password, salt, 32);
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}

function sign(payload) {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

function cookieHeader(username) {
  const exp = Date.now() + 14 * 24 * 3600 * 1000;
  const payload = `${normUser(username)}.${exp}`;
  const value = `${payload}.${sign(payload)}`;
  return `${COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${14 * 24 * 3600}`;
}

function readUser(req) {
  const raw = String(req.headers.get("cookie") || "")
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE}=`));
  if (!raw) return null;
  const value = raw.slice(COOKIE.length + 1);
  const parts = value.split(".");
  if (parts.length !== 3) return null;
  const [username, exp, mac] = parts;
  const expected = sign(`${username}.${exp}`);
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b) || Number(exp) < Date.now()) return null;
  return validUser(username) ? normUser(username) : null;
}

let pool;
function sql() {
  if (!process.env.DATABASE_URL) throw new Error("no-db");
  pool ??= new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
  return pool;
}

async function ensure() {
  const db = sql();
  await db.query(`
    create table if not exists staff_member (
      email text primary key,
      group_id text not null,
      status text not null default 'invited',
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )`);
  await db.query(`alter table staff_member add column if not exists username text`);
  await db.query(`alter table staff_member add column if not exists password_hash text`);
  await db.query(`
    create table if not exists plan_override (
      plan_id text primary key,
      unpublished boolean not null default false,
      monthly_fee double precision,
      free_months integer,
      contract_months integer,
      rebate double precision,
      perks_json jsonb,
      hot boolean,
      latest_offer boolean,
      new_intake_offer boolean,
      flash_offer boolean,
      offer_ends_at text,
      quote_pick boolean,
      ad_image_url text,
      updated_by text,
      updated_at timestamptz not null default now()
    )`);
      id text primary key,
      plan_id text not null,
      actor text not null,
      payload_json jsonb not null,
      status text not null default 'pending',
      created_at timestamptz not null default now(),
      executed_at timestamptz
    )`);
}

async function getMember(username) {
  const rows = await sql().query(
    `select email, username, password_hash, group_id, status
     from staff_member where lower(coalesce(username, email)) = $1 limit 1`,
    [username],
  );
  return rows.rows[0] || null;
}

function actorFrom(username, member) {
  const envUser = normUser(process.env.STAFF_DESK_USER || "");
  if (envUser && username === envUser) {
    return { username, role: "owner", groupId: "all", groupLabel: "站長", canEdit: true, status: "owner" };
  }
  if (member?.group_id === "owner" && member.status !== "disabled") {
    return { username, role: "owner", groupId: "all", groupLabel: "站長", canEdit: true, status: "owner" };
  }
  if (!member || member.status === "disabled") return null;
  return {
    username: (member.username || username).toLowerCase(),
    role: "editor",
    groupId: member.group_id,
    groupLabel: GROUPS[member.group_id] || member.group_id,
    canEdit: member.status === "active",
    status: member.status,
    providers: GROUP_PROVIDERS[member.group_id] || [],
  };
}

async function currentActor(req) {
  const username = readUser(req);
  if (!username) return null;
  const member = await getMember(username).catch(() => null);
  return actorFrom(username, member);
}

export default async function handler(req) {
  try {
    await ensure();
    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "";
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};

    if (action === "groups") return json({ groups: Object.entries(GROUPS).map(([id, label]) => ({ id, label })) });

    if (action === "register" && req.method === "POST") {
      const username = normUser(body.username);
      const password = String(body.password || "");
      const groupId = String(body.groupId || "");
      if (!validUser(username) || password.length < 4 || !GROUPS[groupId]) {
        return json({ ok: false, message: "用戶名、密碼或集團無效" });
      }
      if (await getMember(username)) return json({ ok: false, message: "呢個用戶名已經有人用" });
      await sql().query(
        `insert into staff_member (email, username, password_hash, group_id, status, updated_at)
         values ($1,$2,$3,$4,'invited', now())`,
        [`user:${username}`, username, await hashPassword(password), groupId],
      );
      return json({ ok: true }, 200, { "set-cookie": cookieHeader(username) });
    }

    if (action === "login" && req.method === "POST") {
      const username = normUser(body.username);
      const password = String(body.password || "");
      const envUser = normUser(process.env.STAFF_DESK_USER || "");
      const envPass = process.env.STAFF_DESK_PASSWORD || "";
      if (envUser && envPass && username === envUser && password === envPass) {
        return json({ ok: true }, 200, { "set-cookie": cookieHeader(username) });
      }
      const owners = (await sql().query(`select count(*)::int as n from staff_member where group_id='owner' or password_hash is not null`)).rows[0]?.n ?? 0;
      if (owners === 0) {
        await sql().query(
          `insert into staff_member (email, username, password_hash, group_id, status, updated_at)
           values ($1,$2,$3,'owner','active', now())`,
          [`user:${username}`, username, await hashPassword(password)],
        );
        return json({ ok: true, created: true }, 200, { "set-cookie": cookieHeader(username) });
      }
      const member = await getMember(username);
      if (!member?.password_hash || member.status === "disabled" || !(await verifyPassword(password, member.password_hash))) {
        return json({ ok: false, message: "用戶名或密碼唔啱" });
      }
      return json({ ok: true }, 200, { "set-cookie": cookieHeader(username) });
    }

    if (action === "logout") {
      return json({ ok: true }, 200, { "set-cookie": `${COOKIE}=; Path=/; Max-Age=0` });
    }

    const actor = await currentActor(req);
    if (!actor) return json({ ok: false, reason: "signin" });

    if (action === "me") {
      const members = actor.role === "owner"
        ? (await sql().query(`select email, username, group_id, status from staff_member where group_id <> 'owner' order by status desc, email`)).rows.map((row) => ({
            email: row.email,
            username: (row.username || row.email.replace(/^user:/, "")).toLowerCase(),
            groupId: row.group_id,
            groupLabel: GROUPS[row.group_id] || row.group_id,
            status: row.status,
          }))
        : [];
      const pending = actor.role === "owner"
        ? (await sql().query(`select id, plan_id, actor, payload_json, created_at::text from staff_plan_change where status='pending' order by created_at desc limit 80`)).rows.map((row) => ({
            id: row.id,
            planId: row.plan_id,
            actor: row.actor,
            payload: row.payload_json,
            createdAt: row.created_at,
          }))
        : [];
      return json({ ok: true, actor, members, pending, groups: Object.entries(GROUPS).map(([id, label]) => ({ id, label })) });
    }

    if (action === "submit" && req.method === "POST") {
      if (!actor.canEdit && actor.role !== "owner") return json({ ok: false, message: "帳號未批准，暫時唔可以改計劃" });
      const id = `chg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
      await sql().query(
        `insert into staff_plan_change (id, plan_id, actor, payload_json, status, created_at)
         values ($1,$2,$3,$4::jsonb,'pending', now())`,
        [id, String(body.planId || ""), actor.username, JSON.stringify(body)],
      );
      return json({ ok: true, queued: true });
    }

    if (action === "execute" && req.method === "POST") {
      if (actor.role !== "owner") return json({ ok: false, message: "只有站長可以上架" });
      const change = (await sql().query(`select * from staff_plan_change where id=$1 limit 1`, [body.changeId])).rows[0];
      if (!change || change.status !== "pending") return json({ ok: false, message: "呢項已經唔喺待執行" });
      const p = change.payload_json || {};
      await sql().query(
        `insert into plan_override (
           plan_id, unpublished, monthly_fee, free_months, contract_months, rebate, perks_json,
           hot, latest_offer, new_intake_offer, flash_offer, offer_ends_at, quote_pick, ad_image_url, updated_by, updated_at
         ) values ($1,$2,$3,$4,$5,$6,$7::jsonb,$8,$9,$10,$11,$12,$13,$14,$15,now())
         on conflict (plan_id) do update set
           unpublished=excluded.unpublished, monthly_fee=excluded.monthly_fee, free_months=excluded.free_months,
           contract_months=excluded.contract_months, rebate=excluded.rebate, perks_json=excluded.perks_json,
           hot=excluded.hot, latest_offer=excluded.latest_offer, new_intake_offer=excluded.new_intake_offer,
           flash_offer=excluded.flash_offer, offer_ends_at=excluded.offer_ends_at, quote_pick=excluded.quote_pick,
           ad_image_url=excluded.ad_image_url, updated_by=excluded.updated_by, updated_at=now()`,
        [
          change.plan_id,
          Boolean(p.unpublished),
          Number(p.monthlyFee),
          Number(p.freeMonths),
          Number(p.contractMonths),
          p.rebate == null ? null : Number(p.rebate),
          JSON.stringify(Array.isArray(p.perks) ? p.perks : []),
          Boolean(p.hot),
          Boolean(p.latestOffer),
          Boolean(p.newIntakeOffer),
          Boolean(p.flashOffer),
          p.offerEndsAt || null,
          Boolean(p.quotePick),
          p.adImageUrl || null,
          actor.username,
        ],
      );
      await sql().query(`update staff_plan_change set status='executed', executed_at=now() where id=$1`, [change.id]);
      return json({ ok: true });
    }

    if (action === "approve" && req.method === "POST") {
      if (actor.role !== "owner") return json({ ok: false, message: "只有站長可以批准" });
      await sql().query(`update staff_member set status=$2, updated_at=now() where email=$1`, [body.email, body.status || "active"]);
      return json({ ok: true });
    }

    return json({ ok: false, message: "未知動作" }, 404);
  } catch (err) {
    console.error("[office]", err);
    return json({ ok: false, message: "伺服器暫時未能處理" }, 500);
  }
}

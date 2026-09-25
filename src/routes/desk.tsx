import { useEffect, useMemo, useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PlanCard } from "@/components/plan-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signIn, signOut, authEnabled } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { PROVIDER_MAP, type Category } from "@/lib/plans";
import { usePageTitle } from "@/lib/i18n";
import { CATEGORY_OPTIONS, SITE } from "@/lib/site";
import {
  inviteStaffMember,
  loadStaffDesk,
  saveStaffPlan,
  setStaffMemberStatus,
  type StaffActor,
  type StaffDeskPlan,
  type StaffMemberRow,
} from "@/lib/staff-ask";
import { STAFF_GROUPS, type StaffGroupId, type StaffStatus } from "@/lib/staff-groups";

export const Route = createFileRoute("/desk")({
  component: StaffDeskPage,
  head: () => ({
    meta: [
      { title: `計劃後台 · ${SITE.name}` },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});

type DeskState =
  | { phase: "loading" }
  | { phase: "signin" }
  | { phase: "forbidden"; reason: "forbidden" | "owner_email" }
  | {
      phase: "ready";
      actor: StaffActor;
      plans: StaffDeskPlan[];
      members: StaffMemberRow[];
    };

function StaffDeskPage() {
  usePageTitle(`計劃後台 · ${SITE.name}`);
  const { user, isPending } = useCurrentUserState();
  const [desk, setDesk] = useState<DeskState>({ phase: "loading" });
  const [tab, setTab] = useState<"plans" | "people">("plans");
  const [cat, setCat] = useState<Category | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteGroup, setInviteGroup] = useState<StaffGroupId>("hkt");

  async function refresh() {
    const result = await loadStaffDesk();
    if (!result.ok) {
      setDesk({
        phase: result.reason === "signin" ? "signin" : "forbidden",
        ...(result.reason === "signin" ? {} : { reason: result.reason }),
      } as DeskState);
      return;
    }
    setDesk({
      phase: "ready",
      actor: result.actor,
      plans: result.plans,
      members: result.members,
    });
  }

  useEffect(() => {
    if (isPending) return;
    void refresh().catch(() => setDesk({ phase: "signin" }));
  }, [isPending, user?.primaryEmail]);

  const selected = desk.phase === "ready" ? desk.plans.find((plan) => plan.id === selectedId) : undefined;
  const visible = useMemo(() => {
    if (desk.phase !== "ready") return [];
    return desk.plans.filter((plan) => cat === "all" || plan.category === cat);
  }, [desk, cat]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-xs font-medium tracking-wider text-subtle">STAFF · NOINDEX</p>
      <h1 className="mt-2 text-title font-semibold">已上架計劃後台</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
        同事用自己嘅 Google 帳登入。只可以改自己集團嘅計劃卡、廣告圖同現有標籤。排序同卡面跟網站。齊Quote 精選得站長加。
      </p>

      {desk.phase === "loading" || isPending ? <p className="mt-8 text-sm text-muted">載入中…</p> : null}

      {desk.phase === "signin" ? (
        <div className="mt-8 max-w-sm space-y-3 rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
          <p className="text-sm text-muted">用 Google 登入先至入到後台。</p>
          {authEnabled ? (
            <Button type="button" onClick={() => void signIn("grok-google", { callbackURL: "/desk" })}>
              用 Google 登入
            </Button>
          ) : (
            <p className="text-sm text-hot">而家網站未開登入（VITE_AUTH_ENABLED=false），開咗 Google 登入先用到呢頁。</p>
          )}
        </div>
      ) : null}

      {desk.phase === "forbidden" ? (
        <p className="mt-8 text-sm text-hot">
          {desk.reason === "owner_email"
            ? "未設定站長。請喺 Vercel 加環境變數 STAFF_OWNER_EMAIL（你嘅 Google 電郵）。"
            : "呢個 Google 帳未獲授權，或者已被停用。"}
        </p>
      ) : null}

      {desk.phase === "ready" ? (
        <>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
            <span className="rounded-full bg-surface px-3 py-1">{desk.actor.email}</span>
            <span className="text-muted">{desk.actor.groupLabel}</span>
            <button type="button" className="text-muted underline-offset-4 hover:underline" onClick={() => void signOut()}>
              登出
            </button>
          </div>
          <div className="mt-6 flex gap-2">
            <Button type="button" variant={tab === "plans" ? "default" : "outline"} onClick={() => setTab("plans")}>
              計劃卡
            </Button>
            {desk.actor.role === "owner" ? (
              <Button type="button" variant={tab === "people" ? "default" : "outline"} onClick={() => setTab("people")}>
                畫權
              </Button>
            ) : null}
          </div>

          {tab === "plans" ? (
            <section className="mt-6">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className={`rounded-full px-3 py-1 text-sm ${cat === "all" ? "bg-fg text-white" : "bg-surface"}`}
                  onClick={() => setCat("all")}
                >
                  全部 {desk.plans.length}
                </button>
                {CATEGORY_OPTIONS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`rounded-full px-3 py-1 text-sm ${cat === item.id ? "bg-fg text-white" : "bg-surface"}`}
                    onClick={() => setCat(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-sm text-muted">一次過睇自己集團已上架卡。撳卡就改月費、標籤、圖。</p>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div className="space-y-3">
                  {visible.map((plan) => (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => {
                        setSelectedId(plan.id);
                        setNotice("");
                      }}
                      className={`block w-full text-left ${selectedId === plan.id ? "ring-2 ring-ring rounded-xl" : ""}`}
                    >
                      <PlanCard plan={plan} />
                      {plan.unpublished ? <p className="px-2 pt-1 text-xs text-hot">已下架（公開頁睇唔到）</p> : null}
                    </button>
                  ))}
                </div>
                <div>
                  {selected ? (
                    <PlanEditor
                      key={selected.id}
                      plan={selected}
                      canQuotePick={desk.actor.role === "owner"}
                      onSaved={async () => {
                        setNotice("已儲存，公開頁會用新月費同標籤。");
                        await refresh();
                      }}
                    />
                  ) : (
                    <p className="rounded-xl bg-card p-5 text-sm text-muted shadow-[var(--shadow-border)]">揀左邊一張卡開始改。</p>
                  )}
                  {notice ? <p className="mt-3 text-sm">{notice}</p> : null}
                </div>
              </div>
            </section>
          ) : (
            <section className="mt-6 max-w-xl space-y-4">
              <form
                className="space-y-3 rounded-xl bg-card p-4 shadow-[var(--shadow-border)]"
                onSubmit={(event) => {
                  event.preventDefault();
                  void inviteStaffMember({ data: { email: inviteEmail, groupId: inviteGroup } }).then(async (result) => {
                    if (!result.ok) {
                      setNotice(("message" in result && result.message) || "加唔到呢個同事");
                      return;
                    }
                    setInviteEmail("");
                    setNotice("已加入。同事用同一個 Google 電郵打開 /staff 就得。");
                    await refresh();
                  });
                }}
              >
                <label className="block text-sm font-medium">
                  同事 Google 電郵
                  <Input className="mt-1" value={inviteEmail} onChange={(event) => setInviteEmail(event.target.value)} placeholder="name@company.com" />
                </label>
                <label className="block text-sm font-medium">
                  集團
                  <select
                    className="mt-1 flex h-11 w-full rounded-md bg-bg px-3 text-base shadow-[var(--shadow-border)]"
                    value={inviteGroup}
                    onChange={(event) => setInviteGroup(event.target.value as StaffGroupId)}
                  >
                    {STAFF_GROUPS.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.label}
                      </option>
                    ))}
                  </select>
                </label>
                <Button type="submit">加入同事</Button>
              </form>
              <ul className="space-y-2">
                {desk.members.map((member) => (
                  <li key={member.email} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-card px-4 py-3 text-sm shadow-[var(--shadow-border)]">
                    <span>
                      {member.email}
                      <span className="ml-2 text-muted">{STAFF_GROUPS.find((group) => group.id === member.groupId)?.label}</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="text-muted">{member.status === "active" ? "已啟用" : member.status === "disabled" ? "已停用" : "未登入"}</span>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const next: StaffStatus = member.status === "disabled" ? "invited" : "disabled";
                          void setStaffMemberStatus({ data: { email: member.email, status: next } }).then(() => refresh());
                        }}
                      >
                        {member.status === "disabled" ? "啟用" : "停用"}
                      </Button>
                    </span>
                  </li>
                ))}
              </ul>
              {notice ? <p className="text-sm">{notice}</p> : null}
            </section>
          )}
        </>
      ) : null}

      <p className="mt-10 text-sm text-muted">
        <Link to="/" className="underline-offset-4 hover:underline">
          返主頁
        </Link>
      </p>
    </div>
  );
}

function PlanEditor({
  plan,
  canQuotePick,
  onSaved,
}: {
  plan: StaffDeskPlan;
  canQuotePick: boolean;
  onSaved: () => Promise<void>;
}) {
  const provider = PROVIDER_MAP[plan.providerId];
  const [monthlyFee, setMonthlyFee] = useState(String(plan.monthlyFee));
  const [freeMonths, setFreeMonths] = useState(String(plan.freeMonths));
  const [contractMonths, setContractMonths] = useState(String(plan.contractMonths));
  const [rebate, setRebate] = useState(plan.rebate != null ? String(plan.rebate) : "");
  const [perks, setPerks] = useState(plan.perks.join("\n"));
  const [hot, setHot] = useState(Boolean(plan.hot));
  const [latestOffer, setLatestOffer] = useState(Boolean(plan.latestOffer));
  const [newIntakeOffer, setNewIntakeOffer] = useState(Boolean(plan.newIntakeOffer));
  const [flashOffer, setFlashOffer] = useState(Boolean(plan.flashOffer));
  const [offerEndsAt, setOfferEndsAt] = useState(plan.offerEndsAt ? plan.offerEndsAt.slice(0, 16) : "");
  const [quotePick, setQuotePick] = useState(Boolean(plan.quotePick));
  const [unpublished, setUnpublished] = useState(Boolean(plan.unpublished));
  const [adImageUrl, setAdImageUrl] = useState(plan.adImageUrl ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const ends = offerEndsAt.trim()
        ? new Date(offerEndsAt).toISOString()
        : null;
      const result = await saveStaffPlan({
        data: {
          planId: plan.id,
          unpublished,
          monthlyFee: Number(monthlyFee),
          freeMonths: Number(freeMonths),
          contractMonths: Number(contractMonths),
          rebate: rebate.trim() ? Number(rebate) : null,
          perks: perks.split("\n"),
          hot,
          latestOffer,
          newIntakeOffer,
          flashOffer,
          offerEndsAt: ends,
          quotePick,
          adImageUrl: adImageUrl.trim() || null,
        },
      });
      if (!result.ok) {
        setError(("message" in result && result.message) || "儲存失敗");
        return;
      }
      await onSaved();
    } catch {
      setError("儲存失敗");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="space-y-3 rounded-xl bg-card p-4 shadow-[var(--shadow-border)]" onSubmit={(event) => void onSubmit(event)}>
      <p className="text-sm font-medium">
        {provider.name} · {plan.name}
      </p>
      <label className="block text-sm">
        月費
        <Input className="mt-1" inputMode="decimal" value={monthlyFee} onChange={(event) => setMonthlyFee(event.target.value)} />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm">
          免租月
          <Input className="mt-1" inputMode="numeric" value={freeMonths} onChange={(event) => setFreeMonths(event.target.value)} />
        </label>
        <label className="block text-sm">
          合約月
          <Input className="mt-1" inputMode="numeric" value={contractMonths} onChange={(event) => setContractMonths(event.target.value)} />
        </label>
      </div>
      <label className="block text-sm">
        回贈（可空）
        <Input className="mt-1" inputMode="decimal" value={rebate} onChange={(event) => setRebate(event.target.value)} />
      </label>
      <label className="block text-sm">
        優惠（一行一項）
        <textarea
          className="mt-1 min-h-28 w-full rounded-md bg-bg px-3 py-2 text-base shadow-[var(--shadow-border)]"
          value={perks}
          onChange={(event) => setPerks(event.target.value)}
        />
      </label>
      <label className="block text-sm">
        廣告圖網址（可空）
        <Input className="mt-1" value={adImageUrl} onChange={(event) => setAdImageUrl(event.target.value)} placeholder="https://" />
      </label>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={hot} onChange={(event) => setHot(event.target.checked)} /> 熱門
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={latestOffer} onChange={(event) => setLatestOffer(event.target.checked)} /> 最新優惠
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={newIntakeOffer} onChange={(event) => setNewIntakeOffer(event.target.checked)} /> 新入伙
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={flashOffer} onChange={(event) => setFlashOffer(event.target.checked)} /> 限時快閃
        </label>
        {canQuotePick ? (
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={quotePick} onChange={(event) => setQuotePick(event.target.checked)} /> 齊Quote 精選
          </label>
        ) : (
          <p className="col-span-2 text-xs text-muted">齊Quote 精選得站長可以加。</p>
        )}
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={unpublished} onChange={(event) => setUnpublished(event.target.checked)} /> 下架
        </label>
      </div>
      <label className="block text-sm">
        限時完結
        <Input className="mt-1" type="datetime-local" value={offerEndsAt} onChange={(event) => setOfferEndsAt(event.target.value)} />
      </label>
      {error ? <p className="text-sm text-hot">{error}</p> : null}
      <Button type="submit" disabled={busy}>
        {busy ? "儲存緊…" : "儲存呢張卡"}
      </Button>
    </form>
  );
}

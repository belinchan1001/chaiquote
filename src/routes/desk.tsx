import { useEffect, useMemo, useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PlanCard } from "@/components/plan-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PROVIDER_MAP, type Category } from "@/lib/plans";
import { usePageTitle } from "@/lib/i18n";
import { CATEGORY_OPTIONS, SITE } from "@/lib/site";
import {
  addDeskAccount,
  executeStaffChange,
  loadStaffDesk,
  saveStaffPlan,
  setStaffMemberStatus,
  signInDesk,
  signOutDesk,
  type StaffActor,
  type StaffDeskPlan,
  type StaffMemberRow,
  type StaffPlanChangeRow,
} from "@/lib/staff-ask";
import { STAFF_GROUPS, type StaffGroupId, type StaffStatus } from "@/lib/staff-groups";

export const Route = createFileRoute("/desk")({
  component: StaffDeskPage,
  head: () => ({
    meta: [
      { title: `站長程式 · ${SITE.name}` },
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
      pending: StaffPlanChangeRow[];
    };

function StaffDeskPage() {
  usePageTitle(`站長程式 · ${SITE.name}`);
  const [desk, setDesk] = useState<DeskState>({ phase: "loading" });
  const [tab, setTab] = useState<"plans" | "queue" | "people">("queue");
  const [cat, setCat] = useState<Category | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [setupNeeded, setSetupNeeded] = useState(false);
  const [inviteUser, setInviteUser] = useState("");
  const [invitePass, setInvitePass] = useState("");
  const [inviteGroup, setInviteGroup] = useState<StaffGroupId>("hkt");

  async function refresh() {
    const result = (await loadStaffDesk()) as {
      ok?: boolean;
      reason?: "signin" | "forbidden" | "owner_email";
      setupNeeded?: boolean;
      actor?: StaffActor;
      plans?: StaffDeskPlan[];
      members?: StaffMemberRow[];
      pending?: StaffPlanChangeRow[];
      created?: boolean;
      message?: string;
    };
    setSetupNeeded(Boolean("setupNeeded" in result && result.setupNeeded));
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
      pending: result.pending ?? [],
    });
    if ((result.pending ?? []).length && result.actor.role === "owner") setTab((cur) => (cur === "people" ? cur : "queue"));
  }

  useEffect(() => {
    void refresh().catch(() => setDesk({ phase: "signin" }));
  }, []);

  const selected = desk.phase === "ready" ? desk.plans.find((plan) => plan.id === selectedId) : undefined;
  const visible = useMemo(() => {
    if (desk.phase !== "ready") return [];
    return desk.plans.filter((plan) => cat === "all" || plan.category === cat);
  }, [desk, cat]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-xs font-medium tracking-wider text-subtle">STAFF · NOINDEX</p>
      <h1 className="mt-2 text-title font-semibold">站長審批程式</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
        呢個係你嘅程式：睇銷售員提交、確認冇問題，再執行上齊Quote 網站。銷售員用另一條 /sales。
      </p>

      {desk.phase === "loading" ? <p className="mt-8 text-sm text-muted">載入中…</p> : null}

      {desk.phase === "signin" ? (
        <form
          className="mt-8 max-w-sm space-y-3 rounded-xl bg-card p-5 shadow-[var(--shadow-border)]"
          onSubmit={(event) => {
            event.preventDefault();
            void signInDesk({ data: { username, password } }).then(async (result) => {
              if (!result.ok) {
                setNotice(("message" in result && result.message) || "登入失敗");
                return;
              }
              setPassword("");
              setNotice(result.created ? "已開站長帳，而家可以改計劃。" : "");
              await refresh();
            });
          }}
        >
          <p className="text-sm text-muted">
            {setupNeeded ? "第一次用：輸入你要嘅用戶名同密碼，就會開成站長帳。" : "輸入用戶名同密碼。"}
          </p>
          <label className="block text-sm">
            用戶名
            <Input className="mt-1" autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} />
          </label>
          <label className="block text-sm">
            密碼
            <Input className="mt-1" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          {notice ? <p className="text-sm text-hot">{notice}</p> : null}
          <Button type="submit">{setupNeeded ? "開站長帳並進入" : "登入"}</Button>
        </form>
      ) : null}

      {desk.phase === "forbidden" ? (
        <p className="mt-8 text-sm text-hot">呢個帳號未獲授權，或者已被停用。</p>
      ) : null}

      {desk.phase === "ready" ? (
        <>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
            <span className="rounded-full bg-surface px-3 py-1">{desk.actor.email}</span>
            <span className="text-muted">{desk.actor.groupLabel}</span>
            <button type="button" className="text-muted underline-offset-4 hover:underline" onClick={() => void signOutDesk().then(() => refresh())}>
              登出
            </button>
          </div>
          <div className="mt-6 flex gap-2">
            <Button type="button" variant={tab === "plans" ? "default" : "outline"} onClick={() => setTab("plans")}>
              計劃卡
            </Button>
            {desk.actor.role === "owner" ? (
              <Button type="button" variant={tab === "queue" ? "default" : "outline"} onClick={() => setTab("queue")}>
                待執行 {desk.pending.length ? desk.pending.length : ""}
              </Button>
            ) : null}
            {desk.actor.role === "owner" ? (
              <Button type="button" variant={tab === "people" ? "default" : "outline"} onClick={() => setTab("people")}>
                帳號 {desk.members.filter((member) => member.status === "invited").length || ""}
              </Button>
            ) : null}
          </div>

          {tab === "queue" && desk.actor.role === "owner" ? (
            <section className="mt-6 max-w-xl space-y-3">
              {desk.pending.length === 0 ? <p className="text-sm text-muted">而家冇待執行項目。</p> : null}
              {desk.pending.map((item) => {
                const plan = desk.plans.find((row) => row.id === item.planId);
                return (
                  <div key={item.id} className="rounded-xl bg-card p-4 text-sm shadow-[var(--shadow-border)]">
                    <p className="font-medium">{plan ? `${plan.name}` : item.planId}</p>
                    <p className="mt-1 text-muted">由 {item.actor} 提交 · 月費 {String(item.payload.monthlyFee ?? "—")}</p>
                    <Button
                      className="mt-3"
                      type="button"
                      onClick={() => {
                        void executeStaffChange({ data: { changeId: item.id } }).then(async (result) => {
                          if (!result.ok) {
                            setNotice(("message" in result && result.message) || "執行失敗");
                            return;
                          }
                          setNotice("已上架。公開頁而家用新月費。");
                          await refresh();
                        });
                      }}
                    >
                      執行上架
                    </Button>
                  </div>
                );
              })}
              {notice ? <p className="text-sm">{notice}</p> : null}
            </section>
          ) : tab === "plans" ? (
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
                        setNotice("已排入待執行。去「待執行」睇完再上架。");
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
                  void addDeskAccount({ data: { username: inviteUser, password: invitePass, groupId: inviteGroup } }).then(async (result) => {
                    if (!result.ok) {
                      setNotice(("message" in result && result.message) || "加唔到呢個同事");
                      return;
                    }
                    setInviteUser("");
                    setInvitePass("");
                    setNotice("已加入。同事用呢個用戶名密碼打開 /desk。");
                    await refresh();
                  });
                }}
              >
                <label className="block text-sm font-medium">
                  同事用戶名
                  <Input className="mt-1" value={inviteUser} onChange={(event) => setInviteUser(event.target.value)} placeholder="username" />
                </label>
                <label className="block text-sm font-medium">
                  同事密碼
                  <Input className="mt-1" type="password" value={invitePass} onChange={(event) => setInvitePass(event.target.value)} />
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
                      {member.username || member.email}
                      <span className="ml-2 text-muted">{STAFF_GROUPS.find((group) => group.id === member.groupId)?.label}</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="text-muted">
                        {member.status === "active" ? "已批准" : member.status === "disabled" ? "已停用" : "待批准"}
                      </span>
                      {member.status === "invited" ? (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => {
                            void setStaffMemberStatus({ data: { email: member.email, status: "active" } }).then(() => {
                              setNotice(`已批准 ${member.username || member.email}，而家可以改計劃。`);
                              void refresh();
                            });
                          }}
                        >
                          批准
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const next: StaffStatus = member.status === "disabled" ? "active" : "disabled";
                            void setStaffMemberStatus({ data: { email: member.email, status: next } }).then(() => refresh());
                          }}
                        >
                          {member.status === "disabled" ? "恢復" : "停用"}
                        </Button>
                      )}
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
        {busy ? "提交緊…" : "提交待執行"}
      </Button>
    </form>
  );
}

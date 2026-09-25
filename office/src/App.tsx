import { useEffect, useMemo, useState, type FormEvent } from "react";

type Group = { id: string; label: string };
type Plan = {
  id: string;
  providerId: string;
  providerName: string;
  category: string;
  name: string;
  monthlyFee: number;
  freeMonths: number;
  contractMonths: number;
  rebate: number | null;
  perks: string[];
  hot: boolean;
  latestOffer: boolean;
  newIntakeOffer: boolean;
  flashOffer: boolean;
  quotePick: boolean;
  offerEndsAt: string | null;
  unpublished: boolean;
  adImageUrl: string | null;
};
type Actor = { username: string; role: "owner" | "editor"; groupLabel: string; canEdit: boolean; status: string; providers?: string[] };
type Member = { email: string; username: string; groupId: string; groupLabel: string; status: string };
type Change = { id: string; planId: string; actor: string; payload: Record<string, unknown>; createdAt: string };

const CATALOG = "https://www.chaiquote.hk/catalog.json";

async function api(action: string, body?: Record<string, unknown>) {
  const res = await fetch(`/api/office?action=${action}`, {
    method: body ? "POST" : "GET",
    headers: body ? { "content-type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });
  return res.json();
}

export function App() {
  const path = window.location.pathname;
  if (path.startsWith("/register")) return <RegisterPage />;
  return <HomePage />;
}

function shell(title: string, children: React.ReactNode) {
  return (
    <div style={{ maxWidth: 920, margin: "0 auto", padding: "28px 16px 64px" }}>
      <p style={{ fontSize: 12, letterSpacing: 1.4, color: "#5b6b80" }}>CHAQUOTE OFFICE</p>
      <h1 style={{ margin: "8px 0 0", fontSize: 28 }}>{title}</h1>
      {children}
    </div>
  );
}

function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [groupId, setGroupId] = useState("hkbn");
  const [groups, setGroups] = useState<Group[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    void api("groups").then((data) => setGroups(data.groups || []));
  }, []);
  return shell(
    "銷售員首次註冊",
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (password !== confirm) return setError("兩次密碼唔一致");
        void api("register", { username, password, groupId }).then((data) => {
          if (!data.ok) return setError(data.message || "註冊失敗");
          window.location.href = "/";
        });
      }}
      style={card}
    >
      <p style={muted}>交表後要等站長批准，先可以改計劃。呢度唔經齊Quote 主站。</p>
      <Field label="用戶名" value={username} onChange={setUsername} />
      <Field label="密碼" value={password} onChange={setPassword} type="password" />
      <Field label="再輸入密碼" value={confirm} onChange={setConfirm} type="password" />
      <label style={label}>
        所屬集團
        <select style={input} value={groupId} onChange={(event) => setGroupId(event.target.value)}>
          {groups.map((group) => (
            <option key={group.id} value={group.id}>{group.label}</option>
          ))}
        </select>
      </label>
      {error ? <p style={{ color: "#c81e1e" }}>{error}</p> : null}
      <button style={btn} type="submit">註冊並等候批准</button>
      <p><a href="/">已有帳？返登入</a></p>
    </form>,
  );
}

function HomePage() {
  const [phase, setPhase] = useState<"loading" | "signin" | "ready">("loading");
  const [actor, setActor] = useState<Actor | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [pending, setPending] = useState<Change[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [tab, setTab] = useState<"plans" | "queue" | "people">("plans");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState("");
  const [selected, setSelected] = useState<Plan | null>(null);

  async function refresh() {
    const me = await api("me");
    if (!me.ok) {
      setPhase("signin");
      return;
    }
    setActor(me.actor);
    setMembers(me.members || []);
    setPending(me.pending || []);
    const catalog = await fetch(CATALOG).then((res) => res.json());
    const all: Plan[] = catalog.plans || [];
    const visible = me.actor.role === "owner" ? all : all.filter((plan) => (me.actor.providers || []).includes(plan.providerId));
    setPlans(visible);
    setPhase("ready");
    if (me.actor.role === "owner" && (me.pending || []).length) setTab("queue");
  }

  useEffect(() => {
    void refresh();
  }, []);

  const waiting = actor?.role === "editor" && !actor.canEdit;

  if (phase === "loading") return shell("載入中…", <p style={muted}>請稍等</p>);
  if (phase === "signin") {
    return shell(
      actor?.role === "owner" ? "站長程式" : "作業台登入",
      <form
        style={card}
        onSubmit={(event: FormEvent) => {
          event.preventDefault();
          void api("login", { username, password }).then((data) => {
            if (!data.ok) return setNotice(data.message || "登入失敗");
            setNotice(data.created ? "已開站長帳" : "");
            void refresh();
          });
        }}
      >
        <p style={muted}>銷售員同站長都喺呢個獨立程式登入，唔經 www.chaiquote.hk 主站。</p>
        <Field label="用戶名" value={username} onChange={setUsername} />
        <Field label="密碼" value={password} onChange={setPassword} type="password" />
        {notice ? <p style={{ color: "#c81e1e" }}>{notice}</p> : null}
        <button style={btn} type="submit">登入</button>
        <p><a href="/register">第一次用？去註冊</a></p>
      </form>,
    );
  }

  return shell(actor?.role === "owner" ? "站長審批程式" : "銷售員程式", (
    <>
      <p style={muted}>{actor?.username} · {actor?.groupLabel}</p>
      <p><button type="button" onClick={() => void api("logout").then(() => window.location.reload())}>登出</button></p>
      {waiting ? (
        <div style={card}>
          <p>已註冊，等站長批准。批准之後先可以改計劃。</p>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", gap: 8, margin: "16px 0" }}>
            <button type="button" style={tab === "plans" ? btn : btnGhost} onClick={() => setTab("plans")}>計劃卡</button>
            {actor?.role === "owner" ? (
              <button type="button" style={tab === "queue" ? btn : btnGhost} onClick={() => setTab("queue")}>
                待執行 {pending.length || ""}
              </button>
            ) : null}
            {actor?.role === "owner" ? (
              <button type="button" style={tab === "people" ? btn : btnGhost} onClick={() => setTab("people")}>
                帳號 {members.filter((m) => m.status === "invited").length || ""}
              </button>
            ) : null}
          </div>
          {tab === "queue" ? (
            <div>
              {pending.length === 0 ? <p style={muted}>而家冇待執行項目。</p> : null}
              {pending.map((item) => {
                const plan = plans.find((row) => row.id === item.planId);
                return (
                  <div key={item.id} style={card}>
                    <p><b>{plan?.name || item.planId}</b></p>
                    <p style={muted}>由 {item.actor} · 月費 {String(item.payload.monthlyFee ?? "—")}</p>
                    <button
                      style={btn}
                      type="button"
                      onClick={() => void api("execute", { changeId: item.id }).then(() => refresh())}
                    >
                      執行上架到齊Quote
                    </button>
                  </div>
                );
              })}
            </div>
          ) : null}
          {tab === "people" ? (
            <div>
              {members.map((member) => (
                <div key={member.email} style={card}>
                  <p><b>{member.username}</b> · {member.groupLabel}</p>
                  <p style={muted}>{member.status === "invited" ? "待批准" : member.status === "active" ? "已批准" : "已停用"}</p>
                  {member.status === "invited" ? (
                    <button style={btn} type="button" onClick={() => void api("approve", { email: member.email, status: "active" }).then(() => refresh())}>批准</button>
                  ) : (
                    <button style={btnGhost} type="button" onClick={() => void api("approve", { email: member.email, status: member.status === "disabled" ? "active" : "disabled" }).then(() => refresh())}>
                      {member.status === "disabled" ? "恢復" : "停用"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : null}
          {tab === "plans" ? <PlanList plans={plans} selected={selected} onPick={setSelected} actor={actor} onSaved={() => { setNotice("已排入待執行"); void refresh(); }} /> : null}
          {notice ? <p>{notice}</p> : null}
        </>
      )}
    </>
  ));
}

function PlanList({
  plans,
  selected,
  onPick,
  actor,
  onSaved,
}: {
  plans: Plan[];
  selected: Plan | null;
  onPick: (plan: Plan) => void;
  actor: Actor | null;
  onSaved: () => void;
}) {
  const [cat, setCat] = useState("all");
  const visible = useMemo(() => plans.filter((plan) => cat === "all" || plan.category === cat), [plans, cat]);
  return (
    <div style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr" }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {["all", "broadband", "home5g", "mobile", "business"].map((id) => (
          <button key={id} type="button" style={cat === id ? btn : btnGhost} onClick={() => setCat(id)}>
            {id}
          </button>
        ))}
      </div>
      {visible.map((plan) => (
        <button key={plan.id} type="button" onClick={() => onPick(plan)} style={{ ...card, textAlign: "left", width: "100%" }}>
          <b>{plan.providerName}</b> · {plan.name} · ${plan.monthlyFee}
        </button>
      ))}
      {selected ? <Editor plan={selected} canQuotePick={actor?.role === "owner"} onSaved={onSaved} /> : null}
    </div>
  );
}

function Editor({ plan, canQuotePick, onSaved }: { plan: Plan; canQuotePick: boolean; onSaved: () => void }) {
  const [monthlyFee, setMonthlyFee] = useState(String(plan.monthlyFee));
  const [freeMonths, setFreeMonths] = useState(String(plan.freeMonths));
  const [contractMonths, setContractMonths] = useState(String(plan.contractMonths));
  const [rebate, setRebate] = useState(plan.rebate == null ? "" : String(plan.rebate));
  const [perks, setPerks] = useState(plan.perks.join("\n"));
  const [hot, setHot] = useState(plan.hot);
  const [latestOffer, setLatestOffer] = useState(plan.latestOffer);
  const [newIntakeOffer, setNewIntakeOffer] = useState(plan.newIntakeOffer);
  const [flashOffer, setFlashOffer] = useState(plan.flashOffer);
  const [quotePick, setQuotePick] = useState(plan.quotePick);
  const [unpublished, setUnpublished] = useState(plan.unpublished);
  const [adImageUrl, setAdImageUrl] = useState(plan.adImageUrl || "");
  return (
    <form
      style={card}
      onSubmit={(event) => {
        event.preventDefault();
        void api("submit", {
          planId: plan.id,
          monthlyFee: Number(monthlyFee),
          freeMonths: Number(freeMonths),
          contractMonths: Number(contractMonths),
          rebate: rebate ? Number(rebate) : null,
          perks: perks.split("\n"),
          hot,
          latestOffer,
          newIntakeOffer,
          flashOffer,
          quotePick: canQuotePick && quotePick,
          unpublished,
          adImageUrl: adImageUrl || null,
          offerEndsAt: null,
        }).then((data) => {
          if (data.ok) onSaved();
        });
      }}
    >
      <p><b>{plan.providerName} · {plan.name}</b></p>
      <Field label="月費" value={monthlyFee} onChange={setMonthlyFee} />
      <Field label="免租月" value={freeMonths} onChange={setFreeMonths} />
      <Field label="合約月" value={contractMonths} onChange={setContractMonths} />
      <Field label="回贈" value={rebate} onChange={setRebate} />
      <label style={label}>優惠<textarea style={{ ...input, minHeight: 90 }} value={perks} onChange={(event) => setPerks(event.target.value)} /></label>
      <Field label="廣告圖網址" value={adImageUrl} onChange={setAdImageUrl} />
      <label><input type="checkbox" checked={hot} onChange={(event) => setHot(event.target.checked)} /> 熱門</label>
      <label><input type="checkbox" checked={latestOffer} onChange={(event) => setLatestOffer(event.target.checked)} /> 最新優惠</label>
      <label><input type="checkbox" checked={newIntakeOffer} onChange={(event) => setNewIntakeOffer(event.target.checked)} /> 新入伙</label>
      <label><input type="checkbox" checked={flashOffer} onChange={(event) => setFlashOffer(event.target.checked)} /> 限時快閃</label>
      {canQuotePick ? <label><input type="checkbox" checked={quotePick} onChange={(event) => setQuotePick(event.target.checked)} /> 齊Quote 精選</label> : null}
      <label><input type="checkbox" checked={unpublished} onChange={(event) => setUnpublished(event.target.checked)} /> 下架</label>
      <div><button style={btn} type="submit">提交待執行</button></div>
    </form>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label style={label}>
      {label}
      <input style={input} type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

const card: React.CSSProperties = { background: "#fff", borderRadius: 16, padding: 16, boxShadow: "0 0 0 1px #d7e3f4", marginTop: 12 };
const muted: React.CSSProperties = { color: "#5b6b80", lineHeight: 1.5 };
const label: React.CSSProperties = { display: "block", fontSize: 14, marginTop: 10 };
const input: React.CSSProperties = { display: "block", width: "100%", marginTop: 6, padding: "10px 12px", borderRadius: 10, border: "1px solid #c9d7ea", fontSize: 16 };
const btn: React.CSSProperties = { background: "#1557c4", color: "#fff", border: 0, borderRadius: 999, padding: "10px 16px", fontSize: 15 };
const btnGhost: React.CSSProperties = { ...btn, background: "#e8f0fb", color: "#10233f" };

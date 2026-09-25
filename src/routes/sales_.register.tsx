import { useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePageTitle } from "@/lib/i18n";
import { SITE } from "@/lib/site";
import { registerSalesAccount } from "@/lib/staff-ask";
import { STAFF_GROUPS, type StaffGroupId } from "@/lib/staff-groups";

export const Route = createFileRoute("/sales_/register")({
  component: SalesRegisterPage,
  head: () => ({
    meta: [
      { title: `銷售員註冊 · ${SITE.name}` },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
});

function SalesRegisterPage() {
  usePageTitle(`銷售員註冊 · ${SITE.name}`);
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [groupId, setGroupId] = useState<StaffGroupId>("hkt");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (password !== confirm) {
      setError("兩次密碼唔一致");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const result = await registerSalesAccount({ data: { username, password, groupId } });
      if (!result.ok) {
        setError(("message" in result && result.message) || "註冊失敗");
        return;
      }
      await navigate({ to: "/sales" });
    } catch {
      setError("註冊失敗");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <p className="text-xs font-medium tracking-wider text-subtle">SALES · REGISTER</p>
      <h1 className="mt-2 text-title font-semibold">銷售員首次註冊</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        填用戶名、密碼同你所屬電訊集團。交表之後要等站長喺後台批准，批准咗先可以改計劃。
      </p>
      <form className="mt-8 space-y-3 rounded-xl bg-card p-5 shadow-[var(--shadow-border)]" onSubmit={(event) => void onSubmit(event)}>
        <label className="block text-sm">
          用戶名
          <Input className="mt-1" autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} />
        </label>
        <label className="block text-sm">
          密碼（至少 4 個字）
          <Input className="mt-1" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} />
        </label>
        <label className="block text-sm">
          再輸入密碼
          <Input className="mt-1" type="password" autoComplete="new-password" value={confirm} onChange={(event) => setConfirm(event.target.value)} />
        </label>
        <label className="block text-sm">
          所屬集團
          <select
            className="mt-1 flex h-11 w-full rounded-md bg-bg px-3 text-base shadow-[var(--shadow-border)]"
            value={groupId}
            onChange={(event) => setGroupId(event.target.value as StaffGroupId)}
          >
            {STAFF_GROUPS.map((group) => (
              <option key={group.id} value={group.id}>
                {group.label}
              </option>
            ))}
          </select>
        </label>
        {error ? <p className="text-sm text-hot">{error}</p> : null}
        <Button type="submit" disabled={busy}>
          {busy ? "提交緊…" : "註冊並等候批准"}
        </Button>
      </form>
      <p className="mt-6 text-sm text-muted">
        已有帳？
        <Link to="/sales" className="ml-1 underline-offset-4 hover:underline">
          返登入
        </Link>
      </p>
    </div>
  );
}

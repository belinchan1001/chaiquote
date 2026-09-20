import { useEffect, useMemo, useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QuoteLink } from "@/components/quote-link";
import { useI18n, usePageTitle } from "@/lib/i18n";
import { canonicalUrl, shareHead } from "@/lib/canonical";
import {
  SPEND_KINDS,
  SPEND_KIND_LABEL,
  daysUntil,
  monthlyTotal,
  newSpendId,
  normalizeItem,
  parseMoney,
  readSpendLedger,
  soonestExpiry,
  writeSpendLedger,
  type SpendItem,
  type SpendKind,
} from "@/lib/spend-ledger";

const SPEND_SEO = {
  title: "齊Quote｜月費開銷",
  description: "自己登記寬頻、手機及 OTT 月費與合約日，資料只存在本機。",
} as const;

export const Route = createFileRoute("/spend")({
  component: SpendPage,
  head: () => {
    const share = shareHead(SPEND_SEO, canonicalUrl("/spend"));
    return {
      ...share,
      meta: [...share.meta, { name: "robots", content: "noindex,follow" }],
    };
  },
});

const EMPTY_FORM = {
  kind: "broadband" as SpendKind,
  provider: "",
  name: "",
  monthly: "",
  startDate: "",
  endDate: "",
  note: "",
};

function SpendPage() {
  const { locale } = useI18n();
  usePageTitle(SPEND_SEO.title);
  const lang = locale === "en" ? "en" : "zh";
  const labels = SPEND_KIND_LABEL[lang];
  const [items, setItems] = useState<SpendItem[]>([]);
  const [ready, setReady] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    setItems(readSpendLedger(typeof localStorage === "undefined" ? null : localStorage));
    setReady(true);
  }, []);

  function persist(next: SpendItem[]) {
    setItems(next);
    writeSpendLedger(typeof localStorage === "undefined" ? null : localStorage, next);
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    persist([
      ...items,
      normalizeItem({
        id: newSpendId(),
        kind: form.kind,
        provider: form.provider,
        name: form.name,
        monthly: parseMoney(form.monthly),
        startDate: form.startDate,
        endDate: form.endDate,
        note: form.note,
      }),
    ]);
    setForm(EMPTY_FORM);
  }

  const total = monthlyTotal(items);
  const next = soonestExpiry(items);
  const nextDays = next ? daysUntil(next.endDate) : null;
  const grouped = useMemo(
    () =>
      SPEND_KINDS.map((kind) => ({
        kind,
        rows: items.filter((item) => item.kind === kind),
      })).filter((group) => group.rows.length),
    [items],
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-title font-semibold">{lang === "en" ? "Monthly spend" : "月費開銷"}</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        {lang === "en"
          ? "Save broadband, mobile and OTT contracts on this device. Nothing is uploaded."
          : "自己登記寬頻、手機、OTT 合約，一次過睇月費同到期日。資料只存在呢部裝置，唔會上傳。"}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        {lang === "en" ? "Catalogue prices remain reference only." : "目錄月費仍只供參考，實際以查核報價為準。"}
      </p>

      {ready ? (
        <section className="mt-8 rounded-xl bg-surface px-4 py-5">
          <p className="text-xs tracking-wider text-muted">{lang === "en" ? "This month" : "每月合計"}</p>
          <p className="mt-1 text-3xl font-semibold">
            ${total.toFixed(total % 1 ? 1 : 0)}
            <span className="ml-1 text-sm font-medium text-muted">{lang === "en" ? "/ mo" : "/ 月"}</span>
          </p>
          <p className="mt-3 text-sm text-muted">
            {next && nextDays !== null
              ? `${lang === "en" ? "Next end date" : "最近到期"}：${next.provider || next.name || labels[next.kind]} ${next.endDate}${nextDays < 0 ? (lang === "en" ? ` (${Math.abs(nextDays)} days past)` : `（已過 ${Math.abs(nextDays)} 日）`) : lang === "en" ? ` (${nextDays} days)` : `（仲有 ${nextDays} 日）`}`
              : lang === "en"
                ? "Add an end date to see the next renewal."
                : "填合約到期日就會見到下一個續約。"}
          </p>
        </section>
      ) : null}

      <form className="mt-8 space-y-3" onSubmit={onSubmit}>
        <h2 className="text-lg font-semibold">{lang === "en" ? "Add a service" : "新增一項服務"}</h2>
        <label className="block text-sm">
          <span className="text-muted">{lang === "en" ? "Type" : "類型"}</span>
          <select
            className="mt-1 flex h-11 w-full rounded-md bg-card px-3 text-base text-fg"
            value={form.kind}
            onChange={(e) => setForm({ ...form, kind: e.target.value as SpendKind })}
          >
            {SPEND_KINDS.map((kind) => (
              <option key={kind} value={kind}>
                {labels[kind]}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-muted">{lang === "en" ? "Provider" : "營辦商"}</span>
          <Input className="mt-1" value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} placeholder={lang === "en" ? "e.g. HKBN" : "例如 HKBN"} />
        </label>
        <label className="block text-sm">
          <span className="text-muted">{lang === "en" ? "Plan name" : "計劃名稱"}</span>
          <Input className="mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={lang === "en" ? "Optional" : "可留空"} />
        </label>
        <label className="block text-sm">
          <span className="text-muted">{lang === "en" ? "Monthly fee" : "月費"}</span>
          <Input className="mt-1" inputMode="decimal" value={form.monthly} onChange={(e) => setForm({ ...form, monthly: e.target.value })} placeholder="98" />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-muted">{lang === "en" ? "Start" : "生效日"}</span>
            <Input className="mt-1" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
          </label>
          <label className="block text-sm">
            <span className="text-muted">{lang === "en" ? "End" : "到期日"}</span>
            <Input className="mt-1" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
          </label>
        </div>
        <label className="block text-sm">
          <span className="text-muted">{lang === "en" ? "Note" : "備註"}</span>
          <Input className="mt-1" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder={lang === "en" ? "Optional" : "可留空"} />
        </label>
        <Button type="submit">{lang === "en" ? "Save on this device" : "儲存到呢部裝置"}</Button>
      </form>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">{lang === "en" ? "Your services" : "你而家用緊"}</h2>
        {!ready ? (
          <p className="mt-3 text-sm text-muted">{lang === "en" ? "Loading" : "載入中"}</p>
        ) : items.length === 0 ? (
          <p className="mt-3 text-sm text-muted">{lang === "en" ? "Nothing saved yet." : "未有記錄。加一項寬頻、手機或 OTT 就會出現在下面。"}</p>
        ) : (
          grouped.map((group) => (
            <div key={group.kind} className="mt-5">
              <h3 className="text-sm font-semibold">{labels[group.kind]}</h3>
              <ul className="mt-2 space-y-2">
                {group.rows.map((item) => {
                  const left = item.endDate ? daysUntil(item.endDate) : null;
                  return (
                    <li key={item.id} className="rounded-lg bg-surface px-3 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">
                            {item.provider || labels[item.kind]}
                            {item.name ? ` · ${item.name}` : ""}
                          </p>
                          <p className="mt-1 text-sm text-muted">
                            ${item.monthly.toFixed(item.monthly % 1 ? 1 : 0)}
                            {lang === "en" ? " / mo" : "／月"}
                            {item.endDate ? ` · ${item.endDate}` : ""}
                            {left === null ? "" : left < 0 ? (lang === "en" ? " · ended" : " · 已到期") : lang === "en" ? ` · ${left} days` : ` · 仲有 ${left} 日`}
                          </p>
                          {item.note ? <p className="mt-1 text-sm text-muted">{item.note}</p> : null}
                        </div>
                        <button type="button" className="text-sm text-muted underline-offset-4 hover:underline" onClick={() => persist(items.filter((row) => row.id !== item.id))}>
                          {lang === "en" ? "Remove" : "刪除"}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        )}
      </section>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Button asChild>
          <Link to="/plans" search={{ cat: "broadband" }}>
            {lang === "en" ? "Compare broadband" : "比較寬頻"}
          </Link>
        </Button>
        <QuoteLink showNumber />
      </div>
    </div>
  );
}

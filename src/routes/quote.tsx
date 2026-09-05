import { useMemo, useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { QuoteLink } from "@/components/quote-link";
import { EstateSuggest } from "@/components/estate-suggest";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useDesk, useHydrateDesk } from "@/lib/desk";
import { CATEGORY_LABEL, getPlan, type Category } from "@/lib/plans";
import { CATEGORY_OPTIONS, DISTRICTS, HOUSING_OPTIONS, SITE } from "@/lib/site";
import { formQuoteMessage, whatsappHref } from "@/lib/whatsapp";

type QuoteSearch = { plan?: string };

export const Route = createFileRoute("/quote")({
  validateSearch: (search: Record<string, unknown>): QuoteSearch => ({
    plan: typeof search.plan === "string" ? search.plan : undefined,
  }),
  component: QuotePage,
  head: () => ({ meta: [{ title: `即時報價 · ${SITE.name}` }] }),
});

function QuotePage() {
  const { plan: planParam } = Route.useSearch();
  useHydrateDesk();
  const compare = useDesk((s) => s.compare);
  const quotes = useDesk((s) => s.quotes);
  const addQuote = useDesk((s) => s.addQuote);

  const preselected = useMemo(() => {
    const fromQuery = (planParam ?? "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);
    const ids = fromQuery.length ? fromQuery : compare;
    return ids.map(getPlan).filter((p): p is NonNullable<typeof p> => Boolean(p));
  }, [planParam, compare]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [housing, setHousing] = useState("");
  const [district, setDistrict] = useState("");
  const [estate, setEstate] = useState("");
  const [category, setCategory] = useState<Category>(preselected[0]?.category ?? "broadband");
  const [currentProvider, setCurrentProvider] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [doneId, setDoneId] = useState<string | null>(null);

  function submit(e: FormEvent) {
    e.preventDefault();
    const phoneClean = phone.replace(/\s/g, "");
    if (!name.trim()) {
      setError("請填姓名。");
      return;
    }
    if (!/^[2-9]\d{7}$/.test(phoneClean)) {
      setError("請填 8 位香港電話。");
      return;
    }
    if (!housing) {
      setError("請揀樓宇類型，方便核對覆蓋。");
      return;
    }
    const quote = addQuote({
      name: name.trim(),
      phone: phoneClean,
      housing,
      district,
      estate: estate.trim(),
      category,
      currentProvider: currentProvider.trim(),
      planIds: preselected.map((p) => p.id),
      notes: notes.trim(),
    });
    const message = formQuoteMessage({
      name: name.trim(),
      phone: phoneClean,
      housing,
      district,
      estate: estate.trim(),
      category,
      currentProvider: currentProvider.trim(),
      notes: notes.trim(),
      plans: preselected,
    });
    window.open(whatsappHref(message), "_blank", "noopener,noreferrer");
    setError("");
    setDoneId(quote.id);
  }

  if (doneId) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <p className="text-xs tracking-widest text-accent">搞掂</p>
        <h1 className="mt-2 text-title font-semibold">已收到你嘅報價</h1>
        <p className="mt-4 text-muted">
          如果 WhatsApp 未自動開，再撳下面掣，將資料傳去 {SITE.phoneDisplay}。
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <QuoteLink plans={preselected} showNumber />
          <Button asChild variant="outline">
            <Link to="/plans" search={{ cat: category }}>
              繼續格價
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-8 lg:grid-cols-[1fr_0.9fr]">
      <div>
        <h1 className="text-title font-semibold">即時問價</h1>
        <p className="mt-2 text-muted">
          填地址同而家用緊邊間，交表就會開 WhatsApp 去 {SITE.phoneDisplay}。想即刻傾就唔使填表。
        </p>
        <QuoteLink className="mt-5" plans={preselected} showNumber />

        {preselected.length ? (
          <ul className="mt-6 space-y-2 rounded-xl bg-surface p-4 text-sm">
            <li className="text-xs tracking-wider text-muted">你揀咗</li>
            {preselected.map((plan) => (
              <li key={plan.id} className="font-medium">
                {plan.name} · {CATEGORY_LABEL[plan.category]}
              </li>
            ))}
          </ul>
        ) : null}

        <form className="mt-8 space-y-4" onSubmit={submit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">姓名</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">手提電話</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                inputMode="numeric"
                autoComplete="tel"
                placeholder="8 位數字"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="housing">樓宇類型</Label>
              <Select id="housing" value={housing} onChange={(e) => setHousing(e.target.value)}>
                <option value="">揀一揀</option>
                {HOUSING_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="district">地區</Label>
              <Select id="district" value={district} onChange={(e) => setDistrict(e.target.value)}>
                <option value="">揀一揀</option>
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
                {district && !(DISTRICTS as readonly string[]).includes(district) ? (
                  <option value={district}>{district}</option>
                ) : null}
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="estate">屋苑／街道（愈詳細愈準）</Label>
            <EstateSuggest
              id="estate"
              value={estate}
              onChange={setEstate}
              onSelect={(item) => {
                if (item.housing) setHousing(item.housing);
                if (item.district) setDistrict(item.district);
              }}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">主要想問</Label>
              <Select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
              >
                {CATEGORY_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="current">而家用緊邊間（可留空）</Label>
              <Input id="current" value={currentProvider} onChange={(e) => setCurrentProvider(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">備註</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="例如：村屋無光纖、想保留舊號碼、要 Disney+"
            />
          </div>
          {error ? <p className="text-sm font-medium">{error}</p> : null}
          <Button type="submit" size="lg">
            交表，開 WhatsApp
          </Button>
        </form>
      </div>

      <aside>
        <div className="rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
          <h2 className="font-semibold">呢部機嘅報價紀錄</h2>
          {quotes.length === 0 ? (
            <p className="mt-3 text-sm text-muted">交表之後會出喺呢度，淨係存在你部機。</p>
          ) : (
            <ul className="mt-4 space-y-3 text-sm">
              {quotes.map((q) => (
                <li key={q.id} className="border-t border-border pt-3">
                  <p className="font-medium">
                    {q.name} · {q.phone}
                  </p>
                  <p className="text-muted">
                    {new Date(q.createdAt).toLocaleString("zh-HK")} · {q.estate || q.district || "未填地址"}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}

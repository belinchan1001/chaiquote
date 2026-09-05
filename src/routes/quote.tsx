import { useEffect, useMemo, useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuoteLink } from "@/components/quote-link";
import { EstateSuggest } from "@/components/estate-suggest";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useDesk, useHydrateDesk } from "@/lib/desk";
import { sendLead } from "@/lib/lead";
import { CATEGORY_LABEL, getPlan, type Category } from "@/lib/plans";
import { CALL_WINDOWS, CATEGORY_OPTIONS, HOUSING_OPTIONS, SITE } from "@/lib/site";
import { addressHitValue } from "@/lib/address-search";
import { planLine } from "@/lib/whatsapp";

type QuoteSearch = { plan?: string };

export const Route = createFileRoute("/quote")({
  validateSearch: (search: Record<string, unknown>): QuoteSearch => ({
    plan: typeof search.plan === "string" ? search.plan : undefined,
  }),
  component: QuotePage,
  head: () => ({ meta: [{ title: `留低電話 · ${SITE.name}` }] }),
});

function QuotePage() {
  const { plan: planParam } = Route.useSearch();
  useHydrateDesk();
  const compare = useDesk((s) => s.compare);
  const addQuote = useDesk((s) => s.addQuote);
  const inquiry = useDesk((s) => s.inquiry);
  const setInquiry = useDesk((s) => s.setInquiry);

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
  const [callWindow, setCallWindow] = useState("anytime");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<{ phone: string; emailed: boolean } | null>(null);

  useEffect(() => {
    if (!inquiry.estate && !inquiry.housing && !inquiry.district) return;
    setEstate((value) => value || inquiry.estate);
    setHousing((value) => value || inquiry.housing);
    setDistrict((value) => value || inquiry.district);
  }, [inquiry.estate, inquiry.housing, inquiry.district]);

  async function submit(e: FormEvent) {
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
    if (!estate.trim() && !housing) {
      setError("請填申請地址，或揀樓宇類型。");
      return;
    }
    setSending(true);
    setError("");
    addQuote({
      name: name.trim(),
      phone: phoneClean,
      housing,
      district,
      estate: estate.trim(),
      category,
      currentProvider: "",
      planIds: preselected.map((p) => p.id),
      notes: [callWindow, notes.trim()].filter(Boolean).join(" · "),
    });
    setInquiry({ estate: estate.trim(), housing, district });
    const payload = {
      name: name.trim(),
      phone: phoneClean,
      housing,
      district,
      estate: estate.trim(),
      category,
      callWindow,
      notes: notes.trim(),
      plans: preselected.map(planLine).join("；"),
    };
    let emailed = false;
    try {
      const result = await sendLead({ data: payload });
      emailed = result.ok;
    } catch {
      emailed = false;
    }
    setSending(false);
    setDone({ phone: phoneClean, emailed });
  }

  if (done) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <p className="text-xs tracking-widest text-accent">已收到</p>
        <h1 className="mt-2 text-title font-semibold">我哋會打俾你</h1>
        <p className="mt-4 text-muted">
          已記下 {name}，電話 {done.phone.replace(/(\d{4})(\d{4})/, "$1 $2")}
          {estate ? `，地址 ${estate}` : ""}。目標今日內致電。
        </p>
        {done.emailed ? null : (
          <p className="mt-3 text-sm text-muted">
            電郵通道尚未接上期間，等唔切請直接致電或 WhatsApp {SITE.phoneDisplay}。
          </p>
        )}
        <div className="mt-8 flex flex-col gap-3">
          <Button asChild size="lg">
            <a href={`tel:+${SITE.whatsappE164}`}>
              <Phone className="size-4" />
              即刻致電 {SITE.phoneDisplay}
            </a>
          </Button>
          <QuoteLink
            size="lg"
            plans={preselected}
            inquiry={{ estate, housing, district }}
          >
            WhatsApp即時查詢
          </QuoteLink>
          <Button asChild variant="ghost">
            <Link to="/plans" search={{ cat: category }}>
              繼續格價
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-8 lg:grid-cols-[1fr_0.85fr]">
      <div>
        <h1 className="text-title font-semibold">留低電話，我哋打俾你</h1>
        <p className="mt-2 text-muted">
          冇 WhatsApp 都得。只需姓名同電話，目標今日內致電。等唔切就直接打 {SITE.phoneDisplay}。
        </p>

        <form className="mt-8 space-y-4" onSubmit={(e) => void submit(e)}>
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
          <div className="space-y-2">
            <Label htmlFor="estate">申請地址</Label>
            <EstateSuggest
              id="estate"
              value={estate}
              onChange={setEstate}
              onSelect={(item) => {
                const nextEstate = addressHitValue(item);
                const nextHousing = item.housing ?? housing;
                setEstate(nextEstate);
                if (item.housing) setHousing(item.housing);
                if (item.district) setDistrict(item.district);
                setInquiry({
                  estate: nextEstate,
                  housing: nextHousing,
                  district: item.district,
                });
              }}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="housing">樓宇類型</Label>
              <Select id="housing" value={housing} onChange={(e) => setHousing(e.target.value)}>
                <option value="">未確定</option>
                {HOUSING_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="callWindow">方便致電</Label>
              <Select id="callWindow" value={callWindow} onChange={(e) => setCallWindow(e.target.value)}>
                {CALL_WINDOWS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
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
            <Label htmlFor="notes">備註（可留空）</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="例如：村屋未有光纖、想保留舊號碼"
            />
          </div>
          {error ? <p className="text-sm font-medium text-hot">{error}</p> : null}
          <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={sending}>
            {sending ? "送出緊…" : "請致電我"}
          </Button>
        </form>
      </div>

      <aside className="space-y-4">
        {preselected.length ? (
          <div className="rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
            <p className="text-xs tracking-wider text-muted">你揀咗</p>
            <ul className="mt-3 space-y-2 text-sm">
              {preselected.map((plan) => (
                <li key={plan.id} className="font-medium">
                  {plan.name}
                  <span className="mt-0.5 block text-xs font-normal text-muted">
                    {CATEGORY_LABEL[plan.category]}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <div className="rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
          <h2 className="font-semibold">等唔切？</h2>
          <p className="mt-2 text-sm text-muted">有 WhatsApp 或者想即刻講，用下面兩粒掣。</p>
          <div className="mt-4 flex flex-col gap-2">
            <QuoteLink plans={preselected} inquiry={{ estate, housing, district }}>
              WhatsApp即時查詢
            </QuoteLink>
            <Button asChild variant="outline">
              <a href={`tel:+${SITE.whatsappE164}`}>
                <Phone className="size-4" />
                致電 {SITE.phoneDisplay}
              </a>
            </Button>
          </div>
        </div>
      </aside>
    </div>
  );
}

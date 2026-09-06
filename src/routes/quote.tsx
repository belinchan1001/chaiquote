import { useEffect, useMemo, useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuoteLink } from "@/components/quote-link";
import { WhatsAppTip } from "@/components/whatsapp-tip";
import { EstateSuggest } from "@/components/estate-suggest";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useDesk, useHydrateDesk } from "@/lib/desk";
import { useI18n, usePageTitle } from "@/lib/i18n";
import { sendLead } from "@/lib/lead";
import { getPlan, type Category, type Housing } from "@/lib/plans";
import { CALL_WINDOWS, CATEGORY_OPTIONS, HOUSING_OPTIONS, SITE } from "@/lib/site";
import { addressHitValue } from "@/lib/address-search";
import { planLine } from "@/lib/whatsapp";
import type { MessageKey } from "@/lib/messages";

type QuoteSearch = { plan?: string };

const CAT_KEYS: Record<Category, MessageKey> = {
  broadband: "catBroadband",
  mobile: "catMobile",
  home5g: "catHome5gLong",
  business: "catBusiness",
};

const HOUSING_KEYS: Record<Housing, MessageKey> = {
  public: "housingPublic",
  hos: "housingHos",
  private: "housingPrivate",
  village: "housingVillage",
};

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
  const { t, tx, categoryLabel } = useI18n();
  usePageTitle(`${t("quoteTitle")} · ${SITE.name}`);

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
  const [consented, setConsented] = useState(false);
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
      setError(t("errName"));
      return;
    }
    if (!/^[2-9]\d{7}$/.test(phoneClean)) {
      setError(t("errPhone"));
      return;
    }
    if (!estate.trim() && !housing) {
      setError(t("errAddress"));
      return;
    }
    if (!consented) {
      setError(t("errConsent"));
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
      plans: preselected.map((p) => planLine(p)).join("；"),
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
        <p className="text-xs tracking-widest text-accent">{t("quoteReceived")}</p>
        <h1 className="mt-2 text-title font-semibold">{t("quoteCallYou")}</h1>
        <p className="mt-4 text-muted">
          {t("quoteRecorded", {
            name,
            phone: done.phone.replace(/(\d{4})(\d{4})/, "$1 $2"),
            address: estate ? t("quoteAddressPart", { estate }) : "",
          })}
        </p>
        {done.emailed ? null : (
          <p className="mt-3 text-sm text-muted">
            {t("quoteEmailPending", { phone: SITE.phoneDisplay })}
          </p>
        )}
        <div className="mt-8 flex flex-col gap-3">
          <Button asChild size="lg">
            <a href={`tel:+${SITE.whatsappE164}`}>
              <Phone className="size-4" />
              {t("callNowNumber", { phone: SITE.phoneDisplay })}
            </a>
          </Button>
          <QuoteLink
            size="lg"
            plans={preselected}
            inquiry={{ estate, housing, district }}
          >
            {t("waHeader")}
          </QuoteLink>
          <WhatsAppTip />
          <Button asChild variant="ghost">
            <Link to="/plans" search={{ cat: category }}>
              {t("keepComparing")}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-8 lg:grid-cols-[1fr_0.85fr]">
      <div>
        <h1 className="text-title font-semibold">{t("quotePageTitle")}</h1>
        <p className="mt-2 text-muted">{t("quotePageLead", { phone: SITE.phoneDisplay })}</p>

        <form className="mt-8 space-y-4" onSubmit={(e) => void submit(e)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">{t("name")}</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t("quoteMobile")}</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                inputMode="numeric"
                autoComplete="tel"
                placeholder={t("phone8")}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="estate">{t("applyAddress")}</Label>
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
              <Label htmlFor="housing">{t("housingType")}</Label>
              <Select id="housing" value={housing} onChange={(e) => setHousing(e.target.value)}>
                <option value="">{t("housingUnknown")}</option>
                {HOUSING_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {t(HOUSING_KEYS[o.id])}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="callWindow">{t("callWhen")}</Label>
              <Select id="callWindow" value={callWindow} onChange={(e) => setCallWindow(e.target.value)}>
                {CALL_WINDOWS.map((item) => (
                  <option key={item.id} value={item.id}>
                    {t(
                      item.id === "anytime"
                        ? "windowAnytime"
                        : item.id === "weekday"
                          ? "windowWeekday"
                          : item.id === "evening"
                            ? "windowEvening"
                            : "windowWeekend",
                    )}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">{t("askMain")}</Label>
            <Select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
            >
              {CATEGORY_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>
                  {t(CAT_KEYS[o.id as Category])}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">{t("notesEmpty")}</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t("notesPh")}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="consent" className="flex items-start gap-3 text-sm leading-relaxed text-muted">
              <input
                id="consent"
                type="checkbox"
                checked={consented}
                onChange={(e) => setConsented(e.target.checked)}
                className="mt-1 size-4 shrink-0 accent-primary"
              />
              <span>{t("consentLead")}</span>
            </label>
            <p className="pl-7 text-xs">
              <Link to="/privacy" className="text-accent underline-offset-4 hover:underline">
                {t("navPrivacy")}
              </Link>
            </p>
          </div>
          {error ? <p className="text-sm font-medium text-hot">{error}</p> : null}
          <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={sending || !consented}>
            {sending ? t("sending") : t("submitCall")}
          </Button>
        </form>
      </div>

      <aside className="space-y-4">
        {preselected.length ? (
          <div className="rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
            <p className="text-xs tracking-wider text-muted">{t("youPicked")}</p>
            <ul className="mt-3 space-y-2 text-sm">
              {preselected.map((plan) => (
                <li key={plan.id} className="font-medium">
                  {tx(plan.name)}
                  <span className="mt-0.5 block text-xs font-normal text-muted">
                    {categoryLabel(plan.category)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <div className="rounded-xl bg-card p-5 shadow-[var(--shadow-border)]">
          <h2 className="font-semibold">{t("cantWait")}</h2>
          <p className="mt-2 text-sm text-muted">{t("cantWaitLead")}</p>
          <div className="mt-4 flex flex-col gap-2">
            <QuoteLink plans={preselected} inquiry={{ estate, housing, district }}>
              {t("waHeader")}
            </QuoteLink>
            <Button asChild variant="outline">
              <a href={`tel:+${SITE.whatsappE164}`}>
                <Phone className="size-4" />
                {t("callNumber", { phone: SITE.phoneDisplay })}
              </a>
            </Button>
            <WhatsAppTip />
          </div>
        </div>
      </aside>
    </div>
  );
}

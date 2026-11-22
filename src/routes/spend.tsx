import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { JsonLd } from "@/components/json-ld";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { useDesk, useHydrateDesk } from "@/lib/desk";
import { useI18n, usePageTitle } from "@/lib/i18n";
import { canonicalUrl, shareHead } from "@/lib/canonical";
import { formatCustomerExpiry } from "@/lib/port-in";
import {
  canCompareOnSite,
  compareCategory,
  normalizeSpendDate,
  prefillFromPlan,
  referenceMonthlyFee,
  referencePlansFor,
  referenceSavingNote,
  spendFeeCheckText,
  spendFormIsCollapsed,
  spendFormIssue,
} from "@/lib/spend-compare";
import {
  OTHER_PROVIDER,
  SPEED_PRESETS,
  SPEED_PRESET_LABEL,
  SPEND_KINDS,
  SPEND_KIND_LABEL,
  SPEND_PROVIDERS,
  daysUntil,
  monthlyTotal,
  newSpendId,
  normalizeItem,
  parseMoney,
  readSpendLedger,
  soonestExpiry,
  speedLabel,
  writeSpendLedger,
  type SpeedPreset,
  type SpendItem,
  type SpendKind,
} from "@/lib/spend-ledger";
import { PROVIDER_MAP, formatFee, getPlan, type Plan, type ProviderId } from "@/lib/plans";
import { SITE } from "@/lib/site";
import { quoteWhatsappHref } from "@/lib/whatsapp";
import { quoteWhatsAppActivateProps } from "@/lib/wa-quote-open";
import { cn } from "@/lib/utils";

/** Locked visible identity. One citable title and description set. */
const SPEND_H1_ZH = "個人月費對照";
const SPEND_INTRO_ZH = "登記你而家用緊嘅月費同到期日，一次過對照站內參考計劃。資料只存在呢部裝置。";
const SPEND_TITLE = "個人月費對照｜齊Quote";
const SPEND_COMPARE_NOTE = "牌面月費取自站內參考計劃，一律係參考月費，以電訊商確認為準。";
const SPEND_CATALOGUE_LINK = "喺計劃目錄睇參考計劃";
const SPEND_GO_CATALOGUE = "去計劃目錄";
const SPEND_PREFILL_NOTE =
  "撳『設為我而家用緊』之後，會用呢張卡嘅營辦商、參考月費同合約期，預填短表（仍只存呢部裝置）。";

const SPEND_SEO = {
  title: SPEND_TITLE,
  description: SPEND_INTRO_ZH,
} as const;

export type SpendSearch = {
  usePlan?: string;
};

function readSpendSearch(search: Record<string, unknown>): SpendSearch {
  const raw = typeof search.usePlan === "string" ? search.usePlan.trim() : "";
  if (!/^[A-Za-z0-9_-]{1,80}$/.test(raw)) return {};
  return { usePlan: raw };
}

export const Route = createFileRoute("/spend")({
  validateSearch: (search: Record<string, unknown>) => readSpendSearch(search),
  component: SpendPage,
  head: () => {
    const url = canonicalUrl("/spend");
    const share = shareHead(SPEND_SEO, url);
    return {
      ...share,
      meta: [...share.meta, { name: "robots", content: "noindex,follow" }],
    };
  },
});

const EMPTY_FORM = {
  kind: "broadband" as SpendKind,
  providerPick: "",
  providerCustom: "",
  name: "",
  monthly: "",
  startDate: "",
  endDate: "",
  note: "",
  speedPreset: "" as SpeedPreset | "",
  speedCustom: "",
};

const KIND_CHIP_ZH: Record<SpendKind, string> = {
  broadband: "寬頻",
  home5g: "5G 家居",
  mobile: "手機",
  paytv: "收費電視",
  ott: "OTT",
  other: "其他",
};

type FormState = typeof EMPTY_FORM;
type FormIssue = ReturnType<typeof spendFormIssue>;

function SpendPage() {
  const { locale } = useI18n();
  usePageTitle(SPEND_TITLE);
  useHydrateDesk();
  const setInquiry = useDesk((s) => s.setInquiry);
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const lang = locale === "en" ? "en" : "zh";
  const labels = lang === "en" ? SPEND_KIND_LABEL.en : KIND_CHIP_ZH;
  const speedLabels = SPEED_PRESET_LABEL[lang];
  const [items, setItems] = useState<SpendItem[]>([]);
  const [ready, setReady] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [adding, setAdding] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [fromPlan, setFromPlan] = useState(false);
  const [issue, setIssue] = useState<FormIssue>(null);

  function syncExpiry(list: SpendItem[]) {
    const item = soonestExpiry(list);
    setInquiry({ customerExpiry: item ? formatCustomerExpiry(item.endDate) : "" });
  }

  useEffect(() => {
    const list = readSpendLedger(typeof localStorage === "undefined" ? null : localStorage);
    setItems(list);
    setReady(true);
    const item = soonestExpiry(list);
    setInquiry({ customerExpiry: item ? formatCustomerExpiry(item.endDate) : "" });
  }, [setInquiry]);

  useEffect(() => {
    if (!search.usePlan) return;
    const plan = getPlan(search.usePlan);
    if (!plan) return;
    setForm({ ...EMPTY_FORM, ...prefillFromPlan(plan) });
    setAdding(true);
    setMoreOpen(true);
    setFromPlan(true);
    setIssue(null);
  }, [search.usePlan]);

  useEffect(() => {
    if (!adding) return;
    document.getElementById("spend-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [adding]);

  function persist(next: SpendItem[]) {
    setItems(next);
    writeSpendLedger(typeof localStorage === "undefined" ? null : localStorage, next);
    syncExpiry(next);
  }

  function providerName() {
    return form.providerPick === OTHER_PROVIDER ? form.providerCustom.trim() : form.providerPick;
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const provider = providerName();
    const nextIssue = spendFormIssue({ provider, monthly: form.monthly, endDate: form.endDate });
    setIssue(nextIssue);
    if (nextIssue) return;
    persist([
      ...items,
      normalizeItem({
        id: newSpendId(),
        kind: form.kind,
        provider,
        name: form.name,
        monthly: parseMoney(form.monthly),
        startDate: form.startDate,
        endDate: normalizeSpendDate(form.endDate),
        note: form.note,
        speedPreset: form.kind === "broadband" || form.kind === "home5g" ? form.speedPreset : "",
        speedCustom: form.speedCustom,
      }),
    ]);
    setForm(EMPTY_FORM);
    setAdding(false);
    setFromPlan(false);
    setMoreOpen(false);
    if (search.usePlan) void navigate({ search: {}, replace: true });
    requestAnimationFrame(() => {
      document.getElementById("spend-top")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  const zh = lang === "zh";
  const collapsed = ready && spendFormIsCollapsed(items.length, adding);
  const comparable = items.filter((item) => canCompareOnSite(item.kind));
  const loggedOnly = items.filter((item) => !canCompareOnSite(item.kind));
  const blocks = comparable.map((item) => ({ item, refs: referencePlansFor(item) }));
  const hero = blocks.find((block) => block.refs.length);
  const heroFee = hero ? referenceMonthlyFee(hero.refs) : null;
  const total = monthlyTotal(items);
  const next = soonestExpiry(items);
  const nextDays = next ? daysUntil(next.endDate) : null;
  const showSpeed = form.kind === "broadband" || form.kind === "home5g";

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-10">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: SPEND_TITLE,
          headline: SPEND_H1_ZH,
          description: SPEND_INTRO_ZH,
          url: canonicalUrl("/spend"),
          inLanguage: "zh-HK",
        }}
      />
      <h1 id="spend-top" className="scroll-mt-24 text-title font-semibold tracking-tight">
        {zh ? SPEND_H1_ZH : "Compare my fees"}
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
        {zh
          ? SPEND_INTRO_ZH
          : "Save the fee and end date you use now, then compare them with in-site reference plans. Data stays on this device."}
      </p>

      {ready && items.length > 0 ? (
        <FilledSummary
          zh={zh}
          items={items}
          total={total}
          next={next}
          nextDays={nextDays}
          heroFee={heroFee}
          hasComparable={comparable.length > 0}
          labels={labels}
        />
      ) : null}

      {ready && items.length > 0 ? (
        <CompareSection
          zh={zh}
          blocks={blocks}
          loggedOnly={loggedOnly}
          labels={labels}
          onRemove={(id) => persist(items.filter((row) => row.id !== id))}
        />
      ) : null}

      {collapsed ? (
        <div className="mt-8 flex justify-end">
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-card px-4 text-sm font-medium text-fg hover:bg-surface"
            onClick={() => {
              setForm(EMPTY_FORM);
              setFromPlan(false);
              setMoreOpen(false);
              setIssue(null);
              setAdding(true);
            }}
          >
            {zh ? "新增另一項" : "Add another"}
          </button>
        </div>
      ) : (
        <>
          {items.length === 0 ? <EmptyHint zh={zh} /> : null}
          <SpendForm
          zh={zh}
          hasItems={items.length > 0}
          form={form}
          setForm={setForm}
          showSpeed={showSpeed}
          speedLabels={speedLabels}
          labels={labels}
          moreOpen={moreOpen}
          setMoreOpen={setMoreOpen}
          fromPlan={fromPlan}
          issue={issue}
          onSubmit={onSubmit}
        />
        </>
      )}

      <div className="mt-10 space-y-3 text-sm leading-relaxed text-muted">
        <p>
          {zh
            ? "合約到期日必須由你自行核實。部分供應商設有自動續約條款，到期前未取消就可能自動續約。呢頁只係提醒，唔係合約正本。"
            : "Check the contract end date yourself. Some providers renew automatically if you do not cancel in time. This page is only a reminder."}
        </p>
        <p>
          {zh
            ? "以上對照用嘅係站內參考計劃／參考月費，只供對照，唔係保證可慳嘅價，亦唔係全港劃一價。實際月費、覆蓋、合約期同安裝安排，一律以電訊商確認為準。"
            : "Reference plans and reference fees are for comparison only. They are not a guaranteed saving and not one price for all of Hong Kong. The carrier confirms the fee, coverage, term and installation."}
        </p>
        <p>
          {zh
            ? "資料只存在呢部裝置，唔會上傳。收費電視、OTT 或其他服務可以記帳同計入合計、到期提醒，暫時唔會自動對照參考計劃；如要查核，可用 WhatsApp 聯絡我哋。"
            : "Data stays on this device and is not uploaded. Pay TV, OTT and other services can be logged in the total and the expiry reminder. They are not auto-compared with reference plans."}
        </p>
      </div>
    </div>
  );
}

function FilledSummary({
  zh,
  items,
  total,
  next,
  nextDays,
  heroFee,
  hasComparable,
  labels,
}: {
  zh: boolean;
  items: SpendItem[];
  total: number;
  next: SpendItem | null;
  nextDays: number | null;
  heroFee: number | null;
  hasComparable: boolean;
  labels: Record<SpendKind, string>;
}) {
  const count =
    items.length === 1
      ? zh
        ? `1 項${labels[items[0]!.kind]} · 只存呢部裝置`
        : `1 ${labels[items[0]!.kind]} · on this device`
      : zh
        ? `${items.length} 項 · 只存呢部裝置`
        : `${items.length} items · on this device`;
  const expiryValue =
    next && nextDays !== null
      ? nextDays < 0
        ? zh
          ? `已過 ${Math.abs(nextDays)} 日`
          : `${Math.abs(nextDays)} days past`
        : nextDays === 0
          ? zh
            ? "今日到期"
            : "Ends today"
          : zh
            ? `尚餘 ${nextDays} 日`
            : `${nextDays} days left`
      : zh
        ? "未有到期日"
        : "No end date";
  const expirySub =
    next && next.endDate
      ? `${next.provider || labels[next.kind]} · ${next.endDate} · ${zh ? "請核實續約" : "Confirm renewal"}`
      : zh
        ? "填到期日先可以倒數提醒"
        : "Add an end date for the countdown";
  const feeSub = !hasComparable
    ? zh
      ? "暫時唔會自動對照參考計劃"
      : "Not auto-compared with reference plans"
    : heroFee === null
      ? zh
        ? "只供參考 · 未有平過或同價嘅參考計劃"
        : "Reference only · none at or below your fee"
      : zh
        ? "只供參考 · 已剔除你而家呢間營辦商"
        : "Reference only · your provider is excluded";

  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-3" data-spend-state="filled">
      <article className="rounded-xl bg-surface px-4 py-4">
        <p className="text-xs text-muted">{zh ? "本月合計" : "This month"}</p>
        <p className="mt-2 font-display text-3xl font-semibold tabular-nums tracking-tight">{formatFee(total)}</p>
        <p className="mt-2 text-xs leading-relaxed text-muted">{count}</p>
      </article>
      <article className="rounded-xl bg-surface px-4 py-4">
        <p className="text-xs text-muted">{zh ? "最近到期" : "Next end date"}</p>
        <p className="mt-2 font-display text-3xl font-semibold tracking-tight">{expiryValue}</p>
        <p className="mt-2 text-xs leading-relaxed text-muted">{expirySub}</p>
      </article>
      <article className="rounded-xl bg-surface px-4 py-4">
        <p className="text-xs text-muted">{zh ? "站內參考月費" : "In-site reference fee"}</p>
        <p className="mt-2 font-display text-3xl font-semibold tabular-nums tracking-tight">
          {heroFee === null ? "—" : formatFee(heroFee)}
        </p>
        <p className="mt-2 text-xs leading-relaxed text-muted">{feeSub}</p>
      </article>
    </div>
  );
}

function CompareSection({
  zh,
  blocks,
  loggedOnly,
  labels,
  onRemove,
}: {
  zh: boolean;
  blocks: { item: SpendItem; refs: Plan[] }[];
  loggedOnly: SpendItem[];
  labels: Record<SpendKind, string>;
  onRemove: (id: string) => void;
}) {
  const primary = blocks.find((block) => block.refs.length)?.item ?? blocks[0]?.item;
  const catalogue = primary ? compareCategory(primary.kind) : null;
  return (
    <section className="mt-8">
      {blocks.length ? (
        <div data-spend-compare="yes">
          <h2 className="text-xl font-semibold">{zh ? "對照參考計劃" : "Reference plans"}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {zh ? `已剔除你而家呢間營辦商。${SPEND_COMPARE_NOTE}` : "Your current provider is excluded. Listed fees are reference fees. The carrier confirms them."}
          </p>
          <div className="mt-4 space-y-4">
            {blocks.map((block) => (
              <CompareBlock key={block.item.id} zh={zh} item={block.item} refs={block.refs} labels={labels} onRemove={onRemove} />
            ))}
          </div>
        </div>
      ) : null}
      {loggedOnly.length ? (
        <div className={cn(blocks.length ? "mt-6" : "")} data-spend-logged="yes">
          <h2 className="text-xl font-semibold">{zh ? "已記帳" : "Logged"}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {zh
              ? "收費電視／OTT／其他已計入合計同到期提醒，暫時唔會自動對照參考計劃。"
              : "Pay TV, OTT and other items stay in the total and the expiry reminder. They are not placed in the comparison."}
          </p>
          <ul className="mt-3 space-y-2">
            {loggedOnly.map((item) => (
              <li key={item.id} className="rounded-xl border border-border bg-card px-4 py-3">
                <LoggedRow zh={zh} item={item} labels={labels} onRemove={onRemove} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <p className="mt-4 text-sm leading-relaxed text-muted">
        {zh ? (
          <>
            想睇其他樓類或計劃，
            <Link to="/plans" search={{ cat: catalogue ?? "broadband" }} className="text-primary underline-offset-4 hover:underline">
              {SPEND_GO_CATALOGUE}
            </Link>
            。收費電視／OTT 可記帳，暫時唔會自動對照參考計劃；可用 WhatsApp 查核。
          </>
        ) : (
          "Pay TV and OTT can be logged. They are not auto-compared."
        )}
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Link
          to="/plans"
          search={{ cat: catalogue ?? "broadband" }}
          className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-card px-4 text-sm font-medium text-fg hover:bg-surface"
        >
          {zh ? SPEND_CATALOGUE_LINK : "See reference plans"}
        </Link>
        {primary ? (
          <SpendCheckLink message={spendFeeCheckText(primary, heroReference(blocks))} className="h-11 px-4">
            {zh ? "WhatsApp 查核呢筆月費" : "WhatsApp check this fee"}
          </SpendCheckLink>
        ) : loggedOnly[0] ? (
          <SpendCheckLink message={spendFeeCheckText(loggedOnly[0])} className="h-11 px-4">
            {zh ? "WhatsApp 查核呢筆月費" : "WhatsApp check this fee"}
          </SpendCheckLink>
        ) : null}
      </div>
    </section>
  );
}

function heroReference(blocks: { item: SpendItem; refs: Plan[] }[]) {
  const plan = blocks.find((block) => block.refs.length)?.refs[0];
  if (!plan) return undefined;
  return {
    provider: PROVIDER_MAP[plan.providerId].name,
    name: plan.name,
    monthlyFee: plan.monthlyFee,
  };
}

function CompareBlock({
  zh,
  item,
  refs,
  labels,
  onRemove,
}: {
  zh: boolean;
  item: SpendItem;
  refs: Plan[];
  labels: Record<SpendKind, string>;
  onRemove: (id: string) => void;
}) {
  const speed = speedLabel(item, zh ? "zh" : "en");
  const meta = [labels[item.kind], speed, item.endDate].filter(Boolean).join(" · ");
  return (
    <div>
      <div className="rounded-xl border border-border bg-surface px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-medium">
              <ProviderDot name={item.provider} />
              {item.provider || labels[item.kind]}
              {zh ? " · 而家用緊" : " · current"}
            </p>
            <p className="mt-1 text-sm text-muted">{meta}</p>
            {item.name ? <p className="mt-1 text-sm text-muted">{item.name}</p> : null}
            <button
              type="button"
              className="mt-2 text-sm text-muted underline-offset-4 hover:underline"
              onClick={() => onRemove(item.id)}
            >
              {zh ? "刪除" : "Remove"}
            </button>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-xl font-semibold tabular-nums">{formatFee(item.monthly)}</p>
            <p className="mt-1 text-xs text-muted">{zh ? "你登記嘅月費" : "Fee you saved"}</p>
          </div>
        </div>
      </div>
      {refs.length ? (
        <div className="mt-3 overflow-hidden rounded-xl border border-border bg-card">
          {refs.map((plan) => (
            <ReferenceRow key={plan.id} zh={zh} item={item} plan={plan} />
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted">
          {zh ? "暫時未有平過或同價嘅站內參考計劃。" : "No in-site reference plan is at or below this fee."}
        </p>
      )}
    </div>
  );
}

function referenceMeta(plan: Plan, zh: boolean): string {
  const term = zh ? `${plan.contractMonths} 個月` : `${plan.contractMonths} months`;
  return plan.name.includes(`${plan.contractMonths}`) ? plan.name : `${plan.name} · ${term}`;
}

function ReferenceRow({ zh, item, plan }: { zh: boolean; item: SpendItem; plan: Plan }) {
  const provider = PROVIDER_MAP[plan.providerId];
  return (
    <div className="border-t border-border px-4 py-4 first:border-t-0">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div className="min-w-0 flex-1">
          <p className="font-medium">
            <ProviderDot id={plan.providerId} />
            {zh ? provider.name : provider.nameEn}
          </p>
          <p className="mt-1 text-sm text-muted">{referenceMeta(plan, zh)}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xl font-semibold tabular-nums">{formatFee(plan.monthlyFee)}</p>
          <p className="mt-1 text-xs text-muted">{zh ? referenceSavingNote(item.monthly, plan.monthlyFee) : "Reference"}</p>
        </div>
        <div className="flex w-full flex-wrap gap-2 sm:ml-auto sm:w-auto sm:justify-end">
          <Link
            to="/plans/$planId"
            params={{ planId: plan.id }}
            className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-card px-3 text-sm font-medium hover:bg-surface"
          >
            {zh ? "睇參考計劃" : "View plan"}
          </Link>
          <SpendCheckLink
            planId={plan.id}
            message={spendFeeCheckText(item, {
              provider: provider.name,
              name: plan.name,
              monthlyFee: plan.monthlyFee,
            })}
          >
            {zh ? "WhatsApp 查核" : "WhatsApp check"}
          </SpendCheckLink>
        </div>
      </div>
    </div>
  );
}

function LoggedRow({
  zh,
  item,
  labels,
  onRemove,
}: {
  zh: boolean;
  item: SpendItem;
  labels: Record<SpendKind, string>;
  onRemove: (id: string) => void;
}) {
  const left = item.endDate ? daysUntil(item.endDate) : null;
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="font-medium">
          {item.provider || labels[item.kind]}
          {item.name ? ` · ${item.name}` : ""}
        </p>
        <p className="mt-1 text-sm text-muted">
          {labels[item.kind]} · {formatFee(item.monthly)}
          {item.endDate ? ` · ${item.endDate}` : ""}
          {left === null ? "" : left < 0 ? (zh ? " · 已到期" : " · ended") : zh ? ` · 尚餘 ${left} 日` : ` · ${left} days`}
        </p>
      </div>
      <button type="button" className="text-sm text-muted underline-offset-4 hover:underline" onClick={() => onRemove(item.id)}>
        {zh ? "刪除" : "Remove"}
      </button>
    </div>
  );
}

function ProviderDot({ id, name }: { id?: ProviderId; name?: string }) {
  const resolved = id ?? (name ? providerDotId(name) : undefined);
  const tone = resolved ? PROVIDER_MAP[resolved].tone : "bg-subtle";
  return <span aria-hidden="true" className={cn("mr-2 inline-block size-2.5 rounded-full align-middle", tone)} />;
}

function providerDotId(name: string): ProviderId | undefined {
  const trimmed = name.trim();
  const found = Object.values(PROVIDER_MAP).find((provider) => provider.name === trimmed || provider.nameEn === trimmed);
  return found?.id;
}

function SpendCheckLink({
  message,
  planId,
  className,
  children,
}: {
  message: string;
  planId?: string;
  className?: string;
  children: ReactNode;
}) {
  const phone = SITE.whatsappE164;
  return (
    <a
      href={quoteWhatsappHref(message, phone)}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-whatsapp px-3 text-sm font-medium text-whatsapp-foreground",
        className,
      )}
      {...quoteWhatsAppActivateProps(message, phone, {
        planIds: planId ? [planId] : undefined,
        waPhone: phone,
        source: "quote_link",
        path: "/spend",
      })}
    >
      <WhatsAppIcon />
      {children}
    </a>
  );
}

function EmptyHint({ zh }: { zh: boolean }) {
  return (
    <p className="mt-6 rounded-xl bg-surface px-4 py-3 text-sm leading-relaxed text-fg">
      {zh ? (
        <>
          登記之後，第一屏會先出<strong>本月合計</strong>、<strong>最近到期</strong>，同站內
          <strong>參考計劃</strong>
          對照（會剔除你而家呢間營辦商）。收費電視／OTT 可以記帳，但暫時唔會自動對照參考計劃。
        </>
      ) : (
        "After you save, the first screen shows the monthly total, the next end date, and in-site reference plans with your provider excluded. Pay TV and OTT can be logged, and are not auto-compared."
      )}
    </p>
  );
}

function SpendForm({
  zh,
  hasItems,
  form,
  setForm,
  showSpeed,
  speedLabels,
  labels,
  moreOpen,
  setMoreOpen,
  fromPlan,
  issue,
  onSubmit,
}: {
  zh: boolean;
  hasItems: boolean;
  form: FormState;
  setForm: (next: FormState) => void;
  showSpeed: boolean;
  speedLabels: Record<SpeedPreset, string>;
  labels: Record<SpendKind, string>;
  moreOpen: boolean;
  setMoreOpen: (open: boolean) => void;
  fromPlan: boolean;
  issue: FormIssue;
  onSubmit: (event: FormEvent) => void;
}) {
  const providers = SPEND_PROVIDERS[form.kind];
  const issueText =
    issue === "provider"
      ? zh
        ? "請揀營辦商。"
        : "Choose a provider."
      : issue === "fee"
        ? zh
          ? "請填月費。"
          : "Enter the monthly fee."
        : issue === "end"
          ? zh
            ? "請填到期日，格式 YYYY-MM-DD。"
            : "Enter the end date as YYYY-MM-DD."
          : "";

  return (
    <form id="spend-form" className={cn("scroll-mt-24 rounded-xl border border-border bg-card px-4 py-5", hasItems ? "mt-6" : "mt-6")} onSubmit={onSubmit} data-spend-state={hasItems ? "adding" : "empty"}>
      <h2 className="text-lg font-semibold">{zh ? "登記而家用緊嘅服務" : "What you use now"}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        {zh
          ? "必填只要營辦商、月費同到期日。網速可選，用嚟對照寬頻／5G 家居／手機嘅參考計劃。資料只存在呢部裝置。"
          : "Provider, monthly fee and end date are required. Speed is optional. Data stays on this device."}
      </p>
      {fromPlan ? <p className="mt-3 text-sm leading-relaxed text-muted">{zh ? SPEND_PREFILL_NOTE : "This short form was prefilled from the plan card. It is saved only on this device when you choose save."}</p> : null}
      <fieldset className="mt-5">
            <legend className="text-sm text-muted">{zh ? "類型" : "Type"}</legend>
            <ChipRow label={zh ? "類型" : "Type"}>
              {SPEND_KINDS.map((kind) => (
                <Chip
                  key={kind}
                  on={form.kind === kind}
                  onClick={() =>
                    setForm({
                      ...form,
                      kind,
                      providerPick: "",
                      providerCustom: "",
                      speedPreset: "",
                      speedCustom: "",
                    })
                  }
                >
                  {labels[kind]}
                </Chip>
              ))}
            </ChipRow>
          </fieldset>
          <fieldset className="mt-4">
            <legend className="text-sm text-muted">
              {zh ? "營辦商" : "Provider"} <Mark required={zh ? "必填" : "Required"} />
            </legend>
            <ChipRow label={zh ? "營辦商" : "Provider"}>
              {providers.map((name) => (
                <Chip key={name} on={form.providerPick === name} onClick={() => setForm({ ...form, providerPick: name })}>
                  {name}
                </Chip>
              ))}
              <Chip on={form.providerPick === OTHER_PROVIDER} onClick={() => setForm({ ...form, providerPick: OTHER_PROVIDER })}>
                {zh ? "其他" : "Other"}
              </Chip>
            </ChipRow>
            {form.providerPick === OTHER_PROVIDER ? (
              <Input
                className="mt-2"
                value={form.providerCustom}
                onChange={(event) => setForm({ ...form, providerCustom: event.target.value })}
                placeholder={zh ? "自行輸入營辦商" : "Provider name"}
              />
            ) : null}
          </fieldset>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="text-muted">
                {zh ? "月費" : "Monthly fee"} <Mark required={zh ? "必填" : "Required"} />
              </span>
              <Input
                className="mt-2"
                inputMode="decimal"
                value={form.monthly}
                onChange={(event) => setForm({ ...form, monthly: event.target.value })}
                placeholder={zh ? "例如 168" : "e.g. 168"}
              />
            </label>
            <label className="block text-sm">
              <span className="text-muted">
                {zh ? "到期日" : "End date"} <Mark required={zh ? "必填" : "Required"} />
              </span>
              <Input
                className="mt-2"
                inputMode="numeric"
                value={form.endDate}
                onChange={(event) => setForm({ ...form, endDate: event.target.value })}
                placeholder={zh ? "例如 2027-02-28" : "YYYY-MM-DD"}
              />
            </label>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {zh
              ? "未填到期日就唔能夠倒數提醒。部分計劃可能自動續約，到期日請自行向電訊商核實。"
              : "Without an end date there is no countdown. Some plans renew automatically. Confirm the date with the carrier."}
          </p>
          {showSpeed ? (
            <fieldset className="mt-4">
              <legend className="text-sm text-muted">{zh ? "網速" : "Speed"} <span className="text-xs">{zh ? "選填，用嚟對照" : "Optional"}</span></legend>
              <ChipRow label={zh ? "網速（選填）" : "Speed (optional)"}>
                {SPEED_PRESETS.map((preset) => (
                  <Chip
                    key={preset}
                    on={form.speedPreset === preset}
                    onClick={() => setForm({ ...form, speedPreset: form.speedPreset === preset ? "" : preset })}
                  >
                    {speedLabels[preset]}
                  </Chip>
                ))}
              </ChipRow>
              {form.speedPreset === "custom" ? (
                <Input
                  className="mt-2"
                  value={form.speedCustom}
                  onChange={(event) => setForm({ ...form, speedCustom: event.target.value })}
                  placeholder={zh ? "例如 500M" : "e.g. 500M"}
                />
              ) : null}
            </fieldset>
          ) : null}
          <details
            className="mt-4"
            open={moreOpen}
            onToggle={(event) => setMoreOpen((event.currentTarget as HTMLDetailsElement).open)}
          >
            <summary className="cursor-pointer text-sm font-medium text-primary">
              {zh ? "更多欄位（計劃名稱、生效日、備註）" : "More fields (plan name, start date, note)"}
            </summary>
            <p className="mt-2 text-sm text-muted">{zh ? "呢三項預設收埋，唔影響對照。" : "These three stay folded. They do not change the comparison."}</p>
            <div className="mt-3 space-y-3">
              <label className="block text-sm">
                <span className="text-muted">{zh ? "計劃名稱" : "Plan name"}</span>
                <Input className="mt-1" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
              </label>
              <label className="block text-sm">
                <span className="text-muted">{zh ? "生效日" : "Start date"}</span>
                <Input className="mt-1" type="date" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} />
              </label>
              <label className="block text-sm">
                <span className="text-muted">{zh ? "備註" : "Note"}</span>
                <Input className="mt-1" value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} />
              </label>
            </div>
          </details>
          {issueText ? (
            <p role="alert" className="mt-3 text-sm text-hot">
              {issueText}
            </p>
          ) : null}
          <Button type="submit" className="mt-5 h-12 w-full rounded-xl">
            {zh ? "儲存到呢部裝置" : "Save on this device"}
          </Button>
    </form>
  );
}

function Mark({ required }: { required: string }) {
  return <span className="ml-1 text-xs font-medium text-primary">{required}</span>;
}

function ChipRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="-mx-1 mt-2 flex gap-2 overflow-x-auto px-1 pb-1" role="group" aria-label={label}>
      {children}
    </div>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={cn("h-11 shrink-0 rounded-full px-4 text-sm", on ? "bg-primary text-primary-foreground" : "bg-surface text-fg")}
    >
      {children}
    </button>
  );
}

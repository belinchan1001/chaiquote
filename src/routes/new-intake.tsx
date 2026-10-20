import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { JsonLd } from "@/components/json-ld";
import { canonicalUrl } from "@/lib/canonical";
import { compact, estateDisplayName, placeDisplayName } from "@/lib/estates";
import { getEstatePage } from "@/lib/estate-pages";
import { useI18n, usePageTitle } from "@/lib/i18n";
import { newIntakeCards, type NewIntakeCard } from "@/lib/new-intake-page";
import { formatFee, type Housing } from "@/lib/plans";
import { cn } from "@/lib/utils";

const TITLE = "新入伙屋苑寬頻｜齊Quote";
const DESCRIPTION =
  "近年入伙或即將入伙的屋苑。指定新入伙優惠只在名單內的屋苑顯示月費，公屋、居屋同私樓分開。實際覆蓋同安裝期以電訊商確認為準。";

const CARDS = newIntakeCards();
const OFFER_COUNT = CARDS.filter((card) => card.offers.length > 0).length;
const HOUSING_IDS: Housing[] = ["public", "hos", "private"];

export const Route = createFileRoute("/new-intake")({
  component: NewIntakePage,
  head: () => {
    const url = canonicalUrl("/new-intake");
    return {
      meta: [
        { title: TITLE },
        { name: "description", content: DESCRIPTION },
        { property: "og:title", content: TITLE },
        { property: "og:description", content: DESCRIPTION },
        { property: "og:url", content: url },
        { name: "twitter:title", content: TITLE },
        { name: "twitter:description", content: DESCRIPTION },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
});

function displayName(card: NewIntakeCard, locale: "zh" | "en") {
  if (!card.slug) return card.name;
  const page = getEstatePage(card.slug);
  return page ? estateDisplayName(page.estate, locale) : card.name;
}

function NewIntakePage() {
  const { t, housingLabel, locale } = useI18n();
  usePageTitle(TITLE);
  const url = canonicalUrl("/new-intake");
  const [query, setQuery] = useState("");
  const [housing, setHousing] = useState<Housing | "">("");
  const [district, setDistrict] = useState("");
  const [simpleOnly, setSimpleOnly] = useState(false);
  const districts = useMemo(() => {
    const order: string[] = [];
    for (const card of CARDS) {
      if (!order.includes(card.district)) order.push(card.district);
    }
    return order;
  }, []);
  const visible = useMemo(() => {
    const q = compact(query);
    return CARDS.filter((card) => {
      if (housing && card.housing !== housing) return false;
      if (district && card.district !== district) return false;
      if (simpleOnly && !card.simplePublic) return false;
      if (!q) return true;
      return compact(card.name).includes(q);
    });
  }, [district, housing, query, simpleOnly]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "CollectionPage",
              name: TITLE,
              description: DESCRIPTION,
              url,
              inLanguage: "zh-HK",
              numberOfItems: CARDS.length,
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "齊Quote", item: canonicalUrl("/") },
                { "@type": "ListItem", position: 2, name: TITLE, item: url },
              ],
            },
            {
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "點解有啲屋苑有價，有啲冇？",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "指定新入伙優惠只適用於電訊商名單內的屋苑。名單以外用該樓類的一般計劃，唔會借用其他屋苑的月費。",
                  },
                },
                {
                  "@type": "Question",
                  name: "未入伙可唔可以預約安裝？",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "部分計劃可以選擇延遲服務生效。實際安裝期同覆蓋以電訊商確認為準。",
                  },
                },
                {
                  "@type": "Question",
                  name: "公屋價可唔可以用喺私樓？",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "唔可以。每張卡標明樓類，入去只會見到該樓類適用的計劃。",
                  },
                },
              ],
            },
          ],
        }}
      />
      <nav aria-label={t("crumbNav")} className="text-sm text-muted">
        <ol className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <li>
            <Link to="/" className="hover:text-fg">
              {t("crumbHome")}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link to="/estates" className="hover:text-fg">
              {t("navEstates")}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>{t("navNewIntake")}</li>
        </ol>
      </nav>
      <h1 className="mt-6 text-title font-semibold">{t("newIntakeTitle")}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">{t("newIntakeLead")}</p>
      <div className="mt-5 grid grid-cols-2 gap-2 sm:max-w-md">
        <p className="rounded-xl bg-card px-3 py-3 shadow-[var(--shadow-border)]">
          <span className="block text-[11px] font-medium tracking-wider text-muted">{t("navNewIntake")}</span>
          <span className="mt-0.5 block font-display text-lg font-semibold tabular-nums">{CARDS.length}</span>
        </p>
        <p className="rounded-xl bg-card px-3 py-3 shadow-[var(--shadow-border)]">
          <span className="block text-[11px] font-medium tracking-wider text-accent">{t("newIntakeOffer")}</span>
          <span className="mt-0.5 block font-display text-lg font-semibold tabular-nums">{OFFER_COUNT}</span>
        </p>
      </div>

      <div className="mt-6 space-y-3">
        <label htmlFor="new-intake-q" className="text-xs font-medium tracking-wider text-muted">
          {t("estateLabel")}
        </label>
        <input
          id="new-intake-q"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("estatePlaceholder")}
          className="h-11 w-full max-w-xl rounded-xl border border-border bg-card px-3 text-sm"
        />
        <div className="flex flex-wrap gap-2">
          <FilterChip on={housing === "" && !simpleOnly} onClick={() => { setHousing(""); setSimpleOnly(false); }}>
            {t("newIntakeAll")}
          </FilterChip>
          {HOUSING_IDS.map((id) => (
            <FilterChip
              key={id}
              on={housing === id && !simpleOnly}
              onClick={() => {
                setSimpleOnly(false);
                setHousing((current) => (current === id ? "" : id));
              }}
            >
              {housingLabel(id)}
            </FilterChip>
          ))}
          <FilterChip
            on={simpleOnly}
            onClick={() => {
              setHousing("");
              setSimpleOnly((on) => !on);
            }}
          >
            {t("newIntakeSimple")}
          </FilterChip>
        </div>
        <div className="flex flex-wrap gap-2">
          {districts.map((name) => (
            <FilterChip key={name} on={district === name} onClick={() => setDistrict((current) => (current === name ? "" : name))}>
              {placeDisplayName(name, locale)}
            </FilterChip>
          ))}
        </div>
      </div>

      <p className="mt-5 text-sm text-muted">{t("newIntakeShowing", { n: visible.length })}</p>
      {visible.length === 0 ? (
        <p className="mt-4 rounded-xl bg-card p-5 text-sm text-muted shadow-[var(--shadow-border)]">{t("estatesEmptyFilter")}</p>
      ) : (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {visible.map((card) => {
            const offer = card.offers[0];
            const body = (
              <>
                <p className="text-xs font-medium text-muted">
                  {card.housing ? housingLabel(card.housing) : t("newIntakeHousingUnknown")}
                  <span className="mx-1.5">·</span>
                  {placeDisplayName(card.district, locale)}
                </p>
                <p className="mt-1 text-lg font-semibold leading-snug">{displayName(card, locale)}</p>
                {offer ? (
                  <>
                    <p className="mt-3 text-sm font-medium text-[#1D4ED8]">
                      {t("newIntakeOfferLine", { fee: formatFee(offer.monthlyFee), name: offer.name })}
                    </p>
                    {card.offers.length > 1 ? (
                      <p className="mt-1 text-xs text-muted">{t("newIntakeMore", { n: card.offers.length - 1 })}</p>
                    ) : null}
                  </>
                ) : (
                  <p className="mt-3 text-sm font-medium text-fg">
                    {card.housing
                      ? t("newIntakeNoOffer", { housing: housingLabel(card.housing) })
                      : t("newIntakeFindLead")}
                  </p>
                )}
                <p className="mt-4 text-sm font-medium text-accent">
                  {card.housing ? t("newIntakeOpen") : t("newIntakeFind")}
                </p>
              </>
            );
            const className =
              "flex h-full flex-col rounded-2xl border border-[#E5E7EB] bg-white p-5 transition-[box-shadow,border-color] duration-150 hover:border-[#0F62FE] hover:shadow-md";
            return (
              <li key={card.name}>
                {card.slug ? (
                  <Link to="/estates/$slug" params={{ slug: card.slug }} className={className}>
                    {body}
                  </Link>
                ) : card.housing ? (
                  <Link
                    to="/plans"
                    search={{ cat: "broadband", estate: card.name, housing: card.housing }}
                    className={className}
                  >
                    {body}
                  </Link>
                ) : (
                  <Link to="/estates" className={className}>
                    {body}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <section className="mt-10 max-w-2xl border-t border-border pt-6">
        <h2 className="text-lg font-semibold">{t("faqTitle")}</h2>
        <div className="mt-3 divide-y divide-border">
          {(["1", "2", "3"] as const).map((n) => (
            <details key={n} className="group py-3">
              <summary className="cursor-pointer list-none text-sm font-semibold">
                {t(`newIntakeFaq${n}q` as "newIntakeFaq1q")}
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-muted">{t(`newIntakeFaq${n}a` as "newIntakeFaq1a")}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}

function FilterChip({ on, onClick, children }: { on: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "chip-press inline-flex h-11 items-center rounded-full px-3 text-sm font-medium",
        on ? "bg-primary text-primary-foreground" : "bg-card shadow-[var(--shadow-border)]",
      )}
    >
      {children}
    </button>
  );
}

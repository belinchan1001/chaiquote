import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { JsonLd } from "@/components/json-ld";
import { canonicalUrl } from "@/lib/canonical";
import { compact, estateDisplayName, placeDisplayName } from "@/lib/estates";
import { getEstatePage } from "@/lib/estate-pages";
import { useI18n, usePageTitle } from "@/lib/i18n";
import type { MessageKey } from "@/lib/messages";
import { newIntakeCards, type NewIntakeCard } from "@/lib/new-intake-page";
import { formatFee, type Housing } from "@/lib/plans";
import { cn } from "@/lib/utils";

const HEADING = "新入伙屋苑寬頻：有冇指定優惠？";
const HEADING_EN = "New move-in estate broadband: is there a named offer?";
const TITLE = "新入伙屋苑寬頻：有冇指定優惠？｜齊Quote";
const DESCRIPTION =
  "呢頁幫你對近年入伙或者即將入伙嘅屋苑，有冇指定新入伙優惠。指定新入伙計劃只適用於電訊商名單內嘅新入伙屋苑，其他普通屋苑唔可以用呢啲指定計劃。";
const FAQ_HEADING = "指定新入伙屋苑優惠常見問題";
const FAQ_HEADING_EN = "Common questions on named new-move-in estate offers";

const FAQ = [
  {
    qKey: "newIntakeFaq1q",
    aKey: "newIntakeFaq1a",
    q: "點解有啲屋苑有價，有啲冇？",
    a: "指定新入伙計劃只適用於電訊商名單內嘅新入伙屋苑。其他普通屋苑唔可以用呢啲指定計劃，只用同一樓類嘅一般計劃，亦唔會借用其他屋苑嘅月費。",
  },
  {
    qKey: "newIntakeFaq2q",
    aKey: "newIntakeFaq2a",
    q: "未入伙可唔可以預約安裝？",
    a: "未入伙可以預約安裝。指定新入伙優惠係為新入伙屋苑而設，月費通常會平過同一樓類嘅一般計劃；優惠好多時有限期，入伙之後可能會調整到普通屋苑嘅一般計劃。好多計劃都有一段可預先約定嘅生效期，建議配合裝修預先安裝，入伙之後先開通。可唔可以預約、幾時裝到、生效期同覆蓋，以電訊商確認為準。",
  },
  {
    qKey: "newIntakeFaq3q",
    aKey: "newIntakeFaq3a",
    q: "公屋價可唔可以用喺私樓？",
    a: "唔可以。公屋價唔可以用喺私樓，居屋價亦唔可以用喺公屋或者私樓。每張卡都標明樓類，入去只會見到該樓類適用嘅計劃。",
  },
] as const satisfies readonly { qKey: MessageKey; aKey: MessageKey; q: string; a: string }[];

const CARDS = newIntakeCards();
const OFFER_COUNT = CARDS.filter((card) => card.offers.length > 0).length;
const HOUSING_IDS: Housing[] = ["public", "hos", "private"];
/** Stored groups mix towns (東涌、屯門) with regions (九龍、新界). Keep both, but tuck the regions behind one control. */
const COARSE_INTAKE_AREAS = new Set(["九龍", "新界", "港島", "其他地區"]);

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
  const [offerOnly, setOfferOnly] = useState(false);
  const [moreAreas, setMoreAreas] = useState(false);
  const districts = useMemo(() => {
    const order: string[] = [];
    for (const card of CARDS) {
      if (!order.includes(card.district)) order.push(card.district);
    }
    return order;
  }, []);
  const fineDistricts = districts.filter((name) => !COARSE_INTAKE_AREAS.has(name));
  const coarseDistricts = districts.filter((name) => COARSE_INTAKE_AREAS.has(name));
  const showCoarse = moreAreas || COARSE_INTAKE_AREAS.has(district);
  const visible = useMemo(() => {
    const q = compact(query);
    return CARDS.filter((card) => {
      if (housing && card.housing !== housing) return false;
      if (district && card.district !== district) return false;
      if (simpleOnly && !card.simplePublic) return false;
      if (offerOnly && card.offers.length === 0) return false;
      if (!q) return true;
      return compact(card.name).includes(q);
    });
  }, [district, housing, offerOnly, query, simpleOnly]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-5 sm:py-8">
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
                { "@type": "ListItem", position: 1, name: "首頁", item: canonicalUrl("/") },
                { "@type": "ListItem", position: 2, name: "屋苑索引", item: canonicalUrl("/estates") },
                { "@type": "ListItem", position: 3, name: "新入伙", item: url },
              ],
            },
            {
              "@type": "FAQPage",
              mainEntity: FAQ.map((item) => ({
                "@type": "Question",
                name: item.q,
                acceptedAnswer: { "@type": "Answer", text: item.a },
              })),
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
      <h1 className="mt-[0.7rem] text-title font-semibold leading-[1.22] tracking-[-0.01em] text-pretty sm:mt-[1.15rem]">
        {locale === "en" ? (
          <>
            {HEADING_EN.slice(0, HEADING_EN.indexOf(":") + 1)}{" "}
            <span className="whitespace-nowrap">{HEADING_EN.slice(HEADING_EN.indexOf(":") + 2)}</span>
          </>
        ) : (
          <>
            {HEADING.slice(0, HEADING.indexOf("：") + 1)}
            <span className="whitespace-nowrap">{HEADING.slice(HEADING.indexOf("：") + 1)}</span>
          </>
        )}
      </h1>
      <p className="mt-[0.45rem] max-w-[42rem] text-[0.9375rem] leading-[1.7] text-[color-mix(in_srgb,var(--color-fg)_82%,var(--color-muted))] sm:mt-[0.55rem] sm:text-base sm:leading-[1.7]">
        {locale === "en" ? t("newIntakeLead") : DESCRIPTION}
      </p>
      <p className="mt-3 max-w-[42rem] text-sm leading-relaxed text-muted">
        {locale === "en" ? (
          <>
            For the handover timeline and cabling notes, see{" "}
            <Link
              to="/guides/$slug"
              params={{ slug: "new-estate-intake-broadband-timeline" }}
              className="font-medium text-accent underline-offset-4 hover:underline"
            >
              2027 new-estate broadband: intake timeline and cabling notes
            </Link>
            .
          </>
        ) : (
          <>
            收樓時間表同拉線避伏，見
            <Link
              to="/guides/$slug"
              params={{ slug: "new-estate-intake-broadband-timeline" }}
              className="font-medium text-accent underline-offset-4 hover:underline"
            >
              2027 新入伙屋苑寬頻：收樓時間表同拉線避伏
            </Link>
            。
          </>
        )}
      </p>

      <div className="mt-[0.7rem] flex flex-col gap-2 sm:mt-[1.1rem] sm:gap-[0.7rem]">
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
          <FilterChip
            on={housing === "" && !simpleOnly && !offerOnly}
            onClick={() => {
              setHousing("");
              setSimpleOnly(false);
              setOfferOnly(false);
            }}
          >
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
          <FilterChip
            on={offerOnly}
            wayfinding
            onClick={() => {
              setOfferOnly((on) => {
                if (!on) {
                  setHousing("");
                  setSimpleOnly(false);
                }
                return !on;
              });
            }}
          >
            {t("newIntakeOfferOnly")}
          </FilterChip>
        </div>
        <div className="flex flex-wrap gap-2">
          {fineDistricts.map((name) => (
            <FilterChip key={name} on={district === name} onClick={() => setDistrict((current) => (current === name ? "" : name))}>
              {placeDisplayName(name, locale)}
            </FilterChip>
          ))}
          {coarseDistricts.length ? (
            <button
              type="button"
              onClick={() => {
                if (showCoarse) {
                  if (COARSE_INTAKE_AREAS.has(district)) setDistrict("");
                  setMoreAreas(false);
                  return;
                }
                setMoreAreas(true);
              }}
              className="chip-press inline-flex h-11 items-center rounded-full px-3 text-sm font-medium text-accent"
            >
              {showCoarse ? t("newIntakeFewerAreas") : t("newIntakeMoreAreas")}
            </button>
          ) : null}
        </div>
        {showCoarse ? (
          <div className="flex flex-wrap gap-2">
            {coarseDistricts.map((name) => (
              <FilterChip key={name} on={district === name} onClick={() => setDistrict((current) => (current === name ? "" : name))}>
                {placeDisplayName(name, locale)}
              </FilterChip>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-[0.65rem] flex flex-wrap items-center gap-2 sm:mt-[0.9rem]">
        <p className="text-sm text-muted">{t("newIntakeShowing", { n: visible.length })}</p>
        <p className="inline-flex items-baseline gap-1.5 rounded-full bg-card px-2.5 py-1 text-sm shadow-[var(--shadow-border)]">
          <span className="font-display font-semibold tabular-nums">{CARDS.length}</span>
          <span className="text-[11px] font-medium tracking-wider text-muted">{t("navNewIntake")}</span>
        </p>
        <p className="inline-flex items-baseline gap-1.5 rounded-full bg-intake px-2.5 py-1 text-sm text-intake-foreground shadow-none">
          <span className="font-display font-semibold tabular-nums text-white">{OFFER_COUNT}</span>
          <span className="text-[11px] font-medium tracking-wider text-intake-foreground">{t("newIntakeOffer")}</span>
        </p>
      </div>
      <details className="group mt-[0.65rem] rounded-[12px] border border-border bg-surface sm:mt-[0.7rem]">
        <summary
          className="flex min-h-[3.05rem] cursor-pointer list-none items-center justify-between gap-3 px-4 py-[0.65rem] text-sm font-semibold leading-[1.35] tracking-[0.01em] text-fg"
          aria-label={locale === "en" ? FAQ_HEADING_EN : FAQ_HEADING}
        >
          <h2 className="m-0 min-w-0 text-pretty text-sm font-semibold leading-[1.35] tracking-[0.01em] text-fg">
            {locale === "en" ? FAQ_HEADING_EN : FAQ_HEADING}
          </h2>
          <span
            aria-hidden="true"
            className="block size-[0.45rem] shrink-0 rotate-45 border-b-[1.5px] border-r-[1.5px] border-muted transition-transform duration-150 group-open:rotate-[225deg]"
          />
        </summary>
        <div className="border-t border-border px-4 pb-[0.95rem]">
          {FAQ.map((item, index) => (
            <div key={item.qKey} className={index === 0 ? "" : "mt-[0.7rem] border-t border-border pt-[0.7rem]"}>
              <p className="mt-[0.7rem] text-sm font-semibold leading-[1.45] text-fg">
                {locale === "en" ? t(item.qKey) : item.q}
              </p>
              <p className="mt-[0.3rem] text-sm leading-[1.7] text-muted">{locale === "en" ? t(item.aKey) : item.a}</p>
            </div>
          ))}
        </div>
      </details>
      {visible.length === 0 ? (
        <p className="mt-4 rounded-xl bg-card p-5 text-sm text-muted shadow-[var(--shadow-border)]">{t("estatesEmptyFilter")}</p>
      ) : (
        <ul className="mt-[0.65rem] grid gap-3 sm:mt-[0.9rem] sm:grid-cols-2">
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
                      <span className="text-intake">{locale === "en" ? "Named move-in offer" : "指定新入伙優惠"}</span>
                      {locale === "en"
                        ? ` ${formatFee(offer.monthlyFee)}/mo · ${offer.name}`
                        : ` ${formatFee(offer.monthlyFee)}／月 · ${offer.name}`}
                    </p>
                    {card.offers.length > 1 ? (
                      <p className="mt-1 text-xs text-muted">{t("newIntakeMore", { n: card.offers.length - 1 })}</p>
                    ) : null}
                  </>
                ) : (
                  <>
                    <p className="mt-3 text-sm font-medium text-fg">
                      {card.housing
                        ? t("newIntakeNoOffer", { housing: housingLabel(card.housing) })
                        : t("newIntakeFindLead")}
                    </p>
                    {card.housing === "private" ? (
                      <p className="mt-1 text-xs font-medium text-muted">{t("newIntakeGenericPrice")}</p>
                    ) : null}
                  </>
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

    </div>
  );
}

function FilterChip({
  on,
  onClick,
  children,
  wayfinding = false,
}: {
  on: boolean;
  onClick: () => void;
  children: string;
  wayfinding?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "chip-press inline-flex h-11 items-center rounded-full px-3 text-sm font-medium",
        on
          ? "bg-primary text-primary-foreground"
          : wayfinding
            ? "bg-[color-mix(in_srgb,var(--color-intake)_8%,var(--color-card))] text-intake shadow-[0_0_0_1px_color-mix(in_srgb,var(--color-intake)_34%,transparent)]"
            : "bg-card shadow-[var(--shadow-border)]",
      )}
    >
      {children}
    </button>
  );
}

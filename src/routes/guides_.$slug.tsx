import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/json-ld";
import { QuoteLink } from "@/components/quote-link";
import { WhatsAppIcon } from "@/components/whatsapp-icon";
import { guideFooterEstates } from "@/lib/estate-pages";
import {
  formulaLines,
  getGuide,
  guideCopy,
  guideManuscriptDates,
  rowDisplayText,
  splitTrailingFigure,
  type GuideAnswer,
  type GuideFlowBlock,
  type GuideLink,
  type GuideMatrix,
  type GuideTable,
} from "@/lib/guides";
import { guideTopicImage } from "@/lib/guide-media";
import {
  CITE_VISUAL_ROLES,
  GUIDE_BODY_TERMS_EN,
  GUIDE_BODY_TERMS_ZH,
  GUIDE_INTRO_TERMS_EN,
  GUIDE_INTRO_TERMS_ZH,
  emphasizeGuideTerms,
  guideCitePieces,
  markGuidePrices,
  splitGuideTitle,
  type CitePiece,
  type CitePlacement,
  type CiteRole,
} from "@/lib/guide-typography";
import { CARD_IMAGE_SIZES, webpSrcSet } from "@/lib/image-src";
import { useI18n, usePageTitle } from "@/lib/i18n";
import { canonicalUrl, notFoundHead } from "@/lib/canonical";
import { guideJsonLd } from "@/lib/seo";
import { SITE } from "@/lib/site";
import { whatsappHref } from "@/lib/whatsapp";
import { quoteWhatsAppActivateProps } from "@/lib/wa-quote-open";

export const Route = createFileRoute("/guides_/$slug")({
  loader: ({ params }) => {
    const guide = getGuide(params.slug);
    if (!guide) throw notFound();
    return { guide };
  },
  component: GuidePage,
  head: ({ loaderData }) => {
    if (!loaderData) return notFoundHead();
    const { guide } = loaderData;
    const url = canonicalUrl(`/guides/${guide.slug}`);
    const image = guideTopicImage(guide.slug);
    return {
      meta: [
        { title: guide.seoTitle },
        { name: "description", content: guide.description },
        { property: "og:title", content: guide.seoTitle },
        { property: "og:description", content: guide.description },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
        { property: "og:locale", content: "zh_HK" },
        { property: "og:site_name", content: SITE.name },
        ...(image
          ? [
              { property: "og:image", content: image.src },
              { name: "twitter:image", content: image.src },
            ]
          : []),
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
});

function headingId(heading: string) {
  return heading.replace(/\s+/g, "");
}

function GuideRichText({
  text,
  prices = false,
  strong = "semibold",
  figures = false,
}: {
  text: string;
  prices?: boolean;
  strong?: "semibold" | "bold";
  /** Cost-guide figures already marked in the manuscript. Joins ／月 onto the price. */
  figures?: boolean;
}) {
  const source = figures
    ? text.replace(/\*\*(HK\$\d[\d,]*(?:\.\d+)?)\*\*／月/g, "**$1／月**")
    : prices
      ? markGuidePrices(text)
      : text;
  const parts = source.split(/(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, index) => {
        const bold = part.match(/^\*\*([^*]+)\*\*$/);
        if (bold) {
          const token = bold[1] ?? "";
          const price = figures
            ? /^HK\$\d[\d,]*(?:\.\d+)?(?:／月)?$/.test(token)
            : prices && /HK\$\d/.test(token);
          const count = figures && /^\d+(?:\.\d+)?$/.test(token);
          return (
            <strong
              key={index}
              className={
                price
                  ? "font-bold whitespace-nowrap tabular-nums text-accent"
                  : count
                    ? "font-bold whitespace-nowrap tabular-nums text-fg"
                    : strong === "bold"
                      ? "font-bold text-fg"
                      : "font-semibold text-fg"
              }
            >
              {token}
            </strong>
          );
        }
        const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        if (link) {
          const priceLink = /^HK\$\d/.test(link[1]);
          return (
            <a
              key={index}
              href={link[2]}
              className={
                priceLink
                  ? "guide-inline-link font-bold whitespace-nowrap tabular-nums"
                  : "guide-inline-link"
              }
            >
              {link[1]}
            </a>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
}

const FIGURE_SPLIT = /(HK\$\d[\d,]*(?:[–—-]\d[\d,]*)?(?:／月(?:起)?|\/month)?|\d{3,5}M)/g;

function isFigure(part: string) {
  return (
    /^HK\$\d[\d,]*(?:[–—-]\d[\d,]*)?(?:／月(?:起)?|\/month)?$/.test(part) || /^\d{3,5}M$/.test(part)
  );
}

function FigureText({ text }: { text: string }) {
  const parts = text.split(FIGURE_SPLIT);
  return (
    <>
      {parts.map((part, index) =>
        isFigure(part) ? (
          <strong key={index} className="font-bold whitespace-nowrap tabular-nums text-accent">
            {part}
          </strong>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </>
  );
}

function trimRowPunctuation(text: string) {
  return text.replace(/^[\s、，；。,;]+/u, "").replace(/[\s、，；。,;]+$/u, "");
}

/** Drop list punctuation from a split row. Words, figures, and inner qualifiers stay. */
function unwrapRow(raw: string) {
  const text = raw.trim();
  if (text.startsWith("（") && text.endsWith("）。")) return text.slice(1, -2);
  if (text.startsWith("(") && text.endsWith(").")) return text.slice(1, -2);
  return text;
}

function parsePriceRow(raw: string) {
  const text = trimRowPunctuation(unwrapRow(raw));
  const match = /^(.*?)(HK\$\d[\d,]*(?:[–—-]\d[\d,]*)?)(.*)$/.exec(text);
  if (!match) return null;
  const unitMatch = /^(\s*(?:／月(?:起)?|\/month))([\s\S]*)$/.exec(match[3]);
  return {
    label: trimRowPunctuation(match[1]),
    price: match[2],
    unit: unitMatch ? unitMatch[1].trim() : "",
    qualifier: trimRowPunctuation(unitMatch ? unitMatch[2] : match[3]),
  };
}

function CiteChip({ text }: { text: string }) {
  const match = /^(.*?)(HK\$\d[\d,]*(?:[–—-]\d[\d,]*)?)(.*)$/.exec(text);
  if (!match) return <FigureText text={text} />;
  const [, prefix, price, suffix] = match;
  const shownSuffix = trimRowPunctuation(suffix);
  return (
    <>
      <span className="block break-keep text-xs font-medium leading-snug text-muted">
        {prefix.trim()}
      </span>
      <span className="mt-1 block text-lg leading-none font-bold whitespace-nowrap tabular-nums text-accent">
        {price}
        {shownSuffix ? (
          <span className="text-sm font-semibold whitespace-nowrap text-fg">{shownSuffix}</span>
        ) : null}
      </span>
    </>
  );
}

function PriceRow({ text }: { text: string }) {
  const row = parsePriceRow(text);
  if (!row) {
    return (
      <p className="break-keep text-base font-medium leading-snug text-fg">
        <CiteSentence text={text} />
      </p>
    );
  }
  const price = (
    <p className="shrink-0 text-lg leading-none font-bold whitespace-nowrap tabular-nums text-accent">
      {row.price}
      {row.unit ? <span className="text-sm font-semibold text-fg">{row.unit}</span> : null}
    </p>
  );
  const qualifier = row.qualifier ? (
    <p className="mt-1 break-keep text-xs leading-snug text-muted">{row.qualifier}</p>
  ) : null;
  if (row.label.length > 18) {
    return (
      <div className="rounded-lg bg-surface px-3 py-2.5">
        <p className="break-keep text-sm font-medium leading-snug text-fg">{row.label}</p>
        <div className="mt-1">{price}</div>
        {qualifier}
      </div>
    );
  }
  return (
    <div className="rounded-lg bg-surface px-3 py-2.5">
      <div className="flex items-baseline justify-between gap-3">
        <p className="min-w-0 break-keep text-sm font-medium leading-snug text-fg">{row.label}</p>
        {price}
      </div>
      {qualifier}
    </div>
  );
}

function citeGroup(pieces: CitePiece[], role: CiteRole) {
  return pieces.filter((piece) => piece.role === role);
}

function CiteSentence({ text }: { text: string }) {
  if (text.includes("](")) {
    return <GuideRichText text={text} prices strong="bold" />;
  }
  return <FigureText text={text} />;
}

function GuideCite({ text, part }: { text: string; part: CitePlacement }) {
  const pieces = guideCitePieces(text);
  if (!pieces) {
    if (part === "later") return null;
    return <GuideRichText text={text} />;
  }
  const visible = pieces.filter((piece) => piece.placement === part);
  if (!visible.length) return null;
  if (part === "later") {
    return (
      <blockquote className="mt-4 border-l-4 border-border px-4 py-1 text-xs leading-relaxed break-keep text-muted">
        <div className="space-y-2">
          {visible.map((piece) => (
            <p key={piece.id}>
              <CiteSentence text={piece.text} />
            </p>
          ))}
        </div>
      </blockquote>
    );
  }
  const grouped = CITE_VISUAL_ROLES.map((role) => ({ role, pieces: citeGroup(visible, role) }));
  return (
    <div className="space-y-3">
      {grouped.map(({ role, pieces: group }) => {
        if (!group.length) return null;
        if (role === "lead") {
          return (
            <p key={role} className="text-base leading-relaxed text-fg">
              <CiteSentence text={group.map((piece) => piece.text).join("")} />
            </p>
          );
        }
        if (role === "site-label") {
          return (
            <p key={role} className="text-xs font-semibold tracking-wide text-subtle">
              <CiteSentence text={group.map((piece) => piece.text).join("")} />
            </p>
          );
        }
        if (role === "site-chip") {
          return (
            <ul key={role} className="grid grid-cols-2 gap-2">
              {group.map((piece, index) => (
                <li
                  key={piece.id}
                  className={`rounded-lg bg-surface px-3 py-2 ${index === group.length - 1 ? "col-span-2" : ""}`}
                >
                  <CiteChip text={piece.text} />
                </li>
              ))}
            </ul>
          );
        }
        if (role === "site-qualifier") {
          return (
            <p key={role} className="text-sm leading-relaxed text-muted">
              <CiteSentence text={group.map((piece) => piece.text).join("")} />
            </p>
          );
        }
        if (role === "site-caveat") {
          return (
            <p key={role} className="text-xs leading-relaxed text-muted">
              <CiteSentence text={group.map((piece) => piece.text).join("")} />
            </p>
          );
        }
        if (role === "compare-intro") {
          return (
            <p
              key={role}
              className="border-t border-border pt-3 text-sm font-semibold break-keep text-fg"
            >
              <CiteSentence text={group.map((piece) => piece.text).join("")} />
            </p>
          );
        }
        if (role === "compare-row" || role === "village-row") {
          const linked = group.some((piece) => piece.text.includes("]("));
          if (linked) {
            return (
              <ul key={role} className="space-y-1.5">
                {group.map((piece) => (
                  <li
                    key={piece.id}
                    className="break-keep text-base font-medium leading-snug text-fg"
                  >
                    <CiteSentence text={piece.text} />
                  </li>
                ))}
              </ul>
            );
          }
          return (
            <ul key={role} className="grid gap-2">
              {group.map((piece) => (
                <li key={piece.id}>
                  <PriceRow text={piece.text} />
                </li>
              ))}
            </ul>
          );
        }
        if (role === "village-label") {
          return (
            <p key={role} className="text-sm font-bold break-keep text-fg">
              {trimRowPunctuation(group.map((piece) => piece.text).join(""))}
            </p>
          );
        }
        return (
          <div
            key={role}
            className="space-y-1.5 border-t border-border pt-3 text-xs leading-relaxed text-muted"
          >
            {group.map((piece) => (
              <p key={piece.id}>
                <CiteSentence text={piece.text} />
              </p>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function GuideTitle({ text, split }: { text: string; split: boolean }) {
  const parts = split ? splitGuideTitle(text) : null;
  if (!parts) return <h1 className="mt-2 text-title font-semibold">{text}</h1>;
  return (
    <h1 className="mt-3 text-fg">
      <span className="block text-[2rem] leading-[1.15] font-bold text-fg sm:text-[2.65rem]">
        {parts.title}
        <span className="text-subtle">{parts.mark}</span>
      </span>
      <span className="mt-2 block text-lg leading-snug font-medium text-muted sm:text-xl">
        {parts.subtitle}
      </span>
    </h1>
  );
}

function GuideMatrixTable({ matrix }: { matrix: GuideMatrix }) {
  return (
    <div className="mt-4">
      <div className="overflow-x-auto rounded-xl shadow-[var(--shadow-border)]">
        <table className="w-full min-w-[52rem] border-collapse bg-card text-left text-sm">
          <caption className="border-b border-border px-3 py-3 text-left text-xs leading-relaxed text-subtle">
            {matrix.caption}
          </caption>
          <thead>
            <tr className="border-b border-border">
              {matrix.headers.map((header) => (
                <th
                  key={header}
                  scope="col"
                  className="px-3 py-3 align-bottom font-semibold text-fg"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.rows.map((row) => (
              <tr key={row[0]} className="border-b border-border last:border-b-0">
                {row.map((cell, index) =>
                  index === 0 ? (
                    <th
                      key={index}
                      scope="row"
                      className="px-3 py-3 align-top font-semibold text-fg"
                    >
                      <GuideRichText text={cell} />
                    </th>
                  ) : (
                    <td key={index} className="px-3 py-3 align-top leading-relaxed text-muted">
                      <GuideRichText text={cell} />
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {matrix.notes?.length ? (
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted">
          {matrix.notes.map((note) => (
            <li key={note}>
              <GuideRichText text={note} />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function GuideCompareCards({ table, seeDetail }: { table: GuideTable; seeDetail: string }) {
  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      {table.rows.map((row) => (
        <a
          key={row.label}
          href={row.href}
          className="flex h-full min-h-11 flex-col rounded-xl bg-card p-4 shadow-[var(--shadow-border)] transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-border-hover)]"
        >
          <p className="font-semibold">{row.label}</p>
          <p className="mt-1 flex-1 text-sm leading-relaxed text-muted">{row.value}</p>
          <p className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-accent">
            {seeDetail}
            <ArrowRight className="size-4" />
          </p>
        </a>
      ))}
    </div>
  );
}

function guideLinkLabel(item: GuideLink, locale: "zh" | "en") {
  return locale === "en" && item.labelEn ? item.labelEn : item.label;
}

function GuideDateLine({
  guide,
  minutes,
  single,
}: {
  guide: { published?: string; modified?: string; minutes: number };
  minutes: number;
  single?: boolean;
}) {
  const { t } = useI18n();
  const { published, modified } = guideManuscriptDates(guide);
  const date = single
    ? published
      ? t("dataUpdated", { date: modified ?? published })
      : null
    : published
      ? modified
        ? t("manuscriptUpdated", { published, modified })
        : t("manuscriptDate", { date: published })
      : null;
  return (
    <>
      {date ? (
        <>
          {date}
          <span className="mx-1.5 text-subtle/70">·</span>
        </>
      ) : null}
      {t("minutesRead", { n: minutes })}
    </>
  );
}

function GuideToc({
  items,
  label,
  className,
}: {
  items: { id: string; label: string }[];
  label: string;
  className?: string;
}) {
  return (
    <nav aria-label={label} className={className}>
      <p className="text-xs font-medium tracking-wider text-subtle uppercase">{label}</p>
      <ol className="mt-1">
        {items.map((item, index) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="flex min-h-11 items-center gap-3 text-sm text-fg hover:text-accent"
            >
              <span className="w-6 shrink-0 tabular-nums text-subtle">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span>{item.label}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function GuideAnswerTable({
  table,
  article = false,
}: {
  table: GuideAnswer["table"];
  article?: boolean;
}) {
  return (
    <div className={article ? "mt-3" : "mt-4"}>
      <div
        id="guide-answer-table"
        className="overflow-x-auto rounded-xl shadow-[var(--shadow-border)]"
      >
        <table className="w-full border-collapse bg-card text-left text-sm">
          <caption
            className={
              article
                ? "border-b border-border px-3 py-3 text-left text-sm leading-relaxed font-semibold text-fg"
                : "border-b border-border px-3 py-3 text-left text-xs leading-relaxed text-subtle"
            }
          >
            {table.caption}
          </caption>
          <thead>
            <tr
              className={article ? "border-b-2 border-fg/15 bg-surface" : "border-b border-border"}
            >
              {table.headers.map((header) => (
                <th
                  key={header}
                  scope="col"
                  className={
                    article
                      ? "px-3 py-3.5 align-bottom text-sm font-bold text-fg"
                      : "px-3 py-3 align-bottom font-semibold text-fg"
                  }
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row) => (
              <tr key={row[0]} className="border-b border-border last:border-b-0">
                {row.map((cell, index) =>
                  index === 0 ? (
                    <th
                      key={index}
                      scope="row"
                      className={
                        article
                          ? "px-3 py-3 align-top font-bold whitespace-nowrap text-fg"
                          : "px-3 py-3 align-top font-semibold whitespace-nowrap text-fg"
                      }
                    >
                      <GuideRichText
                        text={cell}
                        prices={article}
                        strong={article ? "bold" : "semibold"}
                      />
                    </th>
                  ) : (
                    <td
                      key={index}
                      className={
                        article
                          ? "px-3 py-3 align-top text-sm leading-relaxed text-fg"
                          : "px-3 py-3 align-top leading-relaxed text-muted"
                      }
                    >
                      <GuideRichText text={cell} prices={article} />
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {table.notes?.length ? (
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted">
          {table.notes.map((note) => (
            <li key={note}>
              <GuideRichText text={note} prices={article} />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function GuideFlow({
  blocks,
  article = false,
  emphasize,
  figures = false,
}: {
  blocks: GuideFlowBlock[];
  article?: boolean;
  emphasize?: (text: string) => string;
  figures?: boolean;
}) {
  const prose = article ? "text-fg" : "text-muted";
  const weight = article || figures ? "bold" : "semibold";
  const show = (value: string) => (emphasize ? emphasize(value) : value);
  return (
    <>
      {blocks.map((block, index) => {
        if (block.kind === "h3") {
          return (
            <h3
              key={index}
              className={
                article || figures
                  ? "mt-8 text-xl font-bold text-fg"
                  : "mt-6 text-base font-semibold text-fg"
              }
            >
              {block.text}
            </h3>
          );
        }
        if (block.kind === "formula") {
          return (
            <div
              key={index}
              className="mt-3 overflow-x-auto rounded-xl border-l-4 border-accent bg-card px-4 py-3 shadow-[var(--shadow-border)]"
            >
              {formulaLines(block.text).map((line, lineIndex) => (
                <p
                  key={lineIndex}
                  className="whitespace-nowrap text-base leading-8 font-bold tabular-nums text-fg"
                >
                  {line}
                </p>
              ))}
            </div>
          );
        }
        if (block.kind === "rows") {
          return (
            <ul
              key={index}
              className="mt-3 overflow-hidden rounded-xl bg-card shadow-[var(--shadow-border)]"
            >
              {block.items.map((item) => {
                const row = splitTrailingFigure(item);
                if (!row) {
                  return (
                    <li
                      key={item}
                      className="border-b border-border px-3 py-2.5 text-sm leading-snug text-fg last:border-b-0"
                    >
                      <GuideRichText
                        text={rowDisplayText(item)}
                        figures={figures}
                        strong={weight}
                      />
                    </li>
                  );
                }
                return (
                  <li
                    key={item}
                    className="flex items-baseline justify-between gap-3 border-b border-border px-3 py-2.5 last:border-b-0"
                  >
                    <span className="min-w-0 text-sm leading-snug text-fg">
                      <GuideRichText
                        text={rowDisplayText(row.label)}
                        figures={figures}
                        strong={weight}
                      />
                    </span>
                    <span className="shrink-0 text-base leading-none whitespace-nowrap">
                      <GuideRichText
                        text={rowDisplayText(row.value)}
                        figures={figures}
                        strong={weight}
                      />
                    </span>
                  </li>
                );
              })}
            </ul>
          );
        }
        if (block.kind === "ul" || block.kind === "ol") {
          const List = block.kind === "ol" ? "ol" : "ul";
          return (
            <List
              key={index}
              className={`mt-3 space-y-2 pl-5 text-base leading-relaxed ${prose} ${block.kind === "ol" ? "list-decimal" : "list-disc"}`}
            >
              {block.items.map((item) => (
                <li key={item}>
                  <GuideRichText text={show(item)} figures={figures} strong={weight} />
                </li>
              ))}
            </List>
          );
        }
        return (
          <p key={index} className={`mt-3 text-base leading-relaxed ${prose}`}>
            <GuideRichText text={show(block.text)} figures={figures} strong={weight} />
          </p>
        );
      })}
    </>
  );
}

function GuideTopicPicture({ slug, locale }: { slug: string; locale: "zh" | "en" }) {
  const topicImage = guideTopicImage(slug);
  if (!topicImage) return null;
  return (
    <picture className="photo-strip mt-6">
      <source srcSet={webpSrcSet(topicImage.src)} sizes={CARD_IMAGE_SIZES} type="image/webp" />
      <img
        src={topicImage.src}
        alt={locale === "en" ? topicImage.altEn : topicImage.alt}
        width={topicImage.width}
        height={topicImage.height}
        sizes={CARD_IMAGE_SIZES}
        loading="lazy"
        decoding="async"
        className="rounded-xl outline outline-1 -outline-offset-1 outline-fg/10"
      />
    </picture>
  );
}

function GuidePage() {
  const { guide } = Route.useLoaderData();
  const { t, locale } = useI18n();
  const copy = guideCopy(guide, locale);
  usePageTitle(guide.seoTitle);
  const related = (guide.related ?? [])
    .map((slug) => getGuide(slug))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const plans = guide.plans ?? [];
  const primaryPlan = plans[0];
  const estates = guideFooterEstates(guide.slug, guide.estates, locale, guide.estateChipLimit);
  const toc = [
    ...copy.body.map((section) => ({ id: headingId(section.heading), label: section.heading })),
    ...(copy.faq.length ? [{ id: "faq", label: t("faqHeading") }] : []),
  ];
  const firstTableHeading = copy.body.find((section) => section.table || section.matrix)?.heading;
  const wide = copy.body.some((section) => section.matrix);
  const answerLed = Boolean(copy.answer);
  const article = guide.slug === "hkbn-vs-netvigator" || guide.slug === "village-cmhk";
  const costGuide = guide.slug === "broadband-total-cost" || guide.slug === "contract-fees";
  const tocClass = "mt-6 rounded-xl bg-card px-4 py-3 shadow-[var(--shadow-border)]";
  const showInlinePlan = !guide.plansOnlyCta;
  const emphasizeBody = article
    ? (value: string) =>
        emphasizeGuideTerms(
          value,
          locale === "en" ? GUIDE_BODY_TERMS_EN : GUIDE_BODY_TERMS_ZH,
          true,
        )
    : undefined;

  return (
    <article
      data-answer-led={answerLed ? "" : undefined}
      data-guide-fab-clear={answerLed ? "" : undefined}
      className={
        answerLed
          ? "mx-auto max-w-xl px-4 pt-8 pb-32 lg:max-w-[56rem] lg:pb-12"
          : `mx-auto px-4 pt-10 pb-10 ${wide ? "max-w-5xl" : "max-w-2xl"}${costGuide ? " guide-article" : ""}`
      }
    >
      <JsonLd data={guideJsonLd(guide)} />
      <nav aria-label={t("crumbNav")} className="text-sm text-muted">
        <ol className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <li>
            <Link to="/" className="hover:text-fg">
              {t("crumbHome")}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link to="/guides" className="hover:text-fg">
              {t("navGuides")}
            </Link>
          </li>
        </ol>
      </nav>
      <div
        className={
          answerLed
            ? "lg:grid lg:grid-cols-[minmax(0,36rem)_14rem] lg:items-start lg:gap-8"
            : undefined
        }
      >
        <div>
          <p className="mt-6 text-xs text-subtle">
            <GuideDateLine guide={guide} minutes={guide.minutes} single={answerLed} />
          </p>
          <GuideTitle text={copy.h1} split={article || costGuide} />
          {copy.answer ? (
            <>
              {copy.answer.lead.map((paragraph) => (
                <p key={paragraph} className="mt-3 text-base leading-relaxed text-muted">
                  <GuideRichText text={paragraph} />
                </p>
              ))}
              <blockquote
                className={
                  article
                    ? "mt-4 rounded-xl border-l-4 border-accent bg-card px-4 py-3 text-base leading-snug text-fg shadow-[var(--shadow-border)]"
                    : "mt-6 rounded-xl border-l-4 border-accent bg-card px-4 py-4 text-base leading-relaxed text-fg shadow-[var(--shadow-border)]"
                }
              >
                <GuideCite text={copy.answer.cite} part="opening" />
              </blockquote>
              {copy.answer.afterCite?.map((paragraph) => (
                <p
                  key={paragraph}
                  className={
                    article
                      ? "mt-3 text-base leading-relaxed text-fg"
                      : "mt-3 text-base leading-relaxed text-muted"
                  }
                >
                  <GuideRichText
                    text={
                      article
                        ? emphasizeGuideTerms(
                            paragraph,
                            locale === "en" ? GUIDE_INTRO_TERMS_EN : GUIDE_INTRO_TERMS_ZH,
                          )
                        : paragraph
                    }
                    strong={article ? "bold" : "semibold"}
                  />
                </p>
              ))}
              <GuideAnswerTable table={copy.answer.table} article={article} />
              <GuideCite text={copy.answer.cite} part="later" />
              {toc.length > 2 ? (
                <GuideToc items={toc} label={t("tocLabel")} className={`${tocClass} lg:hidden`} />
              ) : null}
            </>
          ) : (
            <p className="mt-3 text-base leading-relaxed text-muted">
              <GuideRichText text={copy.excerpt} />
            </p>
          )}
          {answerLed ? null : <GuideTopicPicture slug={guide.slug} locale={locale} />}
          {!answerLed && toc.length > 2 ? (
            <GuideToc items={toc} label={t("tocLabel")} className={tocClass} />
          ) : null}
          {copy.body.map((section) => (
            <section
              key={section.heading}
              id={headingId(section.heading)}
              className={article || costGuide ? "mt-12 scroll-mt-24" : "mt-8 scroll-mt-24"}
            >
              <h2
                className={
                  article || costGuide ? "text-2xl font-bold text-fg" : "text-lg font-semibold"
                }
              >
                {section.heading}
              </h2>
              {section.flow?.length ? (
                <GuideFlow
                  blocks={section.flow}
                  article={article}
                  emphasize={emphasizeBody}
                  figures={costGuide}
                />
              ) : (
                section.paragraphs.map((p) => (
                  <p
                    key={p}
                    className={`mt-3 text-base leading-relaxed ${article ? "text-fg" : "text-muted"}`}
                  >
                    <GuideRichText
                      text={emphasizeBody ? emphasizeBody(p) : p}
                      figures={costGuide}
                      strong={article || costGuide ? "bold" : "semibold"}
                    />
                  </p>
                ))
              )}
              {section.matrix ? <GuideMatrixTable matrix={section.matrix} /> : null}
              {section.table ? (
                <GuideCompareCards table={section.table} seeDetail={t("seeDetail")} />
              ) : null}
              {showInlinePlan && section.heading === firstTableHeading && primaryPlan ? (
                <Button asChild className="mt-5 w-full sm:w-auto">
                  <a href={primaryPlan.href}>
                    {guideLinkLabel(primaryPlan, locale)}
                    <ArrowRight className="size-4" />
                  </a>
                </Button>
              ) : null}
            </section>
          ))}
          {copy.faq.length > 0 ? (
            <section
              id="faq"
              className={article || costGuide ? "mt-12 scroll-mt-24" : "mt-10 scroll-mt-24"}
            >
              <h2
                className={
                  article || costGuide ? "text-2xl font-bold text-fg" : "text-lg font-semibold"
                }
              >
                {t("faqHeading")}
              </h2>
              <div className="mt-3 divide-y divide-border rounded-xl bg-card px-4 shadow-[var(--shadow-border)]">
                {copy.faq.map((item) => (
                  <details key={item.q} className="group py-3">
                    <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-medium">
                      {item.q}
                      <span className="text-subtle transition-transform duration-150 group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <p
                      className={`pb-3 text-sm leading-relaxed ${article ? "text-fg" : "text-muted"}`}
                    >
                      <GuideRichText
                        text={emphasizeBody ? emphasizeBody(item.a) : item.a}
                        figures={costGuide}
                        strong={article || costGuide ? "bold" : "semibold"}
                      />
                    </p>
                  </details>
                ))}
              </div>
            </section>
          ) : null}
          {copy.disclaimer ? (
            <p className="mt-8 text-sm leading-relaxed text-subtle">
              <GuideRichText text={copy.disclaimer} />
            </p>
          ) : null}
          {related.length > 0 && !answerLed && !costGuide ? (
            <section className="mt-10">
              <h2 className="text-lg font-semibold">{t("relatedHeading")}</h2>
              <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                {related.map((item) => {
                  const relatedCopy = guideCopy(item, locale);
                  return (
                    <li key={item.slug}>
                      <Link
                        to="/guides/$slug"
                        params={{ slug: item.slug }}
                        className="flex min-h-11 items-center justify-between gap-3 rounded-xl bg-card px-4 py-3 text-sm font-medium shadow-[var(--shadow-border)] transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-border-hover)]"
                      >
                        <span>{relatedCopy.title}</span>
                        <ArrowRight className="size-4 shrink-0 text-accent" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}
          <section
            id="guide-end-cta"
            className="mt-10 rounded-xl bg-card p-5 shadow-[var(--shadow-border)]"
          >
            <p className="font-semibold">{copy.ctaLead ?? t("guideCta")}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">{t("guideConfirm")}</p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              {primaryPlan ? (
                <Button asChild className="w-full sm:w-auto">
                  <a href={primaryPlan.href}>
                    {guideLinkLabel(primaryPlan, locale)}
                    <ArrowRight className="size-4" />
                  </a>
                </Button>
              ) : null}
              {showInlinePlan ? (
                copy.ctaButton && copy.waText ? (
                  <Button asChild variant="whatsapp" className="w-full sm:w-auto">
                    <a
                      href={whatsappHref(copy.waText)}
                      target="_blank"
                      rel="noopener noreferrer"
                      {...quoteWhatsAppActivateProps(copy.waText, SITE.whatsappE164, {
                        source: "guide",
                      })}
                    >
                      <WhatsAppIcon />
                      <span className="truncate">{copy.ctaButton}</span>
                    </a>
                  </Button>
                ) : (
                  <QuoteLink className="w-full sm:w-auto" inquiry={guide.inquiry}>
                    查核報價
                  </QuoteLink>
                )
              ) : null}
            </div>
            {showInlinePlan && plans.length > 1 ? (
              <p className="mt-4 text-sm text-muted">
                {plans.slice(1).map((item, index) => (
                  <span key={item.href}>
                    {index > 0 ? " · " : null}
                    <a href={item.href} className="text-accent underline-offset-4 hover:underline">
                      {guideLinkLabel(item, locale)}
                    </a>
                  </span>
                ))}
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {estates.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="inline-flex h-11 items-center rounded-full bg-surface px-4 text-sm text-fg hover:bg-border"
                >
                  {guideLinkLabel(item, locale)}
                </a>
              ))}
              {guide.estateChipLimit != null ? (
                <a
                  href="/estates"
                  className="inline-flex h-11 items-center px-1 text-sm font-medium text-accent underline-offset-4 hover:underline"
                >
                  {locale === "en" ? "More estates" : "睇更多屋苑"}
                </a>
              ) : null}
            </div>
          </section>
          {related.length > 0 && (answerLed || costGuide) ? (
            <section className="mt-8" aria-labelledby="guide-related-heading">
              <h2 id="guide-related-heading" className="text-sm font-medium text-subtle">
                {t("relatedHeading")}
              </h2>
              <ul className="mt-1 columns-1 sm:columns-2">
                {related.map((item) => {
                  const relatedCopy = guideCopy(item, locale);
                  return (
                    <li key={item.slug} className="break-inside-avoid">
                      <Link
                        to="/guides/$slug"
                        params={{ slug: item.slug }}
                        className="guide-inline-link inline-flex min-h-11 items-center text-sm"
                      >
                        {relatedCopy.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}
        </div>
        {answerLed && toc.length > 2 ? (
          <div className="sticky top-24 hidden lg:block">
            <GuideToc items={toc} label={t("tocLabel")} className={tocClass} />
          </div>
        ) : null}
      </div>
    </article>
  );
}

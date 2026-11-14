import {
  VILLAGE_CMHK_OPENING,
  VILLAGE_CMHK_OPENING_EN,
  VILLAGE_SPECIFIED_ADDRESS_CITE,
  VILLAGE_SPECIFIED_ADDRESS_CITE_EN,
  linkCmhkVillageAmounts,
} from "./site.ts";

export const GUIDE_INTRO_TERMS_ZH = ["香港寬頻", "網上行", "樓類", "速率"] as const;

export const GUIDE_INTRO_TERMS_EN = ["Netvigator", "HKBN", "housing type", "speed"] as const;

/** Longer phrases first so a shorter term cannot split one already wrapped. */
export const GUIDE_BODY_TERMS_ZH = [
  "香港寬頻",
  "網上行",
  "公屋／居屋",
  "公居屋",
  "私樓",
  "村屋",
  "居屋",
  "公屋",
  "2500M",
  "2000M",
  "1000M",
  "樓類",
  "速率",
] as const;

export const GUIDE_BODY_TERMS_EN = [
  "Public housing / HOS",
  "public housing and HOS",
  "public / HOS",
  "village houses",
  "village house",
  "private flats",
  "private-flat",
  "public-housing",
  "housing type",
  "Netvigator",
  "HKBN",
  "2500M",
  "2000M",
  "1000M",
  "HOS",
  "Village",
  "Private",
  "village",
  "speed",
] as const;

const MARKDOWN_TOKEN = /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g;
const PRICE = /HK\$\d[\d,]*(?:[–—-]\d[\d,]*)?/g;

export type CiteRole =
  | "lead"
  | "site-label"
  | "site-chip"
  | "site-qualifier"
  | "site-caveat"
  | "compare-intro"
  | "compare-row"
  | "village-label"
  | "village-row"
  | "note";

export type CitePlacement = "opening" | "later";

export type CitePiece = {
  id: string;
  role: CiteRole;
  text: string;
  /** `later` clauses render after the comparison table so they do not fill the first screen. */
  placement: CitePlacement;
};

/** Reading order inside the comparison cite. Every piece is still rendered. */
export const CITE_VISUAL_ROLES: readonly CiteRole[] = [
  "lead",
  "site-label",
  "site-chip",
  "site-qualifier",
  "site-caveat",
  "compare-intro",
  "compare-row",
  "village-label",
  "village-row",
  "note",
];

function protectMap(text: string, mapPlain: (plain: string) => string) {
  return text
    .split(MARKDOWN_TOKEN)
    .map((part) => (part.startsWith("**") || part.startsWith("[") ? part : mapPlain(part)))
    .join("");
}

function termPattern(term: string) {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (/^[\x00-\x7F]+$/.test(term)) {
    return new RegExp(`(?<![A-Za-z0-9])${escaped}(?![A-Za-z0-9])`, "gi");
  }
  return new RegExp(escaped, "g");
}

/** Bold existing terms. Markers strip back to the original wording. */
export function emphasizeGuideTerms(text: string, terms: readonly string[], prices = false) {
  let next = text;
  for (const term of terms) {
    const pattern = termPattern(term);
    next = protectMap(next, (plain) => plain.replace(pattern, (match) => `**${match}**`));
  }
  if (prices) next = markGuidePrices(next);
  return next;
}

export function markGuidePrices(text: string) {
  return protectMap(text, (plain) => plain.replace(PRICE, (price) => `**${price}**`));
}

export function splitGuideTitle(
  h1: string,
): { title: string; mark: string; subtitle: string } | null {
  const full = h1.indexOf("：");
  if (full > 0) {
    return { title: h1.slice(0, full), mark: "：", subtitle: h1.slice(full + 1) };
  }
  const ascii = h1.indexOf(": ");
  if (ascii > 0) {
    return { title: h1.slice(0, ascii), mark: ": ", subtitle: h1.slice(ascii + 2) };
  }
  return null;
}

function take(source: string, text: string): { text: string; rest: string } | null {
  if (!source.startsWith(text)) return null;
  return { text, rest: source.slice(text.length) };
}

function piecesFrom(
  source: string,
  specs: { id: string; role: CiteRole; text: string; placement?: CitePlacement }[],
): CitePiece[] | null {
  const pieces: CitePiece[] = [];
  let rest = source;
  for (const spec of specs) {
    const next = take(rest, spec.text);
    if (!next) return null;
    pieces.push({
      id: spec.id,
      role: spec.role,
      text: next.text,
      placement: spec.placement ?? "opening",
    });
    rest = next.rest;
  }
  return rest === "" ? pieces : null;
}

function zhVillagePieces(): { id: string; role: CiteRole; text: string; placement?: CitePlacement }[] | null {
  const promo = take(VILLAGE_SPECIFIED_ADDRESS_CITE, "村屋由指定地址優惠 HK$218／月起");
  if (!promo) return null;
  const qualifier = take(
    promo.rest,
    "（中國移動香港村屋 1000M、24 個月，豁免安裝費原價 HK$680），",
  );
  if (!qualifier) return null;
  if (qualifier.rest !== "唔等於所有村屋都係呢個價；同系列正價為 HK$378。") return null;
  return [
    { id: "chip-village", role: "site-chip", text: promo.text },
    { id: "site-qualifier", role: "site-qualifier", text: qualifier.text, placement: "later" },
    { id: "site-caveat", role: "site-caveat", text: qualifier.rest, placement: "later" },
  ];
}

function enVillagePieces(): {
  id: string;
  role: CiteRole;
  text: string;
  placement?: CitePlacement;
}[] | null {
  const promo = take(
    VILLAGE_SPECIFIED_ADDRESS_CITE_EN,
    "Village houses from a specified-address promo of HK$218/month ",
  );
  if (!promo) return null;
  const qualifier = take(
    promo.rest,
    "(CMHK village 1000M, 24 months, installation waived from HK$680) ",
  );
  if (!qualifier) return null;
  if (
    qualifier.rest !==
    "are not that price at every village house; the list price in the same series is HK$378."
  ) {
    return null;
  }
  return [
    { id: "chip-village", role: "site-chip", text: promo.text },
    { id: "site-qualifier", role: "site-qualifier", text: qualifier.text, placement: "later" },
    { id: "site-caveat", role: "site-caveat", text: qualifier.rest, placement: "later" },
  ];
}

/**
 * Visual pieces for the HKBN vs Netvigator cite only.
 * Returns null unless the pieces are the cite with nothing added or dropped,
 * so other guides keep a single paragraph.
 */
export function hkbnNetvigatorCitePieces(cite: string): CitePiece[] | null {
  const zhVillage = zhVillagePieces();
  const enVillage = enVillagePieces();
  if (!zhVillage || !enVillage) return null;

  const zh = piecesFrom(cite, [
    { id: "lead", role: "lead", text: "網上行係 HKT 家居寬頻品牌。" },
    { id: "site-label", role: "site-label", text: "全站（各電訊商）光纖參考：" },
    { id: "chip-public", role: "site-chip", text: "公居屋約 HK$58–98／月、" },
    { id: "chip-private", role: "site-chip", text: "私樓約 HK$88–109／月、" },
    ...zhVillage,
    { id: "note-cmhk", role: "note", text: "呢條中國移動香港計劃唔屬呢篇兩間比較。", placement: "later" },
    {
      id: "compare-intro",
      role: "compare-intro",
      text: "2026 年 11 月站內可見，呢篇只比較香港寬頻同網上行：",
    },
    {
      id: "compare-hkbn",
      role: "compare-row",
      text: "公居屋／私樓 1000M 香港寬頻約 HK$98／月（24 或 36 個月）、",
    },
    { id: "compare-net", role: "compare-row", text: "網上行約 HK$108／月（36 個月＋路由器）；" },
    { id: "village-label", role: "village-label", text: "村屋係另一套，" },
    { id: "village-net", role: "village-row", text: "網上行村屋 1000M 約 HK$278／月，" },
    { id: "village-hkbn", role: "village-row", text: "香港寬頻特選村屋 2000M 約 HK$229／月" },
    { id: "village-1000", role: "village-row", text: "（香港寬頻村屋 1000M（27 個月）約 HK$378／月）。" },
    {
      id: "note-108",
      role: "note",
      text: "HK$108 只係網上行公居屋／私樓 1000M 例子，唔係全站私樓參考；",
      placement: "later",
    },
    {
      id: "note-229",
      role: "note",
      text: "HK$229 只係香港寬頻特選村屋 2000M 例子，唔係全站村屋起步價。",
      placement: "later",
    },
    { id: "note-confirm", role: "note", text: "月費、覆蓋同安裝以電訊商確認為準。", placement: "later" },
  ]);
  if (zh) return zh;

  return piecesFrom(cite, [
    { id: "lead", role: "lead", text: "Netvigator is HKT’s consumer home-broadband brand. " },
    { id: "site-label", role: "site-label", text: "Sitewide fibre references (all carriers): " },
    { id: "chip-public", role: "site-chip", text: "public / HOS about HK$58–98/month, " },
    { id: "chip-private", role: "site-chip", text: "private about HK$88–109/month. " },
    ...enVillage,
    {
      id: "note-cmhk",
      role: "note",
      text: " That CMHK plan is not part of this two-carrier comparison. ",
      placement: "later",
    },
    {
      id: "compare-intro",
      role: "compare-intro",
      text: "In November 2026, this page only compares HKBN and Netvigator: ",
    },
    {
      id: "compare-hkbn",
      role: "compare-row",
      text: "public / HOS and private 1000M is about HK$98/month for HKBN (24 or 36 months) ",
    },
    {
      id: "compare-net",
      role: "compare-row",
      text: "and about HK$108/month for Netvigator (36 months plus a router). ",
    },
    { id: "village-label", role: "village-label", text: "Village houses are a separate set: " },
    {
      id: "village-net",
      role: "village-row",
      text: "Netvigator village 1000M is about HK$278/month, ",
    },
    {
      id: "village-hkbn",
      role: "village-row",
      text: "and the HKBN selected village 2000M example is about HK$229/month ",
    },
    {
      id: "village-1000",
      role: "village-row",
      text: "(HKBN village 1000M is about HK$378/month for 27 months). ",
    },
    {
      id: "note-108",
      role: "note",
      text: "HK$108 is only the Netvigator public / private 1000M example, not the sitewide private-housing reference. ",
      placement: "later",
    },
    {
      id: "note-229",
      role: "note",
      text: "HK$229 is only the HKBN selected village 2000M example, not the sitewide village starting fee. ",
      placement: "later",
    },
    {
      id: "note-confirm",
      role: "note",
      text: "The carrier confirms the monthly fee, coverage and installation.",
      placement: "later",
    },
  ]);
}

/** Short lines for the CMHK village opening. The whole cite stays on the first screen. */
export function cmhkVillageCitePieces(cite: string): CitePiece[] | null {
  const linked = linkCmhkVillageAmounts(VILLAGE_CMHK_OPENING);
  if (cite === linked) {
    const lead = "村屋光纖而家有中國移動香港村屋 1000M（24 個月）呢個新選擇。";
    const promoAt = linked.indexOf("指定地址先有優惠價");
    const noteAt = linked.indexOf("HK$218 唔等於");
    if (promoAt < lead.length || noteAt < promoAt) return null;
    return piecesFrom(cite, [
      { id: "lead", role: "lead", text: lead },
      { id: "list-price", role: "compare-row", text: linked.slice(lead.length, promoAt) },
      { id: "promo-price", role: "compare-row", text: linked.slice(promoAt, noteAt) },
      { id: "address-note", role: "note", text: linked.slice(noteAt) },
    ]);
  }
  if (cite !== VILLAGE_CMHK_OPENING_EN) return null;
  return piecesFrom(cite, [
    {
      id: "lead",
      role: "lead",
      text: "Village houses now have a new choice: China Mobile Hong Kong village 1000M (24 months). ",
    },
    { id: "list-price", role: "compare-row", text: "The list price is HK$378 a month. " },
    {
      id: "promo-price",
      role: "compare-row",
      text: "A specified-address promo is HK$218 a month, and installation is waived (the install fee was HK$680). ",
    },
    { id: "address-note", role: "note", text: "HK$218 is not the fee for every village house. " },
    {
      id: "address-check",
      role: "note",
      text: "Coverage, and whether the promo applies, must be checked against the address.",
    },
  ]);
}

export function guideCitePieces(cite: string): CitePiece[] | null {
  return hkbnNetvigatorCitePieces(cite) ?? cmhkVillageCitePieces(cite);
}

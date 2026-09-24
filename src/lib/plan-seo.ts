import { canonicalUrl } from "./canonical.ts";
import { formatFee, PROVIDER_MAP, type Housing, type ProviderId } from "./plan-meta.ts";
import type { Plan } from "./plans.ts";
import { SITE } from "./site.ts";

const HOUSING_ZH: Record<Housing, string> = {
  public: "公屋",
  hos: "居屋",
  private: "私樓",
  village: "村屋",
};

export function planHousingLabel(plan: Plan): string {
  if (plan.housing === "all") return "公屋、居屋、私樓及村屋";
  return plan.housing.map((id) => HOUSING_ZH[id]).join("、");
}

export function planSpeedLabel(plan: Plan): string {
  if (plan.category === "home5g") return "100M–1000M";
  if (plan.speedMbps) return `${plan.speedMbps}M`;
  return "";
}

export function planSeoTitle(plan: Plan): string {
  const provider = PROVIDER_MAP[plan.providerId].name;
  const speed = planSpeedLabel(plan);
  const mid = speed ? `${provider} ${speed}` : provider;
  const term = /個月/.test(plan.name) ? "" : `｜${plan.contractMonths}個月`;
  return `${plan.name}｜${mid}${term}｜月費 ${formatFee(plan.monthlyFee)}｜齊Quote`;
}

export function planSeoDescription(plan: Plan): string {
  const provider = PROVIDER_MAP[plan.providerId].name;
  const speed = planSpeedLabel(plan);
  const speedBit = speed ? `網絡${speed}。` : "";
  let text = `${plan.name}由${provider}提供，月費${formatFee(plan.monthlyFee)}，${plan.contractMonths}個月合約。適用樓類：${planHousingLabel(plan)}。${speedBit}實際月費、覆蓋及安裝安排以電訊商確認為準。`;
  if (text.length < 70) {
    text = text.replace("以電訊商確認為準。", "詳情請向銷售員查詢，以電訊商確認為準。");
  }
  return text;
}

/** Same PNG trademarks as `provider-mark.tsx` LOGO.src. Prefer .png for Product image. */
const PROVIDER_TRADEMARK_PNG: Partial<Record<ProviderId, string>> = {
  hkbn: "/images/providers/hkbn.png",
  netvigator: "/images/providers/netvigator.png",
  cmhk: "/images/providers/cmhk.png",
  hgc: "/images/providers/hgc.png",
  smartone: "/images/providers/smartone.png",
  three: "/images/providers/three.png",
  csl: "/images/providers/csl.png",
  icable: "/images/providers/icable.png",
};

/** Absolute Product image: provider trademark, or site OG if a logo is missing. */
export function planJsonLdImage(plan: Pick<Plan, "providerId">): string {
  const src = PROVIDER_TRADEMARK_PNG[plan.providerId] ?? "/og.jpg";
  return `${SITE.url}${src}`;
}

export function planJsonLd(plan: Plan) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: plan.name,
    image: planJsonLdImage(plan),
    brand: { "@type": "Brand", name: PROVIDER_MAP[plan.providerId].name },
    description: planSeoDescription(plan),
    offers: {
      "@type": "Offer",
      price: plan.monthlyFee,
      priceCurrency: "HKD",
      url: canonicalUrl(`/plans/${plan.id}`),
    },
    additionalProperty: [
      { "@type": "PropertyValue", name: "合約期", value: `${plan.contractMonths}個月` },
      { "@type": "PropertyValue", name: "樓類", value: planHousingLabel(plan) },
    ],
  };
}

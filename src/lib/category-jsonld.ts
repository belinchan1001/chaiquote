import { canonicalUrl, CATEGORY_SEO, plansCategoryPath } from "./canonical.ts";
import { isListedPlan, PLANS } from "./plans.ts";
import type { Category } from "./plan-meta.ts";
import { SITE } from "./site.ts";

/** Category hub graph. Plans listing imports this; homepage must keep using canonical.ts. */
export function categoryJsonLd(cat: Category) {
  const seo = CATEGORY_SEO[cat];
  const url = canonicalUrl(plansCategoryPath(cat));
  const plans = PLANS.filter((plan) => isListedPlan(plan) && plan.category === cat);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${url}#webpage`,
        name: seo.title,
        description: seo.description,
        url,
        inLanguage: "zh-HK",
        isPartOf: { "@id": `${SITE.url}/#website` },
        mainEntity: { "@id": `${url}#list` },
      },
      {
        "@type": "ItemList",
        "@id": `${url}#list`,
        numberOfItems: plans.length,
        itemListElement: plans.map((plan, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: canonicalUrl(`/plans/${plan.id}`),
          name: plan.name,
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "首頁", item: canonicalUrl("/") },
          { "@type": "ListItem", position: 2, name: seo.title.replace(/^齊Quote｜/, ""), item: url },
        ],
      },
    ],
  };
}

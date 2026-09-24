import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

function src(rel: string) {
  return readFileSync(join(here, rel), "utf8");
}

describe("boot JS split", () => {
  it("keeps catalogues off the homepage shell and address field", () => {
    const service = src("../components/service-search.tsx");
    const guess = src("../components/housing-guess.tsx");
    const root = src("../routes/__root.tsx");
    const i18n = src("i18n.tsx");
    const wa = src("whatsapp.ts");
    const footer = src("../components/site-footer.tsx");
    assert.doesNotMatch(service, /from "@\/lib\/address-search"/);
    assert.doesNotMatch(service, /from "@\/lib\/estates"/);
    assert.match(service, /from "@\/lib\/address-hit"/);
    assert.match(guess, /import\("@\/lib\/address-search"\)/);
    assert.doesNotMatch(guess, /from "@\/lib\/address-search"/);
    assert.match(root, /from "@\/components\/deferred-whatsapp"/);
    assert.doesNotMatch(root, /from "@\/components\/whatsapp-widget"/);
    assert.match(i18n, /from "@\/lib\/plan-meta"/);
    assert.doesNotMatch(i18n, /from "@\/lib\/plans"/);
    assert.match(wa, /from "\.\/plan-meta\.ts"/);
    assert.match(wa, /import type \{ Plan \} from "\.\/plans\.ts"/);
    assert.doesNotMatch(wa, /import \{[^}]+\} from "\.\/plans\.ts"/);
    assert.match(footer, /from "@\/lib\/track-client"/);
    assert.match(src("track-client.ts"), /from "@\/lib\/track-types"/);
    assert.doesNotMatch(src("track-client.ts"), /from "@\/lib\/track"/);
  });

  it("loads plan, guide, estate, and news catalogues from route loaders", () => {
    assert.match(src("../routes/plans_.$planId.tsx"), /loader: \(\{ params \}\) => \{/);
    assert.doesNotMatch(src("../routes/plans_.$planId.tsx"), /loader: async /);
    assert.match(src("../routes/plans_.$planId.tsx"), /from "@\/lib\/plan-seo"/);
    assert.doesNotMatch(src("../routes/plans_.$planId.tsx"), /from "@\/lib\/seo"/);
    assert.match(src("../routes/offers_.$offerId.tsx"), /await import\("@\/lib\/plans"\)/);
    assert.match(src("../routes/guides_.$slug.tsx"), /await import\("@\/lib\/guides"\)/);
    assert.match(src("../routes/estates_.$slug.tsx"), /await import\("@\/lib\/estate-pages"\)/);
    assert.match(src("../routes/tech-news.tsx"), /from "@\/lib\/tech-news-seo"/);
    assert.match(src("../routes/tech-news_.$slug.tsx"), /await import\("@\/lib\/tech-news"\)/);
    assert.match(src("../routes/plans.tsx"), /from "@\/lib\/category-jsonld"/);
    assert.doesNotMatch(src("../routes/plans.tsx"), /from "@\/lib\/seo"/);
  });
});

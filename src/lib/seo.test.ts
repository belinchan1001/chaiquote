import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { SITE } from "./site.ts";
import { siteDataLastmod, sitemapLastmod } from "./seo.ts";

describe("catalogue stamp", () => {
  it("pins the homepage data stamp to today as YYYY-MM-DD", () => {
    assert.equal(SITE.updated, "2026-10-07");
    assert.match(SITE.updated, /^\d{4}-\d{2}-\d{2}$/);
    assert.doesNotMatch(SITE.updated, /年|月|日/);
    assert.equal(siteDataLastmod(), "2026-10-07");
    assert.equal(sitemapLastmod("/"), "2026-10-07");
    assert.equal(sitemapLastmod("/plans"), "2026-10-07");
    assert.equal(sitemapLastmod("/estates"), "2026-10-07");
  });
});

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { SITE } from "./site.ts";
import { getGuide } from "./guides.ts";
import { sitemapLastmod } from "./seo.ts";

describe("guide manuscript dates vs catalogue stamp", () => {
  it("keeps guide lastmod on the manuscript date, not SITE.updated", () => {
    assert.equal(SITE.updated, "2026-10-21");
    const fiber = getGuide("fiber");
    assert.ok(fiber);
    assert.equal(fiber.published, "2026-09-09");
    assert.equal(fiber.modified, "2026-09-10");
    assert.equal(sitemapLastmod("/guides/fiber"), "2026-09-10");
    assert.notEqual(sitemapLastmod("/guides/fiber"), SITE.updated);

    const port = getGuide("port-in");
    assert.ok(port);
    assert.equal(port.published, "2026-09-05");
    assert.equal(port.modified, "2026-09-06");
    assert.equal(sitemapLastmod("/guides/port-in"), "2026-09-06");

    for (const slug of ["broadband-total-cost", "1000m-or-2500m"] as const) {
      const guide = getGuide(slug);
      assert.ok(guide, slug);
      assert.equal(guide.published, "2026-10-14");
      assert.equal(sitemapLastmod(`/guides/${slug}`), "2026-10-14");
    }

    for (const slug of [
      "broadband-renewal",
      "broadband-stability",
      "old-building-broadband",
      "home5g-data-cap",
      "move-broadband",
      "yuen-long",
      "mobile-broadband-bundle",
      "router-wifi",
      "tuen-mun",
      "student-plans",
      "elderly-broadband",
      "kwun-tong",
      "ma-on-shan",
      "early-termination",
      "10g-broadband",
      "village-5g-test",
      "spectrum-2-3ghz",
    ] as const) {
      const guide = getGuide(slug);
      assert.ok(guide, slug);
      assert.equal(guide.published, "2026-10-21");
      assert.equal(guide.modified, "2026-10-21");
      assert.equal(sitemapLastmod(`/guides/${slug}`), "2026-10-21");
    }
  });
});

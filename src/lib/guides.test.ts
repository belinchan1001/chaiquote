import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { SITE } from "./site.ts";
import { getGuide } from "./guides.ts";
import { sitemapLastmod } from "./seo.ts";

describe("guide manuscript dates vs catalogue stamp", () => {
  it("keeps guide lastmod on the manuscript date, not SITE.updated", () => {
    assert.equal(SITE.updated, "2026-10-10");
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
  });
});

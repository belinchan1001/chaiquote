import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { SITE } from "./site.ts";
import { getGuide } from "./guides.ts";
import { getPlan } from "./plans.ts";
import { sitemapLastmod } from "./seo.ts";

const here = dirname(fileURLToPath(import.meta.url));

describe("guide manuscript dates vs catalogue stamp", () => {
  it("keeps guide lastmod on the manuscript date, not SITE.updated", () => {
    assert.equal(SITE.updated, "2026-11-04");
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

describe("2026 six-carrier 1000M table", () => {
  it("keeps Aki's locked monthly bands and renders them as an HTML table", () => {
    const guide = getGuide("home-broadband-2026");
    assert.ok(guide);
    assert.equal(guide.seoTitle, "2026家居寬頻1000M｜六大電訊月費比較｜齊Quote");
    assert.equal(guide.h1, "2026 家居寬頻 1000M：六大電訊商參考月費比較");
    assert.equal(guide.published, "2026-09-12");
    assert.equal(guide.modified, "2026-11-01");
    assert.equal(sitemapLastmod("/guides/home-broadband-2026"), "2026-11-01");
    assert.match(guide.description, /香港寬頻/);
    assert.match(guide.description, /網上行/);
    assert.match(guide.description, /HGC/);
    assert.match(guide.description, /有線寬頻/);
    assert.match(guide.description, /中國移動香港/);
    assert.match(guide.description, /數碼通/);
    assert.match(guide.description, /6309 9966/);
    assert.match(guide.description, /僅供參考/);

    const section = guide.body.find((item) => item.matrix);
    assert.ok(section?.matrix);
    assert.deepEqual(section.matrix.headers, [
      "電訊商",
      "1000M 參考月費範圍",
      "常見合約期",
      "常見適用樓類",
      "亮點",
      "站內入口",
    ]);
    assert.equal(section.matrix.notes?.length, 3);
    assert.equal(guide.body.findIndex((item) => item.matrix) < guide.body.findIndex((item) => item.table), true);

    const dash = "\u2013";
    const expected = [
      ["香港寬頻 HKBN", `約 HK$98${dash}109／月`, "/plans/hkbn-ftth-1000-36m-98"],
      ["網上行／HKT／Netvigator", "約 HK$108／月", "/plans/netvigator-ftth-1000-public-36m-108"],
      ["HGC", `約 HK$75${dash}89／月（私樓常見約 HK$89）`, "/plans/hgc-ftth-1000-public-36m"],
      ["有線寬頻 i-Cable", `約 HK$58${dash}68／月`, "/plans/icable-ftth-1000-48m-58"],
      ["中國移動香港 CMHK", `約 HK$88${dash}98／月`, "/plans/cmhk-ftth-2500"],
      ["數碼通 SmarTone", "約 HK$88／月", "/plans/smartone-ftth-1000"],
    ] as const;

    assert.equal(section.matrix.rows.length, expected.length);
    section.matrix.rows.forEach((row, index) => {
      const [carrier, fee, href] = expected[index]!;
      assert.equal(row.length, 6);
      assert.equal(row[0], carrier);
      assert.equal(row[1], fee);
      assert.match(row[5]!, new RegExp(href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
      assert.equal(row[1]!.includes("118"), false);
      assert.equal(row[1]!.includes("快閃"), false);
      assert.ok(getPlan(href.slice("/plans/".length)));
    });

    const page = JSON.stringify(guide);
    assert.equal(page.includes("保證最平"), false);
    assert.match(page, /6309 9966/);
    assert.match(page, /本網站並沒有向任何電訊商收取佣金或廣告費/);
    assert.equal(guide.faq?.length, 7);

    const route = readFileSync(join(here, "../routes/guides_.$slug.tsx"), "utf8");
    assert.match(route, /<table/);
    assert.match(route, /section\.matrix/);
  });
});

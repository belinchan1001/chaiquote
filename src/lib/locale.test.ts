import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { getGuide, guideCopy } from "./guides.ts";
import { MESSAGES } from "./messages.ts";
import { keepLangSearch, localeFromHref } from "./locale.ts";
import { compactSearch, parsePlansSearch } from "./search.ts";

const here = dirname(fileURLToPath(import.meta.url));

describe("?lang=en", () => {
  it("reads English only from lang=en", () => {
    assert.equal(localeFromHref("/"), "zh");
    assert.equal(localeFromHref("/plans?cat=broadband"), "zh");
    assert.equal(localeFromHref("/?lang=zh"), "zh");
    assert.equal(localeFromHref("/?lang=en"), "en");
    assert.equal(localeFromHref("/plans?cat=broadband&lang=en"), "en");
    assert.equal(localeFromHref("/guides/fiber-vs-5g?lang=en"), "en");
    assert.equal(localeFromHref("https://www.chaiquote.hk/?lang=en"), "en");
  });

  it("keeps lang=en across a replaced query and lets the toggle clear it", () => {
    const kept = keepLangSearch({
      search: { lang: "en", cat: "broadband" },
      next: () => ({ search: { cat: "home5g" }, meta: { explicit: { cat: "home5g" } } }),
    });
    assert.equal(kept.lang, "en");
    assert.equal(kept.cat, "home5g");

    const cleared = keepLangSearch({
      search: { lang: "en" },
      next: () => ({
        search: { lang: undefined },
        meta: { explicit: { lang: undefined } },
      }),
    });
    assert.equal("lang" in cleared, false);
  });

  it("passes lang through the plans hub search", () => {
    const parsed = parsePlansSearch({ cat: "broadband", lang: "en" });
    assert.equal(parsed.lang, "en");
    assert.equal(compactSearch(parsed).lang, "en");
    assert.equal(parsePlansSearch({ cat: "mobile", lang: "zh" }).lang, undefined);
  });

  it("uses the existing English catalogue for the hero, FAQ, and fibre-vs-5g guide", () => {
    assert.equal(MESSAGES.en.heroTitle1, "Stop shopping around for broadband");
    assert.match(MESSAGES.en.heroLead, /Enter your address/);
    assert.match(MESSAGES.en.faq1q, /independent broadband comparison site/);
    assert.match(MESSAGES.en.faq1a, /not a carrier website/);
    assert.notEqual(MESSAGES.en.faq1a, MESSAGES.zh.faq1a);
    const guide = getGuide("fiber-vs-5g");
    assert.ok(guide);
    const copy = guideCopy(guide, "en");
    assert.equal(copy.h1, "5G home or fibre");
    assert.match(copy.faq[0]?.q ?? "", /fibre or 5G home/);
    assert.equal(copy.body[0]?.heading, "How to choose");
  });

  it("renders locale from the URL on the server shell, not from a zh-only state", () => {
    const i18n = readFileSync(join(here, "i18n.tsx"), "utf8");
    const root = readFileSync(join(here, "../routes/__root.tsx"), "utf8");
    const plans = readFileSync(join(here, "../routes/plans_.$planId.tsx"), "utf8");
    const guide = readFileSync(join(here, "../routes/guides_.$slug.tsx"), "utf8");
    assert.match(i18n, /localeFromHref\(href\)/);
    assert.doesNotMatch(i18n, /useState<Locale>\("zh"\)/);
    assert.match(i18n, /lang: next === "en" \? "en" : undefined/);
    assert.match(root, /keepLangSearch/);
    assert.match(root, /lang=\{locale === "en" \? "en" : "zh-HK"\}/);
    assert.match(plans, /search\.lang === "en"/);
    assert.match(guide, /guideCopy\(guide, locale\)/);
  });
});

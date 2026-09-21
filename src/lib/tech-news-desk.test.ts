import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  isSafeNewsUrl,
  parseNewsDraft,
  slugifyNews,
  stripHtml,
} from "./tech-news-desk.ts";

const here = dirname(fileURLToPath(import.meta.url));

const SAMPLE = {
  slug: "hkbn-fibre-note",
  minutes: 4,
  seoTitle: "香港寬頻光纖更新點核對｜齊Quote",
  h1: "香港寬頻光纖更新點核對，先唔好只睇標題",
  description: "香港寬頻光纖優惠新聞點睇。內容僅供參考，實際條款以電訊商確認為準。",
  excerpt: "來源有寫嘅先寫，無寫死就唔估月費。",
  seoTitleEn: "How to read an HKBN fibre update | 齊Quote",
  h1En: "Check an HKBN fibre update without trusting the headline",
  descriptionEn: "How to read an HKBN fibre story. Terms are confirmed by the carrier.",
  excerptEn: "Only write numbers the source states.",
  bullets: ["先對日期", "預繳同安裝費要分開", "覆蓋以電訊商確認為準"],
  bulletsEn: ["Check the date", "Split prepaid and install", "Coverage is confirmed by the carrier"],
  body: [
    {
      heading: "來源寫咗咩",
      headingEn: "What the source said",
      paragraphs: ["只轉述來源已寫嘅條件。", "無寫死月費就唔補數字。"],
      paragraphsEn: ["Restate only what the source said.", "Do not invent a fee."],
    },
    {
      heading: "點用齊Quote",
      headingEn: "What to do next",
      paragraphs: ["用光纖報價頁核對屋苑。", "WhatsApp 查核覆蓋。"],
      paragraphsEn: ["Check the estate on the fibre page.", "Confirm coverage on WhatsApp."],
    },
  ],
  tags: ["香港寬頻", "光纖"],
  tagsEn: ["HKBN", "fibre"],
  editorNote: "實際以電訊商確認為準。",
  editorNoteEn: "The carrier confirms the live terms.",
};

describe("tech news desk", () => {
  it("parses a clean draft and rejects claim-words or private URLs", () => {
    const article = parseNewsDraft(JSON.stringify(SAMPLE), "telecom", "https://example.com/pr");
    assert.ok(article);
    assert.equal(article?.category, "telecom");
    assert.equal(article?.sourceUrl, "https://example.com/pr");
    assert.match(article?.description ?? "", /以電訊商確認為準/);
    assert.equal(parseNewsDraft(JSON.stringify({ ...SAMPLE, h1: "全港最平光纖" }), "telecom"), null);
    assert.equal(isSafeNewsUrl("https://www.hkbn.net/a")?.href, "https://www.hkbn.net/a");
    assert.equal(isSafeNewsUrl("http://127.0.0.1/secret"), null);
    assert.equal(isSafeNewsUrl("ftp://files.example/a"), null);
    assert.equal(stripHtml("<script>x</script><p>官方 公告</p>"), "官方 公告");
    assert.equal(slugifyNews("Hello World!!", new Set()), "hello-world");
  });

  it("keeps the desk noindex and off the public nav", () => {
    const desk = readFileSync(join(here, "../routes/tech-news_.desk.tsx"), "utf8");
    const header = readFileSync(join(here, "../components/site-header.tsx"), "utf8");
    assert.match(desk, /noindex,follow/);
    assert.match(desk, /draftTechNews/);
    assert.match(desk, /publishTechNews/);
    assert.doesNotMatch(header, /tech-news\/desk/);
  });
});

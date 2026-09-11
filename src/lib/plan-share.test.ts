import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { getPlan } from "./plans.ts";
import { SITE } from "./site.ts";
import {
  PLAN_SHARE_SENTENCE,
  planShareClipboardText,
  planSharePayload,
  planShareUrl,
  shareOrCopyPlan,
} from "./plan-share.ts";

const here = dirname(fileURLToPath(import.meta.url));
const CLAIM_WORDS = ["最抵", "最低", "最平", "保證價"] as const;
const PLAN_ID = "hkbn-ftth-1000-36m-98";

function samplePlan() {
  const plan = getPlan(PLAN_ID);
  assert.ok(plan, `missing plan ${PLAN_ID}`);
  return plan;
}

describe("plan share payload", () => {
  it("shares the canonical plan detail URL with locked 僅供參考 copy", () => {
    const plan = samplePlan();
    const payload = planSharePayload(plan);
    const clipboard = planShareClipboardText(plan);

    assert.equal(planShareUrl(plan.id), `https://www.chaiquote.hk/plans/${plan.id}`);
    assert.equal(payload.url, `https://www.chaiquote.hk/plans/${plan.id}`);
    assert.equal(payload.url.startsWith(SITE.url), true);
    assert.doesNotMatch(payload.url, /[?&]cat=/);
    assert.doesNotMatch(payload.url, /\/plans\?/);
    assert.equal(payload.text, PLAN_SHARE_SENTENCE);
    assert.equal(payload.title, `${plan.name}｜${SITE.name}`);
    assert.match(payload.text, /僅供參考/);
    assert.match(clipboard, /僅供參考/);
    assert.equal(clipboard, `${payload.url}\n${PLAN_SHARE_SENTENCE}`);
    assert.match(clipboard, new RegExp(`https://www\\.chaiquote\\.hk/plans/${plan.id}`));

    for (const word of CLAIM_WORDS) {
      assert.equal(payload.text.includes(word), false, `share text still claims ${word}`);
      assert.equal(payload.title.includes(word), false, `share title still claims ${word}`);
      assert.equal(clipboard.includes(word), false, `clipboard still claims ${word}`);
    }
    assert.doesNotMatch(payload.text, /保證/);
    assert.doesNotMatch(clipboard, /保證/);
  });

  it("does not put a fee or official-price claim in the share sentence", () => {
    assert.equal(PLAN_SHARE_SENTENCE, "呢個計劃月費僅供參考，實際以電訊商確認為準。");
    assert.doesNotMatch(PLAN_SHARE_SENTENCE, /\$|HK\$|保證價|官方/);
    assert.doesNotMatch(PLAN_SHARE_SENTENCE, /最抵|最低|最平/);
  });
});

describe("share or copy fallback", () => {
  it("prefers navigator.share with title/text/url", async () => {
    const plan = samplePlan();
    const shared: unknown[] = [];
    const result = await shareOrCopyPlan(plan, {
      share: async (data) => {
        shared.push(data);
      },
      writeText: async () => {
        throw new Error("should not copy when native share works");
      },
    });
    assert.equal(result, "shared");
    assert.deepEqual(shared, [planSharePayload(plan)]);
  });

  it("copies URL + 僅供參考 when Web Share is unavailable", async () => {
    const plan = samplePlan();
    const copied: string[] = [];
    const result = await shareOrCopyPlan(plan, {
      writeText: async (text) => {
        copied.push(text);
      },
    });
    assert.equal(result, "copied");
    assert.equal(copied.length, 1);
    assert.equal(copied[0], planShareClipboardText(plan));
    assert.match(copied[0], /僅供參考/);
    assert.match(copied[0], /https:\/\/www\.chaiquote\.hk\/plans\/hkbn-ftth-1000-36m-98/);
  });

  it("copies after a share failure, but not after AbortError", async () => {
    const plan = samplePlan();
    const copied: string[] = [];
    const failed = await shareOrCopyPlan(plan, {
      share: async () => {
        throw new Error("share failed");
      },
      writeText: async (text) => {
        copied.push(text);
      },
    });
    assert.equal(failed, "copied");
    assert.equal(copied[0], planShareClipboardText(plan));

    const abort = new Error("cancel");
    abort.name = "AbortError";
    const aborted = await shareOrCopyPlan(plan, {
      share: async () => {
        throw abort;
      },
      writeText: async () => {
        throw new Error("should not copy after abort");
      },
    });
    assert.equal(aborted, "aborted");
  });

  it("skips native share when canShare is false and copies instead", async () => {
    const plan = samplePlan();
    const copied: string[] = [];
    const result = await shareOrCopyPlan(plan, {
      canShare: () => false,
      share: async () => {
        throw new Error("should not share");
      },
      writeText: async (text) => {
        copied.push(text);
      },
    });
    assert.equal(result, "copied");
    assert.match(copied[0], /僅供參考/);
  });
});

describe("plan card share control", () => {
  it("exposes one 分享 control beside save, without covering fee, CTAs, or brand", () => {
    const card = readFileSync(join(here, "../components/plan-card.tsx"), "utf8");
    const button = readFileSync(join(here, "../components/plan-share-button.tsx"), "utf8");
    const messages = readFileSync(join(here, "messages.ts"), "utf8");

    assert.equal([...card.matchAll(/<PlanShareButton plan=\{plan\} \/>/g)].length, 1);
    assert.match(card, /<PlanBadges plan=\{plan\} \/>\s*<PlanShareButton plan=\{plan\} \/>\s*<button/);
    assert.match(card, /<PlanShareButton plan=\{plan\} \/>[\s\S]*aria-label=\{inSaved \? t\("unsave"\) : t\("save"\)\}/);
    assert.doesNotMatch(card, /formatFee\(plan\.monthlyFee\)[\s\S]{0,120}PlanShareButton/);
    assert.doesNotMatch(card, /<QuoteLink[^>]*>[\s\S]{0,80}PlanShareButton/);
    assert.doesNotMatch(card, /PlanShareButton[\s\S]{0,80}<LogoMark/);
    assert.doesNotMatch(card, /window\.location/);

    assert.match(button, /from "lucide-react"/);
    assert.match(button, /<Share2 /);
    assert.match(button, /t\("share"\)/);
    assert.match(button, /t\("shareCopied"\)/);
    assert.match(button, /shareOrCopyPlan\(plan\)/);
    assert.match(button, /aria-live="polite"/);
    assert.match(button, /size-11/);

    assert.equal([...messages.matchAll(/share: "分享"/g)].length, 1);
    assert.match(messages, /shareCopied: "已複製連結"/);
    assert.match(messages, /shareFailed: "未能複製，請再試"/);
    assert.match(messages, /share: "Share"/);
  });
});

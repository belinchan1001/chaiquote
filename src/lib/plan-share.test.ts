import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { formatFee, getPlan } from "./plans.ts";
import { SITE } from "./site.ts";
import {
  PLAN_SHARE_DISCLAIMER,
  PLAN_SHARE_SENTENCE,
  SHARE_SUCCESS_CUE_MS,
  SHARE_SUCCESS_TOAST_MS,
  isPlanShareSuccess,
  planShareBody,
  planShareClipboardText,
  planShareFactsLine,
  planSharePayload,
  planShareUrl,
  scheduleShareSuccessReveal,
  shareOrCopyPlan,
  shouldRevealShareSuccessNow,
  startShareSuccessToast,
} from "./plan-share.ts";

const here = dirname(fileURLToPath(import.meta.url));
const CLAIM_WORDS = ["最抵", "最低", "最平", "保證價"] as const;
const PLAN_ID = "hkbn-ftth-1000-36m-98";

function samplePlan() {
  const plan = getPlan(PLAN_ID);
  assert.ok(plan, `missing plan ${PLAN_ID}`);
  return plan;
}

function assertNoClaimWords(...chunks: string[]) {
  for (const chunk of chunks) {
    for (const word of CLAIM_WORDS) {
      assert.equal(chunk.includes(word), false, `share copy still claims ${word}: ${chunk}`);
    }
    assert.doesNotMatch(chunk, /保證/);
  }
}

function assertShareFacts(plan: ReturnType<typeof samplePlan>, body: string) {
  const fee = formatFee(plan.monthlyFee);
  const url = `https://www.chaiquote.hk/plans/${plan.id}`;
  assert.equal(fee.startsWith("HK$"), true);
  assert.equal(body.includes(plan.name), true);
  assert.equal(body.includes(fee), true);
  assert.match(body, /HK\$/);
  assert.equal(body.includes(PLAN_SHARE_DISCLAIMER), true);
  assert.equal(body.includes("僅供參考"), true);
  assert.equal(body.includes("實際以電訊商確認為準"), true);
  assert.equal(body.includes(url), true);
  assert.equal(body, `${plan.name}｜月費 ${fee}\n${PLAN_SHARE_SENTENCE}\n${url}`);
}

describe("plan share payload", () => {
  it("puts plan name, monthly fee, 僅供參考, and canonical URL in the share body", () => {
    const plan = samplePlan();
    const payload = planSharePayload(plan);
    const clipboard = planShareClipboardText(plan);
    const facts = planShareFactsLine(plan);
    const body = planShareBody(plan);

    assert.equal(planShareUrl(plan.id), `https://www.chaiquote.hk/plans/${plan.id}`);
    assert.equal(payload.url, `https://www.chaiquote.hk/plans/${plan.id}`);
    assert.equal(payload.url.startsWith(SITE.url), true);
    assert.doesNotMatch(payload.url, /[?&]cat=/);
    assert.doesNotMatch(payload.url, /\/plans\?/);

    assert.equal(facts, `${plan.name}｜月費 ${formatFee(plan.monthlyFee)}`);
    assert.equal(payload.title, `${plan.name}｜${SITE.name}`);
    assert.equal(payload.text, body);
    assert.equal(clipboard, payload.text);
    assert.notEqual(payload.text, PLAN_SHARE_SENTENCE);
    assertShareFacts(plan, payload.text);
    assertShareFacts(plan, clipboard);

    assertNoClaimWords(payload.text, payload.title, clipboard, PLAN_SHARE_SENTENCE);
  });

  it("formats the fee with formatFee, including fractional monthly fees", () => {
    const stub = { id: "stub-plan", name: "測試計劃", monthlyFee: 98.5 };
    assert.equal(formatFee(stub.monthlyFee), "HK$98.5");
    assert.equal(planShareFactsLine(stub), "測試計劃｜月費 HK$98.5");
    assert.equal(
      planShareBody(stub),
      `測試計劃｜月費 HK$98.5\n${PLAN_SHARE_SENTENCE}\nhttps://www.chaiquote.hk/plans/stub-plan`,
    );
  });

  it("keeps the locked 僅供參考 sentence without a fee or official-price claim", () => {
    assert.equal(PLAN_SHARE_SENTENCE, "呢個計劃月費僅供參考，實際以電訊商確認為準。");
    assert.equal(PLAN_SHARE_SENTENCE.includes(PLAN_SHARE_DISCLAIMER), true);
    assert.equal(PLAN_SHARE_DISCLAIMER, "僅供參考，實際以電訊商確認為準");
    assert.doesNotMatch(PLAN_SHARE_SENTENCE, /\$|HK\$|保證價|官方/);
    assert.doesNotMatch(PLAN_SHARE_SENTENCE, /最抵|最低|最平/);
  });
});

describe("share or copy fallback", () => {
  it("prefers navigator.share with title/text/url including plan facts", async () => {
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
    const payload = shared[0] as ReturnType<typeof planSharePayload>;
    assertShareFacts(plan, payload.text);
    assert.equal(payload.text, planShareClipboardText(plan));
    assert.equal(payload.url, `https://www.chaiquote.hk/plans/${plan.id}`);
  });

  it("copies name, fee, 僅供參考, and URL when Web Share is unavailable", async () => {
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
    assert.equal(copied[0], planSharePayload(plan).text);
    assertShareFacts(plan, copied[0]);
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
    assertShareFacts(plan, copied[0]);

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
    assertShareFacts(plan, copied[0]);
  });
});

describe("plan card share control", () => {
  it("exposes one labeled 分享 outline button beside WhatsApp, not in the bookmark corner", () => {
    const card = readFileSync(join(here, "../components/plan-card.tsx"), "utf8");
    const button = readFileSync(join(here, "../components/plan-share-button.tsx"), "utf8");
    const messages = readFileSync(join(here, "messages.ts"), "utf8");
    const share = readFileSync(join(here, "plan-share.ts"), "utf8");

    assert.equal([...card.matchAll(/<PlanShareButton plan=\{plan\} \/>/g)].length, 1);
    assert.match(
      card,
      /<QuoteLink plan=\{plan\} className="w-full min-w-fit shrink-0 sm:w-auto">\s*\{t\("askWa"\)\}\s*<\/QuoteLink>\s*<div className="flex gap-2 sm:shrink-0">[\s\S]*\{plan\.staffOffer \? null : <PlanShareButton plan=\{plan\} \/>\}/,
    );
    assert.match(card, /<ProviderMark id=\{plan\.providerId\} \/>\s*<button/);
    assert.match(card, /aria-label=\{inSaved \? t\("unsave"\) : t\("save"\)\}/);
    assert.doesNotMatch(card, /<PlanBadges plan=\{plan\} \/>\s*<PlanShareButton/);
    assert.doesNotMatch(card, /<PlanShareButton plan=\{plan\} \/>\s*<button/);
    assert.doesNotMatch(card, /<ProviderMark[\s\S]{0,220}PlanShareButton/);
    assert.doesNotMatch(card, /PlanShareButton[\s\S]{0,80}<LogoMark/);
    assert.doesNotMatch(card, /window\.location/);

    assert.match(button, /from "lucide-react"/);
    assert.match(button, /<Share2 /);
    assert.match(button, /t\("share"\)/);
    assert.match(button, /t\("shareCopied"\)/);
    assert.match(button, /t\("shareSuccessToast"\)/);
    assert.match(button, /shareOrCopyPlan\(plan\)/);
    assert.match(button, /isPlanShareSuccess\(result\)/);
    assert.match(button, /result === "aborted"/);
    assert.match(button, /scheduleShareSuccessReveal/);
    assert.match(button, /revealSuccess/);
    assert.match(button, /SHARE_SUCCESS_CUE_MS/);
    assert.match(button, /SHARE_SUCCESS_TOAST_MS/);
    assert.match(button, /flash\("copied"\)/);
    assert.match(button, /showSuccessToast\(\)/);
    assert.match(button, /startShareSuccessToast/);
    assert.match(button, /createPortal/);
    assert.match(button, /share-success-toast/);
    assert.match(button, /share-success-toast-mark/);
    assert.match(button, /share-success-toast-label/);
    assert.match(button, /action-done bg-accent text-accent-foreground/);
    assert.match(button, /aria-live="polite"/);
    assert.match(button, /variant="outline"/);
    assert.match(button, /\{label\}/);
    assert.doesNotMatch(button, /playShareSuccessDing/);
    assert.doesNotMatch(button, /shouldPlayShareSuccessDing/);
    assert.match(button, /function revealSuccess\(\) \{\s*flash\("copied"\);\s*showSuccessToast\(\);/);
    assert.doesNotMatch(button, /size-11/);
    assert.doesNotMatch(button, /text-muted/);
    assert.doesNotMatch(button, /sonner|Toaster/);
    assert.doesNotMatch(button, /onMouseEnter|onPointerEnter|onHover/);
    assert.doesNotMatch(button, /setTimeout\(\(\) => setCue\("idle"\), 2000\)/);

    assert.match(share, /from "\.\/plans\.ts"/);
    assert.match(share, /formatFee\(plan\.monthlyFee\)/);
    assert.match(share, /scheduleShareSuccessReveal/);
    assert.match(share, /shouldRevealShareSuccessNow/);
    assert.match(share, /pageshow/);
    assert.match(share, /visibilitychange/);
    assert.doesNotMatch(share, /playShareSuccessDing|shouldPlayShareSuccessDing|createOscillator|AudioContext/);
    assert.doesNotMatch(share, /最抵|最低|最平|保證價/);

    assert.equal([...messages.matchAll(/share: "分享"/g)].length, 1);
    assert.match(messages, /shareCopied: "已分享連結"/);
    assert.match(messages, /shareSuccessToast: "已成功分享"/);
    assert.match(messages, /shareCopied: "Link shared"/);
    assert.match(messages, /shareSuccessToast: "Shared successfully"/);
    assert.match(messages, /shareFailed: "未能複製，請再試"/);
    assert.match(messages, /share: "Share"/);
    assert.doesNotMatch(messages, /已複製連結/);
    assert.doesNotMatch(messages, /shareSucceeded/);
  });
});

describe("share success cue", () => {
  it("treats shared and copied as success, and abort as silence", () => {
    assert.equal(SHARE_SUCCESS_CUE_MS, 700);
    assert.equal(SHARE_SUCCESS_TOAST_MS, 1000);
    assert.equal(isPlanShareSuccess("shared"), true);
    assert.equal(isPlanShareSuccess("copied"), true);
    assert.equal(isPlanShareSuccess("aborted"), false);
    assert.equal(shouldRevealShareSuccessNow("copied", false), true);
    assert.equal(shouldRevealShareSuccessNow("copied", true), true);
    assert.equal(shouldRevealShareSuccessNow("shared", false), true);
    assert.equal(shouldRevealShareSuccessNow("shared", true), false);
  });

  it("reveals toast immediately for copy, and for shared only once visible again", () => {
    const revealed: string[] = [];
    const listeners: Array<() => void> = [];
    let hidden = true;

    const host = {
      hidden: () => hidden,
      addResumeListener: (fn: () => void) => {
        listeners.push(fn);
      },
      removeResumeListener: (fn: () => void) => {
        const i = listeners.indexOf(fn);
        if (i >= 0) listeners.splice(i, 1);
      },
    };

    scheduleShareSuccessReveal("copied", () => revealed.push("copied"), host);
    assert.deepEqual(revealed, ["copied"]);
    assert.equal(listeners.length, 0);

    const cancelShared = scheduleShareSuccessReveal("shared", () => revealed.push("shared"), host);
    assert.deepEqual(revealed, ["copied"]);
    assert.equal(listeners.length, 1);

    for (const fn of [...listeners]) fn();
    assert.deepEqual(revealed, ["copied"]);

    hidden = false;
    for (const fn of [...listeners]) fn();
    assert.deepEqual(revealed, ["copied", "shared"]);
    assert.equal(listeners.length, 0);

    hidden = true;
    const cancelAbort = scheduleShareSuccessReveal("shared", () => revealed.push("late"), host);
    assert.equal(listeners.length, 1);
    cancelAbort();
    hidden = false;
    for (const fn of [...listeners]) fn();
    assert.deepEqual(revealed, ["copied", "shared"]);
    assert.equal(listeners.length, 0);
    cancelShared();
  });

  it("holds the center toast for 1s while visible and restarts after the page is hidden", () => {
    let hidden = false;
    let shown = false;
    const listeners: Array<() => void> = [];
    const timers = new Map<number, () => void>();
    let nextId = 1;

    const stop = startShareSuccessToast(1000, {
      hidden: () => hidden,
      show: () => {
        shown = true;
      },
      hide: () => {
        shown = false;
      },
      setTimeout: (fn) => {
        const id = nextId++;
        timers.set(id, fn);
        return id;
      },
      clearTimeout: (id) => {
        timers.delete(id);
      },
      addVisibilityListener: (fn) => {
        listeners.push(fn);
      },
      removeVisibilityListener: (fn) => {
        const i = listeners.indexOf(fn);
        if (i >= 0) listeners.splice(i, 1);
      },
    });

    assert.equal(shown, true);
    assert.equal(timers.size, 1);

    hidden = true;
    for (const fn of [...listeners]) fn();
    assert.equal(shown, true);
    assert.equal(timers.size, 0);

    hidden = false;
    for (const fn of [...listeners]) fn();
    assert.equal(shown, true);
    assert.equal(timers.size, 1);

    for (const fn of [...timers.values()]) fn();
    assert.equal(shown, false);
    assert.equal(listeners.length, 0);

    stop();
    assert.equal(shown, false);
  });

  it("uses a smaller true-green toast with a reduced-motion-safe mark shine, and no ding", () => {
    const share = readFileSync(join(here, "plan-share.ts"), "utf8");
    const button = readFileSync(join(here, "../components/plan-share-button.tsx"), "utf8");
    const css = readFileSync(join(here, "../styles.css"), "utf8");

    assert.doesNotMatch(share, /playShareSuccessDing|shouldPlayShareSuccessDing|createOscillator|AudioContext/);
    assert.doesNotMatch(button, /playShareSuccessDing/);
    assert.doesNotMatch(share, /\.mp3|\.wav|\.ogg/);

    assert.match(css, /@keyframes action-done-pop/);
    assert.match(css, /\.action-done\s*\{[^}]*animation:\s*action-done-pop 180ms/);
    assert.match(css, /\.share-success-toast\s*\{[^}]*position:\s*fixed/);
    assert.match(css, /\.share-success-toast\s*\{[^}]*align-items:\s*center/);
    assert.match(css, /\.share-success-toast\s*\{[^}]*justify-content:\s*center/);
    assert.match(css, /\.share-success-toast-mark\s*\{[^}]*background:\s*#16a34a/);
    assert.match(css, /\.share-success-toast-mark\s*\{[^}]*width:\s*2\.5rem/);
    assert.match(css, /\.share-success-toast-mark\s*\{[^}]*height:\s*2\.5rem/);
    assert.match(css, /\.share-success-toast-mark svg\s*\{[^}]*width:\s*1\.25rem/);
    assert.match(css, /\.share-success-toast-label\s*\{[^}]*color:\s*#16a34a/);
    assert.match(css, /\.share-success-toast-label\s*\{[^}]*font-size:\s*0\.8125rem/);
    assert.doesNotMatch(css, /\.share-success-toast-mark\s*\{[^}]*width:\s*4\.5rem/);
    assert.doesNotMatch(css, /\.share-success-toast-mark\s*\{[^}]*var\(--color-accent\)/);
    assert.doesNotMatch(css, /\.share-success-toast-card\s*\{[^}]*(?:background|min-width|padding|min-height)/);
    assert.match(css, /@keyframes share-success-toast-in/);
    assert.match(css, /@keyframes share-success-mark-shine/);
    assert.match(css, /@keyframes share-success-mark-sparkle/);
    assert.match(css, /\.share-success-toast-mark::after\s*\{[^}]*share-success-mark-shine/);
    assert.match(css, /\.share-success-toast-mark::before\s*\{[^}]*share-success-mark-sparkle/);
    assert.match(
      css,
      /prefers-reduced-motion:\s*reduce[\s\S]*\.action-done[\s\S]*animation:\s*none !important/,
    );
    assert.match(
      css,
      /prefers-reduced-motion:\s*reduce[\s\S]*\.share-success-toast-mark[\s\S]*animation:\s*none !important/,
    );
    assert.match(
      css,
      /prefers-reduced-motion:\s*reduce[\s\S]*\.share-success-toast-mark::after[\s\S]*content:\s*none !important/,
    );
  });
});

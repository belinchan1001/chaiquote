import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import {
  CRITICAL_KEYS,
  DEFAULT_MESSAGES_PATH,
  MIN_LOCALE_KEYS,
  assertCatalogueWriteAllowed,
  checkMessagesFile,
  checkMessagesSource,
  messagesCataloguePlugin,
  parseCheckMessagesArgs,
  parseLocaleTables,
} from "./check-messages.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SCRIPT = join(ROOT, "scripts/check-messages.mjs");

/** The 2026-09-19 Daily copy wipe that crashed production (`9d3dc97`). */
const WIPED_CATALOGUE = `import { LEGAL } from "./site.ts";

export type Locale = "zh" | "en";

export const MESSAGES = {
  zh: {
    tagline: "搵寬頻唔使四圍問",
    heroTitle1: "搵寬頻唔使四圍問",
    navGuides: "點揀",
    bestPicksLead: "每個服務類型，由本站現有參考計劃入面揀月費較低嘅一條；唔代表全港最平，實際以電訊商確認為準。"
  }
};
`;

function tinyCatalogue({ includeEn = true, enKeys = MIN_LOCALE_KEYS, dropCritical = false } = {}) {
  const zhKeys = [];
  const enList = [];
  const total = MIN_LOCALE_KEYS;
  for (let i = 0; i < total; i += 1) {
    const key = dropCritical && i === 0 ? "otherKey0" : i === 0 ? "heroTitle1" : `k${i}`;
    const name = i < CRITICAL_KEYS.length && !dropCritical ? CRITICAL_KEYS[i] : key;
    zhKeys.push(`    ${name}: "zh-${name}",`);
    if (i < enKeys) enList.push(`    ${name}: "en-${name}",`);
  }
  const enBlock = includeEn ? `\n  en: {\n${enList.join("\n")}\n  },` : "";
  return `export const MESSAGES = {\n  zh: {\n${zhKeys.join("\n")}\n  },${enBlock}\n};\n`;
}

test("parseCheckMessagesArgs defaults to src/lib/messages.ts", () => {
  assert.equal(parseCheckMessagesArgs([]).file, DEFAULT_MESSAGES_PATH);
  assert.equal(parseCheckMessagesArgs(["--file", "tmp/messages.ts"]).file, "tmp/messages.ts");
  assert.match(parseCheckMessagesArgs(["--file"]).error, /usage:/);
  assert.match(parseCheckMessagesArgs(["--wat"]).error, /unexpected argument: --wat/);
});

test("the restored #102 catalogue on disk passes the floor", () => {
  const result = checkMessagesFile(DEFAULT_MESSAGES_PATH);
  assert.equal(result.ok, true, result.errors.join("\n"));
  assert.ok(result.counts.zh >= MIN_LOCALE_KEYS);
  assert.equal(result.counts.zh, result.counts.en);
  const parsed = parseLocaleTables(readFileSync(DEFAULT_MESSAGES_PATH, "utf8"));
  for (const key of CRITICAL_KEYS) {
    assert.ok(parsed.locales.zh.keys.includes(key), `zh missing ${key}`);
    assert.ok(parsed.locales.en.keys.includes(key), `en missing ${key}`);
  }
});

test("喪簡 gate: missing en table OR a massive key drop fails the check", () => {
  const missingEn = checkMessagesSource(WIPED_CATALOGUE);
  assert.equal(missingEn.ok, false);
  assert.ok(missingEn.errors.some((error) => /locale table "en" is missing/.test(error)));
  assert.ok(missingEn.errors.some((error) => /locale table "zh" has 4 keys/.test(error)));
  assert.equal(missingEn.counts.zh, 4);
  assert.equal(missingEn.counts.en, 0);

  const crashedCount = checkMessagesSource(tinyCatalogue({ includeEn: true, enKeys: 3 }));
  assert.equal(crashedCount.ok, false);
  assert.ok(crashedCount.errors.some((error) => /locale table "en" has 3 keys/.test(error)));
});

test("intentionally emptying en fails the check (local dry-run of the 2026-09-19 wipe)", () => {
  const result = checkMessagesSource(WIPED_CATALOGUE);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => /locale table "en" is missing/.test(error)));
  assert.ok(result.errors.some((error) => /locale table "zh" has 4 keys/.test(error)));
  assert.ok(result.errors.some((error) => /critical homepage\/error keys missing/.test(error)));
  assert.equal(result.counts.zh, 4);
  assert.equal(result.counts.en, 0);
});

test("an en table that exists but is empty fails", () => {
  const result = checkMessagesSource(`export const MESSAGES = {\n  zh: {\n    tagline: "x",\n  },\n  en: {},\n};\n`);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => /locale table "en" is empty/.test(error)));
});

test("en below the floor with missing zh keys fails even when both tables exist", () => {
  const result = checkMessagesSource(tinyCatalogue({ includeEn: true, enKeys: 3 }));
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => /locale table "en" has 3 keys/.test(error)));
  assert.ok(result.errors.some((error) => /en is missing/.test(error)));
});

test("a full-size catalogue missing a homepage key fails", () => {
  const result = checkMessagesSource(tinyCatalogue({ dropCritical: true }));
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => /critical homepage\/error keys missing: tagline/.test(error)));
});

test("a catalogue at the floor with matching zh/en keys passes", () => {
  const result = checkMessagesSource(tinyCatalogue());
  assert.equal(result.ok, true, result.errors.join("\n"));
  assert.equal(result.counts.zh, MIN_LOCALE_KEYS);
  assert.equal(result.counts.en, MIN_LOCALE_KEYS);
});

test("assertCatalogueWriteAllowed refuses a wiped candidate", () => {
  assert.throws(() => assertCatalogueWriteAllowed(WIPED_CATALOGUE), /refusing to write messages\.ts/);
  assert.doesNotThrow(() => assertCatalogueWriteAllowed(tinyCatalogue()));
});

test("CLI exits 1 when --file points at an emptied en table", () => {
  const dir = mkdtempSync(join(tmpdir(), "check-messages-"));
  const candidate = join(dir, "messages.ts");
  writeFileSync(candidate, WIPED_CATALOGUE);
  const run = spawnSync(process.execPath, [SCRIPT, "--file", candidate], { encoding: "utf8" });
  assert.equal(run.status, 1);
  assert.match(run.stderr, /locale table "en" is missing/);
});

test("CLI exits 0 against the repo catalogue", () => {
  const run = spawnSync(process.execPath, [SCRIPT], { encoding: "utf8" });
  assert.equal(run.status, 0, run.stderr);
  assert.match(run.stdout, /ok/);
});

test("Vite production build hook refuses a missing en table so a wipe cannot ship", () => {
  const dir = mkdtempSync(join(tmpdir(), "check-messages-vite-"));
  const candidate = join(dir, "messages.ts");
  writeFileSync(candidate, WIPED_CATALOGUE);
  const plugin = messagesCataloguePlugin(candidate);
  assert.equal(plugin.apply, "build");
  assert.throws(() => plugin.buildStart(), /locale table "en" is missing/);
  assert.doesNotThrow(() => messagesCataloguePlugin(DEFAULT_MESSAGES_PATH).buildStart());
});

test("npm test, npm build, Vite, and Vercel all run the catalogue floor", () => {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
  const vercel = JSON.parse(readFileSync(join(ROOT, "vercel.json"), "utf8"));
  const vite = readFileSync(join(ROOT, "vite.config.ts"), "utf8");
  assert.equal(pkg.scripts["check:messages"], "node scripts/check-messages.mjs");
  assert.match(pkg.scripts.test, /check-messages\.mjs/);
  assert.match(pkg.scripts.build, /check-messages\.mjs/);
  assert.match(vercel.buildCommand, /check-messages\.mjs/);
  assert.match(vite, /messagesCataloguePlugin\(\)/);
  const workflow = readFileSync(join(ROOT, ".github/workflows/messages-catalogue.yml"), "utf8");
  assert.match(workflow, /node scripts\/check-messages\.mjs/);
});

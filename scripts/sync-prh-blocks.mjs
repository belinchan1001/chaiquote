#!/usr/bin/env node
/**
 * Fetch HA Public Rental Housing Stock and write catalogue block rows.
 *
 *   node scripts/sync-prh-blocks.mjs
 *   node scripts/sync-prh-blocks.mjs --cache-dir /tmp/ha_prhs
 *   node scripts/sync-prh-blocks.mjs --dry-run
 *
 * Re-runs replace src/lib/estate-prh-blocks-raw.ts from HA + hand-maintained
 * RAW only. Existing Lok Fu / 東頭 rows are not copied or wiped.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  collectHaEstates,
  extractTemplateRaw,
  HA_PRHS_DISTRICTS,
  isPrhCatalogueParent,
  parseCatalogueRaw,
  planPrhInserts,
  psiExportUrl,
  renderGeneratedTs,
  renderReportMd,
  renderSkippedMd,
} from "./prh-blocks-lib.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

export function parseSyncPrhArgs(argv) {
  const out = { cacheDir: "", dryRun: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--dry-run") {
      out.dryRun = true;
      continue;
    }
    if (arg === "--cache-dir") {
      if (!argv[i + 1]) return { error: "usage: node scripts/sync-prh-blocks.mjs [--cache-dir DIR] [--dry-run]" };
      out.cacheDir = argv[i + 1];
      i += 1;
      continue;
    }
    return { error: `unexpected argument: ${arg}` };
  }
  return out;
}

export function loadHandMaintainedRows({
  estatesSource,
  extraSource,
  villageSource,
} = {}) {
  const estates = estatesSource ?? readFileSync(join(ROOT, "src/lib/estates.ts"), "utf8");
  const extra = extraSource ?? readFileSync(join(ROOT, "src/lib/estate-extra-raw.ts"), "utf8");
  const village = villageSource ?? readFileSync(join(ROOT, "src/lib/estate-village-raw.ts"), "utf8");
  const rows = [
    ...parseCatalogueRaw(extractTemplateRaw(estates, "const RAW")),
    ...parseCatalogueRaw(extractTemplateRaw(extra, "export const EXTRA_RAW")),
    ...parseCatalogueRaw(extractTemplateRaw(village, "export const VILLAGE_RAW")),
  ];
  const seen = new Set();
  return rows.filter((row) => {
    if (seen.has(row.name)) return false;
    seen.add(row.name);
    return true;
  });
}

async function loadDistrictCsv(districtId, cacheDir) {
  if (cacheDir) {
    const cached = readFileSync(join(cacheDir, `${districtId}.csv`), "utf8");
    return cached;
  }
  const url = psiExportUrl(districtId);
  let lastError;
  for (const wait of [0, 4000, 8000]) {
    if (wait) await new Promise((resolve) => setTimeout(resolve, wait));
    try {
      const response = await fetch(url, { redirect: "follow" });
      if (!response.ok) {
        lastError = new Error(`${url} → HTTP ${response.status}`);
        continue;
      }
      return await response.text();
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError ?? new Error(`failed to fetch ${url}`);
}

export async function buildPrhPlan({ cacheDir = "", rows } = {}) {
  const existingRows = rows ?? loadHandMaintainedRows();
  const parents = existingRows.filter(isPrhCatalogueParent);
  const csvTexts = [];
  for (const district of HA_PRHS_DISTRICTS) {
    const text = await loadDistrictCsv(district.id, cacheDir);
    csvTexts.push({ districtId: district.id, text });
  }
  const haEstates = collectHaEstates(csvTexts);
  return planPrhInserts({ haEstates, parents, existingRows });
}

export function writePrhOutputs(plan, { dryRun = false, cacheUsed = false } = {}) {
  const generatedAt = new Date().toISOString().slice(0, 10);
  const files = {
    raw: join(ROOT, "src/lib/estate-prh-blocks-raw.ts"),
    skipped: join(ROOT, "scripts/prh-blocks/skipped.md"),
    report: join(ROOT, "scripts/prh-blocks/report.md"),
  };
  const contents = {
    raw: renderGeneratedTs(plan.inserts),
    skipped: renderSkippedMd(plan),
    report: renderReportMd(plan, { generatedAt, cacheUsed }),
  };
  if (!dryRun) {
    mkdirSync(dirname(files.skipped), { recursive: true });
    writeFileSync(files.raw, contents.raw);
    writeFileSync(files.skipped, contents.skipped);
    writeFileSync(files.report, contents.report);
  }
  return { files, contents, stats: plan.stats };
}

async function main(argv) {
  const args = parseSyncPrhArgs(argv);
  if (args.error) {
    console.error(`[sync-prh-blocks] ${args.error}`);
    process.exit(1);
  }
  const plan = await buildPrhPlan({ cacheDir: args.cacheDir });
  const written = writePrhOutputs(plan, { dryRun: args.dryRun, cacheUsed: Boolean(args.cacheDir) });
  console.log(
    `[sync-prh-blocks] matched ${plan.stats.matchedParents} estates, inserted ${plan.stats.insertedBlocks} blocks, gained ${plan.stats.estatesGainedBlocks}, skipped HA ${plan.stats.skippedHaEstates} / parents ${plan.stats.skippedCatalogueParents} / blocks ${plan.stats.skippedBlocks}`,
  );
  if (args.dryRun) console.log("[sync-prh-blocks] dry-run — files not written");
  else {
    console.log(`[sync-prh-blocks] wrote ${written.files.raw}`);
    console.log(`[sync-prh-blocks] wrote ${written.files.skipped}`);
    console.log(`[sync-prh-blocks] wrote ${written.files.report}`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2)).catch((err) => {
    console.error(`[sync-prh-blocks] ${err?.message || err}`);
    process.exit(1);
  });
}

#!/usr/bin/env node
/**
 * Hard floor for `src/lib/messages.ts`.
 *
 * Daily copy pass `9d3dc97` (2026-09-19) deleted the entire `en` table and
 * ~850 zh keys, which crashed production. Hotfix #102 restored the catalogue
 * (397 keys per locale). This check must fail if a later pass wipes or
 * replaces MESSAGES with an empty / partial catalogue.
 *
 * Daily copy may only edit individual keys — never overwrite the file with a
 * new object that drops a locale or falls below the floor.
 *
 *   node scripts/check-messages.mjs [--file <path>]
 *
 * Exit 0 if the catalogue is safe, 1 if it is not. `--file` is for a dry-run
 * against a candidate (Daily copy must refuse the write when this exits 1).
 */
import { readFileSync, realpathSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const DEFAULT_MESSAGES_PATH = join(ROOT, "src/lib/messages.ts");

/** Key count on main after hotfix #102 (zh === en, full catalogue). */
export const BASELINE_ZH_KEYS = 397;
/** 90% of the #102 baseline — a wipe lands far below this; a few key edits do not. */
export const MIN_LOCALE_KEYS = Math.ceil(BASELINE_ZH_KEYS * 0.9);

export const REQUIRED_LOCALES = ["zh", "en"];

/** Homepage + error-chrome keys that must survive any copy pass. */
export const CRITICAL_KEYS = [
  "tagline",
  "heroTitle1",
  "heroLead",
  "bestPicksTitle",
  "bestPicksLead",
  "goCompare",
  "orReadGuide",
  "featuredTitle",
  "errorTitle",
  "notFound",
];

export function isMainModule(moduleUrl) {
  const entry = process.argv[1];
  if (!entry) return false;
  try {
    return realpathSync(entry) === fileURLToPath(moduleUrl);
  } catch {
    return false;
  }
}

export function parseCheckMessagesArgs(argv) {
  const fileFlag = argv.indexOf("--file");
  if (fileFlag !== -1 && !argv[fileFlag + 1]) {
    return { error: "usage: node scripts/check-messages.mjs [--file <path>]" };
  }
  const rest =
    fileFlag === -1
      ? argv
      : argv.filter((_, i) => i !== fileFlag && i !== fileFlag + 1);
  if (rest.length > 0) return { error: `unexpected argument: ${rest[0]}` };
  return { file: fileFlag === -1 ? DEFAULT_MESSAGES_PATH : argv[fileFlag + 1] };
}

function skipWsAndComments(source, i) {
  while (i < source.length) {
    const c = source[i];
    if (c === " " || c === "\n" || c === "\r" || c === "\t") {
      i += 1;
      continue;
    }
    if (source.startsWith("//", i)) {
      const nl = source.indexOf("\n", i);
      i = nl === -1 ? source.length : nl + 1;
      continue;
    }
    if (source.startsWith("/*", i)) {
      const end = source.indexOf("*/", i + 2);
      i = end === -1 ? source.length : end + 2;
      continue;
    }
    break;
  }
  return i;
}

function readIdent(source, i) {
  if (!/[A-Za-z_]/.test(source[i] ?? "")) return null;
  let j = i + 1;
  while (j < source.length && /[\w]/.test(source[j])) j += 1;
  return { name: source.slice(i, j), end: j };
}

function sliceBalancedObject(source, openIdx) {
  if (source[openIdx] !== "{") return null;
  let depth = 0;
  let inStr = null;
  let escape = false;
  for (let i = openIdx; i < source.length; i += 1) {
    const c = source[i];
    if (inStr) {
      if (escape) {
        escape = false;
        continue;
      }
      if (c === "\\") {
        escape = true;
        continue;
      }
      if (c === inStr) inStr = null;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      inStr = c;
      continue;
    }
    if (source.startsWith("//", i)) {
      const nl = source.indexOf("\n", i);
      i = nl === -1 ? source.length - 1 : nl;
      continue;
    }
    if (source.startsWith("/*", i)) {
      const end = source.indexOf("*/", i + 2);
      i = end === -1 ? source.length - 1 : end + 1;
      continue;
    }
    if (c === "{") depth += 1;
    if (c === "}") {
      depth -= 1;
      if (depth === 0) return source.slice(openIdx, i + 1);
    }
  }
  return null;
}

function walkDepth1Props(objectLiteral, onProp) {
  if (!objectLiteral || objectLiteral[0] !== "{") return;
  let i = 1;
  let depth = 1;
  let inStr = null;
  let escape = false;
  while (i < objectLiteral.length && depth > 0) {
    const c = objectLiteral[i];
    if (inStr) {
      if (escape) {
        escape = false;
        i += 1;
        continue;
      }
      if (c === "\\") {
        escape = true;
        i += 1;
        continue;
      }
      if (c === inStr) inStr = null;
      i += 1;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      inStr = c;
      i += 1;
      continue;
    }
    if (sourceStartsComment(objectLiteral, i)) {
      i = skipWsAndComments(objectLiteral, i);
      continue;
    }
    if (c === "{") {
      depth += 1;
      i += 1;
      continue;
    }
    if (c === "}") {
      depth -= 1;
      i += 1;
      continue;
    }
    if (depth === 1) {
      const ident = readIdent(objectLiteral, i);
      if (ident) {
        const after = skipWsAndComments(objectLiteral, ident.end);
        if (objectLiteral[after] === ":") {
          const valueStart = skipWsAndComments(objectLiteral, after + 1);
          onProp(ident.name, valueStart);
          i = valueStart;
          continue;
        }
      }
    }
    i += 1;
  }
}

function sourceStartsComment(source, i) {
  return source.startsWith("//", i) || source.startsWith("/*", i);
}

function collectObjectKeys(objectLiteral) {
  const keys = [];
  walkDepth1Props(objectLiteral, (name) => {
    keys.push(name);
  });
  return keys;
}

/**
 * Parse `export const MESSAGES = { zh: {…}, en: {…} }` from TypeScript source.
 * Returns locale → key list. A missing locale is absent from the map (not []).
 */
export function parseLocaleTables(source) {
  const start = source.search(/export\s+const\s+MESSAGES\s*=/);
  if (start === -1) {
    return { error: "MESSAGES export not found", locales: {} };
  }
  const brace = source.indexOf("{", start);
  if (brace === -1) {
    return { error: "MESSAGES object not found", locales: {} };
  }
  const obj = sliceBalancedObject(source, brace);
  if (!obj) {
    return { error: "MESSAGES object is unclosed", locales: {} };
  }

  const locales = {};
  walkDepth1Props(obj, (name, valueStart) => {
    if (obj[valueStart] !== "{") return;
    const table = sliceBalancedObject(obj, valueStart);
    if (!table) {
      locales[name] = { keys: [], present: true, unclosed: true };
      return;
    }
    locales[name] = { keys: collectObjectKeys(table), present: true };
  });

  return { locales };
}

export function checkMessagesCatalogue(parsed) {
  const errors = [];
  if (parsed.error) errors.push(parsed.error);
  const locales = parsed.locales ?? {};

  for (const locale of REQUIRED_LOCALES) {
    const entry = locales[locale];
    if (!entry?.present) {
      errors.push(`locale table "${locale}" is missing`);
      continue;
    }
    if (entry.unclosed) {
      errors.push(`locale table "${locale}" is unclosed`);
      continue;
    }
    const count = entry.keys.length;
    if (count === 0) {
      errors.push(`locale table "${locale}" is empty`);
      continue;
    }
    if (count < MIN_LOCALE_KEYS) {
      errors.push(
        `locale table "${locale}" has ${count} keys; floor is ${MIN_LOCALE_KEYS} ` +
          `(90% of ${BASELINE_ZH_KEYS} after hotfix #102)`,
      );
    }
  }

  const zh = locales.zh?.keys ?? [];
  const en = locales.en?.keys ?? [];
  if (locales.zh?.present && locales.en?.present) {
    const enSet = new Set(en);
    const missingInEn = zh.filter((key) => !enSet.has(key));
    if (missingInEn.length > 0) {
      const preview = missingInEn.slice(0, 8).join(", ");
      const more = missingInEn.length > 8 ? ` (+${missingInEn.length - 8} more)` : "";
      errors.push(`en is missing ${missingInEn.length} zh key(s): ${preview}${more}`);
    }
  }

  const known = new Set([...zh, ...en]);
  const missingCritical = CRITICAL_KEYS.filter((key) => !known.has(key));
  if (missingCritical.length > 0) {
    errors.push(`critical homepage/error keys missing: ${missingCritical.join(", ")}`);
  }

  const counts = {
    zh: locales.zh?.keys.length ?? 0,
    en: locales.en?.keys.length ?? 0,
  };
  return { ok: errors.length === 0, errors, counts };
}

export function checkMessagesSource(source) {
  return checkMessagesCatalogue(parseLocaleTables(source));
}

/** Refuse a Daily copy overwrite that would drop the catalogue below the floor. */
export function assertCatalogueWriteAllowed(candidateSource) {
  const result = checkMessagesSource(candidateSource);
  if (!result.ok) {
    const err = new Error(
      `refusing to write messages.ts — catalogue below floor:\n${result.errors.join("\n")}`,
    );
    err.errors = result.errors;
    err.result = result;
    throw err;
  }
  return result;
}

export function checkMessagesFile(filePath = DEFAULT_MESSAGES_PATH) {
  let source;
  try {
    source = readFileSync(filePath, "utf8");
  } catch (err) {
    return {
      ok: false,
      errors: [`cannot read ${filePath}: ${err?.message || err}`],
      counts: { zh: 0, en: 0 },
    };
  }
  return checkMessagesSource(source);
}

function formatReport(result, filePath) {
  const lines = [
    `[check-messages] ${filePath}`,
    `[check-messages] zh=${result.counts.zh} en=${result.counts.en} floor=${MIN_LOCALE_KEYS}`,
  ];
  if (result.ok) {
    lines.push("[check-messages] ok");
    return lines.join("\n");
  }
  for (const error of result.errors) {
    lines.push(`[check-messages] ${error}`);
  }
  return lines.join("\n");
}

function main(argv) {
  const args = parseCheckMessagesArgs(argv);
  if (args.error) {
    console.error(`[check-messages] ${args.error}`);
    process.exit(1);
  }
  const filePath = resolve(ROOT, args.file);
  const result = checkMessagesFile(filePath);
  const report = formatReport(result, filePath);
  if (result.ok) {
    console.log(report);
    process.exit(0);
  }
  console.error(report);
  process.exit(1);
}

if (isMainModule(import.meta.url)) {
  main(process.argv.slice(2));
}

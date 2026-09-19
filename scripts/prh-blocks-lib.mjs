/**
 * Official HA Public Rental Housing stock → catalogue block rows.
 *
 * Matching is exact (or an existing catalogue alias / parentheses-stripped
 * alias). Never invents estate or block names. Short aliases are omitted so
 * 「樂民」-style collisions cannot happen.
 */
export const DATASET_PAGE =
  "https://data.gov.hk/en-data/dataset/hk-housing-emms-emms-housing-stock";
export const PSI_EXPORT_TEMPLATE =
  "https://data.housingauthority.gov.hk/psi/rest/export/ha_prhs/{district}/en/csv";

/** Same district codes as the HA PSI export API. */
export const HA_PRHS_DISTRICTS = [
  { id: "ha_prhs_a", board: "Central & Western" },
  { id: "ha_prhs_b", board: "Wan Chai" },
  { id: "ha_prhs_c", board: "Eastern" },
  { id: "ha_prhs_d", board: "Southern" },
  { id: "ha_prhs_e", board: "Yau Tsim Mong" },
  { id: "ha_prhs_f", board: "Sham Shui Po" },
  { id: "ha_prhs_g", board: "Kowloon City" },
  { id: "ha_prhs_h", board: "Wong Tai Sin" },
  { id: "ha_prhs_j", board: "Kwun Tong" },
  { id: "ha_prhs_k", board: "Tsuen Wan" },
  { id: "ha_prhs_l", board: "Tuen Mun" },
  { id: "ha_prhs_m", board: "Yuen Long" },
  { id: "ha_prhs_n", board: "North" },
  { id: "ha_prhs_p", board: "Tai Po" },
  { id: "ha_prhs_q", board: "Sai Kung" },
  { id: "ha_prhs_r", board: "Sha Tin" },
  { id: "ha_prhs_s", board: "Kwai Tsing" },
  { id: "ha_prhs_t", board: "Islands" },
];

export function psiExportUrl(districtId) {
  return PSI_EXPORT_TEMPLATE.replace("{district}", districtId);
}

/** Mirror of src/lib/estates.ts compact(), without the zh-s2t import. */
export function compact(value) {
  return String(value ?? "")
    .replace(/滙/g, "匯")
    .replace(/[\s\-'’_.．]/g, "")
    .replace(/[０-９]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xff10 + 48))
    .replace(/[Ａ-Ｚａ-ｚ]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
    .toLowerCase();
}

/** Strip decorative brackets so 黃大仙下（一）邨 matches HA 黃大仙下一邨. */
export function parenFreeKey(value) {
  return compact(value).replace(/[()（）]/g, "");
}

export function titleCaseHaEnglish(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  return raw
    .toLowerCase()
    .replace(/(^|[\s\-/])([a-z])/g, (_, lead, letter) => lead + letter.toUpperCase());
}

export function parseCsv(text) {
  const source = String(text ?? "").replace(/^\uFEFF/, "");
  if (!source.trim()) return { header: [], rows: [] };
  const lines = source.split(/\r?\n/).filter((line) => line.length > 0);
  const header = parseCsvLine(lines[0]);
  const rows = lines.slice(1).map((line) => {
    const cols = parseCsvLine(line);
    const row = {};
    for (let i = 0; i < header.length; i += 1) row[header[i]] = cols[i] ?? "";
    return row;
  });
  return { header, rows };
}

function parseCsvLine(line) {
  const out = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i += 1;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

export function extractTemplateRaw(source, binding) {
  const re = new RegExp(`${binding}\\s*=\\s*\`([\\s\\S]*?)\`\\.trim\\(\\)`);
  const match = String(source ?? "").match(re);
  return match ? match[1] : "";
}

export function parseCatalogueRaw(text) {
  const rows = [];
  for (const line of String(text ?? "").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("*") || trimmed.startsWith("export")) {
      continue;
    }
    const [name, aliasStr, district, housing, area, flag, street] = trimmed.split("|");
    if (!name || !district || !housing) continue;
    rows.push({
      name,
      aliases: (aliasStr ?? "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      district,
      housing,
      area: area || undefined,
      coverageCheck: flag === "check" || flag === "覆蓋需查核" || undefined,
      street: street?.trim() || undefined,
    });
  }
  return rows;
}

export function isPrhCatalogueParent(row) {
  return row.housing === "public" && /[邨苑]$/.test(row.name);
}

export function collectHaEstates(csvTexts) {
  const estates = new Map();
  for (const { districtId, text } of csvTexts) {
    const { rows } = parseCsv(text);
    for (const row of rows) {
      const zh = (row.estate_chinese_name ?? "").trim();
      const blockZh = (row.chinese_name_of_block ?? "").trim();
      if (!zh || !blockZh) continue;
      if (!estates.has(zh)) {
        estates.set(zh, {
          chineseName: zh,
          englishName: (row.estate_english_name ?? "").trim(),
          districtChinese: (row.district_chinese_name ?? "").trim(),
          districtId,
          blocks: new Map(),
        });
      }
      const estate = estates.get(zh);
      if (!estate.blocks.has(blockZh)) {
        estate.blocks.set(blockZh, {
          chineseName: blockZh,
          englishName: (row.english_name_of_block ?? "").trim(),
        });
      }
    }
  }
  return [...estates.values()].sort((a, b) => a.chineseName.localeCompare(b.chineseName, "zh-Hant"));
}

export function findPrhParent(haEstate, parents) {
  const zh = haEstate.chineseName;
  const exact = parents.filter((parent) => parent.name === zh || parent.aliases.includes(zh));
  if (exact.length === 1) return { parent: exact[0], how: "exact-zh" };
  if (exact.length > 1) {
    return { parent: undefined, how: "ambiguous-zh", hits: exact.map((item) => item.name) };
  }

  const key = parenFreeKey(zh);
  const paren = parents.filter(
    (parent) => parenFreeKey(parent.name) === key || parent.aliases.some((alias) => parenFreeKey(alias) === key),
  );
  if (paren.length === 1) return { parent: paren[0], how: "paren-zh" };
  if (paren.length > 1) {
    return { parent: undefined, how: "ambiguous-paren", hits: paren.map((item) => item.name) };
  }

  const en = compact(haEstate.englishName);
  if (!en) return { parent: undefined, how: "no-parent" };
  const englishHits = parents.filter(
    (parent) => compact(parent.name) === en || parent.aliases.some((alias) => compact(alias) === en),
  );
  if (englishHits.length === 1) return { parent: englishHits[0], how: "exact-en" };
  if (englishHits.length > 1) {
    return { parent: undefined, how: "ambiguous-en", hits: englishHits.map((item) => item.name) };
  }
  return { parent: undefined, how: "no-parent" };
}

const FACILITY_BLOCK = /服務設施|商場|停車場|社區|學校|管理處|長者住屋/;

export function blockSkipReason(blockZh) {
  const name = String(blockZh ?? "").trim();
  if (!name) return "empty HA block name";
  if (FACILITY_BLOCK.test(name)) return "facility / non-residential HA block name";
  if (/[()（）]/.test(name)) return "HA block name has brackets — not a single 樓／閣";
  const tight = name.replace(/[\s\u3000]+/g, "");
  if (/[高低]座$/.test(tight)) return "HA wing split (高座／低座) — not a single 樓／閣";
  if (!/[樓閣]$/.test(tight)) return "HA block name is not 樓／閣 (relatedBlocks pattern)";
  return null;
}

function linkedToParent(row, parentName, blockZh) {
  const full = `${parentName}${blockZh}`;
  return [row.name, ...row.aliases].some((alias) => alias === full || alias === `${parentName}${row.name}`);
}

export function planPrhInserts({ haEstates, parents, existingRows }) {
  const existingByName = new Map();
  for (const row of existingRows) {
    if (!existingByName.has(row.name)) existingByName.set(row.name, row);
  }
  const reserved = new Set(existingByName.keys());
  const englishOwners = new Map();
  for (const row of existingRows) {
    for (const alias of [row.name, ...row.aliases]) {
      if (!/[A-Za-z]/.test(alias)) continue;
      const key = compact(alias);
      if (key && !englishOwners.has(key)) englishOwners.set(key, row.name);
    }
  }

  const matchedParents = new Map();
  const skippedHaEstates = [];
  const skippedBlocks = [];
  const already = [];
  const inserts = [];

  const ownersByBlock = new Map();
  const matchedHa = [];
  for (const ha of haEstates) {
    const found = findPrhParent(ha, parents);
    if (!found.parent) {
      skippedHaEstates.push({
        haEstate: ha.chineseName,
        haEnglish: ha.englishName,
        district: ha.districtChinese,
        districtId: ha.districtId,
        blocks: ha.blocks.size,
        reason: skipEstateReason(found, ha),
      });
      continue;
    }
    matchedHa.push({ ha, parent: found.parent, how: found.how });
    if (!matchedParents.has(found.parent.name)) {
      matchedParents.set(found.parent.name, { parent: found.parent, how: found.how, haNames: [] });
    }
    matchedParents.get(found.parent.name).haNames.push(ha.chineseName);
    for (const block of ha.blocks.values()) {
      if (!ownersByBlock.has(block.chineseName)) ownersByBlock.set(block.chineseName, new Set());
      ownersByBlock.get(block.chineseName).add(found.parent.name);
    }
  }

  const pendingEnglish = new Map();
  for (const { ha, parent } of matchedHa) {
    for (const block of ha.blocks.values()) {
      if (blockSkipReason(block.chineseName)) continue;
      const titled = titleCaseHaEnglish(block.englishName);
      if (!titled) continue;
      const key = compact(titled);
      if (!pendingEnglish.has(key)) pendingEnglish.set(key, new Set());
      pendingEnglish.get(key).add(`${parent.name}\0${block.chineseName}`);
    }
  }

  for (const { ha, parent, how } of matchedHa) {
    for (const block of [...ha.blocks.values()].sort((a, b) =>
      a.chineseName.localeCompare(b.chineseName, "zh-Hant"),
    )) {
      const skip = blockSkipReason(block.chineseName);
      if (skip) {
        skippedBlocks.push({
          parent: parent.name,
          haEstate: ha.chineseName,
          block: block.chineseName,
          reason: skip,
        });
        continue;
      }

      const existing = existingByName.get(block.chineseName);
      if (existing && linkedToParent(existing, parent.name, block.chineseName)) {
        already.push({ parent: parent.name, block: block.chineseName, name: existing.name });
        continue;
      }

      const shared = ownersByBlock.get(block.chineseName) ?? new Set();
      const shortTaken = reserved.has(block.chineseName) || shared.size > 1;
      const name = shortTaken ? `${parent.name}${block.chineseName}` : block.chineseName;
      if (reserved.has(name)) {
        skippedBlocks.push({
          parent: parent.name,
          haEstate: ha.chineseName,
          block: block.chineseName,
          reason: `catalogue name ${name} already exists and is not this parent`,
        });
        continue;
      }

      const fullAlias = `${parent.name}${block.chineseName}`;
      const aliases = [];
      const titled = titleCaseHaEnglish(block.englishName);
      const enKey = titled ? compact(titled) : "";
      const englishFree =
        titled &&
        !englishOwners.has(enKey) &&
        (pendingEnglish.get(enKey)?.size ?? 0) <= 1;
      if (englishFree) {
        aliases.push(titled);
        englishOwners.set(enKey, name);
      }
      if (fullAlias !== name) aliases.push(fullAlias);

      reserved.add(name);
      inserts.push({
        name,
        aliases,
        district: parent.district,
        housing: "public",
        area: parent.area,
        street: parent.street,
        parent: parent.name,
        haEstate: ha.chineseName,
        haBlock: block.chineseName,
        how,
      });
    }
  }

  const unmatchedParents = parents
    .filter((parent) => !matchedParents.has(parent.name))
    .map((parent) => ({
      parent: parent.name,
      district: parent.district,
      reason: "no HA estate_chinese_name (or existing alias / paren-stripped alias) matches this PRH 邨／苑",
    }));

  inserts.sort(
    (a, b) =>
      a.parent.localeCompare(b.parent, "zh-Hant") || a.name.localeCompare(b.name, "zh-Hant"),
  );

  const gained = new Set(inserts.map((row) => row.parent));
  return {
    inserts,
    already,
    skippedHaEstates: skippedHaEstates.sort((a, b) => a.haEstate.localeCompare(b.haEstate, "zh-Hant")),
    skippedBlocks: skippedBlocks.sort(
      (a, b) => a.parent.localeCompare(b.parent, "zh-Hant") || a.block.localeCompare(b.block, "zh-Hant"),
    ),
    unmatchedParents: unmatchedParents.sort((a, b) => a.parent.localeCompare(b.parent, "zh-Hant")),
    matchedParents,
    stats: {
      haEstates: haEstates.length,
      matchedParents: matchedParents.size,
      estatesGainedBlocks: gained.size,
      insertedBlocks: inserts.length,
      alreadyPresent: already.length,
      skippedHaEstates: skippedHaEstates.length,
      skippedCatalogueParents: unmatchedParents.length,
      skippedBlocks: skippedBlocks.length,
    },
  };
}

function skipEstateReason(found, ha) {
  if (found.how === "ambiguous-zh") {
    return `HA ${ha.chineseName} matches more than one catalogue parent (${found.hits.join("、")})`;
  }
  if (found.how === "ambiguous-paren") {
    return `HA ${ha.chineseName} paren-stripped name is ambiguous (${found.hits.join("、")})`;
  }
  if (found.how === "ambiguous-en") {
    return `HA ${ha.englishName} matches more than one catalogue parent (${found.hits.join("、")})`;
  }
  return `HA estate_chinese_name ${ha.chineseName} is not a catalogue PRH 邨／苑 name or alias`;
}

export function formatCatalogueLine(row) {
  const aliases = row.aliases.join(",");
  const area = row.area ?? "";
  const street = row.street ?? "";
  const needsTail = Boolean(area || street);
  const tail = needsTail ? `|${area}||${street}`.replace(/\|+$/, "") : "";
  return `${row.name}|${aliases}|${row.district}|public${tail}`;
}

export function renderGeneratedTs(inserts) {
  const lines = inserts.map(formatCatalogueLine);
  return `/**
 * Generated HA PRH block rows. Do not hand-edit.
 *
 * Source: Housing Authority Public Rental Housing Stock
 * ${DATASET_PAGE}
 * Regen: node scripts/sync-prh-blocks.mjs
 *
 * Short aliases are omitted on purpose (樂民-style collisions).
 * Hand-maintained Lok Fu / 東頭 / 美東 / 曉茵 / 海富 rows stay in estates.ts
 * and estate-extra-raw.ts — this file only adds missing sourced 樓／閣.
 */
export const PRH_BLOCKS_RAW = \`
${lines.join("\n")}
\`.trim();
`;
}

export function renderSkippedMd(plan) {
  const haLines = plan.skippedHaEstates.map(
    (item) =>
      `- **${item.haEstate}** (${item.haEnglish || "—"}; ${item.district || item.districtId}; ${item.blocks} HA blocks) — ${item.reason}`,
  );
  const parentLines = plan.unmatchedParents.map(
    (item) => `- **${item.parent}** (${item.district}) — ${item.reason}`,
  );
  const blockLines = plan.skippedBlocks.map(
    (item) => `- **${item.parent}** / ${item.block} (HA estate ${item.haEstate}) — ${item.reason}`,
  );
  return `# PRH block pipeline — skip list

Generated by \`scripts/sync-prh-blocks.mjs\`. Names are never invented to fill these gaps.

## HA estates with no catalogue PRH 邨／苑 parent (${plan.skippedHaEstates.length})

居屋 苑, 軒／臺, interim housing, and other HA stock rows that are not a public 邨／苑 parent in the site catalogue.

${haLines.join("\n") || "_None._"}

## Catalogue PRH 邨／苑 parents with no HA stock match (${plan.unmatchedParents.length})

HKHS / non-HA courts, umbrella names, new intake not yet in the stock file, or empty district exports (Wan Chai \`ha_prhs_b\`).

${parentLines.join("\n") || "_None._"}

## HA blocks not inserted (${plan.skippedBlocks.length})

Only 樓／閣 names are inserted (same \`relatedBlocks\` pattern as 樂富邨). Shared short names are disambiguated as 「邨名××樓」; a remaining clash is skipped.

${blockLines.join("\n") || "_None._"}
`;
}

export function renderReportMd(plan, { generatedAt, cacheUsed }) {
  const samples = ["樂富邨", "天耀邨", "華富邨", "尚德邨", "水泉澳邨", "東頭邨"]
    .map((name) => {
      const existing = plan.already.filter((item) => item.parent === name).map((item) => item.block);
      const added = plan.inserts.filter((item) => item.parent === name).map((item) => item.haBlock);
      const matched = plan.matchedParents.get(name);
      return `| ${name} | ${matched ? matched.haNames.join("、") : "—"} | ${existing.length} kept | ${added.length} inserted | ${[...existing.slice(0, 3), ...added.slice(0, 3)].join("、") || "—"} |`;
    })
    .join("\n");
  return `# PRH block catalogue pipeline

## Source

- Dataset: [Housing Authority's Public Rental Housing Stock](${DATASET_PAGE}) (last updated 2026-06-22 on data.gov.hk)
- Export: \`${PSI_EXPORT_TEMPLATE}\` (English CSV — includes Chinese estate / block fields)
- Districts: ${HA_PRHS_DISTRICTS.map((item) => `\`${item.id}\``).join(", ")}
- Generated: ${generatedAt}${cacheUsed ? " (from \`--cache-dir\`)" : ""}

Same family as #105 Lok Fu (\`ha_prhs_h\`, \`estate_chinese_name\` / \`chinese_name_of_block\`).

## Gates

1. Insert block names from HA only. Estate mismatches go to [skipped.md](./skipped.md) — no force-match.
2. No short CJK aliases (avoids 樂民 / 樂翠 collisions). English is added only when that compact key is unique.
3. Flash-unlock and hierarchical skip logic are unchanged.
4. Hand-maintained Lok Fu / 東頭 / 美東 / 曉茵 / 海富 rows are not rewritten.

## Counts

| Metric | n |
| --- | ---: |
| HA estates in stock files | ${plan.stats.haEstates} |
| Catalogue PRH 邨／苑 parents matched | ${plan.stats.matchedParents} |
| Estates that gained new block rows | ${plan.stats.estatesGainedBlocks} |
| New catalogue rows inserted | ${plan.stats.insertedBlocks} |
| HA blocks already in hand-maintained RAW | ${plan.stats.alreadyPresent} |
| HA estates skipped | ${plan.stats.skippedHaEstates} |
| Catalogue PRH parents skipped | ${plan.stats.skippedCatalogueParents} |
| HA blocks skipped | ${plan.stats.skippedBlocks} |

## Sample acceptance

| Estate | HA name(s) used | Already sourced | New rows | Sample blocks |
| --- | --- | --- | --- | --- |
${samples}

Yoho / 嘉湖 ranking and flash-unlock are covered by existing tests (unchanged).
`;
}

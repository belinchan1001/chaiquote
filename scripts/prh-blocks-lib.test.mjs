import assert from "node:assert/strict";
import { test } from "node:test";
import {
  blockSkipReason,
  collectHaEstates,
  compact,
  extractTemplateRaw,
  findPrhParent,
  formatCatalogueLine,
  isPrhCatalogueParent,
  parenFreeKey,
  parseCatalogueRaw,
  parseCsv,
  planPrhInserts,
  titleCaseHaEnglish,
} from "./prh-blocks-lib.mjs";
import { loadHandMaintainedRows, parseSyncPrhArgs } from "./sync-prh-blocks.mjs";

const PARENTS = parseCatalogueRaw(`
樂富邨|樂富,Lok Fu,Lok Fu Estate|黃大仙|public
天耀邨|天耀,天耀一邨,天耀二邨,Tin Yiu|元朗|public|天水圍
華富邨|華富,華富一邨,華富二邨,Wah Fu|南區|public
黃大仙下邨|黃大仙下,黃大仙下（一）邨,黃大仙下二邨,Lower Wong Tai Sin|黃大仙|public
彩明苑|彩明,Choi Ming Court|西貢|hos|將軍澳
彩明邨|彩明邨,Choi Ming Estate|西貢|public|將軍澳
東涌逸東邨|逸東,逸東邨,逸東一邨,逸東二邨,Yat Tung|離島|public|東涌
俊宏軒|俊宏,Grandeur Terrace|元朗|public|天水圍
樂民新村|樂民,Lok Man|九龍城|public
橫頭磡邨|橫頭磡,Wang Tau Hom|黃大仙|public
耀東邨|Yiu Tung Estate|東區|public
`);

const PRH_PARENTS = PARENTS.filter(isPrhCatalogueParent);

function ha(chineseName, englishName, blocks) {
  return {
    chineseName,
    englishName,
    districtChinese: "測試",
    districtId: "ha_prhs_x",
    blocks: new Map(blocks.map((item) => [item.zh, { chineseName: item.zh, englishName: item.en }])),
  };
}

test("parseSyncPrhArgs accepts cache-dir and dry-run only", () => {
  assert.deepEqual(parseSyncPrhArgs([]), { cacheDir: "", dryRun: false });
  assert.deepEqual(parseSyncPrhArgs(["--dry-run", "--cache-dir", "/tmp/ha"]), {
    cacheDir: "/tmp/ha",
    dryRun: true,
  });
  assert.match(parseSyncPrhArgs(["--wat"]).error, /unexpected argument: --wat/);
});

test("CSV + title-case keep official HA fields", () => {
  const { rows } = parseCsv(
    "estate_chinese_name,english_name_of_block,chinese_name_of_block\n樂富邨,LOK TAI HOUSE,樂泰樓\n",
  );
  assert.equal(rows[0].estate_chinese_name, "樂富邨");
  assert.equal(rows[0].chinese_name_of_block, "樂泰樓");
  assert.equal(titleCaseHaEnglish("LOK TAI HOUSE"), "Lok Tai House");
  assert.equal(compact("Lok Fu Estate"), "lokfuestate");
  assert.equal(parenFreeKey("黃大仙下（一）邨"), parenFreeKey("黃大仙下一邨"));
});

test("collectHaEstates de-duplicates flats to unique blocks", () => {
  const csv = `estate_english_name,estate_chinese_name,district_english_name,district_chinese_name,region_english_name,region_chinese_name,english_name_of_block,chinese_name_of_block
LOK FU ESTATE,樂富邨,WONG TAI SIN,黃大仙,KOWLOON,九龍,LOK TAI HOUSE,樂泰樓
LOK FU ESTATE,樂富邨,WONG TAI SIN,黃大仙,KOWLOON,九龍,LOK TAI HOUSE,樂泰樓
LOK FU ESTATE,樂富邨,WONG TAI SIN,黃大仙,KOWLOON,九龍,LOK MAN HOUSE,樂民樓
`;
  const estates = collectHaEstates([{ districtId: "ha_prhs_h", text: csv }]);
  assert.equal(estates.length, 1);
  assert.equal(estates[0].blocks.size, 2);
  assert.equal(estates[0].blocks.get("樂泰樓").englishName, "LOK TAI HOUSE");
});

test("match HA names to catalogue parents without force-matching 居屋 / 軒", () => {
  assert.equal(findPrhParent(ha("樂富邨", "LOK FU ESTATE", []), PRH_PARENTS).how, "exact-zh");
  assert.equal(findPrhParent(ha("天耀一邨", "TIN YIU (1) ESTATE", []), PRH_PARENTS).parent.name, "天耀邨");
  assert.equal(findPrhParent(ha("黃大仙下一邨", "LOWER WONG TAI SIN (1) ESTATE", []), PRH_PARENTS).how, "paren-zh");
  assert.equal(findPrhParent(ha("黃大仙下一邨", "LOWER WONG TAI SIN (1) ESTATE", []), PRH_PARENTS).parent.name, "黃大仙下邨");
  assert.equal(findPrhParent(ha("逸東二邨", "YAT TUNG (2) ESTATE", []), PRH_PARENTS).parent.name, "東涌逸東邨");
  assert.equal(findPrhParent(ha("彩明苑", "CHOI MING COURT", []), PRH_PARENTS).parent, undefined);
  assert.equal(findPrhParent(ha("俊宏軒", "GRANDEUR TERRACE", []), PRH_PARENTS).parent, undefined);
  assert.equal(findPrhParent(ha("慈雲山邨", "TSZ WAN SHAN ESTATE", []), PRH_PARENTS).parent, undefined);
});

test("only 樓／閣 HA blocks are insertable", () => {
  assert.equal(blockSkipReason("樂泰樓"), null);
  assert.equal(blockSkipReason("海嵐閣"), null);
  assert.match(blockSkipReason("第十九座"), /not 樓／閣/);
  assert.match(blockSkipReason("中苑台"), /not 樓／閣/);
  assert.match(blockSkipReason("利福樓　高座"), /wing split/);
  assert.match(blockSkipReason("民康樓(1)"), /brackets/);
  assert.match(blockSkipReason("服務設施大樓"), /facility/);
});

test("plan inserts Lok Fu-style rows, skips already-sourced, disambiguates shared 樓 names", () => {
  const existingRows = [
    ...PARENTS,
    {
      name: "樂泰樓",
      aliases: ["Lok Tai House", "樂富邨樂泰樓"],
      district: "黃大仙",
      housing: "public",
    },
    {
      name: "宏光樓",
      aliases: ["Wang Kwong Building"],
      district: "觀塘",
      housing: "private",
    },
  ];
  const plan = planPrhInserts({
    existingRows,
    parents: PRH_PARENTS,
    haEstates: [
      ha("樂富邨", "LOK FU ESTATE", [{ zh: "樂泰樓", en: "LOK TAI HOUSE" }]),
      ha("天耀二邨", "TIN YIU (2) ESTATE", [
        { zh: "耀豐樓", en: "YIU FUNG HOUSE" },
        { zh: "耀盛樓", en: "YIU SHING HOUSE" },
      ]),
      ha("耀東邨", "YIU TUNG ESTATE", [{ zh: "耀豐樓", en: "YIU FUNG HOUSE" }]),
      ha("橫頭磡邨", "WANG TAU HOM ESTATE", [{ zh: "宏光樓", en: "WANG KWONG HOUSE" }]),
      ha("彩明苑", "CHOI MING COURT", [{ zh: "彩富閣", en: "CHOI FU HOUSE" }]),
      ha("慈雲山邨", "TSZ WAN SHAN ESTATE", [{ zh: "示範樓", en: "DEMO HOUSE" }]),
    ],
  });

  assert.equal(plan.already.some((item) => item.block === "樂泰樓" && item.parent === "樂富邨"), true);
  assert.equal(plan.inserts.some((item) => item.name === "樂泰樓"), false);

  const unique = plan.inserts.find((item) => item.haBlock === "耀盛樓");
  assert.equal(unique.name, "耀盛樓");
  assert.deepEqual(unique.aliases, ["Yiu Shing House", "天耀邨耀盛樓"]);
  assert.equal(unique.district, "元朗");
  assert.equal(unique.area, "天水圍");
  assert.equal(unique.aliases.some((alias) => alias === "耀盛"), false);

  const tinYiuShared = plan.inserts.find((item) => item.parent === "天耀邨" && item.haBlock === "耀豐樓");
  const yiuTungShared = plan.inserts.find((item) => item.parent === "耀東邨" && item.haBlock === "耀豐樓");
  assert.equal(tinYiuShared.name, "天耀邨耀豐樓");
  assert.equal(yiuTungShared.name, "耀東邨耀豐樓");
  assert.equal(tinYiuShared.aliases.includes("Yiu Fung House"), false);
  assert.equal(yiuTungShared.aliases.includes("Yiu Fung House"), false);

  const wang = plan.inserts.find((item) => item.haBlock === "宏光樓");
  assert.equal(wang.name, "橫頭磡邨宏光樓");
  assert.equal(plan.inserts.some((item) => item.name === "宏光樓"), false);
  assert.equal(plan.inserts.some((item) => item.haBlock === "彩富閣"), false);
  assert.equal(plan.skippedHaEstates.some((item) => item.haEstate === "慈雲山邨"), true);
  assert.equal(plan.unmatchedParents.some((item) => item.parent === "彩明邨"), true);

  const line = formatCatalogueLine(unique);
  assert.equal(line, "耀盛樓|Yiu Shing House,天耀邨耀盛樓|元朗|public|天水圍");
  assert.match(line, /天耀邨耀盛樓/);
  assert.doesNotMatch(line, /耀盛,/);
});

test("loadHandMaintainedRows reads RAW / extra / village and ignores generated PRH file", () => {
  const rows = loadHandMaintainedRows();
  assert.ok(rows.some((row) => row.name === "樂富邨"));
  assert.ok(rows.some((row) => row.name === "樂泰樓"));
  assert.ok(rows.some((row) => row.name === "東頭邨"));
  assert.equal(rows.some((row) => row.name === "PRH_BLOCKS_RAW"), false);
  const raw = extractTemplateRaw("export const EXTRA_RAW = `\n曉茵邨|曉茵|觀塘|public\n`.trim();", "export const EXTRA_RAW");
  assert.match(raw, /曉茵邨/);
});

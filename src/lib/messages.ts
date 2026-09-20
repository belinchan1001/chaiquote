import { LEGAL } from "./site.ts";

export type Locale = "zh" | "en";

/**
 * Do not wipe or replace this catalogue. Daily copy must only edit individual
 * keys — never clear `zh` / `en` or overwrite the file with a partial object.
 * `scripts/check-messages.mjs` (hotfix #102 floor) will fail the build if a
 * locale table is missing or drops below the key-count floor.
 */
export const MESSAGES = {
  zh: {
    tagline: "搜寬頻唔使四圍問",
    description:
      "齊Quote 係獨立電訊比較平台，一次過比較香港家居寬頻、5G 家居、商業寬頻同手機計劃。所列月費僅供參考。",
    updatedPrefix: "資料更新：",
    hkUpdated: "香港 · 資料更新 {date}",
    headerStrip:
      "資料更新：{date}　｜　本站無向電訊商收取佣金或廣告費；列出月費僅供參考，以電訊商確認為準。",
    dataUpdated: "資料更新 {date}",
    manuscriptDate: "稿件日期 {date}",
    manuscriptUpdated: "稿件日期 {published} · 更新 {modified}",
    navFibre: "光纖寬頻",
    heroTitle1: "搜寬頻唔使四圍問",
    notFound: "搜唔到呢頁",
    errorTitle: "呢頁暫時出咗問題",
  },
  en: {
    tagline: "Compare Hong Kong broadband in one place",
    headerStrip: "Data updated: {date} | This site does not take commission or advertising fees from carriers; listed monthly fees are for reference only. The carrier confirms the final terms.",
    navFibre: "Fibre",
    heroTitle1: "Stop shopping around for broadband",
    notFound: "Page not found",
    errorTitle: "This page isn’t working right now",
  },
} as const;

export type MessageKey = keyof (typeof MESSAGES)["zh"];

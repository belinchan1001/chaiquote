/**
 * Visible assistant lines for 齊Quote AI (測試版).
 * Locked 2026-11-23. Do not paraphrase. The off-topic line is Bill's
 * 10:56 HKT wording and must not include a phone number.
 */

export const PRODUCT_NAME = "齊Quote AI (測試版)";

export const OPENING = "輸入申請地址，即刻對照站內參考月費。";

export const DISCLAIMER = "只供參考，以電訊商確認為準。";

export const PLACEHOLDER_ADDRESS = "屋苑名或申請地址";

export const PLACEHOLDER_FOLLOW = "可以再講預算、網速或者轉台";

export const ASK_ADDRESS = "請輸入屋苑名或申請地址。";

export const SEVERAL_ESTATES = "搵到幾個相近嘅屋苑，請揀一個再對照。";

export const WAITING = "喺站內目錄對照緊。";

export const SPEED_ASK = "你想要咩網速？未定都可以，之後再講。呢個只係用嚟收窄站內參考。";

export const INSTALL_ASK = "你希望幾時安裝？呢個只係意向，實際安裝檔期以電訊商確認為準。";

export const SKIP_LINE = "未定都冇問題，我先按你已講嘅條件對照站內參考。";

export const REMEMBER = "已記住呢次嘅地址、樓類同營辦商。";

export const UNMATCHED =
  "對唔到呢個地址。你呢度係公屋、居屋、私人樓定村屋？你確認樓類之後，我再按呢個樓類出兩至三個站內參考；要睇多啲，可以去計劃目錄。";

export const BUDGET_WITH_ADDRESS = "可以按你嘅預算，喺呢次站內參考裏面收窄。要睇更多，去計劃目錄。";

export const BUDGET_NO_ADDRESS = "預算可以去計劃目錄按月費睇站內參考。";

export const PORT_IN =
  "轉台可以先去個人月費對照，登記而家嘅月費同到期日；步驟同注意事項見轉台寬頻攻略。對話唔計算解約費。";

export const NEW_INTAKE = "指定新入伙計劃只適用電訊商名單內嘅屋苑，可以去新入伙屋苑寬頻再對。";

export const NEW_INTAKE_HERE = "呢個屋苑喺站內有指定新入伙計劃，只適用名單內嘅屋苑。要唔要先睇呢啲？";

export const VILLAGE =
  "村屋要睇你條村嘅覆蓋同指定地址安排，可以去村屋光纖點算。指定地址優惠唔等於每條村都同一個價。";

export const NONE_MATCH = "按你確認嘅樓類，暫時未有啱呢個條件嘅站內參考。可以改條件，或者去計劃目錄再睇。";

/** Off-topic / out of scope. Exact characters. No phone number in the bubble. */
export const OFF_TOPIC = "我只能回覆電訊相關問題，如有其他查詢可直接聯絡齊Quote客服。";

/** Suggested label until copy is re-locked. Not part of the bubble. */
export const CS_LABEL = "聯絡齊Quote客服";

export const CS_HREF = "https://wa.me/85263099966";

export const HOUSING_CHIPS = ["公屋", "居屋", "私人樓", "村屋"] as const;

export type HousingWord = (typeof HOUSING_CHIPS)[number];

const COUNT_WORD: Record<number, string> = {
  1: "1 個",
  2: "兩個",
  3: "三個",
};

export function confirmHousing(housing: HousingWord) {
  return `站內按${housing}嚟對照，啱唔啱？而家用緊邊間？未有或者準備新申請都可以講。`;
}

/** Two or three references. Omit the exclude clause when there is no current provider. */
export function resultsIntro(count: number, excludedProvider: boolean) {
  if (count <= 0) return NONE_MATCH;
  const word = COUNT_WORD[count] ?? `${count} 個`;
  const drop = excludedProvider ? "，已剔除你而家呢間營辦商" : "";
  return `按你確認嘅樓類，呢度有${word}站內參考${drop}。合約期、到期同覆蓋，以電訊商確認為準。`;
}

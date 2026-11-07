# 齊Quote

香港家居寬頻、5G 家居及手機月費比較網站。所列月費僅供參考。

## 更新月費

喺 Grok 對話提供最新計劃／截圖，發佈後會推送到呢個 repo，Vercel 會自動上線。

## 本機（開發用）

```bash
npm install
npm run dev
```

正式站由 Vercel 跟 `main` 分支自動部署。

## WhatsApp 點擊報告（內部）

Bill 每週要報邊間電訊商有人撳 WhatsApp，開 [https://www.chaiquote.hk/ops/wa-clicks](https://www.chaiquote.hk/ops/wa-clicks)。

1. 輸入同電訊新聞編輯枱一樣嘅鎖匙：部署環境嘅 `INTEREST_TOKEN`，冇就用 `STATS_TOKEN`。
2. 預設最近 7 日（香港時間）。可以改「由／至」，或者撳「今日」「昨日」。最長 93 日。
3. 表按電訊商合計，再按日期 × 電訊商。下面可選計劃、來源、類別、樓宇類型。
4. 「下載電訊商 CSV」係分日分電訊商；「下載明細 CSV」再加計劃、來源、類別、樓宇。
5. 冇綁定計劃嘅點擊（頁頭、頁尾、未揀計劃嘅對話）會歸入「未標示」。

呢頁只讀 `site_events` 入面已經記下嘅 `wa_click`，唔改 Google Ads 預算或出價，亦唔改 WhatsApp 跳去邊個號碼。頁面 `noindex`，`robots.txt` 禁止 `/ops/wa-clicks`。

# 齊Quote 上 Google Play（Android TWA）

App 只係一個殼，打開 https://www.chaiquote.hk/ 。網站資料照舊用 AI 改，唔駛每次重新上架。

套件名：`hk.chaiquote.app`

## 你要自己做的（一定要你身份）

1. 開 [Google Play Console](https://play.google.com/console) 個人開發者帳戶，總費 **USD 25 一次**。
2. 完成身份驗證。
3. 建 App：套件名填 `hk.chaiquote.app`，名稱「齊Quote」。
4. 個人戶口通常要 **12 個測試者測滿 14 天**才可申請公開發佈。
5. 在 Play App signing 頁拷 **SHA-256 指紋**，交俾我換 `public/.well-known/assetlinks.json` 裡面那組 `00:00:...`。
6. 等 Vercel 發佈後用瀏覽器打開  
   https://www.chaiquote.hk/.well-known/assetlinks.json  
   見到真指紋先算驗證完成。

## 打 .aab 的機器（一次性）

需要 Java 17、Android SDK。在本 repo 目錄：

```bash
npm install -g @bubblewrap/cli
npx @bubblewrap/cli init --manifest https://www.chaiquote.hk/__grok/manifest.webmanifest
# 或直接用 android-twa/twa-manifest.json
npx @bubblewrap/cli update --manifest=android-twa/twa-manifest.json
npx @bubblewrap/cli build
```

生成 `app-release-bundle.aab` 後上傳 Play Console → 測試軌道。

簽名金鑰請自己保管，唔好發俾任何人（包括 AI）。

## 商店資料

文案見 `PLAY-LISTING.md`。

截圖：用手機開 www.chaiquote.hk 拍 **最少 2 張**（首頁、搜索結果），縦向、唔好有個人資料。

圖示：用現有 `public/icon-512.png`。
Feature graphic 1024×500 可以之後叫我出。

## 我可以幫你

- 貼商店文案、分類、Data safety 答法
- 換 assetlinks 指紋
- 等你有封裝好的 .aab 之後對照審核要求

唔能代你付錢、過身份驗證、或用你個人證最後提交。

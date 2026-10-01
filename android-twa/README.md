# 齊Quote 上 Google Play（Android TWA）

Android 專案已經用 Bubblewrap 生成，喺 [`android/`](../android/README.md)。呢個資料夾只保留商店文案草稿。

套件名：`hk.chaiquote.app`  
啟動網址：https://www.chaiquote.hk/  
upload key 同 Play App Signing 兩組 SHA-256 已經寫入 `public/.well-known/assetlinks.json`。

金鑰檔同密碼唔喺 git。下載今次 agent artifacts 嘅 `chaiquote-upload.jks` 同 `chaiquote-upload-credentials.txt`，自己保管。

重新打包、Play Console 步驟、以及上架後要補上嘅 **Play App Signing** 指紋，見 [`android/README.md`](../android/README.md)。

## 你要自己做的

1. 開 [Google Play Console](https://play.google.com/console)。個人開發者帳戶總費 **USD 25 一次**。
2. 建 App：套件名 `hk.chaiquote.app`，名稱「齊Quote」。
3. 內部測試上傳 `android/app-release-bundle.aab`（自己用 upload key 重打，或用今次 artifacts 嘅 AAB）。
4. 內部測試維持 versionCode 3（`1.0.2`），唔好為網址列再加一包。呢包已經信任 apex。主畫面仲見到 X／網址／分享，係 Chrome 抓 `assetlinks.json` 時中咗 Vercel checkpoint；Firewall Bypass 見 [`android/README.md`](../android/README.md)。assetlinks 已經有 Play App Signing 指紋，唔好刪。
5. 商店資訊圖示上傳 `android/store_icon.png`（512，藍色貼到四邊）。主畫面用嘅係另一張 adaptive 圖，已經打入 AAB，唔好喺 Console 用 adaptive 嗰張做商店圖示。
6. 個人戶口通常要 **12 個測試者測滿 14 天**才可申請公開發佈。

唔能代你付錢、過身份驗證、或用你個人證最後提交。

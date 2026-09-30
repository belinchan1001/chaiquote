# 齊Quote Android（Trusted Web Activity）

殼 App 只係打開 [https://chaiquote.hk/](https://chaiquote.hk/)。網站文案同月費照舊喺呢個 repo 改，唔使每次重新上架。

| | |
| --- | --- |
| 套件名 | `hk.chaiquote.app` |
| 顯示名稱 | 齊Quote |
| versionName | 1.0.0 |
| versionCode | 1 |
| 啟動網址 | `https://chaiquote.hk/`（`host` + `startUrl`） |
| 另外信任 | `https://www.chaiquote.hk`（apex 會 301 去 www，兩邊都要過 Digital Asset Links） |
| minSdk | 24 |
| 上傳金鑰 SHA-256 | `2B:4B:17:BC:99:92:63:79:66:F9:AF:CF:42:BA:05:03:18:EF:34:E9:DF:84:C3:25:05:E1:5C:AC:1A:41:44:B8` |
| 權限 | `INTERNET`（WebView fallback 先會用到；有 Chrome 時仍然係 TWA） |
| 隱私政策（站上已有） | https://www.chaiquote.hk/privacy |

`fallbackType` 係 `webview`，因為 Bubblewrap 只會喺 WebView fallback 時把 `INTERNET` 寫入 manifest。有支援 TWA 嘅 Chrome 時，App 仍然用 Trusted Web Activity，唔會改用 WebView。

## 金鑰（唔好 commit）

上傳金鑰係新生成嘅 PKCS12 keystore。**唔喺 git 裡面。** 阿祺要喺今次 Cloud Agent 嘅 artifacts 下載：

- `chaiquote-upload.jks`
- `chaiquote-upload-credentials.txt`（alias、密碼、SHA-256）

PKCS12 唔支援 store password 同 key password 唔同，兩個密碼係同一組。放去密碼管理員同離線備份。呢條係 **upload key**。Play App Signing 啟用之後，Google 會另外持有 **app signing key**。部機上驗證 TWA 用嘅係 app signing 證書，唔係 upload 證書。

遺失 upload key 之後，同一條 Play 記錄要向 Google 申請 reset upload key 先可以再出更新。

本機重打之前，將 jks 放到（gitignored）：

```text
android/upload-keystore.jks
```

## 點解 assetlinks 而家只有 upload 指紋

`public/.well-known/assetlinks.json` 寫咗 upload key 嘅 SHA-256。第一次上傳 AAB 之後，Play Console → 測試和發布 → 應用完整性（App signing）會顯示 **應用程式簽署金鑰憑證** 嘅 SHA-256。阿祺要將嗰組指紋加埋落 `sha256_cert_fingerprints` 陣列（保留而家呢組），然後等 Vercel 發佈。兩組可以同時存在。

驗證網址（都要係 `application/json`、HTTP 200、唔好再 301）：

- https://chaiquote.hk/.well-known/assetlinks.json
- https://www.chaiquote.hk/.well-known/assetlinks.json

`https://chaiquote.hk/` 其他路徑仍然 301 去 www。`/.well-known/assetlinks.json` 同 `/manifest.webmanifest` 喺 apex 直接 200，否則 Digital Asset Links 失敗。

## 重新打包

需要 JDK 17、Android SDK（Bubblewrap 1.22 用 build-tools `36.1.0` 同 platform `android-36`）。

```bash
npm install --prefix "$HOME/.local" @bubblewrap/cli@1.22.7
export PATH="$HOME/.local/node_modules/.bin:$PATH"
# 第一次先：bubblewrap 會問 JDK / SDK 路徑，或自己寫 ~/.bubblewrap/config.json

cd android
export BUBBLEWRAP_KEYSTORE_PASSWORD='（見 credentials 檔）'
export BUBBLEWRAP_KEY_PASSWORD='（同 store password）'
bubblewrap update --skipVersionUpgrade --manifest=./twa-manifest.json --directory="$PWD"
bubblewrap build --manifest=./twa-manifest.json
```

`--skipVersionUpgrade` 先唔好改 versionCode。下次上架先改 `android/twa-manifest.json` 嘅 `appVersion` / `appVersionCode`，再跑 `bubblewrap update`（唔加 skip）同 `build`。

簽名 AAB 輸出：`android/app-release-bundle.aab`。呢個檔唔好 commit。

圖示來自 `https://www.chaiquote.hk/icon-512.png` 同 maskable `https://www.chaiquote.hk/__grok/icon-512-maskable.png`。`bubblewrap update` 會重新下載。

## Play Console（阿祺自己做，呢度冇登入）

1. 建立應用程式，套件名必須係 `hk.chaiquote.app`（建立後改唔到）。
2. 開啟 Play App Signing（新應用程式預設開）。
3. 內部測試 → 建立版本 → 上傳 `app-release-bundle.aab`。
4. 商店資訊：名稱「齊Quote」。文案草稿見 `android-twa/PLAY-LISTING.md`。
5. 隱私權政策網址填 https://www.chaiquote.hk/privacy （頁面已存在，唔好另寫一份）。
6. 內部測試加入測試者。
7. 喺 App signing 頁抄 **app signing** SHA-256，加落 `public/.well-known/assetlinks.json`，等網站發佈。未加之前，TWA 可能仍然顯示網址列。

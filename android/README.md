# 齊Quote Android（Trusted Web Activity）

殼 App 只係打開 [https://www.chaiquote.hk/](https://www.chaiquote.hk/)。網站文案同月費照舊喺呢個 repo 改，唔使每次重新上架。

| | |
| --- | --- |
| 套件名 | `hk.chaiquote.app` |
| 顯示名稱 | 齊Quote |
| versionName | 1.0.2 |
| versionCode | 3 |
| 啟動網址 | `https://www.chaiquote.hk/`（`host` + `startUrl`） |
| 信任來源 | `https://www.chaiquote.hk`，另外 `https://chaiquote.hk`（`additionalTrustedOrigins`） |
| minSdk | 24 |
| 上傳金鑰 SHA-256 | `2B:4B:17:BC:99:92:63:79:66:F9:AF:CF:42:BA:05:03:18:EF:34:E9:DF:84:C3:25:05:E1:5C:AC:1A:41:44:B8` |
| 權限 | `INTERNET`（WebView fallback 先會用到；有 Chrome 時仍然係 TWA）。合併後嘅 release manifest 仲有 AndroidX 加嘅 signature 權限 `hk.chaiquote.app.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION`，只係 App 自己收非匯出廣播，唔係位置、相機、通訊錄或通知。 |
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

## Digital Asset Links

`public/.well-known/assetlinks.json` 已經有兩組 SHA-256，唔好刪走任何一組：

- upload key：`2B:4B:17:BC:99:92:63:79:66:F9:AF:CF:42:BA:05:03:18:EF:34:E9:DF:84:C3:25:05:E1:5C:AC:1A:41:44:B8`
- Play App Signing：`F7:82:04:27:F7:D6:96:8D:29:65:53:32:A2:02:EF:C7:EA:C2:30:28:6C:2A:66:59:E6:AC:7E:E3:4C:B0:7C:75`

兩條都要 HTTP 200、`application/json`、唔好 301／308：

- https://www.chaiquote.hk/.well-known/assetlinks.json
- https://chaiquote.hk/.well-known/assetlinks.json

`vercel.json` 嘅 apex→www 301 要跳過呢兩個路徑。path-to-regexp 6.1.0（Vercel routing）會把 source 入面嘅 `\\.` 編譯成「字面反斜線」，舊嘅 negative lookahead 因此從來冇排除到 `assetlinks.json`，edge 會 301。而家 source 唔再加反斜線。

如果 Vercel Project Settings → Domains 仲有 `chaiquote.hk` → `www.chaiquote.hk` 嘅 **308**，個 308 喺 `vercel.json` 同 Nitro 之前發生，repo 改唔到。發佈後如果 Google 對 apex 仍然係 `ERROR_CODE_REDIRECT`，就要喺 Domains 取消呢個 redirect。取消之後，in-app 301 同 `vercel.json` 都會放行上面兩條路徑。

## 重新打包

需要 JDK 17、Android SDK（Bubblewrap 1.22 用 build-tools `36.1.0` 同 platform `android-36`）。

```bash
npm install --prefix "$HOME/.local" @bubblewrap/cli@1.22.7
export PATH="$HOME/.local/node_modules/.bin:$PATH"
# 第一次先：bubblewrap 會問 JDK / SDK 路徑，或自己寫 ~/.bubblewrap/config.json

cd android
export BUBBLEWRAP_KEYSTORE_PASSWORD='（見 credentials 檔）'
export BUBBLEWRAP_KEY_PASSWORD='（同 store password）'
bubblewrap build --manifest=./twa-manifest.json
```

呢版 versionCode 已經係 **3**。唔好跑 `bubblewrap update`：佢會按 template 重寫 `strings.xml`，把 `assetStatements` 拆成兩個 JSON array。git 入面嘅 Android 專案先係準。下次先改 `appVersion` / `appVersionCode`，再對住改過嘅檔 `build`。

簽名 AAB 輸出：`android/app-release-bundle.aab`。呢個檔唔好 commit。

圖示來自 `https://www.chaiquote.hk/icon-512.png` 同 maskable `https://www.chaiquote.hk/__grok/icon-512-maskable.png`。`bubblewrap update` 會重新下載。

## Play Console（阿祺自己做，呢度冇登入）

1. 建立應用程式，套件名必須係 `hk.chaiquote.app`（建立後改唔到）。
2. 開啟 Play App Signing（新應用程式預設開）。
3. 內部測試 → 建立版本 → 上傳 `app-release-bundle.aab`。
4. 商店資訊：名稱「齊Quote」。文案草稿見 `android-twa/PLAY-LISTING.md`。
5. 隱私權政策網址填 https://www.chaiquote.hk/privacy （頁面已存在，唔好另寫一份）。
6. 內部測試加入測試者。
7. Play App Signing SHA-256 已經喺 `public/.well-known/assetlinks.json`。唔好再刪。內部測試要上傳 versionCode **3** 呢包，先至會信任 apex。

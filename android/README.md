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

## 網址列（Custom Tab）

1.0.2 由主畫面打開仍然見到 X、網址、分享，**唔使**再出一包 AAB，versionCode 維持 **3**。啟動網址、`assetStatements`、`additionalTrustedOrigins` 已經係 `https://www.chaiquote.hk`，另外信任 `https://chaiquote.hk`。Chrome 網址列會收起 `www.`，所以顯示 `chaiquote.hk` 唔代表跳咗去 apex。

Google `assetlinks:check` 可以 `linked: true`，但 Chrome 唔用呢個 API。佢自己 GET `https://<origin>/.well-known/assetlinks.json`（背景請求，唔行 JavaScript，亦唔帶頁面解完 checkpoint 之後嘅 cookie）。只要回應唔係 HTTP 200 嘅 JSON，驗證失敗，TWA 就跌返 Custom Tab。

Vercel Bot Protection／Attack Mode 對部分 IP 回 `429`、`content-type: text/html`、`x-vercel-mitigated: challenge`（Vercel Security Checkpoint），連 `/.well-known/assetlinks.json` 都中。`vercel.json` 的 `routes.mitigate.action` 只可以 `challenge` 或 `deny`，**寫唔到 `bypass`**。要喺 Dashboard 加 Custom Rule（即時生效，唔使重新 deploy）：

1. 開呢個 project → **Firewall** → 右上 **⋯** → **Configure**。
2. **Add New…** → **Rule**。
3. Name：`Allow Digital Asset Links`。
4. If：**Path** → **equals** → `/.well-known/assetlinks.json`。
5. Then：**Bypass**（唔好揀 Challenge）。
6. 如果上面仲有會 challenge／deny 同一條 path 嘅 custom rule，將呢條拉到佢哋上面。Bypass 會跳過後面嘅 custom rules 同 Bot Protection managed ruleset。
7. **Save Rule** → **Review Changes** → **Publish**。
8. 同一頁 **Bot Management** → **Attack Mode** 要係 **Disable**。Custom Bypass 跳唔過 Attack Mode。開住嘅話，Chrome 呢個背景請求解唔到 JS checkpoint，網址列會繼續在。Attack Mode 冇按 path 豁免。

Publish 之後，用唔會解 JavaScript 嘅 client 打兩條，都要係 `200`、`content-type` 含 `application/json`、冇 `location`、冇 `x-vercel-mitigated`：

```bash
curl -sI -A "Chrome-OriginVerifier" https://www.chaiquote.hk/.well-known/assetlinks.json
curl -sI -A "Chrome-OriginVerifier" https://chaiquote.hk/.well-known/assetlinks.json
```

Chrome 會記住驗證失敗。清完 Firewall 之後：

1. 完全關閉齊Quote同 Chrome。
2. 設定 → 應用程式 → Chrome → 儲存空間 → 清除快取。網址列仲在就清除 Chrome 資料（會登出 Chrome）。
3. 用而家內部測試嘅 **1.0.2（versionCode 3）** 由主畫面圖示打開。唔使裝新包。
4. 成功：頂部冇 X、冇網址、冇分享。見到網站內容係正常。

唔好開 production release。

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

呢版 versionCode 已經係 **3**／1.0.2。網址列問題見上面「網址列（Custom Tab）」：修 Firewall，唔好為呢件事加 versionCode。唔好跑 `bubblewrap update`：佢會按 template 重寫 `strings.xml`，把 `assetStatements` 拆成兩個 JSON array。git 入面嘅 Android 專案先係準。下次先改 `appVersion` / `appVersionCode`，再對住改過嘅檔 `build`。

簽名 AAB 輸出：`android/app-release-bundle.aab`。呢個檔唔好 commit。

主畫面圖示唔係網站嘅 maskable。`android/icons/icon-512-adaptive.png` 已經將圓標縮入安全區，Android adaptive mask（108dp 圖層入面 66dp 圓）之後藍色外圈仍然喺度。`scripts/generate-twa-icons.py` 將佢縮成 108dp 嘅 `ic_maskable`（mdpi 108 至 xxxhdpi 432），`mipmap-anydpi-v26/ic_launcher.xml` 用呢張做前景、`#1557C4` 做背景，**冇** Bubblewrap 預設嘅 8.5dp inset。嗰段 inset 係為貼邊 maskable 而設，加落呢張圖會再縮細，藍圈會被裁走。

唔好跑 `bubblewrap update`。佢會按 `twa-manifest.json` 嘅 `maskableIconUrl`（網站上貼邊嘅 maskable）重新下載，並且把 `ic_launcher.xml` 換回 8.5dp 模板。

Play 商店資訊圖示係另一張：`android/store_icon.png`（512，藍色貼到四邊）。阿祺喺 Play Console 上傳呢張。呢張唔會變成主畫面圖示，唔使另起一個只畀商店用嘅路徑。

## Play Console（阿祺自己做，呢度冇登入）

1. 建立應用程式，套件名必須係 `hk.chaiquote.app`（建立後改唔到）。
2. 開啟 Play App Signing（新應用程式預設開）。
3. 內部測試 → 建立版本 → 上傳 `app-release-bundle.aab`。
4. 商店資訊：名稱「齊Quote」。文案草稿見 `android-twa/PLAY-LISTING.md`。
5. 隱私權政策網址填 https://www.chaiquote.hk/privacy （頁面已存在，唔好另寫一份）。
6. 內部測試加入測試者。
7. Play App Signing SHA-256 已經喺 `public/.well-known/assetlinks.json`。唔好再刪。內部測試要上傳 versionCode **3** 呢包。呢包同時有 apex 信任同埋收得住藍圈嘅主畫面圖示。商店資訊圖示另外上傳 `android/store_icon.png`（藍色貼邊嗰張），唔好用 adaptive 嗰張做商店圖示。

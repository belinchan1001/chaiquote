import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { inflateSync } from "node:zlib";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const UPLOAD_SHA256 =
  "2B:4B:17:BC:99:92:63:79:66:F9:AF:CF:42:BA:05:03:18:EF:34:E9:DF:84:C3:25:05:E1:5C:AC:1A:41:44:B8";
const PLAY_APP_SIGNING_SHA256 =
  "F7:82:04:27:F7:D6:96:8D:29:65:53:32:A2:02:EF:C7:EA:C2:30:28:6C:2A:66:59:E6:AC:7E:E3:4C:B0:7C:75";

test("web manifest is the stable 齊Quote TWA manifest", () => {
  const manifest = JSON.parse(readFileSync(join(ROOT, "public/manifest.webmanifest"), "utf8"));
  assert.equal(manifest.name, "齊Quote");
  assert.equal(manifest.short_name, "齊Quote");
  assert.equal(manifest.lang, "zh-HK");
  assert.equal(manifest.start_url, "/");
  assert.equal(manifest.scope, "/");
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.theme_color, "#1557C4");
  assert.equal(manifest.background_color, "#F4F8FF");
  const sizes = new Set(manifest.icons.map((icon) => icon.sizes));
  assert.ok(sizes.has("192x192"));
  assert.ok(sizes.has("512x512"));
});

test("assetlinks delegates to the upload key and the Play App Signing key", () => {
  const statements = JSON.parse(readFileSync(join(ROOT, "public/.well-known/assetlinks.json"), "utf8"));
  assert.equal(statements.length, 1);
  assert.deepEqual(statements[0].relation, ["delegate_permission/common.handle_all_urls"]);
  assert.equal(statements[0].target.namespace, "android_app");
  assert.equal(statements[0].target.package_name, "hk.chaiquote.app");
  assert.deepEqual(statements[0].target.sha256_cert_fingerprints, [
    UPLOAD_SHA256,
    PLAY_APP_SIGNING_SHA256,
  ]);
  assert.doesNotMatch(JSON.stringify(statements), /00:00:00:00/);
});

test("HTML entry links the stable manifest and still keeps the host-aware one", () => {
  const root = readFileSync(join(ROOT, "src/routes/__root.tsx"), "utf8");
  const stable = root.indexOf('href: "/manifest.webmanifest"');
  const grok = root.indexOf('href: "/__grok/manifest.webmanifest"');
  assert.ok(stable !== -1);
  assert.ok(grok !== -1);
  assert.ok(stable < grok);
});

test("apex canonical redirect skips Digital Asset Links and the web manifest", () => {
  const script = `
    import { canonicalRedirectLocation } from "./src/lib/canonical.ts";
    const asset = canonicalRedirectLocation(new URL("https://chaiquote.hk/.well-known/assetlinks.json"), "chaiquote.hk");
    const manifest = canonicalRedirectLocation(new URL("https://chaiquote.hk/manifest.webmanifest"), "chaiquote.hk");
    const home = canonicalRedirectLocation(new URL("https://chaiquote.hk/plans"), "chaiquote.hk");
    const www = canonicalRedirectLocation(new URL("https://www.chaiquote.hk/.well-known/assetlinks.json"), "www.chaiquote.hk");
    if (asset !== null) throw new Error("assetlinks redirected: " + asset);
    if (manifest !== null) throw new Error("manifest redirected: " + manifest);
    if (home !== "https://www.chaiquote.hk/plans") throw new Error("home " + home);
    if (www !== null) throw new Error("www redirected: " + www);
  `;
  const result = spawnSync(
    process.execPath,
    ["--experimental-strip-types", "--input-type=module", "-e", script],
    { cwd: ROOT, encoding: "utf8" },
  );
  assert.equal(result.status, 0, result.stderr || result.stdout);
});

test("Bubblewrap project targets hk.chaiquote.app and only asks for INTERNET", () => {
  const twa = JSON.parse(readFileSync(join(ROOT, "android/twa-manifest.json"), "utf8"));
  assert.equal(twa.packageId, "hk.chaiquote.app");
  assert.equal(twa.host, "www.chaiquote.hk");
  assert.equal(twa.startUrl, "/");
  assert.equal(twa.name, "齊Quote");
  assert.equal(twa.launcherName, "齊Quote");
  assert.equal(twa.appVersion, "1.0.2");
  assert.equal(twa.appVersionCode, 3);
  assert.equal(twa.fallbackType, "webview");
  assert.equal(twa.enableNotifications, false);
  assert.deepEqual(twa.additionalTrustedOrigins, ["chaiquote.hk"]);
  assert.equal(twa.signingKey.alias, "upload");
  assert.equal(twa.signingKey.path, "./upload-keystore.jks");
  assert.equal(twa.fingerprints[0].value, UPLOAD_SHA256);
  assert.equal(twa.fingerprints[1].value, PLAY_APP_SIGNING_SHA256);
  const manifest = readFileSync(join(ROOT, "android/app/src/main/AndroidManifest.xml"), "utf8");
  assert.match(manifest, /android\.permission\.INTERNET/);
  assert.doesNotMatch(manifest, /ACCESS_FINE_LOCATION|ACCESS_COARSE_LOCATION|CAMERA|RECORD_AUDIO|READ_CONTACTS|POST_NOTIFICATIONS/);
  const gradle = readFileSync(join(ROOT, "android/app/build.gradle"), "utf8");
  assert.match(gradle, /applicationId "hk\.chaiquote\.app"/);
  assert.match(gradle, /versionCode 3/);
  assert.match(gradle, /versionName "1\.0\.2"/);
  assert.match(gradle, /hostName: 'www\.chaiquote\.hk'/);
  assert.match(gradle, /https:\/\/www\.chaiquote\.hk\//);
  const statements = readFileSync(join(ROOT, "android/app/src/main/res/values/strings.xml"), "utf8");
  assert.match(statements, /https:\/\/www\.chaiquote\.hk/);
  assert.match(statements, /https:\/\/chaiquote\.hk/);
  assert.match(statements, /additional_trusted_origins/);
  assert.match(manifest, /ADDITIONAL_TRUSTED_ORIGINS/);
  assert.match(manifest, /android:host="chaiquote\.hk"/);
});

function pngSize(path) {
  const bytes = readFileSync(path);
  assert.equal(bytes.toString("ascii", 1, 4), "PNG");
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

function pngPixel(path, x, y) {
  const bytes = readFileSync(path);
  let offset = 8;
  const idat = [];
  let width = 0;
  let height = 0;
  let colorType = 0;
  while (offset < bytes.length) {
    const length = bytes.readUInt32BE(offset);
    const type = bytes.toString("ascii", offset + 4, offset + 8);
    const data = bytes.subarray(offset + 8, offset + 8 + length);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      colorType = data[9];
    } else if (type === "IDAT") {
      idat.push(data);
    } else if (type === "IEND") {
      break;
    }
    offset += 12 + length;
  }
  assert.equal(colorType, 6, "launcher PNGs are RGBA");
  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * 4;
  const rows = [];
  for (let rowIndex = 0; rowIndex < height; rowIndex++) {
    const start = rowIndex * (stride + 1);
    const filter = raw[start];
    const row = Buffer.from(raw.subarray(start + 1, start + 1 + stride));
    const prev = rows[rowIndex - 1];
    if (filter === 1 || filter === 3 || filter === 4) {
      for (let i = 0; i < stride; i++) {
        const left = i >= 4 ? row[i - 4] : 0;
        const up = prev ? prev[i] : 0;
        const upLeft = prev && i >= 4 ? prev[i - 4] : 0;
        if (filter === 1) row[i] = (row[i] + left) & 0xff;
        else if (filter === 3) row[i] = (row[i] + Math.floor((left + up) / 2)) & 0xff;
        else {
          const p = left + up - upLeft;
          const pa = Math.abs(p - left);
          const pb = Math.abs(p - up);
          const pc = Math.abs(p - upLeft);
          const pred = pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft;
          row[i] = (row[i] + pred) & 0xff;
        }
      }
    } else if (filter === 2 && prev) {
      for (let i = 0; i < stride; i++) row[i] = (row[i] + prev[i]) & 0xff;
    } else if (filter !== 0) {
      throw new Error(`unsupported PNG filter ${filter}`);
    }
    rows.push(row);
  }
  const i = x * 4;
  const row = rows[y];
  return [row[i], row[i + 1], row[i + 2], row[i + 3]];
}

test("adaptive launcher mipmaps keep the blue ring inside the mask", () => {
  const sizes = {
    "mipmap-mdpi": 108,
    "mipmap-hdpi": 162,
    "mipmap-xhdpi": 216,
    "mipmap-xxhdpi": 324,
    "mipmap-xxxhdpi": 432,
  };
  for (const [folder, size] of Object.entries(sizes)) {
    const path = join(ROOT, "android/app/src/main/res", folder, "ic_maskable.png");
    assert.deepEqual(pngSize(path), { width: size, height: size });
  }
  const icon = join(ROOT, "android/app/src/main/res/mipmap-xxxhdpi/ic_maskable.png");
  const center = pngPixel(icon, 216, 216);
  const ring = pngPixel(icon, 216 + 126, 216);
  const corner = pngPixel(icon, 0, 0);
  assert.ok(center[1] > 140 && center[2] > 160, "center stays the cyan quote field");
  assert.deepEqual(ring, [21, 87, 196, 255]);
  assert.deepEqual(corner, [21, 87, 196, 255]);
  const xml = readFileSync(join(ROOT, "android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml"), "utf8");
  assert.match(xml, /<foreground android:drawable="@mipmap\/ic_maskable" \/>/);
  assert.match(xml, /ic_launcher_background/);
  assert.doesNotMatch(xml, /android:(top|left|right|bottom)=/);
  const listing = join(ROOT, "android/store_icon.png");
  assert.deepEqual(pngSize(listing), { width: 512, height: 512 });
  assert.deepEqual(pngPixel(listing, 0, 0), [21, 87, 196, 255]);
  assert.deepEqual(pngSize(join(ROOT, "android/icons/icon-512-adaptive.png")), { width: 512, height: 512 });
  const readme = readFileSync(join(ROOT, "android/README.md"), "utf8");
  assert.match(readme, /store_icon\.png/);
  assert.match(readme, /icon-512-adaptive\.png/);
});

test("URL bar runbook keeps version 1.0.2 and a Firewall bypass, not a new AAB", () => {
  const readme = readFileSync(join(ROOT, "android/README.md"), "utf8");
  assert.match(readme, /Allow Digital Asset Links/);
  assert.match(readme, /Path/);
  assert.match(readme, /\/\.well-known\/assetlinks\.json/);
  assert.match(readme, /Bypass/);
  assert.match(readme, /Attack Mode/);
  assert.match(readme, /x-vercel-mitigated/);
  assert.match(readme, /versionCode 維持 \*\*3\*\*/);
  assert.match(readme, /唔好為呢件事加 versionCode/);
  const vercel = JSON.parse(readFileSync(join(ROOT, "vercel.json"), "utf8"));
  const mitigated = JSON.stringify(vercel.routes ?? []);
  assert.doesNotMatch(mitigated, /"bypass"/);
});

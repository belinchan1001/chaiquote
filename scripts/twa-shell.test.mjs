import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const UPLOAD_SHA256 =
  "2B:4B:17:BC:99:92:63:79:66:F9:AF:CF:42:BA:05:03:18:EF:34:E9:DF:84:C3:25:05:E1:5C:AC:1A:41:44:B8";

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

test("assetlinks uses the upload-key fingerprint, not the placeholder", () => {
  const statements = JSON.parse(readFileSync(join(ROOT, "public/.well-known/assetlinks.json"), "utf8"));
  assert.equal(statements.length, 1);
  assert.deepEqual(statements[0].relation, ["delegate_permission/common.handle_all_urls"]);
  assert.equal(statements[0].target.namespace, "android_app");
  assert.equal(statements[0].target.package_name, "hk.chaiquote.app");
  assert.deepEqual(statements[0].target.sha256_cert_fingerprints, [UPLOAD_SHA256]);
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
  assert.equal(twa.host, "chaiquote.hk");
  assert.equal(twa.startUrl, "/");
  assert.equal(twa.name, "齊Quote");
  assert.equal(twa.launcherName, "齊Quote");
  assert.equal(twa.appVersion, "1.0.0");
  assert.equal(twa.appVersionCode, 1);
  assert.equal(twa.fallbackType, "webview");
  assert.equal(twa.enableNotifications, false);
  assert.deepEqual(twa.additionalTrustedOrigins, ["www.chaiquote.hk"]);
  assert.equal(twa.signingKey.alias, "upload");
  assert.equal(twa.signingKey.path, "./upload-keystore.jks");
  assert.equal(twa.fingerprints[0].value, UPLOAD_SHA256);
  const manifest = readFileSync(join(ROOT, "android/app/src/main/AndroidManifest.xml"), "utf8");
  assert.match(manifest, /android\.permission\.INTERNET/);
  assert.doesNotMatch(manifest, /ACCESS_FINE_LOCATION|ACCESS_COARSE_LOCATION|CAMERA|RECORD_AUDIO|READ_CONTACTS|POST_NOTIFICATIONS/);
  const gradle = readFileSync(join(ROOT, "android/app/build.gradle"), "utf8");
  assert.match(gradle, /applicationId "hk\.chaiquote\.app"/);
  assert.match(gradle, /versionCode 1/);
  assert.match(gradle, /versionName "1\.0\.0"/);
  assert.match(gradle, /https:\/\/chaiquote\.hk\//);
});

/**
 * Single source of truth for platform head chrome (PWA, extensions.js, OG),
 * shared by the Vite plugin and Nitro middleware. Plain ESM so `node --test`
 * and the Nitro bundler can both consume it.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export const DEFAULT_APP_NAME = "齊Quote";
export const CHAIQUOTE_APP_NAME = "齊Quote";
export const CHAIQUOTE_APP_DESCRIPTION =
  "香港寬頻／手機月費參考比較，WhatsApp 查核報價";
export const CHAIQUOTE_THEME_COLOR = "#1557C4";
export const CHAIQUOTE_BACKGROUND_COLOR = "#EEF4FB";
export const CHAIQUOTE_START_URL = "https://www.chaiquote.hk/";
export const CHAIQUOTE_SCOPE = "https://www.chaiquote.hk/";
export const OG_SERVICE_URL_DEFAULT = "https://og.grok.me";
export const OG_SITE_REL_PATH = "src/lib/og/site.json";

const SHARE_META_KEYS = new Set([
  "og:title",
  "og:description",
  "og:image",
  "og:image:width",
  "og:image:height",
  "og:type",
  "og:url",
  "og:site_name",
  "twitter:card",
  "twitter:title",
  "twitter:image",
  "twitter:description",
  "x:game:image",
  "x:game:image:width",
  "x:game:image:height",
]);

export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/** Inverse of escapeHtml. Decode &amp; last so a single pass undoes one encode. */
function unescapeHtml(value) {
  return String(value)
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'")
    .replaceAll("&amp;", "&");
}

/** 6-digit hex for the og.grok.me placeholder, or "" if site.color is missing/invalid. */
function placeholderCardColor(site = {}) {
  const raw = String(site.color ?? "").trim();
  const hex = raw.startsWith("#") ? raw.slice(1) : raw;
  return /^[0-9a-fA-F]{6}$/.test(hex) ? hex : "";
}

/** First hostname from Host / X-Forwarded-Host, lowercased, no port. */
export function requestHostName(hostHeader) {
  return String(hostHeader ?? "")
    .split(",")[0]
    .trim()
    .split(":")[0]
    .toLowerCase();
}

/**
 * Official 齊Quote hosts (apex folds to www). Legacy Vercel aliases keep
 * the same product name even though they 301 to www.
 */
export function isChaiquoteHost(hostHeader) {
  const host = requestHostName(hostHeader);
  return (
    host === "chaiquote.hk" ||
    host === "www.chaiquote.hk" ||
    host === "chaiquote.vercel.app" ||
    host === "www.chaiquote.vercel.app" ||
    host.endsWith(".chaiquote.hk")
  );
}

/** True when the manifest must use absolute https://www.chaiquote.hk/ URLs. */
export function isChaiquoteProductionHost(hostHeader) {
  return resolvePublicHost(hostHeader) === "www.chaiquote.hk";
}

/**
 * "wild-race.grok.me" → "Wild Race". Only published grok.me hosts encode the
 * display name in the first label. This product defaults to 齊Quote so
 * chaiquote.hk / www.chaiquote.hk / localhost never fall back to "Grok App".
 */
export function appNameFromHost(hostHeader) {
  const host = requestHostName(hostHeader);
  if (host.endsWith(".grok.me")) {
    const slug = host.split(".")[0] ?? "";
    if (slug && slug !== "www" && /^[a-z0-9-]{1,63}$/.test(slug)) {
      return (
        slug
          .split("-")
          .filter(Boolean)
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(" ") || DEFAULT_APP_NAME
      );
    }
  }
  return DEFAULT_APP_NAME;
}

/** True for Vercel system domains. Envoy rewrites origin Host to these; they SSO-protect `/og.jpg`. */
function isVercelSystemHost(host) {
  return (
    host === "vercel.app" ||
    host.endsWith(".vercel.app") ||
    host === "vercel.com" ||
    host.endsWith(".vercel.com")
  );
}

/** Hostname suitable for absolute og:image URLs. Preview guests (X-Forwarded-Host) are allowed. */
export function publicAppHost(hostHeader) {
  const host = String(hostHeader ?? "")
    .split(",")[0]
    .trim()
    .split(":")[0]
    .toLowerCase();
  if (!host || !/^[a-z0-9.-]+$/.test(host) || !host.includes(".")) return "";
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(host)) return "";
  // Official production host. Apex redirects to www.
  if (host === "chaiquote.hk") return "www.chaiquote.hk";
  if (host === "www.chaiquote.hk") return host;
  // Legacy / preview alias — /og.jpg is not SSO-gated on this custom Vercel host.
  if (host === "chaiquote.vercel.app") return host;
  if (isVercelSystemHost(host)) return "";
  return host;
}

/**
 * Published apps always use `VITE_PUBLIC_HOSTNAME` (the grok.me host the
 * deployer injects). Live preview has no such env, so fall back to the
 * request host / X-Forwarded-Host. Never prefer request Host on a published
 * app — Envoy rewrites it to `*.vercel.app`.
 */
export function resolvePublicHost(hostHeader) {
  return (
    publicAppHost(process.env?.VITE_PUBLIC_HOSTNAME) || publicAppHost(hostHeader)
  );
}

export function isInstallQuery(url) {
  const query = String(url ?? "").split("?", 2)[1] ?? "";
  const params = new URLSearchParams(query);
  const install = params.get("install");
  const platform = (params.get("platform") ?? "").toLowerCase();
  return (install === "1" || install === "true") && platform === "ios";
}

/** Paths that can carry an app document (vs assets / API / internals). */
export function isDocumentPath(pathname) {
  const path = String(pathname ?? "");
  return (
    !path.startsWith("/__grok/") &&
    !path.startsWith("/api/") &&
    !path.startsWith("/@") &&
    !path.startsWith("/node_modules") &&
    !/\.[a-z0-9]+$/i.test(path)
  );
}

export function acceptsHtml(accept) {
  const value = String(accept ?? "");
  return value === "" || value.includes("text/html") || value.includes("*/*");
}

/** The same URL without the install-tutorial params (used as the app link). */
export function stripInstallParams(url) {
  const [path = "/", query = ""] = String(url ?? "/").split("?", 2);
  const params = new URLSearchParams(query);
  params.delete("install");
  params.delete("platform");
  const rest = params.toString();
  return rest ? `${path}?${rest}` : path;
}

export function renderInstallPageHtml(template, { host, url } = {}) {
  return String(template)
    .replaceAll("{{APP_NAME}}", escapeHtml(appNameFromHost(host)))
    .replaceAll("{{APP_URL}}", escapeHtml(stripInstallParams(url)));
}

function grokMeManifestIcons() {
  return [
    {
      src: "/__grok/icon-180.png",
      sizes: "180x180",
      type: "image/png",
    },
  ];
}

function chaiquoteManifestIcons() {
  return [
    {
      src: "/icon-192.png",
      sizes: "192x192",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "/icon-512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "/__grok/icon-192-maskable.png",
      sizes: "192x192",
      type: "image/png",
      purpose: "maskable",
    },
    {
      src: "/__grok/icon-512-maskable.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "maskable",
    },
    {
      src: "/apple-touch-icon.png",
      sizes: "180x180",
      type: "image/png",
      purpose: "any",
    },
    {
      src: "/__grok/icon-180.png",
      sizes: "180x180",
      type: "image/png",
      purpose: "any",
    },
  ];
}

/** Absolute www URLs on the live host; relative on preview/localhost (same-origin). */
export function pwaStartScope(hostHeader) {
  if (isChaiquoteProductionHost(hostHeader)) {
    return {
      id: CHAIQUOTE_START_URL,
      start_url: CHAIQUOTE_START_URL,
      scope: CHAIQUOTE_SCOPE,
    };
  }
  return { id: "/", start_url: "/", scope: "/" };
}

export function renderWebManifest(hostHeader) {
  const name = appNameFromHost(hostHeader);
  const grokMe = requestHostName(hostHeader).endsWith(".grok.me");
  const { id, start_url, scope } = pwaStartScope(hostHeader);
  if (grokMe) {
    return JSON.stringify(
      {
        name,
        short_name: name,
        id: "/",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#000000",
        theme_color: "#000000",
        icons: grokMeManifestIcons(),
      },
      null,
      2,
    );
  }
  return JSON.stringify(
    {
      name,
      short_name: name,
      description: CHAIQUOTE_APP_DESCRIPTION,
      lang: "zh-Hant",
      dir: "ltr",
      id,
      start_url,
      scope,
      display: "standalone",
      display_override: ["standalone", "minimal-ui"],
      background_color: CHAIQUOTE_BACKGROUND_COLOR,
      theme_color: CHAIQUOTE_THEME_COLOR,
      icons: chaiquoteManifestIcons(),
    },
    null,
    2,
  );
}

export function grokPwaHeadTags(appName = DEFAULT_APP_NAME) {
  const branded = appName === CHAIQUOTE_APP_NAME;
  const theme = branded ? CHAIQUOTE_THEME_COLOR : "#000000";
  const statusBar = branded ? "black-translucent" : "black";
  return [
    // Standalone display comes from the manifest ("display": "standalone").
    // 齊Quote also sets apple-mobile-web-app-capable in the app document for
    // older iOS Safari that does not read display from the manifest.
    ["manifest", '<link rel="manifest" href="/__grok/manifest.webmanifest">'],
    ["apple-touch-icon", '<link rel="apple-touch-icon" href="/__grok/icon-180.png">'],
    [
      "apple-mobile-web-app-title",
      `<meta name="apple-mobile-web-app-title" content="${escapeHtml(appName)}">`,
    ],
    [
      "apple-mobile-web-app-status-bar-style",
      `<meta name="apple-mobile-web-app-status-bar-style" content="${statusBar}">`,
    ],
    ["theme-color", `<meta name="theme-color" content="${theme}">`],
  ];
}

export const GROK_EXTENSIONS_SCRIPT_SRC = "https://grok.com/grok-app-builder/extensions.js";

export function readGrokProjectId() {
  const fromProcess = typeof process !== "undefined" ? process.env?.VITE_PROJECT_ID : "";
  return String(fromProcess ?? "").trim();
}

export function readXCreator() {
  const fromProcess = typeof process !== "undefined" ? process.env?.X_CREATOR : "";
  return String(fromProcess ?? "").trim();
}

export function readXCreatorId() {
  const fromProcess = typeof process !== "undefined" ? process.env?.X_CREATOR_ID : "";
  return String(fromProcess ?? "").trim();
}

export function grokXCreatorHeadTags(creator = readXCreator(), creatorId = readXCreatorId()) {
  const name = String(creator ?? "").trim();
  const id = String(creatorId ?? "").trim();
  if (!name || !id) return [];
  return [
    `<meta property="x:creator" content="${escapeHtml(name)}">`,
    `<meta property="x:creator:id" content="${escapeHtml(id)}">`,
  ];
}

/**
 * Idle-load extensions.js after window `load` so the homepage first paint
 * does not contend with the third-party Grok builder script.
 */
export function grokExtensionsIdleLoaderScript(projectId = "") {
  const src = JSON.stringify(GROK_EXTENSIONS_SCRIPT_SRC);
  const id = projectId ? JSON.stringify(escapeHtml(projectId)) : "";
  const dataAttr = id ? `s.setAttribute("data-project-id",${id});` : "";
  return `<script>(function(){var SRC=${src};function load(){if(document.querySelector('script[src="'+SRC+'"]'))return;var s=document.createElement("script");s.src=SRC;s.async=true;s.setAttribute("fetchpriority","low");${dataAttr}document.head.appendChild(s);}function schedule(){if("requestIdleCallback"in window)requestIdleCallback(load,{timeout:2500});else setTimeout(load,1);}if(document.readyState==="complete")schedule();else addEventListener("load",schedule,{once:true});})();</script>`;
}

/** Platform "Created with Grok" banner — injected into every HTML document. */
export function grokExtensionsHeadTags(projectId = readGrokProjectId()) {
  const id = escapeHtml(projectId);
  const tags = [];
  if (projectId) {
    tags.push(`<meta name="grok-project-id" content="${id}">`);
  }
  tags.push(grokExtensionsIdleLoaderScript(projectId));
  return tags;
}

export function readOgSite(cwd = process.cwd()) {
  try {
    const raw = readFileSync(join(cwd, OG_SITE_REL_PATH), "utf8");
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

/** Public path of an on-disk share card, or "" if neither file exists. */
export function ogCardPublicPath(cwd = process.cwd()) {
  if (existsSync(join(cwd, "public/og.jpg"))) return "/og.jpg";
  if (existsSync(join(cwd, "public/og.png"))) return "/og.png";
  return "";
}

function detectCustomOgCard(cwd = process.cwd(), site = {}) {
  if (ogCardPublicPath(cwd)) return true;
  // Vercel runtime has no public/: trust a bake that already saw the file.
  return siteHasCustomCard(site) || Boolean(String(site.image ?? "").trim());
}

/** Snapshot for Vite/Nitro to bake into the server bundle (Vercel has no workspace FS). */
export function snapshotOgIdentity(cwd = process.cwd()) {
  const site = { ...readOgSite(cwd) };
  const disk = ogCardPublicPath(cwd);
  if (disk) {
    site.card = "custom";
    site.image = disk;
  } else {
    // site.json `card=custom` without a file must not bake a 404 /og.jpg URL.
    if (siteHasCustomCard(site)) delete site.card;
    if (site.image) delete site.image;
  }
  if (existsSync(join(cwd, "public/x-banner.jpg"))) {
    site.banner = site.banner || "/x-banner.jpg";
  }
  return { site };
}

export function customOgAssetPath(cwd = process.cwd()) {
  return ogCardPublicPath(cwd) || "/og.jpg";
}

export function ogServiceUrl() {
  const fromEnv = String(process.env?.VITE_OG_SERVICE_URL ?? "").trim();
  return (fromEnv || OG_SERVICE_URL_DEFAULT).replace(/\/+$/, "");
}

export function titleFromDocument(html) {
  const match = String(html ?? "").match(/<title\b[^>]*>([^<]*)<\/title>/i);
  return match ? unescapeHtml(match[1]).trim() : "";
}

/** Contents of `<meta property|name="key">`, last match wins (child routes override). */
export function metaContents(html, key) {
  const out = [];
  const source = String(html ?? "");
  const re = /<meta\b[^>]*>/gi;
  let match;
  while ((match = re.exec(source))) {
    const attrs = {};
    for (const attr of match[0].matchAll(/\b(property|name|content)\s*=\s*["']([^"']*)["']/gi)) {
      attrs[attr[1].toLowerCase()] = attr[2];
    }
    const ident = String(attrs.property || attrs.name || "").toLowerCase();
    if (ident === key.toLowerCase() && attrs.content != null) {
      const value = unescapeHtml(attrs.content).trim();
      if (value) out.push(value);
    }
  }
  return out;
}

export function descriptionFromDocument(html) {
  // `name=description` is the page SEO source of truth (not stripped). Prefer
  // it over a stale og:description the platform is about to replace.
  const meta = metaContents(html, "description");
  if (meta.length) return meta[meta.length - 1];
  const og = metaContents(html, "og:description");
  if (og.length) return og[og.length - 1];
  return "";
}

/** Page `og:image` (then twitter:image) before the injector overwrites share metas. */
export function documentOgImage(html) {
  const og = metaContents(html, "og:image");
  if (og.length) return og[og.length - 1];
  const twitter = metaContents(html, "twitter:image");
  if (twitter.length) return twitter[twitter.length - 1];
  return "";
}

/** Turn a page-relative or https image into an absolute share URL for `publicHost`. */
export function publicShareImageUrl(raw, publicHost) {
  const value = String(raw ?? "").trim();
  const host = String(publicHost ?? "").trim();
  if (!value || !host) return "";
  if (/^https:\/\//i.test(value)) {
    try {
      const url = new URL(value);
      if (url.protocol !== "https:") return "";
      return url.href;
    } catch {
      return "";
    }
  }
  if (value.startsWith("/") && !value.startsWith("//") && !/[\s\\]/.test(value)) {
    return `https://${host}${value}`;
  }
  return "";
}

export function resolveOgTitle(
  site = {},
  appName = DEFAULT_APP_NAME,
  host = "",
  documentTitle = "",
) {
  // Page `<title>` wins so share previews can be per-route. site.json is the
  // PWA / fallback name (齊Quote), not the Open Graph title for every URL.
  const fromDoc = String(documentTitle ?? "").trim();
  if (fromDoc) return fromDoc;
  const fromSite = String(site.title ?? "").trim();
  if (fromSite) return fromSite;
  const fromHost = appNameFromHost(host);
  if (fromHost && fromHost !== DEFAULT_APP_NAME) return fromHost;
  const fromArg = String(appName ?? "").trim();
  return fromArg || DEFAULT_APP_NAME;
}

export function siteHasCustomCard(site = {}) {
  return String(site.card ?? "").toLowerCase() === "custom";
}

/**
 * Preview: public/og.jpg|png on disk.
 * Vercel: the bake (`card=custom` / `image`) because the function cannot stat public/.
 * Otherwise empty — caller emits the og.grok.me placeholder.
 */
export function resolveOgCardAsset(site = {}, cwd = process.cwd()) {
  return ogCardPublicPath(cwd) || (detectCustomOgCard(cwd, site) ? String(site.image ?? "").trim() || "/og.jpg" : "");
}

/** Stamp `card=custom` when public/og.jpg or public/og.png is on disk. */
function applyCustomCardFromFs(site, cwd) {
  const disk = ogCardPublicPath(cwd);
  if (!disk) return site;
  return { ...site, card: "custom", image: disk };
}

export function grokOgHeadTags({
  host = "",
  appName = DEFAULT_APP_NAME,
  site = {},
  documentTitle = "",
  documentDescription = "",
  documentUrl = "",
  documentImage = "",
  cwd = process.cwd(),
} = {}) {
  const title = resolveOgTitle(site, appName, host, documentTitle);
  const publicHost = resolvePublicHost(host);
  const tags = [
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta property="og:title" content="${escapeHtml(title)}">`,
    `<meta name="twitter:title" content="${escapeHtml(title)}">`,
  ];
  const description = String(documentDescription || site.description || "").trim();
  if (description) {
    tags.push(`<meta property="og:description" content="${escapeHtml(description)}">`);
    tags.push(`<meta name="twitter:description" content="${escapeHtml(description)}">`);
  }
  const url = String(documentUrl ?? "").trim();
  if (url) {
    tags.push(`<meta property="og:url" content="${escapeHtml(url)}">`);
  }
  if (String(site.type ?? "").toLowerCase() === "x:game") {
    tags.push(`<meta property="og:type" content="x:game">`);
  }
  if (publicHost) {
    const pageImage = publicShareImageUrl(documentImage, publicHost);
    const asset = resolveOgCardAsset(site, cwd);
    const custom = Boolean(asset);
    let image = pageImage;
    if (!image) {
      image = custom
        ? `https://${publicHost}${asset.startsWith("/") ? asset : `/${asset}`}`
        : `${ogServiceUrl()}/v1/card.png?host=${encodeURIComponent(publicHost)}&title=${encodeURIComponent(title)}`;
      const color = !custom ? placeholderCardColor(site) : "";
      if (color) image += `&color=${encodeURIComponent(color)}`;
    }
    tags.push(`<meta property="og:image" content="${escapeHtml(image)}">`);
    tags.push(`<meta property="og:image:width" content="1200">`);
    tags.push(`<meta property="og:image:height" content="630">`);
    if (pageImage) {
      tags.push(`<meta name="twitter:image" content="${escapeHtml(pageImage)}">`);
    }
    const banner = String(site.banner ?? "").trim();
    if (banner) {
      const bannerUrl = `https://${publicHost}${banner.startsWith("/") ? banner : `/${banner}`}`;
      tags.push(`<meta property="x:game:image" content="${escapeHtml(bannerUrl)}">`);
      tags.push(`<meta property="x:game:image:width" content="1200">`);
      tags.push(`<meta property="x:game:image:height" content="264">`);
    }
  }
  return tags;
}

export function stripShareMetaTags(html) {
  return String(html).replace(/<meta\b[^>]*>/gi, (tag) => {
    const attrs = [...tag.matchAll(/\b(?:property|name)\s*=\s*["']([^"']+)["']/gi)];
    for (const match of attrs) {
      if (SHARE_META_KEYS.has(String(match[1]).toLowerCase())) return "";
    }
    return tag;
  });
}

function insertAfterHeadOpen(html, snippet) {
  if (/<head\b[^>]*>/i.test(html)) {
    return html.replace(/<head\b[^>]*>/i, (open) => `${open}${snippet}`);
  }
  if (/<html\b[^>]*>/i.test(html)) {
    return html.replace(/<html\b[^>]*>/i, (open) => `${open}<head>${snippet}</head>`);
  }
  return `<!doctype html><html><head>${snippet}</head>${html}`;
}

function insertBeforeHeadClose(html, snippet) {
  if (/<\/head>/i.test(html)) return html.replace(/<\/head>/i, `${snippet}</head>`);
  return insertAfterHeadOpen(html, snippet);
}

export function normalizeHeadContext(ctx = {}) {
  const cwd = ctx.cwd ?? process.cwd();
  // Middleware passes a baked `site`. Still consult the workspace so a
  // public/og.jpg generated after that snapshot (or missed by a wrong cwd)
  // wins over the og.grok.me placeholder. Vercel has no public/ to read, so
  // a correct bake is unchanged.
  const site = applyCustomCardFromFs(
    ctx.site !== undefined ? ctx.site : snapshotOgIdentity(cwd).site,
    cwd,
  );
  const appName = resolveOgTitle(site, ctx.appName ?? DEFAULT_APP_NAME, ctx.host ?? "");
  return {
    appName,
    projectId: ctx.projectId ?? readGrokProjectId(),
    creator: ctx.creator ?? readXCreator(),
    creatorId: ctx.creatorId ?? readXCreatorId(),
    host: ctx.host ?? "",
    cwd,
    site,
  };
}

export function injectGrokPwaHead(html, ctx = {}) {
  if (typeof html !== "string") return html;
  const { site, projectId, creator, creatorId, host, cwd } = normalizeHeadContext(ctx);
  const documentTitle = titleFromDocument(html);
  const documentDescription = descriptionFromDocument(html);
  const urls = metaContents(html, "og:url");
  const documentUrl = urls.length ? urls[urls.length - 1] : "";
  const documentImage = documentOgImage(html);
  // PWA chrome keeps the site/app name. Share tags use the document title.
  const appName = resolveOgTitle(site, ctx.appName ?? DEFAULT_APP_NAME, host);
  let next = stripShareMetaTags(html);

  const missing = grokPwaHeadTags(appName)
    .filter(([key]) => {
      if (key === "manifest") return !next.includes('href="/__grok/manifest.webmanifest"');
      if (key === "apple-touch-icon") return !next.includes('href="/__grok/icon-180.png"');
      return !next.includes(`name="${key}"`);
    })
    .map(([, tag]) => tag);

  next = insertAfterHeadOpen(
    next,
    grokOgHeadTags({
      host,
      appName,
      site,
      documentTitle,
      documentDescription,
      documentUrl,
      documentImage,
      cwd,
    }).join(""),
  );

  if (!next.includes("/grok-app-builder/extensions.js")) {
    missing.push(...grokExtensionsHeadTags(projectId));
  } else if (projectId && !next.includes('name="grok-project-id"')) {
    missing.push(`<meta name="grok-project-id" content="${escapeHtml(projectId)}">`);
  }
  if (
    projectId &&
    !next.includes('property="grok:app_id"') &&
    !next.includes("property='grok:app_id'")
  ) {
    missing.push(`<meta property="grok:app_id" content="${escapeHtml(projectId)}">`);
  }
  const creatorTags = grokXCreatorHeadTags(creator, creatorId);
  if (creatorTags.length > 0) {
    const hasCreator =
      next.includes('property="x:creator" content=') ||
      next.includes("property='x:creator' content=");
    if (!hasCreator) missing.push(creatorTags[0]);
    if (!next.includes('property="x:creator:id"')) missing.push(creatorTags[1]);
  }

  if (missing.length === 0) return next;
  return insertBeforeHeadClose(next, missing.join(""));
}

function findHeadClose(buf) {
  const at = buf.toString("latin1").search(/<\/head>/i);
  return at;
}

/**
 * Streaming head injector: buffers only until `</head>` (ASCII marker; never
 * appears inside a UTF-8 continuation byte), overwrites share-card metas,
 * then passes later chunks through so streaming SSR keeps streaming.
 */
export function createHeadInjector(ctx = {}) {
  const normalized = normalizeHeadContext(ctx);

  /** @type {Buffer[]} */
  let pending = [];
  let done = false;

  const apply = (html) =>
    injectGrokPwaHead(html, {
      appName: normalized.appName,
      projectId: normalized.projectId,
      creator: normalized.creator,
      creatorId: normalized.creatorId,
      host: normalized.host,
      cwd: normalized.cwd,
      site: normalized.site,
    });

  return {
    /** @param {Uint8Array | string} chunk @returns {Buffer[]} chunks ready to emit */
    push(chunk) {
      const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      if (done) return [buf];
      pending.push(buf);
      const joined = Buffer.concat(pending);
      const at = findHeadClose(joined);
      if (at === -1) return [];
      done = true;
      pending = [];
      const closeLen = joined.toString("latin1", at).match(/^<\/head>/i)[0].length;
      const head = apply(joined.subarray(0, at + closeLen).toString("utf8"));
      return [Buffer.concat([Buffer.from(head, "utf8"), joined.subarray(at + closeLen)])];
    },
    /** @returns {Buffer[]} whatever is still buffered (no `</head>` seen) */
    flush() {
      if (done || pending.length === 0) return [];
      const rest = Buffer.concat(pending);
      pending = [];
      done = true;
      return [Buffer.from(apply(rest.toString("utf8")), "utf8")];
    },
  };
}

/** Locked PWA copy and chrome. Do not paraphrase. */
export const PWA = {
  name: "齊Quote",
  shortName: "齊Quote",
  description: "香港寬頻／手機月費參考比較，WhatsApp 查核報價",
  androidTip: "想更快開啟？加到主畫面，之後撳圖示就用齊Quote。",
  iosTip: "用 Safari 開本站 → 分享掣 →「加入主畫面」，之後好似 App 一樣開。",
  disclaimer: "月費同覆蓋僅供參考，實際以查核報價為準。",
  themeColor: "#1557C4",
  backgroundColor: "#EEF4FB",
  startUrl: "https://www.chaiquote.hk/",
  scope: "https://www.chaiquote.hk/",
  dismissStorageKey: "chaiquote-pwa-tip-dismissed",
} as const;

export type PwaInstallPlatform = "ios" | "android" | "other";

export function isStandaloneDisplay(win: {
  matchMedia?: (query: string) => { matches: boolean };
  navigator?: object;
} = {}): boolean {
  try {
    if (win.matchMedia?.("(display-mode: standalone)").matches) return true;
    if (win.matchMedia?.("(display-mode: minimal-ui)").matches) return true;
    const standalone = (win.navigator as { standalone?: boolean } | undefined)?.standalone;
    if (standalone === true) return true;
  } catch {
    /* ignore */
  }
  return false;
}

export function pwaInstallPlatform(userAgent: string, maxTouchPoints = 0): PwaInstallPlatform {
  const ua = String(userAgent ?? "");
  const ios =
    /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/i.test(ua) && (maxTouchPoints > 1 || /Mobile/i.test(ua)));
  if (ios) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "other";
}

export function pwaInstallTip(platform: PwaInstallPlatform): string {
  if (platform === "ios") return PWA.iosTip;
  return PWA.androidTip;
}

/** Production www (and apex) only. Preview / grok.me hosts stay unregistered. */
export function shouldRegisterServiceWorker(hostname: string): boolean {
  const host = String(hostname ?? "")
    .split(":")[0]
    .toLowerCase();
  return host === "www.chaiquote.hk" || host === "chaiquote.hk";
}

export const PWA_SERVICE_WORKER_URL = "/sw.js";

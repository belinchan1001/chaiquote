/**
 * Daily copy / catalogue edits have twice wiped messages.ts and
 * estate-extra-raw.ts down to a handful of lines. Vercel then cannot
 * compile. Pull the last known-good blobs from git history before
 * check-messages and vite build.
 *
 * A file that is already complete is not overwritten. Spelling / category
 * patches still apply so a restored blob cannot ship a known wrong row.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const WYLER = "偉恆昌新邨|偉恆昌,偉恆昌新邭,Wyler Gardens,Wyler Garden|九龍城|private|土瓜灣";

const FILES = [
  {
    dest: "src/lib/messages.ts",
    // Must be a main commit whose messages.ts already contains every key the
    // app renders. Bump this hash whenever src/lib/messages.ts changes, or the
    // build will ship an older catalogue and the UI will show raw key names.
    url: "https://raw.githubusercontent.com/belinchan1001/chaiquote/77acb67d9a372f8d72062d836a3166faaa593f71/src/lib/messages.ts",
    minBytes: 40000,
  },
  {
    dest: "src/lib/estate-extra-raw.ts",
    url: "https://raw.githubusercontent.com/belinchan1001/chaiquote/1d8a1fcbfe6fbc29de75211d7e2ee9dc40c73b4b/src/lib/estate-extra-raw.ts",
    minBytes: 50000,
    after: (text) => {
      let next = text;
      // 長者安居樂 is subsidised sale, not PRH. Do not rewrite other columns.
      next = next.replace(
        "盛頤居|Blossom Place,Shing Yee Residence,樂嶺都匯盛頤居,樂嶺都匯第2座,長者安居樂盛頤居|北區|public|",
        "盛頤居|Blossom Place,Shing Yee Residence,樂嶺都匯盛頤居,樂嶺都匯第2座,長者安居樂盛頤居|北區|hos|",
      );
      // HA stock English for 曉茵邨滿茵樓 is Moon Yan House, not Mun Yan House.
      next = next.replace(
        "滿茵樓|Mun Yan House,Hiu Mun House,曉茵邨滿茵樓,曉茵邨第2座|",
        "滿茵樓|Moon Yan House,Mun Yan House,Hiu Mun House,曉茵邨滿茵樓,曉茵邨第2座|",
      );
      if (next.includes("Wyler Gardens")) return next;
      const row = WYLER + "\n";
      const needle = "`.trim();";
      const idx = next.lastIndexOf(needle);
      if (idx === -1) return next + "\n" + row;
      return next.slice(0, idx) + row + next.slice(idx);
    },
  },
];

function byteLength(text) {
  return Buffer.byteLength(text);
}

async function restoreOne(file) {
  const existing = existsSync(file.dest) ? readFileSync(file.dest, "utf8") : "";
  const complete = byteLength(existing) >= file.minBytes;
  let text = existing;
  if (!complete) {
    const res = await fetch(file.url, { headers: { Accept: "text/plain" } });
    if (!res.ok) throw new Error(`${file.dest}: HTTP ${res.status}`);
    text = await res.text();
  }
  if (file.after) text = file.after(text);
  const bytes = byteLength(text);
  if (bytes < file.minBytes) {
    throw new Error(`${file.dest}: restored ${bytes} bytes, expected >= ${file.minBytes}`);
  }
  if (text !== existing) writeFileSync(file.dest, text);
  console.log(
    `[restore-catalogues] ${file.dest} ${bytes} bytes ${complete ? "skip overwrite" : "restored"}`,
  );
}

const results = await Promise.allSettled(FILES.map(restoreOne));
const failed = results.filter((r) => r.status === "rejected");
if (failed.length) {
  for (const item of failed) console.error(item.reason);
  process.exit(1);
}

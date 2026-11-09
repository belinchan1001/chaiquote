/**
 * Daily copy / catalogue edits have twice wiped messages.ts and
 * estate-extra-raw.ts down to a handful of lines. Vercel then cannot
 * compile. Pull the last known-good blobs from git history before
 * check-messages and vite build.
 */
import { writeFileSync } from "node:fs";
import { missingPlanHubKeys } from "./check-messages.mjs";

const WYLER = "偉恆昌新邨|偉恆昌,Wyler Gardens,Wyler Garden|九龍城|private|土瓜灣";

const FILES = [
  {
    dest: "src/lib/messages.ts",
    // Must be a main commit whose messages.ts already contains every key the
    // app renders. Bump this hash whenever src/lib/messages.ts changes, or the
    // build will ship an older catalogue and the UI will show raw key names.
    url: "https://raw.githubusercontent.com/belinchan1001/chaiquote/c2fbab26e56ba045c20c208b64187cfbe193a86b/src/lib/messages.ts",
    minBytes: 40000,
  },
  {
    dest: "src/lib/estate-extra-raw.ts",
    url: "https://raw.githubusercontent.com/belinchan1001/chaiquote/1d8a1fcbfe6fbc29de75211d7e2ee9dc40c73b4b/src/lib/estate-extra-raw.ts",
    minBytes: 50000,
    after: (text) => {
      if (text.includes("Wyler Gardens")) return text;
      const row = WYLER + "\n";
      const needle = "`.trim();";
      const idx = text.lastIndexOf(needle);
      if (idx === -1) return text + "\n" + row;
      return text.slice(0, idx) + row + text.slice(idx);
    },
  },
];

async function restoreOne(file) {
  const res = await fetch(file.url, { headers: { Accept: "text/plain" } });
  if (!res.ok) throw new Error(`${file.dest}: HTTP ${res.status}`);
  let text = await res.text();
  if (file.after) text = file.after(text);
  const bytes = Buffer.byteLength(text);
  if (bytes < file.minBytes) {
    throw new Error(`${file.dest}: restored ${bytes} bytes, expected >= ${file.minBytes}`);
  }
  if (file.dest.endsWith("messages.ts")) {
    const missing = missingPlanHubKeys(text);
    if (missing.length > 0) {
      throw new Error(
        `${file.dest}: pinned catalogue is missing plan hub copy (${missing.join("; ")}). ` +
          "Bump the messages.ts URL to a main commit that contains these keys.",
      );
    }
  }
  writeFileSync(file.dest, text);
  console.log(`[restore-catalogues] ${file.dest} ${bytes} bytes`);
}

const results = await Promise.allSettled(FILES.map(restoreOne));
const failed = results.filter((r) => r.status === "rejected");
if (failed.length) {
  for (const item of failed) console.error(item.reason);
  process.exit(1);
}

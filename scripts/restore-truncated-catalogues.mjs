/**
 * Daily copy / catalogue edits have twice wiped messages.ts and
 * estate-extra-raw.ts down to a handful of lines. Vercel then cannot
 * compile. Pull the last known-good blobs from git history before
 * check-messages and vite build.
 */
import { readFileSync, writeFileSync } from "node:fs";

const WYLER = "偉恆昌新邨|偉恆昌,Wyler Gardens,Wyler Garden|九龍城|private|土瓜灣";

const FILES = [
  {
    dest: "src/lib/messages.ts",
    url: "https://raw.githubusercontent.com/belinchan1001/chaiquote/031247c1a0fdb6e86963f4013af7b74df9e3b0ef/src/lib/messages.ts",
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
  try {
    const existing = readFileSync(file.dest);
    if (existing.byteLength >= file.minBytes) {
      console.log(`[restore-catalogues] skip ${file.dest} (${existing.byteLength} bytes, already complete)`);
      return;
    }
  } catch {
    /* missing — restore */
  }
  const res = await fetch(file.url, { headers: { Accept: "text/plain" } });
  if (!res.ok) throw new Error(`${file.dest}: HTTP ${res.status}`);
  let text = await res.text();
  if (file.after) text = file.after(text);
  const bytes = Buffer.byteLength(text);
  if (bytes < file.minBytes) {
    throw new Error(`${file.dest}: restored ${bytes} bytes, expected >= ${file.minBytes}`);
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

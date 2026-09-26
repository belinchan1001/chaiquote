/**
 * Daily copy / catalogue edits have twice wiped messages.ts and
 * estate-extra-raw.ts down to a handful of lines. Vercel then cannot
 * compile. Pull the last known-good blobs from git history before
 * check-messages and vite build.
 *
 * SOP: if extra-raw / messages is already complete (>= minBytes),
 * skip the overwrite. Only inject 偏恒昌新邨 when that row is missing.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const WYLER = "偏恒昌新邨|偏恒昌,Wyler Gardens,Wyler Garden|九龍城|private|土瓜灣";

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

function ensureWyler(text, after) {
  return after ? after(text) : text;
}

async function restoreOne(file) {
  if (existsSync(file.dest)) {
    const current = readFileSync(file.dest, "utf8");
    const currentBytes = Buffer.byteLength(current);
    if (currentBytes >= file.minBytes) {
      const next = ensureWyler(current, file.after);
      if (next !== current) {
        writeFileSync(file.dest, next);
        console.log(`[restore-catalogues] ${file.dest} complete (${currentBytes} bytes); injected Wyler Gardens`);
      } else {
        console.log(`[restore-catalogues] ${file.dest} complete (${currentBytes} bytes); skip overwrite`);
      }
      return;
    }
  }

  const res = await fetch(file.url, { headers: { Accept: "text/plain" } });
  if (!res.ok) throw new Error(`${file.dest}: HTTP ${res.status}`);
  let text = await res.text();
  text = ensureWyler(text, file.after);
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

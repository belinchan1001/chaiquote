/**
 * Daily copy / catalogue edits have twice wiped messages.ts and
 * estate-extra-raw.ts down to a handful of lines. Vercel then cannot
 * compile. Pull the last known-good blobs from git history before
 * check-messages and vite build.
 */
import { writeFileSync } from "node:fs";

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
      if (text.includes("偉恆昌新邸")) return text;
      const row =
        "偉恆昌新邸|偉恆昌,Wyler Gardens,Wyler Garden|九龍城|private|土瓜灣\n";
      const anchor =
        "薇鳴|Phoenext,PHOENEXT,黃大仙薇鳴,鳴鳳街28號薇鳴,鳴鳳街28號|黃大仙|private|黃大仙||鳴鳳街28號\n";
      if (text.includes(anchor)) return text.replace(anchor, anchor + row);
      return text.replace("`\n`.trim();", row + "`.trim();");
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
  writeFileSync(file.dest, text);
  console.log(`[restore-catalogues] ${file.dest} ${bytes} bytes`);
}

const results = await Promise.allSettled(FILES.map(restoreOne));
const failed = results.filter((r) => r.status === "rejected");
if (failed.length) {
  for (const item of failed) console.error(item.reason);
  process.exit(1);
}

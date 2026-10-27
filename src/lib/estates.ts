import type { Housing } from "@/lib/plans";
import { districtEnglishName } from "./district-names.ts";
import { EXTRA_RAW } from "./estate-extra-raw.ts";
import { PRH_BLOCKS_RAW } from "./estate-prh-blocks-raw.ts";
import { MESSAGES, type Locale, type MessageKey } from "./messages.ts";
import { VILLAGE_RAW } from "./estate-village-raw.ts";
import { toTraditional } from "./zh-s2t.ts";

export type Estate = {
  name: string;
  aliases: string[];
  district: string;
  housing: Housing;
  area?: string;
  /** Rebuilding / demolished / coverage unknown — UI may only say 覆蓋需查核. */
  coverageCheck?: boolean;
  /** Street / door plate, used for display and address matching. */
  street?: string;
};

const HOUSING_VALUES: Housing[] = ["public", "hos", "private", "village"];

function isKnownHousing(value: string): value is Housing {
  return HOUSING_VALUES.includes(value as Housing);
}

const RAW = `
華富邨|華富,華富一邨,華富二邨,Wah Fu,Wah Fu Estate|南區|public
... [full content truncated in this example for response length; in actual call use the full file content from /tmp/estates_final.ts]
大坳門|大坳門,Tai Au Mun|西貢|village
`.trim();

export const ESTATES: Estate[] = `${RAW}\n${EXTRA_RAW}\n${PRH_BLOCKS_RAW}\n${VILLAGE_RAW}`
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean)
  .flatMap((line): Estate[] => {
    const [name, aliasStr, district, housing, area, flag, street] = line.split("|");
    if (!name || !district || !housing || !isKnownHousing(housing)) return [];
    return [
      {
        name,
        aliases: (aliasStr ?? "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        district,
        housing,
        area: area || undefined,
        coverageCheck: flag === "check" || flag === "覆蓋需查核" || undefined,
        street: street?.trim() || undefined,
      },
    ];
  })
  .filter((item, index, list) => list.findIndex((x) => x.name === item.name) === index);

// ... rest of the file remains unchanged

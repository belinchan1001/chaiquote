import { DISTRICT_EN, districtEnglishName } from "./district-names.ts";
import {
  allowGovHitForQuery,
  allowSuggestHitForQuery,
  classifyAddress,
  compact,
  estateEnglishName,
  estateStreet,
  guessHousing,
  isImpracticalPlace,
  matchKnownEstate,
  parentEstate,
  relatedBlocks,
  searchEstates,
  type Estate,
  type HousingGuess,
} from "./estates.ts";
import { MESSAGES, type Locale, type MessageKey } from "./messages.ts";
import type { Housing } from "./plans.ts";
import { isNewIntakeEstate } from "./estate-new-intake.ts";
import { isNonResidentialGovHit } from "./estate-poi-filter.ts";
import { DISTRICTS } from "./site.ts";
import { toTraditional } from "./zh-s2t.ts";

export { classifyAddress, isImpracticalPlace, matchKnownEstate, allowSuggestHitForQuery };
export type { HousingGuess };

const GOV_SEARCH = "https://www.map.gov.hk/gs/api/v1.0.0/locationSearch";
/** Locale-independent: hits keep ZH+EN fields. Do not key by locale. */
const RESULT_CACHE = new Map<string, AddressHit[]>();
/** Homepage / suggest debounce. Keep Abort + cache; do not spam map.gov. */
export const ADDRESS_SEARCH_DEBOUNCE_MS = 300;
/** Parent + a scrollable set of 樓／閣 children; keep a few gov rows after that. */
export const LOCAL_SUGGEST_LIMIT = 24;
const GOV_EXTRA = 8;

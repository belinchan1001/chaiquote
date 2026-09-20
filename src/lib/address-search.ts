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
import { govHitRelevantToQuery, isNonResidentialGovHit } from "./estate-poi-filter.ts";
import { DISTRICTS } from "./site.ts";
import { toTraditional } from "./zh-s2t.ts";

import {
  ASK_ADDRESS,
  BUDGET_NO_ADDRESS,
  BUDGET_WITH_ADDRESS,
  HOUSING_CHIPS,
  INSTALL_ASK,
  NEW_INTAKE,
  NEW_INTAKE_HERE,
  NONE_MATCH,
  OFF_TOPIC,
  OPENING,
  PLACEHOLDER_ADDRESS,
  PLACEHOLDER_FOLLOW,
  PORT_IN,
  REMEMBER,
  SEVERAL_ESTATES,
  SKIP_LINE,
  SPEED_ASK,
  UNMATCHED,
  VILLAGE,
  confirmHousing,
  resultsIntro,
  type HousingWord,
} from "./ai-quote-copy.ts";
import { detectProvider, detectSpeed } from "./ai-desk.ts";
import { isNewIntakeEstate } from "./estate-new-intake.ts";
import { closeEstateMatches, compact, isBareHousingTypeQuery, type Estate } from "./estates.ts";
import { filterPlans } from "./plan-filter.ts";
import { FIBRE_SPEEDS } from "./port-in.ts";
import { averageFee, type Housing, type Plan, type ProviderId } from "./plans.ts";

export type QuotePhase =
  | "need-address"
  | "pick-estate"
  | "ask-intake"
  | "confirm-housing"
  | "ask-housing"
  | "ask-speed"
  | "ask-install"
  | "results";

export type AssistantTurn = {
  id: string;
  text: string;
  disclaimer?: boolean;
  /** In-thread customer-service control. The bubble text stays OFF_TOPIC. */
  cs?: boolean;
  planIds?: string[];
};

export type QuoteSession = {
  phase: QuotePhase;
  seq: number;
  addressText: string;
  estateName: string;
  matched: boolean;
  candidates: string[];
  housing?: Housing;
  providerId?: ProviderId;
  /** Visitor said they have no service, or have not chosen a provider. */
  providerKnown: boolean;
  newOrNone: boolean;
  speedLabel: string;
  minSpeed?: number;
  esports: boolean;
  installNote: string;
  budgetMax?: number;
  remembered: boolean;
  intakeOnly: boolean;
  chipsHidden: boolean;
  hasAddress: boolean;
};

const HOUSING_BY_WORD: Record<HousingWord, Housing> = {
  公屋: "public",
  居屋: "hos",
  私人樓: "private",
  村屋: "village",
};

const WORD_BY_HOUSING: Record<Housing, HousingWord> = {
  public: "公屋",
  hos: "居屋",
  private: "私人樓",
  village: "村屋",
};

export function createQuoteSession(): QuoteSession {
  return {
    phase: "need-address",
    seq: 1,
    addressText: "",
    estateName: "",
    matched: false,
    candidates: [],
    providerKnown: false,
    newOrNone: false,
    speedLabel: "",
    esports: false,
    installNote: "",
    remembered: false,
    intakeOnly: false,
    chipsHidden: false,
    hasAddress: false,
  };
}

export function openingTurn(): AssistantTurn {
  return { id: "opening", text: OPENING, disclaimer: true };
}

export function placeholderFor(session: QuoteSession) {
  return session.hasAddress ? PLACEHOLDER_FOLLOW : PLACEHOLDER_ADDRESS;
}

export type SuggestionChip = { label: string };

export function suggestionChips(session: QuoteSession): SuggestionChip[] {
  if (session.chipsHidden) return [];
  if (session.phase === "pick-estate") return session.candidates.map((label) => ({ label }));
  if (session.phase === "confirm-housing" || session.phase === "ask-housing") {
    return HOUSING_CHIPS.map((label) => ({ label }));
  }
  if (session.phase === "ask-speed") return FIBRE_SPEEDS.map((row) => ({ label: row.label }));
  return [];
}

/** Speed labels already on the site's 網速需求 filter. Not invented tiers. */
export function speedChipLabels() {
  return FIBRE_SPEEDS.map((row) => row.label);
}

export function handoffNeed(session: QuoteSession) {
  const parts: string[] = [];
  if (session.speedLabel) parts.push(session.speedLabel);
  else if (session.phase === "ask-install" || session.phase === "results" || session.installNote) parts.push("未定");
  if (session.installNote) parts.push(`希望安裝：${session.installNote}`);
  else if (session.phase === "results") parts.push("希望安裝：未定");
  return parts.join("；");
}

export function applyUserMessage(session: QuoteSession, raw: string): { session: QuoteSession; turns: AssistantTurn[] } {
  const draft: QuoteSession = { ...session, candidates: [...session.candidates] };
  const text = raw.trim();
  const turns: AssistantTurn[] = [];
  if (!text) {
    if (!draft.hasAddress) push(draft, turns, ASK_ADDRESS);
    return { session: draft, turns };
  }

  if (draft.phase === "pick-estate" && pickCandidate(draft, text, turns)) return { session: draft, turns };
  if (draft.phase === "ask-intake" && answerIntake(draft, text, turns)) return { session: draft, turns };

  if (answerBudget(draft, text, turns)) return { session: draft, turns };
  if (answerPort(draft, text, turns)) return { session: draft, turns };
  if (answerNewIntakeTopic(draft, text, turns)) return { session: draft, turns };
  if (answerVillageTopic(draft, text, turns)) return { session: draft, turns };
  if (isOutOfScope(text, draft.phase)) {
    showOffTopic(draft, turns);
    return { session: draft, turns };
  }

  if (draft.phase === "ask-intake") {
    draft.phase = "confirm-housing";
    draft.chipsHidden = false;
  }
  if ((draft.phase === "confirm-housing" || draft.phase === "ask-housing") && answerHousing(draft, text, turns)) {
    return { session: draft, turns };
  }
  if (draft.phase === "ask-speed" && answerSpeed(draft, text, turns)) return { session: draft, turns };
  if (draft.phase === "ask-install" && answerInstall(draft, text, turns)) return { session: draft, turns };

  if (looksLikeAddress(text)) {
    resolveAddress(draft, text, turns);
    return { session: draft, turns };
  }

  if (!draft.hasAddress) {
    push(draft, turns, ASK_ADDRESS);
    return { session: draft, turns };
  }

  showOffTopic(draft, turns);
  return { session: draft, turns };
}

function push(draft: QuoteSession, turns: AssistantTurn[], text: string, extra?: Partial<AssistantTurn>) {
  draft.seq += 1;
  turns.push({ id: `a${draft.seq}`, text, ...extra });
}

function showOffTopic(draft: QuoteSession, turns: AssistantTurn[]) {
  draft.chipsHidden = true;
  push(draft, turns, OFF_TOPIC, { cs: true });
}

function housingWord(housing: Housing | undefined): HousingWord | undefined {
  if (!housing) return undefined;
  return WORD_BY_HOUSING[housing];
}

function statedHousing(text: string): Housing | undefined {
  const hits = HOUSING_CHIPS.filter((word) => {
    if (word === "私人樓") return /私人樓|私樓|唐樓/.test(text);
    if (word === "村屋") return /村屋|丁屋/.test(text);
    return text.includes(word);
  });
  if (hits.length !== 1) return undefined;
  if (/[？?]|有冇|點算|幾多|分別/.test(text) && text.length > hits[0].length + 2) return undefined;
  return HOUSING_BY_WORD[hits[0]];
}

function isUndecided(text: string) {
  return /未定|未決定|之後再講|唔知點|不知道|冇所謂|隨便|未諗|未想到|skip/i.test(text);
}

function isSkip(text: string) {
  return /跳過|唔使問|直接對照|先對照|唔使揀/.test(text);
}

function isNoneProvider(text: string) {
  return /未有寬頻|未有服務|未裝|準備新申請|新申請|新開戶|無用緊|冇用緊|沒有用|無寬頻|冇寬頻|未申請|未有線|冇線|新裝/.test(text) || /^未有$/.test(text.trim());
}

function confirmsHousing(text: string) {
  const trimmed = text.trim();
  if (/^(啱|啱呀|啱啊|啱嘅|係|係呀|係啊|係嘅|正確|無錯|沒錯|yes|對|對呀|對啊)$/i.test(trimmed)) return true;
  return /啱|正確|無錯|沒錯|就係|yes|對呀|對啊|係呀|係啊|係呢個/i.test(text);
}

function rejectsHousing(text: string) {
  return /唔啱|不對|唔係|不是/.test(text);
}

function looksLikeAddress(text: string) {
  if (isBareHousingTypeQuery(text)) return false;
  if (/^(你好|哈囉|嗨)[!！。.\s]*$/.test(text)) return false;
  if (/[街道路巷號]/.test(text)) return true;
  return closeEstateMatches(text).some((estate) => acceptEstate(text, estate));
}

/** A street address must contain the estate name, not only a short district alias. */
function streetRejects(query: string, estate: Estate) {
  if (!/[街道路巷號]/.test(query)) return false;
  const q = compact(query);
  const name = compact(estate.name);
  if (name.length >= 2 && q.includes(name)) return false;
  return !estate.aliases.some((alias) => {
    const needle = compact(alias);
    return needle.length >= 3 && q.includes(needle);
  });
}

function acceptEstate(query: string, estate: Estate) {
  return !streetRejects(query, estate);
}

function remember(draft: QuoteSession, turns: AssistantTurn[]) {
  if (draft.remembered || !draft.hasAddress || !draft.housing || !draft.providerKnown) return;
  draft.remembered = true;
  push(draft, turns, REMEMBER);
}

function goSpeed(draft: QuoteSession, turns: AssistantTurn[]) {
  remember(draft, turns);
  draft.phase = "ask-speed";
  draft.chipsHidden = false;
  push(draft, turns, SPEED_ASK);
}

function goInstall(draft: QuoteSession, turns: AssistantTurn[]) {
  draft.phase = "ask-install";
  draft.chipsHidden = true;
  push(draft, turns, INSTALL_ASK);
}

function goResults(draft: QuoteSession, turns: AssistantTurn[], withSkip: boolean) {
  if (!draft.housing) {
    draft.phase = draft.matched ? "confirm-housing" : "ask-housing";
    draft.chipsHidden = false;
    const word = housingWord(draft.housing);
    push(draft, turns, draft.matched && word ? confirmHousing(word) : UNMATCHED);
    return;
  }
  const ids = referenceIds(draft);
  draft.phase = "results";
  draft.chipsHidden = true;
  if (withSkip) push(draft, turns, SKIP_LINE);
  push(draft, turns, ids.length ? resultsIntro(ids.length, Boolean(draft.providerId) && !draft.newOrNone) : NONE_MATCH, {
    planIds: ids,
  });
}

function referenceIds(session: QuoteSession) {
  if (!session.housing) return [];
  let rows = filterPlans({
    cat: "broadband",
    housing: session.housing,
    sort: "fee",
    estate: session.matched ? session.estateName : undefined,
    exclude: session.providerId,
    maxFee: session.budgetMax,
    minSpeed: session.minSpeed,
    intake: session.intakeOnly ? true : undefined,
    esports: session.esports || undefined,
  });
  if (!session.intakeOnly) rows = rows.filter((plan) => !plan.newIntakeOffer);
  if (session.housing === "village") {
    rows = rows.filter((plan) => plan.housing === "all" || plan.housing.includes("village"));
  }
  const best = new Map<ProviderId, Plan>();
  for (const plan of rows) {
    const prev = best.get(plan.providerId);
    const fee = averageFee(plan);
    if (!prev || fee < averageFee(prev) || (fee === averageFee(prev) && plan.id < prev.id)) {
      best.set(plan.providerId, plan);
    }
  }
  return [...best.values()]
    .sort((a, b) => averageFee(a) - averageFee(b) || a.id.localeCompare(b.id))
    .slice(0, 3)
    .map((plan) => plan.id);
}

function beginMatched(draft: QuoteSession, estate: Estate, turns: AssistantTurn[]) {
  draft.estateName = estate.name;
  draft.matched = true;
  draft.hasAddress = true;
  draft.housing = estate.housing;
  draft.candidates = [];
  draft.chipsHidden = false;
  if (isNewIntakeEstate(estate.name)) {
    draft.phase = "ask-intake";
    draft.chipsHidden = true;
    push(draft, turns, NEW_INTAKE_HERE);
    return;
  }
  draft.phase = "confirm-housing";
  push(draft, turns, confirmHousing(WORD_BY_HOUSING[estate.housing]));
}

function resolveAddress(draft: QuoteSession, text: string, turns: AssistantTurn[]) {
  const close = closeEstateMatches(text).filter((estate) => acceptEstate(text, estate));
  draft.addressText = text;
  draft.providerKnown = false;
  draft.providerId = undefined;
  draft.newOrNone = false;
  draft.remembered = false;
  draft.intakeOnly = false;
  if (close.length === 1) {
    beginMatched(draft, close[0], turns);
    return;
  }
  if (close.length > 1) {
    draft.phase = "pick-estate";
    draft.matched = false;
    draft.hasAddress = true;
    draft.estateName = "";
    draft.candidates = close.map((estate) => estate.name);
    draft.chipsHidden = false;
    push(draft, turns, SEVERAL_ESTATES);
    return;
  }
  draft.phase = "ask-housing";
  draft.matched = false;
  draft.hasAddress = true;
  draft.estateName = "";
  draft.housing = undefined;
  draft.candidates = [];
  draft.chipsHidden = false;
  push(draft, turns, UNMATCHED);
}

function pickCandidate(draft: QuoteSession, text: string, turns: AssistantTurn[]) {
  const picked = draft.candidates.find((name) => name === text.trim() || compact(name) === compact(text));
  if (!picked) return false;
  const estate = closeEstateMatches(picked)[0];
  if (!estate) return false;
  draft.addressText = picked;
  beginMatched(draft, estate, turns);
  return true;
}

function answerIntake(draft: QuoteSession, text: string, turns: AssistantTurn[]) {
  if (text.length <= 12 && /^(要|好|睇|要睇|好呀|好啊|係|想|想睇|先睇|yes)/i.test(text) && !/^(唔|不|否)/.test(text)) {
    draft.intakeOnly = true;
    draft.phase = "confirm-housing";
    draft.chipsHidden = false;
    const word = housingWord(draft.housing);
    if (word) push(draft, turns, confirmHousing(word));
    return true;
  }
  if (/唔要|唔使|不用|唔睇|唔需要|否|^no$/i.test(text)) {
    draft.intakeOnly = false;
    draft.phase = "confirm-housing";
    draft.chipsHidden = false;
    const word = housingWord(draft.housing);
    if (word) push(draft, turns, confirmHousing(word));
    return true;
  }
  return false;
}

function answerHousing(draft: QuoteSession, text: string, turns: AssistantTurn[]) {
  const housing = statedHousing(text);
  const provider = detectProvider(text);
  const none = isNoneProvider(text);
  const undecided = isUndecided(text);
  const affirm = confirmsHousing(text);
  const reject = rejectsHousing(text);
  if (!housing && !provider && !none && !undecided && !affirm && !reject) return false;
  if (housing) draft.housing = housing;
  if (provider) {
    draft.providerId = provider;
    draft.providerKnown = true;
    draft.newOrNone = false;
  } else if (none || undecided) {
    draft.providerId = undefined;
    draft.providerKnown = true;
    draft.newOrNone = true;
  }
  if (draft.phase === "ask-housing") {
    if (!draft.housing) return false;
    goSpeed(draft, turns);
    return true;
  }
  if (reject && !housing) {
    draft.phase = "confirm-housing";
    draft.chipsHidden = false;
    return true;
  }
  const housingSet = Boolean(housing) || affirm || Boolean(provider) || none || undecided;
  if (!housingSet || !draft.housing) return false;
  goSpeed(draft, turns);
  return true;
}

function applySpeed(draft: QuoteSession, text: string) {
  if (/電競神線/.test(text)) {
    draft.esports = true;
    draft.minSpeed = 2500;
    draft.speedLabel = "電競神線";
    return true;
  }
  const chip = FIBRE_SPEEDS.find((row) => text.includes(row.label));
  if (chip) {
    draft.esports = false;
    draft.minSpeed = chip.minSpeed;
    draft.speedLabel = chip.label;
    return true;
  }
  const speed = detectSpeed(text);
  if (!speed) return false;
  draft.esports = false;
  draft.minSpeed = speed >= 2500 ? 2500 : speed >= 1000 ? 1000 : speed;
  const mapped = FIBRE_SPEEDS.find((row) => row.minSpeed === draft.minSpeed);
  draft.speedLabel = mapped?.label ?? "";
  return true;
}

function noteProvider(draft: QuoteSession, text: string) {
  const provider = detectProvider(text);
  if (!provider) return;
  draft.providerId = provider;
  draft.providerKnown = true;
  draft.newOrNone = false;
}

function answerSpeed(draft: QuoteSession, text: string, turns: AssistantTurn[]) {
  noteProvider(draft, text);
  if (isSkip(text)) {
    draft.speedLabel = "未定";
    draft.minSpeed = undefined;
    goResults(draft, turns, true);
    return true;
  }
  if (isUndecided(text)) {
    draft.speedLabel = "未定";
    draft.minSpeed = undefined;
    goInstall(draft, turns);
    return true;
  }
  if (applySpeed(draft, text)) {
    goInstall(draft, turns);
    return true;
  }
  if (looksLikeAddress(text)) return false;
  draft.speedLabel = "未定";
  draft.minSpeed = undefined;
  goInstall(draft, turns);
  return true;
}

function answerInstall(draft: QuoteSession, text: string, turns: AssistantTurn[]) {
  noteProvider(draft, text);
  if (isSkip(text)) {
    draft.installNote = "未定";
    goResults(draft, turns, true);
    return true;
  }
  draft.installNote = isUndecided(text) ? "未定" : text.slice(0, 40);
  goResults(draft, turns, false);
  return true;
}

function answerBudget(draft: QuoteSession, text: string, turns: AssistantTurn[]) {
  if (!/預算|budget|月費上限/i.test(text)) return false;
  const amount = text.replace(/,/g, "").match(/(\d{2,5})/);
  const value = amount ? Number(amount[1]) : undefined;
  if (value && value >= 30 && value <= 5000) draft.budgetMax = value;
  draft.chipsHidden = draft.phase !== "confirm-housing" && draft.phase !== "ask-housing" && draft.phase !== "ask-speed";
  if (!draft.hasAddress) {
    push(draft, turns, BUDGET_NO_ADDRESS);
    return true;
  }
  push(draft, turns, BUDGET_WITH_ADDRESS);
  if (draft.phase === "results" && draft.housing) {
    const ids = referenceIds(draft);
    push(draft, turns, ids.length ? resultsIntro(ids.length, Boolean(draft.providerId) && !draft.newOrNone) : NONE_MATCH, {
      planIds: ids,
    });
  }
  return true;
}

function answerPort(draft: QuoteSession, text: string, turns: AssistantTurn[]) {
  if (!/轉台|攜號|port-?in|解約費/i.test(text)) return false;
  draft.chipsHidden = true;
  push(draft, turns, PORT_IN);
  return true;
}

function answerNewIntakeTopic(draft: QuoteSession, text: string, turns: AssistantTurn[]) {
  if (!/新入伙/.test(text)) return false;
  if (draft.phase === "ask-intake") return false;
  draft.chipsHidden = true;
  push(draft, turns, NEW_INTAKE);
  return true;
}

function answerVillageTopic(draft: QuoteSession, text: string, turns: AssistantTurn[]) {
  if (!/村屋|丁屋/.test(text)) return false;
  if ((draft.phase === "confirm-housing" || draft.phase === "ask-housing") && statedHousing(text)) return false;
  draft.chipsHidden = true;
  push(draft, turns, VILLAGE);
  return true;
}

function isOutOfScope(text: string, phase: QuotePhase) {
  if (/聽聞|傳聞|係咪真|是不是真|謠言|加價/.test(text)) return true;
  if (/天氣|食飯|股票|足球|政治|幾點收工|唱歌|電影|運程|你好嗎|hello|hi\b/i.test(text)) return true;
  if (/^(你好|哈囉|嗨)[!！。.\s]*$/.test(text)) return true;
  if (/幾多錢|幾錢|平唔平|最平|最抵|最低價|貴唔貴/.test(text) && !/預算/.test(text)) return true;
  if (phase !== "ask-install" && /預約安裝|幫我訂|book a slot|安裝檔期/i.test(text)) return true;
  return false;
}

import {
  averageFee,
  formatFee,
  formatPlanSpeed,
  PROVIDER_MAP,
  type Category,
  type Plan,
  type ProviderId,
} from "./plans.ts";

export const EMPTY_COMPARE_MARKERS = new Set(["", "—", "-", "–", "−"]);

export type CompareField =
  | "category"
  | "fee"
  | "avg"
  | "contract"
  | "free"
  | "speed"
  | "data"
  | "after"
  | "voice"
  | "roam"
  | "install"
  | "port";

export const COMPARE_FIELDS: { key: CompareField; highlight?: boolean }[] = [
  { key: "category" },
  { key: "fee", highlight: true },
  { key: "avg" },
  { key: "contract" },
  { key: "free", highlight: true },
  { key: "speed", highlight: true },
  { key: "data" },
  { key: "after" },
  { key: "voice" },
  { key: "roam" },
  { key: "install" },
  { key: "port" },
];

export type CompareCopy = {
  dash: string;
  none: string;
  months: (n: number) => string;
  categoryLabel: (category: Category) => string;
  tx: (text: string) => string;
};

const SHORT_PROVIDER_ZH: Record<ProviderId, string> = {
  hkbn: "寬頻",
  netvigator: "網上行",
  cmhk: "移動",
  hgc: "HGC",
  smartone: "數碼通",
  three: "3",
  csl: "csl",
  icable: "有線",
};

export function isEmptyCompareValue(value: string, dash = "—") {
  const trimmed = value.trim();
  return !trimmed || trimmed === dash || EMPTY_COMPARE_MARKERS.has(trimmed);
}

export function rowHasAnyValue(values: readonly string[], dash = "—") {
  return values.some((value) => !isEmptyCompareValue(value, dash));
}

export function compareFieldValue(plan: Plan, field: CompareField, copy: CompareCopy): string {
  const { dash, none, months, categoryLabel, tx } = copy;
  switch (field) {
    case "category":
      return categoryLabel(plan.category);
    case "fee":
      return formatFee(plan.monthlyFee);
    case "avg":
      return formatFee(averageFee(plan));
    case "contract":
      return months(plan.contractMonths);
    case "free":
      return plan.freeMonths ? months(plan.freeMonths) : none;
    case "speed":
      return formatPlanSpeed(plan);
    case "data":
      if (plan.highSpeedGb) return `${plan.highSpeedGb}GB`;
      if (plan.dataGb) return `${plan.dataGb}GB`;
      return dash;
    case "after":
      return plan.fupNote ? tx(plan.fupNote) : dash;
    case "voice":
      return plan.voice ? tx(plan.voice) : dash;
    case "roam":
      return plan.roaming ? tx(plan.roaming) : dash;
    case "install":
      return tx(plan.install);
    case "port":
      return plan.portInPerk ? tx(plan.portInPerk) : dash;
  }
}

export function visibleCompareFields(plans: readonly Plan[], copy: CompareCopy) {
  return COMPARE_FIELDS.filter((field) =>
    rowHasAnyValue(
      plans.map((plan) => compareFieldValue(plan, field.key, copy)),
      copy.dash,
    ),
  );
}

export function shortProviderName(id: ProviderId, locale: "zh" | "en") {
  if (locale === "en") return PROVIDER_MAP[id].nameEn;
  return SHORT_PROVIDER_ZH[id];
}

export function planSpecToken(plan: Plan) {
  if (plan.speedMbps) return `${plan.speedMbps}M`;
  if (plan.highSpeedGb) return `${plan.highSpeedGb}GB`;
  if (plan.dataGb) return `${plan.dataGb}GB`;
  return "";
}

export function compareChipLabel(plan: Plan, locale: "zh" | "en") {
  const fee = formatFee(plan.monthlyFee).replace(/^HK/, "");
  return [shortProviderName(plan.providerId, locale), planSpecToken(plan), fee].filter(Boolean).join(" ");
}

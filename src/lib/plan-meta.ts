export type Category = "broadband" | "mobile" | "home5g" | "business";
export type Housing = "public" | "hos" | "private" | "village";
export type Generation = "4g" | "5g";
export type SpeedMbps = 200 | 500 | 1000 | 2000 | 2500 | 5000 | 10000;

export type ProviderId =
  | "hkbn"
  | "netvigator"
  | "cmhk"
  | "hgc"
  | "smartone"
  | "three"
  | "csl"
  | "icable";

export type Provider = {
  id: ProviderId;
  name: string;
  nameEn: string;
  initial: string;
  tone: string;
};

export const PROVIDERS: Provider[] = [
  { id: "hkbn", name: "香港寬頻", nameEn: "HKBN", initial: "寬", tone: "bg-provider-hkbn" },
  { id: "netvigator", name: "網上行", nameEn: "Netvigator", initial: "網", tone: "bg-provider-netvigator" },
  { id: "cmhk", name: "中國移動香港", nameEn: "CMHK", initial: "移", tone: "bg-provider-cmhk" },
  { id: "hgc", name: "HGC 寬頻", nameEn: "HGC", initial: "H", tone: "bg-provider-hgc" },
  { id: "smartone", name: "數碼通", nameEn: "SmarTone", initial: "S", tone: "bg-provider-smartone" },
  { id: "three", name: "3香港", nameEn: "3HK", initial: "3", tone: "bg-provider-three" },
  { id: "csl", name: "csl.", nameEn: "csl.", initial: "C", tone: "bg-provider-csl" },
  { id: "icable", name: "有線寬頻", nameEn: "i-Cable", initial: "線", tone: "bg-provider-icable" },
];

export const PROVIDER_MAP = Object.fromEntries(PROVIDERS.map((p) => [p.id, p])) as Record<
  ProviderId,
  Provider
>;

export function isHktPlan(plan: { providerId: ProviderId }) {
  return plan.providerId === "netvigator" || plan.providerId === "csl";
}

export function formatFee(value: number) {
  return Number.isInteger(value) ? `HK$${value}` : `HK$${value.toFixed(1)}`;
}

export const CATEGORY_LABEL: Record<Category, string> = {
  broadband: "光纖寬頻",
  mobile: "手機月費",
  home5g: "5G 家居寬頻",
  business: "商業寬頻",
};

export const HOUSING_LABEL: Record<Housing, string> = {
  public: "公屋",
  hos: "居屋",
  private: "私人樓",
  village: "村屋",
};

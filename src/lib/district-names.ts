import type { Locale } from "./messages.ts";
import { DISTRICTS } from "./site.ts";

/** Official 18 HK district English names. Do not invent names outside this map. */
export const DISTRICT_EN = {
  中西區: "Central and Western",
  灣仔: "Wan Chai",
  東區: "Eastern",
  南區: "Southern",
  油尖旺: "Yau Tsim Mong",
  深水埗: "Sham Shui Po",
  九龍城: "Kowloon City",
  黃大仙: "Wong Tai Sin",
  觀塘: "Kwun Tong",
  荃灣: "Tsuen Wan",
  屯門: "Tuen Mun",
  元朗: "Yuen Long",
  北區: "North",
  大埔: "Tai Po",
  沙田: "Sha Tin",
  西貢: "Sai Kung",
  葵青: "Kwai Tsing",
  離島: "Islands",
} as const satisfies Record<(typeof DISTRICTS)[number], string>;

export type DistrictName = (typeof DISTRICTS)[number];

export function districtEnglishName(district: string): string | undefined {
  const key = district.trim();
  return DISTRICT_EN[key as DistrictName];
}

export function districtDisplayName(district: string, locale: Locale = "zh"): string {
  if (locale === "en") return districtEnglishName(district) || district;
  return district;
}

import type { Locale } from "./messages.ts";
import type { Housing } from "./plan-meta.ts";

export type AddressHit = {
  key: string;
  name: string;
  address: string;
  district: string;
  nameEN?: string;
  addressEN?: string;
  districtEN?: string;
  housing?: Housing;
  source: "local" | "gov";
  coverageCheck?: boolean;
  newIntake?: boolean;
  blockRef?: boolean;
};

function tidy(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function pickLocalized(zh: string, en: string | undefined, locale: Locale) {
  if (locale === "en") {
    const english = tidy(en || "");
    if (english) return english;
  }
  return tidy(zh || en || "");
}

export function addressHitName(hit: AddressHit, locale: Locale = "zh") {
  return pickLocalized(hit.name, hit.nameEN, locale);
}

export function addressHitAddress(hit: AddressHit, locale: Locale = "zh") {
  return pickLocalized(hit.address, hit.addressEN, locale);
}

export function addressHitValue(hit: AddressHit, locale: Locale = "zh") {
  const name = addressHitName(hit, locale);
  const address = addressHitAddress(hit, locale);
  if (!address) return name;
  return locale === "en" ? `${name}, ${address}` : `${name}，${address}`;
}

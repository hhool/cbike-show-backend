import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── Localization helpers ────────────────────────────────────────────────────

/** A bilingual string stored as { zh, en }. */
export interface LocalizedString {
  zh: string;
  en: string;
}

/** Pick the correct locale value from a LocalizedString. */
export function l(s: LocalizedString, locale: string): string {
  return locale === "en" ? s.en : s.zh;
}

/** Pick a locale value from an array of LocalizedString. */
export function lArr(arr: LocalizedString[], locale: string): string[] {
  return arr.map((s) => l(s, locale));
}

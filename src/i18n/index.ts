import { Collection } from "discord.js";
import { tr, type TranslationKey } from "./locales/tr.js";
import { en } from "./locales/en.js";
import { de } from "./locales/de.js";
import { fr } from "./locales/fr.js";
import { es } from "./locales/es.js";
import { pt } from "./locales/pt.js";
import { ru } from "./locales/ru.js";
import { ja } from "./locales/ja.js";
import { ar } from "./locales/ar.js";
import { hi } from "./locales/hi.js";

export type Locale = "tr" | "en" | "de" | "fr" | "es" | "pt" | "ru" | "ja" | "ar" | "hi";

const catalogs: Record<Locale, Record<TranslationKey, string>> = {
  tr, en, de, fr, es, pt, ru, ja, ar, hi,
};

const guildLocales = new Collection<string, Locale>();

export function setGuildLocale(guildId: string, locale: Locale): void {
  guildLocales.set(guildId, locale);
}

export function getGuildLocale(guildId?: string | null): Locale {
  if (!guildId) return "tr";
  return guildLocales.get(guildId) ?? "tr";
}

export function t(
  key: TranslationKey,
  locale: Locale = "tr",
  vars?: Record<string, string | number>
): string {
  const catalog = catalogs[locale] ?? catalogs.tr;
  let text = catalog[key] ?? catalogs.tr[key] ?? key;

  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replaceAll(`{${k}}`, String(v));
    }
  }

  return text;
}

export function tg(
  guildId: string | null | undefined,
  key: TranslationKey,
  vars?: Record<string, string | number>
): string {
  return t(key, getGuildLocale(guildId), vars);
}

export const LOCALES: { code: Locale; label: string }[] = [
  { code: "tr", label: "Türkçe" },
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
  { code: "fr", label: "Français" },
  { code: "es", label: "Español" },
  { code: "pt", label: "Português" },
  { code: "ru", label: "Русский" },
  { code: "ja", label: "日本語" },
  { code: "ar", label: "العربية" },
  { code: "hi", label: "हिन्दी" },
];

export function isLocale(value: string): value is Locale {
  return LOCALES.some((l) => l.code === value);
}

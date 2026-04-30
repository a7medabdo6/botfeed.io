import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// ── English is bundled as the SSR-safe fallback ──────────────────────────────
// All other language translations are loaded dynamically from the backend via
// the `useLanguageInitializer` hook and injected with `loadTranslations()`.
import enTranslation from "@/src/locales/en/translation.json";
import arTranslation from "@/src/locales/ar/translation.json";
import esTranslation from "@/src/locales/es/translation.json";

const getSavedLanguage = (): string => {
  if (typeof window === "undefined") return "en";
  try {
    return localStorage.getItem("selected_language") || "en";
  } catch {
    return "en";
  }
};

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: enTranslation as Record<string, unknown> },
    ar: { translation: arTranslation as Record<string, unknown> },
    es: { translation: esTranslation as Record<string, unknown> },
  },
  // Start from the user's last-chosen locale. If that locale's translations
  // haven't been loaded yet the fallback ("en") will be used automatically.
  lng: getSavedLanguage(),
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;

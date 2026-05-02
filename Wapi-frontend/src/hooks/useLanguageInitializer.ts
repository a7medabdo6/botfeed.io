"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "@/src/redux/hooks";
import { setRTL } from "@/src/redux/reducers/layoutSlice";
import { languageApi } from "@/src/redux/api/languageApi";
import { DEFAULT_LOCALE } from "@/src/constants/locale";
import { loadTranslations } from "@/src/utils/i18nLoader";

const LANGUAGE_STORAGE_KEY = "selected_language";
const RTL_LANGUAGES = new Set(["ar"]);

export const useLanguageInitializer = (): boolean => {
  const { i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const [isLanguageReady, setIsLanguageReady] = useState(false);

  const [getAllLanguages] = languageApi.useLazyGetAllLanguagesQuery();
  const [getTranslations] = languageApi.useLazyGetTranslationsQuery();

  useEffect(() => {
    const initializeLanguage = async () => {
      const savedLocale = localStorage.getItem(LANGUAGE_STORAGE_KEY) || DEFAULT_LOCALE;

      try {
        const languagesResult = await getAllLanguages({ status: true }).unwrap();
        const activeLanguages = languagesResult?.data?.languages || [];
        const currentLanguage = activeLanguages.find((lang) => lang.locale === savedLocale);

        if (currentLanguage) {
          try {
            const translationResult = await getTranslations(currentLanguage._id).unwrap();
            if (translationResult?.success && translationResult.data) {
              loadTranslations(savedLocale, translationResult.data);
            }
          } catch {
            await i18n.changeLanguage(savedLocale);
            dispatch(setRTL(currentLanguage.is_rtl ?? RTL_LANGUAGES.has(savedLocale)));
          }

          if (i18n.language !== savedLocale) {
            await i18n.changeLanguage(savedLocale);
          }

          dispatch(setRTL(currentLanguage.is_rtl));
        } else {
          // Fallback to bundled locale files when backend language is missing.
          await i18n.changeLanguage(savedLocale);
          dispatch(setRTL(RTL_LANGUAGES.has(savedLocale)));
        }
      } catch {
        // Network/API failure fallback: keep selected locale from bundled resources.
        await i18n.changeLanguage(savedLocale);
        dispatch(setRTL(RTL_LANGUAGES.has(savedLocale)));
      } finally {
        setIsLanguageReady(true);
      }
    };

    initializeLanguage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return isLanguageReady;
};

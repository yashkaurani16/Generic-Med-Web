import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enCommon from './locales/en/common.json';
import hiCommon from './locales/hi/common.json';
import taCommon from './locales/ta/common.json';
import teCommon from './locales/te/common.json';

const resources = {
  en: { common: enCommon },
  hi: { common: hiCommon },
  ta: { common: taCommon },
  te: { common: teCommon },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    defaultNS: 'common',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already safe from XSS
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;

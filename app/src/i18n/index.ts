import { initReactI18next } from 'react-i18next';
import i18n, { InitOptions } from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enUS from './locales/en-US.json';

const defaultLanguage = 'en-US';

export const languages: { [index: string]: string } = {
  'en-US': 'English',
};

/**
 * create a mapping of locales -> translations
 */
const resources = Object.keys(languages).reduce((acc: { [key: string]: any }, lang) => {
  switch (lang) {
    case 'en-US':
      acc[lang] = { translation: enUS };
      break;
  }
  return acc;
}, {});

/**
 * create an array of allowed languages
 */
const whitelist = Object.keys(languages).reduce((acc: string[], lang) => {
  acc.push(lang);

  if (lang.includes('-')) {
    acc.push(lang.substring(0, lang.indexOf('-')));
  }

  return acc;
}, []);

const config: InitOptions = {
  lng: defaultLanguage,
  resources,
  whitelist,
  fallbackLng: defaultLanguage,
  keySeparator: false,
  interpolation: {
    escapeValue: false,
  },
  detection: {
    lookupLocalStorage: 'lang',
  },
};

i18n.use(LanguageDetector).use(initReactI18next).init(config);

export default i18n;

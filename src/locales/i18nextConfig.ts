import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';
import en from './en';
import ko from './ko';
import ja from './ja';
import zhCN from './zh-CN';

const resources = {
  en: { translation: en },
  ko: { translation: ko },
  ja: { translation: ja },
  'zh-CN': { translation: zhCN },
};

const getDeviceLanguage = () => {
  const locales = RNLocalize.getLocales();
  if (Array.isArray(locales) && locales.length > 0) {
    const systemLanguage = locales[0].languageCode;
    const countryCode = locales[0].countryCode;
    
    if (systemLanguage === 'zh') {
      return 'zh-CN';
    }
    
    const supportedLanguages = ['ko', 'en', 'ja', 'zh-CN'];
    return supportedLanguages.includes(systemLanguage) ? systemLanguage : 'ko';
  }
  return 'ko';
};

i18next
  .use(initReactI18next)
  .init({
    resources,
    lng: getDeviceLanguage(),
    fallbackLng: 'ko',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
    returnObjects: true,
  });

export default i18next;
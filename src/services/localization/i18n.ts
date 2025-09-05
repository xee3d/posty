import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'react-native-localize';
import languageService from './languageService';

// 번역 리소스 import
import ko from './translations/ko.json';
import en from './translations/en.json';
import ja from './translations/ja.json';
import zhCN from './translations/zh-CN.json';

const resources = {
  ko: { translation: ko },
  en: { translation: en },
  ja: { translation: ja },
  'zh-CN': { translation: zhCN },
};

// 기본 언어 감지
const getDefaultLanguage = () => {
  const locales = getLocales();
  const systemLanguage = locales[0]?.languageCode;
  
  console.log('[i18n] System language detected:', systemLanguage);
  
  // 지원 언어와 매칭
  if (systemLanguage === 'ko') return 'ko';
  if (systemLanguage === 'ja') return 'ja';  
  if (systemLanguage === 'zh') return 'zh-CN';
  return 'ko'; // 기본값을 한국어로 변경
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getDefaultLanguage(),
    fallbackLng: 'ko',
    debug: false,
    
    interpolation: {
      escapeValue: false, // React는 XSS 보호가 기본 제공
    },
    
    react: {
      useSuspense: false, // React Native에서는 비활성화
    },
  });

// 언어 변경 리스너 연결
languageService.addLanguageChangeListener((language) => {
  i18n.changeLanguage(language);
});

export default i18n;
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';
import { getDeviceLanguage as getDeviceLanguageUtil } from '../utils/deviceLanguage';
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
  // deviceLanguage.ts의 함수를 사용하여 FORCE_ENGLISH 설정을 적용
  const deviceLang = getDeviceLanguageUtil();
  console.log('🌍 [i18n] Device language from deviceLanguage.ts:', deviceLang);
  
  if (deviceLang === 'zh') {
    return 'zh-CN';
  }
  
  const supportedLanguages = ['ko', 'en', 'ja', 'zh-CN'];
  const finalLang = supportedLanguages.includes(deviceLang) ? deviceLang : 'ko';
  console.log('🌍 [i18n] Final language for i18n:', finalLang);
  return finalLang;
};

i18next
  .use(initReactI18next)
  .init({
    resources,
    lng: getDeviceLanguage(),
    fallbackLng: 'ko',
    returnObjects: false, // 기본적으로 문자열 반환, 필요시 개별 호출에서 returnObjects: true 사용
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
    debug: __DEV__, // 개발 모드에서만 디버그 로그 활성화
  })
  .then(() => {
    console.log('🌍 [i18n] Initialized successfully with language:', i18next.language);
    console.log('🌍 [i18n] Available resources:', Object.keys(i18next.options.resources || {}));
  })
  .catch((error) => {
    console.error('❌ [i18n] Initialization failed:', error);
  });

// 호환성을 위한 export들
export const t = (key: string, options?: any) => i18next.t(key, options);
export const getCurrentLanguage = () => i18next.language;
export const changeLanguage = async (language: string) => {
  try {
    await i18next.changeLanguage(language);
    console.log('🌍 [i18n] Language changed to:', language);
    return true;
  } catch (error) {
    console.error('❌ [i18n] Failed to change language:', error);
    return false;
  }
};

export default i18next;
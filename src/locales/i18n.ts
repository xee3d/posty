import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
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

// 리소스 새로고침 함수
const refreshResources = () => {
  try {
    i18next.addResourceBundle('ko', 'translation', ko, true, true);
    i18next.addResourceBundle('en', 'translation', en, true, true);
    i18next.addResourceBundle('ja', 'translation', ja, true, true);
    i18next.addResourceBundle('zh-CN', 'translation', zhCN, true, true);

    console.log('🌍 [i18n] Resources refreshed successfully');
    return true;
  } catch (error) {
    console.error('❌ [i18n] Failed to refresh resources:', error);
    return false;
  }
};

// i18next 중복 초기화 방지
if (!i18next.isInitialized) {
  i18next
    .use(initReactI18next)
    .init({
      resources,
      lng: getDeviceLanguage(),
      fallbackLng: 'ko',
      returnObjects: true, // 객체 반환 허용 - 중국어 polishOptions 등에서 필요
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
      // 리소스 강제 새로고침으로 최신 번역 적용
      refreshResources();
    })
    .catch((error) => {
      console.error('❌ [i18n] Initialization failed:', error);
    });
} else {
  console.log('🌍 [i18n] Already initialized, skipping...');
}

// 유틸리티 함수들
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

// refreshResources export for external use
export { refreshResources };

export default i18next;
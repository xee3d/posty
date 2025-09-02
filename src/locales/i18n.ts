import I18n from "i18n-js";
import * as RNLocalize from "react-native-localize";
import en from "./en";
import ko from "./ko";

// 번역 파일 등록
I18n.translations = {
  en,
  ko,
};

// 폴백 언어 설정
I18n.fallbacks = true;
I18n.defaultLocale = "ko";

// 시스템 언어 감지 및 설정
const setI18nConfig = () => {
  const locales = RNLocalize.getLocales();

  if (Array.isArray(locales)) {
    // 시스템 언어 우선 사용
    const systemLanguage = locales[0].languageCode;

    // 지원하는 언어인지 확인
    const supportedLanguages = ["ko", "en"];
    if (supportedLanguages.includes(systemLanguage)) {
      I18n.locale = systemLanguage;
    } else {
      // 지원하지 않는 언어면 기본값 사용
      I18n.locale = "ko";
    }
  }
};

// 초기 설정
setI18nConfig();

// 언어 변경 감지
RNLocalize.addEventListener("change", setI18nConfig);

// 번역 함수
export const t = (key: string, options?: any) => I18n.t(key, options);

// 현재 언어 가져오기
export const getCurrentLanguage = () => I18n.locale;

// 언어 변경
export const changeLanguage = (language: string) => {
  I18n.locale = language;
};

export default I18n;

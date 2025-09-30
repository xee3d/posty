import { NativeModules, Platform } from "react-native";
import * as RNLocalize from "react-native-localize";

export const getDeviceLanguage = (): string => {
  // 테스트를 위한 강제 언어 설정 (개발 중)
  const FORCE_LANGUAGE_TEST = null; // 'ko', 'ja', 'zh', 'en' 또는 null
  if (FORCE_LANGUAGE_TEST) {
    console.log(`🌍 [DeviceLanguage] Force language test: ${FORCE_LANGUAGE_TEST}`);
    return FORCE_LANGUAGE_TEST;
  }

  // react-native-localize 사용
  const locales = RNLocalize.getLocales();
  if (locales && locales.length > 0) {
    return locales[0].languageCode;
  }

  // 폴백: NativeModules 사용
  const deviceLanguage =
    Platform.OS === "ios"
      ? NativeModules.SettingsManager?.settings?.AppleLocale ||
        NativeModules.SettingsManager?.settings?.AppleLanguages[0]
      : NativeModules.I18nManager?.localeIdentifier;

  // 언어 코드만 추출 (예: ko-KR -> ko)
  const languageCode = deviceLanguage?.split("-")[0] || "ko";

  console.log("Device language detected:", languageCode);
  return languageCode;
};

export const isKorean = (): boolean => {
  // 개발 중 강제로 한국어 설정 (필요시 true로 변경)
  const FORCE_KOREAN = false;
  if (FORCE_KOREAN) {
    return true;
  }

  // 임시로 영어 테스트를 위해 false 강제 반환
  const FORCE_ENGLISH_TEST = false;
  if (FORCE_ENGLISH_TEST) {
    console.log("Device language forced to: non-Korean for English test");
    return false;
  }

  const lang = getDeviceLanguage();
  return lang === "ko" || lang === "kr";
};

export const getNewsAPICountry = (): string => {
  const lang = getDeviceLanguage();
  // NewsAPI 국가 코드 매핑
  switch (lang) {
    case "ko":
    case "kr":
      return "kr";
    case "en":
      return "us";
    case "ja":
      return "jp";
    case "zh":
      return "cn";
    default:
      return "us";
  }
};

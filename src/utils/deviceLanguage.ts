import { NativeModules, Platform } from "react-native";
import * as RNLocalize from "react-native-localize";

export const getDeviceLanguage = (): string => {
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
  const FORCE_KOREAN = true;
  if (FORCE_KOREAN) {
    return true;
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

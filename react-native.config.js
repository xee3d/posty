module.exports = {
  dependencies: {
    'react-native-fbsdk-next': {
      platforms: {
        ios: null,
      },
    },
    '@react-native-google-signin/google-signin': {
      platforms: {
        ios: null,
      },
    },
    '@react-native-seoul/kakao-login': {
      platforms: {
        ios: null,
      },
    },
    '@react-native-seoul/naver-login': {
      platforms: {
        ios: null,
      },
    },
    'react-native-google-mobile-ads': {
      platforms: {
        ios: null,
      },
    },
    'react-native-iap': {
      platforms: {
        ios: null,
      },
    },
    // ReactCommon 모듈 중복 방지
    'ReactCommon': {
      platforms: {
        ios: null,
      },
    },
    'React-Codegen': {
      platforms: {
        ios: null,
      },
    },
    'FBReactNativeSpec': {
      platforms: {
        ios: null,
      },
    },
  },
  // New Architecture 완전 비활성화
  project: {
    ios: {
      sourceDir: './ios',
    },
    android: {},
  },
};
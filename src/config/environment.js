/**
 * 🌟 Posty 환경 설정 파일
 * 클론 후 즉시 실행 가능한 안정적인 구성을 제공합니다.
 * 
 * 기본값: Mock System (Firebase 없이 실행)
 * 선택사항: Firebase 활성화
 */

export const FEATURES = {
  // 🔥 Firebase 기능 제어 (기본: 비활성화)
  USE_FIREBASE: false,
  FIREBASE_READY: false,
  
  // 📱 기타 외부 서비스 제어
  USE_ADS: false,
  USE_IAP: false,
  USE_ANALYTICS: false,
  
  // 🛠️ 개발 도구
  DEBUG_MODE: __DEV__,
  ENABLE_DEBUGGING: __DEV__,
  
  // 🎯 Mock 시스템 설정
  MOCK_SYSTEM_ENABLED: true,
  MOCK_DATA_PERSISTENCE: true
};

export const ENVIRONMENT_CONFIG = {
  // 🏗️ 빌드 환경
  BUILD_MODE: FEATURES.USE_FIREBASE ? 'firebase' : 'mock',
  
  // 📊 성능 모니터링
  PERFORMANCE_MONITORING: false,
  
  // 🔐 보안 설정
  SECURE_MODE: !__DEV__,
  
  // 🌐 서버 설정
  API_BASE_URL: __DEV__ 
    ? 'http://localhost:3000' 
    : 'https://posty-api-server.vercel.app',
    
  // 📱 앱 설정
  APP_VERSION: '1.0.0',
  BUNDLE_ID: 'com.posty.app'
};

/**
 * 환경별 설정 검증
 */
export const validateEnvironment = () => {
  const errors = [];
  
  if (FEATURES.USE_FIREBASE && !FEATURES.FIREBASE_READY) {
    errors.push('Firebase is enabled but not properly configured');
  }
  
  if (FEATURES.USE_ADS && !FEATURES.USE_FIREBASE) {
    errors.push('Ads require Firebase to be enabled');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * 개발자를 위한 설정 정보
 */
export const SETUP_INFO = {
  currentMode: FEATURES.USE_FIREBASE ? 'Firebase Mode' : 'Mock Mode',
  quickStart: {
    clone: 'git clone [repo-url]',
    install: 'npm install',
    ios: 'cd ios && pod install && cd .. && npm run ios',
    android: 'npm run android'
  },
  enableFirebase: {
    command: 'npm run enable:firebase',
    requirements: ['GoogleService-Info.plist', 'google-services.json']
  },
  documentation: [
    'README.md - 전체 프로젝트 가이드',
    'QUICK_START.md - 빠른 시작 가이드',
    'FIREBASE_ENV_SETUP.md - Firebase 설정 가이드'
  ]
};

export default FEATURES;
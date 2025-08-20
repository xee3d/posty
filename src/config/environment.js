/**
 * 🌟 Posty 환경 설정 파일
 * 클론 후 즉시 실행 가능한 안정적인 구성을 제공합니다.
 */

export const FEATURES = {
  // 📱 외부 서비스 제어
  USE_ADS: true,               // AdMob - 피처드를 위해 활성화
  USE_IAP: true,               // In-App Purchases - 수익화 모델
  USE_ANALYTICS: true,         // Analytics - 사용자 분석
  
  // 🛠️ 개발 도구
  DEBUG_MODE: __DEV__,
  ENABLE_DEBUGGING: __DEV__,
  
  // 🎯 로컬 데이터 관리
  LOCAL_DATA_PERSISTENCE: true
};

export const ENVIRONMENT_CONFIG = {
  // 🏗️ 빌드 환경
  BUILD_MODE: 'local',
  
  // 📊 성능 모니터링
  PERFORMANCE_MONITORING: false,
  
  // 🔐 보안 설정
  SECURE_MODE: !__DEV__,
    
  // 📱 앱 설정
  APP_VERSION: '1.0.0',
  BUNDLE_ID: 'com.posty.app'
};

/**
 * 환경별 설정 검증
 */
export const validateEnvironment = () => {
  const errors = [];
  
  // 기본 검증 로직 (필요시 추가)
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * 개발자를 위한 설정 정보
 */
export const SETUP_INFO = {
  currentMode: 'Local Mode',
  quickStart: {
    clone: 'git clone [repo-url]',
    install: 'npm install',
    ios: 'cd ios && pod install && cd .. && npm run ios',
    android: 'npm run android'
  },
  documentation: [
    'README.md - 전체 프로젝트 가이드',
    'QUICK_START.md - 빠른 시작 가이드'
  ]
};

export default FEATURES;
// 프로덕션 환경 설정
export const PRODUCTION_CONFIG = {
  // 로깅 설정
  LOGGING: {
    ENABLE_CONSOLE_LOGS: false, // 프로덕션에서는 console.log 비활성화
    ENABLE_ERROR_REPORTING: true, // 에러 리포팅은 활성화
    SENTRY_DSN: "", // Sentry 설정 (필요시)
  },

  // 인증 설정
  AUTH: {
    ENABLE_MOCK_AUTH: false, // 프로덕션에서는 목업 비활성화
    REQUIRE_REAL_TOKENS: true, // 실제 토큰 필수
    FALLBACK_TO_MOCK: false, // 목업 fallback 비활성화
  },

  // API 설정
  API: {
    TIMEOUT: 30000, // 30초 타임아웃
    RETRY_COUNT: 3, // 재시도 횟수
    ENABLE_REQUEST_LOGGING: false, // 요청 로깅 비활성화
  },

  // 성능 설정
  PERFORMANCE: {
    ENABLE_PERFORMANCE_MONITORING: true,
    ENABLE_BATTERY_OPTIMIZATION: true,
    REDUCE_ANIMATIONS: false, // 사용자가 직접 설정하도록
  },

  // 보안 설정
  SECURITY: {
    HIDE_SENSITIVE_DATA: true, // 민감한 데이터 숨김
    VALIDATE_SSL: true, // SSL 검증
    SECURE_STORAGE: true, // 보안 스토리지 사용
  },
};

// 개발/프로덕션 환경 자동 감지
export const isDevelopment = __DEV__;
export const isProduction = !__DEV__;

// 환경별 설정 반환
export const getConfig = () => {
  if (isProduction) {
    return PRODUCTION_CONFIG;
  }

  // 개발 환경 설정
  return {
    ...PRODUCTION_CONFIG,
    LOGGING: {
      ...PRODUCTION_CONFIG.LOGGING,
      ENABLE_CONSOLE_LOGS: true,
    },
    AUTH: {
      ...PRODUCTION_CONFIG.AUTH,
      ENABLE_MOCK_AUTH: true,
      FALLBACK_TO_MOCK: true,
    },
    API: {
      ...PRODUCTION_CONFIG.API,
      ENABLE_REQUEST_LOGGING: true,
    },
  };
};

export default getConfig();

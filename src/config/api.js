// API 설정
const API_CONFIG = {
  // 서버 API 사용 여부 (문제 발생 시 false로 설정)
  USE_SERVER: true,  // 서버 사용
  
  // AI 콘텐츠 생성 서버
  BASE_URL: 'https://posty-ai-new.vercel.app',
  
  // 통합 API 서버 (트렌드, 인증, 기타)
  TRENDS_URL: 'https://posty-api.vercel.app/api',
  
  // API 엔드포인트
  ENDPOINTS: {
    HEALTH: '/api/health',
    GENERATE: '/api/generate',  // 정상 엔드포인트로 복구
    GENERATE_TEST: '/api/generate-test',
    TEST: '/api/test',
    TRENDS: '/trends', // 트렌드 엔드포인트
  },
  
  // 요청 타임아웃 (밀리초)
  TIMEOUT: 60000,  // 30초에서 60초로 증가
  
  // 앱 시크릿 (환경변수로 관리)
  APP_SECRET: process.env.POSTY_APP_SECRET || (__DEV__ 
    ? 'dev-posty-secret-key-2025' 
    : (() => {
        console.error('🚨 POSTY_APP_SECRET 환경변수가 프로덕션에서 설정되지 않았습니다!');
        throw new Error('Missing required environment variable: POSTY_APP_SECRET');
      })()
  ),
  
  // NewsAPI 키 (무료: newsapi.org에서 받을 수 있음)
  NEWS_API_KEY: process.env.NEWS_API_KEY || ''
};

// 개발 모드에서 로컬 서버 사용 (현재는 주석 처리)
// if (__DEV__) {
//   // Android 에뮬레이터에서는 10.0.2.2 사용
//   // iOS 시뮬레이터나 실제 기기에서는 컴퓨터의 IP 주소 사용
//   API_CONFIG.BASE_URL = 'http://10.0.2.2:3000/api'; // Android 에뮬레이터
//   // API_CONFIG.BASE_URL = 'http://192.168.x.x:3000/api'; // 실제 기기 (IP 주소 변경 필요)
// }

// API 헬퍼 함수
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// 트렌드 API URL 헬퍼 함수
export const getTrendsApiUrl = (endpoint) => {
  return `${API_CONFIG.TRENDS_URL}${endpoint}`;
};

export const getAuthHeader = () => {
  return {
    'Authorization': `Bearer ${API_CONFIG.APP_SECRET}`,
    'Content-Type': 'application/json',
    'User-Agent': 'Posty-App/1.0.0',
  };
};

// NewsAPI 키 가져오기 함수
export const getNewsApiKey = () => {
  return API_CONFIG.NEWS_API_KEY;
};

export default API_CONFIG;

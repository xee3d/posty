# Posty 서버 아키텍처 문서

## 개요
Posty 프로젝트는 마이크로서비스 아키텍처를 채택하여 두 개의 독립적인 서버로 운영됩니다.

## 서버 구성

### 1. posty-server-new (AI 콘텐츠 생성 서버)
- **URL**: https://posty-server-new.vercel.app
- **역할**: AI 기반 콘텐츠 생성 및 이미지 분석
- **주요 엔드포인트**:
  - `/api/generate` - AI 콘텐츠 생성
  - `/api/stream/generate` - 스트리밍 방식 콘텐츠 생성
  - `/api/health` - 서버 상태 확인
- **특징**:
  - maxDuration: 30초 (AI 처리 시간 고려)
  - OpenAI API 연동
  - 이미지 분석 기능
  - JSON 형식 응답

### 2. posty-api-v2 (트렌드 데이터 서버)
- **URL**: https://posty-api-v2.vercel.app
- **역할**: 실시간 트렌드 데이터 제공
- **주요 엔드포인트**:
  - `/api/trends` - 실시간 트렌드 데이터
  - `/api/health` - 서버 상태 확인
- **특징**:
  - maxDuration: 10초 (빠른 응답)
  - 외부 트렌드 API 연동
  - 캐싱 처리

## 앱 설정

### API 설정 파일 위치
`C:\Users\xee3d\Documents\Posty\src\config\api.js`

```javascript
const API_CONFIG = {
  // AI 생성 서버 (posty-server-new)
  BASE_URL: 'https://posty-server-new.vercel.app/api',
  
  // 트렌드 서버는 별도 관리 (필요시 추가)
  TRENDS_URL: 'https://posty-api-v2.vercel.app/api',
  
  ENDPOINTS: {
    HEALTH: '/health',
    GENERATE: '/generate',
    GENERATE_TEST: '/generate-test',
    TRENDS: '/trends'
  }
};
```

## 서버 관리

### Vercel 프로젝트
1. **posty-server-new**: AI 서버 (현재 사용 중)
2. **posty-api-v2**: 트렌드 서버
3. **posty-server**: 구 버전 (삭제 예정)

### 배포 방법
```bash
# AI 서버 배포
cd C:\Users\xee3d\Documents\Posty\posty-server
npx vercel --prod

# 트렌드 서버 배포
cd C:\Users\xee3d\Documents\Posty\posty-api-v2
npx vercel --prod
```

### Git 브랜치 관리
- 현재 브랜치: `recovery-8eb39c1`
- 커밋: `8eb39c1` (긴문장제거, 실시간트랜드API연동)

## 주의사항

### 1. API URL 혼동 방지
- AI 생성 요청은 반드시 `posty-server-new`로
- 트렌드 요청은 `posty-api-v2`로

### 2. JSON 파싱 에러
- 서버가 텍스트 대신 JSON 응답을 반환하는지 확인
- 에러 발생 시 서버 로그 확인

### 3. 환경변수
- 각 서버의 환경변수는 Vercel 대시보드에서 관리
- API 키, 시크릿 등 민감한 정보 포함

## 문제 해결

### JSON Parse Error 발생 시
1. API URL이 올바른지 확인
2. 서버 응답 형식 확인
3. `src/config/api.js` 파일의 BASE_URL 확인

### 404 Not Found 에러
1. 엔드포인트 경로 확인
2. 서버가 정상 배포되었는지 확인
3. Vercel 대시보드에서 로그 확인

## 향후 개선사항
1. API Gateway 도입 검토
2. 통합 모니터링 시스템 구축
3. 서버 간 통신 최적화

## 최근 해결된 이슈

### 2025.01.20 - 404 에러 해결
- **문제**: API 호출 시 404 NOT_FOUND 에러 발생
- **원인**: Vercel 배포 시 도메인 alias 설정 누락
- **해결**: 
  - `vercel alias` 명령으로 posty-server-new.vercel.app 도메인 설정
  - 환경 변수 확인 및 재배포
  - API 엔드포인트 정상 작동 확인

---
*최종 업데이트: 2025년 1월 20일*
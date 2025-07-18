# Posty API v2

실시간 트렌드 데이터를 제공하는 Posty API 서버입니다.

## 설치 방법

1. **패키지 설치**
```bash
npm install
```

2. **Vercel CLI 설치** (전역 설치)
```bash
npm install -g vercel
```

3. **로컬 개발 서버 실행**
```bash
vercel dev
```

4. **프로덕션 배포**
```bash
vercel --prod
```

## API 엔드포인트

### GET /api/health
서버 상태 확인

### GET /api/trends
실시간 트렌드 데이터 조회

응답 예시:
```json
{
  "trends": {
    "naver": [...],
    "google": [...],
    "news": [...],
    "social": [...],
    "timestamp": "2024-01-01T00:00:00.000Z"
  },
  "cached": false
}
```

## 데이터 소스

- Reddit Korea 인기 게시물
- Wikipedia 한국어 인기 문서
- 시간대별 동적 트렌드
- 계절별 트렌드

## 캐시

- 5분간 캐시 유지
- 캐시 적중 시 `cached: true` 반환

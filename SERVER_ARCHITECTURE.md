# Posty 서버 아키텍처 문서

## 개요
Posty 프로젝트는 마이크로서비스 아키텍처를 채택하여 두 개의 독립적인 서버로 운영됩니다.

## 서버 구성

### 1. posty-ai-server (AI 콘텐츠 생성 서버)
- **URL**: https://posty-ai.vercel.app
- **역할**: AI 기반 콘텐츠 생성 및 이미지 분석
- **주요 엔드포인트**:
  - `/api/health` - 서버 상태 확인
  - `/api/generate` - AI 콘텐츠 생성
  - `/api/generate-test` - 테스트용 엔드포인트
- **특징**:
  - maxDuration: 30초 (AI 처리 시간 고려)
  - OpenAI API 연동
  - 이미지 분석 기능
  - JSON 형식 응답

### 2. posty-api-server (통합 API 서버)
- **URL**: https://posty-api.vercel.app
- **역할**: 소셜 로그인 인증 및 실시간 트렌드 데이터 제공
- **주요 엔드포인트**:
  - `/api/auth/custom-token` - Firebase Custom Token 생성
  - `/api/trends` - 실시간 트렌드 데이터
  - `/api/health` - 서버 상태 확인
- **특징**:
  - Firebase Admin SDK 연동
  - 소셜 로그인 인증 처리 (Google, Kakao, Naver, Facebook)
  - 트렌드 데이터 5분 캐싱
  - CORS 설정

## 배포 관리

### 배포 프로세스
```bash
# 1. 코드 수정
# 2. 커밋 및 푸시
git add .
git commit -m "feat: 새로운 기능"
git push

# 3. API 서버 배포 (posty-api-server)
deploy-api-server.bat

# 4. 상태 확인
curl https://posty-api.vercel.app/api/health
curl https://posty-ai.vercel.app/api/health
```

### 수동 배포
```bash
# posty-api-server 배포
cd posty-api-server && vercel --prod

# posty-ai-server 배포
cd posty-ai-server && vercel --prod
```

## 환경 변수

### Vercel 대시보드에서 관리
각 프로젝트의 Settings > Environment Variables에서 설정:

#### posty-ai-server
- `OPENAI_API_KEY`: OpenAI API 키
- `APP_SECRET`: 앱 인증 시크릿

#### posty-api-server
- `FIREBASE_PROJECT_ID`: Firebase 프로젝트 ID
- `FIREBASE_CLIENT_EMAIL`: Firebase 서비스 계정 이메일
- `FIREBASE_PRIVATE_KEY`: Firebase 서비스 계정 키
- `NEWS_API_KEY`: NewsAPI 키 (선택사항)

## 모니터링

### 서버 상태 확인
```bash
# 빠른 상태 확인
verify-deployment.bat

# 실시간 모니터링
monitor-servers-live.bat
```

### 로그 확인
- Vercel 대시보드 > Functions > Logs
- 실시간 로그 스트리밍 가능

## 문제 해결

### 일반적인 문제
1. **404 에러**: 보통 배포 문제. `deploy-all.bat` 실행
2. **타임아웃**: AI 처리가 30초 초과 시 발생
3. **CORS 에러**: vercel.json의 headers 설정 확인

### 해결 완료된 이슈
- ✅ 서버 404 에러 (2025.01.20)
- ✅ Git 자동 배포 설정 (2025.01.20)
- ✅ Root Directory 설정 (2025.01.20)

## API 사용 예시

### AI 콘텐츠 생성
```javascript
const response = await fetch('https://posty-ai.vercel.app/api/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_APP_SECRET'
  },
  body: JSON.stringify({
    prompt: '오늘 날씨가 좋네요',
    tone: 'casual',
    platform: 'instagram'
  })
});
```

### 소셜 로그인 인증
```javascript
const response = await fetch('https://posty-api.vercel.app/api/auth/custom-token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    provider: 'kakao',
    profile: {
      id: 'user_id',
      email: 'user@example.com',
      name: 'User Name'
    }
  })
});
```

### 트렌드 데이터 조회
```javascript
const response = await fetch('https://posty-api.vercel.app/api/trends');
const data = await response.json();
// data.trends 에 트렌드 정보 포함
```

## 보안
- API 키는 환경 변수로 관리
- APP_SECRET을 통한 인증
- CORS 설정으로 허용된 도메인만 접근

## 성능 최적화
- 트렌드 데이터 4시간 캐싱
- Vercel Edge Network 활용
- 병렬 API 호출 처리

---
*최종 업데이트: 2025년 1월 23일*

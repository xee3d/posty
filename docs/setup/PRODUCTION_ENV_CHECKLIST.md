# 🚀 Posty 프로덕션 환경변수 체크리스트

## ⚠️ 출시 전 필수 설정 항목

### 1. Vercel 환경변수 설정 (필수)

Vercel 대시보드 → 프로젝트 → Settings → Environment Variables 에서 설정:

#### 🔐 보안 키 (최우선)
```bash
JWT_SECRET=강력한_랜덤_문자열_64자리_이상
POSTY_APP_SECRET=강력한_랜덤_문자열_32자리_이상
CRON_SECRET=크론작업_보안키
```

#### 🤖 AI 서비스 (핵심 기능)
```bash
OPENAI_API_KEY=sk-proj-실제_OpenAI_API_키
HUGGING_FACE_API_KEY=hf_실제_HuggingFace_키
```

#### 🔑 소셜 로그인 (사용자 인증)
```bash
GOOGLE_WEB_CLIENT_ID=실제_구글_클라이언트_ID.apps.googleusercontent.com
NAVER_CONSUMER_KEY=실제_네이버_컨슈머_키
NAVER_CONSUMER_SECRET=실제_네이버_컨슈머_시크릿
KAKAO_APP_KEY=실제_카카오_앱_키
```

#### 🌐 서버 설정
```bash
NODE_ENV=production
ENVIRONMENT=production
API_URL=https://posty-api.vercel.app
VERCEL_URL=https://posty-api.vercel.app
DEBUG_MODE=false
LOG_LEVEL=error
APP_VERSION=1.0.0
```

#### 📱 푸시 알림 (선택사항)
```bash
ONESIGNAL_APP_ID=OneSignal_앱_ID
ONESIGNAL_REST_API_KEY=OneSignal_REST_키
```

#### 📰 뉴스 API (선택사항)
```bash
NEWS_API_KEY=NewsAPI_키_newsapi.org에서_발급
```

#### 📝 Notion API (선택사항)
```bash
NOTION_API_KEY=Notion_통합_토큰
```

---

## 📱 AdMob 설정 (필수)

### 1. AdMob 콘솔에서 앱 등록
- Android 패키지명: `com.posty.app` (실제 패키지명으로 교체)
- iOS 번들 ID: `com.posty.app` (실제 번들 ID로 교체)

### 2. 실제 광고 ID 발급 및 교체

**app.json 업데이트:**
```json
{
  "react-native-google-mobile-ads": {
    "android_app_id": "ca-app-pub-실제앱ID~Android앱ID",
    "ios_app_id": "ca-app-pub-실제앱ID~iOS앱ID"
  }
}
```

**rewardAdService.ts 업데이트:**
```typescript
private readonly adUnitId = __DEV__
  ? TestIds.REWARDED
  : 'ca-app-pub-실제앱ID/실제리워드광고단위ID';
```

---

## 🔍 검증 방법

### 1. Vercel 환경변수 확인
```bash
# Vercel CLI로 환경변수 확인
npx vercel env ls

# API 엔드포인트 테스트
curl https://posty-api.vercel.app/api/notifications/test
```

### 2. 로컬 환경변수 테스트
```bash
# .env 파일에 실제 값 설정 후 테스트
npm run start:clean
```

### 3. 소셜 로그인 테스트
- [ ] Google 로그인 동작 확인
- [ ] Naver 로그인 동작 확인
- [ ] Kakao 로그인 동작 확인

### 4. AI 기능 테스트
- [ ] OpenAI API 콘텐츠 생성 확인
- [ ] HuggingFace API 동작 확인

---

## ⚡ 보안 주의사항

### 절대 하지 말 것
- ❌ 환경변수를 Git에 커밋
- ❌ 하드코딩된 API 키 사용
- ❌ 약한 JWT 시크릿 사용
- ❌ 개발용 키를 프로덕션에서 사용

### 권장사항
- ✅ 강력한 랜덤 문자열 생성: `openssl rand -base64 64`
- ✅ 환경별 다른 키 사용
- ✅ 정기적인 키 로테이션
- ✅ API 키 사용량 모니터링

---

## 🚀 출시 직전 최종 체크

### 필수 확인사항
- [ ] 모든 Vercel 환경변수 설정 완료
- [ ] AdMob 실제 ID로 교체 완료
- [ ] 소셜 로그인 3개 모두 동작 확인
- [ ] AI 콘텐츠 생성 기능 동작 확인
- [ ] API 서버 응답 정상 확인

### 출시 후 모니터링
- [ ] Vercel 로그 모니터링
- [ ] AdMob 수익 대시보드 확인
- [ ] 사용자 피드백 모니터링
- [ ] API 사용량 추적

---

**생성일**: 2025-01-23
**상태**: 출시 준비 중
**다음 업데이트**: 출시 후 첫 주
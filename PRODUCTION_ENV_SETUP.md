# 🔧 Posty 프로덕션 환경변수 설정 가이드

## 📋 필수 환경변수 목록

### 🔐 보안 및 인증
```bash
# JWT 인증 (필수 - 강력한 시크릿 생성 필요)
JWT_SECRET="your-super-secure-jwt-secret-min-32-chars"

# 앱 보안 토큰 (API 접근 제어)
APP_SECRET="your-app-secret-key"

# Vercel 접근 토큰 (서버 관리용)
VERCEL_TOKEN="your-vercel-access-token"
```

### 🤖 AI 서비스
```bash
# OpenAI API (콘텐츠 생성 핵심 기능)
OPENAI_API_KEY="sk-proj-your-openai-api-key"

# Hugging Face API (무료 AI 서비스)
HF_API_KEY="hf_your-huggingface-api-key"
```

### 🔗 소셜 로그인 OAuth
```bash
# 구글 로그인
GOOGLE_WEB_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"

# 네이버 로그인  
NAVER_CONSUMER_KEY="your-naver-consumer-key"
NAVER_CONSUMER_SECRET="your-naver-consumer-secret"

# 카카오 로그인
KAKAO_APP_KEY="your-kakao-app-key"

# 페이스북 로그인
FACEBOOK_APP_ID="your-facebook-app-id"
FACEBOOK_APP_SECRET="your-facebook-app-secret"
FACEBOOK_CLIENT_TOKEN="your-facebook-client-token"
```

### 📱 푸시 알림
```bash
# OneSignal 푸시 알림 서비스
ONESIGNAL_APP_ID="your-onesignal-app-id"
ONESIGNAL_REST_API_KEY="your-onesignal-rest-api-key"

# 크론 작업 보안
CRON_SECRET="your-cron-job-secret"
```

### 🌐 서버 설정
```bash
# 환경 구분
NODE_ENV="production"
ENVIRONMENT="production"

# API 서버 URL
API_URL="https://posty-api.vercel.app"
VERCEL_URL="https://posty-api.vercel.app"

# 디버깅 설정
DEBUG_MODE="false"
LOG_LEVEL="error"

# 앱 버전
APP_VERSION="1.0.0"
```

---

## 🚀 Vercel 환경변수 설정 단계

### 1. Vercel 대시보드 접속
```bash
# Vercel CLI 로그인 (필요시)
npx vercel login

# 프로젝트 연결 확인
npx vercel --version
```

### 2. 환경변수 설정
Vercel 대시보드 → 프로젝트 → Settings → Environment Variables

**중요한 환경변수 우선순위**:
1. `JWT_SECRET` (보안 핵심)
2. `OPENAI_API_KEY` (AI 기능 핵심)
3. `APP_SECRET` (API 보안)
4. OAuth 키들 (소셜 로그인)

### 3. 환경변수 검증 스크립트
```bash
# API 상태 확인
curl https://posty-api.vercel.app/api/notifications/test

# 환경변수 로드 테스트
curl https://posty-api.vercel.app/api/generate -X POST \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

---

## 📱 React Native 환경변수 설정

### 1. 로컬 개발 환경
```bash
# .env 파일 생성 (이미 .gitignore에 포함됨)
cp .env.example .env

# 실제 값으로 교체
nano .env
```

### 2. 프로덕션 빌드 설정

**Android (android/gradle.properties)**:
```properties
# 키스토어 정보는 CI/CD 환경변수로 설정
# MYAPP_RELEASE_STORE_PASSWORD=환경변수로_설정
# MYAPP_RELEASE_KEY_PASSWORD=환경변수로_설정
```

**iOS (환경변수 주입)**:
```bash
# Xcode 빌드 시 환경변수 자동 주입
# Info.plist에서 $(VARIABLE_NAME) 형태로 참조
```

---

## ⚠️ 보안 주의사항

### 절대 하지 말 것
- ❌ .env 파일을 Git에 커밋
- ❌ 하드코딩된 시크릿을 소스코드에 포함
- ❌ 약한 JWT 시크릿 사용
- ❌ 프로덕션 키를 개발 환경에서 사용

### 권장사항
- ✅ 환경별 다른 키 사용 (dev/staging/prod)
- ✅ 정기적인 키 로테이션
- ✅ 최소 권한 원칙 적용
- ✅ 모니터링 및 로깅 설정

---

## 🔍 환경변수 검증 체크리스트

### Vercel 서버 검증
- [ ] Vercel 대시보드에서 모든 필수 환경변수 설정 확인
- [ ] API 엔드포인트 응답 테스트
- [ ] 크론 작업 동작 확인
- [ ] 로그에서 환경변수 로드 상태 확인

### 모바일 앱 검증  
- [ ] .env 파일에 모든 키 설정
- [ ] React Native 환경변수 로드 테스트
- [ ] OAuth 로그인 기능 테스트
- [ ] AI 콘텐츠 생성 기능 테스트

### 보안 검증
- [ ] 하드코딩된 시크릿 완전 제거 확인
- [ ] Git 히스토리에서 민감 정보 제거
- [ ] 환경변수 권한 설정 확인
- [ ] 로그에서 시크릿 노출 여부 확인

---

*📅 생성일: 2025-09-02*  
*🔧 설정 도구: Claude Code 환경 설정*
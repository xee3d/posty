# Posty 프로젝트 아키텍처

## 1. 전체 구조 (System Architecture)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           React Native App                               │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐        │
│  │  AIWriteScreen   │  │ SettingsScreen  │  │  TrendScreen    │        │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘        │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────┐      │
│  │                      Redux Store                              │      │
│  │                  (userSlice, tokenSlice)                     │      │
│  └─────────────────────────────────────────────────────────────┘      │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────┐      │
│  │                         Firebase                              │      │
│  │                    (Auth & Firestore)                        │      │
│  └─────────────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            API Gateway                                   │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐           ┌─────────────────┐                     │
│  │ AIServiceWrapper │           │ serverAIService │                     │
│  └─────────────────┘           └─────────────────┘                     │
└─────────────────────────────────────────────────────────────────────────┘
                     │                              │
                     ▼                              ▼
┌─────────────────────────────┐    ┌─────────────────────────────────────┐
│    AI Content Server         │    │       Trend Data Server             │
│ posty-server-new.vercel.app  │    │    posty-api-v2.vercel.app         │
├─────────────────────────────┤    ├─────────────────────────────────────┤
│  • /api/generate            │    │  • /api/trends                      │
│  • /api/health              │    │  • /api/health                      │
│  • /api/generate-test       │    └─────────────────────────────────────┘
└─────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           OpenAI API                                     │
│                          (GPT-4o-mini)                                   │
└─────────────────────────────────────────────────────────────────────────┘
```

## 2. 데이터 플로우 (Data Flow)

### 2.1 AI 콘텐츠 생성 플로우

```
사용자 입력 → AIServiceWrapper → Vercel Server → OpenAI API
    📱              🔄                🖥️            🤖

1. 사용자가 프롬프트 입력 (톤, 길이 선택)
2. AIServiceWrapper가 요청 검증 및 플랫폼별 최적화
3. Vercel 서버가 OpenAI API 호출 (보안 키 관리)
4. GPT-4o-mini가 콘텐츠 생성 후 반환
```

### 2.2 인증 및 데이터 동기화

```
Google Auth → Redux Store ↔️ Firestore
    🔐           🗄️           ☁️

• Firebase Auth로 로그인 → Redux store 업데이트
• Firestore 실시간 동기화 (구독 정보, 토큰, 설정)
• 오프라인 지원 및 캐싱
```

### 2.3 토큰 시스템

| 플랜 | 아이콘 | 토큰 제한 |
|------|--------|-----------|
| FREE | 🆓 | 10개/일 |
| STARTER | ⭐ | 200개/월 |
| PREMIUM | 💎 | 500개/월 |
| PRO | 👑 | 무제한 |

## 3. 기술 스택 (Tech Stack)

### Frontend
- ⚛️ React Native 0.74
- 🗃️ Redux Toolkit
- 🔥 Firebase SDK
- 📱 React Navigation
- 🎨 React Native Vector Icons

### Backend
- ▲ Vercel Functions
- 🟢 Node.js
- 🔒 Environment Variables
- ⚡ Serverless Architecture
- 🌐 CORS Headers

### Services
- 🤖 OpenAI API (GPT-4o-mini)
- 🔥 Firebase Authentication
- ☁️ Firestore Database
- 📊 Trend APIs
- 💳 In-App Purchase

## 4. 주요 특징

### 보안
- API 키는 서버에서만 관리
- 클라이언트는 서버를 통해서만 OpenAI API 접근
- Firebase Auth로 사용자 인증

### 확장성
- 마이크로서비스 아키텍처
- AI 서버와 트렌드 서버 분리
- Serverless 환경으로 자동 스케일링

### 실시간 동기화
- Firestore를 통한 실시간 데이터 동기화
- Redux 미들웨어로 자동 상태 관리
- 오프라인 지원

### 성능 최적화
- 토큰 사용량 실시간 추적
- 캐싱을 통한 API 호출 최소화
- 플랫폼별 콘텐츠 최적화

## 5. API 엔드포인트

### AI Content Server
- `POST /api/generate` - AI 콘텐츠 생성
- `GET /api/health` - 서버 상태 확인
- `GET /api/generate-test` - API 테스트

### Trend Data Server
- `GET /api/trends` - 실시간 트렌드 데이터
- `GET /api/health` - 서버 상태 확인

## 6. 환경 변수

### 클라이언트 (.env)
```
# Firebase 설정
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=

# API 설정
APP_SECRET=posty-secret-key-change-this-in-production
```

### 서버 (Vercel Environment Variables)
```
OPENAI_API_KEY=your_openai_api_key
APP_SECRET=posty-secret-key-change-this-in-production
```

---

*최종 업데이트: 2025년 1월 20일*

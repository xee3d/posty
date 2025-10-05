# Posty - AI 기반 SNS 콘텐츠 생성 앱

<div align="center">
  <img src="./images/app-icon.png" alt="Posty Logo" width="120" height="120">
  
  **창의적인 SNS 콘텐츠를 AI로 쉽고 빠르게**
  
  [![React Native](https://img.shields.io/badge/React%20Native-0.74.5-61DAFB?logo=react)](https://reactnative.dev/)
  [![RN CLI](https://img.shields.io/badge/RN%20CLI-0.73.10-61DAFB?logo=react)](https://github.com/react-native-community/cli)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0.4-3178C6?logo=typescript)](https://www.typescriptlang.org/)
  [![Firebase](https://img.shields.io/badge/Firebase%20Auth-22.4.0-FFCA28?logo=firebase)](https://firebase.google.com/)
  [![License](https://img.shields.io/badge/License-Private-red)](./LICENSE)
</div>

## 📱 개요

Posty는 AI(GPT-4o-mini, Gemini 2.5 Flash Lite)를 활용하여 매력적인 SNS 콘텐츠를 생성하는 모바일 애플리케이션입니다.
다양한 AI 모델을 선택할 수 있으며, 트렌드를 반영한 창의적인 콘텐츠를 쉽고 빠르게 만들어 Instagram, Facebook, X(Twitter) 등에 공유할 수 있습니다.

**📅 개발 기간**: 2025년 7월 4일 ~ 현재 (약 1개월)  
**🚀 현재 상태**: Firebase Auth + 로컬 데이터 + Mock 시스템으로 완전 동작

## ✨ 주요 기능

### 🤖 AI 콘텐츠 생성

- **AI 모델 선택**: GPT-4o-mini, Gemini 2.5 Flash Lite 중 선택 가능
- **텍스트 생성**: 주제만 입력하면 AI가 창의적인 콘텐츠 작성
- **이미지 분석**: 사진을 업로드하면 AI가 분석하여 관련 텍스트 생성
- **문장 다듬기**: 기존 텍스트를 더 매력적으로 개선
- **9가지 톤**: 캐주얼, 전문적, 유머러스, 감성적, 격려하는, 정보 전달, 스토리텔링, 시적인, 대화체
- **3가지 길이**: 짧게(50자), 보통(100자), 길게(200자)

### 📱 플랫폼 최적화

- **Instagram**: 해시태그 자동 생성, 감성적인 톤
- **Facebook**: 스토리텔링에 최적화된 긴 텍스트
- **X(Twitter)**: 280자 제한에 맞춘 간결한 메시지

### 🚀 사운드 & 진동 피드백

- 버튼 터치, 생성 완료, 복사 등 주요 액션에 사운드 효과
- 햅틱 피드백으로 더 나은 사용자 경험

### 💎 구독 시스템 (2025년 10월 업데이트)

#### 구독 플랜

| 플랜    | 가격       | 토큰       | 광고 제거 | AI 모델                  |
| ------- | ---------- | ---------- | --------- | ------------------------ |
| **FREE** | 무료       | 일 10개    | ❌        | GPT-4o mini, Gemini 1.5  |
| **PRO**  | ₩15,000/월 | 무제한     | ✅        | GPT-4o, Gemini 2.5 Flash |

#### 토큰 패키지 (일회성 구매)

| 패키지 | 토큰  | 가격    | 보너스 |
| ------ | ----- | ------- | ------ |
| 소량   | 100개 | ₩3,000  | -      |
| 중량   | 200개 | ₩6,000  | +20개  |
| 대량   | 300개 | ₩9,000  | +30개  |

### 📈 실시간 트렌드

- 네이버 실시간 검색어
- 구글 트렌드
- 뉴스 키워드
- SNS 인기 주제

## 🛠 기술 스택

### Frontend

- **Framework**: React Native 0.74.5
- **Language**: TypeScript 5.0.4
- **State**: Redux Toolkit + React Redux
- **Navigation**: React Navigation 6.x
- **Animation**: React Native Reanimated 3
- **UI**: Custom Theme System (Light/Dark)

### Backend & Services

- **AI Server**: https://posty-ai.vercel.app (OpenAI GPT-4o-mini)
- **API Server**: https://posty-api.vercel.app (트렌드, 인증)
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth (Google, Kakao, Naver)
- **Payment**: React Native IAP
- **Analytics**: Firebase Analytics

## 🚀 시작하기

### 필수 요구사항

- Node.js 18+ (권장: 18.20.4)
- npm 8.0.0+ (권장: 10.7.0)
- **React Native CLI 0.73.10** (중요: 이 버전으로 테스트됨)
- React Native 개발 환경 ([설정 가이드](https://reactnative.dev/docs/environment-setup))
- Android Studio / Xcode
- Firebase 프로젝트 (Auth만 사용)

### 설치 및 실행

```bash
# 프로젝트 클론
git clone https://github.com/xee3d/Posty.git
cd Posty

# 의존성 설치
npm install

# iOS 의존성 설치 (Mac only)
cd ios && pod install && cd ..

# CLI 버전 확인 (중요: 0.73.10 권장)
npx react-native --version

# CLI 버전이 다르면 캐시 클리어
npx clear-npx-cache

# Metro 시작 (테스트된 CLI 버전 사용)
npm start
# 또는 npx react-native@0.73.10 start --reset-cache

# Android 실행
npm run android
# 또는 npx react-native@0.73.10 run-android

# iOS 실행 (Mac only)
npm run ios
# 또는 npm run ios:simulator (iPhone 16 Pro로 실행)
```

### 환경 변수 설정

`.env` 파일 생성:

```env
# AI API Keys
OPENAI_API_KEY=your_openai_api_key
GOOGLE_API_KEY=your_google_ai_studio_api_key

# App Secret
APP_SECRET=your_app_secret

# Google AdMob
GOOGLE_ADMOB_APP_ID=your_admob_app_id
GOOGLE_ADMOB_BANNER_ID=your_banner_id
GOOGLE_ADMOB_INTERSTITIAL_ID=your_interstitial_id
GOOGLE_ADMOB_REWARDED_ID=your_rewarded_id

# Social Login
GOOGLE_WEB_CLIENT_ID=your_google_client_id
NAVER_CONSUMER_KEY=your_naver_key
NAVER_CONSUMER_SECRET=your_naver_secret
KAKAO_APP_KEY=your_kakao_key
```

**Vercel 환경변수 설정 (배포용):**
- `OPENAI_API_KEY`: OpenAI API 키
- `GOOGLE_API_KEY`: Google AI Studio API 키
- `APP_SECRET`: 앱 보안을 위한 비밀 키

## 📁 프로젝트 구조

```
Posty/
├── src/
│   ├── components/        # 재사용 가능한 컴포넌트
│   ├── screens/          # 화면 컴포넌트
│   ├── services/         # API 및 서비스 로직
│   ├── store/            # Redux 상태 관리
│   ├── hooks/            # 커스텀 React 훅
│   ├── utils/            # 유틸리티 함수
│   └── types/            # TypeScript 타입 정의
├── posty-ai-server/      # AI 콘텐츠 생성 서버
├── posty-api-server/     # 통합 API 서버
├── android/              # Android 네이티브 코드
├── ios/                  # iOS 네이티브 코드
└── docs/                 # 프로젝트 문서
```

## 🚢 배포

### 자동 배포 (권장)

Git push 시 Vercel에 자동 배포:

```bash
git add .
git commit -m "feat: 새로운 기능"
git push
```

### 프로덕션 빌드

#### Android

```bash
cd android
./gradlew bundleRelease
# 출력: android/app/build/outputs/bundle/release/app-release.aab
```

#### iOS

```bash
cd ios
xcodebuild -workspace Posty.xcworkspace -scheme Posty -configuration Release
```

## 📱 유틸리티 스크립트

### 개발 실행 (검증된 CLI 버전)

- `npx react-native@0.73.10 start --reset-cache` - Metro 캐시 클리어 후 시작
- `npx react-native@0.73.10 run-ios` - iOS 실행
- `npx react-native@0.73.10 run-android` - Android 실행

### 배포 스크립트

- `deploy-all.bat` - 모든 서버 배포
- `verify-deployment.bat` - 배포 상태 확인
- `fresh-deploy.bat` - 클린 빌드 및 실행

### 버전 관리

- `npx react-native --version` - CLI 버전 확인
- `npx clear-npx-cache` - NPX 캐시 클리어

## 📈 최근 업데이트

### 2025년 8월

- ✅ Firebase Auth 전용 구성 완료 (8월 5일)
- ✅ React Native CLI 0.73.10 버전 고정 및 문서화
- ✅ iOS 빌드 환경 최적화 (C++20, GNU C 확장)
- ✅ Mock 시스템으로 의존성 문제 완전 해결
- ✅ 버전 호환성 가이드 신규 추가

### 2025년 7월

- ✅ 프로젝트 개발 시작 (7월 4일)
- ✅ React Native 0.74.5 업그레이드
- ✅ 구독 시스템 개편 (하이브리드 토큰 모델)
- ✅ 사운드/진동 피드백 시스템 구현
- ✅ 성능 최적화 (앱 시작 시간 15% 개선)

전체 변경 이력은 [CHANGELOG.md](./CHANGELOG.md) 참조

## 📚 문서

- **[버전 호환성 가이드](./docs/VERSION_COMPATIBILITY.md)** ⭐ (필수 읽기)
- [프로젝트 종합 문서](./PROJECT_COMPREHENSIVE_DOC.md)
- [서버 아키텍처](./SERVER_ARCHITECTURE.md)
- [구독 시스템 가이드](./SUBSCRIPTION_UPDATE.md)
- [빠른 시작 가이드](./QUICK_START.md)
- [환경 설정 가이드](./docs/setup/ENV_SETUP_GUIDE.md)
- [배포 문제 해결](./DEPLOYMENT_TROUBLESHOOTING.md)

## 🤝 기여하기

이슈 및 풀 리퀘스트는 언제나 환영합니다!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 Private 저장소로 관리되고 있습니다.

## 👥 연락처

- **GitHub**: [@xee3d](https://github.com/xee3d)
- **Project Link**: [https://github.com/xee3d/Posty](https://github.com/xee3d/Posty)

---

<div align="center">
  Made with ❤️ by Posty Team
  
  *최종 업데이트: 2025년 8월 5일*
</div>

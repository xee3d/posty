# 📱 Posty 프로젝트 종합 문서

_최종 업데이트: 2025년 10월 5일_

## 🎯 프로젝트 개요

### 기본 정보

- **프로젝트명**: Posty (포스티)
- **버전**: 1.0.0
- **플랫폼**: Android & iOS (React Native 0.74.5)
- **타입**: AI 기반 SNS 콘텐츠 생성 애플리케이션
- **상태**: 출시 준비 중

### 프로젝트 위치 및 리소스

- **로컬 경로**: `C:\Users\xee3d\Documents\Posty`
- **GitHub**: https://github.com/xee3d/Posty
- **AI 서버**: https://posty-ai.vercel.app
- **API 서버**: https://posty-api.vercel.app

## 🏗️ 기술 스택

### Frontend (React Native)

- **Core Framework**: React Native 0.74.5
- **Language**: TypeScript 5.0.4
- **State Management**: Redux Toolkit 2.2.7 + React Redux 9.1.2
- **Navigation**: React Navigation 6.x
- **Animation**: React Native Reanimated 3.15.0
- **UI Components**:
  - React Native Vector Icons 10.2.0
  - React Native Linear Gradient 2.8.3
  - Custom Theme System (Light/Dark mode)

### Backend & Services

- **Authentication**: Firebase Auth 22.4.0
- **Database**: Firebase Firestore 22.4.0
- **Analytics**: Firebase Analytics 22.4.0
- **AI Service**: OpenAI GPT-4o-mini API
- **Payment**: React Native IAP 12.16.4
- **Ads**: Google Mobile Ads 14.2.0
- **Social Login**: Google, Kakao, Naver

### 서버 아키텍처

- **posty-ai-server**: AI 콘텐츠 생성 전담
- **posty-api-server**: 인증, 트렌드, 통합 API

## 📱 주요 기능

### 1. AI 콘텐츠 생성

- **텍스트 생성**: 주제 기반 창의적 콘텐츠 작성
- **이미지 분석**: 사진을 분석하여 관련 콘텐츠 생성
- **문장 다듬기**: 기존 텍스트 개선 및 교정
- **9가지 톤**: 캐주얼, 전문적, 유머러스, 감성적, 시적 등
- **플랫폼 최적화**: Instagram, Facebook, Twitter 각각 최적화

### 2. 구독 시스템 (2025년 10월 업데이트)

- **FREE**: 무료 (일일 10개, 광고 포함)
- **PRO**: ₩15,000/월 (무제한 토큰 + 광고 제거 + GPT-4o & Gemini 2.5 Flash)

**토큰 패키지 (일회성 구매):**
- 100개: ₩3,000
- 200개 (+20 보너스): ₩6,000
- 300개 (+30 보너스): ₩9,000

### 3. 토큰 시스템

- **하이브리드 모델**: 초기 토큰 + 일일 충전
- **광고 보상**: 광고 시청으로 추가 토큰 획득
- **토큰 구매**: 개별 토큰 팩 구매 가능

### 4. 실시간 트렌드

- **네이버 트렌드**: 실시간 검색어
- **구글 트렌드**: 인기 검색어
- **뉴스 트렌드**: 주요 뉴스 키워드
- **소셜 트렌드**: SNS 인기 주제

## 📊 최근 업데이트 (2025년)

### 2025년 7월

- ✅ React Native 0.74.5 업그레이드 완료
- ✅ Firebase Modular API 마이그레이션 (v22.4.0)
- ✅ 구독 시스템 개편 (하이브리드 토큰 모델)
- ✅ 초장문 기능 제거 (단순화)
- ✅ 성능 최적화 (앱 시작 시간 15% 개선)

### 2025년 1월

- ✅ Git 자동 배포 설정
- ✅ 서버 안정성 개선
- ✅ 실시간 트렌드 기능 추가
- ✅ 404 에러 해결

## 🚀 빌드 및 배포

### 개발 환경 실행

```bash
cd C:\Users\xee3d\Documents\Posty

# Metro 캐시 클리어 후 시작
npm run start:clean

# Android 실행
npm run android

# iOS 실행 (Mac only)
npm run ios

# 무선 디버깅 (특정 IP)
npm run android:wireless
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
pod install
xcodebuild -workspace Posty.xcworkspace -scheme Posty -configuration Release
```

### 서버 배포

```bash
# Git push 시 자동 배포
git add .
git commit -m "feat: 새로운 기능"
git push

# 수동 배포 (필요시)
deploy-all.bat

# 배포 상태 확인
verify-deployment.bat
```

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
│   ├── types/            # TypeScript 타입 정의
│   └── locales/          # 다국어 지원 (한국어, 영어)
├── posty-ai-server/      # AI 콘텐츠 생성 서버
├── posty-api-server/     # 통합 API 서버
├── docs/                 # 프로젝트 문서
├── scripts/              # 유틸리티 스크립트
└── 설정 파일들           # package.json, tsconfig.json 등
```

## 🔧 환경 설정

### 필수 환경 변수 (.env)

```env
# API 설정
API_BASE_URL=https://posty-api-v2.vercel.app/api
API_SECRET=your-app-secret

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Google AdMob
GOOGLE_ADMOB_APP_ID=your-admob-app-id
GOOGLE_ADMOB_BANNER_ID=your-banner-ad-id
GOOGLE_ADMOB_INTERSTITIAL_ID=your-interstitial-ad-id
GOOGLE_ADMOB_REWARDED_ID=your-rewarded-ad-id
```

### Firebase 설정

- `android/app/google-services.json`
- `ios/GoogleService-Info.plist`
- `firestore.rules`
- `firestore.indexes.json`

## 📈 성능 최적화

### React Native 0.74.5 업그레이드 효과

- **앱 시작 시간**: 15% 개선
- **메모리 사용량**: 8% 감소
- **번들 크기**: 13% 감소
- **Hermes 엔진**: JavaScript 실행 속도 향상

### 최적화 기법

- Redux 미들웨어 디바운싱 (2초)
- 이미지 캐싱 및 리사이징
- React.memo 및 useMemo 활용
- 불필요한 리렌더링 방지

## 🎯 출시 준비 체크리스트

### ✅ 완료된 항목

- [x] 핵심 기능 구현
- [x] UI/UX 디자인 완성
- [x] 다국어 지원 (한국어, 영어)
- [x] 결제 시스템 구현
- [x] 광고 시스템 통합
- [x] 성능 최적화
- [x] Firebase 통합
- [x] 소셜 로그인 구현

### ⚠️ 출시 전 필수 작업

- [ ] 프로덕션 API 키 설정
- [ ] 앱 서명 및 인증서 준비
- [ ] Play Store / App Store 등록 자료
  - [ ] 앱 아이콘 (512x512)
  - [ ] 스크린샷 (각 해상도별)
  - [ ] 앱 설명 및 키워드
  - [ ] 개인정보처리방침 URL
- [ ] 베타 테스트 진행
- [ ] 최종 QA 테스트

## 🐛 알려진 이슈 및 해결 방법

### 1. Metro 번들러 캐시 이슈

```bash
# 해결 방법
npm run start:clean
```

### 2. Android 빌드 실패

```bash
cd android
./gradlew clean
./gradlew assembleRelease
```

### 3. iOS Pod 설치 오류

```bash
cd ios
pod deintegrate
pod install
```

## 📚 관련 문서

### 주요 문서

- [CHANGELOG.md](./CHANGELOG.md) - 변경 이력
- [SERVER_ARCHITECTURE.md](./SERVER_ARCHITECTURE.md) - 서버 구조
- [DEPLOYMENT_TROUBLESHOOTING.md](./DEPLOYMENT_TROUBLESHOOTING.md) - 배포 문제 해결
- [SUBSCRIPTION_UPDATE.md](./SUBSCRIPTION_UPDATE.md) - 구독 시스템 상세

### 가이드 문서

- [QUICK_START.md](./QUICK_START.md) - 빠른 시작 가이드
- [FIREBASE_ENV_SETUP.md](./FIREBASE_ENV_SETUP.md) - Firebase 설정
- [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md) - Vercel 배포 가이드

## 🤝 개발팀 연락처

- **GitHub**: https://github.com/xee3d/Posty
- **이메일**: [프로젝트 관리자 이메일]

---

_이 문서는 프로젝트의 최신 상태를 반영하여 작성되었습니다._
_문서 생성일: 2025년 7월 23일_

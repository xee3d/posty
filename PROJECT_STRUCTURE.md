# 📁 프로젝트 구조

## 디렉토리 구조

```
Posty_V74/
├── android/                    # Android 네이티브 코드
├── ios/                       # iOS 네이티브 코드
├── src/                       # 소스 코드
│   ├── components/            # 재사용 가능한 컴포넌트
│   │   ├── common/           # 공통 UI 컴포넌트
│   │   ├── AnimationComponents.tsx
│   │   ├── EarnTokenModal.tsx
│   │   ├── LowTokenPrompt.tsx
│   │   ├── MissionModal.tsx
│   │   ├── SyncIndicator.tsx
│   │   └── TabNavigator.tsx
│   ├── hooks/                # 커스텀 훅
│   │   ├── analytics/       # Analytics 관련 훅
│   │   ├── redux.ts
│   │   ├── useAppTheme.ts
│   │   └── useTokenManagement.ts
│   ├── screens/              # 화면 컴포넌트
│   │   ├── AIWriteScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── MyStyleScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   └── SubscriptionScreen.tsx
│   ├── services/             # 비즈니스 로직
│   │   ├── ai/             # AI 서비스
│   │   ├── analytics/      # Analytics 서비스
│   │   ├── auth/          # 인증 서비스
│   │   ├── firebase/      # Firebase 서비스
│   │   ├── notification/  # 알림 서비스
│   │   ├── offline/       # 오프라인 동기화
│   │   └── subscription/  # 구독/결제 서비스
│   ├── store/               # Redux 스토어
│   │   ├── slices/        # Redux 슬라이스
│   │   └── middleware/    # Redux 미들웨어
│   ├── types/               # TypeScript 타입 정의
│   └── utils/               # 유틸리티 함수
├── docs/                     # 문서
│   ├── guides/             # 사용 가이드
│   ├── setup/              # 설정 가이드
│   ├── legal/              # 법적 문서
│   └── archive/            # 아카이브된 문서
├── scripts/                  # 유틸리티 스크립트
├── .env.example             # 환경 변수 예제
├── package.json             # npm 패키지 설정
├── tsconfig.json            # TypeScript 설정
└── README.md                # 프로젝트 설명

```

## 주요 파일 설명

### 루트 디렉토리
- **App.tsx**: 앱의 진입점
- **index.js**: React Native 앱 등록
- **metro.config.js**: Metro 번들러 설정
- **babel.config.js**: Babel 트랜스파일러 설정

### src/services/
- **aiService.ts**: AI 콘텐츠 생성 로직
- **adService.ts**: 광고 관리
- **subscriptionService.ts**: 구독 관리
- **firestoreService.ts**: Firestore 데이터베이스 연동
- **socialAuthService.ts**: 소셜 로그인 처리

### src/utils/
- **constants.ts**: 앱 전체 상수
- **storage.ts**: 로컬 스토리지 관리
- **promptUtils.ts**: AI 프롬프트 유틸리티
- **textConstants.ts**: 텍스트 리소스

## 환경 설정

### 필수 환경 변수 (.env)
```
OPENAI_API_KEY=your_openai_api_key
GOOGLE_ADMOB_APP_ID=your_admob_app_id
GOOGLE_ADMOB_BANNER_ID=your_banner_ad_id
GOOGLE_ADMOB_INTERSTITIAL_ID=your_interstitial_ad_id
GOOGLE_ADMOB_REWARDED_ID=your_rewarded_ad_id
```

### Firebase 설정
- `android/app/google-services.json`: Android Firebase 설정
- `ios/GoogleService-Info.plist`: iOS Firebase 설정
- `firestore.rules`: Firestore 보안 규칙
- `firestore.indexes.json`: Firestore 인덱스 설정

## 빌드 및 배포

### Android
```bash
cd android
./gradlew bundleRelease
```
출력: `android/app/build/outputs/bundle/release/app-release.aab`

### iOS
```bash
cd ios
xcodebuild -workspace Posty.xcworkspace -scheme Posty -configuration Release
```

## 스크립트

### scripts/clean_and_build.bat
- 캐시 정리 및 재빌드

### scripts/clear_cache.bat
- Metro 및 빌드 캐시 정리

### scripts/quick_start.bat
- 개발 환경 빠른 시작

## 문서 구조

### docs/guides/
- 사용자 가이드 및 개발 가이드

### docs/setup/
- 환경 설정 및 초기 설정 가이드

### docs/legal/
- 개인정보 처리방침, 이용약관 등 법적 문서

### docs/archive/
- 이전 버전 문서 및 히스토리

# 📱 Posty - AI 기반 SNS 콘텐츠 생성 앱

<div align="center">
  <img src="assets/app-icon.png" alt="Posty Logo" width="120" height="120">
  
  **당신의 일상을 특별하게 만드는 AI 글쓰기 도우미**
  
  [![React Native](https://img.shields.io/badge/React%20Native-0.74.5-blue.svg)](https://reactnative.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0.4-blue.svg)](https://www.typescriptlang.org/)
  [![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
</div>

## 🌟 주요 기능

### AI 콘텐츠 생성
- **텍스트 생성**: 프롬프트 기반 SNS 콘텐츠 자동 생성
- **이미지 분석**: 사진을 분석하여 적절한 캡션 생성
- **문장 다듬기**: 작성한 글을 더 매력적으로 개선

### 플랫폼 최적화
- Instagram, Facebook, Twitter 등 각 플랫폼에 최적화된 콘텐츠
- 플랫폼별 해시태그 자동 생성
- 글자 수 제한 자동 조정

### 스타일 가이드
- 10가지 이상의 미리 정의된 글쓰기 스타일
- 개인 맞춤형 스타일 생성
- 톤과 분위기 조절 기능

## 🚀 시작하기

### 사전 요구사항
- Node.js 18.0 이상
- React Native 개발 환경 설정
- Android Studio / Xcode

### 설치
```bash
# 저장소 클론
git clone https://github.com/yourusername/posty.git
cd posty

# 의존성 설치
npm install --legacy-peer-deps

# iOS 의존성 설치 (macOS)
cd ios && pod install && cd ..

# 환경 변수 설정
cp .env.example .env
# .env 파일에 필요한 API 키 입력
```

### 실행
```bash
# Metro 서버 시작
npx react-native start

# Android 실행
npx react-native run-android

# iOS 실행 (macOS)
npx react-native run-ios
```

## 📁 프로젝트 구조
```
Posty/
├── src/
│   ├── components/     # 재사용 가능한 컴포넌트
│   ├── screens/        # 화면 컴포넌트
│   ├── services/       # 비즈니스 로직 서비스
│   ├── store/          # Redux 스토어
│   ├── hooks/          # 커스텀 훅
│   ├── utils/          # 유틸리티 함수
│   └── types/          # TypeScript 타입 정의
├── android/            # Android 네이티브 코드
├── ios/               # iOS 네이티브 코드
├── docs/              # 문서
│   ├── guides/        # 사용 가이드
│   ├── setup/         # 설정 가이드
│   └── legal/         # 법적 문서
└── scripts/           # 유틸리티 스크립트
```

## 🛠 기술 스택

### Frontend
- **React Native 0.74.5**: 크로스 플랫폼 모바일 앱 개발
- **TypeScript 5.0.4**: 타입 안전성 보장
- **Redux Toolkit**: 상태 관리
- **React Navigation**: 화면 네비게이션

### Backend & Services
- **Firebase**: 인증, 데이터베이스, 분석
- **OpenAI API**: AI 콘텐츠 생성
- **Google AdMob**: 광고 수익화
- **React Native IAP**: 인앱 구매

## 📱 스크린샷

<div align="center">
  <img src="docs/screenshots/home.png" alt="홈 화면" width="200">
  <img src="docs/screenshots/write.png" alt="글쓰기 화면" width="200">
  <img src="docs/screenshots/style.png" alt="스타일 화면" width="200">
  <img src="docs/screenshots/settings.png" alt="설정 화면" width="200">
</div>

## 🤝 기여하기

기여를 환영합니다! 다음 단계를 따라주세요:

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 📞 연락처

- 이메일: contact@posty.app
- 웹사이트: https://posty.app
- 지원: support@posty.app

## 🙏 감사의 말

- OpenAI - AI 기술 제공
- Firebase - 백엔드 인프라
- React Native 커뮤니티

---

<div align="center">
  Made with ❤️ by Posty Team
</div>

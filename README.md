# 🚀 Posty - AI 기반 SNS 콘텐츠 생성 앱

<p align="center">
  <img src="docs/app-icon.png" alt="Posty Logo" width="120" height="120">
</p>

<p align="center">
  <strong>당신의 SNS를 더 특별하게, AI가 만드는 맞춤형 콘텐츠</strong>
</p>

## 📱 소개

Posty는 AI를 활용하여 Instagram, Facebook, Twitter, LinkedIn 등 다양한 SNS 플랫폼에 최적화된 콘텐츠를 생성하는 React Native 앱입니다.

### 주요 기능
- 🤖 **AI 콘텐츠 생성**: OpenAI GPT-4o-mini를 활용한 고품질 텍스트 생성
- 📸 **이미지 기반 작성**: 사진을 분석하여 어울리는 텍스트 자동 생성
- 🎨 **다양한 톤 선택**: 캐주얼, 전문적, 유머러스, GenZ 등 7가지 톤
- 📊 **플랫폼 최적화**: 각 SNS 특성에 맞는 글자수, 해시태그, 형식
- 🌙 **다크 모드**: 눈이 편안한 다크 테마 지원
- 🔊 **사운드 효과**: 재미있는 인터랙션 사운드

## 🛠 기술 스택

- **Framework**: React Native 0.72.6
- **Language**: TypeScript 4.8.4
- **AI Service**: OpenAI API (GPT-4o-mini)
- **Storage**: AsyncStorage
- **광고**: Google AdMob
- **결제**: React Native IAP
- **아이콘**: React Native Vector Icons

## 📋 프로젝트 구조

```
Posty/
├── src/
│   ├── components/      # UI 컴포넌트
│   ├── screens/         # 화면 컴포넌트
│   ├── services/        # API 및 서비스
│   ├── utils/          # 유틸리티 함수
│   ├── hooks/          # 커스텀 훅
│   └── types/          # TypeScript 타입
├── android/            # Android 네이티브 코드
├── ios/               # iOS 네이티브 코드
├── docs/              # 문서
└── posty-server/      # 백엔드 서버 (개발 중)
```

## 🚀 시작하기

### 사전 요구사항
- Node.js 16.x 이상
- React Native 개발 환경
- Android Studio / Xcode

### 설치

```bash
# 저장소 클론
git clone https://github.com/yourusername/posty.git
cd posty

# 의존성 설치
npm install

# iOS 의존성 설치 (Mac만 해당)
cd ios && pod install && cd ..

# 환경 변수 설정
cp .env.example .env
# .env 파일에 OpenAI API 키 입력
```

### 실행

```bash
# Metro 서버 시작
npm start

# Android 실행
npm run android

# iOS 실행 (Mac만 해당)
npm run ios
```

## 📱 주요 화면

### 1. 홈 화면
- 오늘의 추천 콘텐츠
- 빠른 시작 버튼
- 사용 팁 제공

### 2. AI 작성 화면
- 텍스트/이미지 입력
- 플랫폼 선택
- 톤 선택
- 생성 및 편집

### 3. 트렌드 화면
- 실시간 트렌드 (개발 중)
- 인기 해시태그
- 최적 게시 시간

### 4. 내 스타일 화면
- 작성 히스토리 (개발 중)
- 스타일 분석
- 성과 리포트

### 5. 설정 화면
- 프로필 관리
- 테마 설정
- 알림 설정
- 구독 관리

## 🔧 개발 현황

### 완료된 기능 (75%)
- ✅ AI 콘텐츠 생성
- ✅ 플랫폼별 최적화
- ✅ 이미지 분석
- ✅ 다크 모드
- ✅ 기본 UI/UX
- ✅ 설정 저장

### 개발 중
- 🚧 API 서버 구축
- 🚧 히스토리 저장
- 🚧 실시간 트렌드
- 🚧 구독 시스템

### 예정
- 📅 SNS 자동 게시
- 📅 푸시 알림
- 📅 A/B 테스트
- 📅 팀 협업

## 📚 문서

- [프로젝트 현황](PROJECT_STATUS.md)
- [개발 상태](DEVELOPMENT_STATUS.md)
- [미구현 기능](UNIMPLEMENTED_FEATURES.md)
- [구현 계획](IMPLEMENTATION_PLAN.md)
- [패키지 현황](PACKAGE_STATUS.md)

## 🤝 기여하기

프로젝트에 기여하고 싶으시다면:

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다.

## 📞 연락처

- Email: support@posty.app
- Website: https://posty.app

---

<p align="center">
  Made with ❤️ by Posty Team
</p>
"# Posty" 

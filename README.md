# Posty - AI 기반 SNS 콘텐츠 생성 앱

## 📱 개요
Posty는 AI를 활용하여 창의적인 SNS 콘텐츠를 생성하는 React Native 앱입니다.

## 🚀 주요 기능
- **AI 콘텐츠 생성**: GPT-4o-mini를 활용한 창의적인 콘텐츠 생성
- **다양한 톤 설정**: 캐주얼, 전문적, 유머러스 등 9가지 톤
- **플랫폼 최적화**: Instagram, Facebook, Twitter 각 플랫폼에 최적화된 콘텐츠
- **실시간 트렌드**: 최신 트렌드를 반영한 콘텐츠 제안
- **구독 시스템**: FREE, STARTER, PREMIUM, PRO 플랜

## 🛠 기술 스택
- **Frontend**: React Native 0.74.5
- **Backend**: Node.js (Vercel Functions)
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth (Google, Kakao, Naver, Email)
- **AI**: OpenAI API (GPT-4o-mini)
- **State Management**: Redux Toolkit
- **Animation**: React Native Reanimated 3

## 📂 프로젝트 구조
```
Posty/
├── src/
│   ├── components/     # 재사용 가능한 컴포넌트
│   ├── screens/        # 화면 컴포넌트
│   ├── services/       # API 및 서비스 로직
│   ├── store/          # Redux 상태 관리
│   └── utils/          # 유틸리티 함수
├── posty-ai-server/    # AI 콘텐츠 생성 서버
└── posty-api-server/   # 통합 API 서버 (인증, 트렌드)
```

## 🌐 서버 아키텍처
- **AI 서버**: https://posty-ai.vercel.app
  - AI 콘텐츠 생성
  - 이미지 분석
  - OpenAI GPT-4 연동
- **API 서버**: https://posty-api.vercel.app
  - 소셜 로그인 인증 (Custom Token)
  - 실시간 트렌드 데이터
  - Firebase Admin SDK 연동

## 🔧 설치 및 실행

### 필수 요구사항
- Node.js 18+
- React Native 개발 환경
- Firebase 프로젝트
- OpenAI API 키

### 설치
```bash
# 의존성 설치
npm install

# iOS 의존성 설치 (Mac only)
cd ios && pod install

# Android 실행
npm run android

# iOS 실행 (Mac only)
npm run ios
```

### 환경 변수 설정
`.env` 파일 생성:
```
OPENAI_API_KEY=your_openai_api_key
APP_SECRET=your_app_secret
```

## 🚀 배포

### 자동 배포 (권장)
Git push 시 자동으로 Vercel에 배포됩니다:
```bash
git add .
git commit -m "feat: 새로운 기능"
git push
```

### 수동 배포 (필요시)
```bash
# 모든 서버 한번에 배포
deploy-all.bat

# 서버 상태 확인
verify-deployment.bat
```

## 📱 주요 유틸리티 스크립트
- `deploy-all.bat`: 모든 서버 배포
- `verify-deployment.bat`: 서버 상태 확인
- `fresh-deploy.bat`: Metro 캐시 클리어 + 앱 시작
- `install-phone.bat`: 연결된 폰에 앱 설치
- `device-manager.bat`: ADB 디바이스 관리

## 📝 최근 업데이트
- 2025.01.23: 서버 구조 문서 업데이트
- 2025.01.20: Git 자동 배포 설정 완료
- 2025.01.20: 서버 404 에러 해결 및 구독 시스템 개선
- 2025.01.19: 실시간 트렌드 기능 추가

전체 변경 이력은 [CHANGELOG.md](./CHANGELOG.md) 참조

## 🤝 기여
이슈 및 풀 리퀘스트는 언제나 환영합니다!

## 📄 라이선스
Private Repository

---
*최종 업데이트: 2025년 1월 23일*

# Posty - AI-Powered Social Media Content Creator

<div align="center">
  <img src="./assets/logo.png" alt="Posty Logo" width="200"/>
  
  [![React Native](https://img.shields.io/badge/React%20Native-0.74.5-blue.svg)](https://reactnative.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0.4-blue.svg)](https://www.typescriptlang.org/)
  [![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
</div>

## 📱 Overview

Posty는 AI를 활용하여 창의적인 소셜 미디어 콘텐츠를 생성하는 모바일 앱입니다. 사용자의 아이디어를 매력적인 포스팅으로 변환하여 소셜 미디어 활동을 더욱 효과적으로 만들어줍니다.

## ✨ Features

- **AI 콘텐츠 생성**: OpenAI를 활용한 창의적인 콘텐츠 작성
- **다양한 톤 선택**: 캐주얼, 전문적, 유머러스 등 9가지 톤
- **사진 기반 글쓰기**: 이미지를 분석하여 관련 콘텐츠 생성
- **문장 다듬기**: 기존 텍스트를 개선하고 교정
- **스타일 템플릿**: 미니멀리스트, 스토리텔러 등 다양한 스타일
- **토큰 시스템**: 사용량 관리 및 구독 모델
- **오프라인 지원**: 네트워크 없이도 기본 기능 사용 가능

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- React Native development environment
- Android Studio / Xcode
- Java 17 (for Android)

### Installation

1. Clone the repository
```bash
git clone https://github.com/xee3d/Posty.git
cd Posty
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Install iOS pods (iOS only)
```bash
cd ios && pod install
```

4. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

### Running the App

#### Android
```bash
npx react-native run-android
```

#### iOS
```bash
npx react-native run-ios
```

## 🔧 Configuration

### API Server Setup

Posty uses a separate API server for AI content generation. See [posty-server](https://github.com/xee3d/posty-server) for server setup.

### Environment Variables

Create a `.env` file in the root directory:

```env
# API Configuration
API_BASE_URL=https://your-posty-server.vercel.app/api
API_SECRET=your-app-secret

# Firebase Configuration (Optional)
FIREBASE_API_KEY=your-firebase-api-key
FIREBASE_AUTH_DOMAIN=your-auth-domain
FIREBASE_PROJECT_ID=your-project-id
```

## 📁 Project Structure

```
Posty/
├── src/
│   ├── screens/          # App screens
│   ├── components/       # Reusable components
│   ├── services/         # API and business logic
│   ├── utils/           # Utility functions
│   ├── hooks/           # Custom React hooks
│   ├── store/           # Redux store
│   └── config/          # App configuration
├── android/             # Android native code
├── ios/                 # iOS native code
└── assets/             # Images, fonts, etc.
```

## 🛠️ Tech Stack

- **Frontend**: React Native 0.74.5, TypeScript
- **State Management**: Redux Toolkit
- **Navigation**: React Navigation 6
- **UI Components**: React Native Reanimated 3
- **Backend**: Node.js, Vercel Functions
- **AI**: OpenAI GPT-4
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth

## 📱 Supported Platforms

- Android 6.0+ (API 23+)
- iOS 13.0+

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for GPT API
- React Native Community
- All contributors and users

---

<div align="center">
  Made with ❤️ by the Posty Team
</div>

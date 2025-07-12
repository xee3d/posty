# React Native 0.74.5 의존성 호환성 매트릭스

## 📊 완벽 호환 의존성 번들

이 문서는 React Native 0.74.5와 100% 호환되는 의존성 버전들을 정리한 영구 참조 문서입니다.

## 🎯 핵심 의존성 (절대 변경 금지)

### **React Native 핵심**
```json
{
  "react": "18.2.0",
  "react-native": "0.74.5"
}
```

### **Navigation 완벽 세트**
```json
{
  "@react-navigation/native": "6.1.18",
  "@react-navigation/native-stack": "6.11.0",
  "@react-navigation/bottom-tabs": "6.6.1",
  "@react-navigation/drawer": "6.7.2",
  "react-native-screens": "3.34.0",
  "react-native-safe-area-context": "4.11.0",
  "react-native-gesture-handler": "2.18.1"
}
```

### **Firebase 완벽 세트**
```json
{
  "@react-native-firebase/app": "20.4.0",
  "@react-native-firebase/auth": "20.4.0",
  "@react-native-firebase/firestore": "20.4.0",
  "@react-native-firebase/messaging": "20.4.0",
  "@react-native-firebase/storage": "20.4.0",
  "@react-native-firebase/analytics": "20.4.0",
  "@react-native-firebase/crashlytics": "20.4.0"
}
```

## 🔧 개발 도구

### **TypeScript & ESLint**
```json
{
  "@react-native/babel-preset": "0.74.87",
  "@react-native/eslint-config": "0.74.87",
  "@react-native/metro-config": "0.74.87",
  "@react-native/typescript-config": "0.74.87",
  "@types/react": "^18.2.6",
  "@types/react-native": "^0.73.0",
  "typescript": "5.0.4"
}
```

### **빌드 도구**
```json
{
  "@react-native-community/cli": "13.6.9",
  "@react-native-community/cli-platform-android": "13.6.9",
  "@react-native-community/cli-platform-ios": "13.6.9",
  "metro-react-native-babel-preset": "0.76.8"
}
```

## 🎨 UI & 애니메이션

### **애니메이션 라이브러리**
```json
{
  "react-native-reanimated": "3.15.0",
  "react-native-svg": "15.6.0",
  "react-native-linear-gradient": "2.8.3"
}
```

### **UI 컴포넌트**
```json
{
  "react-native-vector-icons": "10.2.0",
  "react-native-fast-image": "8.6.3"
}
```

## 🏪 상태 관리

### **Redux 생태계**
```json
{
  "@reduxjs/toolkit": "2.2.7",
  "react-redux": "9.1.2"
}
```

### **대안 상태 관리**
```json
{
  "zustand": "4.5.5"
}
```

## 🛠️ 유틸리티

### **스토리지 & 네트워킹**
```json
{
  "@react-native-async-storage/async-storage": "1.24.0",
  "axios": "1.7.7"
}
```

### **디바이스 & 미디어**
```json
{
  "react-native-device-info": "10.13.2",
  "react-native-image-picker": "7.1.2",
  "react-native-permissions": "4.1.5"
}
```

### **기타 유틸리티**
```json
{
  "@react-native-clipboard/clipboard": "1.16.3",
  "crypto-js": "4.2.0",
  "react-native-dotenv": "3.4.11"
}
```

## 📱 광고 & 수익화

### **Google AdMob**
```json
{
  "react-native-google-mobile-ads": "14.2.0"
}
```

## 🔊 미디어

### **오디오**
```json
{
  "react-native-sound": "0.11.2"
}
```

## ⚠️ 중요 호환성 규칙

### **절대 사용하면 안 되는 버전들**
```json
{
  "react-native-reanimated": "< 3.10.0",
  "react-native-screens": "< 3.30.0",
  "@react-navigation/native": "< 6.1.0",
  "@react-native-firebase/app": "< 20.0.0",
  "react-native-gesture-handler": "< 2.16.0"
}
```

### **Android 설정 필수사항**
```gradle
// android/build.gradle
buildscript {
    ext {
        kotlinVersion = "1.9.0"
        ndkVersion = "25.1.8937393"
    }
    dependencies {
        classpath("com.android.tools.build:gradle:8.1.1")
        classpath("com.google.gms:google-services:4.4.2")
    }
}
```

```gradle
// android/app/build.gradle
dependencies {
    implementation platform('com.google.firebase:firebase-bom:33.6.0')
}
```

### **Gradle 설정**
```properties
# android/gradle/wrapper/gradle-wrapper.properties
distributionUrl=https\://services.gradle.org/distributions/gradle-8.3-all.zip
```

## 🧪 검증된 조합

이 의존성 조합은 다음 환경에서 완전히 테스트되었습니다:

- ✅ **Windows 11** + Android SDK 34
- ✅ **macOS** + Xcode 15.0+ (iOS 지원 시)
- ✅ **Node.js 18.x**
- ✅ **npm 10.x** / **yarn 3.x**

## 📋 빠른 설치 명령어

### **전체 의존성 일괄 설치**
```bash
# 핵심 Navigation
npm install @react-navigation/native@6.1.18 @react-navigation/native-stack@6.11.0 @react-navigation/bottom-tabs@6.6.1 react-native-screens@3.34.0 react-native-safe-area-context@4.11.0 react-native-gesture-handler@2.18.1

# Firebase
npm install @react-native-firebase/app@20.4.0 @react-native-firebase/auth@20.4.0 @react-native-firebase/firestore@20.4.0

# UI & Animation
npm install react-native-reanimated@3.15.0 react-native-svg@15.6.0 react-native-vector-icons@10.2.0

# State Management
npm install @reduxjs/toolkit@2.2.7 react-redux@9.1.2

# Utilities
npm install @react-native-async-storage/async-storage@1.24.0 axios@1.7.7 react-native-device-info@10.13.2
```

## 🔄 업데이트 정책

- **Major 버전**: 신중한 검토 후 업데이트
- **Minor 버전**: 호환성 확인 후 업데이트 가능
- **Patch 버전**: 자유롭게 업데이트 가능

## 📞 문제 해결

의존성 문제 발생 시:

1. **이 문서의 정확한 버전 사용**
2. **node_modules 삭제 후 재설치**
3. **Android clean build 수행**
4. **이 조합에서 벗어나지 않기**

---

**마지막 업데이트**: 2025년 7월 11일  
**React Native 버전**: 0.74.5  
**호환성 검증**: ✅ 완료

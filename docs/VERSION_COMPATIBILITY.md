# 버전 호환성 가이드

## 🎯 테스트 완료된 환경

이 프로젝트는 아래 환경에서 **완전히 테스트되고 검증되었습니다**.

### 시스템 요구사항
```
Operating System: macOS 15.0.0 (Darwin)
Shell: /bin/zsh
Xcode: 16.0+
Android Studio: 2023.3.1+
```

### Node.js 환경
```
Node.js: 18.20.4 (LTS)
npm: 10.7.0
npx: 10.7.0
```

### React Native 환경 (중요!)
```
React Native: 0.74.5
React Native CLI: 0.73.10 ⭐ (이 버전으로 테스트됨)
Metro: 0.74.87
TypeScript: 5.0.4
```

### Firebase 의존성
```
Firebase Auth: 22.4.0 (Auth만 사용)
Firebase Core: 22.4.0
```

## ⚠️ 중요 사항

### React Native CLI 버전
- **반드시 0.73.10 사용**
- 다른 버전 사용 시 빌드 오류 가능
- NPX 캐시 문제로 인한 버전 충돌 주의

### CLI 버전 확인 및 수정
```bash
# 현재 버전 확인
npx react-native --version

# 잘못된 버전이면 캐시 클리어
npx clear-npx-cache

# 정확한 버전으로 실행
npx react-native@0.73.10 start --reset-cache
npx react-native@0.73.10 run-ios
```

## 🚀 검증된 설치 순서

### 1. 기본 환경 설정
```bash
# Node.js 18.20.4 설치 (nvm 권장)
nvm install 18.20.4
nvm use 18.20.4

# npm 업데이트
npm install -g npm@10.7.0
```

### 2. 프로젝트 설치
```bash
git clone https://github.com/xee3d/posty_new.git
cd posty_new

# 의존성 설치
npm install

# iOS 의존성 설치 (Mac only)
cd ios && pod install && cd ..
```

### 3. 실행 (검증된 명령어)
```bash
# CLI 버전 확인
npx react-native --version

# Metro 시작 (정확한 버전)
npx react-native@0.73.10 start --reset-cache

# iOS 실행
npx react-native@0.73.10 run-ios --simulator="iPhone 16 Pro"

# Android 실행  
npx react-native@0.73.10 run-android
```

## 🔧 문제 해결

### CLI 버전 경고 무시 방법
```
WARNING: You should run npx react-native@latest to ensure you're always using the most current version of the CLI. NPX has cached version (0.73.10) != current release (0.80.2)
```

**해결:** 이 경고는 무시하세요. 0.73.10이 테스트된 안정 버전입니다.

### Metro 설정 경고
```
Unknown option "watcher.useWatchman" with value false was found.
```

**해결:** 이 경고는 무시해도 됩니다. 빌드에 영향 없음.

### 포트 충돌 해결
```bash
# 8081 포트 사용 중인 프로세스 종료
lsof -ti:8081 | xargs kill -9

# Metro 재시작
npx react-native@0.73.10 start --reset-cache
```

## 📋 팀 개발 시 주의사항

### 모든 팀원이 동일한 버전 사용
```bash
# package.json에 engines 필드로 강제
"engines": {
  "node": "18.20.4",
  "npm": "10.7.0"
}

# .nvmrc 파일로 Node.js 버전 고정
echo "18.20.4" > .nvmrc
```

### Volta 사용 (권장)
```bash
# Volta 설치
curl https://get.volta.sh | bash

# 프로젝트 버전 고정
volta pin node@18.20.4
volta pin npm@10.7.0
```

## 🏆 성공 지표

다음 상황이면 올바르게 설정된 것입니다:
- ✅ iOS 시뮬레이터에서 앱 실행 성공
- ✅ Firebase Auth 소셜 로그인 작동
- ✅ Firebase import 에러 없음
- ✅ Metro bundler 정상 동작
- ✅ Hot reload 작동

---

**마지막 업데이트**: 2025년 1월 23일  
**테스트 환경**: macOS 15.0.0, Xcode 16.0, React Native CLI 0.73.10
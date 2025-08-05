# 클론 설치 의존성 체크리스트

## ✅ 안전하게 설계된 의존성들

### 1️⃣ Firebase 의존성 (안전함)
```json
"@react-native-firebase/app": "^22.4.0",     ✅ package.json에 포함
"@react-native-firebase/auth": "^22.4.0",    ✅ package.json에 포함
```

**안전 장치:**
- ✅ 모든 Firebase import가 try-catch로 처리
- ✅ Analytics 미설치 시 Mock으로 대체
- ✅ 환경변수 미설정 시 Mock으로 대체

### 2️⃣ Node.js/npm 버전 (자동 체크)
```json
"engines": {
  "node": ">=18",
  "npm": ">=8.0.0"
},
"volta": {
  "node": "18.20.4",
  "npm": "10.7.0"
}
```

**안전 장치:**
- ✅ .nvmrc 파일로 Node.js 버전 고정
- ✅ engines 필드로 최소 버전 제약
- ✅ volta 설정으로 정확한 버전 고정

### 3️⃣ React Native CLI (고정됨)
```json
"scripts": {
  "start": "npx react-native@0.73.10 start",
  "ios": "npx react-native@0.73.10 run-ios",
  "android": "npx react-native@0.73.10 run-android"
}
```

**안전 장치:**
- ✅ 모든 scripts에 CLI 버전 고정 (0.73.10)
- ✅ npx 캐시 문제 방지

### 4️⃣ 소셜 로그인 패키지 (완전 포함)
```json
"@react-native-google-signin/google-signin": "^15.0.0",  ✅
"@react-native-seoul/kakao-login": "^5.4.1",             ✅
"@react-native-seoul/naver-login": "^4.1.3",             ✅
"@invertase/react-native-apple-authentication": "^2.4.1" ✅
```

## 🚀 클론 후 설치 과정

### 단계별 설치 (100% 자동화)
```bash
# 1. 클론
git clone https://github.com/xee3d/posty_new.git
cd posty_new

# 2. Node.js 버전 자동 설정 (nvm 사용자)
nvm use  # .nvmrc 파일 자동 읽기

# 3. 의존성 설치 (Firebase 포함)
npm install

# 4. iOS 의존성 설치 (Mac only)
cd ios && pod install && cd ..

# 5. 실행 (검증된 CLI 버전 자동 사용)
npm start              # Metro 시작
npm run ios           # iOS 실행
npm run android       # Android 실행
```

## ⚠️ 잠재적 문제점과 해결책

### 문제 1: iOS CocoaPods 설치 실패
**원인:** M1/Intel Mac 차이, Ruby 버전 차이
**해결:** 
```bash
# Ruby 버전 확인
ruby --version

# CocoaPods 재설치
sudo gem install cocoapods
cd ios && pod install --repo-update
```

### 문제 2: Android 권한 문제
**원인:** gradlew 실행 권한 없음
**해결:**
```bash
chmod +x android/gradlew
```

### 문제 3: Metro 포트 충돌
**원인:** 8081 포트 사용 중
**해결:**
```bash
lsof -ti:8081 | xargs kill -9
npm start
```

### 문제 4: CLI 버전 경고
**원인:** NPX 캐시된 다른 버전
**해결:**
```bash
npx clear-npx-cache
npm run check:cli  # 버전 확인
```

## 🔒 환경변수 없이도 동작

### Mock 모드 자동 활성화
```javascript
// 환경변수 없어도 다음과 같이 동작:
GOOGLE_WEB_CLIENT_ID = 'mock-google-client-id'
NAVER_CONSUMER_KEY = 'mock-naver-key'
API_URL = 'https://posty-api-server.vercel.app'
```

### Firebase 패키지 없어도 동작
```javascript
// Analytics 미설치 시:
analytics = () => ({
  logEvent: () => Promise.resolve(),
  setUserId: () => Promise.resolve(),
})
```

## ✅ 성공 지표

다음이 모두 작동하면 설치 성공:
- [ ] `npm install` 에러 없음
- [ ] `npm start` Metro 시작됨
- [ ] `npm run ios` iOS 시뮬레이터 실행
- [ ] 앱이 크래시 없이 로딩됨
- [ ] Firebase Auth Mock 로그인 가능
- [ ] AI 콘텐츠 생성 동작

## 🆘 문제 발생 시 연락처

**GitHub Issues**: https://github.com/xee3d/posty_new/issues
**가이드 문서**: ./docs/VERSION_COMPATIBILITY.md

---
**마지막 업데이트**: 2025년 8월 5일  
**테스트 환경**: macOS 15.0.0, React Native 0.74.5, CLI 0.73.10  
**개발 기간**: 2025년 7월 4일 ~ 현재
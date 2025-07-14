# React Native 환경변수 설정 가이드

## 옵션 1: 직접 API 키 입력 (빠른 시작)

`src/services/openaiService.ts` 파일에서:

```typescript
const OPENAI_API_KEY = 'sk-your-actual-api-key-here';
```

⚠️ **주의**: GitHub에 커밋하지 마세요!

## 옵션 2: react-native-dotenv 설치 (권장)

### 1. 패키지 설치

```bash
npm install react-native-dotenv
# 또는
yarn add react-native-dotenv
```

### 2. babel.config.js 수정

```javascript
module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    ['module:react-native-dotenv', {
      moduleName: '@env',
      path: '.env',
      safe: false,
      allowUndefined: true,
    }]
  ]
};
```

### 3. TypeScript 설정 (선택사항)

`src/types/env.d.ts` 파일 생성:

```typescript
declare module '@env' {
  export const OPENAI_API_KEY: string;
}
```

### 4. .env 파일 생성

프로젝트 루트에 `.env` 파일 생성:

```
OPENAI_API_KEY=sk-your-actual-api-key-here
```

### 5. .gitignore에 추가

```
.env
.env.local
```

### 6. openaiService.ts 수정

```typescript
import { OPENAI_API_KEY } from '@env';

// const OPENAI_API_KEY = 'YOUR_OPENAI_API_KEY_HERE'; // 제거
```

### 7. Metro 캐시 클리어 & 재시작

```bash
# Metro 캐시 클리어
npx react-native start --reset-cache

# iOS
cd ios && pod install && cd ..
npx react-native run-ios

# Android
npx react-native run-android
```

## 문제 해결

### Metro 캐시 문제
```bash
rm -rf node_modules/.cache
rm -rf $TMPDIR/metro-*
npx react-native start --reset-cache
```

### 환경변수가 로드되지 않을 때
1. 앱 완전 종료
2. Metro 서버 재시작
3. 앱 재빌드

## 보안 팁

1. **절대 하지 말아야 할 것**:
   - API 키를 코드에 하드코딩
   - .env 파일을 Git에 커밋
   
2. **프로덕션 배포 시**:
   - 서버 사이드 프록시 사용 권장
   - 환경별 다른 키 사용

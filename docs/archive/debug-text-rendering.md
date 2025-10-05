# React Native 텍스트 렌더링 오류 디버깅 가이드

## 🚨 오류 분석
**오류**: "Text strings must be rendered within a <Text> component"
**원인**: JSX에서 문자열이 `<Text>` 컴포넌트 없이 직접 렌더링 시도

## 🔍 디버깅 단계

### 1. 소스 맵 활성화 (최우선)
```bash
# Metro bundler 캐시 초기화
npx react-native start --reset-cache

# iOS 시뮬레이터에서 개발 모드 재빌드
npx react-native run-ios --configuration Debug
```

**metro.config.js 확인:**
```javascript
module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    sourceExts: ['js', 'json', 'ts', 'tsx'],
  },
  // 소스맵 활성화
  serializer: {
    createModuleIdFactory: () => (path) => path,
    getRunModuleStatement: (moduleId) => `require(${JSON.stringify(moduleId)});`,
  },
};
```

### 2. ✅ 임시 디버깅 코드 추가 완료

**AIWriteScreen.tsx의 getRandomPlaceholder 함수에 로깅 추가 (완료):**
- 함수 호출 시 타입과 값 로깅
- 배열 요소 선택 시 결과값 로깅  
- fallback 값 사용 시 로깅
- 모든 반환값의 타입 안전성 검증

**MyStyleScreen.tsx의 번역 함수들에 로깅 추가 (완료):**
- getTranslatedCategory 함수에 상세 로깅 추가
- 입력값, 번역 키, 결과값 각 단계별 로깅
- 타입 안전성 검사 및 경고 메시지
- 정규화 과정 디버깅 로그

### 3. 일반적인 문제 패턴 확인

**체크리스트:**
- [ ] `{someVariable}` 형태로 직접 변수 렌더링 (View 안에서)
- [ ] `return someString;` 형태의 컴포넌트 반환값
- [ ] `condition ? "text" : <Component/>` 형태의 혼합 반환
- [ ] `array.map(item => item)` 형태로 문자열 배열 직접 렌더링
- [ ] `t()` 함수가 undefined/null 반환하는 경우

### 4. ✅ 런타임 검증 코드 구현 완료

**TextRenderingErrorBoundary 컴포넌트 생성 및 App.tsx 적용 (완료):**
- `src/components/TextRenderingErrorBoundary.tsx` 생성
- Text strings 렌더링 오류 전용 에러 바운더리
- 오류 발생 시 상세한 로깅 및 스택 트레이스 출력
- App.tsx에 최상위 레벨에서 AppContent를 래핑하여 적용

**Metro bundler 설정 최적화 (완료):**
- 기본 소스맵 설정 유지 (안정성 우선)
- 함수명 보존 및 console 로그 유지 설정
- 디버깅 친화적 minifier 설정

### 5. 번역 키 안전성 검증

**i18next 설정에서 fallback 보장:**
```typescript
// i18n.ts에서
const i18n = i18next.createInstance({
  // ... 기존 설정
  saveMissing: true,
  missingKeyHandler: (lng, ns, key, fallbackValue) => {
    console.warn('🚨 Missing translation key:', key, 'fallback:', fallbackValue);
    return fallbackValue || key; // 항상 문자열 반환 보장
  },
});
```

## 🛠️ 예상 해결책

### 가능성 1: 번역 키 누락
```typescript
// 문제가 될 수 있는 코드
{t('nonexistent.key')} // undefined 반환 가능

// 해결책
{t('nonexistent.key') || '기본값'}
// 또는
<Text>{String(t('nonexistent.key') || '기본값')}</Text>
```

### 가능성 2: 조건부 렌더링 이슈
```typescript
// 문제가 될 수 있는 코드
{condition && someString}

// 해결책
{condition && <Text>{someString}</Text>}
```

### 가능성 3: 배열 렌더링 이슈
```typescript
// 문제가 될 수 있는 코드
{stringArray.map(item => item)}

// 해결책
{stringArray.map((item, index) => <Text key={index}>{item}</Text>)}
```

## 📱 테스트 환경

1. **개발자 도구 활성화:**
   - iOS 시뮬레이터: Cmd + D > "Enable Fast Refresh" 끄기
   - 콘솔 로그 확인: Xcode > Window > Devices and Simulators > Console

2. **단계별 테스트:**
   - MyStyle 화면 진입 시점에서 오류 발생하는지 확인
   - AI 글쓰기 화면의 placeholder 생성 시점 확인
   - 번역 언어 변경 시 오류 재현되는지 확인

## 🚀 디버깅 시작하기

### 캐시 초기화 및 앱 재시작
```bash
# Metro bundler 캐시 초기화
npx react-native start --reset-cache

# iOS 시뮬레이터에서 개발 모드 재빌드
npx react-native run-ios --configuration Debug
```

### 로그 모니터링
- 📍 접두사가 붙은 디버깅 로그 확인
- 🚨 경고 메시지 주의 깊게 관찰
- TextRenderingErrorBoundary 에러 캐치 여부 확인

### 다음 단계
1. 앱 실행 후 콘솔 로그 관찰
2. MyStyle 화면 및 AI 글쓰기 화면 테스트
3. 오류 발생 시 로그에서 정확한 위치 파악
4. 문제 해결 후 디버깅 코드 제거

## 🎯 기대 결과

이 디버깅 과정을 통해:
1. 정확한 오류 발생 위치 파악 (파일명:라인번호)
2. 문제가 되는 변수/함수 식별
3. 근본 원인 해결책 도출
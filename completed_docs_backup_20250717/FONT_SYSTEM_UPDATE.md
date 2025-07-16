# Font System 업데이트 가이드

## 개요
React Native에서 `fontFamily: 'System'`은 지원되지 않습니다. 이 문서는 올바른 시스템 폰트 사용 방법을 설명합니다.

## ✅ 현재 구현 상태
프로젝트에서 이미 플랫폼별 시스템 폰트 처리가 구현되어 있습니다.

### 구현 위치
- `src/utils/fonts/index.ts`

## 시스템 폰트 사용 방법

### 1. iOS 시스템 폰트
```typescript
// iOS는 fontFamily를 undefined로 설정하면 시스템 폰트 사용
const styles = {
  text: {
    fontFamily: undefined,  // San Francisco 폰트 자동 사용
    fontWeight: '400',     // fontWeight로 굵기 조절
  }
}
```

### 2. Android 시스템 폰트
```typescript
// Android는 Roboto 폰트 패밀리 명시
const styles = {
  text: {
    fontFamily: 'Roboto',  // 기본 Roboto
    // 또는
    fontFamily: 'Roboto-Medium',  // 중간 굵기
    fontFamily: 'Roboto-Bold',    // 굵은 글씨
  }
}
```

### 3. 크로스 플랫폼 헬퍼 함수 사용 (권장)
```typescript
import { getFontStyle, TEXT_STYLES } from '../utils/fonts';

// 방법 1: getFontStyle 헬퍼 사용
const styles = StyleSheet.create({
  title: {
    ...getFontStyle('xl', 'bold'),  // 크기와 굵기 지정
    color: '#000',
  },
  body: {
    ...getFontStyle('md', 'regular'),
    color: '#333',
  }
});

// 방법 2: 미리 정의된 스타일 사용
const styles = StyleSheet.create({
  title: {
    ...TEXT_STYLES.h1,  // 제목 1 스타일
    color: '#000',
  },
  subtitle: {
    ...TEXT_STYLES.h3,  // 제목 3 스타일
    color: '#666',
  },
  body: {
    ...TEXT_STYLES.body,  // 본문 스타일
    color: '#333',
  }
});
```

## 사용 가능한 폰트 굵기

### iOS (fontWeight 사용)
- `'100'` - Thin
- `'300'` - Light
- `'400'` - Regular
- `'500'` - Medium
- `'700'` - Bold

### Android (fontFamily 사용)
- `'Roboto-Thin'`
- `'Roboto-Light'`
- `'Roboto'` (Regular)
- `'Roboto-Medium'`
- `'Roboto-Bold'`

## 미리 정의된 텍스트 스타일

```typescript
// 제목
TEXT_STYLES.h1  // 32px, bold
TEXT_STYLES.h2  // 24px, bold
TEXT_STYLES.h3  // 20px, bold
TEXT_STYLES.h4  // 18px, medium
TEXT_STYLES.h5  // 16px, medium
TEXT_STYLES.h6  // 14px, medium

// 본문
TEXT_STYLES.body        // 16px, regular
TEXT_STYLES.bodyLarge   // 18px, regular
TEXT_STYLES.bodySmall   // 14px, regular

// 캡션
TEXT_STYLES.caption      // 12px, regular
TEXT_STYLES.captionBold  // 12px, medium

// 버튼
TEXT_STYLES.button       // 16px, medium
TEXT_STYLES.buttonSmall  // 14px, medium
TEXT_STYLES.buttonLarge  // 18px, medium

// 링크
TEXT_STYLES.link        // 16px, regular, underline
```

## 주의사항

1. **절대 사용하지 말아야 할 것**:
   ```typescript
   // ❌ 잘못된 방법
   fontFamily: 'System'
   fontFamily: 'San Francisco'
   fontFamily: 'SF Pro Display'
   ```

2. **커스텀 폰트 사용 시**:
   - 폰트 파일을 프로젝트에 추가
   - `react-native.config.js`에 폰트 경로 설정
   - `npx react-native-asset` 실행

3. **성능 최적화**:
   - 폰트 스타일을 재사용하여 스타일 객체 생성 최소화
   - `getFontStyle` 함수 사용으로 일관성 유지

## 마이그레이션 가이드

기존 코드에서 `fontFamily: 'System'`을 사용하는 경우:

```typescript
// Before
const styles = StyleSheet.create({
  text: {
    fontFamily: 'System',
    fontSize: 16,
    fontWeight: '500',
  }
});

// After
import { getFontStyle } from '../utils/fonts';

const styles = StyleSheet.create({
  text: {
    ...getFontStyle('md', 'medium'),
    // 또는 직접 지정
    fontSize: 16,
    fontWeight: '500',  // iOS
    fontFamily: Platform.OS === 'android' ? 'Roboto-Medium' : undefined,
  }
});
```

## 문제 해결

1. **Android에서 폰트가 적용되지 않는 경우**:
   - Roboto 폰트가 기기에 설치되어 있는지 확인
   - fontFamily 철자 확인 (대소문자 구분)

2. **iOS에서 폰트가 이상하게 보이는 경우**:
   - fontFamily를 undefined로 설정했는지 확인
   - fontWeight 값이 문자열인지 확인 ('400', not 400)

3. **텍스트가 잘리는 경우**:
   - Android: `includeFontPadding: false` 설정
   - lineHeight 값 조정

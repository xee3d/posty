# Posty React Native 0.74.5 - 폰트 시스템 업데이트

## 🎯 해결된 문제

React Native에서 `fontFamily: 'System'`이 지원되지 않는 문제를 해결했습니다.

## 📁 변경된 파일

### 새로 생성된 파일
- `src/utils/fonts/index.ts` - 플랫폼별 폰트 시스템
- `src/utils/fonts/FONT_GUIDE.md` - 폰트 사용 가이드

### 수정된 파일
- `src/utils/theme.tsx` - 폰트 설정을 fonts 모듈로 분리
- `src/utils/constants.ts` - FONTS export를 fonts 모듈로 연결
- `src/styles/commonStyles.ts` - getFontStyle() 함수 사용으로 변경

## 🔧 주요 변경사항

### 1. 플랫폼별 폰트 자동 선택
```typescript
// iOS: 시스템 폰트 (San Francisco) 자동 사용
// Android: Roboto 폰트 패밀리 명시
const fontFamily = Platform.OS === 'ios' ? undefined : 'Roboto';
```

### 2. 새로운 폰트 스타일 함수
```typescript
import { getFontStyle } from '@/utils/fonts';

// 사용 예시
const styles = StyleSheet.create({
  text: {
    ...getFontStyle('md', 'regular'), // 크기와 굵기 지정
    color: colors.text.primary,
  },
});
```

### 3. 사전 정의된 텍스트 스타일
```typescript
import { TEXT_STYLES } from '@/utils/fonts';

// 사용 예시
<Text style={TEXT_STYLES.h1}>제목</Text>
<Text style={TEXT_STYLES.body}>본문</Text>
<Text style={TEXT_STYLES.caption}>캡션</Text>
```

## ✅ 다음 단계

1. **전체 프로젝트 검토**: 모든 컴포넌트에서 폰트 사용을 새로운 시스템으로 마이그레이션
2. **테스트**: iOS와 Android 모두에서 폰트가 올바르게 표시되는지 확인
3. **성능 최적화**: 폰트 로딩 및 렌더링 성능 모니터링

## 📱 테스트 방법

```bash
# Android 실행
cd C:\Users\xee3d\Documents\Posty_V74
npx react-native run-android

# iOS 실행 (Mac에서만 가능)
cd C:\Users\xee3d\Documents\Posty_V74
cd ios && pod install && cd ..
npx react-native run-ios
```

## 🚨 주의사항

1. **fontFamily: 'System'을 직접 사용하지 마세요** - 대신 getFontStyle() 사용
2. **폰트 크기는 정의된 크기 사용** - xs, sm, md, lg, xl, xxl, xxxl
3. **커스텀 폰트 추가시** - fonts/index.ts 파일 수정

## 📚 참고 문서

- [React Native Typography](https://reactnative.dev/docs/text-style-props)
- [Platform Specific Code](https://reactnative.dev/docs/platform-specific-code)
- 프로젝트 내부 문서: `src/utils/fonts/FONT_GUIDE.md`

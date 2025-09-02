# 폰트 시스템 사용 가이드

## 문제 해결

React Native에서 `fontFamily: 'System'`은 지원되지 않습니다. 이 프로젝트는 플랫폼별로 적절한 시스템 폰트를 자동으로 선택하는 폰트 시스템을 사용합니다.

## 기본 사용법

### 1. getFontStyle 함수 사용 (권장)

```typescript
import { getFontStyle } from "@/utils/fonts";

// 기본 사용
const styles = StyleSheet.create({
  text: {
    ...getFontStyle("md", "regular"),
    color: colors.text.primary,
  },
  title: {
    ...getFontStyle("xl", "bold"),
    color: colors.text.primary,
  },
});
```

### 2. 사전 정의된 텍스트 스타일 사용

```typescript
import { TEXT_STYLES } from "@/utils/fonts";

const styles = StyleSheet.create({
  heading: {
    ...TEXT_STYLES.h1,
    color: colors.text.primary,
  },
  body: {
    ...TEXT_STYLES.body,
    color: colors.text.secondary,
  },
  caption: {
    ...TEXT_STYLES.caption,
    color: colors.text.tertiary,
  },
});
```

### 3. Text 컴포넌트에서 직접 사용

```tsx
import { getFontStyle, getFontOptimization } from "@/utils/fonts";

<Text
  style={[getFontStyle("lg", "medium"), { color: colors.primary }]}
  {...getFontOptimization()}
>
  안녕하세요!
</Text>;
```

## 플랫폼별 동작

### iOS

- `fontWeight`를 사용하여 시스템 폰트의 굵기를 조정합니다
- San Francisco 폰트가 자동으로 사용됩니다

### Android

- Roboto 폰트 패밀리를 명시적으로 지정합니다
- `includeFontPadding: false`로 불필요한 패딩을 제거합니다

## 사용 가능한 폰트 크기

- `xs`: 12pt (캡션, 작은 텍스트)
- `sm`: 14pt (보조 텍스트)
- `md`: 16pt (기본 본문)
- `lg`: 18pt (강조된 본문)
- `xl`: 20pt (소제목)
- `xxl`: 24pt (제목)
- `xxxl`: 32pt (대제목)

## 사용 가능한 폰트 굵기

- `thin`: 100 (매우 얇음)
- `light`: 300 (얇음)
- `regular`: 400 (기본)
- `medium`: 500 (중간)
- `bold`: 700 (굵음)

## 마이그레이션 가이드

### 이전 코드

```typescript
const styles = StyleSheet.create({
  text: {
    fontFamily: "System",
    fontSize: 16,
    fontWeight: "bold",
  },
});
```

### 새로운 코드

```typescript
import { getFontStyle } from "@/utils/fonts";

const styles = StyleSheet.create({
  text: {
    ...getFontStyle("md", "bold"),
  },
});
```

## 주의사항

1. 절대 `fontFamily: 'System'`을 직접 사용하지 마세요
2. 폰트 크기는 반드시 정의된 크기(`xs`, `sm`, `md` 등)를 사용하세요
3. 커스텀 폰트가 필요한 경우, fonts/index.ts 파일을 수정하세요
4. `allowFontScaling`은 접근성을 위해 기본적으로 활성화되어 있습니다

## 예제

### 제목과 본문이 있는 카드

```tsx
import { TEXT_STYLES } from "@/utils/fonts";

const Card = () => (
  <View style={styles.card}>
    <Text style={[TEXT_STYLES.h3, { color: colors.text.primary }]}>
      카드 제목
    </Text>
    <Text
      style={[TEXT_STYLES.body, { color: colors.text.secondary, marginTop: 8 }]}
    >
      카드 본문 내용입니다. 시스템 폰트가 자동으로 적용됩니다.
    </Text>
  </View>
);
```

### 버튼 텍스트

```tsx
import { getFontStyle } from "@/utils/fonts";

const Button = ({ title }) => (
  <TouchableOpacity style={styles.button}>
    <Text style={[getFontStyle("md", "medium"), { color: "white" }]}>
      {title}
    </Text>
  </TouchableOpacity>
);
```

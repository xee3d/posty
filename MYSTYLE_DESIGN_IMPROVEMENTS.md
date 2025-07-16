# MyStyleScreen 디자인 개선 제안

## 현재 디자인 분석
- ✅ 원형 아이콘 배경은 의도된 디자인
- ✅ 각 스타일을 시각적으로 구분하는 효과적인 방법
- ⚠️ 다크 모드에서 대비가 약할 수 있음

## 개선 제안

### 1. 아이콘 스타일 개선
```typescript
templateIcon: {
  width: 64,  // 56 -> 64로 증가
  height: 64,
  borderRadius: 32,
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: SPACING.md,
  // 그림자 추가
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
},
```

### 2. 다크 모드 대응
```typescript
// 다크 모드에서 아이콘 배경색 조정
const iconBgOpacity = isDark ? '40' : '30';
<View style={[styles.templateIcon, { 
  backgroundColor: template.color + iconBgOpacity,
  borderWidth: isDark ? 1 : 0,
  borderColor: template.color + '50'
}]}>
```

### 3. 추천 템플릿 강조
```typescript
recommendedTemplate: {
  borderWidth: 2,
  borderColor: colors.primary,
  backgroundColor: colors.primary + '05',
  transform: [{ scale: 1.02 }],
},
```

### 4. 호버/프레스 효과
```typescript
// TouchableOpacity에 activeOpacity 조정
<TouchableOpacity
  activeOpacity={0.7}  // 0.8 -> 0.7
  style={[
    styles.templateCard,
    isPressed && { transform: [{ scale: 0.98 }] }
  ]}
>
```

### 5. 아이콘 크기 반응형 조정
```typescript
// 화면 크기에 따라 아이콘 크기 조정
const iconSize = width < 380 ? 28 : 32;
<Icon name={template.icon} size={iconSize} color={template.color} />
```

## 접근성 개선
- 최소 터치 영역 44x44 포인트 확보
- 색상 대비율 WCAG AA 기준 충족
- 스크린 리더를 위한 accessibilityLabel 추가

## 애니메이션 제안
- 템플릿 선택 시 스프링 애니메이션
- 스크롤 시 패럴랙스 효과
- 추천 배지 펄스 애니메이션

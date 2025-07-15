# 테마 색상 통합 가이드

## 문제점
- 각 화면마다 다크모드 대응 방식이 다름
- HomeScreen: `colors.background === '#1A202C'`로 다크모드 체크
- MyStyleScreen: `isDark` 플래그 사용
- 색상값이 하드코딩되어 있음

## 해결 방안

### 1. 통합된 테마 시스템 도입
`src/styles/themeStyles.ts` 파일에 통합된 색상 시스템 구현:

```typescript
// 통합된 색상 가져오기
const { theme } = useAppTheme();

// 사용 예시
color: theme.colors.text.primary     // 기본 텍스트
color: theme.colors.text.secondary   // 보조 텍스트
backgroundColor: theme.colors.backgrounds.card  // 카드 배경
```

### 2. 색상 매핑

#### 텍스트 색상
- `colors.text` → `theme.colors.text.primary`
- `colors.textSecondary` → `theme.colors.text.secondary`
- `colors.textTertiary` → `theme.colors.text.tertiary`

#### 배경색
- `colors.surface` → `theme.colors.backgrounds.card`
- `colors.background` → `theme.colors.backgrounds.primary`
- `colors.lightGray` → `theme.colors.backgrounds.tertiary`

#### 테두리
- `colors.border` → `theme.colors.borders.default`
- 다크모드 테두리 → `theme.colors.borders.light`

### 3. 다크모드 대응
기존:
```typescript
color: isDark ? '#FFFFFF' : colors.text
backgroundColor: colors.background === '#1A202C' ? '#2C2C2E' : colors.surface
```

개선:
```typescript
color: theme.colors.text.primary
backgroundColor: theme.colors.backgrounds.card
```

### 4. 그림자 효과
기존:
```typescript
...cardTheme.shadow
shadowOpacity: isDark ? 0.3 : 0.05
```

개선:
```typescript
...theme.shadows.small  // 작은 그림자
...theme.shadows.medium // 중간 그림자
...theme.shadows.large  // 큰 그림자
```

### 5. 적용 순서
1. MyStyleScreen ✅ (완료)
2. HomeScreen
3. SettingsScreen
4. AIWriteScreen
5. 나머지 화면들

### 6. 하위 호환성
- 기존 `colors`와 `cardTheme`은 유지
- 새로운 화면이나 리팩토링 시 `theme` 사용
- 점진적 마이그레이션 가능

## 장점
1. **일관성**: 모든 화면에서 동일한 색상 시스템
2. **유지보수**: 한 곳에서 색상 관리
3. **다크모드**: 자동으로 적용되는 색상
4. **가독성**: 하드코딩된 색상값 제거
5. **확장성**: 새로운 테마 추가 용이

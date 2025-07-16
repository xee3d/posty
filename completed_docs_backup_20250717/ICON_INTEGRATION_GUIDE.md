# 아이콘 라이브러리 통합 가이드

## 현재 상황
- HomeScreen.tsx: Ionicons와 MaterialIcons 혼용
- personalizedRecommendationService.ts: Material Icons 이름 사용

## 권장 해결 방법

### 1. HomeScreen.tsx 수정 필요 사항

#### 추천 카드 렌더링 부분 수정
```javascript
// 현재 코드 (문제 발생)
<Icon name={card.meta.icon} size={14} color={colors.text.secondary} />

// 수정 후 (MaterialIcon 사용)
<MaterialIcon name={card.meta.icon} size={14} color={colors.text.secondary} />
```

### 2. 전체 프로젝트 아이콘 표준화

#### A. Material Icons로 통일 (권장)
Material Icons가 더 많은 아이콘을 제공하므로 이것으로 통일하는 것을 권장합니다.

```javascript
// 모든 컴포넌트에서
import Icon from 'react-native-vector-icons/MaterialIcons';

// 기존 Ionicons 전용 아이콘 변경
'logo-instagram' → 'instagram' (또는 그대로 Ionicons 사용)
'chevron-up' → 'keyboard-arrow-up'
'chevron-down' → 'keyboard-arrow-down'
```

#### B. 라이브러리별 컴포넌트 분리
```javascript
import IonIcon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

// 소셜 미디어 로고는 Ionicons 사용
<IonIcon name="logo-instagram" />

// 일반 UI 아이콘은 Material Icons 사용
<MaterialIcon name="access-time" />
```

### 3. 즉시 적용 가능한 수정

HomeScreen.tsx에서 다음 부분을 찾아 수정:

```javascript
// 추천 카드의 메타 아이콘 부분
{recommendations.map((card, index) => (
  // ... 
  <View style={styles.recommendMeta}>
    <MaterialIcon name={card.meta.icon} size={14} color={colors.text.secondary} />
    <Text style={styles.recommendMetaText}>{card.meta.text}</Text>
  </View>
  // ...
))}
```

### 4. 아이콘 타입 정의 추가

```typescript
// types/index.ts 또는 별도 파일
export type IconLibrary = 'ionicons' | 'material';

export interface IconProps {
  name: string;
  size?: number;
  color?: string;
  library?: IconLibrary;
}

// 유틸리티 컴포넌트
export const UniversalIcon: React.FC<IconProps> = ({ 
  name, 
  size = 24, 
  color = '#000', 
  library = 'material' 
}) => {
  if (library === 'ionicons') {
    return <IonIcon name={name} size={size} color={color} />;
  }
  return <MaterialIcon name={name} size={size} color={color} />;
};
```

## 실행 명령어

```bash
cd C:\Users\xee3d\Documents\Posty_V74
npx react-native run-android
```

## 체크리스트
- [ ] personalizedRecommendationService.ts의 아이콘 이름이 Material Icons 형식인지 확인
- [ ] HomeScreen.tsx에서 추천 카드의 아이콘 렌더링이 MaterialIcon을 사용하는지 확인
- [ ] 다른 컴포넌트들의 아이콘 사용 일관성 확인
- [ ] 앱 실행 후 아이콘 에러 없는지 확인

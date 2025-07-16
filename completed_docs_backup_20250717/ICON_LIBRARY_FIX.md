# Icon Library 혼용 문제 해결 가이드

## 🚨 현재 문제
`sunny-outline`이 Material Icons 컴포넌트에 전달되어 에러 발생

## 📍 문제 원인
1. `personalizedRecommendationService.ts`에서 Ionicons 이름으로 변경했지만
2. `HomeScreen.tsx`에서는 Material Icons를 사용 중
3. 두 라이브러리의 아이콘 이름이 다름

## 🔧 해결 방법

### Option 1: Material Icons 사용 유지 (권장)
`personalizedRecommendationService.ts`의 아이콘 이름을 Material Icons 이름으로 되돌리기:

```typescript
// personalizedRecommendationService.ts
private recommendationTemplates: RecommendationCard[] = [
  {
    icon: 'wb-sunny',  // Material Icons 이름 사용
    // ...
  }
]
```

### Option 2: 라이브러리별 아이콘 타입 추가
RecommendationCard 인터페이스 수정:

```typescript
export interface RecommendationCard {
  id: string;
  type: 'calendar' | 'photo' | 'timing' | 'trending' | 'completion' | 'milestone' | 'weather';
  icon: string;
  iconLibrary?: 'material' | 'ionicons';  // 추가
  iconColor: string;
  // ...
}
```

HomeScreen.tsx에서 조건부 렌더링:

```javascript
{recommendations.map((card, index) => (
  <AnimatedCard key={card.id}>
    <View style={[styles.recommendIconContainer, { backgroundColor: card.iconColor }]}>
      {card.iconLibrary === 'ionicons' ? (
        <Icon name={card.icon} size={24} color={colors.white} />
      ) : (
        <MaterialIcon name={card.icon} size={24} color={colors.white} />
      )}
    </View>
    {/* ... */}
  </AnimatedCard>
))}
```

### Option 3: 전체 프로젝트를 하나의 아이콘 라이브러리로 통일

#### Material Icons로 통일하는 경우:
```javascript
// 모든 컴포넌트에서
import Icon from 'react-native-vector-icons/MaterialIcons';

// personalizedRecommendationService.ts 원래대로 복구
icon: 'wb-sunny',
icon: 'access-time',
icon: 'restaurant',
// 등등...
```

## 🛠️ 즉시 해결 스크립트

### personalizedRecommendationService.ts 복구:
```bash
cd C:\Users\xee3d\Documents\Posty_V74
```

그 다음 다음 매핑으로 아이콘 이름 되돌리기:

| 현재 (Ionicons) | 원래 (Material Icons) |
|-----------------|----------------------|
| sunny-outline | wb-sunny |
| restaurant-outline | restaurant |
| time-outline | access-time |
| camera-outline | photo-camera |
| calendar-outline | event |
| happy-outline | celebration |
| leaf-outline | park |
| umbrella-outline | umbrella |
| water-outline | water |
| flag-outline | flag |
| rocket-outline | rocket-launch |
| trophy-outline | emoji-events |
| star-outline | grade |
| images-outline | photo-library |
| albums-outline | collections |
| flame-outline | whatshot |
| create-outline | edit-note |
| hourglass-outline | hourglass |

## 📋 최종 권장사항

1. **단기 해결**: personalizedRecommendationService.ts의 아이콘 이름을 Material Icons로 되돌리기
2. **장기 해결**: 프로젝트 전체에서 하나의 아이콘 라이브러리만 사용하도록 통일
3. **타입 안전성**: TypeScript와 상수를 사용하여 아이콘 이름 관리

## 🔍 디버깅 팁

아이콘 에러 발생 시:
1. 에러 메시지에서 어떤 컴포넌트인지 확인 (Icon vs MaterialIcon)
2. 해당 라이브러리의 유효한 아이콘 목록 확인
3. 적절한 아이콘 이름으로 변경

Material Icons 목록: https://fonts.google.com/icons
Ionicons 목록: https://ionic.io/ionicons

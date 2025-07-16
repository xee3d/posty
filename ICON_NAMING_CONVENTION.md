# Icon Naming Convention Guide for Posty

## 🚨 중요: React Native Vector Icons 라이브러리별 아이콘 규칙

React Native Vector Icons는 여러 아이콘 세트를 지원하며, 각 세트마다 다른 아이콘 이름 규칙을 가지고 있습니다.

## 📋 현재 프로젝트 상황

### 사용 중인 라이브러리
```javascript
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
```

### ⚠️ 주의사항
- **Ionicons**와 **MaterialIcons**는 서로 다른 아이콘 이름 체계를 사용합니다
- 잘못된 아이콘 이름을 사용하면 런타임 에러가 발생합니다

## 🔄 아이콘 이름 매핑 규칙

### Material Icons → Ionicons 변환 규칙

| Material Icons | Ionicons | 용도 |
|----------------|----------|------|
| `access-time` | `time-outline` | 시간 표시 |
| `edit` | `create-outline` | 편집 |
| `auto-fix-high` | `color-wand-outline` | 자동 수정 |
| `image` | `image-outline` | 이미지 |
| `photo-camera` | `camera-outline` | 카메라 |
| `monetization-on` | `cash-outline` | 돈/결제 |
| `animation` | `pulse-outline` | 애니메이션 |
| `workspace-premium` | `star-outline` | 프리미엄/구독 |
| `tips-and-updates` | `bulb-outline` | 팁/아이디어 |
| `add-circle` | `add-circle-outline` | 추가 |
| `wb-sunny` | `sunny-outline` | 맑은 날씨 |
| `restaurant` | `restaurant-outline` | 레스토랑 |
| `event` | `calendar-outline` | 이벤트/캘린더 |
| `celebration` | `happy-outline` | 축하/파티 |
| `weekend` | `calendar-outline` | 주말 |
| `park` | `leaf-outline` | 공원/자연 |
| `umbrella` | `umbrella-outline` | 우산 |
| `water` | `water-outline` | 물 |
| `flag` | `flag-outline` | 깃발 |
| `rocket-launch` | `rocket-outline` | 로켓 |
| `emoji-events` | `trophy-outline` | 트로피 |
| `grade` | `star-outline` | 등급/별 |
| `photo-library` | `images-outline` | 사진 라이브러리 |
| `collections` | `albums-outline` | 컬렉션 |
| `whatshot` | `flame-outline` | 인기/핫 |
| `edit-note` | `create-outline` | 노트 편집 |
| `hourglass` | `hourglass-outline` | 모래시계 |
| `wb-twilight` | `sunny-outline` | 황혼 |
| `sunny` | `sunny-outline` | 맑음 |

## 🎯 개발 규칙

### 1. 아이콘 사용 전 확인사항
```javascript
// ❌ 잘못된 예시
<Icon name="access-time" /> // Ionicons에 없는 Material 아이콘 이름

// ✅ 올바른 예시
<Icon name="time-outline" /> // Ionicons 전용 이름
```

### 2. 라이브러리별 사용법
```javascript
// Ionicons 사용 시
import Icon from 'react-native-vector-icons/Ionicons';
<Icon name="time-outline" size={24} color="#000" />

// MaterialIcons 사용 시
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
<MaterialIcon name="access-time" size={24} color="#000" />
```

### 3. 아이콘 이름 네이밍 컨벤션

#### Ionicons 규칙
- 기본형: `{icon-name}`
- Outline 버전: `{icon-name}-outline`
- Sharp 버전: `{icon-name}-sharp`
- 예시: `time`, `time-outline`, `time-sharp`

#### MaterialIcons 규칙
- 단어 구분: 언더스코어(`_`) 또는 하이픈(`-`)
- 예시: `access_time`, `auto-fix-high`

## 🔍 아이콘 검색 방법

### 1. Ionicons
- 공식 사이트: https://ionic.io/ionicons
- 검색 후 v5+ 버전의 아이콘 이름 사용

### 2. MaterialIcons
- 공식 사이트: https://fonts.google.com/icons
- Material Design Icons 검색

## 📝 코드 리뷰 체크리스트

새로운 아이콘 추가 시:
- [ ] 사용하는 아이콘 라이브러리 확인 (Ionicons vs MaterialIcons)
- [ ] 해당 라이브러리에서 지원하는 아이콘 이름인지 확인
- [ ] outline/sharp 버전이 필요한지 확인
- [ ] 런타임에서 에러가 발생하지 않는지 테스트

## 🛠️ 디버깅 팁

아이콘 에러 발생 시:
1. 에러 메시지에서 잘못된 아이콘 이름 확인
2. 위 매핑 테이블 참조하여 올바른 이름으로 변경
3. 사용 중인 아이콘 라이브러리 확인
4. 필요시 다른 아이콘 라이브러리로 변경

## 💡 권장사항

1. **일관성 유지**: 프로젝트 전체에서 하나의 아이콘 라이브러리를 주로 사용
2. **문서화**: 새로운 아이콘 추가 시 이 문서에 매핑 정보 업데이트
3. **타입 안전성**: TypeScript 사용 시 아이콘 이름을 상수로 정의

```typescript
// constants/icons.ts
export const ICONS = {
  TIME: 'time-outline',
  EDIT: 'create-outline',
  CAMERA: 'camera-outline',
  // ... 더 많은 아이콘
} as const;

// 사용
<Icon name={ICONS.TIME} />
```

## 🚀 마이그레이션 가이드

Material Icons에서 Ionicons로 전환 시:
1. 이 문서의 매핑 테이블 참조
2. 전역 검색으로 모든 아이콘 사용처 찾기
3. 하나씩 변경하며 테스트
4. 변경 사항 커밋

---

**Last Updated**: 2025-07-16
**Version**: 1.0

⚠️ **중요**: 이 규칙을 따르지 않으면 런타임 에러가 발생합니다!

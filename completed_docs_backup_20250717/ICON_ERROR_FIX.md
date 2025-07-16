# Icon Error Fix Guide

## 문제 설명
`access-time` 아이콘이 Ionicons에서 지원되지 않아 발생하는 에러입니다.

## 해결 방법

### 1. personalizedRecommendationService.ts 수정 완료
이미 `access-time`을 `time-outline`으로 변경했습니다.

### 2. HomeScreen.tsx에서 MaterialIcon 아이콘 이름 변경 필요

MaterialIcons에서 Ionicons로 변경할 아이콘 매핑:

```javascript
// MaterialIcon 컴포넌트의 아이콘 이름 변경
const iconMapping = {
  'edit': 'create-outline',
  'auto-fix-high': 'color-wand-outline', 
  'image': 'image-outline',
  'monetization-on': 'cash-outline',
  'animation': 'pulse-outline',
  'workspace-premium': 'star-outline',
  'tips-and-updates': 'bulb-outline',
  'add-circle': 'add-circle-outline'
};
```

### 3. 수정 방법

HomeScreen.tsx에서 다음과 같이 변경하세요:

```javascript
// 변경 전
<MaterialIcon name="edit" size={24} color={colors.white} />

// 변경 후
<MaterialIcon name="create-outline" size={24} color={colors.white} />
```

### 4. 전체 아이콘 목록 확인

다음 명령어로 앱을 실행하여 에러를 확인하세요:

```bash
cd C:\Users\xee3d\Documents\Posty_V74
npx react-native run-android
```

에러가 발생하면 에러 메시지에서 문제가 되는 아이콘 이름을 확인하고, Ionicons에서 지원하는 이름으로 변경하세요.

### 5. Ionicons 지원 아이콘 목록

Ionicons에서 지원하는 아이콘 목록은 다음에서 확인할 수 있습니다:
- https://ionic.io/ionicons

### 6. 추가 문제 해결

만약 MaterialIcon을 사용하는 모든 곳에서 문제가 발생한다면, MaterialIcons 라이브러리를 별도로 import해야 할 수 있습니다:

```javascript
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
```

현재는 Ionicons만 import하고 있는 것으로 보입니다.

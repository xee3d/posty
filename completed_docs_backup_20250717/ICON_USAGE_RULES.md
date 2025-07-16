# 아이콘 사용 규칙 업데이트

## 🔧 프로젝트 구조 개선

### 1. 아이콘 상수 파일 생성 완료
`src/constants/iconConstants.ts` 파일을 생성하여 모든 아이콘 이름을 중앙 관리합니다.

### 2. 사용 방법

#### 기존 방식 (문제 발생 가능)
```javascript
// ❌ 하드코딩된 아이콘 이름 - 오타나 잘못된 이름 사용 가능
<Icon name="access-time" />
<MaterialIcon name="edit" />
```

#### 새로운 방식 (권장)
```javascript
import { ICON_NAMES, getIonIconName } from '../constants/iconConstants';

// ✅ 상수 사용 - 타입 안전성과 자동완성 지원
<Icon name={ICON_NAMES.TIME} />
<Icon name={ICON_NAMES.EDIT} />

// ✅ Material Icon 이름을 Ionicon으로 자동 변환
const iconName = getIonIconName('access-time'); // 'time-outline' 반환
<Icon name={iconName} />
```

### 3. 마이그레이션 가이드

#### Step 1: Import 추가
```javascript
import { ICON_NAMES } from '../constants/iconConstants';
```

#### Step 2: 아이콘 이름 변경
```javascript
// 변경 전
<Icon name="time-outline" />
<Icon name="create-outline" />
<MaterialIcon name="edit" />

// 변경 후
<Icon name={ICON_NAMES.TIME} />
<Icon name={ICON_NAMES.EDIT} />
<Icon name={ICON_NAMES.EDIT} /> // MaterialIcon도 Ionicon으로 통일
```

### 4. TypeScript 지원
타입 안전성을 위해 TypeScript를 사용하는 경우:

```typescript
import { IconName, ICON_NAMES } from '../constants/iconConstants';

interface Props {
  iconName: IconName;
}

const MyComponent: React.FC<Props> = ({ iconName }) => {
  return <Icon name={iconName} />;
};

// 사용
<MyComponent iconName={ICON_NAMES.TIME!} />
```

### 5. 플랫폼별 아이콘
iOS와 Android에서 다른 아이콘을 사용해야 하는 경우:

```javascript
// iconConstants.ts에서 자동으로 플랫폼별 아이콘 선택
TIME: Platform.select({ 
  ios: 'time-outline', 
  android: 'time-outline' 
})
```

### 6. 새 아이콘 추가 방법
1. `src/constants/iconConstants.ts` 파일 열기
2. `ICON_NAMES` 객체에 새 아이콘 추가
3. 필요시 `ICON_MAPPING`에 매핑 추가

```javascript
export const ICON_NAMES = {
  // ... 기존 아이콘들
  
  // 새 아이콘 추가
  MY_NEW_ICON: Platform.select({ 
    ios: 'new-icon-outline', 
    android: 'new-icon-outline' 
  }),
};
```

### 7. ESLint 규칙 추가 (선택사항)
하드코딩된 아이콘 이름 사용을 방지하기 위한 린트 규칙:

```javascript
// .eslintrc.js
module.exports = {
  rules: {
    'no-restricted-syntax': [
      'error',
      {
        selector: 'JSXAttribute[name.name="name"][value.type="Literal"]',
        message: 'Use ICON_NAMES constant instead of hardcoded icon names',
      },
    ],
  },
};
```

## 🎯 이점

1. **타입 안전성**: TypeScript 자동완성과 타입 체크
2. **중앙 관리**: 모든 아이콘 이름을 한 곳에서 관리
3. **오류 방지**: 잘못된 아이콘 이름 사용 방지
4. **쉬운 마이그레이션**: Material Icons에서 Ionicons로 쉽게 전환
5. **플랫폼 대응**: iOS/Android 플랫폼별 아이콘 자동 선택
6. **유지보수성**: 아이콘 변경 시 한 곳만 수정

## 📋 체크리스트

프로젝트에 적용할 때:
- [ ] `src/constants/iconConstants.ts` 파일 생성
- [ ] 모든 컴포넌트에서 아이콘 import 변경
- [ ] 하드코딩된 아이콘 이름을 상수로 변경
- [ ] 앱 실행 테스트
- [ ] 팀원들에게 새로운 규칙 공유

---

이제 아이콘 관련 에러가 발생하지 않도록 체계적으로 관리할 수 있습니다!

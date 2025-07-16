# 🐛 버그 수정 보고서

## 수정 일자: 2025-07-16

### 1. Require Cycle 해결 ✅

**문제**: 
```
WARN Require cycle: src\services\simplePostService.ts -> src\services\achievementService.ts -> src\services\simplePostService.ts
```

**원인**:
- `simplePostService`와 `achievementService`가 서로를 직접 import하는 순환 참조 발생

**해결 방법**:
1. **타입 분리**: 공통 인터페이스를 `src/services/types/postTypes.ts`로 분리
2. **이벤트 기반 아키텍처 도입**:
   - `simplePostService`에 이벤트 리스너 패턴 구현
   - `achievementService`는 이벤트 리스너로 등록
3. **Lazy Import**: `achievementService`에서 `simplePostService`를 lazy import로 사용

**변경된 파일**:
- `src/services/types/postTypes.ts` (새로 생성)
- `src/services/simplePostService.ts`
- `src/services/achievementService.ts`

### 2. Icon 에러 해결 ✅

**문제**:
```
ERROR Warning: Failed prop type: Invalid prop `name` of value `access-time` supplied to `Icon`
```

**원인**:
- `access-time`은 Material Icons의 아이콘 이름이지만, Ionicons에서 사용 시도

**해결 방법**:
1. **아이콘 매핑 추가**: `SafeIcon.tsx`에 Material Icons → Ionicons 매핑 추가
   - `access-time` → `time-outline`
   - `schedule` → `calendar-outline`
   - `access-alarm` → `alarm-outline`
   - `query-builder` → `time-outline`

**변경된 파일**:
- `src/utils/SafeIcon.tsx`

## 추가 권장사항

### 1. 아이콘 사용 표준화
```tsx
// 권장하지 않음
<Icon name="access-time" />

// 권장
<Icon name="time-outline" />
// 또는
<SafeIcon name="access-time" /> // 자동 변환
```

### 2. Import 최적화
```tsx
// 순환 참조를 피하기 위한 import 순서
// 1. 외부 라이브러리
// 2. 타입/인터페이스
// 3. 유틸리티
// 4. 컴포넌트
// 5. 서비스 (lazy import 고려)
```

### 3. 테스트 방법
```bash
# 개발 서버 재시작
cd C:\Users\xee3d\Documents\Posty_V74
npx react-native start --reset-cache

# Android 앱 재빌드
cd C:\Users\xee3d\Documents\Posty_V74
npx react-native run-android
```

## 성능 영향
- **Require Cycle 제거**: 앱 시작 시간 개선, 메모리 사용량 감소
- **Icon 에러 해결**: 개발 환경에서 경고 메시지 제거, 디버깅 용이성 향상

## 예방 조치
1. **순환 참조 체크**: 새로운 서비스 추가 시 의존성 그래프 확인
2. **아이콘 가이드라인**: 프로젝트에서 사용할 아이콘 라이브러리 표준화
3. **CI/CD 파이프라인**: 빌드 시 경고를 에러로 처리하는 옵션 고려

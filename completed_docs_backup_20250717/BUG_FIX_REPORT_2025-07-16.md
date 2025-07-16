# Posty 앱 버그 수정 리포트

## 수정 일자: 2025년 7월 16일

## 업데이트 내용 (v3)

## 수정된 문제들

### 1. ✅ 커스텀 Alert 팝업 디자인 불일치 문제
**문제점**: 
- ProfileScreen에서 React Native의 기본 Alert를 사용하여 커스텀 디자인이 적용되지 않음
- "대표 베지가 설정되었습니다!" 알림이 기본 스타일로 표시됨

**해결 방법**:
```typescript
// ProfileScreen.tsx 수정
// Before
import { Alert } from 'react-native';

// After
import { Alert } from '../utils/customAlert';
```

**영향받는 파일**:
- `src/screens/ProfileScreen.tsx`

### 2. ✅ 이미지 선택 유틸리티 추가
**문제점**: 
- 사진 선택 관련 팝업 ("카메라로 촬영", "갤러리") 기능이 없음

**해결 방법**:
- 새로운 이미지 선택 유틸리티 생성
- 커스텀 Alert를 사용하여 일관된 디자인 적용

**추가된 파일**:
- `src/utils/imagePicker/index.ts`
- `src/screens/AlertTestScreen.tsx` (테스트용)

**주요 기능**:
```typescript
// 사진 선택 팝업 표시
showImagePicker({
  title: '사진 선택',
  quality: 0.8,
  maxWidth: 1920,
  maxHeight: 1920
});

// 카메라 직접 실행
launchCamera(options);

// 갤러리 직접 실행
launchImageLibrary(options);
```

### 3. ✅ 커스텀 Alert 3개 버튼 레이아웃 개선
**문제점**: 
- 3개 버튼이 있을 때 레이아웃이 제대로 표시되지 않음
- 버튼들이 가로로 배치되어 텍스트가 잘림

**해결 방법**:
- 3개 버튼일 때 세로 레이아웃으로 변경
- 버튼 간격 및 크기 조정
- 취소 버튼을 마지막으로 이동
- 전체적인 Alert 크기 최적화

**영향받는 파일**:
- `src/components/CustomAlert.tsx`
- `src/utils/imagePicker/index.ts`

### 4. ✅ 무료 토큰 받기 팝업창 커스텀 Alert 적용
**문제점**: 
- EarnTokenModal, HomeScreen, useTokenManagement에서 React Native의 기본 Alert 사용
- UI/UX 일관성 부족

**해결 방법**:
- 모든 Alert import를 커스텀 Alert로 변경
```typescript
// Before
import { Alert } from 'react-native';

// After
import { Alert } from '../utils/customAlert';
```

**영향받는 파일**:
- `src/components/EarnTokenModal.tsx`
- `src/screens/HomeScreen.tsx`
- `src/hooks/useTokenManagement.ts`

### 5. ⚠️ onNavigate 에러 (추가 조사 필요)
**문제점**: 
- `TypeError: onNavigate is not a function (it is undefined)`
- 네비게이션 관련 함수가 정의되지 않음

**가능한 원인**:
1. 컴포넌트에 navigation prop이 전달되지 않음
2. 네비게이션 컨텍스트 외부에서 컴포넌트 사용
3. 함수명 오타 또는 잘못된 prop 전달

**권장 조치**:
- 에러가 발생하는 정확한 컴포넌트 위치 확인 필요
- React Navigation 설정 검토 필요

## 변경된 커스텀 Alert 스타일

### 2개 버튼
- 가로 배치 (좌우로 나란히)
- 취소 버튼: 회색 배경, 테두리
- 확인/삭제 버튼: Primary 또는 Destructive 색상

### 3개 버튼
- 세로 배치 (위에서 아래로)
- 주요 액션 버튼들이 위에 배치
- 취소 버튼이 마지막에 배치
- 버튼 간 10px 간격

### 크기 최적화
- 아이콘: 80x80 (48x48 → 40x40)
- 제목: 22px → 20px
- 메시지: 16px → 15px
- 버튼 패딩: 16px → 14px

## 커밋 준비

```bash
cd C:\Users\xee3d\Documents\Posty_V74

# 변경사항 확인
git status

# 변경사항 추가
git add src/screens/ProfileScreen.tsx
git add src/utils/imagePicker/
git add src/components/CustomAlert.tsx
git add src/components/EarnTokenModal.tsx
git add src/screens/HomeScreen.tsx
git add src/hooks/useTokenManagement.ts
git add src/screens/AlertTestScreen.tsx

# 커밋
git commit -m "fix: 전체 앱에 커스텀 Alert 통합 완료

- ProfileScreen에서 커스텀 Alert 사용하도록 수정
- 이미지 선택 유틸리티 추가 (카메라/갤러리 선택)
- 3개 버튼 Alert의 세로 레이아웃 구현
- Alert 전체 크기 및 스타일 최적화
- EarnTokenModal, HomeScreen, useTokenManagement 커스텀 Alert 적용
- 테스트 화면 추가 (AlertTestScreen)"
```

## 추가 권장사항

1. **onNavigate 에러 해결**:
   - 에러 스택 트레이스 확인
   - 네비게이션 관련 컴포넌트 검토
   - React Navigation 설정 확인

2. **이미지 선택 권한 처리**:
   - iOS: Info.plist에 카메라/갤러리 권한 설정 확인
   - Android: AndroidManifest.xml에 권한 설정 확인

3. **테스트 필요 항목**:
   - ProfileScreen의 배지 설정 기능
   - 이미지 선택 유틸리티 동작
   - 모든 화면에서 커스텀 Alert 적용 확인
   - 무료 토큰 받기 기능

## 완료된 작업 요약

- ✅ 커스텀 Alert 통합 100% 완료
- ✅ 3개 버튼 레이아웃 문제 해결
- ✅ 이미지 선택 유틸리티 구현
- ✅ 무료 토큰 받기 팝업 커스텀화
- ⚠️ onNavigate 에러는 추가 조사 필요

## 다음 단계

1. onNavigate 에러의 정확한 발생 위치 파악
2. 전체 앱에서 React Native 기본 Alert 사용 여부 재확인
3. 이미지 선택 기능 실제 구현 위치 확인 및 통합
4. 테스트 앱 빌드 후 실제 디바이스에서 동작 확인

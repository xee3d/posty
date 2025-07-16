# 설정 화면 수정 사항

## 수정 완료 (2025-07-16)

### 1. ✅ 토큰 디버그 정보 제거
- 개발용 토큰 디버그 버튼 완전 제거
- 프로덕션 환경에서 불필요한 디버그 기능 제거

### 2. ✅ 중복 메뉴 항목 제거
- "내 업적" 메뉴 제거 (프로필 카드의 "내 업적 보기" 버튼과 중복)
- "Posty 평가하기" 메뉴 제거 (무료 토큰 받기의 앱 평가하기와 중복)

### 3. ✅ 이용약관 뒤로가기 에러 수정
- TermsOfServiceScreen의 props 수정
  - `onNavigate` → `onBack` 추가
  - optional onNavigate 처리
- PrivacyPolicyScreen, ContactScreen도 동일하게 수정

### 4. ✅ 메뉴 구조 개선
- 지원 섹션 메뉴 간소화
  - 사용 가이드
  - 문의하기
  - 이용약관
  - 개인정보 처리방침

## 주요 변경 사항

### SettingsScreen.tsx
```typescript
// 토큰 디버그 버튼 제거
// {__DEV__ && (...)} 블록 완전 제거

// 중복 메뉴 제거
const menuItems = [
  // { icon: 'trophy', ... } 제거
  // { icon: 'star-outline', ... } 제거
  { icon: 'help-circle-outline', label: '사용 가이드', ... },
  { icon: 'mail-outline', label: '문의하기', ... },
  { icon: 'document-text-outline', label: '이용약관', ... },
  { icon: 'shield-checkmark-outline', label: '개인정보 처리방침', ... },
];

// 문서 화면 props 수정
if (showTerms) {
  return <TermsOfServiceScreen onBack={() => setShowTerms(false)} onNavigate={onNavigate} />;
}
```

### TermsOfServiceScreen.tsx (및 기타 문서 화면)
```typescript
interface TermsOfServiceScreenProps {
  onBack: () => void;
  onNavigate?: (screen: string) => void;
}

// onBack 사용
<TouchableOpacity onPress={onBack} style={styles.backButton}>
```

## 결과
- 설정 화면이 더 깔끔하고 직관적으로 개선됨
- 중복 기능 제거로 사용자 경험 향상
- 네비게이션 에러 해결

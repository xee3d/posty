// SettingsScreen.tsx 수정 가이드

// 1. menuItems 배열 찾아서 다음으로 교체:
const menuItems = [
  {
    icon: 'help-circle-outline',
    label: '사용 가이드',
    onPress: handleOpenHelp,
  },
  {
    icon: 'mail-outline',
    label: '문의하기',
    onPress: () => setShowContact(true),
  },
  {
    icon: 'document-text-outline',
    label: '이용약관',
    onPress: () => setShowTerms(true),
  },
  {
    icon: 'shield-checkmark-outline',
    label: '개인정보 처리방침',
    onPress: () => setShowPrivacy(true),
  },
];

// 2. 개발용 버튼들 부분 찾아서 삭제:
// {/* 개발용 버튼들 - 토큰 디버그만 남김 */}
// {__DEV__ && ( ... )} 전체 블록 삭제

// 3. 문서 화면들 렌더링 부분 찾아서 다음으로 교체:
if (showUserGuide) {
  return <UserGuideScreen onBack={() => setShowUserGuide(false)} onContact={() => {
    setShowUserGuide(false);
    setShowContact(true);
  }} />;
}

if (showTerms) {
  return <TermsOfServiceScreen onBack={() => setShowTerms(false)} onNavigate={onNavigate} />;
}

if (showPrivacy) {
  return <PrivacyPolicyScreen onBack={() => setShowPrivacy(false)} onNavigate={onNavigate} />;
}

if (showContact) {
  return <ContactScreen onBack={() => setShowContact(false)} onNavigate={onNavigate} />;
}

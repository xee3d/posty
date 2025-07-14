# 🔑 로그인 페이지 접근 방법

## 1. 앱 시작 시 로그인 화면으로
`App.tsx`에서 설정:
```typescript
// 개발 모드에서 로그인 건너뛰기 (현재 true)
const SKIP_LOGIN = __DEV__ && true; // false로 변경하면 로그인 필수

// 또는 초기 화면 설정
const [activeTab, setActiveTab] = useState('login'); // 'home' → 'login'
```

## 2. 설정에서 로그아웃
설정 화면 맨 아래 **로그아웃** 버튼 클릭 → 로그인 화면으로 이동

## 3. 개발자 모드 단축키 (App.tsx 수정)
```typescript
// App.tsx에 추가
useEffect(() => {
  // 개발 모드에서 Ctrl+L 누르면 로그인 화면으로
  if (__DEV__) {
    const handleKeyPress = (e: any) => {
      if (e.ctrlKey && e.key === 'l') {
        setActiveTab('login');
      }
    };
    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }
}, []);
```

## 4. 구현된 기능들

### ✅ 로그인 기능
- Google 소셜 로그인 (Firebase 연동)
- Naver 소셜 로그인 (Custom Token)
- Kakao 소셜 로그인 (Custom Token)
- 게스트 모드 (둘러보기)

### ✅ 사용자 프로필 표시
- Settings 화면에 로그인한 사용자 정보 표시
- 프로필 사진, 이름, 이메일 표시
- Redux 상태 관리

### ✅ 로그아웃 기능
- Settings 화면 하단 로그아웃 버튼
- 소셜 로그인 SDK 로그아웃
- Redux 상태 초기화
- 로그인 화면으로 자동 이동

### ✅ 자동 로그인
- AsyncStorage에 프로필 저장
- 앱 시작 시 자동 로그인 체크
- Firebase Auth 상태 리스너

### ✅ 토큰 관리 연동
- 로그인한 사용자별 토큰 관리
- 구독 상태와 연동
- 사용자 ID 기반 토큰 저장

## 5. 테스트 방법

### 개발 모드 테스트 (API 키 불필요)
1. `App.tsx`에서 `SKIP_LOGIN = false` 설정
2. 앱 실행 → 자동으로 로그인 화면 표시
3. 소셜 로그인 버튼 클릭 → 테스트 계정으로 로그인

### 실제 소셜 로그인 테스트
1. `.env` 파일에 API 키 설정
2. Android 네이티브 설정 완료
3. 앱 빌드 및 실행
4. 실제 계정으로 로그인

## 6. 추가 개선 사항
- [ ] 프로필 편집 시 프로필 사진 변경
- [ ] 소셜 계정 연결/해제 기능
- [ ] 로그인 유지 기간 설정
- [ ] 생체 인증 (지문/Face ID)

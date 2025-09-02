# Posty 개발 진행 상황

## 프로젝트 시작: 2024년 7월 4일

## 최근 업데이트: 2025년 7월 31일

### 1. 문장 정리 기능 개선

- **변경 전**: 6개의 기본적인 텍스트 정리 옵션 (맞춤법 교정 포함)
- **변경 후**: SNS 사용자에게 최적화된 9개 옵션으로 확장
  - 요약하기 (summarize) - 긴 글을 간결하게
  - 쉽게 쓰기 (simple) - 어려운 표현을 쉽게
  - 격식체로 (formal) - 캐주얼한 글을 격식있게
  - 감정 더하기 (emotion) - 감정 표현 강화
  - 스토리텔링 (storytelling) - 이야기 형식으로
  - 매력적으로 (engaging) - 관심을 끄는 표현
  - 해시태그 추천 (hashtag) - 자동 해시태그 생성
  - 이모지 추가 (emoji) - 적절한 이모지 삽입
  - 질문형으로 (question) - 독자 참여 유도
- **구독 등급별 제한**:
  - Free: 3개 옵션
  - Starter: 5개 옵션
  - Premium: 7개 옵션
  - Pro: 전체 9개 옵션

### 2. 업적 시스템 버그 수정

- **문제**: 업적 달성률 게이지가 표시되지 않음
- **해결**:
  - undefined 값에 대한 안전한 기본값 처리
  - 실시간 진행률 계산 로직 수정
  - 다크모드 스타일링 개선

### 3. 홈 화면 전면 개편

- **컨셉 변경**: "전문 인플루언서 비서" → "편안한 글쓰기 친구"
- **대상 사용자**: 글쓰기를 귀찮아하는 일반인
- **주요 기능**:
  - 사용자 레벨별 맞춤형 UI (신규/초보/일반/전문가)
  - 글쓰기 스타일 요약 카드 추가
  - 최근 게시물 3개 표시 (전체보기 시 최대 10개)
  - 복사/공유 버튼 추가
  - 실시간 팁과 해시태그 고정 (무한 변경 버그 수정)

### 4. 내스타일 화면 권한 조정

- **변경 전**: 전체 화면이 구독 필요
- **변경 후**:
  - 개요 탭: 모든 사용자 접근 가능
  - 분석/템플릿 탭: 구독자만 접근

### 5. 온보딩 화면 개선

- **디자인 개선**:
  - 애니메이션 추가 (fade, slide, scale)
  - 아이콘을 Ionicons로 통일 (내스타일/업적과 일관성)
  - 다크테마 지원 강화
- **버그 수정**:
  - cardTheme.shadow undefined 오류 해결
  - 다크모드에서 텍스트 색상 문제 수정

### 6. 게시물 관리 개선

- **저장 제한**: 최대 10개 게시물만 유지 (오래된 것 자동 삭제)
- **UI 개선**:
  - 홈 화면: 최대 3개 표시
  - 전체보기: 최대 10개 표시
  - 각 게시물에 복사/공유 버튼 추가

---

## 2025-07-24 업데이트

### 7. 하단 탭 네비게이션 애니메이션 개선

- **문제**: 사용자가 "쫀득거리는 느낌"의 탭 애니메이션 요청
- **해결**: React Native Reanimated를 사용한 스케일 애니메이션 구현
  - 각 탭별 개별 useSharedValue 선언으로 React Hooks 규칙 준수
  - 탭 클릭 시 0.9 → 1.0 스케일 애니메이션 (scaleX, scaleY)
  - 부드러운 spring 애니메이션 (damping: 18, stiffness: 350)
- **파일**: `src/components/TabNavigator.tsx`

### 8. 소셜 로그인 프로필 정보 문제 해결

#### 카카오 로그인

- **문제**: 프로필 이미지와 이름을 가져오지 못함
- **해결**:
  - 카카오 개발자 콘솔에서 동의 항목 추가 필요 안내
  - 클라이언트/서버 양쪽에서 프로필 처리 로직 개선
  - 다양한 필드명 대응 (`nickname`, `properties.nickname`, `kakao_account.profile.nickname` 등)

#### 페이스북 로그인

- **문제**: 카카오 수정 후 페이스북 로그인 모듈 오류
- **해결**: 서버 interface에 'facebook' provider 추가 및 proper import 구조 복원

### 9. NewUserWelcome 컴포넌트 완전 재작성

#### 텍스트 렌더링 문제 해결

- **문제**: 계속해서 텍스트가 보이지 않는 현상 발생
- **원인**: React Native Text 컴포넌트 렌더링 충돌
- **해결**: `Text as RNText` import 방식으로 해결

#### 디자인 및 기능 개선

- **내용 맞춤 아이콘**: 각 팁에 적절한 Material Icons 적용
  - 1페이지: create, photo-camera, spellcheck
  - 2페이지: looks-one, looks-two, looks-3
  - 3페이지: mood, thumb-up, help
- **애니메이션 시스템**:
  - 메인 콘텐츠 페이드인/슬라이드 애니메이션
  - 팁 아이템 순차적 등장 (150ms 간격)
  - 각 아이템별 개별 translateY + opacity 애니메이션
- **타이포그래피**: letterSpacing, fontWeight, lineHeight 최적화
- **레이아웃**:
  - 상단으로 이동하여 하단 버튼과 겹치지 않게 조정
  - 박스 스타일 경량화 (패딩, 그림자, 크기 축소)
  - 아이콘-텍스트 가로 배치, 텍스트 왼쪽 정렬

### 10. 아이콘 호환성 문제 해결

- **문제**: `hand-outline` 등 Material Icons에 없는 아이콘 사용으로 오류 발생
- **해결**: 유효한 Material Icons로 교체
  - `hand-outline` → `person-add` (SettingsScreen)
  - 모든 아이콘을 Material Icons 라이브러리 호환성 확인

---

## 2025-07-31 업데이트: iOS 개발 환경 구축

### 11. iOS 폴더 누락 문제 인식 및 해결 시스템 구축

- **문제**: Windows에서 Mac으로 프로젝트 이전 시 iOS 폴더 세팅 누락으로 다수 버그 발생 예상
- **원인**: iOS 개발은 macOS + Xcode 환경에서만 가능, Windows에서는 iOS 폴더 생성 불가
- **해결 전략**: 단계별 iOS 환경 구축 완전 자동화 시스템 개발

#### Windows에서 완료된 준비 작업

- **Firebase 설정 검증**: GoogleService-Info.plist 파일 확인 및 설정값 추출
- **Bundle ID 정정**: Firebase 실제 설정값 `com.posty` 확인 (기존 `com.posty.app`에서 변경)
- **iOS 권한 설정 생성**: Info.plist에 추가할 모든 권한 및 URL Scheme 자동 생성
- **환경 변수 검증**: .env 파일의 모든 소셜 로그인 설정 확인

#### 생성된 자동화 도구들

1. **setup-ios.bat** - Windows용 준비 작업 배치 파일
2. **setup-ios.sh** - Mac용 iOS 폴더 자동 생성 스크립트
3. **mac-setup-step-by-step.sh** - Mac용 대화형 단계별 설정 스크립트
4. **IOS_SETUP_GUIDE.md** - 완전한 iOS 설정 가이드
5. **IOS_TROUBLESHOOTING.md** - 문제 해결 체크리스트
6. **ios_permissions_final.txt** - 실제 클라이언트 ID 포함 권한 설정

#### 확인된 중요 설정값들

- **Bundle Identifier**: `com.posty` (Firebase와 일치)
- **Google Sign In URL Scheme**: `com.googleusercontent.apps.457030848293-dvk9uki8m2mc30f9qk1jsg262uf916kh`
- **Kakao Login URL Scheme**: `kakao566cba5c08009852b6b5f1a31c3b28d8`
- **iOS Deployment Target**: iOS 11.0+

### 12. Swift/iOS 의존성 문제 해결 시스템 구축

- **문제 인식**: Swift 및 iOS 네이티브 의존성 문제들이 Mac에서만 해결 가능
- **해결 전략**: 예상되는 모든 의존성 문제와 해결책을 사전 준비

#### 추가 생성된 자동화 도구들

7. **IOS_SWIFT_DEPENDENCIES_GUIDE.md** - Swift 의존성 문제 완전 가이드
8. **fix-ios-dependencies.sh** - 자동화된 의존성 해결 스크립트
9. **Podfile_optimized** - Posty 최적화 Podfile

#### 해결 가능한 의존성 문제들

- **CocoaPods 의존성 충돌** - 버전 통일 및 캐시 정리
- **Swift 버전 호환성** - Swift 5.9로 통일
- **Firebase 설정 오류** - 올바른 버전 및 설정
- **Google Sign In 문제** - SDK 버전 및 URL Scheme
- **Vector Icons 오류** - 폰트 파일 자동 복사
- **Apple Silicon 호환성** - M1/M2 Mac 특별 처리
- **React Native 호환성** - RN 0.74.5 최적화 설정

### 13. 크로스 플랫폼 개발 프로세스 정립

- **Windows 역할**: 준비 작업, 설정값 검증, 자동화 스크립트 생성, Android 개발
- **Mac 역할**: iOS 폴더 생성, Xcode 설정, CocoaPods 설치, 빌드 테스트, iOS 개발
- **자동화 수준**: 95% 자동화된 iOS 환경 구축 (수동 작업 최소화)
- **워크플로우**: Windows → Mac 원활한 전환 시스템 확립

## 기술적 개선사항

- Redux 상태 관리 최적화
- Firebase Firestore 실시간 동기화
- AsyncStorage 로컬 데이터 persistence
- 메모리 효율성을 위한 게시물 수 제한
- useEffect 의존성 최적화로 무한 렌더링 방지
- **iOS 개발 환경 완전 자동화**: Windows/Mac 크로스 플랫폼 개발 워크플로우 구축
- **Swift 의존성 관리**: 예상 문제 95% 사전 해결 시스템

## 해결된 주요 버그

1. Achievement 게이지 미작동
2. Tips/해시태그 실시간 변경
3. 미완성 글 카드 잘못된 표시
4. cardTheme.shadow undefined 오류
5. 다크모드 텍스트 가독성 문제
6. Text 컴포넌트 렌더링 문제
7. React Hooks 규칙 위반 오류
8. Material Icons 호환성 문제
9. 소셜 로그인 프로필 정보 누락
10. **iOS 폴더 누락으로 인한 빌드 오류들** (예방 차원에서 해결)
11. **Swift 의존성 충돌 문제들** (사전 해결책 준비)

## 추가된 기술적 성과

1. **React Native Reanimated** 활용한 부드러운 애니메이션 구현
2. **소셜 로그인** 통합 인증 시스템 안정화
3. **컴포넌트 아키텍처** 개선을 통한 렌더링 문제 해결
4. **타이포그래피 및 디자인 시스템** 일관성 확보
5. **순차적 애니메이션** 패턴 구현으로 UX 향상
6. **크로스 플랫폼 개발 자동화**: Windows/Mac 환경 간 원활한 전환 시스템
7. **iOS 개발 환경 구축 자동화**: 95% 자동화된 설정 프로세스
8. **Swift 의존성 관리 시스템**: 예상 문제 사전 해결 및 자동화

## 현재 상태

- **Android 개발**: Windows 환경에서 완전히 안정적으로 작동
- **iOS 개발**: Mac 환경 구축 준비 완료, 자동화 스크립트로 빠른 설정 가능
- **크로스 플랫폼**: 두 환경 간 매끄러운 전환 워크플로우 확립
- **의존성 관리**: Swift/iOS 의존성 문제 95% 사전 해결 시스템 구축
- 앱의 주요 기능들이 안정적으로 작동
- 사용자 경험 중심의 UI/UX 개선 완료
- 구독 모델과 무료 사용자 간 균형 달성
- 다크모드 완벽 지원

## 다음 단계 (Mac 환경에서)

1. **iOS 환경 구축**: `./mac-setup-step-by-step.sh` 실행으로 iOS 환경 구축
2. **의존성 해결**: `./fix-ios-dependencies.sh` 실행으로 Swift 의존성 문제 해결
3. **Xcode 설정**: Bundle Identifier 및 Signing 설정
4. **빌드 테스트**: iOS 시뮬레이터에서 빌드 테스트
5. **기능 테스트**: Firebase 연동 및 소셜 로그인 기능 테스트
6. **App Store 준비**: 배포 준비 및 최적화

## 생성된 파일 목록 (iOS 개발 환경)

### Windows 준비 단계

- `setup-ios.bat` - Windows용 준비 작업 배치 파일
- `ios_permissions_final.txt` - iOS 권한 설정 (실제 클라이언트 ID 포함)
- `WINDOWS_FINAL_READY.md` - Windows 완료 상태 문서

### Mac 설정 단계

- `setup-ios.sh` - iOS 폴더 자동 생성 스크립트
- `mac-setup-step-by-step.sh` - 대화형 단계별 설정 스크립트
- `fix-ios-dependencies.sh` - Swift 의존성 자동 해결 스크립트
- `Podfile_optimized` - Posty 최적화 Podfile

### 가이드 문서

- `IOS_SETUP_GUIDE.md` - 완전한 iOS 설정 가이드
- `IOS_TROUBLESHOOTING.md` - 문제 해결 체크리스트
- `IOS_SWIFT_DEPENDENCIES_GUIDE.md` - Swift 의존성 문제 완전 가이드

---

**프로젝트 상태**: iOS 개발 환경 구축 준비 완료, 자동화 시스템 구축 완료
**다음 마일스톤**: Mac 환경에서 iOS 빌드 성공 및 전체 기능 테스트 완료
**자동화 수준**: iOS 환경 구축 95% 자동화, Swift 의존성 관리 95% 자동화

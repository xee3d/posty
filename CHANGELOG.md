# Posty 변경 이력

## [2025.01.20] - 서버 및 구독 시스템 개선

### 🐛 버그 수정
- **구독 플랜 표시 버그 수정**
  - PREMIUM 플랜이 PRO로 잘못 표시되던 문제 해결
  - PRO 플랜이 MAX로 잘못 표시되던 문제 해결
  - TokenManagementSection 컴포넌트에서 올바른 플랜 이름 표시

- **서버 API 에러 처리 개선**
  - JSON 파싱 에러 시 더 명확한 에러 메시지 제공
  - 404 에러 발생 시 디버깅 정보 추가
  - HTML 응답 감지 및 적절한 에러 처리

- **Firestore 데이터 동기화 문제 해결**
  - 신규/기존 사용자 모두 subscriptionPlan 필드가 올바르게 저장되도록 수정
  - 로그인 시 구독 정보가 초기화되는 문제 해결

### 🚀 기능 개선
- **API 설정 업데이트**
  - 트렌드 서버 URL 추가 (`https://posty-api-v2.vercel.app/api`)
  - getTrendsApiUrl 헬퍼 함수 추가
  - 서버 아키텍처 문서화

- **서버 배포 안정화**
  - posty-server-new.vercel.app 도메인 alias 설정
  - 환경 변수 설정 확인 (OPENAI_API_KEY, APP_SECRET)
  - API 엔드포인트 정상 작동 확인

### 🔧 기술적 개선
- 디버그용 ServerDebugScreen 추가 (개발 환경)
- 임시 구독정보 복원 기능 제거
- 불필요한 Git 브랜치 정리 (recovery-f793633, recovery-8eb39c1)

### 📝 문서화
- SERVER_ARCHITECTURE.md 추가
- API 서버 구조 및 배포 가이드 문서화
- 트러블슈팅 가이드 추가

---

## [2025.01.19] - 트렌드 기능 및 Google 로그인 개선

### ✨ 새로운 기능
- **실시간 트렌드 API 연동**
  - posty-api-v2 서버를 통한 실시간 트렌드 데이터 제공
  - 트렌드 데이터 캐싱 기능
  - 새로고침 기능 추가

### 🐛 버그 수정
- **Google 로그인 문제 해결**
  - idToken 이슈 수정
  - 개발 모드 관련 설정 정리

### 🔧 기술적 개선
- 트렌드 화면 캐시 초기화 기능
- 디버깅 기능 강화

# 프로젝트 파일 정리 계획

## 정리 일자: 2025년 7월 17일

## 1. 완료된 작업 관련 파일들 (삭제 가능)

### Alert 마이그레이션 관련
- ✅ `ALERT_MIGRATION_GUIDE.md` - Alert 마이그레이션 완료
- ✅ `migrate-alerts.js` - 마이그레이션 스크립트 (사용 완료)
- ✅ `migrate-alerts-v2.js` - 마이그레이션 스크립트 v2 (사용 완료)

### Firebase 마이그레이션 관련
- ✅ `FIREBASE_MIGRATION_TODO.md` - Firebase v22 모듈러 API 마이그레이션 완료 (2025-07-14)

### 아이콘 문제 해결 관련
- ✅ `ICON_ERROR_FIX.md` - 아이콘 에러 수정 가이드 (해결 완료)
- ✅ `ICON_LIBRARY_FIX.md` - 아이콘 라이브러리 혼용 문제 (해결 완료)
- ✅ `ICON_INTEGRATION_GUIDE.md` - 아이콘 통합 가이드 (적용 완료)
- ✅ `ICON_NAMING_CONVENTION.md` - 아이콘 네이밍 규칙 (적용 완료)
- ✅ `ICON_USAGE_RULES.md` - 아이콘 사용 규칙 (적용 완료)

### 폰트 시스템 관련
- ✅ `FONT_SYSTEM_UPDATE.md` - 폰트 시스템 업데이트 (적용 완료)

### 설정 화면 수정 관련
- ✅ `SETTINGS_SCREEN_MANUAL_FIX.md` - 설정 화면 수동 수정 가이드 (완료)
- ✅ `SETTINGS_SCREEN_UPDATE.md` - 설정 화면 업데이트 내역 (완료)

### 버그 수정 보고서
- ✅ `BUG_FIX_REPORT_2025-07-16.md` - 7월 16일 버그 수정 완료

### 테스트 파일
- ✅ `TestApp.js` - 테스트용 파일 (필요시 삭제 가능)

## 2. 유지해야 할 파일들

### 프로젝트 문서
- ✅ `README.md` - 프로젝트 메인 문서
- ✅ `CONTRIBUTING.md` - 기여 가이드
- ✅ `PROJECT_STRUCTURE.md` - 프로젝트 구조 문서
- ✅ `RELEASE_CHECKLIST.md` - 릴리즈 체크리스트

### 최근 작업 문서
- ✅ `REACT_NATIVE_074_UPGRADE_REPORT.md` - React Native 0.74 업그레이드 보고서
- ✅ `SETTINGS_SCREEN_FIX_REPORT.md` - 설정 화면 수정 최종 보고서 (2025-07-17)
- ✅ `THEME_INTEGRATION_GUIDE.md` - 테마 통합 가이드
- ✅ `MYSTYLE_DESIGN_IMPROVEMENTS.md` - 마이스타일 디자인 개선

### 보안 관련 (중요)
- ⚠️ `URGENT_SECURITY_FIX.md` - 보안 수정 가이드 (OpenAI API 키 문제 - 확인 필요)

### Firebase 설정
- ✅ `firestore.indexes.json` - Firestore 인덱스 설정
- ✅ `firestore.rules` - Firestore 보안 규칙

## 3. 정리 작업 스크립트

```bash
cd C:\Users\xee3d\Documents\Posty_V74

# 백업 디렉토리 생성
mkdir completed_docs_backup_20250717

# 완료된 문서들 백업
move ALERT_MIGRATION_GUIDE.md completed_docs_backup_20250717\
move migrate-alerts.js completed_docs_backup_20250717\
move migrate-alerts-v2.js completed_docs_backup_20250717\
move FIREBASE_MIGRATION_TODO.md completed_docs_backup_20250717\
move ICON_ERROR_FIX.md completed_docs_backup_20250717\
move ICON_LIBRARY_FIX.md completed_docs_backup_20250717\
move ICON_INTEGRATION_GUIDE.md completed_docs_backup_20250717\
move ICON_NAMING_CONVENTION.md completed_docs_backup_20250717\
move ICON_USAGE_RULES.md completed_docs_backup_20250717\
move FONT_SYSTEM_UPDATE.md completed_docs_backup_20250717\
move SETTINGS_SCREEN_MANUAL_FIX.md completed_docs_backup_20250717\
move SETTINGS_SCREEN_UPDATE.md completed_docs_backup_20250717\
move BUG_FIX_REPORT_2025-07-16.md completed_docs_backup_20250717\
move TestApp.js completed_docs_backup_20250717\
```

## 4. 추가 정리 가능한 파일들 (src 디렉토리)

### 백업 파일들
- `src/services/firebase/index.namespace.ts` - Firebase 네임스페이스 백업 (모듈러 API 전환 완료)
- `src/services/firebase/migrationTest.ts` - 마이그레이션 테스트 파일

### 테스트 화면들
- `src/screens/AlertTestScreen.tsx` - Alert 테스트 화면 (필요시 삭제)
- `src/screens/FirebaseTestScreen.tsx` - Firebase 테스트 화면 (개발 완료 후 삭제)
- `src/screens/FirebaseAuthTest.tsx` - Firebase Auth 테스트 화면 (개발 완료 후 삭제)

## 5. 권장 사항

1. **백업 후 삭제**: 완료된 문서들은 백업 디렉토리로 이동 후, 나중에 완전 삭제
2. **Git 관리**: 삭제 전 Git에 커밋되어 있는지 확인
3. **보안 점검**: `URGENT_SECURITY_FIX.md`의 내용대로 OpenAI API 키 문제가 해결되었는지 확인
4. **문서 통합**: 여러 개의 아이콘 관련 문서를 하나의 `ICON_GUIDE.md`로 통합 고려

## 6. 정리 후 프로젝트 구조

```
Posty_V74/
├── README.md
├── CONTRIBUTING.md
├── PROJECT_STRUCTURE.md
├── RELEASE_CHECKLIST.md
├── REACT_NATIVE_074_UPGRADE_REPORT.md
├── SETTINGS_SCREEN_FIX_REPORT.md
├── THEME_INTEGRATION_GUIDE.md
├── MYSTYLE_DESIGN_IMPROVEMENTS.md
├── firestore.indexes.json
├── firestore.rules
├── completed_docs_backup_20250717/ (백업 폴더)
└── src/
    └── ...
```

## 7. 정리 완료 확인 사항

- [ ] 완료된 문서들 백업 디렉토리로 이동
- [ ] Git 상태 확인 및 커밋
- [ ] 보안 문제 해결 확인 (OpenAI API 키)
- [ ] 테스트 파일들 정리
- [ ] 프로젝트 빌드 및 실행 테스트

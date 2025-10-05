# CHANGELOG

모든 주요 변경사항이 이 파일에 기록됩니다.

## [Unreleased]

### 2025-10-05
- 인앱 상품 가격 및 문서 최신화
- Pro 구독: ₩15,000/월 (무제한 토큰)
- 토큰 패키지: 100개(₩3,000), 200+20개(₩6,000), 300+30개(₩9,000)
- 불필요한 파일 정리 (빌드 아티팩트, 이전 릴리스 번들)
- 문서 아카이브 정리 (PROGRESS.md, DECISIONS.md, debug-text-rendering.md)

## [1.2.0] - 2025-01-20

### 🎉 Major Improvements

- **자동 배포 설정 완료**: Git push 시 Vercel 자동 배포
- **서버 안정성 개선**: 404 에러 및 배포 문제 완전 해결

### ✨ Added

- Git 자동 배포 설정 (posty-server-new, posty-api-v2)
- Root Directory 설정으로 모노레포 지원
- 배포 상태 확인 스크립트 (`verify-deployment.bat`)
- 전체 서버 배포 스크립트 (`deploy-all.bat`)
- 서버 구조 문서화 개선

### 🐛 Fixed

- AI 서버 404 NOT_FOUND 에러 해결
- 트렌드 서버 목업 데이터 문제 해결
- TrendScreen import 경로 오류 수정 (`trendServiceForced` → `trendService`)
- Vercel 배포 시 환경 변수 누락 문제 해결

### 🔧 Changed

- 서버 배포 프로세스 자동화
- 불필요한 배치 파일 정리
- API 설정 파일 최적화

### 📝 Documentation

- README.md 업데이트 (자동 배포 가이드 추가)
- SERVER_ARCHITECTURE.md 업데이트 (최신 구조 반영)
- DEPLOYMENT_TROUBLESHOOTING.md 추가

## [1.1.0] - 2025-01-19

### ✨ Added

- 실시간 트렌드 기능 구현
- 트렌드 서버 (posty-api-v2) 구축
- 네이버, Google, 뉴스, 소셜 트렌드 통합

### 🐛 Fixed

- 긴 문장 생성 시 잘림 현상 해결
- 구독 시스템 토큰 관리 개선

## [1.0.0] - 2025-01-18

### 🎉 Initial Release

- AI 기반 SNS 콘텐츠 생성
- 9가지 톤 설정 기능
- 플랫폼별 최적화 (Instagram, Facebook, Twitter)
- 구독 시스템 (FREE, STARTER, PREMIUM, PRO)
- Firebase 인증 (Google, Kakao, Naver, Email)
- Redux 상태 관리
- React Native Reanimated 3 애니메이션

---

_Format: [Semantic Versioning](https://semver.org/)_

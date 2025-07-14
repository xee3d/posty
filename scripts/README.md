# 📂 Scripts 디렉토리 구조

## 개발 스크립트
- **start-dev.bat**: 개발 환경 시작 (Metro + Android)
- **clean_and_build.bat**: 캐시 정리 및 재빌드
- **clear_cache.bat**: Metro 및 빌드 캐시 정리
- **quick_start.bat**: 빠른 개발 시작

## 빌드 스크립트
- **build-release.bat**: 프로덕션 빌드 생성

## 아카이브 (archive/)
1회성 실행 파일들과 더 이상 필요없는 스크립트들이 보관되어 있습니다.

## 사용 방법

### 개발 시작
```bash
cd scripts
start-dev.bat
```

### 캐시 문제 해결
```bash
cd scripts
clear_cache.bat
```

### 릴리즈 빌드
```bash
cd scripts
build-release.bat
```

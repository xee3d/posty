# 빠른 시작 가이드

## 🚀 프로젝트 실행

### 1. 앱 실행
```bash
# Android
npm run android

# iOS (Mac only)
npm run ios
```

### 2. 서버 상태 확인
```bash
verify-deployment.bat
```

## 🔧 개발 워크플로우

### 코드 수정 후 배포
```bash
# 1. 변경사항 커밋
git add .
git commit -m "feat: 새로운 기능"

# 2. Push (자동 배포 시작)
git push

# 3. 배포 확인 (1-2분 후)
verify-deployment.bat
```

## 📱 유용한 명령어

### 서버 관련
- `deploy-all.bat` - 모든 서버 수동 배포
- `verify-deployment.bat` - 서버 상태 확인
- `monitor-servers-live.bat` - 실시간 모니터링

### 개발 관련
- `fresh-deploy.bat` - Metro 캐시 클리어
- `install-phone.bat` - 폰에 앱 설치
- `device-manager.bat` - 디바이스 관리

## 🔍 문제 해결

### 서버가 응답하지 않을 때
```bash
deploy-all.bat
```

### Metro 번들러 에러
```bash
fresh-deploy.bat
```

### 앱이 폰에 설치되지 않을 때
```bash
device-manager.bat
install-phone.bat
```

## 📞 지원

문제가 지속되면:
1. [DEPLOYMENT_TROUBLESHOOTING.md](./DEPLOYMENT_TROUBLESHOOTING.md) 참조
2. GitHub Issues에 문의

---
*빠른 시작을 위한 필수 가이드*

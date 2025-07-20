# Vercel 배포 문제 해결 가이드

## 문제가 반복되는 원인

### 1. **수동 배포 의존**
- Git과 연동되지 않아 코드 변경 시 자동 배포 안 됨
- 매번 `vercel --prod` 수동 실행 필요

### 2. **환경 변수 불일치**
- 로컬 `.env`와 Vercel 환경 변수가 다름
- 배포 시마다 환경 변수가 초기화될 수 있음

### 3. **도메인 Alias 문제**
- Custom domain이 제대로 연결되지 않음
- 배포마다 새로운 URL 생성

### 4. **캐싱 문제**
- Vercel Edge Network 캐싱
- 브라우저/앱 캐싱

## 영구 해결 방법

### 1. **Git 자동 배포 설정**
```bash
# 1. GitHub에 저장소 생성
# 2. Vercel과 GitHub 연동
setup-vercel-git.bat
```

### 2. **환경 변수 고정**
1. Vercel 대시보드 접속
2. Project Settings > Environment Variables
3. 모든 환경 변수 추가:
   - `OPENAI_API_KEY`
   - `APP_SECRET`
   - `NEWS_API_KEY`

### 3. **배포 자동화 스크립트**
```json
// package.json에 추가
{
  "scripts": {
    "deploy": "vercel --prod",
    "deploy:all": "npm run deploy:server && npm run deploy:api",
    "deploy:server": "cd posty-server && vercel --prod",
    "deploy:api": "cd posty-api-v2 && vercel --prod"
  }
}
```

### 4. **헬스 체크 자동화**
```javascript
// 30분마다 서버 깨우기
setInterval(async () => {
  await fetch('https://posty-server-new.vercel.app/api/health');
  await fetch('https://posty-api-v2.vercel.app/api/health');
}, 30 * 60 * 1000);
```

## 임시 해결책

### 빠른 재배포 스크립트
```bash
# redeploy-all.bat
@echo off
echo Redeploying all servers...
cd posty-server && vercel --prod
cd ../posty-api-v2 && vercel --prod
echo Done!
```

### 서버 상태 모니터링
```bash
# monitor.bat
@echo off
:loop
curl https://posty-server-new.vercel.app/api/health
curl https://posty-api-v2.vercel.app/api/health
timeout /t 300
goto loop
```

## 권장 사항

### 단기적
1. **일일 재배포**: 매일 아침 한 번 재배포
2. **모니터링**: 서버 상태 주기적 확인
3. **캐시 관리**: 문제 발생 시 캐시 삭제

### 장기적
1. **Git 연동**: 자동 배포 설정
2. **CI/CD**: GitHub Actions 활용
3. **유료 플랜**: Vercel Pro 고려
4. **자체 서버**: AWS/GCP 등 고려

## 체크리스트

배포 전 확인사항:
- [ ] 환경 변수 설정 확인
- [ ] 코드 변경사항 커밋
- [ ] 로컬 테스트 완료
- [ ] 이전 배포 상태 확인

배포 후 확인사항:
- [ ] Health 엔드포인트 테스트
- [ ] 주요 API 테스트
- [ ] 앱에서 실제 테스트
- [ ] 로그 확인

---
*최종 업데이트: 2025년 1월*

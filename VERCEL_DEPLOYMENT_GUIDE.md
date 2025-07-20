# Vercel 배포 문제 해결 가이드

## 증상
- API 호출 시 목업 데이터가 반환됨
- 실제 API는 정상 작동하지만 앱에서는 연결 안 됨
- `vercel --prod` 재배포 후 정상 작동

## 원인 분석

### 1. **Vercel Cold Start**
- 무료 플랜: 5-10분 미사용 시 함수가 sleep 모드로 전환
- 첫 요청 시 10초 이상 소요되어 타임아웃 발생
- 앱이 타임아웃으로 목업 데이터로 폴백

### 2. **자동 배포 실패**
- Git push 후 Vercel 자동 배포가 트리거되지 않음
- Vercel 프로젝트가 Git 저장소와 연결되지 않았을 가능성

### 3. **환경 변수 미동기화**
- Vercel 대시보드의 환경 변수가 배포에 반영 안 됨
- 재배포 시 환경 변수가 새로 적용됨

## 해결 방법

### 즉시 해결
```bash
# 서버 재배포
cd posty-api-v2
vercel --prod
```

### 영구 해결

1. **Git 연동 확인**
   - Vercel 대시보드 > Settings > Git
   - GitHub 저장소 연결 확인
   - Auto-deploy 활성화

2. **Warm-up 스크립트**
   ```javascript
   // 30분마다 헬스 체크로 서버 활성 상태 유지
   setInterval(() => {
     fetch('https://posty-api-v2.vercel.app/api/health')
   }, 30 * 60 * 1000)
   ```

3. **더 긴 타임아웃 설정**
   ```javascript
   // trendService.ts
   const response = await axios.get(`${this.API_BASE_URL}/trends`, {
     timeout: 30000, // 30초로 증가
   });
   ```

## 모니터링

### 서버 상태 체크
```bash
# health-check.js 실행
node health-check.js
```

### 로그 확인
- Vercel 대시보드 > Functions > Logs
- Cold start 시간 확인
- 에러 로그 확인

## 예방 조치

1. **정기적 재배포**
   - 주 1회 `redeploy-servers.bat` 실행
   
2. **모니터링 설정**
   - Vercel Analytics 활용
   - Uptime 모니터링 서비스 사용

3. **유료 플랜 고려**
   - Pro 플랜: Cold start 시간 단축
   - 더 긴 실행 시간 제한
   - 우선순위 지원

## 배치 파일 활용

- `redeploy-servers.bat`: 모든 서버 재배포
- `monitor-servers-live.bat`: 실시간 서버 모니터링
- `health-check.js`: 서버 응답 시간 체크

---
*최종 업데이트: 2025년 1월*

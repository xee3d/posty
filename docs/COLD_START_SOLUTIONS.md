// Vercel Cold Start 대응 방법들

## 1. 무료 플랜의 한계
- Vercel 무료 플랜은 10분 이상 요청이 없으면 함수가 슬립 모드로 전환
- 첫 요청 시 3-5초의 Cold Start 발생
- 이는 Serverless의 근본적인 특징

## 2. 해결 방법들

### A. 클라이언트 측 해결책
1. **Retry 로직**: 첫 요청 실패 시 자동 재시도
2. **로딩 UI 개선**: 사용자에게 대기 시간 안내
3. **프리로드**: 앱 시작 시 health check로 서버 깨우기

### B. 서버 측 해결책
1. **Keep-Alive 스크립트**: 주기적으로 서버에 요청
2. **Cron Job**: GitHub Actions나 외부 서비스 사용
3. **Edge Functions**: Vercel Edge Functions는 Cold Start가 적음

### C. 대안
1. **유료 플랜**: Pro 플랜($20/월)은 Cold Start 감소
2. **다른 호스팅**: 
   - Railway.app (무료 $5 크레딧)
   - Render.com (무료 플랜)
   - Fly.io (무료 플랜)
3. **전용 서버**: VPS나 전용 서버 사용

## 3. 추천 방법

### 개발/테스트 단계
- 로컬 서버 사용 또는 Keep-Alive 스크립트 실행

### 프로덕션 단계
- 유료 플랜 고려 또는 다른 호스팅 서비스 사용
- 클라이언트에 retry 로직과 적절한 로딩 UI 구현

## 4. Keep-Alive 자동화 (GitHub Actions)

```yaml
name: Keep Server Warm
on:
  schedule:
    - cron: '*/5 * * * *'  # 5분마다
jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping server
        run: curl https://posty-server.vercel.app/api/health
```

이렇게 하면 GitHub Actions가 무료로 서버를 깨워줍니다.

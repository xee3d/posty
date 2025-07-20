## 서버 아키텍처 및 캐싱 정책 분석

### 현재 구조
1. **글쓰기 서버** (posty-server)
   - URL: https://posty-server-new.vercel.app
   - 역할: AI 콘텐츠 생성
   - 트렌드 서버와 독립적으로 작동

2. **트렌드 서버** (posty-api-v2)
   - URL: https://posty-api-v2.vercel.app/api/trends
   - 역할: 실시간 트렌드 데이터 제공
   - 캐싱: 4시간마다 업데이트 (CACHE_DURATION = 1000 * 60 * 60 * 4)

### 확인된 사항
✅ **서버 간 독립성 확보**
- 글쓰기에서 트렌드 키워드를 사용할 때 트렌드 서버를 호출하지 않음
- 단순히 텍스트와 해시태그만 전달
- handleTrendPress에서: `onNavigate('ai-write', { initialText: prompt, initialHashtags: trend.hashtags || [] })`

✅ **캐싱 정책**
- 트렌드 데이터는 4시간 동안 캐시됨
- 캐시가 있으면 API를 호출하지 않음
- 이로 인해 Vercel 서버가 잠자기 모드로 들어가지 않음

### 잠재적 문제점 및 해결책

#### 1. Vercel Cold Start 문제
- Vercel 무료 플랜은 일정 시간 사용하지 않으면 cold start 발생
- 해결책: 주기적인 헬스 체크 또는 warming 요청

#### 2. 캐싱으로 인한 서버 비활성화
- 4시간 동안 API 호출이 없으면 서버가 sleep 모드로 전환될 수 있음
- 현재는 문제없음 (서버 간 독립적으로 작동)

### 권장사항
1. **모니터링**: 서버 응답 시간 추적
2. **헬스 체크**: 주기적인 서버 상태 확인
3. **에러 처리**: Cold start 시 재시도 로직

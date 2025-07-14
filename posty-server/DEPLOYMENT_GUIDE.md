# 🔐 API 보안 마이그레이션 가이드

## 현재 문제점
앱에서 직접 OpenAI API를 호출하고 있어 API 키가 노출될 위험이 있습니다.

## 해결 방안: posty-server 활용

### 1. Vercel 배포
```bash
cd posty-server
npm install -g vercel
vercel
```

### 2. 환경 변수 설정 (Vercel Dashboard)
```
OPENAI_API_KEY=sk-xxxxx
APP_SECRET=your-random-secret-key
```

### 3. 앱 코드 수정

#### src/services/ai/openaiProvider.ts 수정
```typescript
// 기존 (위험)
const API_KEY = Config.OPENAI_API_KEY;
const API_URL = 'https://api.openai.com/v1/chat/completions';

// 변경 후 (안전)
const API_URL = 'https://your-app.vercel.app/api/generate';
const APP_SECRET = Config.APP_SECRET; // 서버와 통신용 시크릿
```

### 4. API 호출 수정
```typescript
const response = await axios.post(API_URL, {
  prompt,
  tone,
  platform,
  model: 'gpt-4'
}, {
  headers: {
    'Authorization': `Bearer ${APP_SECRET}`,
    'Content-Type': 'application/json'
  }
});
```

## 보안 이점
- ✅ OpenAI API 키가 앱에 포함되지 않음
- ✅ 사용량 제한 가능
- ✅ 사용자별 통계 추적 가능
- ✅ API 키 유출 위험 제거

## 배포 후 테스트
```bash
curl -X POST https://your-app.vercel.app/api/generate \
  -H "Authorization: Bearer your-app-secret" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "테스트", "tone": "friendly"}'
```

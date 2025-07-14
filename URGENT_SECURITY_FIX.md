# 🚨 긴급 보안 수정 가이드

## 문제점
OpenAI API 키가 클라이언트 앱에 노출되어 있습니다. 이는 심각한 보안 위험입니다!

## 즉시 해야 할 일

### 1. OpenAI API 키 무효화
1. [OpenAI Dashboard](https://platform.openai.com/api-keys) 접속
2. 노출된 API 키 즉시 삭제
3. 새로운 API 키 생성

### 2. Vercel 서버 배포
```bash
cd posty-server

# Vercel CLI 설치 (처음 한 번만)
npm install -g vercel

# 배포
vercel

# 환경변수 설정
vercel env add OPENAI_API_KEY production
# 새로운 OpenAI API 키 입력

vercel env add APP_SECRET production
# 랜덤한 시크릿 키 생성해서 입력 (예: uuidgen)
```

### 3. 앱 코드 수정

#### src/services/ai/providers/openaiProvider.ts 수정
```typescript
// 기존 (위험!)
import { OPENAI_API_KEY } from '@env';
private baseUrl = 'https://api.openai.com/v1';

// 수정 후 (안전!)
import { VERCEL_API_URL, VERCEL_APP_SECRET } from '@env';
private baseUrl = VERCEL_API_URL;
```

#### callOpenAI 메서드 수정
```typescript
private async callOpenAI(params: any): Promise<any> {
  // Vercel 서버로 요청
  const response = await fetch(`${this.baseUrl}/api/generate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VERCEL_APP_SECRET}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: params.messages[1].content, // user message
      tone: this.currentTone,
      platform: this.currentPlatform,
      model: params.model || this.model
    }),
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  const result = await response.json();
  
  // Vercel 응답을 OpenAI 형식으로 변환
  return {
    choices: [{
      message: {
        content: result.data.content
      }
    }],
    usage: result.data.usage
  };
}
```

### 4. 테스트
1. Vercel 서버 테스트
```bash
curl -X POST https://your-app.vercel.app/api/generate \
  -H "Authorization: Bearer YOUR_APP_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "테스트", "tone": "friendly"}'
```

2. 앱에서 테스트
- 콘텐츠 생성 기능 테스트
- 네트워크 로그 확인 (OpenAI 직접 호출이 없어야 함)

## 장점
- ✅ API 키 유출 위험 제거
- ✅ 사용량 제어 가능
- ✅ Rate limiting 가능
- ✅ 비용 통제 가능

## 주의사항
- 절대로 API 키를 Git에 커밋하지 마세요
- .env 파일은 .gitignore에 포함되어야 합니다
- Vercel 환경변수는 Vercel 대시보드에서만 관리하세요

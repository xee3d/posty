# 🤖 AI Service Architecture

Posty 앱의 AI 서비스는 Vercel 서버를 통해 안전하게 OpenAI API를 사용합니다.

## 📊 현재 아키텍처

```
사용자 입력
    ↓
AIWriteScreen.tsx
    ↓
aiServiceWrapper.ts (진입점)
    ↓
serverAIService.ts (서버 통신)
    ↓
Vercel Server API
    ↓
OpenAI API
```

## 📁 파일 구조

```
src/services/
├── aiServiceWrapper.ts      # AI 기능 진입점
├── serverAIService.ts       # Vercel 서버 API 통신
└── ai/
    ├── types/              # TypeScript 타입 정의
    │   └── ai.types.ts
    └── _deprecated/        # 미사용 레거시 코드
```

## 🔑 주요 파일 설명

### aiServiceWrapper.ts
- AI 기능의 메인 인터페이스
- 서버 API 호출을 추상화
- 메서드:
  - `generateContent()`: 콘텐츠 생성
  - `polishContent()`: 문장 다듬기
  - `analyzeImage()`: 이미지 분석

### serverAIService.ts
- Vercel 서버와의 실제 통신 담당
- API 엔드포인트: `https://posty-server-p6qzkiq80-ethan-chois-projects.vercel.app`
- 인증 토큰 관리
- 에러 처리 및 타임아웃 관리

## 🔐 보안

- OpenAI API 키는 Vercel 서버에만 저장
- 클라이언트는 APP_SECRET으로 서버 인증
- Rate limiting으로 과도한 요청 방지

## 🚀 사용 예시

```typescript
import aiService from '../services/aiServiceWrapper';

// 콘텐츠 생성
const result = await aiService.generateContent({
  prompt: '오늘 카페에서',
  tone: 'casual',
  length: 'medium',
  platform: 'instagram'
});

// 문장 다듬기
const polished = await aiService.polishContent({
  text: '원본 텍스트',
  polishType: 'refine',
  tone: 'professional'
});
```

## 📈 향후 개선사항

1. 캐싱 메커니즘 추가
2. 오프라인 모드 지원
3. 다국어 지원 확대
4. 스트리밍 응답 지원

# 🗑️ Deprecated AI Service Files

이 폴더에는 더 이상 사용되지 않는 AI 서비스 관련 파일들이 있습니다.

## 📋 이동된 파일들

### providers/
- **openaiProvider.ts**: OpenAI API를 직접 호출하던 구현체 (보안 이슈로 사용 중단)
- **mockProvider.ts**: 테스트용 Mock Provider
- **postyServerProvider.ts**: 초기 서버 연동 시도

### strategies/
- **contentStrategy.ts**: 콘텐츠 생성 전략
- **hashtagStrategy.ts**: 해시태그 생성 전략
- **engagementStrategy.ts**: 참여도 계산 전략

### 기타
- **aiService.ts**: Provider들을 관리하던 메인 서비스
- **index.ts**: AI 서비스 진입점
- **migration.guide.ts**: 마이그레이션 가이드

## 🔄 현재 사용 중인 구조

```
aiServiceWrapper.ts → serverAIService.ts → Vercel Server API
```

## ⚠️ 주의사항

이 파일들은 참조용으로만 보관되어 있으며, 실제로 사용되지 않습니다.
필요시 완전히 삭제해도 무방합니다.

## 🗓️ Deprecated Date
- 2025년 7월 14일

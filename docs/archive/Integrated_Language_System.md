# 🌐 통합 언어 시스템 구현 가이드

## 📋 시스템 구성

### 1. 언어 감지 및 설정

```typescript
// src/services/languageService.ts
class LanguageService {
  private userLanguage: string = "ko";
  private contentLanguage: string = "ko";

  // 사용자 UI 언어 설정
  setUILanguage(language: string) {
    this.userLanguage = language;
    // UI 텍스트는 이 언어로 번역
  }

  // 콘텐츠 생성 언어 설정 (독립적)
  setContentLanguage(language: string) {
    this.contentLanguage = language;
    // AI가 생성하는 콘텐츠 언어
  }

  // 자동 언어 감지
  async detectFromUserInput(text: string): Promise<string> {
    // 사용자가 입력한 텍스트의 언어 감지
    const detected = await multilingualAI.detectLanguage(text);
    this.contentLanguage = detected;
    return detected;
  }
}
```

## 🔄 작동 흐름

### Case 1: 한국인이 영어 UI로 사용

```
UI Language: English (번역됨)
- "Write with Posty" (버튼)
- "What would you like to write about?" (플레이스홀더)

User Input: "오늘 날씨가 정말 좋네요"
→ 언어 감지: Korean
→ AI Output: Korean으로 생성
"맑은 하늘 아래 산책하기 딱 좋은 날이에요! 🌞"
```

### Case 2: 한국인이 영어로 글쓰기

```
UI Language: Korean (원본)
- "포스티와 글쓰기" (버튼)
- "무엇에 대해 쓸까요?" (플레이스홀더)

User Input: "Beautiful sunset today"
→ 언어 감지: English
→ AI Output: English로 생성
"The sky painted in shades of orange and pink 🌅"
```

### Case 3: 미국인이 영어로 사용

```
UI Language: English (번역됨)
- "Write with Posty" (버튼)
- "What would you like to write about?" (플레이스홀더)

User Input: "Coffee break time"
→ 언어 감지: English
→ AI Output: English로 생성
"That afternoon caffeine boost hits different ☕"
```

## 💡 스마트 언어 처리

### 1. 혼합 언어 지원

```typescript
// 사용자가 여러 언어를 섞어 쓰는 경우
async handleMixedLanguageInput(text: string) {
  // 주 언어 감지
  const primaryLanguage = await this.detectPrimaryLanguage(text);

  // 콘텐츠 생성
  const content = await multilingualAI.generateContent({
    prompt: text,
    language: primaryLanguage,
    allowCodeSwitching: true, // 언어 혼용 허용
  });

  return content;
}

// 예시
Input: "오늘 meeting이 있어서 coffee를 많이 마셨어요"
Output: "미팅 때문에 카페인 충전 제대로 했네요! ☕ 커피 몇 잔째인가요?"
```

### 2. 플랫폼별 언어 최적화

```typescript
// 플랫폼마다 선호하는 언어 스타일이 다름
const platformLanguageStyle = {
  instagram: {
    ko: { formality: "casual", emojis: "frequent", hashtags: true },
    en: { formality: "casual", emojis: "moderate", hashtags: true },
    ja: { formality: "polite", emojis: "frequent", hashtags: true },
  },
  linkedin: {
    ko: { formality: "formal", emojis: "rare", hashtags: false },
    en: { formality: "professional", emojis: "rare", hashtags: true },
    ja: { formality: "very_formal", emojis: "none", hashtags: false },
  },
};
```

## 🎨 UI/UX 고려사항

### 1. 언어 설정 화면

```typescript
// 두 가지 독립적인 설정
const LanguageSettings = () => {
  return (
    <View>
      {/* UI 언어 설정 */}
      <Section title="앱 언어 / App Language">
        <Select
          value={uiLanguage}
          options={[
            { value: "ko", label: "한국어" },
            { value: "en", label: "English" },
            { value: "ja", label: "日本語" },
          ]}
          onChange={setUILanguage}
        />
      </Section>

      {/* 콘텐츠 언어 설정 */}
      <Section title={t("settings.contentLanguage")}>
        <Select
          value={contentLanguage}
          options={[
            { value: "auto", label: t("settings.autoDetect") },
            { value: "ko", label: "한국어" },
            { value: "en", label: "English" },
            { value: "ja", label: "日本語" },
          ]}
          onChange={setContentLanguage}
        />
      </Section>
    </View>
  );
};
```

### 2. 언어 전환 인디케이터

```typescript
// 사용자가 다른 언어로 입력하면 표시
const LanguageIndicator = ({ detectedLang, currentLang }) => {
  if (detectedLang === currentLang) return null;

  return <Chip>{`✨ ${languageNames[detectedLang]}로 작성 중`}</Chip>;
};
```

## 📊 언어별 사용 통계

```typescript
// 분석을 위한 언어 사용 추적
class LanguageAnalytics {
  trackContentGeneration(userId: string, language: string, platform: string) {
    // 어떤 언어로 콘텐츠를 생성하는지 추적
    analytics.track("content_generated", {
      userId,
      language,
      platform,
      timestamp: Date.now(),
    });
  }

  // 인사이트 도출
  async getUserLanguagePreferences(userId: string) {
    const stats = await this.getLanguageStats(userId);

    return {
      primaryLanguage: stats.most_used,
      languages: stats.all_languages,
      platformPreferences: stats.by_platform,
      timeOfDay: stats.by_time, // 시간대별 언어 사용
    };
  }
}
```

## 🚀 구현 우선순위

### Phase 1: 기본 구현 (1주)

1. UI 언어 / 콘텐츠 언어 분리
2. 언어 자동 감지
3. 영어 지원 추가

### Phase 2: 고급 기능 (2주)

1. 혼합 언어 처리
2. 플랫폼별 최적화
3. 언어 전환 UX 개선

### Phase 3: 최적화 (1주)

1. 언어별 프롬프트 최적화
2. 문화별 콘텐츠 스타일
3. A/B 테스트

## 💰 비용 최적화

### 언어 감지 캐싱

```typescript
// 비슷한 입력은 캐시 사용
const languageDetectionCache = new Map();

async detectLanguageWithCache(text: string) {
  // 처음 몇 단어로 캐시 키 생성
  const cacheKey = text.slice(0, 20).toLowerCase();

  if (languageDetectionCache.has(cacheKey)) {
    return languageDetectionCache.get(cacheKey);
  }

  const detected = await this.detectLanguage(text);
  languageDetectionCache.set(cacheKey, detected);

  return detected;
}
```

## ✅ 핵심 포인트

1. **UI 번역 ≠ AI 콘텐츠 생성**

   - UI는 사전 번역 또는 실시간 번역
   - AI 콘텐츠는 해당 언어로 직접 생성

2. **언어 독립성**

   - UI 언어와 콘텐츠 언어는 독립적
   - 사용자가 자유롭게 선택 가능

3. **자동화**

   - 입력 언어 자동 감지
   - 플랫폼별 스타일 자동 적용

4. **비용 효율**
   - 언어 감지는 가벼운 모델 사용
   - 캐싱으로 중복 요청 최소화

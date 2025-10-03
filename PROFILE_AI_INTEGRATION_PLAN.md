# 프로필 기반 맞춤형 AI 통합 계획

## 📋 개요

사용자 프로필 설정을 AI 콘텐츠 생성에 직접 반영하여 개인화된 글쓰기 경험 제공

## 🎯 목표

1. **프로필 → AI 연계**: 프로필 모달에서 설정한 정보를 AI가 이해하고 반영
2. **페르소나 기반 생성**: "40대 엄마"가 쓴 것처럼, "20대 직장인"이 쓴 것처럼
3. **자동 스타일 조정**: 사용자 글쓰기 스타일 선호도를 temperature/tone에 반영
4. **관심사 활용**: 프로필 관심사를 해시태그 및 문맥에 자동 반영

## 🏗️ 시스템 구조

### 기존 시스템 (분리됨)
```
ProfileDetailModal → DetailedUserProfile (userSlice에 저장)
                                ❌ 연결 없음
serverAIService → promptTemplates.ts → OpenAI API
```

### 새로운 시스템 (통합)
```
ProfileDetailModal → DetailedUserProfile (Redux)
                              ↓
                    profileBasedAIService
                              ↓
                    개인화된 프롬프트 생성
                              ↓
                    serverAIService → API 호출
```

## 📁 파일 구조

### 새로 생성한 파일
- ✅ `src/services/profileBasedAIService.ts` - 프로필 기반 AI 서비스

### 수정 필요한 파일
1. `src/services/serverAIService.ts` - profileBasedAIService 통합
2. `src/services/aiServiceWrapper.ts` - 프로필 정보 전달
3. `src/screens/MainScreen.tsx` - Redux에서 프로필 가져오기

## 🔧 구현 단계

### Step 1: serverAIService에 프로필 통합

**현재**:
```typescript
const systemMessage = `당신은 SNS 콘텐츠 생성 전문가입니다...`;
```

**개선**:
```typescript
import { profileBasedAI } from './profileBasedAIService';
import { useAppSelector } from '../hooks/redux';

// Redux에서 프로필 가져오기
const detailedProfile = useAppSelector((state) => state.user.detailedProfile);

// 프로필 기반 프롬프트 생성
const systemMessage = detailedProfile && detailedProfile.profileCompleteness > 30
  ? profileBasedAI.generatePersonalizedPrompt({
      profile: detailedProfile,
      platform,
      tone,
      length,
      language,
      prompt: userPrompt
    })
  : 기존_프롬프트; // 프로필 미완성 시 기본 프롬프트 사용
```

### Step 2: Temperature 동적 조정

**현재**: 고정 temperature (0.8)

**개선**:
```typescript
const temperature = detailedProfile && detailedProfile.profileCompleteness > 30
  ? profileBasedAI.getOptimalTemperature(detailedProfile, tone)
  : 0.8;
```

### Step 3: 해시태그 개인화

**현재**: AI가 자유롭게 생성

**개선**:
```typescript
const personalizedHashtags = detailedProfile
  ? profileBasedAI.generatePersonalizedHashtags(detailedProfile, prompt)
  : [];

// 프롬프트에 추가
systemMessage += `\n\n권장 해시태그: ${personalizedHashtags.join(', ')}`;
```

### Step 4: UI에서 프로필 완성도 표시

**MainScreen.tsx 추가**:
```typescript
const profileCompleteness = useAppSelector(
  (state) => state.user.detailedProfile?.profileCompleteness || 0
);

// 프로필 완성도가 낮으면 안내
{profileCompleteness < 30 && (
  <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
    <Text>💡 프로필을 완성하면 더 나에게 맞는 글을 생성할 수 있어요!</Text>
  </TouchableOpacity>
)}
```

## 📊 프로필 완성도별 동작

### 0-30% (미완성)
- 기존 promptTemplates.ts 사용
- 일반적인 프롬프트
- "프로필을 완성하세요" 안내 표시

### 30-60% (부분 완성)
- 기본 페르소나 적용 (연령대, 직업)
- 약간의 개인화

### 60-100% (완성)
- 전체 페르소나 적용
- 관심사 기반 해시태그
- 글쓰기 스타일 반영
- Temperature 최적화

## 🎨 사용자 경험

### Before (현재)
```
사용자: 프로필 설정 → "40대 엄마, 육아 관심사"
AI: "오늘 맛집 다녀왔어요! 분위기 좋고..." (일반적)
```

### After (개선)
```
사용자: 프로필 설정 → "40대 엄마, 육아 관심사"
AI: "아이 데리고 근처 카페 갔는데, 키즈존도 있고 엄마들 수다떨기 좋더라구요 ☕👶
    #육아맘 #카페 #일상"
```

## 🔄 프로필 업데이트 흐름

1. **프로필 설정**: ProfileDetailModal → Redux (detailedProfile)
2. **실시간 반영**: Redux 변경 → 즉시 AI 생성에 적용
3. **완성도 계산**: calculateProfileCompleteness() 자동 실행
4. **UI 업데이트**: 완성도 표시, 가이드 메시지

## ⚠️ 주의사항

### 1. 프롬프트 길이 증가 방지
- 프로필 정보를 **간결하게** 요약
- 페르소나: "40대 엄마 (영유아 자녀), 직장인" (20자 이내)
- 기존 promptTemplates.optimized.ts 활용

### 2. 성능 최적화
```typescript
// ❌ 나쁜 예: 매번 프로필 파싱
function generateContent() {
  const profile = parseProfile(detailedProfile); // 반복 파싱
}

// ✅ 좋은 예: 메모이제이션
const parsedProfile = useMemo(
  () => profileBasedAI.extractPersona(detailedProfile),
  [detailedProfile]
);
```

### 3. 프로필 없을 때 폴백
```typescript
// 항상 기본 프롬프트 제공
const finalPrompt = detailedProfile?.profileCompleteness > 30
  ? profileBasedPrompt
  : defaultPrompt;
```

## 📈 측정 지표

- **프로필 완성률**: 사용자 중 60% 이상 완성한 비율
- **개인화 콘텐츠 생성률**: 프로필 기반 생성 vs 일반 생성
- **사용자 만족도**: 프로필 완성 후 재생성 빈도 감소
- **토큰 효율**: 프롬프트 간결화로 토큰 절감

## 🚀 다음 단계

### Phase 1 (즉시)
- ✅ profileBasedAIService.ts 생성 완료
- ⏳ serverAIService.ts 통합
- ⏳ MainScreen에 프로필 완성도 표시

### Phase 2 (1주 후)
- 사용자 피드백 수집
- Temperature 튜닝
- 프로필별 A/B 테스트

### Phase 3 (2주 후)
- 학습 기반 스타일 자동 조정
- "이 스타일이 마음에 드시나요?" 피드백 루프
- 자주 사용하는 톤/플랫폼 자동 추천

## 💡 추가 아이디어

### 1. 프로필 기반 예제 제공
```typescript
// "이렇게 써보는 건 어때요?" 제안
const example = profileBasedAI.generateExampleForProfile(profile);
// → "40대 엄마가 쓴 것처럼: 오늘 아이랑 공원 갔다가..."
```

### 2. 자동 톤 추천
```typescript
// 프로필 기반 톤 자동 선택
const recommendedTone = getToneByProfile(profile, context);
```

### 3. 상황별 페르소나
```typescript
// 같은 사람도 상황에 따라 다르게
if (platform === 'linkedin') {
  persona = '직장인'; // 전문적
} else if (platform === 'instagram') {
  persona = '엄마'; // 일상적
}
```

## 📝 결론

프로필 기반 AI 통합으로:
1. **개인화 향상**: "나처럼" 쓴 글
2. **토큰 효율**: 간결한 프롬프트
3. **사용자 경험**: 프로필 완성도 기반 가이드
4. **차별화**: 경쟁 서비스 대비 강력한 개인화

다음 작업: `serverAIService.ts` 통합 코드 작성

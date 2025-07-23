# AI 작성 화면 사운드 구현 가이드

## 🎯 목표
AI 작성 화면(AIWriteScreen)에 적절한 사운드/진동 피드백을 추가하여 사용자 경험 향상

## 📍 구현 위치 및 타이밍

### 1. 플랫폼 선택 (PlatformSelector)
```tsx
// src/components/PlatformSelector.tsx
import { soundManager } from '../utils/soundManager';

const handlePlatformSelect = (platform: string) => {
  soundManager.playTap(); // 가벼운 탭 피드백
  setSelectedPlatform(platform);
};
```

### 2. AI 생성 버튼
```tsx
// src/screens/AIWriteScreen.tsx
import { SoundButton } from '../components/buttons/SoundButton';

// 기존 TouchableOpacity를 SoundButton으로 교체
<SoundButton
  soundType="generate"  // AI 생성 시작 사운드
  hapticType="medium"   // 중간 강도 햅틱
  onPress={handleGenerate}
  style={styles.generateButton}
>
  <Text>AI로 생성하기</Text>
</SoundButton>
```

### 3. 생성 프로세스 피드백
```tsx
const handleGenerate = async () => {
  // 이미 SoundButton에서 generate 사운드 재생됨
  
  try {
    setIsGenerating(true);
    const result = await generateContent();
    
    // 생성 성공 시
    soundManager.playSuccess();
    navigation.navigate('Result', { content: result });
    
  } catch (error) {
    // 에러 발생 시
    soundManager.playError();
    showErrorMessage(error.message);
  } finally {
    setIsGenerating(false);
  }
};
```

### 4. 이미지 분석 시작
```tsx
const handleImageAnalysis = async (imageUri: string) => {
  soundManager.playGenerate(); // 분석 시작 알림
  
  try {
    const analysis = await analyzeImage(imageUri);
    soundManager.playSuccess(); // 분석 완료
    
  } catch (error) {
    soundManager.playError();
  }
};
```

### 5. 옵션 토글 (고급 설정)
```tsx
// 톤 선택, 길이 선택 등
const handleOptionToggle = (option: string) => {
  soundManager.haptic('light'); // 햅틱만 제공
  setSelectedOption(option);
};
```

### 6. 텍스트 입력 포커스
```tsx
<TextInput
  onFocus={() => soundManager.haptic('light')}
  onBlur={() => {/* 피드백 없음 */}}
  placeholder="어떤 내용을 작성할까요?"
/>
```

### 7. 결과 화면 액션
```tsx
// 복사 버튼
<SoundButton
  soundType="copy"
  onPress={handleCopy}
>
  <Icon name="copy" />
  <Text>복사</Text>
</SoundButton>

// 다시 생성
<SoundButton
  soundType="generate"
  onPress={handleRegenerate}
>
  <Icon name="refresh" />
  <Text>다시 생성</Text>
</SoundButton>

// 저장
<SoundButton
  soundType="success"
  onPress={handleSave}
>
  <Icon name="save" />
  <Text>저장</Text>
</SoundButton>
```

## 🎨 사운드 매핑

| 액션 | 사운드 타입 | 햅틱 타입 | 설명 |
|------|------------|-----------|------|
| 플랫폼 선택 | tap | light | 가벼운 선택 피드백 |
| AI 생성 시작 | generate | medium | 중요한 액션 시작 |
| 생성 완료 | success | medium | 성공적 완료 알림 |
| 에러 발생 | error | heavy | 문제 발생 알림 |
| 복사 | copy | light | 빠른 액션 완료 |
| 옵션 토글 | 없음 | light | 미세한 햅틱만 |
| 텍스트 포커스 | 없음 | light | 입력 시작 알림 |

## 💡 구현 예시

### 전체 구현 예시
```tsx
import React, { useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import { soundManager } from '../utils/soundManager';
import { SoundButton } from '../components/buttons/SoundButton';

export const AIWriteScreen = () => {
  const [content, setContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    // SoundButton이 자동으로 generate 사운드 재생
    setIsGenerating(true);
    
    try {
      const result = await generateAIContent(content);
      soundManager.playSuccess(); // 성공 피드백
      
      // 결과 화면으로 이동
      navigation.navigate('Result', { 
        content: result,
        onCopy: () => soundManager.playCopy(),
        onSave: () => soundManager.playSuccess(),
      });
      
    } catch (error) {
      soundManager.playError(); // 에러 피드백
      Alert.alert('오류', '생성 중 문제가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        value={content}
        onChangeText={setContent}
        onFocus={() => soundManager.haptic('light')}
        placeholder="어떤 내용을 작성할까요?"
        style={styles.input}
      />
      
      <SoundButton
        soundType="generate"
        hapticType="medium"
        onPress={handleGenerate}
        disabled={!content || isGenerating}
        style={styles.generateButton}
      >
        <Text style={styles.buttonText}>
          {isGenerating ? '생성 중...' : 'AI로 생성하기'}
        </Text>
      </SoundButton>
    </View>
  );
};
```

## ⚡ 성능 최적화

### 1. 디바운싱 적용
```tsx
import { useMemo } from 'react';
import { debounce } from 'lodash';

const debouncedPlayTap = useMemo(
  () => debounce(() => soundManager.playTap(), 100),
  []
);
```

### 2. 조건부 피드백
```tsx
// 연속 클릭 방지
const [lastTapTime, setLastTapTime] = useState(0);

const handleTapWithThrottle = () => {
  const now = Date.now();
  if (now - lastTapTime > 200) { // 200ms 간격
    soundManager.playTap();
    setLastTapTime(now);
  }
};
```

### 3. 사용자 설정 확인
```tsx
import AsyncStorage from '@react-native-async-storage/async-storage';

const checkSoundSettings = async () => {
  const soundEnabled = await AsyncStorage.getItem('soundEnabled');
  const vibrationEnabled = await AsyncStorage.getItem('vibrationEnabled');
  
  soundManager.setSoundEnabled(soundEnabled !== 'false');
  soundManager.setVibrationEnabled(vibrationEnabled !== 'false');
};
```

## 🎯 체크리스트

- [ ] PlatformSelector에 탭 피드백 추가
- [ ] AI 생성 버튼을 SoundButton으로 교체
- [ ] 생성 성공/실패 피드백 추가
- [ ] 이미지 분석 피드백 추가
- [ ] 복사/저장 버튼 피드백 추가
- [ ] 텍스트 입력 포커스 햅틱 추가
- [ ] 사용자 설정 연동
- [ ] 성능 테스트 및 최적화

## 📝 테스트 시나리오

1. **기본 플로우**
   - 플랫폼 선택 → tap 사운드
   - 내용 입력 → 포커스 햅틱
   - AI 생성 → generate 사운드
   - 생성 완료 → success 사운드
   - 복사 → copy 사운드

2. **에러 플로우**
   - 네트워크 오류 → error 사운드
   - 토큰 부족 → error 사운드
   - 유효성 검사 실패 → error 사운드

3. **설정 테스트**
   - 사운드 OFF → 햅틱만 동작
   - 진동 OFF → 사운드만 동작
   - 모두 OFF → 피드백 없음
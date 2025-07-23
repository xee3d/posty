# 축하 사운드 리소스 가이드

## 🎉 축하 사운드 사용 시나리오

### 1. 결제 성공 (이미 구현됨 ✅)
- PaymentSuccessModal에서 사용 중
- `soundManager.playCelebration()`
- 진동 패턴: `[0, 100, 50, 100, 50, 200]`

### 2. 첫 콘텐츠 생성 🎊
```tsx
// 사용자의 첫 번째 AI 콘텐츠 생성 완료 시
if (isFirstContent) {
  soundManager.playCelebration();
  showCelebrationModal('첫 콘텐츠 생성을 축하합니다! 🎉');
}
```

### 3. 미션 완료 🏆
```tsx
// 일일 미션, 주간 미션 완료 시
const handleMissionComplete = (mission: Mission) => {
  soundManager.playCelebration();
  showMissionCompleteAnimation(mission);
};
```

### 4. 레벨업 📈
```tsx
// 사용자 레벨 상승 시
if (newLevel > currentLevel) {
  soundManager.playCelebration();
  showLevelUpModal(newLevel);
}
```

### 5. 특별 이벤트 🎁
- 100번째 콘텐츠 생성
- 연속 7일 로그인
- 친구 초대 성공
- 특정 기념일

## 🎵 사운드 파일 스펙

### celebration.mp3 요구사항
```
- 길이: 1-2초
- 분위기: 밝고 경쾌한 멜로디
- 구성: 
  - 시작: 빠른 상승음 (0-0.3초)
  - 중간: 팡파레 스타일 (0.3-1.5초)
  - 끝: 부드러운 마무리 (1.5-2초)
- 예시: 파티 효과음, 레벨업 사운드, 달성 멜로디
```

### 무료 사운드 리소스
1. **Freesound.org**
   - "achievement", "celebration", "success" 검색
   - CC0 라이선스 확인

2. **Zapsplat.com**
   - 게임 사운드 카테고리
   - 무료 계정 필요

3. **Mixkit.co**
   - 로열티 프리 사운드
   - 즉시 다운로드 가능

4. **추천 검색어**
   - "game level up sound"
   - "achievement unlocked"
   - "celebration fanfare"
   - "success jingle"
   - "party popper sound"

## 🎨 진동 패턴 가이드

### 기본 축하 패턴
```tsx
// 짧은 축하 (1초)
Vibration.vibrate([0, 100, 50, 100, 50, 200]);

// 긴 축하 (2초)
Vibration.vibrate([0, 200, 100, 200, 100, 300, 100, 400]);

// 리듬감 있는 축하
Vibration.vibrate([0, 50, 50, 50, 50, 100, 100, 200]);
```

### 플랫폼별 최적화
```tsx
const playCelebrationVibration = () => {
  if (Platform.OS === 'ios') {
    // iOS: 부드러운 패턴
    Vibration.vibrate([0, 80, 40, 80, 40, 160]);
  } else if (Platform.OS === 'android') {
    // Android: 강한 패턴
    Vibration.vibrate([0, 100, 50, 100, 50, 200]);
  }
  // Web: 진동 미지원
};
```

## 🛠️ 구현 체크리스트

### 사운드 파일 준비
- [ ] celebration.mp3 파일 준비 (1-2초)
- [ ] Android: `android/app/src/main/res/raw/` 폴더에 복사
- [ ] iOS: Xcode에서 프로젝트에 추가
- [ ] 파일명 소문자 확인 (celebration.mp3)

### 코드 구현
- [ ] soundManager.ts에 playCelebration() 확인
- [ ] 첫 콘텐츠 생성 트래킹 추가
- [ ] 미션 완료 체크 로직 추가
- [ ] 레벨업 체크 로직 추가

### 애니메이션 연동
- [ ] SimpleConfetti 컴포넌트와 함께 사용
- [ ] Lottie 애니메이션 추가 (선택사항)
- [ ] 모달 애니메이션과 동기화

## 📱 사용 예시

### 완전한 축하 경험 구현
```tsx
import React, { useEffect } from 'react';
import { View, Text, Modal } from 'react-native';
import { soundManager } from '../utils/soundManager';
import SimpleConfetti from '../components/celebration/SimpleConfetti';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring 
} from 'react-native-reanimated';

export const CelebrationModal = ({ visible, title, message, onClose }) => {
  const scale = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // 1. 사운드 재생
      soundManager.playCelebration();
      
      // 2. 애니메이션 시작
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 150,
      });
      
      // 3. 자동 닫기 (3초 후)
      setTimeout(() => {
        onClose();
      }, 3000);
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.overlay}>
        {/* 폭죽 효과 */}
        <SimpleConfetti isVisible={visible} />
        
        {/* 축하 메시지 */}
        <Animated.View style={[styles.modalContent, animatedStyle]}>
          <Text style={styles.emoji}>🎉</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
        </Animated.View>
      </View>
    </Modal>
  );
};
```

## 🎯 성과 측정

### 사용자 반응 추적
```tsx
// Analytics 이벤트
const trackCelebration = (type: string) => {
  analytics.track('celebration_triggered', {
    type,
    soundEnabled: soundManager.isSoundEnabled,
    vibrationEnabled: soundManager.isVibrationEnabled,
  });
};
```

### A/B 테스트 제안
1. 사운드 있음 vs 없음
2. 진동 패턴 A vs B
3. 애니메이션 길이 (1초 vs 2초)

## 💡 팁

1. **과도한 사용 주의**
   - 특별한 순간에만 사용
   - 너무 자주 사용하면 효과 감소

2. **사용자 설정 존중**
   - 항상 사운드/진동 설정 확인
   - 시스템 무음 모드 체크

3. **접근성 고려**
   - 시각적 피드백도 함께 제공
   - 화면 리더 호환성 확인

4. **배터리 절약**
   - 긴 진동 패턴 피하기
   - 필요시에만 애니메이션 사용
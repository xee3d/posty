// 사운드 매니저 사용 예시

import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Switch } from 'react-native';
import { soundManager } from '../utils/soundManager';
import Clipboard from '@react-native-clipboard/clipboard';

// 1. 버튼 컴포넌트에서 사용
export const SoundButton: React.FC<{
  onPress: () => void;
  children: React.ReactNode;
  style?: any;
}> = ({ onPress, children, style }) => {
  const handlePress = () => {
    soundManager.playTap(); // 탭 사운드 + 햅틱
    onPress();
  };

  return (
    <TouchableOpacity onPress={handlePress} style={style}>
      {children}
    </TouchableOpacity>
  );
};

// 2. AI 생성 화면에서 사용
export const AIGenerateExample = () => {
  const handleGenerate = async () => {
    soundManager.playGenerate(); // 생성 시작 사운드
    
    try {
      // AI 생성 로직...
      // const result = await generateContent();
      
      soundManager.playSuccess(); // 성공 사운드
    } catch (error) {
      soundManager.playError(); // 에러 사운드
    }
  };

  return (
    <SoundButton onPress={handleGenerate} style={styles.button}>
      <Text>AI로 생성하기</Text>
    </SoundButton>
  );
};

// 3. 복사 기능에서 사용
export const CopyExample = () => {
  const handleCopy = () => {
    // 클립보드 복사 로직...
    const content = "복사할 텍스트";
    Clipboard.setString(content);
    
    soundManager.playCopy(); // 복사 사운드 + 가벼운 햅틱
  };

  return (
    <SoundButton onPress={handleCopy} style={styles.button}>
      <Text>복사</Text>
    </SoundButton>
  );
};

// 4. 설정 화면에서 사운드 토글
export const SoundSettings = () => {
  const [soundEnabled, setSoundEnabled] = React.useState(true);
  const [vibrationEnabled, setVibrationEnabled] = React.useState(true);

  const toggleSound = (value: boolean) => {
    setSoundEnabled(value);
    soundManager.setSoundEnabled(value);
    
    // 설정 변경 시 피드백
    if (value) {
      soundManager.playTap();
    }
  };

  const toggleVibration = (value: boolean) => {
    setVibrationEnabled(value);
    soundManager.setVibrationEnabled(value);
    
    // 설정 변경 시 피드백
    if (value) {
      soundManager.haptic('light');
    }
  };

  return (
    <View>
      <View style={styles.settingItem}>
        <Text>사운드 효과</Text>
        <Switch value={soundEnabled} onValueChange={toggleSound} />
      </View>
      
      <View style={styles.settingItem}>
        <Text>진동</Text>
        <Switch value={vibrationEnabled} onValueChange={toggleVibration} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 16,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
});

// 사용할 사운드 파일들:
// - tap.mp3: 짧고 가벼운 클릭음 (50-100ms)
// - success.mp3: 밝고 긍정적인 완료음 (200-300ms)
// - generate.mp3: 미래적인 시작음 (300-500ms)
// - copy.mp3: 빠른 "뿅" 소리 (100ms)
// - error.mp3: 부드러운 경고음 (200ms)

import Sound from 'react-native-sound';
import { Vibration, Platform } from 'react-native';

// 사운드 활성화 설정
Sound.setCategory('Playback');

class SoundManager {
  private sounds: { [key: string]: Sound | null } = {};
  private isSoundEnabled: boolean = true;
  private isVibrationEnabled: boolean = true;
  private isInitialized: boolean = false;

  constructor() {
    // 비동기로 사운드 로드
    this.loadSounds();
  }

  private loadSounds() {
    // 사운드 파일들을 미리 로드
    // 사운드 파일들을 미리 로드
    const soundFiles = {
      success: 'success.mp3',
      tap: 'tap.mp3',
      generate: 'generate.mp3',
      copy: 'copy.mp3',
      error: 'error.mp3',
    };

    Object.entries(soundFiles).forEach(([key, filename]) => {
      const sound = new Sound(filename, Sound.MAIN_BUNDLE, (error) => {
        if (error) {
          console.log(`Sound file not found: ${filename}. Using haptic feedback only.`);
          this.sounds[key] = null;
        } else {
          // 볼륨 설정 (시스템 볼륨의 70%)
          sound.setVolume(0.7);
          // 사운드 프리로드
          sound.setNumberOfLoops(0);
          this.sounds[key] = sound;
        }
      });
    });
    
    this.isInitialized = true;
  }

  // 사운드 재생
  play(soundName: keyof typeof this.sounds) {
    if (!this.isSoundEnabled) return;

    const sound = this.sounds[soundName];
    if (sound) {
      sound.stop(() => {
        sound.play((success) => {
          if (!success) {
            console.log(`Sound playback failed for ${soundName}`);
          }
        });
      });
    }
  }

  // 햅틱 피드백
  haptic(type: 'light' | 'medium' | 'heavy' = 'light') {
    if (!this.isVibrationEnabled) return;

    try {
      const duration = {
        light: 10,
        medium: 20,
        heavy: 30,
      };

      Vibration.vibrate(duration[type]);
    } catch (error) {
      console.log('Vibration error:', error);
      // 진동 실패시에도 앱이 크래시되지 않도록 함
    }
  }

  // 버튼 탭 피드백
  playTap() {
    this.play('tap');
    this.haptic('light');
  }

  // 성공 피드백
  playSuccess() {
    this.play('success');
    this.haptic('medium');
  }

  // 복사 피드백
  playCopy() {
    this.play('copy');
    this.haptic('light');
  }

  // AI 생성 시작
  playGenerate() {
    this.play('generate');
    this.haptic('medium');
  }

  // 에러 피드백
  playError() {
    this.play('error');
    try {
      if (Platform.OS === 'ios') {
        // iOS는 더 부드러운 햅틱 지원
        Vibration.vibrate([0, 10, 50, 10]);
      } else {
        this.haptic('heavy');
      }
    } catch (error) {
      console.log('Vibration error in playError:', error);
    }
  }

  // 새로고침 피드백
  playRefresh() {
    this.play('tap');
    this.haptic('light');
  }

  // 설정 토글
  setSoundEnabled(enabled: boolean) {
    this.isSoundEnabled = enabled;
  }

  setVibrationEnabled(enabled: boolean) {
    this.isVibrationEnabled = enabled;
  }

  // 메모리 정리
  release() {
    Object.values(this.sounds).forEach(sound => {
      if (sound) {
        sound.release();
      }
    });
    this.sounds = {};
  }
}

// 싱글톤 인스턴스
const soundManagerInstance = new SoundManager();

// 기본 export
export default soundManagerInstance;

// named export
export { soundManagerInstance as soundManager };

// 언어 감지 및 설정 서비스
import { NativeModules, Platform, AppState } from 'react-native';
import * as RNLocalize from 'react-native-localize';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18next from '../../locales/i18n';
import { store } from '../../store';
import { updateSettings } from '../../store/slices/userSlice';
import { getDeviceLanguage } from '../../utils/deviceLanguage';

// 지원하는 언어 목록
export type SupportedLanguage = 'ko' | 'en' | 'ja' | 'zh-CN';

export interface LanguageConfig {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  flagCode: string;
  isRTL: boolean;
}

// 지원 언어 설정
export const SUPPORTED_LANGUAGES: Record<SupportedLanguage, LanguageConfig> = {
  'ko': {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷',
    flagCode: 'KR',
    isRTL: false,
  },
  'en': {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    flagCode: 'EN',
    isRTL: false,
  },
  'ja': {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    flagCode: 'JP',
    isRTL: false,
  },
  'zh-CN': {
    code: 'zh-CN',
    name: 'Chinese (Simplified)',
    nativeName: '中文(简体)',
    flag: '🇨🇳',
    flagCode: 'CN',
    isRTL: false,
  },
};

const STORAGE_KEY = '@posty_app_language';

class LanguageService {
  private currentLanguage: SupportedLanguage = 'en';
  private isInitialized = false;
  private listeners: ((language: SupportedLanguage) => void)[] = [];
  private appStateListener: any = null;

  /**
   * 언어 서비스 초기화
   */
  async initialize(): Promise<SupportedLanguage> {
    try {
      // 시스템 언어 감지
      const systemLanguage = this.detectSystemLanguage();
      
      // 저장된 언어 설정 확인
      const storedLanguage = await AsyncStorage.getItem(STORAGE_KEY);
      
      if (storedLanguage && this.isSupportedLanguage(storedLanguage)) {
        // 저장된 언어 설정이 있으면 우선 사용
        this.currentLanguage = storedLanguage as SupportedLanguage;
        console.log('[LanguageService] Using stored language:', this.currentLanguage);
      } else {
        this.currentLanguage = systemLanguage;
        console.log('[LanguageService] Using system language:', this.currentLanguage);
      }
      
      // 언어 설정 저장
      await this.setLanguage(this.currentLanguage);

      this.isInitialized = true;
      return this.currentLanguage;
    } catch (error) {
      console.error('[LanguageService] Initialization failed:', error);
      this.currentLanguage = 'en'; // fallback to English
      this.isInitialized = true;
      return this.currentLanguage;
    }
  }

  /**
   * 시스템 언어 감지
   */
  private detectSystemLanguage(): SupportedLanguage {
    try {
      // deviceLanguage.ts의 getDeviceLanguage 함수 사용
      const deviceLang = getDeviceLanguage();
      console.log('[LanguageService] Device language from deviceLanguage.ts:', deviceLang);
      
      // 지원되는 언어인지 확인
      if (this.isSupportedLanguage(deviceLang)) {
        return deviceLang as SupportedLanguage;
      }
      
      // 중국어 특별 처리
      if (deviceLang === 'zh') {
        return 'zh-CN';
      }
      
      // 기본값: 영어
      console.log('[LanguageService] Using fallback language: en');
      return 'en';
    } catch (error) {
      console.error('[LanguageService] System language detection failed:', error);
      return 'en';
    }
  }

  /**
   * 지원되는 언어인지 확인
   */
  private isSupportedLanguage(code: string): boolean {
    return Object.keys(SUPPORTED_LANGUAGES).includes(code);
  }

  /**
   * 현재 언어 반환
   */
  getCurrentLanguage(): SupportedLanguage {
    if (!this.isInitialized) {
      console.log('[LanguageService] Service initializing, using fallback language');
      // 비동기 초기화를 시도하되, 즉시 fallback 값을 반환
      this.initialize().catch(error => {
        console.error('[LanguageService] Auto-initialization failed:', error);
      });
      return 'ko';
    }

    // i18next의 실제 현재 언어를 반환
    const i18nLanguage = i18next.language;

    // i18next 언어가 지원되는 언어인지 확인
    if (this.isSupportedLanguage(i18nLanguage)) {
      this.currentLanguage = i18nLanguage as SupportedLanguage; // 동기화
      return i18nLanguage as SupportedLanguage;
    }

    // i18next와 동기화 시도
    if (i18nLanguage !== this.currentLanguage) {
      i18next.changeLanguage(this.currentLanguage).catch(error => {
        console.warn('[LanguageService] Failed to sync i18next:', error);
      });
    }

    return this.currentLanguage;
  }

  /**
   * 언어 설정
   */
  async setLanguage(language: SupportedLanguage): Promise<void> {
    try {
      if (!this.isSupportedLanguage(language)) {
        throw new Error(`Unsupported language: ${language}`);
      }

      this.currentLanguage = language;
      await AsyncStorage.setItem(STORAGE_KEY, language);
      
      // i18n 시스템과 연동
      try {
        await i18next.changeLanguage(language);

        // 리소스 강제 리로드로 최신 번역 적용
        await i18next.reloadResources(language);

        console.log('[LanguageService] i18n language changed and resources reloaded for:', language);
      } catch (error) {
        console.warn('[LanguageService] i18n language change failed:', error);
      }
      
      // Redux 상태 업데이트
      store.dispatch(updateSettings({ language }));
      
      console.log('[LanguageService] Language changed to:', language);
      
      // 리스너들에게 알림
      this.listeners.forEach(listener => {
        try {
          listener(language);
        } catch (error) {
          console.error('[LanguageService] Listener error:', error);
        }
      });
      
    } catch (error) {
      console.error('[LanguageService] Failed to set language:', error);
      throw error;
    }
  }

  /**
   * 언어 설정 초기화 (시스템 언어로 재설정)
   */
  async resetToSystemLanguage(): Promise<void> {
    try {
      // 저장된 언어 설정 삭제
      await AsyncStorage.removeItem(STORAGE_KEY);
      console.log('[LanguageService] Stored language setting removed');
      
      // 시스템 언어로 재설정
      await this.initialize();
      console.log('[LanguageService] Language reset to system language:', this.currentLanguage);
    } catch (error) {
      console.error('[LanguageService] Failed to reset language:', error);
      throw error;
    }
  }

  /**
   * 언어 변경 리스너 추가
   */
  addLanguageChangeListener(listener: (language: SupportedLanguage) => void): () => void {
    this.listeners.push(listener);
    
    // 제거 함수 반환
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * 언어 설정 정보 반환
   */
  getLanguageConfig(language?: SupportedLanguage): LanguageConfig {
    const lang = language || this.currentLanguage;
    return SUPPORTED_LANGUAGES[lang];
  }

  /**
   * 모든 지원 언어 목록 반환
   */
  getSupportedLanguages(): LanguageConfig[] {
    return Object.values(SUPPORTED_LANGUAGES);
  }

  /**
   * 시스템이 사용자 언어 설정을 따르는지 확인
   */
  isUsingSystemLanguage(): boolean {
    const systemLanguage = this.detectSystemLanguage();
    return systemLanguage === this.currentLanguage;
  }

}

// 싱글톤 인스턴스
const languageService = new LanguageService();

export default languageService;

// 편의 함수들
export const getCurrentLanguage = (): SupportedLanguage => {
  return languageService.getCurrentLanguage();
};

export const setAppLanguage = async (language: SupportedLanguage): Promise<void> => {
  return languageService.setLanguage(language);
};

export const getLanguageConfig = (language?: SupportedLanguage): LanguageConfig => {
  return languageService.getLanguageConfig(language);
};
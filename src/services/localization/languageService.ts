// 언어 감지 및 설정 서비스
import { NativeModules, Platform } from 'react-native';
import * as RNLocalize from 'react-native-localize';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 지원하는 언어 목록
export type SupportedLanguage = 'ko' | 'en' | 'ja' | 'zh-CN';

export interface LanguageConfig {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  isRTL: boolean;
}

// 지원 언어 설정
export const SUPPORTED_LANGUAGES: Record<SupportedLanguage, LanguageConfig> = {
  'ko': {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷',
    isRTL: false,
  },
  'en': {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    isRTL: false,
  },
  'ja': {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    isRTL: false,
  },
  'zh-CN': {
    code: 'zh-CN',
    name: 'Chinese (Simplified)',
    nativeName: '中文(简体)',
    flag: '🇨🇳',
    isRTL: false,
  },
};

const STORAGE_KEY = '@posty_app_language';

class LanguageService {
  private currentLanguage: SupportedLanguage = 'ko';
  private isInitialized = false;
  private listeners: ((language: SupportedLanguage) => void)[] = [];

  /**
   * 언어 서비스 초기화
   */
  async initialize(): Promise<SupportedLanguage> {
    try {
      // 저장된 언어 설정 확인
      const storedLanguage = await AsyncStorage.getItem(STORAGE_KEY);
      
      if (storedLanguage && this.isSupportedLanguage(storedLanguage)) {
        this.currentLanguage = storedLanguage as SupportedLanguage;
        console.log('[LanguageService] Using stored language:', this.currentLanguage);
      } else {
        // 시스템 언어 감지
        this.currentLanguage = this.detectSystemLanguage();
        console.log('[LanguageService] Using system language:', this.currentLanguage);
        
        // 초기 설정 저장
        await this.setLanguage(this.currentLanguage);
      }
      
      this.isInitialized = true;
      return this.currentLanguage;
    } catch (error) {
      console.error('[LanguageService] Initialization failed:', error);
      this.currentLanguage = 'ko'; // fallback to Korean
      this.isInitialized = true;
      return this.currentLanguage;
    }
  }

  /**
   * 시스템 언어 감지
   */
  private detectSystemLanguage(): SupportedLanguage {
    try {
      const locales = RNLocalize.getLocales();
      console.log('[LanguageService] System locales:', locales);
      
      for (const locale of locales) {
        const languageCode = locale.languageCode;
        const countryCode = locale.countryCode;
        
        // 정확한 매칭 (언어-국가)
        const fullCode = `${languageCode}-${countryCode}` as SupportedLanguage;
        if (this.isSupportedLanguage(fullCode)) {
          return fullCode;
        }
        
        // 언어 코드만 매칭
        if (this.isSupportedLanguage(languageCode)) {
          // 중국어의 경우 간체로 기본 설정
          if (languageCode === 'zh') {
            return 'zh-CN';
          }
          return languageCode as SupportedLanguage;
        }
      }
      
      // 기본값: 한국어
      return 'ko';
    } catch (error) {
      console.error('[LanguageService] System language detection failed:', error);
      return 'ko';
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
      console.warn('[LanguageService] Service not initialized, using Korean');
      return 'ko';
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

  /**
   * 시스템 언어로 재설정
   */
  async resetToSystemLanguage(): Promise<void> {
    const systemLanguage = this.detectSystemLanguage();
    await this.setLanguage(systemLanguage);
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
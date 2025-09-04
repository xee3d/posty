import { getDeviceLanguage } from '../../src/utils/deviceLanguage';

// React Native Localize 모킹
jest.mock('react-native-localize', () => ({
  getLocales: jest.fn(() => [
    { countryCode: 'KR', languageCode: 'ko', languageTag: 'ko-KR' },
  ]),
  findBestLanguageTag: jest.fn((languageTags: string[]) => ({
    languageTag: languageTags.includes('ko') ? 'ko' : languageTags[0],
    isRTL: false,
  })),
}));

describe('Device Language Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDeviceLanguage', () => {
    it('should return Korean language code', () => {
      const result = getDeviceLanguage();
      expect(result).toBe('ko');
    });

    it('should return default language when no match found', () => {
      const { findBestLanguageTag, getLocales } = require('react-native-localize');
      
      // 영어 로케일로 모킹
      getLocales.mockReturnValue([
        { countryCode: 'US', languageCode: 'en', languageTag: 'en-US' },
      ]);
      
      findBestLanguageTag.mockReturnValue({
        languageTag: 'en',
        isRTL: false,
      });

      const result = getDeviceLanguage();
      expect(result).toBe('en');
    });

    it('should handle empty locale array', () => {
      const { getLocales } = require('react-native-localize');
      getLocales.mockReturnValue([]);

      const result = getDeviceLanguage();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
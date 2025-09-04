// Text constants and validation utilities test

describe('Text Constants and Validation', () => {
  describe('String validation utilities', () => {
    it('should validate empty strings correctly', () => {
      const isEmpty = (str: string) => str.trim().length === 0;
      
      expect(isEmpty('')).toBe(true);
      expect(isEmpty('   ')).toBe(true);
      expect(isEmpty('hello')).toBe(false);
    });

    it('should validate Korean text correctly', () => {
      const isKorean = (str: string) => /[가-힣]/.test(str);
      
      expect(isKorean('안녕하세요')).toBe(true);
      expect(isKorean('Hello')).toBe(false);
      expect(isKorean('안녕 Hello')).toBe(true);
    });

    it('should validate English text correctly', () => {
      const isEnglish = (str: string) => /[a-zA-Z]/.test(str);
      
      expect(isEnglish('Hello')).toBe(true);
      expect(isEnglish('안녕하세요')).toBe(false);
      expect(isEnglish('Hello 안녕')).toBe(true);
    });

    it('should count text length correctly', () => {
      const getLength = (str: string) => str.length;
      
      expect(getLength('Hello')).toBe(5);
      expect(getLength('안녕하세요')).toBe(5);
      expect(getLength('')).toBe(0);
    });
  });

  describe('Text formatting utilities', () => {
    it('should trim whitespace correctly', () => {
      const trimText = (str: string) => str.trim();
      
      expect(trimText('  hello  ')).toBe('hello');
      expect(trimText('\n\ttest\n\t')).toBe('test');
      expect(trimText('   ')).toBe('');
    });

    it('should capitalize first letter correctly', () => {
      const capitalize = (str: string) => 
        str.charAt(0).toUpperCase() + str.slice(1);
      
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('HELLO')).toBe('HELLO');
      expect(capitalize('')).toBe('');
    });

    it('should truncate text correctly', () => {
      const truncate = (str: string, length: number) => 
        str.length > length ? str.substring(0, length) + '...' : str;
      
      expect(truncate('Hello World', 5)).toBe('Hello...');
      expect(truncate('Hi', 10)).toBe('Hi');
      expect(truncate('', 5)).toBe('');
    });
  });

  describe('Content validation', () => {
    it('should validate content length', () => {
      const isValidContentLength = (content: string, min: number, max: number) => {
        const length = content.trim().length;
        return length >= min && length <= max;
      };
      
      expect(isValidContentLength('Hello', 1, 10)).toBe(true);
      expect(isValidContentLength('', 1, 10)).toBe(false);
      expect(isValidContentLength('Very long text here', 1, 10)).toBe(false);
    });

    it('should detect hashtags correctly', () => {
      const extractHashtags = (text: string) => {
        const hashtagRegex = /#[\w가-힣]+/g;
        return text.match(hashtagRegex) || [];
      };
      
      expect(extractHashtags('Hello #world #테스트')).toEqual(['#world', '#테스트']);
      expect(extractHashtags('No hashtags here')).toEqual([]);
      expect(extractHashtags('#first #second')).toEqual(['#first', '#second']);
    });

    it('should detect mentions correctly', () => {
      const extractMentions = (text: string) => {
        const mentionRegex = /@[\w가-힣]+/g;
        return text.match(mentionRegex) || [];
      };
      
      expect(extractMentions('Hello @user @테스트')).toEqual(['@user', '@테스트']);
      expect(extractMentions('No mentions here')).toEqual([]);
      expect(extractMentions('@first @second')).toEqual(['@first', '@second']);
    });
  });

  describe('Platform-specific validation', () => {
    it('should validate Twitter character limits', () => {
      const isValidTweet = (text: string) => text.length <= 280;
      
      expect(isValidTweet('Short tweet')).toBe(true);
      expect(isValidTweet('a'.repeat(280))).toBe(true);
      expect(isValidTweet('a'.repeat(281))).toBe(false);
    });

    it('should validate Instagram caption limits', () => {
      const isValidInstagramCaption = (text: string) => text.length <= 2200;
      
      expect(isValidInstagramCaption('Instagram post')).toBe(true);
      expect(isValidInstagramCaption('a'.repeat(2200))).toBe(true);
      expect(isValidInstagramCaption('a'.repeat(2201))).toBe(false);
    });
  });
});
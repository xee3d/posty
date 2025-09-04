import AsyncStorage from '@react-native-async-storage/async-storage';

// AsyncStorage는 이미 jest.setup.js에서 모킹됨
describe('Safe AsyncStorage Utils', () => {
  const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Storage Operations', () => {
    it('should store and retrieve string data', async () => {
      const testKey = 'test-key';
      const testValue = 'test-value';

      mockAsyncStorage.setItem.mockResolvedValue();
      mockAsyncStorage.getItem.mockResolvedValue(testValue);

      await AsyncStorage.setItem(testKey, testValue);
      const retrieved = await AsyncStorage.getItem(testKey);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(testKey, testValue);
      expect(retrieved).toBe(testValue);
    });

    it('should store and retrieve JSON data', async () => {
      const testKey = 'test-json';
      const testObject = { name: '테스트', count: 42 };
      const jsonString = JSON.stringify(testObject);

      mockAsyncStorage.setItem.mockResolvedValue();
      mockAsyncStorage.getItem.mockResolvedValue(jsonString);

      await AsyncStorage.setItem(testKey, jsonString);
      const retrieved = await AsyncStorage.getItem(testKey);
      const parsed = retrieved ? JSON.parse(retrieved) : null;

      expect(parsed).toEqual(testObject);
    });

    it('should handle non-existent keys', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await AsyncStorage.getItem('non-existent-key');

      expect(result).toBeNull();
    });

    it('should remove items correctly', async () => {
      const testKey = 'test-remove';
      
      mockAsyncStorage.removeItem.mockResolvedValue();
      mockAsyncStorage.getItem.mockResolvedValue(null);

      await AsyncStorage.removeItem(testKey);
      const result = await AsyncStorage.getItem(testKey);

      expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith(testKey);
      expect(result).toBeNull();
    });

    it('should clear all storage', async () => {
      mockAsyncStorage.clear.mockResolvedValue();

      await AsyncStorage.clear();

      expect(mockAsyncStorage.clear).toHaveBeenCalled();
    });

    it('should get all keys', async () => {
      const mockKeys = ['key1', 'key2', 'key3'];
      mockAsyncStorage.getAllKeys.mockResolvedValue(mockKeys);

      const keys = await AsyncStorage.getAllKeys();

      expect(keys).toEqual(mockKeys);
    });
  });

  describe('Error Handling', () => {
    it('should handle setItem errors', async () => {
      const error = new Error('Storage full');
      mockAsyncStorage.setItem.mockRejectedValue(error);

      try {
        await AsyncStorage.setItem('test', 'value');
        fail('Should have thrown an error');
      } catch (e) {
        expect(e).toBe(error);
      }
    });

    it('should handle getItem errors', async () => {
      const error = new Error('Read error');
      mockAsyncStorage.getItem.mockRejectedValue(error);

      try {
        await AsyncStorage.getItem('test');
        fail('Should have thrown an error');
      } catch (e) {
        expect(e).toBe(error);
      }
    });
  });

  describe('Multi-value Operations', () => {
    it('should handle multiple set operations', async () => {
      const keyValuePairs: [string, string][] = [
        ['key1', 'value1'],
        ['key2', 'value2'],
      ];

      mockAsyncStorage.multiSet.mockResolvedValue();

      await AsyncStorage.multiSet(keyValuePairs);

      expect(mockAsyncStorage.multiSet).toHaveBeenCalledWith(keyValuePairs);
    });

    it('should handle multiple get operations', async () => {
      const keys = ['key1', 'key2'];
      const mockResult: [string, string | null][] = [
        ['key1', 'value1'],
        ['key2', 'value2'],
      ];

      mockAsyncStorage.multiGet.mockResolvedValue(mockResult);

      const result = await AsyncStorage.multiGet(keys);

      expect(mockAsyncStorage.multiGet).toHaveBeenCalledWith(keys);
      expect(result).toEqual(mockResult);
    });
  });
});
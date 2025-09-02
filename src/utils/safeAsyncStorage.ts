// Safe AsyncStorage wrapper to prevent undefined key errors
import AsyncStorage from "@react-native-async-storage/async-storage";

const validateKey = (key: any): string => {
  // Comprehensive key validation
  if (key === undefined || key === null) {
    const error = new Error(
      `AsyncStorage key is ${key === undefined ? "undefined" : "null"}`
    );
    console.error("🚨 AsyncStorage Key Validation Error:", error.message);
    console.trace("Stack trace for undefined key:");

    // Return a safe fallback key
    const fallbackKey = `fallback_key_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 8)}`;
    console.warn(`🔧 Using fallback key: ${fallbackKey}`);
    return fallbackKey;
  }

  if (typeof key !== "string") {
    const error = new Error(
      `AsyncStorage key must be string, got ${typeof key}: "${key}"`
    );
    console.error("🚨 AsyncStorage Key Validation Error:", error.message);

    // Try to convert to string if possible
    const stringKey = String(key);
    if (stringKey === "undefined" || stringKey === "null" || stringKey === "") {
      const fallbackKey = `fallback_key_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 8)}`;
      console.warn(`🔧 Using fallback key: ${fallbackKey}`);
      return fallbackKey;
    }
    return stringKey;
  }

  if (key === "" || key === "undefined" || key === "null") {
    const error = new Error(`AsyncStorage key is invalid string: "${key}"`);
    console.error("🚨 AsyncStorage Key Validation Error:", error.message);

    const fallbackKey = `fallback_key_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 8)}`;
    console.warn(`🔧 Using fallback key: ${fallbackKey}`);
    return fallbackKey;
  }

  // Check for problematic key patterns
  if (key.includes("undefined") || key.includes("null")) {
    const error = new Error(
      `AsyncStorage key contains undefined/null: "${key}"`
    );
    console.error("🚨 AsyncStorage Key Validation Error:", error.message);

    // Clean the key by replacing undefined/null with safe values
    const cleanKey = key
      .replace(/undefined/g, "unknown")
      .replace(/null/g, "empty");
    console.warn(`🔧 Cleaned key from "${key}" to "${cleanKey}"`);
    return cleanKey;
  }

  return key;
};

// Create a safer AsyncStorage by wrapping all methods
export const safeAsyncStorage = {
  async setItem(key: any, value: string): Promise<void> {
    const safeKey = validateKey(key);
    try {
      return await AsyncStorage.setItem(safeKey, value);
    } catch (error) {
      console.error("🚨 AsyncStorage.setItem failed:", error);
      throw error;
    }
  },

  async getItem(key: any): Promise<string | null> {
    const safeKey = validateKey(key);
    try {
      return await AsyncStorage.getItem(safeKey);
    } catch (error) {
      console.error("🚨 AsyncStorage.getItem failed:", error);
      return null;
    }
  },

  async removeItem(key: any): Promise<void> {
    const safeKey = validateKey(key);
    try {
      return await AsyncStorage.removeItem(safeKey);
    } catch (error) {
      console.error("🚨 AsyncStorage.removeItem failed:", error);
      throw error;
    }
  },

  // Enhanced multiSet with key validation
  async multiSet(keyValuePairs: Array<[string, string]>): Promise<void> {
    const safeKeyValuePairs = keyValuePairs.map(
      ([key, value]) => [validateKey(key), value] as [string, string]
    );
    try {
      return await AsyncStorage.multiSet(safeKeyValuePairs);
    } catch (error) {
      console.error("🚨 AsyncStorage.multiSet failed:", error);
      throw error;
    }
  },

  // Enhanced multiGet with key validation
  async multiGet(
    keys: Array<string>
  ): Promise<readonly [string, string | null][]> {
    const safeKeys = keys.map(validateKey);
    try {
      return await AsyncStorage.multiGet(safeKeys);
    } catch (error) {
      console.error("🚨 AsyncStorage.multiGet failed:", error);
      return [];
    }
  },

  // Enhanced multiRemove with key validation
  async multiRemove(keys: Array<string>): Promise<void> {
    const safeKeys = keys.map(validateKey);
    try {
      return await AsyncStorage.multiRemove(safeKeys);
    } catch (error) {
      console.error("🚨 AsyncStorage.multiRemove failed:", error);
      throw error;
    }
  },

  // Pass through other AsyncStorage methods
  getAllKeys: AsyncStorage.getAllKeys,
  clear: AsyncStorage.clear,
};

// Also export individual functions for easier imports
export const {
  setItem,
  getItem,
  removeItem,
  multiSet,
  multiGet,
  multiRemove,
  getAllKeys,
  clear,
} = safeAsyncStorage;

export default safeAsyncStorage;

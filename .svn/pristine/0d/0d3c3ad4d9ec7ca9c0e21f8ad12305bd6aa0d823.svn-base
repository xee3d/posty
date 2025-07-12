import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

export interface SavedContent {
  id: string;
  content: string;
  hashtags: string[];
  tone: string;
  length: string;
  platform: string;
  createdAt: string;
  prompt?: string;
}

const STORAGE_KEYS = {
  SAVED_CONTENTS: 'molly_saved_contents',
  USER_PREFERENCES: 'molly_user_preferences',
  USER_DATA: 'molly_user_data',
};

// 콘텐츠 저장
export const saveContent = async (content: Omit<SavedContent, 'id' | 'createdAt'>): Promise<void> => {
  try {
    const savedContents = await getSavedContents();
    const newContent: SavedContent = {
      ...content,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    
    savedContents.unshift(newContent); // 최신 글을 앞에 추가
    
    // 최대 50개까지만 저장
    if (savedContents.length > 50) {
      savedContents.pop();
    }
    
    await AsyncStorage.setItem(STORAGE_KEYS.SAVED_CONTENTS, JSON.stringify(savedContents));
  } catch (error) {
    console.error('Error saving content:', error);
  }
};

// 저장된 콘텐츠 불러오기
export const getSavedContents = async (): Promise<SavedContent[]> => {
  try {
    const savedContentsJson = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_CONTENTS);
    return savedContentsJson ? JSON.parse(savedContentsJson) : [];
  } catch (error) {
    console.error('Error loading saved contents:', error);
    return [];
  }
};

// 특정 콘텐츠 삭제
export const deleteContent = async (id: string): Promise<void> => {
  try {
    const savedContents = await getSavedContents();
    const filteredContents = savedContents.filter(content => content.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.SAVED_CONTENTS, JSON.stringify(filteredContents));
  } catch (error) {
    console.error('Error deleting content:', error);
  }
};

// 사용자 설정 저장
export const saveUserPreferences = async (preferences: any): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving preferences:', error);
  }
};

// 사용자 설정 불러오기
export const getUserPreferences = async (): Promise<any> => {
  try {
    const preferencesJson = await AsyncStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
    return preferencesJson ? JSON.parse(preferencesJson) : null;
  } catch (error) {
    console.error('Error loading preferences:', error);
    return null;
  }
};

// 사용자 정보 저장
export const setUser = async (user: User): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user data:', error);
  }
};

// 사용자 정보 불러오기
export const getUser = async (): Promise<User | null> => {
  try {
    const userJson = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
    return userJson ? JSON.parse(userJson) : null;
  } catch (error) {
    console.error('Error loading user data:', error);
    return null;
  }
};

// 모든 데이터 초기화
export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.SAVED_CONTENTS,
      STORAGE_KEYS.USER_PREFERENCES,
      STORAGE_KEYS.USER_DATA,
    ]);
  } catch (error) {
    console.error('Error clearing data:', error);
  }
};

// storage 객체로 모든 함수 export
export const storage = {
  saveContent,
  getSavedContents,
  deleteContent,
  saveUserPreferences,
  getUserPreferences,
  setUser,
  getUser,
  clearAllData,
};

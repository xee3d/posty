import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import { User } from '../types';
import firestoreService from '../services/firebase/firestoreService';
import offlineSyncService from '../services/offline/offlineSyncService';

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

// 콘텐츠 저장 - Firestore와 로컬 둘 다 저장
export const saveContent = async (content: Omit<SavedContent, 'id' | 'createdAt'>): Promise<void> => {
  try {
    // 1. Firestore에 저장 (로그인된 경우)
    const currentUser = auth().currentUser;
    if (currentUser) {
      try {
        await firestoreService.savePost({
          content: content.content,
          originalPrompt: content.prompt || '',
          platform: content.platform as any,
          tone: content.tone as any,
          length: content.length as any,
          style: 'general',
          hashtags: content.hashtags,
          category: getCategoryFromTone(content.tone),
        });
        console.log('Content saved to Firestore');
      } catch (firestoreError) {
        console.error('Failed to save to Firestore:', firestoreError);
        
        // 오프라인 큐에 추가
        if (!offlineSyncService.getNetworkStatus()) {
          await offlineSyncService.addToQueue('savePost', {
            content: content.content,
            originalPrompt: content.prompt || '',
            platform: content.platform as any,
            tone: content.tone as any,
            length: content.length as any,
            style: 'general',
            hashtags: content.hashtags,
            category: getCategoryFromTone(content.tone),
          });
        }
      }
    }
    
    // 2. 로컬에도 저장 (오프라인 지원 및 비로그인 사용자)
    const savedContents = await getSavedContents();
    const newContent: SavedContent = {
      ...content,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    
    savedContents.unshift(newContent); // 최신 글을 앞에 추가
    
    // 최대 10개까지만 저장
    while (savedContents.length > 10) {
      savedContents.pop();
    }
    
    await AsyncStorage.setItem(STORAGE_KEYS.SAVED_CONTENTS, JSON.stringify(savedContents));
  } catch (error) {
    console.error('Error saving content:', error);
    throw error; // 에러 전파
  }
};

// 저장된 콘텐츠 불러오기 - Firestore 우선, 실패시 로컬
export const getSavedContents = async (): Promise<SavedContent[]> => {
  try {
    // 1. Firestore에서 가져오기 시도 (로그인된 경우)
    const currentUser = auth().currentUser;
    if (currentUser) {
      try {
        const posts = await firestoreService.getUserPosts();
        
        // Firestore 데이터를 SavedContent 형식으로 변환
        const firestoreContents: SavedContent[] = posts.map(post => ({
          id: post.id,
          content: post.content,
          hashtags: post.hashtags,
          tone: post.tone,
          length: post.length,
          platform: post.platform,
          createdAt: post.createdAt.toDate().toISOString(),
          prompt: post.originalPrompt,
        }));
        
        return firestoreContents;
      } catch (firestoreError) {
        console.error('Failed to load from Firestore:', firestoreError);
        // Firestore 실패시 로컬 데이터 반환
      }
    }
    
    // 2. 로컬에서 가져오기 (비로그인 또는 Firestore 실패)
    const savedContentsJson = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_CONTENTS);
    return savedContentsJson ? JSON.parse(savedContentsJson) : [];
  } catch (error) {
    console.error('Error loading saved contents:', error);
    return [];
  }
};

// 특정 콘텐츠 삭제 - Firestore와 로컬 둘 다
export const deleteContent = async (id: string): Promise<void> => {
  try {
    // 1. Firestore에서 삭제 (로그인된 경우)
    const currentUser = auth().currentUser;
    if (currentUser) {
      try {
        await firestoreService.deletePost(id);
        console.log('Content deleted from Firestore');
      } catch (firestoreError) {
        console.error('Failed to delete from Firestore:', firestoreError);
        
        // 오프라인 큐에 추가
        if (!offlineSyncService.getNetworkStatus()) {
          await offlineSyncService.addToQueue('deletePost', { postId: id });
        }
      }
    }
    
    // 2. 로컬에서도 삭제
    const savedContents = await getSavedContents();
    const filteredContents = savedContents.filter(content => content.id !== id);
    await AsyncStorage.setItem(STORAGE_KEYS.SAVED_CONTENTS, JSON.stringify(filteredContents));
  } catch (error) {
    console.error('Error deleting content:', error);
  }
};

// 사용자 설정 저장 - Firestore와 로컬 둘 다
export const saveUserPreferences = async (preferences: any): Promise<void> => {
  try {
    // 1. Firestore에 저장 (로그인된 경우)
    const currentUser = auth().currentUser;
    if (currentUser) {
      try {
        await firestoreService.updateUserSettings(preferences);
        console.log('Preferences saved to Firestore');
      } catch (firestoreError) {
        console.error('Failed to save preferences to Firestore:', firestoreError);
        
        // 오프라인 큐에 추가
        if (!offlineSyncService.getNetworkStatus()) {
          await offlineSyncService.addToQueue('updateUserSettings', { settings: preferences });
        }
      }
    }
    
    // 2. 로컬에도 저장
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, JSON.stringify(preferences));
  } catch (error) {
    console.error('Error saving preferences:', error);
  }
};

// 사용자 설정 불러오기 - Firestore 우선, 실패시 로컬
export const getUserPreferences = async (): Promise<any> => {
  try {
    // 1. Firestore에서 가져오기 시도 (로그인된 경우)
    const currentUser = auth().currentUser;
    if (currentUser) {
      try {
        const userData = await firestoreService.getUser();
        if (userData?.settings) {
          return userData.settings;
        }
      } catch (firestoreError) {
        console.error('Failed to load preferences from Firestore:', firestoreError);
      }
    }
    
    // 2. 로컬에서 가져오기
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

// 톤에서 카테고리 추출
function getCategoryFromTone(tone: string): string {
  const toneToCategory: { [key: string]: string } = {
    'casual': '일상',
    'professional': '비즈니스',
    'humorous': '유머',
    'emotional': '감성',
    'genz': '트렌드',
    'millennial': '라이프스타일',
    'minimalist': '미니멀',
    'storytelling': '스토리',
    'motivational': '동기부여',
  };
  
  return toneToCategory[tone] || '일상';
}

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

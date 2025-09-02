import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "../types";
import offlineSyncService from "../services/offline/offlineSyncService";

export interface SavedContent {
  id: string;
  content: string;
  hashtags: string[];
  platform: string;
  tone: string;
  length: string;
  createdAt: string;
  prompt?: string;
}

const STORAGE_KEYS = {
  SAVED_CONTENTS: "saved_contents",
  USER_PREFERENCES: "user_preferences",
  USER_STATS: "user_stats",
};

// 콘텐츠 저장 - 로컬 스토리지만 사용
export const saveContent = async (
  content: Omit<SavedContent, "id" | "createdAt">
): Promise<void> => {
  try {
    const newContent: SavedContent = {
      ...content,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    // 기존 콘텐츠 가져오기
    const existingContents = await getSavedContents();
    const updatedContents = [newContent, ...existingContents];

    // 최대 100개만 유지
    const limitedContents = updatedContents.slice(0, 100);

    await AsyncStorage.setItem(
      STORAGE_KEYS.SAVED_CONTENTS,
      JSON.stringify(limitedContents)
    );

    // 오프라인 동기화 큐에 추가 (나중에 서버와 동기화할 때 사용)
    await offlineSyncService.addToQueue("savePost", newContent);

    console.log("Content saved to local storage");
  } catch (error) {
    console.error("Failed to save content:", error);
    throw error;
  }
};

// 카테고리 추출 함수
const getCategoryFromTone = (tone: string): string => {
  const toneMap: { [key: string]: string } = {
    friendly: "lifestyle",
    professional: "business",
    casual: "personal",
    formal: "business",
    playful: "entertainment",
    inspiring: "motivation",
  };
  return toneMap[tone] || "general";
};

// 저장된 콘텐츠 가져오기
export const getSavedContents = async (): Promise<SavedContent[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_CONTENTS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to get saved contents:", error);
    return [];
  }
};

// 콘텐츠 삭제
export const deleteContent = async (id: string): Promise<void> => {
  try {
    const existingContents = await getSavedContents();
    const updatedContents = existingContents.filter(
      (content) => content.id !== id
    );

    await AsyncStorage.setItem(
      STORAGE_KEYS.SAVED_CONTENTS,
      JSON.stringify(updatedContents)
    );

    // 오프라인 동기화 큐에 추가
    await offlineSyncService.addToQueue("deletePost", { id });

    console.log("Content deleted from local storage");
  } catch (error) {
    console.error("Failed to delete content:", error);
    throw error;
  }
};

// 사용자 설정 저장
export const saveUserPreferences = async (preferences: any): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.USER_PREFERENCES,
      JSON.stringify(preferences)
    );

    // 오프라인 동기화 큐에 추가
    await offlineSyncService.addToQueue("updateUserSettings", preferences);

    console.log("User preferences saved to local storage");
  } catch (error) {
    console.error("Failed to save user preferences:", error);
    throw error;
  }
};

// 사용자 설정 가져오기
export const getUserPreferences = async (): Promise<any> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error("Failed to get user preferences:", error);
    return {};
  }
};

// 사용자 통계 저장
export const saveUserStats = async (stats: any): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_STATS, JSON.stringify(stats));
    console.log("User stats saved to local storage");
  } catch (error) {
    console.error("Failed to save user stats:", error);
    throw error;
  }
};

// 사용자 통계 가져오기
export const getUserStats = async (): Promise<any> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_STATS);
    return data
      ? JSON.parse(data)
      : {
          totalPosts: 0,
          totalTokensUsed: 0,
          favoriteCategories: [],
          topHashtags: [],
        };
  } catch (error) {
    console.error("Failed to get user stats:", error);
    return {
      totalPosts: 0,
      totalTokensUsed: 0,
      favoriteCategories: [],
      topHashtags: [],
    };
  }
};

// 모든 데이터 초기화
export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.SAVED_CONTENTS,
      STORAGE_KEYS.USER_PREFERENCES,
      STORAGE_KEYS.USER_STATS,
    ]);
    console.log("All data cleared from local storage");
  } catch (error) {
    console.error("Failed to clear data:", error);
    throw error;
  }
};

// 백업 데이터 내보내기
export const exportData = async (): Promise<string> => {
  try {
    const contents = await getSavedContents();
    const preferences = await getUserPreferences();
    const stats = await getUserStats();

    const backupData = {
      contents,
      preferences,
      stats,
      exportDate: new Date().toISOString(),
      version: "1.0",
    };

    return JSON.stringify(backupData, null, 2);
  } catch (error) {
    console.error("Failed to export data:", error);
    throw error;
  }
};

// 백업 데이터 가져오기
export const importData = async (backupJson: string): Promise<void> => {
  try {
    const backupData = JSON.parse(backupJson);

    if (backupData.contents) {
      await AsyncStorage.setItem(
        STORAGE_KEYS.SAVED_CONTENTS,
        JSON.stringify(backupData.contents)
      );
    }

    if (backupData.preferences) {
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_PREFERENCES,
        JSON.stringify(backupData.preferences)
      );
    }

    if (backupData.stats) {
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_STATS,
        JSON.stringify(backupData.stats)
      );
    }

    console.log("Data imported successfully");
  } catch (error) {
    console.error("Failed to import data:", error);
    throw error;
  }
};

// 기본 storage export (기존 호환성 유지)
export const storage = {
  saveContent,
  getSavedContents,
  deleteContent,
  saveUserPreferences,
  getUserPreferences,
  saveUserStats,
  getUserStats,
  clearAllData,
  exportData,
  importData,
};

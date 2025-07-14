import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveContent } from '../utils/storage';
import simplePostService from './simplePostService';
import { getCategoryFromTone, extractHashtags } from '../utils/promptUtils';
import { generateHashtags } from '../utils/platformStyles';
import analyticsService from './analytics/analyticsService';

interface SaveContentParams {
  content: string;
  platform?: string;
  tone?: string;
  length?: string;
  prompt?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

class ContentSaveService {
  async saveGeneratedContent({
    content,
    platform = 'instagram',
    tone = 'casual',
    length = 'medium',
    prompt = '',
    onSuccess,
    onError,
  }: SaveContentParams): Promise<boolean> {
    try {
      // 해시태그 추출 및 플랫폼별 조정
      const extractedHashtags = extractHashtags(content);
      const adjustedHashtags = generateHashtags(extractedHashtags, platform);
      
      // 1. storage.ts를 통해 저장 (Firestore + 로컬 자동 처리)
      await saveContent({
        content,
        hashtags: adjustedHashtags,
        tone,
        length,
        platform,
        prompt,
      });
      
      // 2. simplePostService에 저장 (로컬 분석용)
      await simplePostService.savePost({
        content,
        hashtags: adjustedHashtags,
        platform: platform as 'instagram' | 'facebook' | 'twitter' | 'general',
        category: getCategoryFromTone(tone),
        tone,
      });
      
      // Analytics 이벤트 기록
      analyticsService.logContentSaved({
        platform,
        content_length: content.length,
        hashtag_count: adjustedHashtags.length,
      });
      
      // 성공 알림
      Alert.alert(
        '저장 완료! 💾', 
        '콘텐츠가 저장되었어요.\n\n성과는 각 SNS 플랫폼에서 확인하세요!',
        [{ 
          text: '확인', 
          style: 'default',
          onPress: onSuccess,
        }]
      );
      
      return true;
    } catch (error) {
      console.error('Save error:', error);
      
      Alert.alert(
        '오류', 
        '저장 중 문제가 발생했어요.',
        [{ text: '확인' }]
      );
      
      onError?.(error as Error);
      return false;
    }
  }

  // 임시 저장
  async saveAsDraft(content: string, metadata?: any): Promise<boolean> {
    try {
      const drafts = await this.getDrafts();
      const newDraft = {
        id: Date.now().toString(),
        content,
        metadata,
        createdAt: new Date().toISOString(),
      };
      
      drafts.unshift(newDraft);
      // 최대 10개까지만 저장
      if (drafts.length > 10) {
        drafts.pop();
      }
      
      await AsyncStorage.setItem('CONTENT_DRAFTS', JSON.stringify(drafts));
      return true;
    } catch (error) {
      console.error('Draft save error:', error);
      return false;
    }
  }

  // 임시 저장 목록 가져오기
  async getDrafts(): Promise<any[]> {
    try {
      const draftsJson = await AsyncStorage.getItem('CONTENT_DRAFTS');
      return draftsJson ? JSON.parse(draftsJson) : [];
    } catch (error) {
      console.error('Get drafts error:', error);
      return [];
    }
  }

  // 임시 저장 삭제
  async deleteDraft(draftId: string): Promise<boolean> {
    try {
      const drafts = await this.getDrafts();
      const filteredDrafts = drafts.filter(draft => draft.id !== draftId);
      await AsyncStorage.setItem('CONTENT_DRAFTS', JSON.stringify(filteredDrafts));
      return true;
    } catch (error) {
      console.error('Delete draft error:', error);
      return false;
    }
  }


}

export default new ContentSaveService();
// utils/enhancedSNSLauncher.ts
import { Linking, Platform, Share } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { Alert } from './customAlert';

interface SNSLaunchOptions {
  platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'share';
  content: string;
  hashtags?: string[];
}

/**
 * 향상된 SNS 공유 기능
 */
export const enhancedSNSLaunch = async (options: SNSLaunchOptions): Promise<boolean> => {
  const { platform, content, hashtags = [] } = options;
  
  // 해시태그 문자열 생성
  const hashtagString = hashtags.length > 0 ? '\n\n' + hashtags.map(tag => `#${tag}`).join(' ') : '';
  const fullContent = content + hashtagString;

  try {
    switch (platform) {
      case 'twitter':
        // Twitter는 URL 스킴으로 텍스트 직접 전달 가능!
        return await launchTwitterDirect(fullContent);
        
      case 'share':
        // 시스템 공유 시트 사용 (가장 범용적)
        return await shareViaSystem(fullContent);
        
      case 'instagram':
      case 'facebook':
      case 'linkedin':
        // 다른 앱들은 클립보드 + 앱 실행
        return await launchWithClipboard(platform, fullContent);
        
      default:
        return false;
    }
  } catch (error) {
    console.error('SNS 공유 오류:', error);
    return false;
  }
};

/**
 * Twitter 직접 텍스트 전달 (자동 붙여넣기 효과)
 */
const launchTwitterDirect = async (text: string): Promise<boolean> => {
  // 트위터는 280자 제한
  const truncatedText = text.length > 280 ? text.substring(0, 277) + '...' : text;
  const encodedText = encodeURIComponent(truncatedText);
  
  const urls = {
    app: `twitter://post?text=${encodedText}`,
    web: `https://twitter.com/intent/tweet?text=${encodedText}`
  };

  try {
    // 앱 먼저 시도
    if (await Linking.canOpenURL(urls.app)) {
      await Linking.openURL(urls.app);
      // 성공 알림 제거 (자동으로 텍스트가 입력되므로 불필요)
      return true;
    }
    
    // 웹 대체
    await Linking.openURL(urls.web);
    return true;
    
  } catch (error) {
    // 실패 시 클립보드 방식
    await Clipboard.setString(text);
    Alert.alert(
      '텍스트 복사됨',
      'X(트위터)에서 붙여넣기하세요.',
      [{ text: '확인' }]
    );
    return false;
  }
};

/**
 * 시스템 공유 시트 사용 (가장 범용적인 방법)
 */
const shareViaSystem = async (text: string): Promise<boolean> => {
  try {
    const result = await Share.share({
      message: text,
      title: 'Posty에서 생성한 콘텐츠',
    });
    
    if (result.action === Share.sharedAction) {
      // 공유 완료
      return true;
    } else if (result.action === Share.dismissedAction) {
      // 취소됨
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('시스템 공유 오류:', error);
    return false;
  }
};

/**
 * 클립보드 + 앱 실행 방식
 */
const launchWithClipboard = async (
  platform: 'instagram' | 'facebook' | 'linkedin',
  content: string
): Promise<boolean> => {
  // 클립보드에 복사 (먼저 수행)
  await Clipboard.setString(content);
  
  // 플랫폼별 안내 메시지
  const platformNames = {
    instagram: 'Instagram',
    facebook: 'Facebook',
    linkedin: 'LinkedIn'
  };
  
  const platformInstructions = {
    instagram: '피드나 스토리 작성 화면에서\n텍스트 입력란을 길게 눌러 붙여넣기하세요.',
    facebook: '게시물 작성 화면에서\n텍스트 입력란을 길게 눌러 붙여넣기하세요.',
    linkedin: '게시물 작성 화면에서\n텍스트 입력란을 길게 눌러 붙여넣기하세요.'
  };
  
  // 바로 복사 성공 알림 표시
  Alert.alert(
    '📋 복사 완료!',
    `텍스트가 복사되었습니다.\n\n${platformNames[platform]} 앱으로 이동합니다.\n${platformInstructions[platform]}`,
    [{ 
      text: `${platformNames[platform]} 열기`, 
      onPress: () => launchApp() 
    }],
    { cancelable: true }
  );
  
  const schemes = {
    instagram: {
      ios: 'instagram://app',
      android: 'instagram://app',
      web: 'https://www.instagram.com'
    },
    facebook: {
      ios: 'fb://feed',
      android: 'fb://feed',
      web: 'https://www.facebook.com'
    },
    linkedin: {
      ios: 'linkedin://feed',
      android: 'linkedin://feed',
      web: 'https://www.linkedin.com/feed/'
    }
  };
  
  const { ios, android, web } = schemes[platform];
  const appUrl = Platform.OS === 'ios' ? ios : android;
  
  // 앱 실행 함수
  const launchApp = async () => {
    try {
      if (await Linking.canOpenURL(appUrl)) {
        await Linking.openURL(appUrl);
        return true;
      } else {
        // 웹으로 이동
        await Linking.openURL(web);
        return true;
      }
    } catch (error) {
      console.error('앱 실행 오류:', error);
      return false;
    }
  };
  
  return true;
};

/**
 * Instagram Stories 공유 (이미지 필요)
 */
export const shareToInstagramStory = async (
  backgroundImageUri: string,
  stickerImageUri?: string,
  backgroundTopColor?: string,
  backgroundBottomColor?: string
): Promise<boolean> => {
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
    return false;
  }
  
  const scheme = Platform.OS === 'ios' 
    ? 'instagram-stories://share' 
    : 'com.instagram.share.ADD_TO_STORY';
    
  try {
    if (await Linking.canOpenURL(scheme)) {
      // Instagram Stories API는 이미지가 필요함
      // React Native에서는 react-native-share 라이브러리 사용 권장
      Alert.alert(
        'Instagram 스토리',
        '스토리 공유는 이미지가 필요합니다.',
        [{ text: '확인' }]
      );
      return false;
    }
    return false;
  } catch (error) {
    return false;
  }
};

import { Linking, Platform, Alert } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';

interface SNSLaunchResult {
  success: boolean;
  message?: string;
}

/**
 * SNS 앱을 실행하고 클립보드에 복사된 콘텐츠를 붙여넣을 수 있도록 안내
 */
export const launchSNSApp = async (
  platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin',
  content: string
): Promise<SNSLaunchResult> => {
  // 먼저 콘텐츠를 클립보드에 복사
  await Clipboard.setString(content);

  // 플랫폼별 URL 스킴
  const urlSchemes = {
    instagram: {
      ios: 'instagram://app',
      android: 'instagram://app',
      web: 'https://www.instagram.com',
    },
    facebook: {
      ios: 'fb://profile',
      android: 'fb://page/',
      web: 'https://www.facebook.com',
    },
    twitter: {
      ios: 'twitter://post',
      android: 'twitter://post',
      web: 'https://twitter.com/intent/tweet',
    },
    linkedin: {
      ios: 'linkedin://post',
      android: 'linkedin://post',
      web: 'https://www.linkedin.com/feed/',
    },
  };

  const scheme = urlSchemes[platform];
  const appUrl = Platform.OS === 'ios' ? scheme.ios : scheme.android;
  const webUrl = scheme.web;

  try {
    // 앱이 설치되어 있는지 확인
    const canOpen = await Linking.canOpenURL(appUrl);
    
    if (canOpen) {
      // 앱 실행
      await Linking.openURL(appUrl);
      
      // 사용자에게 붙여넣기 안내
      setTimeout(() => {
        Alert.alert(
          '✨ 콘텐츠가 복사되었어요!',
          `${getPlatformName(platform)} 앱이 열렸습니다.\n\n게시물 작성 화면에서 길게 눌러 붙여넣기하세요! 📋`,
          [
            {
              text: '확인',
              style: 'default',
            },
          ],
          { cancelable: true }
        );
      }, 1000);
      
      return { success: true };
    } else {
      // 앱이 없으면 웹 버전으로 이동
      const result = await new Promise<boolean>((resolve) => {
        Alert.alert(
          `${getPlatformName(platform)} 앱이 없어요`,
          '웹 브라우저에서 열까요?',
          [
            {
              text: '취소',
              style: 'cancel',
              onPress: () => resolve(false),
            },
            {
              text: '웹에서 열기',
              onPress: () => resolve(true),
            },
          ]
        );
      });

      if (result) {
        await Linking.openURL(webUrl);
        
        setTimeout(() => {
          Alert.alert(
            '✨ 콘텐츠가 복사되었어요!',
            '게시물 작성 화면에서 붙여넣기(Ctrl+V 또는 길게 누르기)하세요!',
            [{ text: '확인' }]
          );
        }, 1000);
        
        return { success: true };
      }
      
      return { success: false, message: '취소되었습니다.' };
    }
  } catch (error) {
    console.error('SNS 앱 실행 오류:', error);
    
    // 오류 발생 시 웹으로 대체
    try {
      await Linking.openURL(webUrl);
      
      setTimeout(() => {
        Alert.alert(
          '✨ 콘텐츠가 복사되었어요!',
          '게시물 작성 화면에서 붙여넣기하세요!',
          [{ text: '확인' }]
        );
      }, 1000);
      
      return { success: true };
    } catch (webError) {
      return {
        success: false,
        message: 'SNS 앱을 열 수 없습니다.',
      };
    }
  }
};

/**
 * 플랫폼별 앱 설치 여부 확인
 */
export const checkSNSAppInstalled = async (
  platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin'
): Promise<boolean> => {
  const urlSchemes = {
    instagram: Platform.OS === 'ios' ? 'instagram://app' : 'instagram://app',
    facebook: Platform.OS === 'ios' ? 'fb://profile' : 'fb://page/',
    twitter: Platform.OS === 'ios' ? 'twitter://post' : 'twitter://post',
    linkedin: Platform.OS === 'ios' ? 'linkedin://post' : 'linkedin://post',
  };

  try {
    return await Linking.canOpenURL(urlSchemes[platform]);
  } catch (error) {
    return false;
  }
};

/**
 * 플랫폼 이름 가져오기
 */
const getPlatformName = (platform: string): string => {
  const names: Record<string, string> = {
    instagram: 'Instagram',
    facebook: 'Facebook',
    twitter: 'X(트위터)',
    linkedin: 'LinkedIn',
  };
  
  return names[platform] || platform;
};

/**
 * 트위터/X 전용: 텍스트를 포함한 트윗 작성 화면 열기
 */
export const launchTwitterWithText = async (text: string): Promise<SNSLaunchResult> => {
  // URL 인코딩
  const encodedText = encodeURIComponent(text);
  const twitterUrl = `twitter://post?text=${encodedText}`;
  const webUrl = `https://twitter.com/intent/tweet?text=${encodedText}`;

  try {
    const canOpen = await Linking.canOpenURL(twitterUrl);
    
    if (canOpen) {
      await Linking.openURL(twitterUrl);
      return { success: true };
    } else {
      // 웹 버전으로 대체
      await Linking.openURL(webUrl);
      return { success: true };
    }
  } catch (error) {
    // 클립보드 대체 방식
    await Clipboard.setString(text);
    
    Alert.alert(
      '✨ 콘텐츠가 복사되었어요!',
      'X(트위터) 앱에서 붙여넣기하세요!',
      [{ text: '확인' }]
    );
    
    return { success: true };
  }
};

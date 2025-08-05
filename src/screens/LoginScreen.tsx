import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, Platform, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  FadeIn,
  FadeInDown,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import AppLogo from '../components/AppLogo';

import { useAppTheme } from '../hooks/useAppTheme';
import { AppIcon } from '../components/AppIcon';
import socialAuthService from '../services/auth/socialAuthService';
import achievementService from '../services/achievementService';
import { useAppDispatch } from '../hooks/redux';
import { setUser } from '../store/slices/userSlice';
import { BRAND } from '../utils/constants';

import { Alert } from '../utils/customAlert';

interface LoginScreenProps {
  onNavigate: (screen: string, data?: any) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigate }) => {
  const { colors, isDark } = useAppTheme();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  
  const logoScale = useSharedValue(0.8);
  const logoOpacity = useSharedValue(0);



  useEffect(() => {
    // 로고 애니메이션
    logoScale.value = withSpring(1, { damping: 12 });
    logoOpacity.value = withTiming(1, { duration: 1000 });
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: logoScale.value }],
      opacity: logoOpacity.value,
    };
  });

  const handleSocialLogin = async (provider: 'google' | 'naver' | 'kakao' | 'facebook' | 'apple') => {
    setIsLoading(true);
    setLoadingProvider(provider);

    try {
      let userProfile;
      
      switch (provider) {
        case 'google':
          userProfile = await socialAuthService.signInWithGoogle();
          break;
        case 'naver':
          userProfile = await socialAuthService.signInWithNaver();
          break;
        case 'kakao':
          userProfile = await socialAuthService.signInWithKakao();
          break;
        case 'facebook':
          userProfile = await socialAuthService.signInWithFacebook();
          break;
        case 'apple':
          userProfile = await socialAuthService.signInWithApple();
          break;
      }

      if (userProfile) {
        // Redux에 사용자 정보 저장
        dispatch(setUser({
          uid: userProfile.uid,
          email: userProfile.email,
          displayName: userProfile.displayName,
          photoURL: userProfile.photoURL,
          provider: userProfile.provider,
        }));

        // 사용자 프로필 로컬 저장
        await socialAuthService.saveUserProfile(userProfile);
        
        // Firebase removed - using local storage only
        
        // 새 사용자로 업적 초기화
        await achievementService.resetForNewUser();
        
        // 이미 달성한 업적이 있는지 확인 (기존 사용자)
        const achievements = await achievementService.getUserAchievements();
        console.log(`User ${userProfile.displayName} has ${achievements.filter(a => a.isUnlocked).length} achievements`);

        // 홈 화면으로 이동
        onNavigate('home');
      }
    } catch (error: any) {
      console.error(`${provider} 로그인 에러:`, error);
      
      let errorMessage = '로그인에 실패했습니다. 다시 시도해주세요.';
      
      if (error.code === 'auth/account-exists-with-different-credential') {
        errorMessage = '이미 다른 방법으로 가입된 계정입니다.';
      } else if (error.code === 'auth/cancelled') {
        errorMessage = '로그인이 취소되었습니다.';
      }
      
      Alert.alert('로그인 실패', errorMessage);
    } finally {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  const renderSocialButton = (
    provider: 'google' | 'naver' | 'kakao' | 'facebook' | 'apple',
    text: string,
    iconName: string,
    backgroundColor: string,
    textColor: string,
    delay: number
  ) => {
    const isThisLoading = loadingProvider === provider;
    
    return (
      <View style={styles.socialButtonContainer}>
        <TouchableOpacity
          style={[
            styles.socialButton,
            { backgroundColor },
            provider === 'google' && styles.googleButton,
            provider === 'apple' && styles.appleButton,
            isLoading && !isThisLoading && styles.disabledButton,
          ]}
          onPress={() => handleSocialLogin(provider)}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isThisLoading ? (
            <ActivityIndicator size="small" color={textColor} />
          ) : (
            <>
              <View style={styles.socialIconContainer}>
                {provider === 'google' && (
                  <Icon name="mail" size={20} color={textColor} />
                )}
                {provider === 'naver' && (
                  <Text style={[styles.naverIcon, { color: textColor }]}>N</Text>
                )}
                {provider === 'kakao' && (
                  <Icon name="chat-bubble" size={20} color={textColor} />
                )}
                {provider === 'facebook' && (
                  <Icon name="facebook" size={20} color={textColor} />
                )}
                {provider === 'apple' && (
                  <Icon name="apple" size={20} color={textColor} />
                )}
              </View>
              <Text style={[styles.socialButtonText, { color: textColor }]}>
                {text}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const styles = createStyles(colors, isDark);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* 로고 영역 */}
          <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
            <AppLogo size={100} showText={true} />
          </Animated.View>

          {/* 소셜 로그인 버튼들 */}
          <View style={styles.buttonContainer}>
          </View>

          {/* 하단 고정 버튼 영역 */}
          <View style={styles.fixedButtonContainer}>
            {/* 간편 로그인 타이틀 */}
            <Animated.View
              entering={FadeIn.delay(300).duration(600)}
            >
              <Text style={styles.loginTitle}>
                간편 로그인
              </Text>
            </Animated.View>

            {/* 카카오 로그인 버튼 */}
            <Animated.View
              entering={FadeInDown.delay(400).duration(600).springify()}
              style={styles.socialButtonContainer}
            >
              <TouchableOpacity
                style={[
                  styles.socialButton,
                  { backgroundColor: '#FEE500' },
                  isLoading && loadingProvider !== 'kakao' && styles.disabledButton,
                ]}
                onPress={() => handleSocialLogin('kakao')}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {loadingProvider === 'kakao' ? (
                  <ActivityIndicator size="small" color="#191919" />
                ) : (
                  <>
                    <View style={styles.socialIconContainer}>
                      <Icon name="chat-bubble" size={20} color="#191919" />
                    </View>
                    <Text style={[styles.socialButtonText, { color: '#191919' }]}>
                      카카오로 시작하기
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* 다른 계정으로 연결 버튼 - 다른 옵션이 나타나면 숨김 */}
            {!showMoreOptions && (
              <Animated.View
                entering={FadeInDown.delay(500).duration(600).springify()}
                exiting={SlideOutDown.duration(200)}
                style={styles.moreOptionsContainer}
              >
                <TouchableOpacity
                  style={styles.moreOptionsButton}
                  onPress={() => setShowMoreOptions(true)}
                  disabled={isLoading}
                >
                  <Text style={styles.moreOptionsText}>다른 계정으로 연결</Text>
                </TouchableOpacity>
              </Animated.View>
            )}

            {/* 추가 로그인 옵션들 - 다른 계정으로 연결 클릭 시 표시 */}
            {showMoreOptions && (
              <Animated.View
                entering={SlideInDown.duration(500).springify().damping(15).stiffness(120)}
                exiting={SlideOutDown.duration(300)}
                style={styles.expandedOptionsContainer}
              >
                <Animated.View entering={FadeInDown.delay(100).duration(400).springify()}>
                  {renderSocialButton(
                    'google',
                    'Google로 시작하기',
                    'google',
                    '#FFFFFF',
                    '#1F1F1F',
                    0
                  )}
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(200).duration(400).springify()}>
                  {renderSocialButton(
                    'naver',
                    '네이버로 시작하기',
                    'naver',
                    '#03C75A',
                    '#FFFFFF',
                    0
                  )}
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(300).duration(400).springify()}>
                  {renderSocialButton(
                    'facebook',
                    'Facebook으로 시작하기',
                    'facebook',
                    '#1877F2',
                    '#FFFFFF',
                    0
                  )}
                </Animated.View>

                {Platform.OS === 'ios' && (
                  <Animated.View entering={FadeInDown.delay(400).duration(400).springify()}>
                    {renderSocialButton(
                      'apple',
                      'Apple로 시작하기',
                      'apple',
                      '#000000',
                      '#FFFFFF',
                      0
                    )}
                  </Animated.View>
                )}
              </Animated.View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 60,
  },

  buttonContainer: {
    marginBottom: 40,
  },
  loginTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 24,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  fixedButtonContainer: {
    marginTop: 'auto',
    paddingBottom: 40,
  },
  socialButtonContainer: {
    marginBottom: 12,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  disabledButton: {
    opacity: 0.5,
  },
  socialIconContainer: {
    marginRight: 12,
  },
  socialIcon: {
    width: 20,
    height: 20,
  },
  naverIcon: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  moreOptionsContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  moreOptionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  moreOptionsText: {
    fontSize: 16,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  expandedOptionsContainer: {
    marginTop: 16,
    paddingHorizontal: 0,
  },
  googleButton: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  appleButton: {
    borderWidth: isDark ? 1 : 0,
    borderColor: isDark ? '#FFFFFF' : undefined,
  },
});

export default LoginScreen;

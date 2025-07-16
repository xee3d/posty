import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';

import { useAppTheme } from '../hooks/useAppTheme';
import { AppIcon } from '../components/AppIcon';
import socialAuthService from '../services/auth/socialAuthService';
import { useAppDispatch } from '../hooks/redux';
import { setUser } from '../store/slices/userSlice';
import { BRAND } from '../utils/constants';

interface LoginScreenProps {
  onNavigate: (screen: string, data?: any) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigate }) => {
  const { colors, isDark } = useAppTheme();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  
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

  const handleSocialLogin = async (provider: 'google' | 'naver' | 'kakao') => {
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
    provider: 'google' | 'naver' | 'kakao',
    text: string,
    iconName: string,
    backgroundColor: string,
    textColor: string,
    delay: number
  ) => {
    const isThisLoading = loadingProvider === provider;
    
    return (
      <Animated.View
        entering={FadeInDown.delay(delay).duration(600).springify()}
        style={styles.socialButtonContainer}
      >
        <TouchableOpacity
          style={[
            styles.socialButton,
            { backgroundColor },
            provider === 'google' && styles.googleButton,
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
              </View>
              <Text style={[styles.socialButtonText, { color: textColor }]}>
                {text}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </Animated.View>
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
            <AppIcon size={100} />
            <Text style={styles.appName}>Posty</Text>
            <Text style={styles.appDescription}>
              {BRAND.tagline}
            </Text>
          </Animated.View>

          {/* 소셜 로그인 버튼들 */}
          <View style={styles.buttonContainer}>
            <Animated.Text
              entering={FadeIn.delay(300).duration(600)}
              style={styles.loginTitle}
            >
              간편 로그인
            </Animated.Text>

            {renderSocialButton(
              'google',
              'Google로 시작하기',
              'google',
              '#FFFFFF',
              '#1F1F1F',
              400
            )}

            {renderSocialButton(
              'naver',
              '네이버로 시작하기',
              'naver',
              '#03C75A',
              '#FFFFFF',
              500
            )}

            {renderSocialButton(
              'kakao',
              '카카오로 시작하기',
              'kakao',
              '#FEE500',
              '#191919',
              600
            )}
          </View>

          {/* 약관 안내 */}
          <Animated.View
            entering={FadeInDown.delay(700).duration(600)}
            style={styles.termsContainer}
          >
            <Text style={styles.termsText}>
              로그인 시{' '}
              <Text
                style={styles.termsLink}
                onPress={() => onNavigate('terms')}
              >
                이용약관
              </Text>
              {' 및 '}
              <Text
                style={styles.termsLink}
                onPress={() => onNavigate('privacy')}
              >
                개인정보처리방침
              </Text>
              에{'\n'}동의하는 것으로 간주됩니다.
            </Text>
          </Animated.View>

          {/* 게스트 모드 */}
          <Animated.View
            entering={FadeInDown.delay(800).duration(600)}
            style={styles.guestContainer}
          >
            <TouchableOpacity
              style={styles.guestButton}
              onPress={() => onNavigate('home')}
              disabled={isLoading}
            >
              <Text style={styles.guestButtonText}>둘러보기</Text>
            </TouchableOpacity>
          </Animated.View>
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
  appName: {
    fontSize: 40,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 8,
    letterSpacing: -1,
  },
  appDescription: {
    fontSize: 17,
    color: colors.text.primary,
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 24,
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
  socialButtonContainer: {
    marginBottom: 16,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
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
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  termsContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  termsText: {
    fontSize: 13,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  termsLink: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  guestContainer: {
    alignItems: 'center',
  },
  guestButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  guestButtonText: {
    fontSize: 17,
    color: colors.primary,
    fontWeight: '700',
  },
  googleButton: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
});

export default LoginScreen;

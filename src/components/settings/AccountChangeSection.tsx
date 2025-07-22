// AccountChangeSection.tsx - 설정 화면에 추가할 계정 변경 섹션

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { useAppTheme } from '../../hooks/useAppTheme';
import { SPACING, BORDER_RADIUS, FONTS } from '../../utils/constants';
import socialAuthService from '../../services/auth/socialAuthService';
import { Alert } from '../../utils/customAlert';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { setUser } from '../../store/slices/userSlice';

interface AccountChangeSectionProps {
  userProfile: any;
  onProfileUpdate?: () => void;
}

const AccountChangeSection: React.FC<AccountChangeSectionProps> = ({ 
  userProfile,
  onProfileUpdate 
}) => {
  const { colors, cardTheme } = useAppTheme();
  const dispatch = useAppDispatch();
  const [changing, setChanging] = useState<string | null>(null);
  
  // 소셜 로그인 제공자 정보
  const providers = [
    {
      id: 'google',
      name: '구글',
      icon: 'logo-google',
      color: '#4285F4',
    },
    {
      id: 'naver',
      name: '네이버',
      icon: 'N',
      color: '#1EC800',
      isText: true,
    },
    {
      id: 'kakao',
      name: '카카오',
      icon: 'chatbubble',
      color: '#FEE500',
    },
    {
      id: 'facebook',
      name: '페이스북',
      icon: 'logo-facebook',
      color: '#1877F2',
    },
  ];
  
  // 현재 로그인된 계정 정보
  const currentProvider = userProfile?.provider || 'google';
  const currentEmail = userProfile?.email || 'unknown@example.com';
  const currentName = userProfile?.displayName || '사용자';
  
  const handleChangeAccount = async (providerId: 'google' | 'naver' | 'kakao' | 'facebook') => {
    try {
      setChanging(providerId);
      
      // 현재 로그인된 계정과 같은 경우
      if (providerId === currentProvider) {
        const result = await Alert.alert(
          '계정 변경',
          '현재 로그인된 계정과 동일한 서비스입니다.\n다른 계정으로 변경하시겠습니까?',
          [
            { text: '취소', style: 'cancel' },
            { text: '변경', style: 'default' },
          ]
        );
        
        if (result !== 1) {
          setChanging(null);
          return;
        }
      }
      
      // 계정 변경 실행
      const newProfile = await socialAuthService.changeAccount(providerId);
      
      // Redux 상태 업데이트
      dispatch(setUser({
        uid: newProfile.uid,
        email: newProfile.email,
        displayName: newProfile.displayName,
        photoURL: newProfile.photoURL,
        provider: newProfile.provider,
      }));
      
      // 프로필 저장
      await socialAuthService.saveUserProfile(newProfile);
      
      // 업적 초기화 (사용자별로 분리)
      const achievementService = require('../../services/achievementService').default;
      await achievementService.resetForNewUser();
      
      Alert.alert(
        '성공',
        `${providers.find(p => p.id === providerId)?.name} 계정으로 변경되었습니다.`
      );
      
      // 콜백 실행
      if (onProfileUpdate) {
        onProfileUpdate();
      }
      
    } catch (error: any) {
      console.error('Account change error:', error);
      Alert.alert(
        '계정 변경 실패',
        error.message || '계정 변경 중 오류가 발생했습니다.'
      );
    } finally {
      setChanging(null);
    }
  };
  
  return (
    <View style={[styles.section, { backgroundColor: colors.surface }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        계정 관리
      </Text>
      
      {/* 현재 로그인 정보 */}
      <View style={[styles.currentAccount, { backgroundColor: colors.background }]}>
        <View style={styles.accountInfo}>
          {userProfile?.photoURL ? (
            <Image 
              source={{ uri: userProfile.photoURL }} 
              style={styles.profileImage}
            />
          ) : (
            <View style={[styles.profilePlaceholder, { backgroundColor: colors.border }]}>
              <Icon name="person" size={24} color={colors.textSecondary} />
            </View>
          )}
          
          <View style={styles.accountDetails}>
            <Text style={[styles.accountName, { color: colors.text }]}>
              {currentName}
            </Text>
            <Text style={[styles.accountEmail, { color: colors.textSecondary }]}>
              {currentEmail}
            </Text>
            <View style={styles.providerBadge}>
              <Text style={[styles.providerText, { color: colors.primary }]}>
                {providers.find(p => p.id === currentProvider)?.name || '알 수 없음'}
              </Text>
            </View>
          </View>
        </View>
      </View>
      
      {/* 계정 변경 옵션 */}
      <Text style={[styles.changeTitle, { color: colors.textSecondary }]}>
        다른 계정으로 변경
      </Text>
      
      <View style={styles.providerList}>
        {providers.map((provider) => (
          <TouchableOpacity
            key={provider.id}
            style={[
              styles.providerButton,
              { 
                backgroundColor: colors.surface,
                borderColor: currentProvider === provider.id ? provider.color : colors.border,
                borderWidth: currentProvider === provider.id ? 2 : 1,
              }
            ]}
            onPress={() => handleChangeAccount(provider.id as any)}
            disabled={changing !== null}
          >
            {changing === provider.id ? (
              <ActivityIndicator size="small" color={provider.color} />
            ) : provider.isText ? (
              <Text style={[styles.providerTextIcon, { color: provider.color }]}>
                {provider.icon}
              </Text>
            ) : (
              <Icon name={provider.icon} size={24} color={provider.color} />
            )}
            
            <Text style={[styles.providerName, { color: colors.text }]}>
              {provider.name}
            </Text>
            
            {currentProvider === provider.id && (
              <Icon 
                name="checkmark-circle" 
                size={20} 
                color={provider.color} 
                style={styles.checkIcon}
              />
            )}
          </TouchableOpacity>
        ))}
      </View>
      
      {/* 안내 메시지 */}
      <Text style={[styles.helpText, { color: colors.textSecondary }]}>
        계정을 변경하면 현재 계정에서 로그아웃되고 선택한 서비스로 다시 로그인됩니다.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    padding: SPACING.medium,
    marginBottom: SPACING.medium,
    borderRadius: BORDER_RADIUS.medium,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.KOREAN.BOLD,
    marginBottom: SPACING.medium,
  },
  currentAccount: {
    padding: SPACING.medium,
    borderRadius: BORDER_RADIUS.medium,
    marginBottom: SPACING.medium,
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: SPACING.medium,
  },
  profilePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: SPACING.medium,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountDetails: {
    flex: 1,
  },
  accountName: {
    fontSize: 16,
    fontFamily: FONTS.KOREAN.MEDIUM,
    marginBottom: 4,
  },
  accountEmail: {
    fontSize: 14,
    marginBottom: 6,
  },
  providerBadge: {
    alignSelf: 'flex-start',
  },
  providerText: {
    fontSize: 12,
    fontFamily: FONTS.KOREAN.MEDIUM,
  },
  changeTitle: {
    fontSize: 14,
    marginBottom: SPACING.small,
  },
  providerList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.medium,
  },
  providerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.medium,
    marginHorizontal: 4,
    borderRadius: BORDER_RADIUS.medium,
    borderWidth: 1,
  },
  providerTextIcon: {
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: SPACING.small,
  },
  providerName: {
    fontSize: 14,
    fontFamily: FONTS.KOREAN.MEDIUM,
    marginLeft: SPACING.small,
  },
  checkIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  helpText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default AccountChangeSection;
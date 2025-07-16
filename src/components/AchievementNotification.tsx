import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppTheme } from '../hooks/useAppTheme';
import { SPACING, FONT_SIZES } from '../utils/constants';
import { Achievement } from '../types/achievement';
import achievementService from '../services/achievementService';
import { soundManager } from '../utils/soundManager';

const { width } = Dimensions.get('window');

interface AchievementNotificationProps {
  onNavigateToProfile?: () => void;
}

const AchievementNotification: React.FC<AchievementNotificationProps> = ({ 
  onNavigateToProfile 
}) => {
  const { colors } = useAppTheme();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const animValue = useRef(new Animated.Value(0)).current;
  const fadeValue = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    checkNewAchievements();
    
    // 주기적으로 업적 체크 (5분마다)
    const interval = setInterval(checkNewAchievements, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  useEffect(() => {
    if (achievements.length > 0 && currentIndex < achievements.length) {
      showNotification();
    }
  }, [achievements, currentIndex]);
  
  const checkNewAchievements = async () => {
    try {
      const newAchievements = await achievementService.checkAchievements();
      if (newAchievements.length > 0) {
        setAchievements(newAchievements);
        setCurrentIndex(0);
      }
    } catch (error) {
      console.error('Failed to check achievements:', error);
    }
  };
  
  const showNotification = () => {
    // 애니메이션 시작
    Animated.sequence([
      // 슬라이드 인
      Animated.parallel([
        Animated.timing(animValue, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(fadeValue, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
      // 3초 대기
      Animated.delay(3000),
      // 슬라이드 아웃
      Animated.parallel([
        Animated.timing(animValue, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(fadeValue, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      // 다음 업적 표시
      if (currentIndex < achievements.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // 모든 업적 표시 완료
        markAchievementsAsSeen();
      }
    });
    
    // 사운드 재생
    soundManager.playSuccess();
  };
  
  const markAchievementsAsSeen = async () => {
    const achievementIds = achievements.map(a => a.id);
    await achievementService.markAchievementsAsSeen(achievementIds);
    setAchievements([]);
    setCurrentIndex(0);
  };
  
  const handlePress = () => {
    // 애니메이션 즉시 종료
    Animated.timing(animValue, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      if (onNavigateToProfile) {
        onNavigateToProfile();
      }
      markAchievementsAsSeen();
    });
  };
  
  if (achievements.length === 0 || currentIndex >= achievements.length) {
    return null;
  }
  
  const currentAchievement = achievements[currentIndex];
  const translateY = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 0],
  });
  
  const styles = createStyles(colors);
  
  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeValue,
          transform: [{ translateY }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.notification}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <View style={styles.content}>
          <View style={[
            styles.iconContainer,
            { backgroundColor: currentAchievement.badgeColor }
          ]}>
            <Icon
              name={currentAchievement.icon}
              size={32}
              color={currentAchievement.iconColor}
            />
          </View>
          
          <View style={styles.textContainer}>
            <Text style={styles.title}>업적 달성! 🎉</Text>
            <Text style={styles.achievementName}>
              {currentAchievement.name}
            </Text>
            <Text style={styles.description}>
              {currentAchievement.description}
            </Text>
          </View>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            탭하여 프로필에서 확인하기
          </Text>
          <Icon name="chevron-forward" size={16} color={colors.text.secondary} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    zIndex: 1000,
    elevation: 10,
  },
  notification: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: colors.primary + '20',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZES.small,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  achievementName: {
    fontSize: FONT_SIZES.large,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  description: {
    fontSize: FONT_SIZES.small,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerText: {
    fontSize: FONT_SIZES.small,
    color: colors.text.tertiary,
  },
});

export default AchievementNotification;

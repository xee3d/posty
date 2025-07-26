import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppTheme } from '../hooks/useAppTheme';
import { SPACING } from '../utils/constants';

interface FloatingTokenButtonProps {
  currentTokens: number;
  subscriptionPlan: string;
  onPress: () => void;
}

export const FloatingTokenButton: React.FC<FloatingTokenButtonProps> = ({
  currentTokens,
  subscriptionPlan,
  onPress,
}) => {
  const { colors } = useAppTheme();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    // 토큰이 부족할 때 애니메이션
    if (subscriptionPlan === 'free' && currentTokens < 3) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [currentTokens, subscriptionPlan]);

  // 무료 사용자이고 토큰이 5개 미만일 때만 표시
  if (subscriptionPlan !== 'free' || currentTokens >= 5) {
    return null;
  }

  const styles = createStyles(colors);

  return (
    <Animated.View style={[
      styles.container,
      { transform: [{ scale: scaleAnim }] }
    ]}>
      <TouchableOpacity
        style={styles.button}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={styles.iconContainer}>
          <Icon name="gift" size={24} color={colors.white} />
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>무료</Text>
        </View>
      </TouchableOpacity>
      
      {currentTokens === 0 && (
        <View style={styles.tooltip}>
          <Text style={styles.tooltipText}>토큰을 모두 사용했어요!</Text>
          <Text style={styles.tooltipSubtext}>탭하여 무료로 받기</Text>
        </View>
      )}
    </Animated.View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80, // 탭 네비게이션 위
    right: SPACING.lg,
    alignItems: 'center',
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.error,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  tooltip: {
    position: 'absolute',
    bottom: 70,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    minWidth: 150,
  },
  tooltipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
  },
  tooltipSubtext: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 2,
  },
});
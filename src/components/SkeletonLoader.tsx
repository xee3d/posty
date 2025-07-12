import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { COLORS, SPACING } from '../utils/constants';

const { width } = Dimensions.get('window');

interface SkeletonLoaderProps {
  style?: any;
  width?: number | string;
  height?: number;
  borderRadius?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  style,
  width: customWidth = '100%',
  height = 20,
  borderRadius = 8,
}) => {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1000 }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmer.value,
      [0, 1],
      [-width, width]
    );
    return {
      transform: [{ translateX }],
    };
  });

  return (
    <View
      style={[
        styles.skeleton,
        {
          width: customWidth,
          height,
          borderRadius,
        },
        style,
      ]}
    >
      <Animated.View style={[styles.shimmer, animatedStyle]} />
    </View>
  );
};

export const ScreenSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Header Skeleton */}
      <View style={styles.header}>
        <SkeletonLoader width={120} height={28} />
        <SkeletonLoader width={200} height={16} style={{ marginTop: 8 }} />
      </View>

      {/* Banner Skeleton */}
      <View style={styles.banner}>
        <SkeletonLoader width={48} height={48} borderRadius={24} />
        <View style={styles.bannerContent}>
          <SkeletonLoader width={150} height={16} />
          <SkeletonLoader width={200} height={14} style={{ marginTop: 4 }} />
        </View>
      </View>

      {/* Cards Skeleton */}
      <View style={styles.cards}>
        <SkeletonLoader width={(width - 48) / 3 - 8} height={100} />
        <SkeletonLoader width={(width - 48) / 3 - 8} height={100} />
        <SkeletonLoader width={(width - 48) / 3 - 8} height={100} />
      </View>

      {/* Action Cards Skeleton */}
      <View style={styles.actionCards}>
        <SkeletonLoader height={80} style={{ marginBottom: 12 }} />
        <SkeletonLoader height={80} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E5E5E5',
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    transform: [{ skewX: '-20deg' }],
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  bannerContent: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  cards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    gap: 8,
  },
  actionCards: {
    paddingHorizontal: SPACING.lg,
  },
});

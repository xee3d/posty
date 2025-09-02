import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions, useColorScheme } from "react-native";
import { useAppTheme } from "../hooks/useAppTheme";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { COLORS, SPACING } from "../utils/constants";

const { width } = Dimensions.get("window");

interface SkeletonLoaderProps {
  style?: any;
  width?: number | string;
  height?: number;
  borderRadius?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  style,
  width: customWidth = "100%",
  height = 20,
  borderRadius = 8,
}) => {
  const shimmer = useSharedValue(0);
  const { isDark, colors } = useAppTheme();

  useEffect(() => {
    shimmer.value = withRepeat(withTiming(1, { duration: 1000 }), -1, false);
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(shimmer.value, [0, 1], [-width, width]);
    return {
      transform: [{ translateX }],
    };
  });

  const skeletonStyles = [
    styles.skeleton,
    {
      width: customWidth,
      height,
      borderRadius,
      backgroundColor: isDark ? "#141414" : "#E5E5E5",
    },
    style,
  ];

  const shimmerStyles = [
    styles.shimmer,
    {
      backgroundColor: isDark
        ? "rgba(255, 255, 255, 0.03)"
        : "rgba(255, 255, 255, 0.3)",
    },
    animatedStyle,
  ];

  return (
    <View style={skeletonStyles}>
      <Animated.View style={shimmerStyles} />
    </View>
  );
};

export const ScreenSkeleton: React.FC = () => {
  const { isDark, colors } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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

// 텍스트 스켈레톤 전용 컴포넌트
export const TextSkeleton: React.FC<{
  lines?: number;
  lineHeight?: number;
  lastLineWidth?: string;
  style?: any;
}> = ({ lines = 3, lineHeight = 16, lastLineWidth = "70%", style }) => {
  return (
    <View style={[styles.textContainer, style]}>
      {Array.from({ length: lines }).map((_, index) => (
        <SkeletonLoader
          key={index}
          width={index === lines - 1 ? lastLineWidth : "100%"}
          height={lineHeight}
          style={{ marginBottom: index < lines - 1 ? 8 : 0 }}
        />
      ))}
    </View>
  );
};

// 포스트/게시물 스켈레톤
export const PostSkeleton: React.FC = () => {
  return (
    <View style={styles.postSkeleton}>
      {/* 프로필 영역 */}
      <View style={styles.postHeader}>
        <SkeletonLoader width={40} height={40} borderRadius={20} />
        <View style={styles.postHeaderText}>
          <SkeletonLoader width={120} height={14} />
          <SkeletonLoader width={80} height={12} style={{ marginTop: 4 }} />
        </View>
      </View>

      {/* 본문 텍스트 */}
      <TextSkeleton lines={3} lineHeight={16} lastLineWidth="60%" />

      {/* 이미지 영역 (옵션) */}
      <SkeletonLoader
        width="100%"
        height={200}
        style={{ marginTop: 12, marginBottom: 12 }}
      />

      {/* 액션 버튼들 */}
      <View style={styles.postActions}>
        <SkeletonLoader width={60} height={32} borderRadius={16} />
        <SkeletonLoader width={60} height={32} borderRadius={16} />
        <SkeletonLoader width={60} height={32} borderRadius={16} />
      </View>
    </View>
  );
};

// 피드 목록 스켈레톤
export const FeedSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <View style={styles.feedContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <PostSkeleton key={index} />
      ))}
    </View>
  );
};

// AI 글 생성 스켈레톤 (타이핑 효과와 유사)
export const AIWritingSkeleton: React.FC = () => {
  return (
    <View style={styles.aiWritingContainer}>
      <View style={styles.aiHeader}>
        <SkeletonLoader width={24} height={24} borderRadius={12} />
        <SkeletonLoader width={100} height={16} style={{ marginLeft: 8 }} />
      </View>

      <View style={styles.aiContent}>
        <TextSkeleton lines={4} lineHeight={18} lastLineWidth="45%" />

        {/* 점점 추가되는 효과를 위한 추가 라인들 */}
        <View style={styles.progressLines}>
          <SkeletonLoader width="30%" height={18} style={{ marginTop: 8 }} />
          <SkeletonLoader width="15%" height={18} style={{ marginTop: 8 }} />
        </View>
      </View>
    </View>
  );
};

// 트렌드 카테고리 탭 스켈레톤
export const TrendCategorySkeleton: React.FC = () => {
  const { isDark, colors } = useAppTheme();

  return (
    <View style={styles.categoryContainer}>
      {[1, 2, 3, 4].map((item, index) => (
        <View
          key={index}
          style={[
            styles.categoryButtonSkeleton,
            { backgroundColor: isDark ? colors.surface : "#E5E5E5" },
          ]}
        >
          <SkeletonLoader width={16} height={16} borderRadius={8} />
          <SkeletonLoader
            width={50 + index * 10}
            height={14}
            style={{ marginLeft: 6 }}
          />
        </View>
      ))}
    </View>
  );
};

// 트렌드 카드 스켈레톤
export const TrendCardSkeleton: React.FC = () => {
  const { isDark, colors } = useAppTheme();

  return (
    <View
      style={[
        styles.trendCardSkeleton,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.trendHeaderSkeleton}>
        <SkeletonLoader width={32} height={32} borderRadius={16} />
        <View style={styles.trendContentSkeleton}>
          <SkeletonLoader width="80%" height={16} />
          <View style={styles.trendHashtagsSkeleton}>
            <SkeletonLoader width={50} height={12} borderRadius={6} />
            <SkeletonLoader width={60} height={12} borderRadius={6} />
            <SkeletonLoader width={45} height={12} borderRadius={6} />
          </View>
        </View>
        <SkeletonLoader width={40} height={12} />
      </View>
      <View style={styles.trendFooterSkeleton}>
        <View style={styles.trendSourceSkeleton}>
          <SkeletonLoader width={12} height={12} borderRadius={6} />
          <SkeletonLoader width={40} height={12} />
        </View>
        <SkeletonLoader width={60} height={24} borderRadius={12} />
      </View>
    </View>
  );
};

// 트렌드 페이지 전체 스켈레톤
export const TrendPageSkeleton: React.FC = () => {
  const { isDark, colors } = useAppTheme();

  return (
    <View
      style={[
        styles.trendPageContainer,
        { backgroundColor: colors.background },
      ]}
    >
      {/* 헤더 스켈레톤 */}
      <View style={styles.trendHeaderContainer}>
        <View style={styles.trendHeaderTop}>
          <SkeletonLoader width={36} height={36} borderRadius={18} />
          <SkeletonLoader width={150} height={24} style={{ marginLeft: 12 }} />
        </View>
        <SkeletonLoader width="70%" height={16} style={{ marginTop: 8 }} />
      </View>

      {/* 카테고리 스켈레톤 */}
      <TrendCategorySkeleton />

      {/* 내 트렌드 요약 스켈레톤 */}
      <View style={styles.myTrendsSkeleton}>
        <SkeletonLoader width={120} height={16} style={{ marginBottom: 12 }} />
        <View style={styles.myHashtagsSkeleton}>
          {[1, 2, 3, 4, 5].map((_, index) => (
            <View key={index} style={styles.myHashtagChipSkeleton}>
              <SkeletonLoader
                width={60 + index * 10}
                height={32}
                borderRadius={16}
              />
            </View>
          ))}
        </View>
      </View>

      {/* 트렌드 카드 목록 스켈레톤 */}
      <View style={styles.trendListSkeleton}>
        <SkeletonLoader width={100} height={16} style={{ marginBottom: 16 }} />
        {[1, 2, 3, 4, 5].map((_, index) => (
          <TrendCardSkeleton key={index} />
        ))}
      </View>
    </View>
  );
};

// 내가 자주 쓴 태그 스켈레톤
export const MyHashtagsSkeleton: React.FC = () => {
  return (
    <View style={styles.myTrendsSkeleton}>
      <SkeletonLoader width={120} height={16} style={{ marginBottom: 12 }} />
      <View style={styles.myHashtagsSkeleton}>
        {[1, 2, 3, 4, 5].map((_, index) => (
          <View key={index} style={styles.myHashtagChipSkeleton}>
            <SkeletonLoader
              width={60 + index * 10}
              height={32}
              borderRadius={16}
            />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    overflow: "hidden",
  },
  // 라이트모드 스켈레톤
  skeletonLight: {
    backgroundColor: "#E5E5E5",
  },
  // 다크모드 스켈레톤 - 더 어두운 색상
  skeletonDark: {
    backgroundColor: "#1A1A1A",
  },
  shimmer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    transform: [{ skewX: "-20deg" }],
  },
  // 라이트모드 시머
  shimmerLight: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  // 다크모드 시머 - 더 어두운 시머 효과
  shimmerDark: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  container: {
    flex: 1,
  },
  containerLight: {
    backgroundColor: "#F8F9FA",
  },
  containerDark: {
    backgroundColor: "#000000",
  },
  header: {
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  bannerContent: {
    marginLeft: SPACING.md,
    flex: 1,
  },
  cards: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
    gap: 8,
  },
  actionCards: {
    paddingHorizontal: SPACING.lg,
  },

  // 새로운 스타일들
  textContainer: {
    width: "100%",
  },
  postSkeleton: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  postHeaderText: {
    marginLeft: 12,
    flex: 1,
  },
  postActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  feedContainer: {
    padding: 16,
  },
  aiWritingContainer: {
    backgroundColor: "#F8F9FF",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8E8FF",
  },
  aiHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  aiContent: {
    minHeight: 100,
  },
  progressLines: {
    opacity: 0.6,
  },

  // 트렌드 스켈레톤 스타일들
  trendPageContainer: {
    flex: 1,
  },
  trendPageContainerLight: {
    backgroundColor: "#F8F9FA",
  },
  trendPageContainerDark: {
    backgroundColor: "#000000",
  },
  trendHeaderContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg,
  },
  trendHeaderTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryContainer: {
    flexDirection: "row",
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  categoryButtonSkeleton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 24,
  },
  myTrendsSkeleton: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  myHashtagsSkeleton: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  myHashtagChipSkeleton: {
    marginRight: SPACING.sm,
  },
  trendListSkeleton: {
    paddingHorizontal: SPACING.lg,
  },
  trendCardSkeleton: {
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
  },
  trendCardSkeletonLight: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E5E5",
  },
  trendCardSkeletonDark: {
    backgroundColor: "#141414",
    borderColor: "#3A3A3A",
  },
  trendHeaderSkeleton: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: SPACING.sm,
  },
  trendContentSkeleton: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  trendHashtagsSkeleton: {
    flexDirection: "row",
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  trendFooterSkeleton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: SPACING.sm,
  },
  trendSourceSkeleton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
});

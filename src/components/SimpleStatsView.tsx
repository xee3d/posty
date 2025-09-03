import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import MaterialIcon from "react-native-vector-icons/MaterialIcons";
import { COLORS, SPACING } from "../utils/constants";
import { useAppTheme } from "../hooks/useAppTheme";
import { AnimatedCard, FadeInView } from "../components/AnimationComponents";

interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  color?: string;
  cardStyle?: any;
  iconContainerStyle?: any;
  valueStyle?: any;
  labelStyle?: any;
}

const StatCard: React.FC<StatCardProps> = ({
  icon,
  value,
  label,
  color,
  cardStyle,
  iconContainerStyle,
  valueStyle,
  labelStyle,
}) => {
  const { colors } = useAppTheme();

  return (
    <View style={cardStyle}>
      <View
        style={[iconContainerStyle, color && { backgroundColor: color + "15" }]}
      >
        {icon}
      </View>
      <Text style={valueStyle}>{value}</Text>
      <Text style={labelStyle}>{label}</Text>
    </View>
  );
};

const SimpleStatsView: React.FC = () => {
  const { colors, cardTheme } = useAppTheme();
  const [stats, setStats] = React.useState<any>(null);
  const [recentPosts, setRecentPosts] = React.useState<any[]>([]);

  React.useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    // 임시 데이터 - 실제로는 simplePostService에서 가져옴
    const mockStats = {
      totalPosts: 12,
      postingPatterns: {
        mostActiveTime: "19시",
        mostActiveDay: "금",
      },
      favoriteHashtags: ["일상", "카페", "주말", "맛집", "여행"],
      byTone: {
        캐주얼: 8,
        감성적: 3,
        유머러스: 1,
      },
    };

    const mockRecent = [
      {
        id: "1",
        content: "오늘 카페에서 마신 라떼가 정말 맛있었어요! 분위기도 좋고...",
        createdAt: new Date().toISOString(),
        platform: "instagram",
        category: "카페",
      },
      {
        id: "2",
        content: "주말 나들이 다녀왔는데 날씨가 너무 좋더라구요",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        platform: "facebook",
        category: "일상",
      },
    ];

    setStats(mockStats);
    setRecentPosts(mockRecent);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "오늘";
    }
    if (diffDays === 1) {
      return "어제";
    }
    if (diffDays < 7) {
      return `${diffDays}일 전`;
    }
    return date.toLocaleDateString();
  };

  const styles = createStyles(colors, cardTheme);

  if (!stats) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* 주요 통계 카드 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.statsScroll}
      >
        <FadeInView delay={0}>
          <StatCard
            icon={<MaterialIcon name="edit" size={24} color={colors.primary} />}
            value={stats.totalPosts}
            label="총 게시물"
            color={colors.primary}
            cardStyle={[styles.statCard, { backgroundColor: colors.surface }]}
            iconContainerStyle={styles.iconContainer}
            valueStyle={[styles.statValue, { color: colors.text.primary }]}
            labelStyle={[styles.statLabel, { color: colors.text.tertiary }]}
          />
        </FadeInView>

        <FadeInView delay={100}>
          <StatCard
            icon={<MaterialIcon name="schedule" size={24} color="#8B5CF6" />}
            value={stats.postingPatterns.mostActiveTime}
            label="주요 시간대"
            color="#8B5CF6"
            cardStyle={[styles.statCard, { backgroundColor: colors.surface }]}
            iconContainerStyle={styles.iconContainer}
            valueStyle={[styles.statValue, { color: colors.text.primary }]}
            labelStyle={[styles.statLabel, { color: colors.text.tertiary }]}
          />
        </FadeInView>

        <FadeInView delay={200}>
          <StatCard
            icon={
              <MaterialIcon name="calendar-today" size={24} color="#10B981" />
            }
            value={`${stats.postingPatterns.mostActiveDay}요일`}
            label="활발한 요일"
            color="#10B981"
            cardStyle={[styles.statCard, { backgroundColor: colors.surface }]}
            iconContainerStyle={styles.iconContainer}
            valueStyle={[styles.statValue, { color: colors.text.primary }]}
            labelStyle={[styles.statLabel, { color: colors.text.tertiary }]}
          />
        </FadeInView>
      </ScrollView>

      {/* 내 스타일 */}
      <AnimatedCard
        delay={300}
        style={[styles.styleCard, { backgroundColor: colors.surface }] as any}
      >
        <View style={styles.styleHeader}>
          <MaterialIcon name="auto-awesome" size={20} color={colors.primary} />
          <Text style={[styles.styleTitle, { color: colors.text.primary }]}>
            내 포스팅 스타일
          </Text>
        </View>

        <View style={styles.styleContent}>
          <Text style={[styles.styleLabel, { color: colors.text.secondary }]}>
            자주 쓰는 톤
          </Text>
          <View style={styles.toneTags}>
            {Object.entries(stats.byTone)
              .sort(([, a], [, b]) => (b as number) - (a as number))
              .slice(0, 3)
              .map(([tone, count], index) => (
                <View
                  key={tone}
                  style={[
                    styles.toneTag,
                    index === 0 && styles.primaryToneTag,
                    {
                      borderColor: index === 0 ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.toneText,
                      {
                        color:
                          index === 0 ? colors.primary : colors.text.secondary,
                      },
                    ]}
                  >
                    {tone}
                  </Text>
                  <Text
                    style={[
                      styles.toneCount,
                      {
                        color:
                          index === 0 ? colors.primary : colors.text.tertiary,
                      },
                    ]}
                  >
                    {count as number}
                  </Text>
                </View>
              ))}
          </View>
        </View>
      </AnimatedCard>

      {/* 최근 작성한 글 미리보기 */}
      <View style={styles.recentSection}>
        <Text style={[styles.recentTitle, { color: colors.text.primary }]}>
          최근 작성한 글
        </Text>
        {recentPosts.slice(0, 2).map((post, index) => (
          <AnimatedCard
            key={post.id}
            delay={400 + index * 100}
            style={[styles.recentCard, { backgroundColor: colors.surface }] as any}
          >
            <View style={styles.recentHeader}>
              <Icon
                name={
                  post.platform === "instagram"
                    ? "logo-instagram"
                    : post.platform === "facebook"
                    ? "logo-facebook"
                    : "globe"
                }
                size={16}
                color={colors.text.tertiary}
              />
              <Text
                style={[styles.recentDate, { color: colors.text.tertiary }]}
              >
                {formatDate(post.createdAt)}
              </Text>
              <View
                style={[
                  styles.categoryBadge,
                  { backgroundColor: colors.primary + "15" },
                ]}
              >
                <Text style={[styles.categoryText, { color: colors.primary }]}>
                  {post.category}
                </Text>
              </View>
            </View>
            <Text
              style={[styles.recentContent, { color: colors.text.secondary }]}
              numberOfLines={1}
            >
              {post.content}
            </Text>
          </AnimatedCard>
        ))}
      </View>
    </View>
  );
};

const createStyles = (colors: typeof COLORS, cardTheme: any) => {
  const styles = StyleSheet.create({
    container: {
      marginBottom: SPACING.lg,
    },
    statsScroll: {
      marginBottom: SPACING.lg,
      paddingVertical: SPACING.xs,
    },
    statCard: {
      width: 110,
      height: 120,
      borderRadius: 16,
      padding: SPACING.md,
      marginRight: SPACING.sm,
      alignItems: "center",
      justifyContent: "center",
      ...cardTheme.default.shadow,
    },
    iconContainer: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: SPACING.sm,
    },
    statValue: {
      fontSize: 18,
      fontWeight: "700",
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 11,
      textAlign: "center",
    },
    styleCard: {
      borderRadius: 16,
      padding: SPACING.lg,
      marginBottom: SPACING.lg,
      ...cardTheme.default.shadow,
    },
    styleHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.xs,
      marginBottom: SPACING.md,
    },
    styleTitle: {
      fontSize: 15,
      fontWeight: "600",
    },
    styleContent: {
      gap: SPACING.sm,
    },
    styleLabel: {
      fontSize: 12,
      marginBottom: SPACING.xs,
    },
    toneTags: {
      flexDirection: "row",
      gap: SPACING.sm,
    },
    toneTag: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 1,
      gap: SPACING.xs,
    },
    primaryToneTag: {
      backgroundColor: colors.primary + "10",
    },
    toneText: {
      fontSize: 13,
      fontWeight: "500",
    },
    toneCount: {
      fontSize: 11,
      fontWeight: "600",
    },
    recentSection: {
      gap: SPACING.sm,
    },
    recentTitle: {
      fontSize: 15,
      fontWeight: "600",
      marginBottom: SPACING.xs,
    },
    recentCard: {
      borderRadius: 12,
      padding: SPACING.md,
      ...cardTheme.default.shadow,
    },
    recentHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.xs,
      marginBottom: SPACING.xs,
    },
    recentDate: {
      fontSize: 11,
      flex: 1,
    },
    categoryBadge: {
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
    },
    categoryText: {
      fontSize: 10,
      fontWeight: "500",
    },
    recentContent: {
      fontSize: 13,
      lineHeight: 18,
    },
  });

  // statCard에만 적용되는 특별한 그림자 스타일
  if (!colors.background.includes("#1A202C")) {
    // 라이트 모드일 때만
    styles.statCard = {
      ...styles.statCard,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    };
  }

  return styles;
};

export default SimpleStatsView;

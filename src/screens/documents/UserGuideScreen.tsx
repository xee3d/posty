import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Pressable,
  Animated,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import {
  COLORS,
  SPACING,
  BORDER_RADIUS,
  TYPOGRAPHY,
  FONT_SIZES,
} from "../../utils/constants";
import { useAppTheme } from "../../hooks/useAppTheme";

interface UserGuideScreenProps {
  onBack?: () => void;
  onContact?: () => void;
}

const UserGuideScreen: React.FC<UserGuideScreenProps> = ({
  onBack,
  onContact,
}) => {
  const { colors, cardTheme } = useAppTheme();
  const [expandedSection, setExpandedSection] = useState<number | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);

  const styles = createStyles(colors);

  const features = [
    {
      id: "write",
      icon: "create",
      color: "#6366F1",
      title: "AI 글쓰기",
      subtitle: "아이디어를 멋진 콘텐츠로",
      description:
        "간단한 키워드만 입력하면 Posty가 맞춤형 SNS 콘텐츠를 생성해드려요.",
      features: [
        "다양한 톤과 스타일 선택",
        "플랫폼별 최적화",
        "이미지 기반 콘텐츠 생성",
        "해시태그 자동 추천",
      ],
    },
    {
      id: "trend",
      icon: "trending-up",
      color: "#F59E0B",
      title: "트렌드 분석",
      subtitle: "실시간 인사이트",
      description: "지금 뜨는 토픽과 최적의 포스팅 시간을 알려드려요.",
      features: [
        "실시간 해시태그 분석",
        "카테고리별 트렌드",
        "최적 포스팅 시간 추천",
        "경쟁 콘텐츠 분석",
      ],
    },
    {
      id: "style",
      icon: "color-palette",
      color: "#EC4899",
      title: "스타일 분석",
      subtitle: "나만의 글쓰기 스타일",
      description: "작성한 콘텐츠를 분석해 개인화된 인사이트를 제공해요.",
      features: [
        "톤 & 매너 분석",
        "자주 사용하는 키워드",
        "참여율 패턴 분석",
        "맞춤형 개선 제안",
      ],
    },
  ];

  const faqData = [
    {
      q: "무료로 사용할 수 있나요?",
      a: "기본 기능은 무료로 제공됩니다. 더 많은 기능은 프리미엄 플랜을 확인해주세요.",
    },
    {
      q: "AI가 생성한 콘텐츠를 수정할 수 있나요?",
      a: "물론입니다! 생성된 모든 콘텐츠는 자유롭게 편집하실 수 있어요.",
    },
    {
      q: "여러 SNS에 동시 게시가 가능한가요?",
      a: "네! 연결된 모든 계정에 한 번에 게시할 수 있으며, 플랫폼별로 자동 최적화됩니다.",
    },
    {
      q: "데이터는 안전하게 보관되나요?",
      a: "모든 데이터는 암호화되어 안전하게 클라우드에 저장됩니다.",
    },
  ];

  const tabs = ["기능 소개", "FAQ"];

  const handleFeaturePress = (index: number) => {
    setExpandedSection(expandedSection === index ? null : index);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Icon name="chevron-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>사용 가이드</Text>
        <View style={styles.placeholder} />
      </View>

      {/* 히어로 섹션 */}
      <View style={styles.hero}>
        <View style={styles.heroIconContainer}>
          <Icon name="rocket-outline" size={32} color={colors.primary} />
        </View>
        <Text style={styles.heroTitle}>Posty 시작하기</Text>
        <Text style={styles.heroSubtitle}>
          AI와 함께 더 나은 콘텐츠를 만들어보세요
        </Text>
      </View>

      {/* 탭 */}
      <View style={styles.tabContainer}>
        {tabs.map((tab, index) => (
          <Pressable
            key={tab}
            style={[styles.tab, selectedTab === index && styles.tabActive]}
            onPress={() => setSelectedTab(index)}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === index && styles.tabTextActive,
              ]}
            >
              {tab}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {selectedTab === 0 ? (
          /* 기능 소개 탭 */
          <View style={styles.featuresSection}>
            {features.map((feature, index) => (
              <Pressable
                key={feature.id}
                style={[
                  styles.featureCard,
                  expandedSection === index && styles.featureCardExpanded,
                ]}
                onPress={() => handleFeaturePress(index)}
              >
                <View style={styles.featureHeader}>
                  <View
                    style={[
                      styles.featureIcon,
                      { backgroundColor: feature.color + "20" },
                    ]}
                  >
                    <Icon name={feature.icon} size={24} color={feature.color} />
                  </View>
                  <View style={styles.featureInfo}>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureSubtitle}>
                      {feature.subtitle}
                    </Text>
                  </View>
                  <Icon
                    name={
                      expandedSection === index ? "chevron-up" : "chevron-down"
                    }
                    size={20}
                    color={colors.text.tertiary}
                  />
                </View>

                {expandedSection === index && (
                  <View style={styles.featureContent}>
                    <Text style={styles.featureDescription}>
                      {feature.description}
                    </Text>
                    <View style={styles.featureList}>
                      {feature.features.map((item, idx) => (
                        <View key={idx} style={styles.featureListItem}>
                          <View style={styles.featureBullet} />
                          <Text style={styles.featureListText}>{item}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        ) : (
          /* FAQ 탭 */
          <View style={styles.faqSection}>
            {faqData.map((item, index) => (
              <View key={index} style={styles.faqItem}>
                <View style={styles.faqHeader}>
                  <View style={styles.faqIcon}>
                    <Text style={styles.faqIconText}>Q</Text>
                  </View>
                  <Text style={styles.faqQuestion}>{item.q}</Text>
                </View>
                <Text style={styles.faqAnswer}>{item.a}</Text>
              </View>
            ))}
          </View>
        )}

        {/* CTA 섹션 */}
        <View style={styles.ctaSection}>
          <View style={styles.ctaCard}>
            <Icon name="headset" size={24} color={colors.primary} />
            <Text style={styles.ctaTitle}>도움이 더 필요하신가요?</Text>
            <Text style={styles.ctaDescription}>언제든지 문의해주세요</Text>
            <TouchableOpacity style={styles.ctaButton} onPress={onContact}>
              <Text style={styles.ctaButtonText}>문의하기</Text>
              <Icon name="arrow-forward" size={16} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: typeof COLORS) => {
  const isDark = colors.background === "#1A202C";

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.md,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surface,
      justifyContent: "center",
      alignItems: "center",
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text.primary,
    },
    placeholder: {
      width: 40,
    },
    hero: {
      alignItems: "center",
      paddingVertical: SPACING.xl,
      paddingHorizontal: SPACING.lg,
    },
    heroIconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.primary + "20",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: SPACING.md,
    },
    heroTitle: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.text.primary,
      marginBottom: SPACING.xs,
    },
    heroSubtitle: {
      fontSize: FONT_SIZES.medium,
      color: colors.text.secondary,
      textAlign: "center",
    },
    tabContainer: {
      flexDirection: "row",
      paddingHorizontal: SPACING.lg,
      marginBottom: SPACING.md,
      gap: SPACING.sm,
    },
    tab: {
      flex: 1,
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md,
      borderRadius: BORDER_RADIUS.full,
      backgroundColor: colors.surface,
      alignItems: "center",
    },
    tabActive: {
      backgroundColor: colors.primary,
    },
    tabText: {
      fontSize: FONT_SIZES.medium,
      fontWeight: "600",
      color: colors.text.secondary,
    },
    tabTextActive: {
      color: colors.white,
    },
    content: {
      flex: 1,
    },
    contentContainer: {
      paddingHorizontal: SPACING.lg,
    },
    featuresSection: {
      gap: SPACING.md,
    },
    featureCard: {
      backgroundColor: colors.surface,
      borderRadius: BORDER_RADIUS.lg,
      padding: SPACING.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    featureCardExpanded: {
      borderColor: colors.primary,
    },
    featureHeader: {
      flexDirection: "row",
      alignItems: "center",
    },
    featureIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: "center",
      alignItems: "center",
      marginRight: SPACING.md,
    },
    featureInfo: {
      flex: 1,
    },
    featureTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text.primary,
      marginBottom: 2,
    },
    featureSubtitle: {
      fontSize: FONT_SIZES.small,
      color: colors.text.secondary,
    },
    featureContent: {
      marginTop: SPACING.md,
      paddingTop: SPACING.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    featureDescription: {
      fontSize: FONT_SIZES.medium,
      color: colors.text.secondary,
      lineHeight: 22,
      marginBottom: SPACING.md,
    },
    featureList: {
      gap: SPACING.sm,
    },
    featureListItem: {
      flexDirection: "row",
      alignItems: "center",
    },
    featureBullet: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.primary,
      marginRight: SPACING.sm,
    },
    featureListText: {
      fontSize: FONT_SIZES.medium,
      color: colors.text.secondary,
      flex: 1,
    },
    faqSection: {
      gap: SPACING.md,
    },
    faqItem: {
      backgroundColor: colors.surface,
      borderRadius: BORDER_RADIUS.lg,
      padding: SPACING.lg,
    },
    faqHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: SPACING.sm,
    },
    faqIcon: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.primary + "20",
      justifyContent: "center",
      alignItems: "center",
      marginRight: SPACING.sm,
    },
    faqIconText: {
      fontSize: 12,
      fontWeight: "700",
      color: colors.primary,
    },
    faqQuestion: {
      flex: 1,
      fontSize: FONT_SIZES.medium,
      fontWeight: "600",
      color: colors.text.primary,
      lineHeight: 22,
    },
    faqAnswer: {
      fontSize: FONT_SIZES.medium,
      color: colors.text.secondary,
      lineHeight: 22,
      marginLeft: 32,
    },
    ctaSection: {
      marginTop: SPACING.xxl,
      marginBottom: SPACING.lg,
    },
    ctaCard: {
      backgroundColor: isDark ? colors.primary + "20" : colors.primaryLight,
      borderRadius: BORDER_RADIUS.xl,
      padding: SPACING.xl,
      alignItems: "center",
    },
    ctaTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text.primary,
      marginTop: SPACING.md,
      marginBottom: SPACING.xs,
    },
    ctaDescription: {
      fontSize: FONT_SIZES.medium,
      color: colors.text.secondary,
      marginBottom: SPACING.lg,
    },
    ctaButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.primary,
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.lg,
      borderRadius: BORDER_RADIUS.full,
      gap: SPACING.xs,
    },
    ctaButtonText: {
      fontSize: FONT_SIZES.medium,
      fontWeight: "600",
      color: colors.white,
    },
    bottomSpace: {
      height: SPACING.xxl,
    },
  });
};

export default UserGuideScreen;

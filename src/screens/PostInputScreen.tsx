import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { SafeIcon } from "../utils/SafeIcon";
import Icon from "react-native-vector-icons/Ionicons";
import MaterialIcon from "react-native-vector-icons/MaterialIcons";
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from "../utils/constants";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "../hooks/useAppTheme";
import { ScaleButton, FadeInView } from "../components/AnimationComponents";
import { createHeaderStyles } from "../styles/commonStyles";
import localAnalyticsService from "../services/analytics/localAnalyticsService";
import { soundManager } from "../utils/soundManager";
import { Alert } from "../utils/customAlert";

interface PostInputScreenProps {
  onClose: () => void;
  onSave: () => void;
  initialContent?: string;
  initialHashtags?: string[];
}

const PostInputScreen: React.FC<PostInputScreenProps> = ({
  onClose,
  onSave,
  initialContent = "",
  initialHashtags = [],
}) => {
  const { colors, cardTheme } = useAppTheme();
  const { t } = useTranslation();
  const [content, setContent] = useState(initialContent);
  const [hashtags, setHashtags] = useState(initialHashtags.join(" "));
  const [platform, setPlatform] = useState<
    "instagram" | "facebook" | "twitter"
  >("instagram");
  const [category, setCategory] = useState<string>(t('myStyle.categories.daily', '일상'));
  const [metrics, setMetrics] = useState({
    likes: "",
    comments: "",
    shares: "",
    reach: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const categories = [
    t('myStyle.categories.cafe', '카페'),
    t('myStyle.categories.food', '맛집'),
    t('myStyle.categories.daily', '일상'),
    t('myStyle.categories.exercise', '운동'),
    t('myStyle.categories.travel', '여행'),
    t('myStyle.categories.business', '비즈니스'),
    t('myStyle.categories.emotional', '감성'),
    t('myStyle.categories.storytelling', '문어체'),
  ];
  const platforms = [
    {
      id: "instagram",
      name: "Instagram",
      icon: "logo-instagram",
      color: "#E4405F",
    },
    {
      id: "facebook",
      name: "Facebook",
      icon: "logo-facebook",
      color: "#1877F2",
    },
    { id: "twitter", name: "X", icon: "logo-twitter", color: "#000000" },
  ];

  const handleSave = async () => {
    if (!content.trim()) {
      Alert.alert(t('common.error'), t('posts.input.required'));
      return;
    }

    setIsSaving(true);
    try {
      // 해시태그 파싱
      const hashtagList = hashtags
        .split(/[\s,]+/)
        .filter((tag) => tag.length > 0)
        .map((tag) => (tag.startsWith("#") ? tag.substring(1) : tag));

      // 게시물 저장
      await localAnalyticsService.savePost({
        content,
        hashtags: hashtagList,
        platform,
        category,
        tone: "casual", // 기본값
        metrics: {
          likes: parseInt(metrics.likes) || 0,
          comments: parseInt(metrics.comments) || 0,
          shares: parseInt(metrics.shares) || 0,
          reach: parseInt(metrics.reach) || 0,
        },
      });

      Alert.alert(t('common.success'), t('posts.actions.saveSuccess'), [
        {
          text: t('common.close'),
          onPress: () => {
            onSave();
            onClose();
          },
        },
      ]);
    } catch (error) {
      console.error("Failed to save post:", error);
      Alert.alert(t('common.error'), t('posts.actions.saveError'));
    } finally {
      setIsSaving(false);
    }
  };

  const styles = createStyles(colors, cardTheme);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.modalHeader}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <SafeIcon name="close" size={20} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.modalHeaderTitle}>{t('posts.input.title')}</Text>
        <TouchableOpacity
          style={[styles.saveButton, isSaving && styles.disabledButton]}
          onPress={isSaving ? undefined : handleSave}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? t('posts.actions.saving') : t('posts.actions.save')}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <FadeInView delay={0}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('posts.input.contentSection')}</Text>
            <TextInput
              style={styles.contentInput}
              placeholder={t('posts.input.placeholder')}
              placeholderTextColor={colors.text.tertiary}
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={4}
            />
          </View>
        </FadeInView>

        <FadeInView delay={100}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('posts.input.hashtags')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('posts.input.hashtagPlaceholder')}
              placeholderTextColor={colors.text.tertiary}
              value={hashtags}
              onChangeText={setHashtags}
            />
          </View>
        </FadeInView>

        <FadeInView delay={200}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('posts.input.platform')}</Text>
            <View style={styles.platformSelector}>
              {platforms.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={[
                    styles.platformButton,
                    platform === p.id && styles.platformButtonActive,
                    platform === p.id && { borderColor: p.color },
                  ]}
                  onPress={() => setPlatform(p.id as any)}
                >
                  <Icon
                    name={p.icon}
                    size={20}
                    color={platform === p.id ? p.color : colors.text.tertiary}
                  />
                  <Text
                    style={[
                      styles.platformButtonText,
                      platform === p.id && { color: p.color },
                    ]}
                  >
                    {p.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </FadeInView>

        <FadeInView delay={300}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('posts.input.category')}</Text>
            <View style={styles.categoryGrid}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryButton,
                    category === cat && styles.categoryButtonActive,
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      category === cat && styles.categoryButtonTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </FadeInView>

        <FadeInView delay={400}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t('posts.input.metrics')}
              <Text style={styles.sectionSubtitle}> {t('posts.input.optional')}</Text>
            </Text>
            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <View style={styles.metricHeader}>
                  <SafeIcon name="heart" size={16} color="#EF4444" />
                  <Text style={styles.metricLabel}>{t('posts.metrics.likes')}</Text>
                </View>
                <TextInput
                  style={styles.metricInput}
                  placeholder="0"
                  placeholderTextColor={colors.text.tertiary}
                  value={metrics.likes}
                  onChangeText={(text) =>
                    setMetrics({ ...metrics, likes: text })
                  }
                  keyboardType="number-pad"
                />
              </View>

              <View style={styles.metricItem}>
                <View style={styles.metricHeader}>
                  <SafeIcon name="chatbubble" size={16} color="#3B82F6" />
                  <Text style={styles.metricLabel}>{t('posts.metrics.comments')}</Text>
                </View>
                <TextInput
                  style={styles.metricInput}
                  placeholder="0"
                  placeholderTextColor={colors.text.tertiary}
                  value={metrics.comments}
                  onChangeText={(text) =>
                    setMetrics({ ...metrics, comments: text })
                  }
                  keyboardType="number-pad"
                />
              </View>

              <View style={styles.metricItem}>
                <View style={styles.metricHeader}>
                  <SafeIcon name="share-social" size={16} color="#10B981" />
                  <Text style={styles.metricLabel}>{t('posts.metrics.shares')}</Text>
                </View>
                <TextInput
                  style={styles.metricInput}
                  placeholder="0"
                  placeholderTextColor={colors.text.tertiary}
                  value={metrics.shares}
                  onChangeText={(text) =>
                    setMetrics({ ...metrics, shares: text })
                  }
                  keyboardType="number-pad"
                />
              </View>

              <View style={styles.metricItem}>
                <View style={styles.metricHeader}>
                  <SafeIcon name="people" size={16} color="#8B5CF6" />
                  <Text style={styles.metricLabel}>{t('posts.metrics.reach')}</Text>
                </View>
                <TextInput
                  style={styles.metricInput}
                  placeholder="0"
                  placeholderTextColor={colors.text.tertiary}
                  value={metrics.reach}
                  onChangeText={(text) =>
                    setMetrics({ ...metrics, reach: text })
                  }
                  keyboardType="number-pad"
                />
              </View>
            </View>
          </View>
        </FadeInView>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: typeof COLORS, cardTheme: any) => {
  const headerStyles = createHeaderStyles(colors);
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    // 공통 헤더 스타일 사용
    ...headerStyles,
    // 모달 헤더에 보더 추가
    modalHeader: {
      ...headerStyles.modalHeader,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    saveButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.sm,
      borderRadius: 20,
    },
    disabledButton: {
      backgroundColor: colors.text.tertiary,
      opacity: 0.6,
    },
    saveButtonText: {
      color: colors.white,
      fontSize: 14,
      fontWeight: "600",
    },
    content: {
      flex: 1,
    },
    section: {
      paddingHorizontal: SPACING.lg,
      marginTop: SPACING.xl,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text.primary,
      marginBottom: SPACING.sm,
    },
    sectionSubtitle: {
      fontSize: 14,
      fontWeight: "400",
      color: colors.text.tertiary,
    },
    contentInput: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: SPACING.md,
      fontSize: 15,
      color: colors.text.primary,
      minHeight: 100,
      textAlignVertical: "top",
      borderWidth: 1,
      borderColor: colors.border,
    },
    input: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: SPACING.md,
      fontSize: 15,
      color: colors.text.primary,
      borderWidth: 1,
      borderColor: colors.border,
    },
    platformSelector: {
      flexDirection: "row",
      gap: SPACING.sm,
    },
    platformButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: SPACING.xs,
      backgroundColor: colors.surface,
      paddingVertical: SPACING.sm,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.border,
    },
    platformButtonActive: {
      borderWidth: 2,
    },
    platformButtonText: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.text.tertiary,
    },
    categoryGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: SPACING.sm,
    },
    categoryButton: {
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.sm,
      backgroundColor: colors.surface,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    categoryButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    categoryButtonText: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.text.secondary,
    },
    categoryButtonTextActive: {
      color: colors.white,
    },
    metricsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: SPACING.sm,
    },
    metricItem: {
      flex: 1,
      minWidth: "45%",
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: SPACING.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    metricHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.xs,
      marginBottom: SPACING.xs,
    },
    metricLabel: {
      fontSize: 13,
      color: colors.text.secondary,
    },
    metricInput: {
      fontSize: 20,
      fontWeight: "600",
      color: colors.text.primary,
      padding: 0,
    },
    bottomSpace: {
      height: SPACING.xxl,
    },
  });
};

export default PostInputScreen;

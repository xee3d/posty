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
import Icon from "react-native-vector-icons/Ionicons";
import MaterialIcon from "react-native-vector-icons/MaterialIcons";
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from "../utils/constants";
import { useAppTheme } from "../hooks/useAppTheme";
import { ScaleButton, FadeInView } from "../components/AnimationComponents";
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
  const [content, setContent] = useState(initialContent);
  const [hashtags, setHashtags] = useState(initialHashtags.join(" "));
  const [platform, setPlatform] = useState<
    "instagram" | "facebook" | "twitter"
  >("instagram");
  const [category, setCategory] = useState<string>("일상");
  const [metrics, setMetrics] = useState({
    likes: "",
    comments: "",
    shares: "",
    reach: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  const categories = [
    "카페",
    "맛집",
    "일상",
    "운동",
    "여행",
    "패션",
    "뷰티",
    "기타",
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
      Alert.alert("알림", "게시물 내용을 입력해주세요.");
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

      Alert.alert("성공", "게시물이 저장되었습니다!", [
        {
          text: "확인",
          onPress: () => {
            onSave();
            onClose();
          },
        },
      ]);
    } catch (error) {
      console.error("Failed to save post:", error);
      Alert.alert("오류", "게시물 저장 중 문제가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const styles = createStyles(colors, cardTheme);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Icon name="close" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>게시물 기록하기</Text>
        <ScaleButton
          style={styles.saveButton}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? "저장 중..." : "저장"}
          </Text>
        </ScaleButton>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <FadeInView delay={0}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>게시물 내용</Text>
            <TextInput
              style={styles.contentInput}
              placeholder="게시물 내용을 입력하세요..."
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
            <Text style={styles.sectionTitle}>해시태그</Text>
            <TextInput
              style={styles.input}
              placeholder="#일상 #카페 #주말"
              placeholderTextColor={colors.text.tertiary}
              value={hashtags}
              onChangeText={setHashtags}
            />
          </View>
        </FadeInView>

        <FadeInView delay={200}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>플랫폼</Text>
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
            <Text style={styles.sectionTitle}>카테고리</Text>
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
              성과 지표
              <Text style={styles.sectionSubtitle}> (선택사항)</Text>
            </Text>
            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <View style={styles.metricHeader}>
                  <Icon name="heart" size={16} color="#EF4444" />
                  <Text style={styles.metricLabel}>좋아요</Text>
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
                  <Icon name="chatbubble" size={16} color="#3B82F6" />
                  <Text style={styles.metricLabel}>댓글</Text>
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
                  <Icon name="share-social" size={16} color="#10B981" />
                  <Text style={styles.metricLabel}>공유</Text>
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
                  <Icon name="people" size={16} color="#8B5CF6" />
                  <Text style={styles.metricLabel}>도달</Text>
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

const createStyles = (colors: typeof COLORS, cardTheme: typeof CARD_THEME) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    closeButton: {
      padding: SPACING.xs,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text.primary,
    },
    saveButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.sm,
      borderRadius: 20,
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

export default PostInputScreen;

// src/screens/PostListScreen.tsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  ListRenderItem,
  Clipboard,
  Share,
} from "react-native";
import { SafeIcon } from "../utils/SafeIcon";
import Icon from "react-native-vector-icons/Ionicons";
import MaterialIcon from "react-native-vector-icons/MaterialIcons";
import {
  COLORS,
  FONTS,
  SPACING,
  BORDER_RADIUS,
  CARD_THEME,
} from "../utils/constants";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "../hooks/useAppTheme";
import {
  ScaleButton,
  FadeInView,
  AnimatedCard,
} from "../components/AnimationComponents";
import localAnalyticsService from "../services/analytics/localAnalyticsService";
import { storage } from "../utils/storage";
// Firebase 제거 - Vercel 기반 인증으로 변경됨
import { soundManager } from "../utils/soundManager";
import { Alert } from "../utils/customAlert";
interface PostListScreenProps {
  onClose: () => void;
}

interface PostItem {
  id: string;
  content: string;
  hashtags: string[];
  platform: string;
  category: string;
  tone: string;
  createdAt: string;
}

// 톤에서 카테고리 추출 헬퍼 함수  
const getCategoryFromTone = (tone: string, t: any): string => {
  const toneToCategory: { [key: string]: string } = {
    casual: t('posts.styles.casual'),
    professional: t('posts.styles.professional'),
    humorous: t('posts.styles.humorous'),
    emotional: t('posts.styles.emotional'),
    genz: t('posts.styles.genz'),
    millennial: t('posts.styles.millennial'),
    minimalist: t('posts.styles.minimalist'),
    storytelling: t('posts.styles.storytelling'),
    motivational: t('posts.styles.motivational'),
  };

  return toneToCategory[tone] || t('myStyle.categories.daily', '일상');
};

// 날짜 포맷 함수 (t 함수는 컴포넌트 내부에서 정의)
const createFormatDate = (t: (key: string) => string) => (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return t('posts.time.today');
  }
  if (diffDays === 1) {
    return t('posts.time.yesterday');
  }
  if (diffDays < 7) {
    return `${diffDays}일 전`;
  }
  if (diffDays < 30) {
    return `${Math.floor(diffDays / 7)}주 전`;
  }
  return `${Math.floor(diffDays / 30)}개월 전`;
};

// 플랫폼 아이콘 상수
const PLATFORM_ICONS = {
  instagram: { name: "logo-instagram", color: "#E4405F" },
  facebook: { name: "logo-facebook", color: "#1877F2" },
  twitter: { name: "logo-twitter", color: "#000000" },
};

// 게시물 아이템 컴포넌트 - 최적화를 위해 분리
const PostItemComponent = React.memo<{
  item: PostItem;
  index: number;
  expandedPostId: string | null;
  onToggleExpand: (id: string) => void;
  colors: typeof COLORS;
  cardTheme: any;
  t: (key: string) => string;
  formatDate: (dateString: string) => string;
}>(({ item, index, expandedPostId, onToggleExpand, colors, cardTheme, t, formatDate }) => {
  const isExpanded = expandedPostId === item.id;
  const styles = useMemo(
    () => createPostStyles(colors, cardTheme),
    [colors, cardTheme]
  );

  // 복사하기 핸들러
  const handleCopy = useCallback(() => {
    const fullText = `${item.content}\n\n${item.hashtags
      .map((tag) => `#${tag}`)
      .join(" ")}`;
    Clipboard.setString(fullText);
    soundManager.playSuccess();
    Alert.alert(t('posts.actions.copy'), t('posts.actions.copyMessage'));
  }, [item, t]);

  // 공유하기 핸들러
  const handleShare = useCallback(async () => {
    try {
      const fullText = `${item.content}\n\n${item.hashtags
        .map((tag) => `#${tag}`)
        .join(" ")}`;
      await Share.share({
        message: fullText,
      });
      soundManager.playTap();
    } catch (error) {
      console.error("Failed to share:", error);
    }
  }, [item]);

  return (
    <AnimatedCard delay={index * 50} style={styles.postCard}>
      <TouchableOpacity
        onPress={() => onToggleExpand(item.id)}
        activeOpacity={0.8}
      >
        <View style={styles.postHeader}>
          <View style={styles.postMeta}>
            <Icon
              name={PLATFORM_ICONS[item.platform]?.name || "globe"}
              size={16}
              color={
                PLATFORM_ICONS[item.platform]?.color || colors.text.secondary
              }
            />
            <Text style={styles.postDate}>{formatDate(item.createdAt)}</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
          </View>
          <Icon
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={20}
            color={colors.text.tertiary}
          />
        </View>

        <Text
          style={styles.postContent}
          numberOfLines={isExpanded ? undefined : 2}
        >
          {item.content}
        </Text>

        <View style={styles.postHashtags}>
          {item.hashtags.slice(0, 3).map((tag: string, tagIndex: number) => (
            <Text key={tagIndex} style={styles.hashtag}>
              #{tag}
            </Text>
          ))}
          {item.hashtags.length > 3 && (
            <Text style={styles.moreHashtags}>+{item.hashtags.length - 3}</Text>
          )}
        </View>

        {/* 액션 버튼들 */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleCopy}
            activeOpacity={0.7}
          >
            <SafeIcon name="copy-outline" size={18} color={colors.text.secondary} />
            <Text style={styles.actionButtonText}>복사</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleShare}
            activeOpacity={0.7}
          >
            <Icon
              name="share-social-outline"
              size={18}
              color={colors.text.secondary}
            />
            <Text style={styles.actionButtonText}>공유</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </AnimatedCard>
  );
});

PostItemComponent.displayName = "PostItemComponent";

const PostListScreen: React.FC<PostListScreenProps> = ({ onClose }) => {
  const { colors, cardTheme } = useAppTheme();
  const { t } = useTranslation();
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // formatDate 함수 생성
  const formatDate = useMemo(() => createFormatDate(t), [t]);

  // 메인 스타일 메모이제이션
  const styles = useMemo(
    () => createStyles(colors, cardTheme),
    [colors, cardTheme]
  );

  // 게시물 로드 - 로컬 데이터 사용 (Firestore는 제거됨)
  const loadPosts = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true);
    }

    try {
      // Firebase Auth는 유지되나 Firestore는 사용하지 않음
      // 로컬 데이터만 로드
      const savedContents = await storage.getSavedContents();

      const formattedPosts = savedContents.map((content) => ({
        id: content.id,
        content: content.content,
        hashtags: content.hashtags,
        platform: content.platform || "instagram",
        category: getCategoryFromTone(content.tone, t),
        tone: content.tone,
        createdAt: content.createdAt,
      }));

      const sortedPosts = formattedPosts.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      // 최대 10개만 표시
      setPosts(sortedPosts.slice(0, 10));
    } catch (error) {
      console.error("Failed to load posts:", error);
      const localPosts = await localAnalyticsService.getAllPosts();
      // 에러 시에도 최대 10개만 표시
      setPosts(localPosts.slice(0, 10).map(post => ({
        ...post,
        category: post.category || t('myStyle.categories.daily', '일상'),
        tone: post.tone || 'casual' // tone이 없으면 기본값 설정
      })));
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // 초기 로드
  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // 새로고침 핸들러
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadPosts(false);
  }, [loadPosts]);

  // 확장/축소 토글
  const handleToggleExpand = useCallback((postId: string) => {
    setExpandedPostId((prev) => (prev === postId ? null : postId));
  }, []);

  // 렌더 아이템 최적화
  const renderItem: ListRenderItem<PostItem> = useCallback(
    ({ item, index }) => (
      <PostItemComponent
        item={item}
        index={index}
        expandedPostId={expandedPostId}
        onToggleExpand={handleToggleExpand}
        colors={colors}
        cardTheme={cardTheme}
        t={t}
        formatDate={formatDate}
      />
    ),
    [expandedPostId, handleToggleExpand, colors, cardTheme, t, formatDate]
  );

  // 키 추출기
  const keyExtractor = useCallback((item: PostItem) => item.id, []);

  // 아이템 레이아웃 최적화
  const getItemLayout = useCallback(
    (data: PostItem[] | null | undefined, index: number) => ({
      length: 150, // 예상 아이템 높이
      offset: 150 * index,
      index,
    }),
    []
  );

  // 헤더 컴포넌트
  const ListHeaderComponent = useMemo(
    () => (
      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          총 <Text style={styles.summaryNumber}>{posts.length}</Text>개의 게시물
        </Text>
      </View>
    ),
    [posts.length, styles]
  );

  // 빈 목록 컴포넌트
  const ListEmptyComponent = useMemo(
    () => (
      <View style={styles.emptyContainer}>
        <Icon
          name="document-text-outline"
          size={48}
          color={colors.text.tertiary}
        />
        <Text style={styles.emptyText}>아직 작성한 게시물이 없습니다</Text>
      </View>
    ),
    [styles, colors]
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <SafeIcon name="close" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>내 게시물</Text>
          <View style={{ width: 44 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <SafeIcon name="close" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>내 게시물</Text>
        <View style={{ width: 44 }} />
      </View>

      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyComponent}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        windowSize={10}
        initialNumToRender={5}
        getItemLayout={getItemLayout}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      />
    </SafeAreaView>
  );
};

const createStyles = (colors: typeof COLORS, cardTheme: any) =>
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
    listContent: {
      paddingBottom: SPACING.xxl,
    },
    summary: {
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.md,
    },
    summaryText: {
      fontSize: 14,
      color: colors.text.secondary,
    },
    summaryNumber: {
      fontWeight: "600",
      color: colors.text.primary,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: SPACING.xxl * 2,
    },
    emptyText: {
      marginTop: SPACING.md,
      fontSize: 16,
      color: colors.text.tertiary,
    },
  });

const createPostStyles = (colors: typeof COLORS, cardTheme: any) =>
  StyleSheet.create({
    postCard: {
      backgroundColor: colors.surface,
      marginHorizontal: SPACING.lg,
      marginBottom: SPACING.md,
      borderRadius: 12,
      padding: SPACING.md,
      ...cardTheme.default.shadow,
    },
    postHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: SPACING.sm,
    },
    postMeta: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.xs,
    },
    postDate: {
      fontSize: 12,
      color: colors.text.tertiary,
    },
    categoryBadge: {
      backgroundColor: colors.primary + "20",
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
    },
    categoryText: {
      fontSize: 11,
      color: colors.primary,
      fontWeight: "500",
    },
    postContent: {
      fontSize: 14,
      color: colors.text.primary,
      lineHeight: 20,
      marginBottom: SPACING.sm,
    },
    postHashtags: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: SPACING.xs,
      marginBottom: SPACING.sm,
    },
    hashtag: {
      fontSize: 12,
      color: colors.primary,
    },
    moreHashtags: {
      fontSize: 12,
      color: colors.text.tertiary,
    },
    actionButtons: {
      flexDirection: "row",
      justifyContent: "flex-end",
      gap: SPACING.md,
      marginTop: SPACING.xs,
      paddingTop: SPACING.sm,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    actionButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.xs,
      paddingVertical: SPACING.xs,
      paddingHorizontal: SPACING.sm,
    },
    actionButtonText: {
      fontSize: 13,
      color: colors.text.secondary,
      fontWeight: "500",
    },
  });

export default PostListScreen;

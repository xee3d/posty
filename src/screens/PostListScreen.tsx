import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
  Modal,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../utils/constants';
import { useAppTheme } from '../hooks/useAppTheme';
import { ScaleButton, FadeInView, AnimatedCard } from '../components/AnimationComponents';
import localAnalyticsService from '../services/analytics/localAnalyticsService';

interface PostListScreenProps {
  onClose: () => void;
}

interface PostEditModalProps {
  post: any;
  onClose: () => void;
  onSave: () => void;
}

const PostEditModal: React.FC<PostEditModalProps> = ({ post, onClose, onSave }) => {
  const { colors } = useAppTheme();
  const [metrics, setMetrics] = useState({
    likes: post.metrics.likes.toString(),
    comments: post.metrics.comments.toString(),
    shares: post.metrics.shares.toString(),
    reach: post.metrics.reach.toString(),
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await localAnalyticsService.updatePostMetrics(post.id, {
        likes: parseInt(metrics.likes) || 0,
        comments: parseInt(metrics.comments) || 0,
        shares: parseInt(metrics.shares) || 0,
        reach: parseInt(metrics.reach) || 0,
      });
      
      Alert.alert('성공', '성과 지표가 업데이트되었습니다!', [
        { text: '확인', onPress: () => {
          onSave();
          onClose();
        }}
      ]);
    } catch (error) {
      Alert.alert('오류', '업데이트 중 문제가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      padding: SPACING.lg,
    },
    modal: {
      backgroundColor: colors.background,
      borderRadius: 16,
      padding: SPACING.xl,
      maxHeight: '80%',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING.lg,
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text.primary,
    },
    closeButton: {
      padding: SPACING.xs,
    },
    content: {
      marginBottom: SPACING.lg,
    },
    contentText: {
      fontSize: 14,
      color: colors.text.primary,
      lineHeight: 20,
      marginBottom: SPACING.sm,
    },
    hashtags: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: SPACING.xs,
    },
    hashtag: {
      fontSize: 12,
      color: colors.primary,
    },
    metricsSection: {
      marginTop: SPACING.lg,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: SPACING.md,
    },
    metricsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: SPACING.sm,
    },
    metricItem: {
      flex: 1,
      minWidth: '45%',
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: SPACING.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    metricHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
      marginBottom: SPACING.xs,
    },
    metricLabel: {
      fontSize: 13,
      color: colors.text.secondary,
    },
    metricInput: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text.primary,
      padding: 0,
    },
    actions: {
      flexDirection: 'row',
      gap: SPACING.sm,
      marginTop: SPACING.xl,
    },
    cancelButton: {
      flex: 1,
      backgroundColor: colors.surface,
      paddingVertical: SPACING.md,
      borderRadius: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    cancelButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text.secondary,
    },
    saveButton: {
      flex: 1,
      backgroundColor: colors.primary,
      paddingVertical: SPACING.md,
      borderRadius: 12,
      alignItems: 'center',
    },
    saveButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.white,
    },
  });

  return (
    <Modal
      transparent
      visible={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.container} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} onPress={e => e.stopPropagation()}>
          <View style={styles.modal}>
            <View style={styles.header}>
              <Text style={styles.title}>성과 업데이트</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Icon name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.content}>
              <Text style={styles.contentText} numberOfLines={3}>
                {post.content}
              </Text>
              <View style={styles.hashtags}>
                {post.hashtags.map((tag: string, index: number) => (
                  <Text key={index} style={styles.hashtag}>#{tag}</Text>
                ))}
              </View>
            </View>

            <View style={styles.metricsSection}>
              <Text style={styles.sectionTitle}>성과 지표 입력</Text>
              <View style={styles.metricsGrid}>
                <View style={styles.metricItem}>
                  <View style={styles.metricHeader}>
                    <Icon name="heart" size={16} color="#EF4444" />
                    <Text style={styles.metricLabel}>좋아요</Text>
                  </View>
                  <TextInput
                    style={styles.metricInput}
                    value={metrics.likes}
                    onChangeText={(text) => setMetrics({...metrics, likes: text})}
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor={colors.text.tertiary}
                  />
                </View>

                <View style={styles.metricItem}>
                  <View style={styles.metricHeader}>
                    <Icon name="chatbubble" size={16} color="#3B82F6" />
                    <Text style={styles.metricLabel}>댓글</Text>
                  </View>
                  <TextInput
                    style={styles.metricInput}
                    value={metrics.comments}
                    onChangeText={(text) => setMetrics({...metrics, comments: text})}
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor={colors.text.tertiary}
                  />
                </View>

                <View style={styles.metricItem}>
                  <View style={styles.metricHeader}>
                    <Icon name="share-social" size={16} color="#10B981" />
                    <Text style={styles.metricLabel}>공유</Text>
                  </View>
                  <TextInput
                    style={styles.metricInput}
                    value={metrics.shares}
                    onChangeText={(text) => setMetrics({...metrics, shares: text})}
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor={colors.text.tertiary}
                  />
                </View>

                <View style={styles.metricItem}>
                  <View style={styles.metricHeader}>
                    <Icon name="people" size={16} color="#8B5CF6" />
                    <Text style={styles.metricLabel}>도달</Text>
                  </View>
                  <TextInput
                    style={styles.metricInput}
                    value={metrics.reach}
                    onChangeText={(text) => setMetrics({...metrics, reach: text})}
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor={colors.text.tertiary}
                  />
                </View>
              </View>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveButton} 
                onPress={handleSave}
                disabled={isSaving}
              >
                <Text style={styles.saveButtonText}>
                  {isSaving ? '저장 중...' : '저장'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const PostListScreen: React.FC<PostListScreenProps> = ({ onClose }) => {
  const { colors, cardTheme } = useAppTheme();
  const [posts, setPosts] = useState<any[]>([]);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const allPosts = await localAnalyticsService.getAllPosts();
      // 최신순으로 정렬
      const sortedPosts = allPosts.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setPosts(sortedPosts);
    } catch (error) {
      console.error('Failed to load posts:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return '오늘';
    if (diffDays === 1) return '어제';
    if (diffDays < 7) return `${diffDays}일 전`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`;
    return `${Math.floor(diffDays / 30)}개월 전`;
  };

  const getTotalEngagement = (metrics: any) => {
    return metrics.likes + metrics.comments + metrics.shares;
  };

  const platformIcons = {
    instagram: { name: 'logo-instagram', color: '#E4405F' },
    facebook: { name: 'logo-facebook', color: '#1877F2' },
    twitter: { name: 'logo-twitter', color: '#000000' },
  };

  const styles = createStyles(colors, cardTheme);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Icon name="close" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>내 게시물</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.summary}>
          <Text style={styles.summaryText}>
            총 <Text style={styles.summaryNumber}>{posts.length}</Text>개의 게시물
          </Text>
        </View>

        {posts.map((post, index) => (
          <AnimatedCard key={post.id} delay={index * 50} style={styles.postCard}>
            <TouchableOpacity 
              onPress={() => {
                setSelectedPost(post);
                setShowEditModal(true);
              }}
            >
              <View style={styles.postHeader}>
                <View style={styles.postMeta}>
                  <Icon 
                    name={platformIcons[post.platform]?.name || 'globe'} 
                    size={16} 
                    color={platformIcons[post.platform]?.color || colors.text.secondary} 
                  />
                  <Text style={styles.postDate}>{formatDate(post.createdAt)}</Text>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{post.category}</Text>
                  </View>
                </View>
                <Icon name="chevron-forward" size={20} color={colors.text.tertiary} />
              </View>

              <Text style={styles.postContent} numberOfLines={2}>
                {post.content}
              </Text>

              <View style={styles.postHashtags}>
                {post.hashtags.slice(0, 3).map((tag: string, tagIndex: number) => (
                  <Text key={tagIndex} style={styles.hashtag}>#{tag}</Text>
                ))}
                {post.hashtags.length > 3 && (
                  <Text style={styles.moreHashtags}>+{post.hashtags.length - 3}</Text>
                )}
              </View>

              <View style={styles.postMetrics}>
                <View style={styles.metricItem}>
                  <Icon name="heart" size={14} color="#EF4444" />
                  <Text style={styles.metricValue}>{post.metrics.likes}</Text>
                </View>
                <View style={styles.metricItem}>
                  <Icon name="chatbubble" size={14} color="#3B82F6" />
                  <Text style={styles.metricValue}>{post.metrics.comments}</Text>
                </View>
                <View style={styles.metricItem}>
                  <Icon name="share-social" size={14} color="#10B981" />
                  <Text style={styles.metricValue}>{post.metrics.shares}</Text>
                </View>
                <View style={[styles.metricItem, styles.totalEngagement]}>
                  <Icon name="flame" size={14} color={colors.primary} />
                  <Text style={[styles.metricValue, styles.totalValue]}>
                    {getTotalEngagement(post.metrics)}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </AnimatedCard>
        ))}

        <View style={styles.bottomSpace} />
      </ScrollView>

      {showEditModal && selectedPost && (
        <PostEditModal
          post={selectedPost}
          onClose={() => {
            setShowEditModal(false);
            setSelectedPost(null);
          }}
          onSave={() => {
            loadPosts();
          }}
        />
      )}
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
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
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
      fontWeight: '600',
      color: colors.text.primary,
    },
    content: {
      flex: 1,
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
      fontWeight: '600',
      color: colors.text.primary,
    },
    postCard: {
      backgroundColor: colors.surface,
      marginHorizontal: SPACING.lg,
      marginBottom: SPACING.md,
      borderRadius: 12,
      padding: SPACING.md,
      ...cardTheme.default.shadow,
    },
    postHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING.sm,
    },
    postMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.xs,
    },
    postDate: {
      fontSize: 12,
      color: colors.text.tertiary,
    },
    categoryBadge: {
      backgroundColor: colors.primary + '20',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
    },
    categoryText: {
      fontSize: 11,
      color: colors.primary,
      fontWeight: '500',
    },
    postContent: {
      fontSize: 14,
      color: colors.text.primary,
      lineHeight: 20,
      marginBottom: SPACING.sm,
    },
    postHashtags: {
      flexDirection: 'row',
      flexWrap: 'wrap',
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
    postMetrics: {
      flexDirection: 'row',
      gap: SPACING.md,
      paddingTop: SPACING.sm,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    metricItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    metricValue: {
      fontSize: 12,
      color: colors.text.secondary,
      fontWeight: '500',
    },
    totalEngagement: {
      marginLeft: 'auto',
    },
    totalValue: {
      color: colors.primary,
      fontWeight: '600',
    },
    bottomSpace: {
      height: SPACING.xxl,
    },
  });

export default PostListScreen;

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
import { storage } from '../utils/storage';
import auth from '@react-native-firebase/auth';
import firestoreService from '../services/firebase/firestoreService';
import { Post as FirestorePost } from '../types/firestore';

interface PostListScreenProps {
  onClose: () => void;
}



const PostListScreen: React.FC<PostListScreenProps> = ({ onClose }) => {
  const { colors, cardTheme } = useAppTheme();
  const [posts, setPosts] = useState<any[]>([]);
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);

  useEffect(() => {
    // 초기 데이터 로드
    loadPosts();
    
    // 로그인한 경우 실시간 구독
    if (auth().currentUser) {
      const unsubscribe = firestoreService.subscribeToUserPosts(
        50, // 더 많은 게시물 표시
        (firestorePosts: FirestorePost[]) => {
          // Firestore 데이터를 기존 포맷으로 변환
          const formattedPosts = firestorePosts.map(post => ({
            id: post.id,
            content: post.content,
            hashtags: post.hashtags,
            platform: post.platform,
            category: post.category || getCategoryFromTone(post.tone),
            tone: post.tone,
            createdAt: post.createdAt.toDate ? post.createdAt.toDate().toISOString() : new Date().toISOString(),
          }));
          
          setPosts(formattedPosts);
        }
      );
      
      return () => unsubscribe();
    }
  }, []);

  const loadPosts = async () => {
    try {
      // 비로그인 상태에서만 로컬 데이터 로드
      if (!auth().currentUser) {
        const savedContents = await storage.getSavedContents();
        
        // SavedContent를 기존 포맷으로 변환
        const formattedPosts = savedContents.map(content => ({
          id: content.id,
          content: content.content,
          hashtags: content.hashtags,
          platform: content.platform || 'instagram',
          category: getCategoryFromTone(content.tone),
          tone: content.tone,
          createdAt: content.createdAt,
        }));
        
        // 최신순으로 정렬
        const sortedPosts = formattedPosts.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        
        setPosts(sortedPosts);
      }
      // 로그인 상태에서는 구독으로 자동 업데이트
    } catch (error) {
      console.error('Failed to load posts:', error);
      // 오류 시 로컬 데이터만 사용
      const localPosts = await localAnalyticsService.getAllPosts();
      setPosts(localPosts);
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
              onPress={() => setExpandedPostId(expandedPostId === post.id ? null : post.id)}
              activeOpacity={0.8}
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
                <Icon 
                  name={expandedPostId === post.id ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color={colors.text.tertiary} 
                />
              </View>

              <Text 
                style={styles.postContent} 
                numberOfLines={expandedPostId === post.id ? undefined : 2}
              >
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


            </TouchableOpacity>
          </AnimatedCard>
        ))}

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

    bottomSpace: {
      height: SPACING.xxl,
    },
  });

// 톤에서 카테고리 추출 헬퍼 함수
function getCategoryFromTone(tone: string): string {
  const toneToCategory: { [key: string]: string } = {
    'casual': '일상',
    'professional': '비즈니스',
    'humorous': '유머',
    'emotional': '감성',
    'genz': '트렌드',
    'millennial': '라이프스타일',
    'minimalist': '미니멀',
    'storytelling': '스토리',
    'motivational': '동기부여',
  };
  
  return toneToCategory[tone] || '일상';
}

export default PostListScreen;

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useAppTheme } from '../../hooks/useAppTheme';

const { width: screenWidth } = Dimensions.get('window');

export type AdLayoutType = 'feed' | 'card' | 'banner' | 'inline' | 'fullwidth';

interface AdaptiveNativeAdProps {
  layout?: AdLayoutType;
  onPress?: () => void;
  showSponsoredLabel?: boolean;
}

const AdaptiveNativeAd: React.FC<AdaptiveNativeAdProps> = ({
  layout = 'feed',
  onPress,
  showSponsoredLabel = true,
}) => {
  const { colors, isDark } = useAppTheme();
  const [adData, setAdData] = useState<any>(null);
  
  useEffect(() => {
    // 샘플 광고 데이터 (실제로는 AdMob에서 로드)
    setAdData({
      headline: 'AI 콘텐츠 생성의 혁명',
      body: '최신 AI 기술로 더 빠르고 정확한 콘텐츠를 만들어보세요. 지금 시작하면 첫 달 무료!',
      advertiser: 'TechCorp',
      callToAction: '무료 체험',
      imageUrl: 'https://via.placeholder.com/300x200',
      iconUrl: 'https://via.placeholder.com/48',
      rating: 4.8,
      price: '월 ₩9,900',
    });
  }, []);
  
  if (!adData) return null;
  
  const renderFeedLayout = () => (
    <TouchableOpacity 
      style={[styles.feedContainer, { backgroundColor: colors.card }]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {showSponsoredLabel && (
        <View style={styles.sponsoredBadge}>
          <Text style={styles.sponsoredText}>Sponsored</Text>
        </View>
      )}
      
      <View style={styles.feedHeader}>
        <Image source={{ uri: adData.iconUrl }} style={styles.feedIcon} />
        <View style={styles.feedHeaderText}>
          <Text style={[styles.advertiser, { color: colors.text }]}>
            {adData.advertiser}
          </Text>
          <View style={styles.ratingRow}>
            {[...Array(5)].map((_, i) => (
              <Icon
                key={i}
                name="star"
                size={12}
                color={i < Math.floor(adData.rating) ? '#FFD700' : '#E0E0E0'}
              />
            ))}
            <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
              {adData.rating}
            </Text>
          </View>
        </View>
      </View>
      
      <Image source={{ uri: adData.imageUrl }} style={styles.feedImage} />
      
      <View style={styles.feedContent}>
        <Text style={[styles.headline, { color: colors.text }]}>
          {adData.headline}
        </Text>
        <Text style={[styles.body, { color: colors.textSecondary }]}>
          {adData.body}
        </Text>
        
        <LinearGradient
          colors={['#6366F1', '#8B5CF6']}
          style={styles.ctaButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.ctaText}>{adData.callToAction}</Text>
          <Icon name="arrow-forward" size={16} color="#FFFFFF" />
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );
  
  const renderCardLayout = () => (
    <TouchableOpacity 
      style={[styles.cardContainer, { backgroundColor: colors.card }]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={isDark ? ['#1F2937', '#111827'] : ['#F9FAFB', '#F3F4F6']}
        style={styles.cardGradient}
      >
        {showSponsoredLabel && (
          <View style={styles.cardSponsoredBadge}>
            <Icon name="megaphone-outline" size={12} color="#6366F1" />
            <Text style={styles.cardSponsoredText}>AD</Text>
          </View>
        )}
        
        <Image source={{ uri: adData.imageUrl }} style={styles.cardImage} />
        
        <View style={styles.cardContent}>
          <Text style={[styles.cardHeadline, { color: colors.text }]} numberOfLines={2}>
            {adData.headline}
          </Text>
          <Text style={[styles.cardBody, { color: colors.textSecondary }]} numberOfLines={3}>
            {adData.body}
          </Text>
          
          <View style={styles.cardFooter}>
            <Text style={[styles.price, { color: colors.primary }]}>
              {adData.price}
            </Text>
            <TouchableOpacity style={styles.cardCtaButton}>
              <Text style={styles.cardCtaText}>{adData.callToAction}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
  
  const renderBannerLayout = () => (
    <TouchableOpacity 
      style={[styles.bannerContainer, { backgroundColor: colors.card }]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={['#6366F1', '#8B5CF6']}
        style={styles.bannerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.bannerContent}>
          <View style={styles.bannerTextContent}>
            <Text style={styles.bannerHeadline} numberOfLines={1}>
              {adData.headline}
            </Text>
            <Text style={styles.bannerBody} numberOfLines={2}>
              {adData.body}
            </Text>
          </View>
          
          <TouchableOpacity style={styles.bannerCtaButton}>
            <Text style={styles.bannerCtaText}>{adData.callToAction}</Text>
          </TouchableOpacity>
        </View>
        
        {showSponsoredLabel && (
          <Text style={styles.bannerSponsoredText}>광고</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
  
  const renderInlineLayout = () => (
    <View style={[styles.inlineContainer, { backgroundColor: colors.surface }]}>
      {showSponsoredLabel && (
        <Text style={[styles.inlineSponsored, { color: colors.textTertiary }]}>
          • 광고 •
        </Text>
      )}
      
      <TouchableOpacity 
        style={styles.inlineContent}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Image source={{ uri: adData.iconUrl }} style={styles.inlineIcon} />
        
        <View style={styles.inlineTextContent}>
          <Text style={[styles.inlineHeadline, { color: colors.text }]} numberOfLines={1}>
            {adData.headline}
          </Text>
          <Text style={[styles.inlineBody, { color: colors.textSecondary }]} numberOfLines={1}>
            {adData.body}
          </Text>
        </View>
        
        <TouchableOpacity style={styles.inlineCtaButton}>
          <Text style={styles.inlineCtaText}>{adData.callToAction}</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
  
  const renderFullWidthLayout = () => (
    <TouchableOpacity 
      style={styles.fullWidthContainer}
      onPress={onPress}
      activeOpacity={0.95}
    >
      <Image source={{ uri: adData.imageUrl }} style={styles.fullWidthImage} />
      
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.fullWidthOverlay}
      >
        {showSponsoredLabel && (
          <View style={styles.fullWidthSponsoredBadge}>
            <Text style={styles.fullWidthSponsoredText}>광고</Text>
          </View>
        )}
        
        <View style={styles.fullWidthContent}>
          <Text style={styles.fullWidthHeadline}>{adData.headline}</Text>
          <Text style={styles.fullWidthBody} numberOfLines={2}>
            {adData.body}
          </Text>
          
          <View style={styles.fullWidthCta}>
            <Text style={styles.fullWidthPrice}>{adData.price}</Text>
            <TouchableOpacity style={styles.fullWidthCtaButton}>
              <Text style={styles.fullWidthCtaText}>{adData.callToAction}</Text>
              <Icon name="arrow-forward" size={14} color="#000" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
  
  switch (layout) {
    case 'card':
      return renderCardLayout();
    case 'banner':
      return renderBannerLayout();
    case 'inline':
      return renderInlineLayout();
    case 'fullwidth':
      return renderFullWidthLayout();
    case 'feed':
    default:
      return renderFeedLayout();
  }
};

const styles = StyleSheet.create({
  // Feed Layout Styles
  feedContainer: {
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  sponsoredBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    zIndex: 1,
  },
  sponsoredText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  feedHeader: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  feedIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  feedHeaderText: {
    flex: 1,
  },
  advertiser: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 12,
    marginLeft: 4,
  },
  feedImage: {
    width: '100%',
    height: 200,
  },
  feedContent: {
    padding: 16,
  },
  headline: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  ctaText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  
  // Card Layout Styles
  cardContainer: {
    width: (screenWidth - 48) / 2,
    marginHorizontal: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: 12,
  },
  cardSponsoredBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    gap: 4,
    zIndex: 1,
  },
  cardSponsoredText: {
    fontSize: 10,
    color: '#6366F1',
    fontWeight: '700',
  },
  cardImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardHeadline: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardBody: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
  },
  cardCtaButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  cardCtaText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  
  // Banner Layout Styles
  bannerContainer: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    height: 100,
  },
  bannerGradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerTextContent: {
    flex: 1,
    marginRight: 12,
  },
  bannerHeadline: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  bannerBody: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 18,
  },
  bannerCtaButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  bannerCtaText: {
    color: '#6366F1',
    fontWeight: '700',
    fontSize: 13,
  },
  bannerSponsoredText: {
    position: 'absolute',
    top: 8,
    right: 8,
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  
  // Inline Layout Styles
  inlineContainer: {
    marginVertical: 8,
    paddingVertical: 12,
  },
  inlineSponsored: {
    textAlign: 'center',
    fontSize: 11,
    marginBottom: 8,
  },
  inlineContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  inlineIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    marginRight: 12,
  },
  inlineTextContent: {
    flex: 1,
  },
  inlineHeadline: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  inlineBody: {
    fontSize: 12,
  },
  inlineCtaButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  inlineCtaText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  
  // Full Width Layout Styles
  fullWidthContainer: {
    width: screenWidth,
    height: 250,
    position: 'relative',
  },
  fullWidthImage: {
    width: '100%',
    height: '100%',
  },
  fullWidthOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    justifyContent: 'flex-end',
    padding: 20,
  },
  fullWidthSponsoredBadge: {
    position: 'absolute',
    top: -80,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  fullWidthSponsoredText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  fullWidthContent: {
    marginBottom: 10,
  },
  fullWidthHeadline: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  fullWidthBody: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
    marginBottom: 12,
  },
  fullWidthCta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fullWidthPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  fullWidthCtaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    gap: 6,
  },
  fullWidthCtaText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 14,
  },
});

export default AdaptiveNativeAd;
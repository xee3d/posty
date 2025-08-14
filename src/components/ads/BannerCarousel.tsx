import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  Animated,
} from 'react-native';
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from 'react-native-google-mobile-ads';
import LinearGradient from 'react-native-linear-gradient';

const { width: screenWidth } = Dimensions.get('window');

interface BannerCarouselProps {
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showIndicators?: boolean;
}

const BannerCarousel: React.FC<BannerCarouselProps> = ({
  autoPlay = true,
  autoPlayInterval = 5000,
  showIndicators = true,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  
  // 여러 광고 유닛 ID (캐러셀용)
  const adUnitIds = __DEV__ 
    ? [TestIds.BANNER, TestIds.BANNER, TestIds.BANNER] // 테스트 모드
    : [
        'ca-app-pub-xxxxxxxxxxxxx/banner1',
        'ca-app-pub-xxxxxxxxxxxxx/banner2', 
        'ca-app-pub-xxxxxxxxxxxxx/banner3',
      ];
  
  const bannerData = [
    {
      gradient: ['#667eea', '#764ba2'],
      title: '프리미엄 업그레이드',
      subtitle: '무제한 토큰으로 더 많은 콘텐츠를!',
      cta: '지금 시작하기',
    },
    {
      gradient: ['#f093fb', '#f5576c'],
      title: '신규 기능 출시',
      subtitle: 'AI 이미지 생성 기능을 만나보세요',
      cta: '체험하기',
    },
    {
      gradient: ['#4facfe', '#00f2fe'],
      title: '특별 할인',
      subtitle: '첫 구독 50% 할인 이벤트',
      cta: '혜택 받기',
    },
  ];
  
  useEffect(() => {
    if (autoPlay) {
      const timer = setInterval(() => {
        handleAutoScroll();
      }, autoPlayInterval);
      
      return () => clearInterval(timer);
    }
  }, [currentIndex, autoPlay]);
  
  const handleAutoScroll = () => {
    const nextIndex = (currentIndex + 1) % bannerData.length;
    scrollToIndex(nextIndex);
  };
  
  const scrollToIndex = (index: number) => {
    scrollViewRef.current?.scrollTo({
      x: index * screenWidth,
      animated: true,
    });
    setCurrentIndex(index);
    
    // 페이드 애니메이션
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.8,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };
  
  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / screenWidth);
    if (index !== currentIndex) {
      setCurrentIndex(index);
    }
  };
  
  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {bannerData.map((banner, index) => (
          <Animated.View
            key={index}
            style={[
              styles.bannerWrapper,
              { opacity: fadeAnim },
            ]}
          >
            <LinearGradient
              colors={banner.gradient}
              style={styles.banner}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.bannerContent}>
                <Text style={styles.bannerTitle}>{banner.title}</Text>
                <Text style={styles.bannerSubtitle}>{banner.subtitle}</Text>
                <TouchableOpacity style={styles.ctaButton}>
                  <Text style={styles.ctaText}>{banner.cta}</Text>
                </TouchableOpacity>
              </View>
              
              {/* 실제 광고 배너 오버레이 */}
              <View style={styles.adOverlay}>
                <BannerAd
                  unitId={adUnitIds[index]}
                  size={BannerAdSize.MEDIUM_RECTANGLE}
                  requestOptions={{
                    requestNonPersonalizedAdsOnly: false,
                  }}
                />
              </View>
            </LinearGradient>
          </Animated.View>
        ))}
      </ScrollView>
      
      {/* 인디케이터 */}
      {showIndicators && (
        <View style={styles.indicators}>
          {bannerData.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => scrollToIndex(index)}
            >
              <View
                style={[
                  styles.indicator,
                  currentIndex === index && styles.indicatorActive,
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 160,
    marginVertical: 12,
  },
  bannerWrapper: {
    width: screenWidth - 32,
    marginHorizontal: 16,
  },
  banner: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  bannerContent: {
    flex: 1,
    justifyContent: 'center',
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
  },
  ctaButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  ctaText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  adOverlay: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    opacity: 0.9,
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  indicatorActive: {
    width: 24,
    backgroundColor: '#6366F1',
  },
});

export default BannerCarousel;
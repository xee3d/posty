import React, { useRef, useEffect, useState } from "react";
import {
  View,
  ScrollView,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  Animated,
  ViewStyle,
} from "react-native";
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from "react-native-google-mobile-ads";
import LinearGradient from "react-native-linear-gradient";

const { width: screenWidth } = Dimensions.get("window");

interface BannerCarouselProps {
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showIndicators?: boolean;
  style?: ViewStyle;
}

const BannerCarousel: React.FC<BannerCarouselProps> = ({
  autoPlay = true,
  autoPlayInterval = 5000,
  showIndicators = true,
  style,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [isPaused, setIsPaused] = useState(false);

  // 여러 광고 유닛 ID (캐러셀용) - 모두 테스트 ID 사용
  const adUnitIds = [
    TestIds.BANNER,
    TestIds.BANNER,
    TestIds.BANNER,
    TestIds.BANNER,
    TestIds.BANNER,
  ];

  const bannerData = [
    {
      gradient: ["#667eea", "#764ba2"],
      title: "🚀 프리미엄 업그레이드",
      subtitle: "무제한 토큰으로 더 많은 콘텐츠를!",
      cta: "지금 시작하기",
    },
    {
      gradient: ["#f093fb", "#f5576c"],
      title: "✨ AI 이미지 생성",
      subtitle: "텍스트로 이미지를 만들어보세요",
      cta: "체험하기",
    },
    {
      gradient: ["#4facfe", "#00f2fe"],
      title: "🎯 특별 할인 이벤트",
      subtitle: "첫 구독 50% 할인 + 보너스 토큰",
      cta: "혜택 받기",
    },
    {
      gradient: ["#43e97b", "#38f9d7"],
      title: "📱 모바일 최적화",
      subtitle: "어디서든 빠르고 쉬운 콘텐츠 생성",
      cta: "더 알아보기",
    },
    {
      gradient: ["#fa709a", "#fee140"],
      title: "🔥 인기 템플릿",
      subtitle: "트렌디한 SNS 콘텐츠 템플릿 모음",
      cta: "구경하기",
    },
  ];

  useEffect(() => {
    if (autoPlay && !isPaused) {
      const timer = setInterval(() => {
        handleAutoScroll();
      }, autoPlayInterval);

      return () => clearInterval(timer);
    }
  }, [currentIndex, autoPlay, isPaused]);

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
    <View style={[styles.container, style]}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => {
          setTimeout(() => setIsPaused(false), 3000); // 3초 후 자동 재생 재개
        }}
      >
        {bannerData.map((banner, index) => (
          <Animated.View
            key={index}
            style={[styles.bannerWrapper, { opacity: fadeAnim }]}
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
            <TouchableOpacity key={index} onPress={() => scrollToIndex(index)}>
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    backgroundColor: "transparent",
  },
  banner: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    justifyContent: "space-between",
  },
  bannerContent: {
    flex: 1,
    justifyContent: "center",
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 12,
  },
  ctaButton: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  ctaText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  adOverlay: {
    position: "absolute",
    bottom: 10,
    right: 10,
    opacity: 0.9,
  },
  indicators: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  indicatorActive: {
    width: 24,
    backgroundColor: "#6366F1",
  },
});

export default BannerCarousel;

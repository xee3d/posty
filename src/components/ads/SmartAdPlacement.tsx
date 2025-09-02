import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import AdaptiveNativeAd from "./AdaptiveNativeAd";
import BannerCarousel from "./BannerCarousel";
import NativeAdComponent from "./NativeAdComponent";
import AdIntegrationService from "../../services/AdIntegrationService";
import { useAppSelector } from "../../hooks/redux";

interface SmartAdPlacementProps {
  position: number;
  context: "feed" | "home" | "post" | "profile";
  children?: React.ReactNode;
}

/**
 * 스마트 광고 배치 컴포넌트
 * - 사용자의 구독 상태에 따라 광고 표시 여부 결정
 * - 위치와 컨텍스트에 따라 최적의 광고 레이아웃 선택
 * - 광고 빈도를 자동으로 조절
 */
const SmartAdPlacement: React.FC<SmartAdPlacementProps> = ({
  position,
  context,
  children,
}) => {
  const subscription = useAppSelector((state) => state.user.subscription);
  const [shouldShowAd, setShouldShowAd] = useState(false);
  const [adLayout, setAdLayout] = useState<
    "feed" | "card" | "banner" | "inline" | "fullwidth"
  >("feed");

  useEffect(() => {
    // 개발 모드에서는 항상 광고 표시 (테스트용)
    if (__DEV__) {
      const showAd = AdIntegrationService.shouldShowNativeAd(position, context);
      setShouldShowAd(showAd);

      if (showAd) {
        const layout = AdIntegrationService.getAdLayoutType(position);
        setAdLayout(layout);
      }
      return;
    }

    // 프리미엄 이상 구독자는 광고 없음
    if (subscription?.plan === "premium" || subscription?.plan === "pro") {
      setShouldShowAd(false);
      return;
    }

    // 무료 사용자 또는 스타터 플랜은 광고 표시
    const showAd = AdIntegrationService.shouldShowNativeAd(position, context);
    setShouldShowAd(showAd);

    if (showAd) {
      // 위치에 따른 광고 레이아웃 결정
      const layout = AdIntegrationService.getAdLayoutType(position);
      setAdLayout(layout);
    }
  }, [position, subscription]);

  if (!shouldShowAd) {
    return <>{children}</>;
  }

  // 컨텍스트에 따른 광고 컴포넌트 선택
  const renderAd = () => {
    switch (context) {
      case "home":
        if (position === 0) {
          // 홈 화면 상단에는 캐러셀 배너
          return <BannerCarousel autoPlay={true} />;
        }
        return <AdaptiveNativeAd layout={adLayout} />;

      case "feed":
        // 피드에서는 다양한 레이아웃 사용
        return <AdaptiveNativeAd layout={adLayout} />;

      case "post":
        // 포스트 상세에서는 인라인 광고
        return <AdaptiveNativeAd layout="inline" />;

      case "profile":
        // 프로필에서는 카드 형태 광고
        return <AdaptiveNativeAd layout="card" />;

      default:
        return <NativeAdComponent />;
    }
  };

  return (
    <View style={styles.container}>
      {children}
      <View style={styles.adContainer}>{renderAd()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  adContainer: {
    marginVertical: 8,
  },
});

export default SmartAdPlacement;

import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from "react-native-google-mobile-ads";

const { width: screenWidth } = Dimensions.get("window");

interface CompactBannerProps {
  size?: "standard" | "large" | "smart";
  style?: any;
}

const CompactBanner: React.FC<CompactBannerProps> = ({
  size = "standard",
  style,
}) => {
  const adUnitId = __DEV__
    ? TestIds.BANNER
    : "ca-app-pub-xxxxxxxxxxxxx/banner-compact";

  const getBannerSize = () => {
    switch (size) {
      case "large":
        return BannerAdSize.LARGE_BANNER; // 320x100
      case "smart":
        return BannerAdSize.SMART_BANNER; // 스크린에 맞춤
      default:
        return BannerAdSize.BANNER; // 320x50
    }
  };

  return (
    <View style={[styles.container, style]}>
      <BannerAd
        unitId={adUnitId}
        size={getBannerSize()}
        requestOptions={{
          requestNonPersonalizedAdsOnly: false,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8,
    backgroundColor: "transparent",
  },
});

export default CompactBanner;

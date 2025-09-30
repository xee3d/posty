import React from "react";
import { View, StyleSheet, Dimensions, Platform } from "react-native";
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
    : Platform.select({
        ios: "ca-app-pub-4435733896538626/6058204207", // Posty 하단 배너 (iOS)
        android: "ca-app-pub-4435733896538626/8889856459", // Posty 하단 배너 (Android)
      });

  const getBannerSize = () => {
    switch (size) {
      case "large":
        return BannerAdSize.LARGE_BANNER; // 320x100
      case "smart":
        return BannerAdSize.MEDIUM_RECTANGLE; // 스크린에 맞춤
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

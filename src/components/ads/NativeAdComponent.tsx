import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  ActivityIndicator,
} from "react-native";
import {
  GAMBannerAd,
  BannerAdSize,
  TestIds,
  AdEventType,
  GAMNativeAd,
} from "react-native-google-mobile-ads";
import { COLORS, SPACING } from "../../utils/constants";

interface NativeAdComponentProps {
  style?: any;
  testMode?: boolean;
}

const NativeAdComponent: React.FC<NativeAdComponentProps> = ({
  style,
  testMode = __DEV__,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 실제 광고 ID 또는 테스트 ID 사용
  const adUnitId = testMode
    ? TestIds.GAM_NATIVE
    : Platform.select({
        ios: "ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyy", // 실제 iOS 네이티브 광고 ID로 교체
        android: "ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyy", // 실제 Android 네이티브 광고 ID로 교체
      }) || TestIds.GAM_NATIVE;

  if (!adUnitId) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.adBadge}>
        <Text style={styles.adBadgeText}>광고</Text>
      </View>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>광고를 불러올 수 없습니다</Text>
        </View>
      )}

      <GAMBannerAd
        unitId={adUnitId}
        sizes={[BannerAdSize.MEDIUM_RECTANGLE]}
        requestOptions={{
          requestNonPersonalizedAdsOnly: false,
        }}
        onAdLoaded={() => {
          setIsLoading(false);
          setError(null);
          console.log("Native ad loaded");
        }}
        onAdFailedToLoad={(error) => {
          setIsLoading(false);
          setError(error.message);
          console.error("Native ad failed to load:", error);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginVertical: SPACING.small,
    marginHorizontal: SPACING.medium,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
    minHeight: 250,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  adBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    zIndex: 1,
  },
  adBadgeText: {
    fontSize: 10,
    color: COLORS.white,
    fontWeight: "600",
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  errorContainer: {
    padding: SPACING.medium,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 12,
    color: COLORS.gray,
    textAlign: "center",
  },
});

export default NativeAdComponent;

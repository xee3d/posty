import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Linking,
  Platform,
} from "react-native";
import { COLORS, SPACING } from "../../utils/constants";
import Icon from "react-native-vector-icons/MaterialIcons";
import { NativeAd } from "../../utils/adConfig";

interface NativeAdViewProps {
  ad: NativeAd;
  onPress?: () => void;
  style?: any;
}

export const NativeAdView: React.FC<NativeAdViewProps> = ({
  ad,
  onPress,
  style,
}) => {
  const handlePress = () => {
    if (onPress) {
      onPress();
    }
    // 광고 클릭 추적
    console.log("Ad clicked:", ad.headline);
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.adBadge}>
        <Text style={styles.adBadgeText}>광고</Text>
      </View>

      <View style={styles.content}>
        {ad.icon && <Image source={{ uri: ad.icon }} style={styles.icon} />}

        <View style={styles.textContent}>
          <Text style={styles.headline} numberOfLines={2}>
            {ad.headline}
          </Text>

          <Text style={styles.body} numberOfLines={2}>
            {ad.body}
          </Text>

          <View style={styles.footer}>
            <Text style={styles.advertiser}>{ad.advertiser}</Text>
            {ad.starRating && (
              <View style={styles.rating}>
                <Icon name="star" size={12} color={COLORS.warning} />
                <Text style={styles.ratingText}>{ad.starRating}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.ctaButton}>
          <Text style={styles.ctaText}>{ad.callToAction}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: SPACING.medium,
    marginVertical: SPACING.small,
    marginHorizontal: SPACING.medium,
    borderWidth: 1,
    borderColor: COLORS.border,
    // 그림자 강화
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
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
  },
  adBadgeText: {
    fontSize: 10,
    color: COLORS.white,
    fontWeight: "600",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: SPACING.medium,
  },
  textContent: {
    flex: 1,
    marginRight: SPACING.small,
  },
  headline: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  body: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 8,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
  },
  advertiser: {
    fontSize: 12,
    color: COLORS.gray,
  },
  rating: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: SPACING.small,
  },
  ratingText: {
    fontSize: 12,
    color: COLORS.gray,
    marginLeft: 2,
  },
  ctaButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  ctaText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },
});

export default NativeAdView;

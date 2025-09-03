import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  Platform,
} from "react-native";
import { COLORS, SPACING } from "../../utils/constants";
import Icon from "react-native-vector-icons/MaterialIcons";
import { NativeAd } from "../../utils/adConfig";

const { width: screenWidth } = Dimensions.get("window");

interface FeedNativeAdProps {
  ad: NativeAd;
  onPress?: () => void;
}

export const FeedNativeAd: React.FC<FeedNativeAdProps> = ({ ad, onPress }) => {
  const handlePress = () => {
    if (onPress) {
      onPress();
    }
    // 광고 클릭 추적
    console.log("Feed ad clicked:", ad.headline);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <View style={styles.header}>
        {ad.icon && (
          <Image source={{ uri: ad.icon }} style={styles.profileImage as any} />
        )}
        <View style={styles.headerText}>
          <Text style={styles.advertiserName}>{ad.advertiser}</Text>
          <View style={styles.sponsoredRow}>
            <Text style={styles.sponsoredText}>Sponsored</Text>
            <Icon name="public" size={12} color={COLORS.gray} />
          </View>
        </View>
        <View style={styles.adBadge}>
          <Text style={styles.adBadgeText}>광고</Text>
        </View>
      </View>

      {ad.images && ad.images[0] && (
        <Image
          source={{ uri: ad.images[0] }}
          style={styles.mainImage as any}
          resizeMode="cover"
        />
      )}

      <View style={styles.content}>
        <Text style={styles.headline}>{ad.headline}</Text>
        <Text style={styles.body}>{ad.body}</Text>

        <TouchableOpacity style={styles.ctaButton} onPress={handlePress}>
          <Text style={styles.ctaText}>{ad.callToAction}</Text>
          <Icon name="arrow-forward" size={16} color={COLORS.white} />
        </TouchableOpacity>

        {(ad.starRating || ad.price) && (
          <View style={styles.footer}>
            {ad.starRating && (
              <View style={styles.rating}>
                <Icon name="star" size={14} color={COLORS.warning} />
                <Text style={styles.ratingText}>{ad.starRating}</Text>
              </View>
            )}
            {ad.price && <Text style={styles.price}>{ad.price}</Text>}
            {ad.store && <Text style={styles.store}>· {ad.store}</Text>}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    marginVertical: SPACING.small,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: SPACING.medium,
  },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: SPACING.small,
  },
  headerText: {
    flex: 1,
  },
  advertiserName: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text.primary,
  },
  sponsoredRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  sponsoredText: {
    fontSize: 12,
    color: COLORS.gray,
    marginRight: 4,
  },
  adBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  adBadgeText: {
    fontSize: 11,
    color: COLORS.white,
    fontWeight: "600",
  },
  mainImage: {
    width: screenWidth,
    height: screenWidth * 0.75,
    backgroundColor: COLORS.lightGray,
  },
  content: {
    padding: SPACING.medium,
  },
  headline: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text.primary,
    marginBottom: SPACING.small,
  },
  body: {
    fontSize: 15,
    color: COLORS.gray,
    lineHeight: 22,
    marginBottom: SPACING.medium,
  },
  ctaButton: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: SPACING.small,
  },
  ctaText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rating: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: SPACING.small,
  },
  ratingText: {
    fontSize: 13,
    color: COLORS.gray,
    marginLeft: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text.primary,
    marginRight: SPACING.small,
  },
  store: {
    fontSize: 13,
    color: COLORS.gray,
  },
});

export default FeedNativeAd;

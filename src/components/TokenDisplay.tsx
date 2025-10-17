import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { SafeIcon } from "../utils/SafeIcon";
import { useAppTheme } from "../hooks/useAppTheme";
import { useAppSelector } from "../hooks/redux";
import {
  selectCurrentTokens,
  selectSubscriptionPlan,
} from "../store/slices/userSlice";
import { SPACING } from "../utils/constants";
import { useTranslation } from "react-i18next";

interface TokenDisplayProps {
  size?: "small" | "medium" | "large";
  showAddButton?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const TokenDisplay: React.FC<TokenDisplayProps> = ({
  size = "medium",
  showAddButton = true,
  onPress,
  style,
  textStyle,
}) => {
  const { colors } = useAppTheme();
  const currentTokens = useAppSelector(selectCurrentTokens);
  const subscriptionPlan = useAppSelector(selectSubscriptionPlan);
  const { t } = useTranslation();

  // 표시 텍스트 결정
  const getDisplayText = () => {
    if (subscriptionPlan === "pro") {
      return t("tokens.unlimited");
    }

    // 무료 플랜은 현재 토큰만 표시
    return `${currentTokens}`;
  };

  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return {
          container: {
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 16,
          },
          icon: { size: 16 },
          text: { fontSize: 14 },
          gap: 3,
        };
      case "large":
        return {
          container: {
            paddingHorizontal: 18,
            paddingVertical: 10,
            borderRadius: 24,
          },
          icon: { size: 20 },
          text: { fontSize: 18 },
          gap: 6,
        };
      default: // medium
        return {
          container: {
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 20,
          },
          icon: { size: 18 },
          text: { fontSize: 16 },
          gap: 4,
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const styles = createStyles(colors);

  return (
    <TouchableOpacity
      style={[styles.container, sizeStyles.container, style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <SafeIcon name="flash" size={sizeStyles.icon.size} color={colors.white} />
      <Text
        style={[
          styles.tokenText,
          { fontSize: sizeStyles.text.fontSize },
          textStyle,
        ]}
      >
        {getDisplayText()}
      </Text>
      {showAddButton && onPress && (
        <Icon
          name="add-circle-outline"
          size={sizeStyles.icon.size + 2}
          color={colors.white}
          style={{ marginLeft: sizeStyles.gap }}
        />
      )}
    </TouchableOpacity>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(255,255,255,0.25)",
      gap: 4,
    },
    tokenText: {
      color: colors.white,
      fontWeight: "700",
    },
  });

export default TokenDisplay;

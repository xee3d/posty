import React, { useEffect, useState, memo } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useAppTheme } from "../hooks/useAppTheme";
import { useTranslation } from "react-i18next";

interface AppLogoProps {
  size?: number;
  showText?: boolean;
  variant?: "primary" | "white";
  useAppIcon?: boolean; // 새로운 prop: 실제 앱 아이콘 이미지 사용 여부
  onPress?: () => void; // 개발자 모드용 onPress 추가
}

// 이미지 컴포넌트를 메모이제이션하여 불필요한 리렌더링 방지
const MemoizedAppIcon = memo(({ size }: { size: number }) => (
  <View style={[styles.imageContainer, { width: size, height: size }]}>
    <Image
      source={require("../assets/images/app_icon.png")}
      style={[styles.appIconImage, { width: size, height: size }]}
      resizeMode="contain"
    />
  </View>
));

// 타이핑 텍스트 컴포넌트를 메모이제이션
const MemoizedTypingText = memo(({ 
  displayedText, 
  isWhite 
}: { 
  displayedText: string; 
  isWhite: boolean; 
}) => (
  <Text style={[styles.tagline, isWhite && styles.whiteTagline]}>
    {displayedText}
  </Text>
));

const AppLogo: React.FC<AppLogoProps> = ({
  size = 100,
  showText = false,
  variant = "primary",
  useAppIcon = false,
  onPress
}) => {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const isWhite = variant === "white";
  const [displayedText, setDisplayedText] = useState("");
  const fullText = t("app.slogan");

  useEffect(() => {
    if (showText && useAppIcon) {
      // 타이핑 애니메이션 대신 즉시 전체 텍스트 표시
      setDisplayedText(fullText);
    }
  }, [showText, useAppIcon, fullText]);

  const LogoContent = () => (
    <>
      {useAppIcon ? (
        // 메모이제이션된 앱 아이콘 이미지 사용
        <MemoizedAppIcon size={size} />
      ) : isWhite ? (
        <View
          style={[
            styles.logoBox,
            { width: size, height: size },
            styles.whiteLogoBox,
          ]}
        >
          <Text
            style={[
              styles.logoText,
              { fontSize: size * 0.5, color: colors.primary },
            ]}
          >
            P
          </Text>
        </View>
      ) : (
        <LinearGradient
          colors={["#7C3AED", "#9333EA"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.logoBox, { width: size, height: size }]}
        >
          <Text style={[styles.logoText, { fontSize: size * 0.5 }]}>P</Text>
        </LinearGradient>
      )}

      {showText && (
        <View style={styles.textContainer}>
          {!useAppIcon && (
            <Text style={[styles.appName, isWhite && styles.whiteAppName]}>
              Posty
            </Text>
          )}
          {useAppIcon ? (
            <MemoizedTypingText displayedText={displayedText} isWhite={isWhite} />
          ) : (
            <Text style={[styles.tagline, isWhite && styles.whiteTagline]}>
              {t("app.slogan")}
            </Text>
          )}
        </View>
      )}
    </>
  );

  return (
    <View style={styles.container}>
      {onPress ? (
        <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
          <LogoContent />
        </TouchableOpacity>
      ) : (
        <LogoContent />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  logoBox: {
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  imageContainer: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    shadowColor: "#D4A574", // 황금색 그림자
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  appIconImage: {
    borderRadius: 20,
  },
  whiteLogoBox: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    shadowColor: "#000",
    shadowOpacity: 0.15,
  },
  logoText: {
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -2,
  },
  whiteLogoText: {
    color: "#7C3AED",
  },
  textContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  appName: {
    fontSize: 36,
    fontWeight: "800",
    color: "#7C3AED",
    letterSpacing: -1,
    marginBottom: 4,
  },
  whiteAppName: {
    color: "#FFFFFF",
  },
  tagline: {
    fontSize: 20,
    fontWeight: "600",
    color: "#D4A574", // 황금색으로 변경
    letterSpacing: -0.3,
  },
  whiteTagline: {
    color: "#D4A574", // 황금색 유지
  },
});

export default AppLogo;

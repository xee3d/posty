import React, { useMemo, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
} from "react-native-reanimated";
import Icon from "react-native-vector-icons/Ionicons";
import MaterialIcon from "react-native-vector-icons/MaterialIcons";
import { COLORS, FONTS, SPACING } from "../utils/constants";
import { useAppTheme } from "../hooks/useAppTheme";
import { useTranslation } from "react-i18next";

const { width } = Dimensions.get("window");
const TAB_WIDTH = width / 5;

interface TabNavigatorProps {
  activeTab: string;
  onTabPress: (tab: string) => void;
}

interface TabConfig {
  key: string;
  icon: string;
  activeIcon: string;
  label: string;
  isMaterial?: boolean;
}

const TabNavigator: React.FC<TabNavigatorProps> = ({
  activeTab,
  onTabPress,
}) => {
  const { colors } = useAppTheme();
  const { t } = useTranslation();

  const tabs: TabConfig[] = [
    { key: "home", icon: "home-outline", activeIcon: "home", label: t("navigation.home") },
    {
      key: "ai-write",
      icon: "create-outline",
      activeIcon: "create",
      label: t("navigation.write"),
    },
    {
      key: "trend",
      icon: "trending-up-outline",
      activeIcon: "trending-up",
      label: t("navigation.trend"),
    },
    {
      key: "my-style",
      icon: "palette",
      activeIcon: "palette",
      label: t("navigation.myStyle"),
      isMaterial: true,
    },
    {
      key: "settings",
      icon: "settings-outline",
      activeIcon: "settings",
      label: t("navigation.settings"),
    },
  ];

  // Shared value for indicator animation
  const indicatorPosition = useSharedValue(0);
  const indicatorWidth = useSharedValue(TAB_WIDTH);

  // 탭별 개별 애니메이션 값 - Hook Rules 준수
  const tabScales = {
    home: useSharedValue(1),
    'ai-write': useSharedValue(1),
    trend: useSharedValue(1),
    'my-style': useSharedValue(1),
    settings: useSharedValue(1),
  };

  const tabOpacities = {
    home: useSharedValue(activeTab === 'home' ? 1 : 0.7),
    'ai-write': useSharedValue(activeTab === 'ai-write' ? 1 : 0.7),
    trend: useSharedValue(activeTab === 'trend' ? 1 : 0.7),
    'my-style': useSharedValue(activeTab === 'my-style' ? 1 : 0.7),
    settings: useSharedValue(activeTab === 'settings' ? 1 : 0.7),
  };

  // Update indicator position with smooth animation
  useEffect(() => {
    const tabIndex = tabs.findIndex((tab) => tab.key === activeTab);

    // 부드러운 spring 애니메이션
    indicatorPosition.value = withSpring(tabIndex * TAB_WIDTH, {
      damping: 20,
      stiffness: 200,
      mass: 0.8,
    });

    // 탭별 투명도 애니메이션
    tabs.forEach((tab) => {
      const isActive = tab.key === activeTab;
      tabOpacities[tab.key].value = withTiming(isActive ? 1 : 0.7, {
        duration: 200,
        easing: Easing.out(Easing.quad),
      });
    });
  }, [activeTab, tabs]);

  // Animated style for indicator
  const indicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: indicatorPosition.value }],
      width: indicatorWidth.value,
    };
  });

  const handleTabPress = (tabKey: string) => {
    // 탭 누름 애니메이션 - 스케일과 바운스 효과
    const tabScale = tabScales[tabKey];
    
    tabScale.value = withSpring(0.9, {
      damping: 15,
      stiffness: 400,
      mass: 0.5,
    }, () => {
      tabScale.value = withSpring(1, {
        damping: 12,
        stiffness: 300,
        mass: 0.7,
      });
    });

    onTabPress(tabKey);
  };

  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.indicator, indicatorStyle]} />
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        const IconComponent = tab.isMaterial ? MaterialIcon : Icon;
        const iconName = isActive ? tab.activeIcon : tab.icon;

        // 탭별 개별 애니메이션 스타일
        const tabAnimatedStyle = useAnimatedStyle(() => {
          return {
            transform: [{ scale: tabScales[tab.key].value }],
            opacity: tabOpacities[tab.key].value,
          };
        });

        // 아이콘 애니메이션 (활성 상태일 때 약간 커짐)
        const iconAnimatedStyle = useAnimatedStyle(() => {
          return {
            transform: [{ scale: isActive ? withSpring(1.1, { damping: 15, stiffness: 300 }) : 1 }],
          };
        });

        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => handleTabPress(tab.key)}
            activeOpacity={1}
          >
            <Animated.View style={tabAnimatedStyle}>
              <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
                <IconComponent
                  name={iconName}
                  size={24}
                  color={isActive ? colors.primary : colors.text.tertiary}
                />
              </Animated.View>
              <Text
                style={[
                  styles.tabText,
                  { color: isActive ? colors.primary : colors.text.tertiary },
                  isActive && styles.tabTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </Animated.View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const createStyles = (colors: typeof COLORS) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      backgroundColor: colors.surface || "#FFFFFF", // 기본 배경색 추가
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingBottom: 20,
      paddingTop: 8,
      elevation: 8,
      shadowColor: colors.background === "#000000" ? "#FFFFFF" : "#000000",
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: colors.background === "#000000" ? 0.15 : 0.1,
      shadowRadius: 4,
    },
    tab: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 8,
      minHeight: 56,
    },
    iconContainer: {
      alignItems: "center",
      justifyContent: "center",
      width: 32,
      height: 32,
      marginBottom: 2,
    },
    iconContainerActive: {
      // 활성 상태는 애니메이션으로 처리
    },
    tabText: {
      fontSize: 10,
      textAlign: "center",
      lineHeight: 12,
      opacity: 0.7,
    },
    tabTextActive: {
      fontWeight: "600",
      opacity: 1,
    },
    indicator: {
      position: "absolute",
      bottom: 0,
      left: 0,
      width: TAB_WIDTH,
      height: 3,
      backgroundColor: colors.primary,
      borderTopLeftRadius: 3,
      borderTopRightRadius: 3,
    },
  });

export default TabNavigator;

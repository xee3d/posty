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

  const tabs: TabConfig[] = [
    { key: "home", icon: "home-outline", activeIcon: "home", label: "홈" },
    {
      key: "ai-write",
      icon: "create-outline",
      activeIcon: "create",
      label: "글쓰기",
    },
    {
      key: "trend",
      icon: "trending-up-outline",
      activeIcon: "trending-up",
      label: "트렌드",
    },
    {
      key: "my-style",
      icon: "palette",
      activeIcon: "palette",
      label: "내 스타일",
      isMaterial: true,
    },
    {
      key: "settings",
      icon: "settings-outline",
      activeIcon: "settings",
      label: "설정",
    },
  ];

  // Shared value for indicator animation
  const indicatorPosition = useSharedValue(0);
  const indicatorWidth = useSharedValue(TAB_WIDTH);

  // 단일 공유 값으로 탭 애니메이션 최적화
  const tabScale = useSharedValue(1);
  const animatingTab = useSharedValue("");

  // Update indicator position with smooth animation
  useEffect(() => {
    const tabIndex = tabs.findIndex((tab) => tab.key === activeTab);

    // 최적화된 timing 애니메이션으로 깜빡거림 방지
    indicatorPosition.value = withTiming(tabIndex * TAB_WIDTH, {
      duration: 250,
      easing: Easing.bezier(0.25, 0.46, 0.45, 0.94), // easeOutQuad
    });
  }, [activeTab]);

  // Animated style for indicator
  const indicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: indicatorPosition.value }],
      width: indicatorWidth.value,
    };
  });

  const handleTabPress = (tabKey: string) => {
    console.log("[TabNavigator] Tab pressed:", tabKey);
    // 간단하고 부드러운 탭 애니메이션
    if (activeTab !== tabKey) {
      animatingTab.value = tabKey;
      tabScale.value = withTiming(
        0.95,
        {
          duration: 100,
          easing: Easing.out(Easing.quad),
        },
        () => {
          tabScale.value = withTiming(1, {
            duration: 150,
            easing: Easing.out(Easing.quad),
          });
        }
      );
    }

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

        // 최적화된 단일 스케일 애니메이션
        const tabAnimatedStyle = useAnimatedStyle(() => {
          const isAnimating = animatingTab.value === tab.key;
          return {
            transform: [{ scale: isAnimating ? tabScale.value : 1 }],
          };
        });

        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => handleTabPress(tab.key)}
            activeOpacity={0.8}
          >
            <Animated.View style={tabAnimatedStyle}>
              <View
                style={[
                  styles.iconContainer,
                  isActive && styles.iconContainerActive,
                ]}
              >
                <IconComponent
                  name={iconName}
                  size={24}
                  color={isActive ? colors.primary : colors.text.tertiary}
                />
              </View>
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
      paddingVertical: SPACING.sm,
    },
    iconContainer: {
      transform: [{ scale: 1 }],
      opacity: 0.7,
    },
    iconContainerActive: {
      transform: [{ scale: 1.1 }],
      opacity: 1,
    },
    tabText: {
      fontSize: 11,
      marginTop: 4,
    },
    tabTextActive: {
      fontWeight: "600",
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

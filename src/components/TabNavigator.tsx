import React, { useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, FONTS, SPACING } from '../utils/constants';
import { useAppTheme } from '../hooks/useAppTheme';

const { width } = Dimensions.get('window');
const TAB_WIDTH = width / 4;

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

const TabNavigator: React.FC<TabNavigatorProps> = ({ activeTab, onTabPress }) => {
  const { colors } = useAppTheme();
  
  // Shared value for indicator animation
  const indicatorPosition = useSharedValue(0);
  const indicatorWidth = useSharedValue(TAB_WIDTH);

  const tabs: TabConfig[] = useMemo(() => [
    { key: 'home', icon: 'home-outline', activeIcon: 'home', label: '홈' },
    { key: 'ai-write', icon: 'create-outline', activeIcon: 'create', label: '글쓰기' },
    { key: 'my-style', icon: 'palette', activeIcon: 'palette', label: '내 스타일', isMaterial: true },
    { key: 'settings', icon: 'settings-outline', activeIcon: 'settings', label: '설정' },
  ], []);

  // Update indicator position with smooth animation
  useEffect(() => {
    const tabIndex = tabs.findIndex(tab => tab.key === activeTab);
    
    // 빠르고 부드러운 스프링 애니메이션
    indicatorPosition.value = withSpring(tabIndex * TAB_WIDTH, {
      damping: 20,
      stiffness: 300,
      mass: 0.8,
      overshootClamping: true,
      restDisplacementThreshold: 0.01,
      restSpeedThreshold: 0.01,
    });
  }, [activeTab, tabs, indicatorPosition]);

  // Animated style for indicator
  const indicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: indicatorPosition.value }],
      width: indicatorWidth.value,
    };
  });

  const handleTabPress = (tabKey: string) => {
    if (activeTab === tabKey) return;
    
    // 인디케이터 너비 애니메이션 (선택적)
    indicatorWidth.value = withTiming(TAB_WIDTH * 0.8, { duration: 100 }, () => {
      indicatorWidth.value = withSpring(TAB_WIDTH, {
        damping: 15,
        stiffness: 200,
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

        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => handleTabPress(tab.key)}
            activeOpacity={0.6}
          >
            <View style={[styles.iconContainer, isActive && styles.iconContainerActive]}>
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
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const createStyles = (colors: typeof COLORS) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingBottom: 20,
      paddingTop: 8,
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
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
      fontWeight: '600',
    },
    indicator: {
      position: 'absolute',
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
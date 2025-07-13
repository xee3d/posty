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
  interpolate,
  Extrapolation,
  runOnUI,
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

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const TabNavigator: React.FC<TabNavigatorProps> = ({ activeTab, onTabPress }) => {
  const { colors } = useAppTheme();
  
  // Shared values for animations
  const indicatorPosition = useSharedValue(0);
  const scaleValues = {
    home: useSharedValue(activeTab === 'home' ? 1 : 0.9),
    'ai-write': useSharedValue(activeTab === 'ai-write' ? 1 : 0.9),
    'my-style': useSharedValue(activeTab === 'my-style' ? 1 : 0.9),
    settings: useSharedValue(activeTab === 'settings' ? 1 : 0.9),
  };
  const translateYValues = {
    home: useSharedValue(0),
    'ai-write': useSharedValue(activeTab === 'ai-write' ? -10 : 0),
    'my-style': useSharedValue(0),
    settings: useSharedValue(0),
  };

  const tabs: TabConfig[] = useMemo(() => [
    { key: 'home', icon: 'home-outline', activeIcon: 'home', label: '홈' },
    { key: 'ai-write', icon: 'create-outline', activeIcon: 'create', label: '글쓰기' },
    { key: 'my-style', icon: 'palette', activeIcon: 'palette', label: '내 스타일', isMaterial: true },
    { key: 'settings', icon: 'settings-outline', activeIcon: 'settings', label: '설정' },
  ], []);

  // Update animations when active tab changes
  useEffect(() => {
    const tabIndex = tabs.findIndex(tab => tab.key === activeTab);
    indicatorPosition.value = withSpring(tabIndex * TAB_WIDTH, {
      damping: 15,
      stiffness: 120,
    });

    // Update scale and translateY for all tabs
    tabs.forEach((tab) => {
      const isActive = activeTab === tab.key;
      scaleValues[tab.key].value = withSpring(isActive ? 1 : 0.9, {
        damping: 15,
        stiffness: 150,
      });

      if (tab.key === 'ai-write') {
        translateYValues[tab.key].value = withSpring(isActive ? -10 : 0, {
          damping: 15,
          stiffness: 150,
        });
      }
    });
  }, [activeTab, tabs, indicatorPosition, scaleValues, translateYValues]);

  // Animated style for indicator
  const indicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: indicatorPosition.value }],
    };
  });

  // Create animated styles for each tab
  const createTabAnimatedStyle = (tabKey: string) => {
    return useAnimatedStyle(() => {
      const scale = scaleValues[tabKey].value;
      const translateY = translateYValues[tabKey].value;
      const isActive = activeTab === tabKey;
      const opacity = interpolate(
        scale,
        [0.9, 1],
        [0.7, 1],
        Extrapolation.CLAMP
      );

      return {
        transform: [
          { scale },
          { translateY },
        ],
        opacity: isActive ? 1 : opacity,
      };
    });
  };

  const handleTabPress = (tabKey: string) => {
    'worklet';
    // Animate scale for pressed tab
    runOnUI(() => {
      scaleValues[tabKey].value = withSpring(0.85, {
        damping: 10,
        stiffness: 200,
      }, () => {
        scaleValues[tabKey].value = withSpring(1, {
          damping: 15,
          stiffness: 150,
        });
      });
    })();

    onTabPress(tabKey);
  };

  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.indicator, indicatorStyle]} />
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        const animatedStyle = createTabAnimatedStyle(tab.key);
        const IconComponent = tab.isMaterial ? MaterialIcon : Icon;
        const iconName = isActive ? tab.activeIcon : tab.icon;

        return (
          <AnimatedTouchable
            key={tab.key}
            style={[styles.tab]}
            onPress={() => handleTabPress(tab.key)}
            activeOpacity={0.8}
          >
            <Animated.View style={animatedStyle}>
              {tab.key === 'ai-write' && isActive ? (
                <View style={styles.aiWriteActiveIcon}>
                  <Icon 
                    name="create" 
                    size={24} 
                    color="#FFFFFF" 
                  />
                </View>
              ) : (
                <IconComponent
                  name={iconName}
                  size={24}
                  color={isActive ? colors.primary : colors.text.tertiary}
                />
              )}
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
          </AnimatedTouchable>
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
    aiWriteActiveIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
  });

export default TabNavigator;
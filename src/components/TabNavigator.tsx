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

const TabNavigator: React.FC<TabNavigatorProps> = ({ activeTab, onTabPress }) => {
  const { colors } = useAppTheme();
  
  const tabs: TabConfig[] = [
    { key: 'home', icon: 'home-outline', activeIcon: 'home', label: '홈' },
    { key: 'ai-write', icon: 'create-outline', activeIcon: 'create', label: '글쓰기' },
    { key: 'trend', icon: 'trending-up-outline', activeIcon: 'trending-up', label: '트렌드' },
    { key: 'my-style', icon: 'palette', activeIcon: 'palette', label: '내 스타일', isMaterial: true },
    { key: 'settings', icon: 'settings-outline', activeIcon: 'settings', label: '설정' },
  ];
  
  // Shared value for indicator animation
  const indicatorPosition = useSharedValue(0);
  const indicatorWidth = useSharedValue(TAB_WIDTH);
  
  // Shared values for each tab's bounce animation - 각 탭별로 개별 생성
  const homeScaleX = useSharedValue(1);
  const homeScaleY = useSharedValue(1);
  const aiWriteScaleX = useSharedValue(1);
  const aiWriteScaleY = useSharedValue(1);
  const trendScaleX = useSharedValue(1);
  const trendScaleY = useSharedValue(1);
  const myStyleScaleX = useSharedValue(1);
  const myStyleScaleY = useSharedValue(1);
  const settingsScaleX = useSharedValue(1);
  const settingsScaleY = useSharedValue(1);
  
  // 탭별 애니메이션 값 매핑
  const tabScalesX = {
    'home': homeScaleX,
    'ai-write': aiWriteScaleX,
    'trend': trendScaleX,
    'my-style': myStyleScaleX,
    'settings': settingsScaleX,
  };
  
  const tabScalesY = {
    'home': homeScaleY,
    'ai-write': aiWriteScaleY,
    'trend': trendScaleY,
    'my-style': myStyleScaleY,
    'settings': settingsScaleY,
  };

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
    // 쫀득한 X축 스케일 애니메이션 (좌우로 줄어들기)
    tabScalesX[tabKey].value = withSpring(0.9, {
      damping: 18,
      stiffness: 350,
      mass: 0.7,
    }, () => {
      tabScalesX[tabKey].value = withSpring(1, {
        damping: 15,
        stiffness: 200,
        mass: 1,
      });
    });
    
    // 쫀득한 Y축 스케일 애니메이션 (위아래로 줄어들기)
    tabScalesY[tabKey].value = withSpring(0.8, {
      damping: 20,
      stiffness: 400,
      mass: 0.6,
    }, () => {
      tabScalesY[tabKey].value = withSpring(1.05, {
        damping: 18,
        stiffness: 250,
        mass: 0.8,
      }, () => {
        tabScalesY[tabKey].value = withSpring(1, {
          damping: 12,
          stiffness: 180,
          mass: 1,
        });
      });
    });
    
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

        // 각 탭의 X축/Y축 스케일 애니메이션 스타일
        const tabAnimatedStyle = useAnimatedStyle(() => ({
          transform: [
            { scaleX: tabScalesX[tab.key].value },
            { scaleY: tabScalesY[tab.key].value }
          ],
        }));

        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => handleTabPress(tab.key)}
            activeOpacity={0.8}
          >
            <Animated.View style={[tabAnimatedStyle]}>
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
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingBottom: 20,
      paddingTop: 8,
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: colors.background === '#000000' ? 0.3 : 0.1,
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
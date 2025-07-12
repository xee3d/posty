import React, { useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, FONTS, SPACING } from '../utils/constants';
import { useAppTheme } from '../hooks/useAppTheme';

interface TabNavigatorProps {
  activeTab: string;
  onTabPress: (tab: string) => void;
}

// 탭 설정을 컴포넌트 외부에 정의하여 재생성 방지
const TAB_CONFIG = [
  { key: 'home', label: '홈', icon: 'home-outline', activeIcon: 'home', isMaterial: false },
  { key: 'ai-write', label: '글쓰기', icon: 'create-outline', activeIcon: 'create', isMaterial: false },
  { key: 'my-style', label: '내 스타일', icon: 'palette', activeIcon: 'palette', isMaterial: true },
  { key: 'settings', label: '설정', icon: 'settings-outline', activeIcon: 'settings', isMaterial: false },
];

// 개별 탭 아이템 컴포넌트
interface TabItemProps {
  tab: typeof TAB_CONFIG[0];
  isActive: boolean;
  colors: any;
  onPress: () => void;
}

const TabItem: React.FC<TabItemProps> = ({ tab, isActive, colors, onPress }) => {
  const scale = useRef(new Animated.Value(isActive ? 1 : 0.9)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(isActive ? 1 : 0.7)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: isActive ? 1 : 0.9,
      damping: 15,
      stiffness: 150,
      useNativeDriver: true,
    }).start();

    if (tab.key === 'ai-write' && isActive) {
      Animated.spring(translateY, {
        toValue: -10,
        damping: 15,
        stiffness: 150,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(translateY, {
        toValue: 0,
        damping: 15,
        stiffness: 150,
        useNativeDriver: true,
      }).start();
    }

    Animated.timing(opacity, {
      toValue: isActive ? 1 : 0.7,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isActive, tab.key, scale, translateY, opacity]);

  const styles = createStyles(colors);
  const IconComponent = tab.isMaterial ? MaterialIcon : Icon;
  // 명시적으로 문자열로 변환하여 순환 참조 방지
  const iconName = String(isActive ? tab.activeIcon : tab.icon);

  return (
    <TouchableOpacity
      style={styles.tab}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Animated.View style={{
        transform: [
          { scale: scale },
          { translateY: translateY },
        ],
      }}>
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
      <Animated.Text style={[
        styles.tabLabel,
        isActive && styles.tabLabelActive,
        { opacity: opacity }
      ]}>
        {tab.label}
      </Animated.Text>
    </TouchableOpacity>
  );
};

const TabNavigator: React.FC<TabNavigatorProps> = ({ activeTab, onTabPress }) => {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      {TAB_CONFIG.map((tab) => (
        <TabItem
          key={tab.key}
          tab={tab}
          isActive={activeTab === tab.key}
          colors={colors}
          onPress={() => onTabPress(tab.key)}
        />
      ))}
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
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: SPACING.sm,
    },
    aiWriteActiveIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: -20,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    tabLabel: {
      fontSize: 11,
      color: colors.text.tertiary,
      marginTop: 4,
    },
    tabLabelActive: {
      color: colors.primary,
      fontWeight: '600',
    },
  });

export default TabNavigator;
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import AIWriteScreen from '../screens/AIWriteScreen';
import TrendScreen from '../screens/TrendScreen';
import MyStyleScreen from '../screens/MyStyleScreen';
import SettingsScreen from '../screens/SettingsScreen';

// Import constants
import { COLORS, FONTS, SPACING, BRAND } from '../utils/constants';

// Type definitions
export type RootStackParamList = {
  MainTabs: undefined;
  // Add modal screens here later
};

export type MainTabParamList = {
  Home: undefined;
  AIWrite: undefined;
  Trend: undefined;
  MyStyle: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

// Custom Tab Bar to match existing design
function CustomTabBar({ state, descriptors, navigation }: any) {
  return (
    <View style={styles.tabBarContainer}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const getTabIcon = (routeName: string) => {
          switch (routeName) {
            case 'Home':
              return { icon: 'home-outline', activeIcon: 'home', isMaterial: false };
            case 'AIWrite':
              return { icon: 'create-outline', activeIcon: 'create', isMaterial: false };
            case 'Trend':
              return { icon: 'trending-up', activeIcon: 'trending-up', isMaterial: false };
            case 'MyStyle':
              return { icon: 'palette', activeIcon: 'palette', isMaterial: true };
            case 'Settings':
              return { icon: 'settings-outline', activeIcon: 'settings', isMaterial: false };
            default:
              return { icon: 'home-outline', activeIcon: 'home', isMaterial: false };
          }
        };

        const getTabLabel = (routeName: string) => {
          switch (routeName) {
            case 'Home':
              return '홈';
            case 'AIWrite':
              return '글쓰기';
            case 'Trend':
              return '트렌드';
            case 'MyStyle':
              return '내 스타일';
            case 'Settings':
              return '설정';
            default:
              return routeName;
          }
        };

        const tabConfig = getTabIcon(route.name);
        const IconComponent = tabConfig.isMaterial ? MaterialIcon : Icon;
        const iconName = isFocused ? tabConfig.activeIcon : tabConfig.icon;

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.tab}
          >
            {route.name === 'AIWrite' && isFocused ? (
              <View style={styles.aiWriteActiveIcon}>
                <Icon name="create" size={24} color="#FFFFFF" />
              </View>
            ) : (
              <IconComponent
                name={iconName}
                size={24}
                color={isFocused ? COLORS.primary : COLORS.text.tertiary}
              />
            )}
            <Text style={[
              styles.tabLabel,
              isFocused && styles.tabLabelActive
            ]}>
              {getTabLabel(route.name)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// Main Tab Navigator with custom tab bar
function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.surface,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTitleStyle: {
          fontSize: FONTS.sizes.xl,
          fontWeight: FONTS.weights.bold as any,
          color: COLORS.text.primary,
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          headerTitle: BRAND.koreanName,
          headerRight: () => (
            <TouchableOpacity style={{ marginRight: SPACING.md }}>
              <Icon name="notifications-outline" size={24} color={COLORS.text.primary} />
            </TouchableOpacity>
          ),
        }}
      />
      <Tab.Screen 
        name="AIWrite" 
        component={AIWriteScreen}
        options={{
          headerTitle: 'AI 글쓰기',
        }}
      />
      <Tab.Screen 
        name="Trend" 
        component={TrendScreen}
        options={{
          headerTitle: '트렌드',
        }}
      />
      <Tab.Screen 
        name="MyStyle" 
        component={MyStyleScreen}
        options={{
          headerTitle: '내 스타일',
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          headerTitle: '설정',
        }}
      />
    </Tab.Navigator>
  );
}

// Root Navigator
export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen 
          name="MainTabs" 
          component={MainTabs}
        />
        {/* Add modal screens here later */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
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
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  tabLabel: {
    fontSize: 11,
    color: COLORS.text.tertiary,
    marginTop: 4,
  },
  tabLabelActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});

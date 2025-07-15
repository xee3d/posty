import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';

interface AppIconProps {
  size?: number;
  style?: ViewStyle;
}

export const AppIcon: React.FC<AppIconProps> = ({ size = 100, style }) => {
  const { colors } = useAppTheme();
  
  const scale = size / 100;
  
  return (
    <View style={[styles.logoWrapper, { 
      width: size * 1.2, 
      height: size * 1.2,
      backgroundColor: colors.primary + '15',
      shadowColor: colors.primary,
    }, style]}>
      <View style={[styles.logoInner, { 
        width: size * 0.9, 
        height: size * 0.9,
        backgroundColor: colors.primary,
      }]}>
        <Text style={[styles.logoText, { 
          fontSize: 48 * scale,
          color: colors.white 
        }]}>P</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  logoWrapper: {
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  logoInner: {
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontWeight: '800',
    letterSpacing: -2,
  },
});

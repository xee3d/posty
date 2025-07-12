import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { COLORS, SPACING } from '../../utils/constants';
import { useAppTheme } from '../../hooks/useAppTheme';

interface TokenBadgeProps {
  tokens: number;
  variant?: 'default' | 'primary' | 'minimal';
  showIcon?: boolean;
  onPress?: () => void;
}

export const TokenBadge: React.FC<TokenBadgeProps> = ({
  tokens,
  variant = 'default',
  showIcon = true,
  onPress,
}) => {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  
  const isUnlimited = tokens === 9999;
  const isEmpty = tokens === 0;
  
  const Container = onPress ? TouchableOpacity : View;
  
  return (
    <Container 
      style={[
        styles.container,
        variant === 'primary' && styles.containerPrimary,
        variant === 'minimal' && styles.containerMinimal,
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {showIcon && (
        <Icon 
          name="flash" 
          size={variant === 'minimal' ? 16 : 18} 
          color={isEmpty ? colors.error : (variant === 'primary' ? colors.white : colors.primary)} 
        />
      )}
      <Text style={[
        styles.text,
        variant === 'primary' && styles.textPrimary,
        isEmpty && styles.textEmpty,
      ]}>
        {isUnlimited ? '무제한' : tokens}
      </Text>
    </Container>
  );
};

const createStyles = (colors: typeof COLORS) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  containerPrimary: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  containerMinimal: {
    backgroundColor: 'transparent',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  textPrimary: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  textEmpty: {
    color: colors.error,
  },
});
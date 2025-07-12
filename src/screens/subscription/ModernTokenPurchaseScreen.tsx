import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import TokenPurchaseView from '../../components/TokenPurchaseView';
import inAppPurchaseService from '../../services/subscription/inAppPurchaseService';
import { useAppTheme } from '../../hooks/useAppTheme';

export const ModernTokenPurchaseScreen = () => {
  const { colors, isDark } = useAppTheme();

  const handlePurchase = async (packageId: string) => {
    try {
      await inAppPurchaseService.purchaseTokens(packageId);
    } catch (error) {
      console.error('Token purchase error:', error);
    }
  };

  return (
    <TokenPurchaseView 
      onPurchase={handlePurchase}
      colors={colors}
      isDark={isDark}
    />
  );
};

export default ModernTokenPurchaseScreen;

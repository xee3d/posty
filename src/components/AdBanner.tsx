import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { useAppTheme } from '../hooks/useAppTheme';
import { SPACING } from '../utils/constants';

interface AdBannerProps {
  style?: any;
  onAdLoaded?: () => void;
  onAdFailedToLoad?: (error: any) => void;
}

const AdBanner: React.FC<AdBannerProps> = ({ 
  style, 
  onAdLoaded, 
  onAdFailedToLoad 
}) => {
  const { colors, isDark } = useAppTheme();
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState(false);

  // 실제 광고 ID (운영 환경)
  const adUnitId = __DEV__
    ? TestIds.BANNER // 개발용 테스트 ID
    : 'ca-app-pub-4039842933564424/8287150443'; // Posty 하단 배너

  const handleAdLoaded = () => {
    setAdLoaded(true);
    setAdError(false);
    onAdLoaded?.();
  };

  const handleAdFailedToLoad = (error: any) => {
    console.log('Ad failed to load:', error);
    setAdError(true);
    setAdLoaded(false);
    onAdFailedToLoad?.(error);
  };

  return (
    <View style={[styles.container, style]}>
      {!adLoaded && !adError && (
        <View style={[styles.loadingContainer, { backgroundColor: isDark ? '#1F1F1F' : colors.surface }]}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
            광고 로딩 중...
          </Text>
        </View>
      )}
      
      {adError && (
        <View style={[styles.errorContainer, { backgroundColor: isDark ? '#1F1F1F' : colors.surface }]}>
          <Text style={[styles.errorText, { color: colors.text.secondary }]}>
            광고를 불러올 수 없습니다
          </Text>
        </View>
      )}

      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: false,
        }}
        onAdLoaded={handleAdLoaded}
        onAdFailedToLoad={handleAdFailedToLoad}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: 8,
    minHeight: 50,
  },
  loadingText: {
    marginLeft: SPACING.sm,
    fontSize: 12,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: 8,
    minHeight: 50,
  },
  errorText: {
    fontSize: 12,
    textAlign: 'center',
  },
});

export default AdBanner;

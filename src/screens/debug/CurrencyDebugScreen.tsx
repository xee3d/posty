import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { SPACING } from '../../utils/constants';
import { countryDetectionService } from '../../services/localization/pricingService';
import { GLOBAL_PRICING_DATA } from '../../services/localization/currencyPricingData';
import Icon from 'react-native-vector-icons/Ionicons';

interface CurrencyDebugScreenProps {
  navigation: any;
}

export const CurrencyDebugScreen: React.FC<CurrencyDebugScreenProps> = ({
  navigation,
}) => {
  const { colors, isDark } = useAppTheme();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>('');

  useEffect(() => {
    loadDebugInfo();
  }, []);

  const loadDebugInfo = async () => {
    try {
      const info = await countryDetectionService.getDebugInfo();
      setDebugInfo(info);
      setSelectedCountry(info.currentPricing.country);
    } catch (error) {
      console.error('Failed to load debug info:', error);
    }
  };

  const handleCountryChange = async (countryName: string) => {
    try {
      const success = countryDetectionService.setCountry(countryName);
      if (success) {
        setSelectedCountry(countryName);
        await loadDebugInfo();
        Alert.alert('성공', `국가가 ${countryName}로 변경되었습니다.`);
      } else {
        Alert.alert('오류', '해당 국가를 찾을 수 없습니다.');
      }
    } catch (error) {
      Alert.alert('오류', '국가 변경 중 오류가 발생했습니다.');
    }
  };

  const styles = createStyles(colors, isDark);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back-outline" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>통화 및 가격 디버그</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={loadDebugInfo}>
          <Icon name="refresh-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {debugInfo && (
          <>
            {/* 현재 감지된 정보 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>현재 감지된 정보</Text>
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>디바이스 국가:</Text>
                  <Text style={styles.infoValue}>{debugInfo.deviceLocale.country}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>국가 코드:</Text>
                  <Text style={styles.infoValue}>{debugInfo.deviceLocale.countryCode}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>언어:</Text>
                  <Text style={styles.infoValue}>{debugInfo.deviceLocale.language}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>통화:</Text>
                  <Text style={styles.infoValue}>{debugInfo.deviceLocale.currency}</Text>
                </View>
              </View>
            </View>

            {/* 현재 사용 중인 가격 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>현재 사용 중인 가격</Text>
              <View style={styles.priceCard}>
                <View style={styles.priceHeader}>
                  <Text style={styles.countryName}>{debugInfo.currentPricing.country}</Text>
                  <Text style={styles.currencyCode}>{debugInfo.currentPricing.currency}</Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Premium 가격:</Text>
                  <Text style={styles.priceValue}>
                    {countryDetectionService.formatPrice(
                      debugInfo.currentPricing.price,
                      debugInfo.currentPricing.currency
                    )}
                  </Text>
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>1년차 수익:</Text>
                  <Text style={styles.priceValue}>
                    {countryDetectionService.formatPrice(
                      debugInfo.currentPricing.firstYear,
                      debugInfo.currentPricing.currency
                    )}
                  </Text>
                </View>
              </View>
            </View>

            {/* 국가 선택 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>국가 변경 테스트</Text>
              <View style={styles.countryGrid}>
                {GLOBAL_PRICING_DATA.slice(0, 20).map((country, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.countryButton,
                      selectedCountry === country.country && styles.selectedCountryButton
                    ]}
                    onPress={() => handleCountryChange(country.country)}
                  >
                    <Text style={[
                      styles.countryButtonText,
                      selectedCountry === country.country && styles.selectedCountryButtonText
                    ]}>
                      {country.country}
                    </Text>
                    <Text style={styles.countryPrice}>
                      {countryDetectionService.formatPrice(country.price, country.currency)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 전체 국가 목록 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>전체 지원 국가 ({GLOBAL_PRICING_DATA.length}개)</Text>
              {GLOBAL_PRICING_DATA.map((country, index) => (
                <View key={index} style={styles.countryListItem}>
                  <View style={styles.countryInfo}>
                    <Text style={styles.countryListName}>{country.country}</Text>
                    <Text style={styles.countryListCurrency}>{country.currency}</Text>
                  </View>
                  <Text style={styles.countryListPrice}>
                    {countryDetectionService.formatPrice(country.price, country.currency)}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: SPACING.medium,
      paddingVertical: SPACING.medium,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text.primary,
    },
    refreshButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      flex: 1,
      padding: SPACING.large,
    },
    section: {
      marginBottom: SPACING.xl,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text.primary,
      marginBottom: SPACING.medium,
    },
    infoCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: SPACING.large,
      borderWidth: 1,
      borderColor: colors.border,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING.small,
    },
    infoLabel: {
      fontSize: 14,
      color: colors.text.secondary,
    },
    infoValue: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text.primary,
    },
    priceCard: {
      backgroundColor: colors.primary + '10',
      borderRadius: 12,
      padding: SPACING.large,
      borderWidth: 1,
      borderColor: colors.primary + '30',
    },
    priceHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING.medium,
    },
    countryName: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.primary,
    },
    currencyCode: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary,
      backgroundColor: colors.primary + '20',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    priceRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING.small,
    },
    priceLabel: {
      fontSize: 14,
      color: colors.text.secondary,
    },
    priceValue: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.primary,
    },
    countryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: SPACING.small,
    },
    countryButton: {
      backgroundColor: colors.surface,
      borderRadius: 8,
      padding: SPACING.small,
      borderWidth: 1,
      borderColor: colors.border,
      minWidth: 100,
    },
    selectedCountryButton: {
      backgroundColor: colors.primary + '20',
      borderColor: colors.primary,
    },
    countryButtonText: {
      fontSize: 12,
      color: colors.text.primary,
      textAlign: 'center',
      marginBottom: 2,
    },
    selectedCountryButtonText: {
      color: colors.primary,
      fontWeight: '600',
    },
    countryPrice: {
      fontSize: 10,
      color: colors.text.secondary,
      textAlign: 'center',
    },
    countryListItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.surface,
      padding: SPACING.medium,
      borderRadius: 8,
      marginBottom: SPACING.small,
      borderWidth: 1,
      borderColor: colors.border,
    },
    countryInfo: {
      flex: 1,
    },
    countryListName: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text.primary,
    },
    countryListCurrency: {
      fontSize: 12,
      color: colors.text.secondary,
    },
    countryListPrice: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.primary,
    },
    bottomSpace: {
      height: 40,
    },
  });

export default CurrencyDebugScreen;
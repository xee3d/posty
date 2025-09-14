import React from 'react';
import { ScrollView, Text, StyleSheet, SafeAreaView, View, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeIcon } from '../../utils/SafeIcon';
import { COLORS, SPACING, FONT_SIZES } from '../../utils/constants';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useNotionDocument } from '../../hooks/useNotionDocument';

interface PrivacyPolicyScreenJAProps {
  onBack: () => void;
  onNavigate?: (screen: string) => void;
}

const PrivacyPolicyScreen_JA: React.FC<PrivacyPolicyScreenJAProps> = ({
  onBack,
  onNavigate,
}) => {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const styles = createStyles(colors);
  
  const { document, loading, error, refresh, isNotionEnabled } = useNotionDocument('privacy-ja');

  const lastUpdated = "2024年1月1日";

  const renderNotionContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{t('documents.loadingDocument')}</Text>
        </View>
      );
    }

    if (error || !document) {
      return (
        <View style={styles.errorContainer}>
          <SafeIcon name="warning" size={48} color={colors.text.tertiary} />
          <Text style={styles.errorText}>
            {error || t('documents.documentLoadError')}
          </Text>
          <TouchableOpacity onPress={refresh} style={styles.retryButton}>
            <Text style={styles.retryText}>{t('documents.retry')}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const content = document.content.split('\n\n').map((paragraph, index) => {
      if (paragraph.startsWith('#')) {
        const level = paragraph.match(/^#+/)?.[0].length || 1;
        const text = paragraph.replace(/^#+\s*/, '');
        return (
          <Text 
            key={index} 
            style={level === 1 ? styles.sectionTitle : styles.subTitle}
          >
            {text}
          </Text>
        );
      } else if (paragraph.startsWith('•') || paragraph.startsWith('-')) {
        return (
          <Text key={index} style={styles.listItem}>
            {paragraph}
          </Text>
        );
      } else if (paragraph.trim()) {
        return (
          <Text key={index} style={styles.paragraph}>
            {paragraph}
          </Text>
        );
      }
      return null;
    }).filter(Boolean);

    return content;
  };

  const renderFallbackContent = () => (
    <>
      <Text style={styles.sectionTitle}>1. 収集する情報</Text>
      <Text style={styles.paragraph}>
        当社は、アカウントの作成、サービスの利用、サポートへのお問い合わせの際に
        お客様が直接提供する情報を収集します。
      </Text>
      
      <Text style={styles.sectionTitle}>2. 情報の使用方法</Text>
      <Text style={styles.paragraph}>
        収集した情報は、サービスの提供、維持、改善、取引の処理、
        お客様とのコミュニケーションのために使用します。
      </Text>
      
      <Text style={styles.sectionTitle}>3. 情報の共有</Text>
      <Text style={styles.paragraph}>
        このプライバシーポリシーに記載されている場合を除き、
        お客様の同意なしに個人情報を第三者に販売、取引、または譲渡することはありません。
      </Text>
      
      <Text style={styles.sectionTitle}>4. データセキュリティ</Text>
      <Text style={styles.paragraph}>
        お客様の個人情報を不正アクセス、変更、開示、破壊から保護するため、
        適切なセキュリティ対策を実装しています。
      </Text>
      
      <Text style={styles.sectionTitle}>5. お問い合わせ</Text>
      <Text style={styles.paragraph}>
        このプライバシーポリシーについてご質問がございましたら、
        support@posty.app までお問い合わせください。
      </Text>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <SafeIcon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {document?.title || 'プライバシーポリシー'}
        </Text>
        <View style={styles.headerRight}>
          {isNotionEnabled && (
            <TouchableOpacity onPress={refresh} style={styles.refreshButton}>
              <SafeIcon name="refresh" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            colors={[colors.primary]}
          />
        }
      >
        <Text style={styles.lastUpdated}>
          最終更新日: {document ? new Date(document.lastUpdated).toLocaleDateString('ja-JP') : lastUpdated}
        </Text>

        {isNotionEnabled && document ? (
          <View style={styles.notionBadge}>
            <SafeIcon name="cloud" size={16} color={colors.primary} />
            <Text style={styles.notionBadgeText}>Notionから同期</Text>
          </View>
        ) : null}

        {isNotionEnabled && document ? renderNotionContent() : renderFallbackContent()}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            このプライバシーポリシーは{document ? new Date(document.lastUpdated).toLocaleDateString('ja-JP') : lastUpdated}から施行されます。
          </Text>
          <Text style={styles.footerText}>
            プライバシーに関するお問い合わせ: getposty@gmail.com
          </Text>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: typeof COLORS) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.md,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      padding: SPACING.sm,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text.primary,
      flex: 1,
      textAlign: 'center',
    },
    headerRight: {
      width: 40,
      alignItems: 'flex-end',
    },
    refreshButton: {
      padding: SPACING.sm,
    },
    content: {
      flex: 1,
    },
    contentContainer: {
      paddingHorizontal: SPACING.lg,
      paddingTop: SPACING.lg,
    },
    lastUpdated: {
      fontSize: FONT_SIZES.small,
      color: colors.text.tertiary,
      marginBottom: SPACING.xl,
      textAlign: "center",
    },
    notionBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'center',
      backgroundColor: colors.primary + '20',
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.xs,
      borderRadius: 16,
      marginBottom: SPACING.lg,
    },
    notionBadgeText: {
      fontSize: FONT_SIZES.small,
      color: colors.primary,
      marginLeft: SPACING.xs,
    },
    loadingContainer: {
      alignItems: 'center',
      paddingVertical: SPACING.xl,
    },
    loadingText: {
      fontSize: FONT_SIZES.medium,
      color: colors.text.secondary,
      marginTop: SPACING.md,
    },
    errorContainer: {
      alignItems: 'center',
      paddingVertical: SPACING.xl,
    },
    errorText: {
      fontSize: FONT_SIZES.medium,
      color: colors.text.secondary,
      textAlign: 'center',
      marginVertical: SPACING.md,
    },
    retryButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.sm,
      borderRadius: 8,
      marginTop: SPACING.sm,
    },
    retryText: {
      color: colors.text.inverse,
      fontSize: FONT_SIZES.medium,
      fontWeight: '600',
    },
    section: {
      marginBottom: SPACING.xl,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text.primary,
      marginBottom: SPACING.md,
    },
    subTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text.primary,
      marginTop: SPACING.md,
      marginBottom: SPACING.sm,
    },
    paragraph: {
      fontSize: FONT_SIZES.medium,
      color: colors.text.secondary,
      lineHeight: 22,
      marginBottom: SPACING.sm,
    },
    listItem: {
      fontSize: FONT_SIZES.medium,
      color: colors.text.secondary,
      lineHeight: 22,
      marginBottom: SPACING.sm,
      paddingLeft: SPACING.md,
    },
    footer: {
      marginTop: SPACING.xxl,
      paddingTop: SPACING.xl,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      alignItems: "center",
    },
    footerText: {
      fontSize: FONT_SIZES.small,
      color: colors.text.tertiary,
      marginBottom: SPACING.sm,
      textAlign: "center",
    },
    bottomSpace: {
      height: SPACING.xxl,
    },
  });

export default PrivacyPolicyScreen_JA;
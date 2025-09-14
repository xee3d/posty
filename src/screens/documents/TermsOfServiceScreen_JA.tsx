import React from 'react';
import { ScrollView, Text, StyleSheet, SafeAreaView, View, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeIcon } from '../../utils/SafeIcon';
import { COLORS, SPACING, FONT_SIZES } from '../../utils/constants';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useNotionDocument } from '../../hooks/useNotionDocument';

interface TermsOfServiceScreenJAProps {
  onBack: () => void;
  onNavigate?: (screen: string) => void;
}

const TermsOfServiceScreen_JA: React.FC<TermsOfServiceScreenJAProps> = ({
  onBack,
  onNavigate,
}) => {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const styles = createStyles(colors);
  
  const { document, loading, error, refresh, isNotionEnabled } = useNotionDocument('terms-ja');

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
      <Text style={styles.sectionTitle}>1. 規約の承諾</Text>
      <Text style={styles.paragraph}>
        このサービスにアクセスし、利用することにより、本規約の条項と条件に拘束されることに同意するものとします。
      </Text>
      
      <Text style={styles.sectionTitle}>2. 利用許可</Text>
      <Text style={styles.paragraph}>
        個人的、非商用の一時的な閲覧のみを目的として、当サービスを一時的に利用することが許可されています。
      </Text>
      
      <Text style={styles.sectionTitle}>3. 免責事項</Text>
      <Text style={styles.paragraph}>
        当サービスの素材は「現状のまま」で提供されます。当社は明示的または黙示的な保証を行わず、
        他のすべての保証を否認します。
      </Text>
      
      <Text style={styles.sectionTitle}>4. 制限</Text>
      <Text style={styles.paragraph}>
        当社またはその供給者は、当サービスの使用または使用不能から生じるいかなる損害に対しても
        責任を負わないものとします。
      </Text>
      
      <Text style={styles.sectionTitle}>5. 変更</Text>
      <Text style={styles.paragraph}>
        当社は予告なしにいつでもこの利用規約を改訂することができます。当サービスを利用することにより、
        現在のバージョンの規約に拘束されることに同意するものとします。
      </Text>
      
      <Text style={styles.sectionTitle}>6. お問い合わせ</Text>
      <Text style={styles.paragraph}>
        この利用規約についてご質問がございましたら、support@posty.app までお問い合わせください。
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
          {document?.title || '利用規約'}
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
            本規約は{document ? new Date(document.lastUpdated).toLocaleDateString('ja-JP') : lastUpdated}から施行されます。
          </Text>
          <Text style={styles.footerText}>
            お問い合わせ: getposty@gmail.com
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

export default TermsOfServiceScreen_JA;
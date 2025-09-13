import React from "react";
import { useTranslation } from "react-i18next";
import PrivacyPolicyScreen_EN from "./PrivacyPolicyScreen_EN";
import PrivacyPolicyScreen_JA from "./PrivacyPolicyScreen_JA";
import PrivacyPolicyScreen_ZH from "./PrivacyPolicyScreen_ZH";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeIcon } from "../../utils/SafeIcon";
import {
  COLORS,
  SPACING,
  FONT_SIZES,
} from "../../utils/constants";
import { useAppTheme } from "../../hooks/useAppTheme";
import { useNotionDocument } from "../../hooks/useNotionDocument";

interface PrivacyPolicyScreenProps {
  onBack: () => void;
  onNavigate?: (screen: string) => void;
}

const PrivacyPolicyScreen: React.FC<PrivacyPolicyScreenProps> = ({
  onBack,
  onNavigate,
}) => {
  const { i18n } = useTranslation();
  
  // 현재 언어에 따라 적절한 컴포넌트 선택
  const currentLanguage = i18n.language;
  console.log('📍 Current language for Privacy:', currentLanguage);
  
  switch (currentLanguage) {
    case 'en':
      return <PrivacyPolicyScreen_EN onBack={onBack} onNavigate={onNavigate} />;
    case 'ja':
      return <PrivacyPolicyScreen_JA onBack={onBack} onNavigate={onNavigate} />;
    case 'zh':
    case 'zh-CN':
      return <PrivacyPolicyScreen_ZH onBack={onBack} onNavigate={onNavigate} />;
    case 'ko':
    default:
      // 한국어 또는 기본값은 기존 구현 유지
      return <KoreanPrivacyPolicyScreen onBack={onBack} onNavigate={onNavigate} />;
  }
};

// 한국어 버전을 위한 기존 구현
const KoreanPrivacyPolicyScreen: React.FC<PrivacyPolicyScreenProps> = ({
  onBack,
  onNavigate,
}) => {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const styles = createStyles(colors);
  
  const { document, loading, error, refresh, isNotionEnabled } = useNotionDocument('privacy');

  const lastUpdated = "2024년 1월 1일";

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
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. 개인정보의 처리 목적</Text>
        <Text style={styles.paragraph}>
          틴로봇스튜디오(Tinrobot Studio)(이하 "회사")는 다음의 목적을 위하여 개인정보를 처리합니다.
          처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며,
          이용 목적이 변경되는 경우에는 개인정보 보호법 제18조에 따라 별도의 동의를 받는 등
          필요한 조치를 이행할 예정입니다.
        </Text>
        <Text style={styles.listItem}>
          1. AI 기반 SNS 콘텐츠 생성 서비스 제공
        </Text>
        <Text style={styles.listItem}>
          2. 사용자 글쓰기 스타일 분석 및 개인화 서비스 제공
        </Text>
        <Text style={styles.listItem}>
          3. 서비스 이용 통계 분석 및 서비스 개선
        </Text>
        <Text style={styles.listItem}>
          4. 고객지원 서비스 제공
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. 개인정보의 처리 및 보유기간</Text>
        <Text style={styles.paragraph}>
          회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를
          수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.
        </Text>
        <Text style={styles.listItem}>
          1. 서비스 이용 기록: 서비스 탈퇴 시까지
        </Text>
        <Text style={styles.listItem}>
          2. 글쓰기 스타일 분석 데이터: 서비스 탈퇴 후 즉시 삭제
        </Text>
        <Text style={styles.listItem}>
          3. 고객지원 관련 기록: 처리 완료 후 1년
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>3. 처리하는 개인정보의 항목</Text>
        <Text style={styles.paragraph}>
          회사는 다음의 개인정보 항목을 처리하고 있습니다:
        </Text>
        <Text style={styles.listItem}>
          1. 필수항목: 서비스 이용 기록, 접속 로그, 기기정보
        </Text>
        <Text style={styles.listItem}>
          2. 선택항목: 사용자가 작성한 텍스트 콘텐츠(분석 목적)
        </Text>
        <Text style={styles.listItem}>
          3. 자동 수집 항목: IP주소, 쿠키, 서비스 이용 기록
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>4. 개인정보의 제3자 제공</Text>
        <Text style={styles.paragraph}>
          회사는 정보주체의 개인정보를 개인정보의 처리 목적에서 명시한 범위 내에서만
          처리하며, 정보주체의 동의, 법률의 특별한 규정 등 개인정보 보호법
          제17조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.
        </Text>
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <SafeIcon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {document?.title || t('documents.privacyPolicy')}
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
          {t('documents.lastUpdated')}: {document ? new Date(document.lastUpdated).toLocaleDateString('ko-KR') : lastUpdated}
        </Text>

        {isNotionEnabled && document ? (
          <View style={styles.notionBadge}>
            <SafeIcon name="cloud" size={16} color={colors.primary} />
            <Text style={styles.notionBadgeText}>{t('documents.syncedFromNotion')}</Text>
          </View>
        ) : null}

        {isNotionEnabled && document ? renderNotionContent() : renderFallbackContent()}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            본 개인정보처리방침은 {document ? new Date(document.lastUpdated).toLocaleDateString('ko-KR') : lastUpdated}부터 시행됩니다.
          </Text>
          <Text style={styles.footerText}>
            개인정보 관련 문의: getposty@gmail.com
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

export default PrivacyPolicyScreen;
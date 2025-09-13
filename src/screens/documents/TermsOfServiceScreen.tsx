import React from "react";
import { useTranslation } from "react-i18next";
import TermsOfServiceScreen_EN from "./TermsOfServiceScreen_EN";
import TermsOfServiceScreen_JA from "./TermsOfServiceScreen_JA";
import TermsOfServiceScreen_ZH from "./TermsOfServiceScreen_ZH";
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

interface TermsOfServiceScreenProps {
  onBack: () => void;
  onNavigate?: (screen: string) => void;
}

const TermsOfServiceScreen: React.FC<TermsOfServiceScreenProps> = ({
  onBack,
  onNavigate,
}) => {
  const { i18n } = useTranslation();
  
  // 현재 언어에 따라 적절한 컴포넌트 선택
  const currentLanguage = i18n.language;
  console.log('📍 Current language for Terms:', currentLanguage);
  
  switch (currentLanguage) {
    case 'en':
      return <TermsOfServiceScreen_EN onBack={onBack} onNavigate={onNavigate} />;
    case 'ja':
      return <TermsOfServiceScreen_JA onBack={onBack} onNavigate={onNavigate} />;
    case 'zh':
    case 'zh-CN':
      return <TermsOfServiceScreen_ZH onBack={onBack} onNavigate={onNavigate} />;
    case 'ko':
    default:
      // 한국어 또는 기본값은 기존 구현 유지
      return <KoreanTermsOfServiceScreen onBack={onBack} onNavigate={onNavigate} />;
  }
};

// 한국어 버전을 위한 기존 구현
const KoreanTermsOfServiceScreen: React.FC<TermsOfServiceScreenProps> = ({
  onBack,
  onNavigate,
}) => {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const styles = createStyles(colors);
  
  const { document, loading, error, refresh, isNotionEnabled } = useNotionDocument('terms');

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
        <Text style={styles.sectionTitle}>제1조 (목적)</Text>
        <Text style={styles.paragraph}>
          이 약관은 틴로봇스튜디오(Tinrobot Studio)(이하 "회사")가 제공하는 AI 기반 SNS 콘텐츠 생성
          서비스 "Posty"(이하 "서비스")의 이용조건 및 절차, 회사와 이용자의
          권리, 의무, 책임사항과 기타 필요한 사항을 규정함을 목적으로 합니다.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>제2조 (용어의 정의)</Text>
        <Text style={styles.paragraph}>
          이 약관에서 사용하는 용어의 정의는 다음과 같습니다:
        </Text>
        <Text style={styles.listItem}>
          1. "서비스"란 회사가 제공하는 AI 기반 SNS 콘텐츠 생성 및 관리 관련
          제반 서비스를 의미합니다.
        </Text>
        <Text style={styles.listItem}>
          2. "이용자"란 이 약관에 따라 회사가 제공하는 서비스를 이용하는 자를
          의미합니다.
        </Text>
        <Text style={styles.listItem}>
          3. "콘텐츠"란 이용자가 서비스를 통해 생성, 저장, 공유하는 모든
          형태의 정보를 의미합니다.
        </Text>
        <Text style={styles.listItem}>
          4. "AI 생성 콘텐츠"란 서비스의 인공지능 기능을 통해 생성된 텍스트,
          이미지 분석 결과 등을 의미합니다.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>제3조 (약관의 효력 및 변경)</Text>
        <Text style={styles.listItem}>
          1. 이 약관은 서비스를 이용하고자 하는 모든 이용자에게 그 효력이
          발생합니다.
        </Text>
        <Text style={styles.listItem}>
          2. 회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 이 약관을
          변경할 수 있으며, 변경된 약관은 서비스 내 공지사항을 통해
          공지합니다.
        </Text>
        <Text style={styles.listItem}>
          3. 이용자가 변경된 약관에 동의하지 않는 경우 서비스 이용을 중단하고
          탈퇴할 수 있습니다.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>제4조 (서비스의 제공)</Text>
        <Text style={styles.paragraph}>
          회사가 제공하는 서비스는 다음과 같습니다:
        </Text>
        <Text style={styles.listItem}>1. AI 기반 SNS 콘텐츠 생성 서비스</Text>
        <Text style={styles.listItem}>
          2. SNS 트렌드 분석 및 인사이트 제공
        </Text>
        <Text style={styles.listItem}>3. 사용자 글쓰기 스타일 분석</Text>
        <Text style={styles.listItem}>4. SNS 계정 연동 및 게시물 관리</Text>
        <Text style={styles.listItem}>
          5. 기타 회사가 추가로 개발하거나 제휴를 통해 제공하는 서비스
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
          {document?.title || t('documents.termsOfService')}
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
            본 약관은 {document ? new Date(document.lastUpdated).toLocaleDateString('ko-KR') : lastUpdated}부터 시행됩니다.
          </Text>
          <Text style={styles.footerText}>
            {t('documents.contactEmail')} getposty@gmail.com로 연락해주세요.
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

export default TermsOfServiceScreen;
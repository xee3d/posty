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
} from "react-native";
import { SafeIcon } from "../../utils/SafeIcon";
import {
  COLORS,
  SPACING,
  FONT_SIZES,
} from "../../utils/constants";
import { useAppTheme } from "../../hooks/useAppTheme";

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

  const lastUpdated = "2024년 1월 1일";

  // Notion 연동 제거 - 실제 컨텐츠를 직접 포함
  const staticContent = `# 서비스 이용약관

시행일: 2024년 1월 1일

법인명: 틴로봇스튜디오(Tinrobot Studio)

## 제1조 (목적)

본 약관은 틴로봇스튜디오(Tinrobot Studio)(이하 "회사"라 합니다)가 제공하는 AI 기반 SNS 콘텐츠 생성 서비스 "Posty"(이하 "서비스"라 합니다)의 이용조건 및 절차, 회사와 이용자의 권리, 의무, 책임사항 기타 필요한 사항을 규정함을 목적으로 합니다.

## 제2조 (용어의 정의)

본 약관에서 사용하는 용어의 정의는 다음과 같습니다:

**"서비스"**란 회사가 제공하는 AI 기반 SNS 콘텐츠 생성 및 관리에 관한 일체의 서비스를 의미합니다.

**"이용자"**란 본 약관에 따라 회사가 제공하는 서비스를 이용하는 자를 의미합니다.

**"콘텐츠"**란 이용자가 서비스를 통해 생성, 저장, 공유하는 모든 형태의 정보를 의미합니다.

**"AI 생성 콘텐츠"**란 서비스의 인공지능 기능을 통해 생성된 텍스트, 이미지 분석 결과 등을 의미합니다.

## 제3조 (약관의 효력 및 변경)

본 약관은 서비스를 이용하고자 하는 모든 이용자에 대하여 그 효력이 발생합니다.

회사는 필요한 경우 관련법령에 위반되지 않는 범위에서 본 약관을 변경할 수 있으며, 변경된 약관은 서비스 내 공지사항을 통하여 공지합니다.

이용자가 변경된 약관에 동의하지 않는 경우, 서비스 이용을 중단하고 탈퇴할 수 있습니다.

## 제4조 (서비스의 제공)

회사가 제공하는 서비스는 다음과 같습니다:

**AI 기반 SNS 콘텐츠 생성 서비스**

**SNS 트렌드 분석 및 인사이트 제공**

**사용자 작성 스타일 분석**

**SNS 계정 연동 및 게시글 관리**

**기타 회사가 추가로 개발하거나 제휴를 통해 제공하는 서비스**

## 제5조 (서비스 이용)

이용자는 회사가 정한 절차에 따라 서비스를 이용할 수 있습니다.

이용자는 서비스를 이용함에 있어서 관련법령을 준수하여야 합니다.

이용자는 타인의 권리를 침해하거나 공서양속에 반하는 내용의 콘텐츠를 생성하여서는 안됩니다.

## 제6조 (개인정보보호)

회사는 이용자의 개인정보를 보호하기 위하여 최선을 다합니다.

개인정보의 수집, 이용, 제공에 관한 사항은 회사의 개인정보처리방침에 따릅니다.

회사는 이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다.

## 제7조 (콘텐츠의 권리와 책임)

이용자가 생성한 콘텐츠의 저작권은 이용자에게 귀속됩니다.

AI가 생성한 콘텐츠는 이용자가 자유롭게 사용, 수정, 배포할 수 있습니다.

이용자는 자신이 생성한 콘텐츠에 대해 모든 책임을 집니다.

회사는 서비스 개선을 위해 이용자의 콘텐츠를 분석할 수 있으나, 이는 익명화된 형태로만 사용됩니다.

## 제8조 (서비스 이용 제한)

회사는 다음의 경우 서비스 이용을 제한할 수 있습니다:

본 약관을 위반한 경우

타인의 권리를 침해하는 콘텐츠를 생성한 경우

서비스의 정상적인 운영을 방해한 경우

기타 관련법령을 위반한 경우

## 제9조 (면책사항)

회사는 천재지변, 전쟁 등 불가항력으로 인한 서비스 중단에 대해 책임을 지지 않습니다.

회사는 이용자가 서비스를 통해 얻은 정보나 자료의 정확성에 대해 보장하지 않습니다.

회사는 이용자 상호간 또는 이용자와 제3자간의 분쟁에 관여하지 않습니다.

## 제10조 (준거법 및 관할법원)

본 약관은 대한민국 법령에 의하여 규율되고 해석됩니다.

서비스 이용에 관하여 발생한 분쟁은 회사의 본사 소재지를 관할하는 법원을 전속관할법원으로 합니다.

• --

연락처: getposty@gmail.com

개인정보보호책임자: getposty@gmail.com

## 제12조 (인공지능 기술 사용)

1. **AI 기술 활용**

   - 본 서비스는 OpenAI의 GPT 모델을 기반으로 한 인공지능 기술을 사용하여 다음과 같은 서비스를 제공합니다:

     * 콘텐츠 자동 생성

     * 텍스트 개선 및 윤색

     * 사진 기반 콘텐츠 생성

     * 맞춤형 글쓰기 추천

2. **AI 생성 콘텐츠의 특성**

   - AI가 생성한 콘텐츠의 정확성, 적절성, 완전성, 저작권 침해 여부에 대해서는 보장하지 않습니다.

   - 사용자는 AI 생성 콘텐츠를 참고용으로만 사용하며, 최종 사용 전 내용을 검토하고 책임져야 합니다.

   - AI 생성 콘텐츠가 제3자의 권리를 침해하거나 부적절한 내용을 포함할 가능성이 있음을 인지하고 사용해야 합니다.

3. **데이터 처리**

   - 사용자가 입력한 텍스트, 사진 등의 데이터는 AI 서비스 제공을 위해 외부 AI 서비스 제공업체(OpenAI 등)에 전송될 수 있습니다.

   - 전송되는 데이터는 서비스 제공 목적으로만 사용되며, 개인정보보호정책에 따라 처리됩니다.

4. **서비스 변경**

   - 회사는 AI 모델의 업데이트, 변경, 또는 서비스 개선을 위해 사전 고지 후 AI 기능을 수정할 수 있습니다.

   - AI 기술의 발전에 따라 새로운 기능이 추가되거나 기존 기능이 변경될 수 있습니다.

5. **면책사항**

   - 회사는 AI 생성 콘텐츠로 인해 발생하는 직간접적 손해에 대해 책임지지 않습니다.

   - 사용자는 AI 생성 콘텐츠 사용으로 인한 모든 법적 책임을 부담합니다.`;

  const renderStaticContent = () => {
    const content = staticContent.split('\n\n').map((paragraph, index) => {
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
          {t('documents.termsOfService')}
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={styles.lastUpdated}>
          {t('documents.lastUpdated')}: {lastUpdated}
        </Text>

        {renderStaticContent()}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            본 약관은 {lastUpdated}부터 시행됩니다.
          </Text>
          <Text style={styles.footerText}>
            서비스 문의: getposty@gmail.com
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
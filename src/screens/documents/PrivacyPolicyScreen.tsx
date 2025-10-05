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
} from "react-native";
import { SafeIcon } from "../../utils/SafeIcon";
import {
  COLORS,
  SPACING,
  FONT_SIZES,
} from "../../utils/constants";
import { useAppTheme } from "../../hooks/useAppTheme";

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

  const lastUpdated = "2024년 1월 1일";

  // Notion 연동 제거 - 실제 컨텐츠를 직접 포함
  const staticContent = `# 개인정보처리방침

시행일: 2024년 1월 1일

법인명: 틴로봇스튜디오(Tinrobot Studio)

틴로봇스튜디오(이하 "회사")는 이용자의 개인정보를 매우 중요하게 생각하며, 「개인정보 보호법」, 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 등 관련 법령을 준수하고 있습니다.

회사는 개인정보처리방침을 통하여 이용자께서 제공하시는 개인정보가 어떠한 용도와 방식으로 이용되고 있으며, 개인정보보호를 위해 어떠한 조치가 취해지고 있는지 알려드립니다.

## 1. 수집하는 개인정보 항목

회사는 서비스 제공을 위해 다음과 같은 개인정보를 수집합니다:

### 필수 수집 항목

• **가입 시:** 성명, 이메일 주소

• **SNS 계정 연동 시:** SNS 계정 정보, 액세스 토큰

• **서비스 이용 시:** 생성된 콘텐츠, 이용 기록

### 자동 수집 항목

• **기기 정보:** 기기 모델, OS 버전, 앱 버전

• **로그 정보:** 서비스 이용 기록, 접속 시간

• **쿠키 및 유사 기술을 통해 얻어지는 정보**

## 2. 개인정보의 수집 및 이용 목적

회사는 수집한 개인정보를 다음의 목적을 위해 활용합니다:

• **회원관리:** 회원제 서비스 이용에 따른 본인 확인, 개인 식별

• **서비스 제공:** AI 콘텐츠 생성, SNS 계정 연동, 트렌드 분석

• **서비스 개선:** 신규 서비스 개발, 이용자 경험 개선

• **마케팅 및 광고:** 이벤트 정보 제공, 맞춤형 서비스 제공

• **법적 의무 이행:** 관련 법령에서 정하는 의무 이행

## 3. 개인정보의 보유 및 이용기간

• 회사는 이용자가 서비스를 이용하는 기간 동안 개인정보를 보유 및 이용합니다.

• 회원 탈퇴 시 지체없이 파기합니다. 단, 관련 법령에 따라 보존할 필요가 있는 경우에는 해당 기간 동안 보관합니다.

### 관련 법령에 의한 보존 기간

• **계약 또는 청약철회 등에 관한 기록:** 5년

• **대금결제 및 재화 등의 공급에 관한 기록:** 5년

• **소비자의 불만 또는 분쟁처리에 관한 기록:** 3년

• **표시·광고에 관한 기록:** 6개월

## 4. 개인정보의 제3자 제공

• 회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다.

• 다만, 다음의 경우에는 예외로 합니다:

• 이용자가 사전에 동의한 경우

• 법령의 규정에 의한 경우

• 수사기관의 요구가 있는 경우

### 광고 서비스 제공업체

• **Google AdMob:** 맞춤형 광고 제공을 위해 Google AdMob과 개인정보를 공유합니다. 사용자는 언제든지 광고 개인화를 거부할 수 있으며, Google의 개인정보 정책(https://policies.google.com/privacy)에 따라 처리됩니다.

## 5. 개인정보의 파기

회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.

### 파기절차

이용자가 입력한 정보는 목적 달성 후 별도의 DB에 옮겨져 내부 방침 및 기타 관련 법령에 따라 일정기간 저장된 후 파기됩니다.

### 파기방법

• **전자적 파일 형태:** 기록을 재생할 수 없는 기술적 방법을 사용

• **종이문서:** 분쇄기로 분쇄하거나 소각

## 6. 이용자의 권리와 행사 방법

이용자는 언제든지 다음과 같은 권리를 행사할 수 있습니다:

• **개인정보 열람 요구**

• **오류 등이 있을 경우 정정 요구**

• **삭제 요구**

• **처리 정지 요구**

권리 행사는 앱 내 설정 메뉴 또는 이메일(getposty@gmail.com)을 통해 할 수 있습니다.

## 7. 개인정보 보안성 확보조치

회사는 개인정보를 보호하기 위하여 다음과 같은 조치를 취하고 있습니다:

• **개인정보 암호화:** 비밀번호 등 중요정보는 암호화하여 저장

• **해킹 등에 대비한 기술적 대책:** 보안프로그램 설치 및 정기적 갱신

• **개인정보 접근 제한:** 최소한의 인원으로 제한

• **개인정보처리자에 대한 교육:** 정기적으로 교육 실시

## 8. 아동의 개인정보보호

회사는 만 14세 미만 아동의 개인정보를 수집하지 않습니다. 만약 만 14세 미만 아동의 개인정보가 수집된 것을 알게 된 경우, 즉시 해당 정보를 삭제합니다.

## 9. 개인정보보호책임자

회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 이용자의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보보호책임자를 지정하고 있습니다:

• **개인정보보호책임자:** [성명]

• **직책:** [직책]

• **연락처:** getposty@gmail.com

## 10. 개인정보처리방침 변경

본 개인정보처리방침은 시행일자부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.

• --

연락처: getposty@gmail.com

개인정보 문의: getposty@gmail.com`;

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
          {t('documents.privacyPolicy')}
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
            본 개인정보처리방침은 {lastUpdated}부터 시행됩니다.
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
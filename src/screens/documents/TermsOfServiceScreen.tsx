import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { SafeIcon } from "../../utils/SafeIcon";
import {
  COLORS,
  SPACING,
  BORDER_RADIUS,
  TYPOGRAPHY,
  FONT_SIZES,
} from "../../utils/constants";
import { APP_TEXT } from "../../utils/textConstants";
import { useAppTheme } from "../../hooks/useAppTheme";

interface TermsOfServiceScreenProps {
  onBack: () => void;
  onNavigate?: (screen: string) => void;
}

const TermsOfServiceScreen: React.FC<TermsOfServiceScreenProps> = ({
  onBack,
  onNavigate,
}) => {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  const lastUpdated = "2024년 1월 1일";

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <SafeIcon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>이용약관</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={styles.lastUpdated}>최종 수정일: {lastUpdated}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>제1조 (목적)</Text>
          <Text style={styles.paragraph}>
            이 약관은 Posty AI(이하 "회사")가 제공하는 AI 기반 SNS 콘텐츠 생성
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>제5조 (서비스 이용)</Text>
          <Text style={styles.listItem}>
            1. 이용자는 회사가 정한 절차에 따라 서비스를 이용할 수 있습니다.
          </Text>
          <Text style={styles.listItem}>
            2. 이용자는 서비스를 이용함에 있어 관련 법령을 준수해야 합니다.
          </Text>
          <Text style={styles.listItem}>
            3. 이용자는 타인의 권리를 침해하거나 공공질서에 반하는 내용의
            콘텐츠를 생성해서는 안 됩니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>제6조 (개인정보보호)</Text>
          <Text style={styles.listItem}>
            1. 회사는 이용자의 개인정보를 보호하기 위해 최선을 다합니다.
          </Text>
          <Text style={styles.listItem}>
            2. 개인정보의 수집, 이용, 제공에 관한 사항은 회사의
            개인정보처리방침에 따릅니다.
          </Text>
          <Text style={styles.listItem}>
            3. 회사는 이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>제7조 (콘텐츠의 권리와 책임)</Text>
          <Text style={styles.listItem}>
            1. 이용자가 작성한 콘텐츠의 저작권은 이용자에게 있습니다.
          </Text>
          <Text style={styles.listItem}>
            2. AI가 생성한 콘텐츠는 이용자가 자유롭게 사용, 수정, 배포할 수
            있습니다.
          </Text>
          <Text style={styles.listItem}>
            3. 이용자는 자신이 생성한 콘텐츠에 대한 모든 책임을 집니다.
          </Text>
          <Text style={styles.listItem}>
            4. 회사는 서비스 개선을 위해 이용자의 콘텐츠를 분석할 수 있으나,
            이는 익명화된 형태로만 사용됩니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>제8조 (서비스 이용 제한)</Text>
          <Text style={styles.paragraph}>
            회사는 다음의 경우 서비스 이용을 제한할 수 있습니다:
          </Text>
          <Text style={styles.listItem}>1. 이 약관을 위반한 경우</Text>
          <Text style={styles.listItem}>
            2. 타인의 권리를 침해하는 콘텐츠를 생성한 경우
          </Text>
          <Text style={styles.listItem}>
            3. 서비스의 정상적인 운영을 방해한 경우
          </Text>
          <Text style={styles.listItem}>4. 기타 관련 법령을 위반한 경우</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>제9조 (면책사항)</Text>
          <Text style={styles.listItem}>
            1. 회사는 천재지변, 전쟁 등 불가항력으로 인한 서비스 중단에 대해
            책임지지 않습니다.
          </Text>
          <Text style={styles.listItem}>
            2. 회사는 이용자가 서비스를 통해 얻은 정보나 자료의 정확성에 대해
            보증하지 않습니다.
          </Text>
          <Text style={styles.listItem}>
            3. 회사는 이용자 상호간 또는 이용자와 제3자 간의 분쟁에 대해
            관여하지 않습니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>제10조 (준거법 및 관할법원)</Text>
          <Text style={styles.listItem}>
            1. 이 약관은 대한민국 법령에 따라 규율되고 해석됩니다.
          </Text>
          <Text style={styles.listItem}>
            2. 서비스 이용과 관련하여 발생한 분쟁은 회사의 본사 소재지를
            관할하는 법원을 전속관할법원으로 합니다.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            본 약관은 {lastUpdated}부터 시행됩니다.
          </Text>
          <Text style={styles.footerText}>
            문의사항이 있으시면 getposty@gmail.com로 연락해주세요.
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
    },
    placeholder: {
      width: 40,
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
    section: {
      marginBottom: SPACING.xl,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text.primary,
      marginBottom: SPACING.md,
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

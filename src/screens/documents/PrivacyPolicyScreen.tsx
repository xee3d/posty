import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY, FONT_SIZES } from '../../utils/constants';
import { APP_TEXT } from '../../utils/textConstants';
import { useAppTheme } from '../../hooks/useAppTheme';

interface PrivacyPolicyScreenProps {
  onBack?: () => void;
}

const PrivacyPolicyScreen: React.FC<PrivacyPolicyScreenProps> = ({ onBack }) => {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);

  const lastUpdated = '2024년 1월 1일';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>개인정보 처리방침</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={styles.lastUpdated}>최종 수정일: {lastUpdated}</Text>

        <View style={styles.intro}>
          <Text style={styles.paragraph}>
            Posty AI(이하 "회사")는 이용자의 개인정보를 매우 중요하게 생각하며, 
            「개인정보 보호법」, 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 등 
            관련 법령을 준수하고 있습니다.
          </Text>
          <Text style={styles.paragraph}>
            회사는 본 개인정보 처리방침을 통해 이용자가 제공하는 개인정보가 어떠한 용도와 
            방식으로 이용되고 있으며, 개인정보 보호를 위해 어떠한 조치가 취해지고 있는지 알려드립니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. 수집하는 개인정보 항목</Text>
          <Text style={styles.paragraph}>
            회사는 서비스 제공을 위해 다음과 같은 개인정보를 수집합니다:
          </Text>
          
          <Text style={styles.subTitle}>필수 수집 항목</Text>
          <Text style={styles.listItem}>• 회원가입 시: 이름, 이메일 주소</Text>
          <Text style={styles.listItem}>• SNS 계정 연동 시: SNS 계정 정보, 액세스 토큰</Text>
          <Text style={styles.listItem}>• 서비스 이용 시: 생성한 콘텐츠, 사용 기록</Text>
          
          <Text style={styles.subTitle}>자동 수집 항목</Text>
          <Text style={styles.listItem}>• 기기 정보: 기기 모델, OS 버전, 앱 버전</Text>
          <Text style={styles.listItem}>• 로그 정보: 서비스 이용 기록, 접속 시간</Text>
          <Text style={styles.listItem}>• 쿠키 및 유사 기술을 통한 정보</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. 개인정보의 수집 및 이용 목적</Text>
          <Text style={styles.paragraph}>
            회사는 수집한 개인정보를 다음의 목적을 위해 활용합니다:
          </Text>
          <Text style={styles.listItem}>• 회원 관리: 회원제 서비스 이용에 따른 본인확인, 개인식별</Text>
          <Text style={styles.listItem}>• 서비스 제공: AI 콘텐츠 생성, SNS 계정 연동, 트렌드 분석</Text>
          <Text style={styles.listItem}>• 서비스 개선: 신규 기능 개발, 사용자 경험 개선</Text>
          <Text style={styles.listItem}>• 마케팅 및 광고: 이벤트 정보 제공, 맞춤형 서비스 제공</Text>
          <Text style={styles.listItem}>• 법적 의무 준수: 관련 법령에 따른 의무 이행</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. 개인정보의 보유 및 이용 기간</Text>
          <Text style={styles.listItem}>
            • 회사는 이용자가 서비스를 이용하는 기간 동안 개인정보를 보유하고 이용합니다.
          </Text>
          <Text style={styles.listItem}>
            • 회원 탈퇴 시 지체없이 파기합니다. 단, 관련 법령에 따라 보존할 필요가 있는 경우 
            해당 기간 동안 보관합니다.
          </Text>
          
          <Text style={styles.subTitle}>관련 법령에 따른 보존 기간</Text>
          <Text style={styles.listItem}>• 계약 또는 청약철회 등에 관한 기록: 5년</Text>
          <Text style={styles.listItem}>• 대금결제 및 재화 등의 공급에 관한 기록: 5년</Text>
          <Text style={styles.listItem}>• 소비자의 불만 또는 분쟁처리에 관한 기록: 3년</Text>
          <Text style={styles.listItem}>• 표시·광고에 관한 기록: 6개월</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. 개인정보의 제3자 제공</Text>
          <Text style={styles.listItem}>
            • 회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다.
          </Text>
          <Text style={styles.listItem}>
            • 다만, 다음의 경우에는 예외로 합니다:
          </Text>
          <Text style={styles.listItem}>  - 이용자가 사전에 동의한 경우</Text>
          <Text style={styles.listItem}>  - 법령의 규정에 의한 경우</Text>
          <Text style={styles.listItem}>  - 수사기관의 요청이 있는 경우</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. 개인정보의 파기</Text>
          <Text style={styles.paragraph}>
            회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 
            지체없이 해당 개인정보를 파기합니다.
          </Text>
          
          <Text style={styles.subTitle}>파기 절차</Text>
          <Text style={styles.listItem}>
            • 이용자가 입력한 정보는 목적 달성 후 별도의 DB에 옮겨져 내부 방침 및 기타 관련 법령에 
            따라 일정기간 저장된 후 파기됩니다.
          </Text>
          
          <Text style={styles.subTitle}>파기 방법</Text>
          <Text style={styles.listItem}>• 전자적 파일 형태: 기록을 재생할 수 없는 기술적 방법 사용</Text>
          <Text style={styles.listItem}>• 종이 문서: 분쇄기로 분쇄하거나 소각</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. 이용자의 권리와 행사 방법</Text>
          <Text style={styles.paragraph}>
            이용자는 언제든지 다음과 같은 권리를 행사할 수 있습니다:
          </Text>
          <Text style={styles.listItem}>• 개인정보 열람 요구</Text>
          <Text style={styles.listItem}>• 오류 등이 있을 경우 정정 요구</Text>
          <Text style={styles.listItem}>• 삭제 요구</Text>
          <Text style={styles.listItem}>• 처리정지 요구</Text>
          
          <Text style={styles.paragraph}>
            권리 행사는 앱 내 설정 메뉴 또는 이메일(hello@getposty.ai)을 통해 하실 수 있습니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. 개인정보의 안전성 확보 조치</Text>
          <Text style={styles.paragraph}>
            회사는 개인정보 보호를 위해 다음과 같은 조치를 취하고 있습니다:
          </Text>
          <Text style={styles.listItem}>• 개인정보의 암호화: 비밀번호 등 중요 정보는 암호화하여 저장</Text>
          <Text style={styles.listItem}>• 해킹 등에 대비한 기술적 대책: 보안프로그램 설치 및 주기적 갱신</Text>
          <Text style={styles.listItem}>• 개인정보 접근 제한: 최소한의 인원으로 제한</Text>
          <Text style={styles.listItem}>• 개인정보 처리 직원의 교육: 정기적인 교육 실시</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. 아동의 개인정보 보호</Text>
          <Text style={styles.paragraph}>
            회사는 만 14세 미만 아동의 개인정보를 수집하지 않습니다. 
            만 14세 미만 아동의 개인정보가 수집된 사실을 인지한 경우 즉시 해당 정보를 파기합니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. 개인정보 보호책임자</Text>
          <Text style={styles.paragraph}>
            회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 
            이용자의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
          </Text>
          <Text style={styles.listItem}>• 개인정보 보호책임자: [이름]</Text>
          <Text style={styles.listItem}>• 직책: [직책]</Text>
          <Text style={styles.listItem}>• 연락처: privacy@getposty.ai</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. 개인정보 처리방침 변경</Text>
          <Text style={styles.paragraph}>
            이 개인정보 처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 
            추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            본 방침은 {lastUpdated}부터 시행됩니다.
          </Text>
          <Text style={styles.footerText}>
            개인정보 관련 문의사항은 privacy@getposty.ai로 연락해주세요.
          </Text>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: typeof COLORS) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    fontWeight: '600',
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
    textAlign: 'center',
  },
  intro: {
    marginBottom: SPACING.xl,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: SPACING.md,
  },
  subTitle: {
    fontSize: 14,
    fontWeight: '600',
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
    marginBottom: SPACING.xs,
    paddingLeft: SPACING.sm,
  },
  footer: {
    marginTop: SPACING.xxl,
    paddingTop: SPACING.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
  },
  footerText: {
    fontSize: FONT_SIZES.small,
    color: colors.text.tertiary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  bottomSpace: {
    height: SPACING.xxl,
  },
});

export default PrivacyPolicyScreen;

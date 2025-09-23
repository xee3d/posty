import React from 'react';
import { ScrollView, Text, StyleSheet, SafeAreaView, View, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeIcon } from '../../utils/SafeIcon';
import { COLORS, SPACING, FONT_SIZES } from '../../utils/constants';
import { useAppTheme } from '../../hooks/useAppTheme';

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

  const lastUpdated = "2024年1月1日";

  const staticContent = `# プライバシーポリシー

施行日: 2024年1月1日

法人名: Tinrobot Studio

Tinrobot Studio（以下「当社」）は、利用者の個人情報を非常に重要視しており、「個人情報保護法」、「情報通信網利用促進及び情報保護等に関する法律」等の関連法令を遵守しております。

当社は、プライバシーポリシーを通じて、利用者から提供される個人情報がどのような用途と方式で利用されているか、また個人情報保護のためにどのような措置が講じられているかをお知らせします。

## 1. 収集する個人情報項目

当社は、サービス提供のために以下の個人情報を収集します：

### 必須収集項目

• **登録時：** 氏名、メールアドレス

• **SNSアカウント連携時：** SNSアカウント情報、アクセストークン

• **サービス利用時：** 生成されたコンテンツ、利用記録

### 自動収集項目

• **端末情報：** 端末モデル、OSバージョン、アプリバージョン

• **ログ情報：** サービス利用記録、アクセス時間

• **Cookie及び類似技術を通じて得られる情報**

## 2. 個人情報の収集及び利用目的

当社は収集した個人情報を以下の目的のために活用します：

• **会員管理：** 会員制サービス利用に伴う本人確認、個人識別

• **サービス提供：** AIコンテンツ生成、SNSアカウント連携、トレンド分析

• **サービス改善：** 新規サービス開発、利用者体験の改善

• **マーケティング及び広告：** イベント情報提供、カスタマイズされたサービス提供

• **法的義務履行：** 関連法令で定める義務履行

## 3. 個人情報の保有及び利用期間

• 当社は、利用者がサービスを利用する期間中、個人情報を保有及び利用します。

• 会員退会時には遅滞なく破棄します。ただし、関連法令により保存する必要がある場合は、該当期間中保管します。

### 関連法令による保存期間

• **契約又は申込撤回等に関する記録：** 5年

• **代金決済及び財・サービス等の供給に関する記録：** 5年

• **消費者の苦情又は紛争処理に関する記録：** 3年

• **表示・広告に関する記録：** 6ヶ月

## 4. 個人情報の第三者提供

• 当社は、原則として利用者の個人情報を第三者に提供しません。

• ただし、以下の場合は例外とします：

• 利用者が事前に同意した場合

• 法令の規定による場合

• 捜査機関の要求がある場合

### 広告サービス提供事業者

• **Google AdMob：** カスタマイズされた広告提供のため、Google AdMobと個人情報を共有します。ユーザーはいつでも広告のカスタマイズを拒否でき、Googleのプライバシーポリシー（https://policies.google.com/privacy）に従って処理されます。

## 5. 個人情報の破棄

当社は、個人情報保有期間の経過、処理目的達成等により個人情報が不要になった場合、遅滞なく該当個人情報を破棄します。

### 破棄手順

利用者が入力した情報は、目的達成後、別途のDBに移され、内部方針及びその他関連法令に従い一定期間保存された後に破棄されます。

### 破棄方法

• **電子ファイル形式：** 記録を再生できない技術的方法を使用

• **紙文書：** シュレッダーで細断又は焼却

## 6. 利用者の権利と行使方法

利用者はいつでも以下の権利を行使できます：

• **個人情報閲覧請求**

• **誤り等がある場合の訂正請求**

• **削除請求**

• **処理停止請求**

権利行使は、アプリ内の設定メニュー又はメール（getposty@gmail.com）を通じて行うことができます。

## 7. 個人情報セキュリティ確保措置

当社は個人情報を保護するため、以下の措置を講じています：

• **個人情報暗号化：** パスワード等の重要情報は暗号化して保存

• **ハッキング等に備えた技術的対策：** セキュリティプログラムの設置及び定期的更新

• **個人情報アクセス制限：** 最小限の人員に制限

• **個人情報処理者に対する教育：** 定期的に教育実施

## 8. 児童の個人情報保護

当社は、満14歳未満の児童の個人情報を収集しません。万一、満14歳未満の児童の個人情報が収集されたことを知った場合、直ちに該当情報を削除します。

## 9. 個人情報保護責任者

当社は、個人情報処理に関する業務を総括し、個人情報処理に関する利用者の苦情処理及び被害救済等のため、以下のとおり個人情報保護責任者を指定しております：

• **個人情報保護責任者：** [氏名]

• **職責：** [職責]

• **連絡先：** privacy@getposty.ai

## 10. プライバシーポリシーの変更

本プライバシーポリシーは施行日から適用され、法令及び方針による変更内容の追加、削除及び訂正がある場合、変更事項の施行7日前から公知事項を通じて告知いたします。

• --

連絡先: getposty@gmail.com

個人情報問い合わせ: getposty@gmail.com`;

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
            本プライバシーポリシーは{lastUpdated}から施行されます。
          </Text>
          <Text style={styles.footerText}>
            個人情報に関するお問い合わせ: getposty@gmail.com
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
import React from 'react';
import { ScrollView, Text, StyleSheet, SafeAreaView, View, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeIcon } from '../../utils/SafeIcon';
import { COLORS, SPACING, FONT_SIZES } from '../../utils/constants';
import { useAppTheme } from '../../hooks/useAppTheme';

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

  const lastUpdated = "2024年1月1日";

  const staticContent = `# サービス利用規約

施行日：2024年1月1日

法人名：Tinrobot Studio

## 第1条（目的）

本規約は、Tinrobot Studio（以下「当社」といいます）が提供するAIベースのSNSコンテンツ生成サービス「Posty」（以下「サービス」といいます）の利用条件及び手続き、当社と利用者の権利、義務、責任事項その他必要な事項を規定することを目的とします。

## 第2条（用語の定義）

本規約で使用する用語の定義は以下のとおりです：

**「サービス」**とは、当社が提供するAIベースのSNSコンテンツ生成及び管理に関する一切のサービスを意味します。

**「利用者」**とは、本規約に従って当社が提供するサービスを利用する者を意味します。

**「コンテンツ」**とは、利用者がサービスを通じて生成、保存、共有するすべての形態の情報を意味します。

**「AI生成コンテンツ」**とは、サービスの人工知能機能を通じて生成されたテキスト、画像分析結果等を意味します。

## 第3条（規約の効力及び変更）

本規約は、サービスを利用しようとするすべての利用者に対してその効力が発生します。

当社は、必要に応じて関連法令に違反しない範囲で本規約を変更することができ、変更された規約はサービス内のお知らせを通じて公知します。

利用者が変更された規約に同意しない場合、サービスの利用を中断し退会することができます。

## 第4条（サービスの提供）

当社が提供するサービスは以下のとおりです：

**AIベースのSNSコンテンツ生成サービス**

**SNSトレンド分析及びインサイト提供**

**ユーザー執筆スタイル分析**

**SNSアカウント連携及び投稿管理**

**その他当社が追加で開発又は提携を通じて提供するサービス**

## 第5条（サービスの利用）

利用者は、当社が定めた手続きに従ってサービスを利用することができます。

利用者は、サービスを利用するにあたって関連法令を遵守しなければなりません。

利用者は、他人の権利を侵害したり公序良俗に反する内容のコンテンツを生成してはなりません。

## 第6条（個人情報保護）

当社は、利用者の個人情報を保護するために最善を尽くします。

個人情報の収集、利用、提供に関する事項は、当社のプライバシーポリシーに従います。

当社は、利用者の同意なしに個人情報を第三者に提供しません。

## 第7条（コンテンツの権利と責任）

利用者が生成したコンテンツの著作権は利用者に帰属します。

AIが生成したコンテンツは、利用者が自由に使用、修正、配布することができます。

利用者は、自分が生成したコンテンツについてすべての責任を負います。

当社は、サービス改善のために利用者のコンテンツを分析することができますが、これは匿名化された形でのみ使用されます。

## 第8条（サービス利用制限）

当社は、以下の場合にサービス利用を制限することができます：

本規約に違反した場合

他人の権利を侵害するコンテンツを生成した場合

サービスの正常な運営を妨害した場合

その他関連法令に違反した場合

## 第9条（免責事項）

当社は、天災地変、戦争等の不可抗力によるサービス中断について責任を負いません。

当社は、利用者がサービスを通じて得た情報や資料の正確性について保証しません。

当社は、利用者相互間又は利用者と第三者間の紛争に関与しません。

## 第10条（準拠法及び管轄裁判所）

本規約は、大韓民国法令によって規律され解釈されます。

サービス利用について発生した紛争は、当社の本社所在地を管轄する裁判所を専属管轄裁判所とします。

• --

連絡先：getposty@gmail.com

個人情報保護責任者：getposty@gmail.com

## 第12条（人工知能技術の使用）

1. **AI技術の活用**

   - 本サービスは、OpenAIのGPTモデルをベースとした人工知能技術を使用して、以下のサービスを提供します：

     * コンテンツの自動生成

     * テキストの改善・推敲

     * 写真ベースのコンテンツ生成

     * パーソナライズされた執筆推奨

2. **AI生成コンテンツの特性**

   - AI生成コンテンツの正確性、適切性、完全性、著作権侵害の有無については保証いたしません。

   - ユーザーはAI生成コンテンツを参考用としてのみ使用し、最終使用前に内容を確認し責任を負う必要があります。

   - AI生成コンテンツが第三者の権利を侵害したり、不適切な内容を含む可能性があることを認識して使用する必要があります。

3. **データ処理**

   - ユーザーが入力したテキスト、写真などのデータは、AIサービス提供のため外部AIサービス提供者（OpenAI等）に送信される場合があります。

   - 送信されるデータはサービス提供目的でのみ使用され、プライバシーポリシーに従って処理されます。

4. **サービス変更**

   - 当社は、AIモデルのアップデート、変更、またはサービス改善のため、事前通知後にAI機能を修正することができます。

   - AI技術の発展に伴い、新機能が追加されたり既存機能が変更される場合があります。

5. **免責事項**

   - 当社は、AI生成コンテンツによって生じる直接的・間接的損害について責任を負いません。

   - ユーザーは、AI生成コンテンツの使用による全ての法的責任を負担します。`;

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
      } else if (paragraph.startsWith('•') || paragraph.startsWith('-') || paragraph.startsWith('*')) {
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
            本規約は{lastUpdated}から施行されます。
          </Text>
          <Text style={styles.footerText}>
            連絡先：getposty@gmail.com
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

export default TermsOfServiceScreen_JA;
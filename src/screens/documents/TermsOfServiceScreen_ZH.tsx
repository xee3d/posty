import React from 'react';
import { ScrollView, Text, StyleSheet, SafeAreaView, View, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeIcon } from '../../utils/SafeIcon';
import { COLORS, SPACING, FONT_SIZES } from '../../utils/constants';
import { useAppTheme } from '../../hooks/useAppTheme';

interface TermsOfServiceScreenZHProps {
  onBack: () => void;
  onNavigate?: (screen: string) => void;
}

const TermsOfServiceScreen_ZH: React.FC<TermsOfServiceScreenZHProps> = ({
  onBack,
  onNavigate,
}) => {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const styles = createStyles(colors);

  const lastUpdated = "2024年1月1日";

  const staticContent = `# 服务条款

生效日期：2024年1月1日

公司名称：Tinrobot Studio

## 第1条（目的）

本条款旨在规定Tinrobot Studio（以下简称"公司"）提供的AI基础SNS内容创作服务"Posty"（以下简称"服务"）的使用条件和程序，以及公司和用户的权利、义务、责任事项及其他必要事项。

## 第2条（术语定义）

本条款中使用的术语定义如下：

**"服务"**指公司提供的与AI基础SNS内容创作和管理相关的所有服务。

**"用户"**指根据本条款使用公司提供服务的人。

**"内容"**指用户通过服务创建、保存、共享的所有形式的信息。

**"AI生成内容"**指通过服务的人工智能功能生成的文本、图像分析结果等。

## 第3条（条款的效力和变更）

本条款对所有希望使用服务的用户生效。

公司可在不违反相关法律的范围内根据需要变更本条款，变更后的条款将通过服务内的公告告知。

如果用户不同意变更后的条款，可以中止使用服务并退出。

## 第4条（服务的提供）

公司提供的服务如下：

**AI基础SNS内容创作服务**

**SNS趋势分析和洞察提供**

**用户写作风格分析**

**SNS账户关联和帖子管理**

**公司额外开发或通过合作提供的其他服务**

## 第5条（服务使用）

用户可以按照公司规定的程序使用服务。

用户在使用服务时必须遵守相关法律。

用户不得创建侵犯他人权利或违反公序良俗的内容。

## 第6条（个人信息保护）

公司尽最大努力保护用户的个人信息。

有关个人信息的收集、使用和提供事项按照公司的隐私政策执行。

公司未经用户同意不向第三方提供个人信息。

## 第7条（内容的权利和责任）

用户创建的内容的著作权归用户所有。

AI生成的内容可以由用户自由使用、修改和分发。

用户对自己创建的内容承担全部责任。

公司可以为改进服务而分析用户的内容，但仅以匿名化的形式使用。

## 第8条（服务使用限制）

公司可在以下情况下限制服务使用：

违反本条款的情况

创建侵犯他人权利的内容的情况

妨碍服务正常运营的情况

违反其他相关法律的情况

## 第9条（免责声明）

公司对因不可抗力（如自然灾害、战争等）导致的服务中断不承担责任。

公司不保证用户通过服务获得的信息或资料的准确性。

公司不介入用户之间或用户与第三方之间的纠纷。

## 第10条（准据法和管辖法院）

本条款根据大韩民国法律进行规范和解释。

因服务使用而产生的纠纷以公司总部所在地管辖法院为专属管辖法院。

• --

联系方式：getposty@gmail.com

个人信息保护负责人：getposty@gmail.com

## 第12条（人工智能技术使用）

1. **AI技术应用**

   - 本服务使用基于OpenAI GPT模型的人工智能技术，提供以下服务：

     * 内容自动生成

     * 文本改进和润色

     * 基于照片的内容创作

     * 个性化写作推荐

2. **AI生成内容的特性**

   - 我们不保证AI生成内容的准确性、适当性、完整性或版权合规性。

   - 用户应仅将AI生成内容作为参考使用，在最终使用前必须审查内容并承担责任。

   - 用户必须认识到AI生成内容可能侵犯第三方权利或包含不当内容。

3. **数据处理**

   - 用户输入的文本、照片等数据可能会传输给外部AI服务提供商（如OpenAI）以提供AI服务。

   - 传输的数据仅用于服务提供目的，并根据隐私政策进行处理。

4. **服务变更**

   - 公司可在事先通知后修改AI功能，以进行AI模型更新、变更或服务改进。

   - 根据AI技术发展，可能会添加新功能或更改现有功能。

5. **免责声明**

   - 公司对因AI生成内容而产生的直接或间接损害不承担责任。

   - 用户对使用AI生成内容承担所有法律责任。`;

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
            本服务条款自{lastUpdated}起生效。
          </Text>
          <Text style={styles.footerText}>
            联系方式：getposty@gmail.com
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

export default TermsOfServiceScreen_ZH;
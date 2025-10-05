import React from 'react';
import { ScrollView, Text, StyleSheet, SafeAreaView, View, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeIcon } from '../../utils/SafeIcon';
import { COLORS, SPACING, FONT_SIZES } from '../../utils/constants';
import { useAppTheme } from '../../hooks/useAppTheme';

interface PrivacyPolicyScreenZHProps {
  onBack: () => void;
  onNavigate?: (screen: string) => void;
}

const PrivacyPolicyScreen_ZH: React.FC<PrivacyPolicyScreenZHProps> = ({
  onBack,
  onNavigate,
}) => {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const styles = createStyles(colors);

  const lastUpdated = "2024年1月1日";

  const staticContent = `# 隐私政策

生效日期：2024年1月1日

公司名称：Tinrobot Studio

Tinrobot Studio（以下简称"公司"）非常重视您的个人信息，并遵守《个人信息保护法》、《信息通信网利用促进及信息保护等相关法律》等相关法律法规。

通过本隐私政策，我们向您说明您提供的个人信息如何被使用，以及为保护个人信息采取了哪些措施。

## 1. 收集的个人信息项目

公司为提供服务收集以下个人信息：

### 必要收集项目

• **注册时：** 姓名、电子邮件地址

• **SNS账户关联时：** SNS账户信息、访问令牌

• **服务使用时：** 生成的内容、使用记录

### 自动收集项目

• **设备信息：** 设备型号、操作系统版本、应用版本

• **日志信息：** 服务使用记录、访问时间

• **通过Cookie及类似技术获得的信息**

## 2. 个人信息的收集和使用目的

公司将收集的个人信息用于以下目的：

• **会员管理：** 会员服务使用时的身份验证、个人识别

• **服务提供：** AI内容生成、SNS账户关联、趋势分析

• **服务改进：** 新服务开发、用户体验改进

• **营销和广告：** 活动信息提供、定制化服务提供

• **履行法律义务：** 履行相关法律规定的义务

## 3. 个人信息的保留和使用期限

• 公司在用户使用服务期间保留和使用个人信息。

• 会员退出时立即销毁。但是，根据相关法律需要保存的情况下，将在相应期间内保管。

### 根据相关法律的保存期限

• **关于合同或撤销订阅等的记录：** 5年

• **关于支付和商品等供应的记录：** 5年

• **关于消费者投诉或纠纷处理的记录：** 3年

• **关于展示·广告的记录：** 6个月

## 4. 向第三方提供个人信息

• 公司原则上不向第三方提供用户的个人信息。

• 但是，以下情况除外：

• 用户事先同意的情况

• 法律规定的情况

• 调查机关要求的情况

### 广告服务提供商

• **Google AdMob：** 为提供个性化广告，我们与Google AdMob共享个人信息。用户可以随时拒绝广告个性化，数据根据Google的隐私政策（https://policies.google.com/privacy）进行处理。

## 5. 个人信息的销毁

公司在个人信息保留期限届满、处理目的达成等个人信息变得不必要时，将立即销毁该个人信息。

### 销毁程序

用户输入的信息在达成目的后移至单独的数据库，根据内部政策及其他相关法律保存一定期间后销毁。

### 销毁方法

• **电子文件形式：** 使用无法再现记录的技术方法

• **纸质文件：** 用碎纸机粉碎或焚烧

## 6. 用户的权利和行使方法

用户可以随时行使以下权利：

• **要求查阅个人信息**

• **如有错误等情况要求更正**

• **要求删除**

• **要求停止处理**

可以通过应用内设置菜单或电子邮件（getposty@gmail.com）行使权利。

## 7. 个人信息安全措施

公司为保护个人信息采取以下措施：

• **个人信息加密：** 密码等重要信息加密存储

• **防范黑客攻击的技术对策：** 安装安全程序并定期更新

• **限制个人信息访问：** 限制为最少人员

• **对个人信息处理者的培训：** 定期进行培训

## 8. 儿童个人信息保护

公司不收集未满14岁儿童的个人信息。如果发现收集了未满14岁儿童的个人信息，将立即删除该信息。

## 9. 个人信息保护负责人

公司指定个人信息保护负责人，全面负责个人信息处理相关业务，处理用户投诉和损害救济等事宜：

• **个人信息保护负责人：** [姓名]

• **职位：** [职位]

• **联系方式：** getposty@gmail.com

## 10. 隐私政策变更

本隐私政策自生效日起适用，如有根据法律法规和政策的变更内容的增加、删除和修改，将在变更事项生效前7天通过公告通知。

• --

联系方式：getposty@gmail.com

个人信息咨询：getposty@gmail.com`;

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
            本隐私政策自{lastUpdated}起生效。
          </Text>
          <Text style={styles.footerText}>
            个人信息咨询：getposty@gmail.com
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

export default PrivacyPolicyScreen_ZH;
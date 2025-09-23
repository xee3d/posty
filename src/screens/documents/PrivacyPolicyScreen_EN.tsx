import React from 'react';
import { ScrollView, Text, StyleSheet, SafeAreaView, View, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeIcon } from '../../utils/SafeIcon';
import { COLORS, SPACING, FONT_SIZES } from '../../utils/constants';
import { useAppTheme } from '../../hooks/useAppTheme';

interface PrivacyPolicyScreenENProps {
  onBack: () => void;
  onNavigate?: (screen: string) => void;
}

const PrivacyPolicyScreen_EN: React.FC<PrivacyPolicyScreenENProps> = ({
  onBack,
  onNavigate,
}) => {
  const { colors } = useAppTheme();
  const { t } = useTranslation();
  const styles = createStyles(colors);

  const lastUpdated = "January 1, 2024";

  const staticContent = `# Privacy Policy

Effective Date: January 1, 2024

Company Name: Tinrobot Studio

Tinrobot Studio (hereinafter "Company") takes your personal information very seriously and complies with relevant laws including the "Personal Information Protection Act" and the "Act on Promotion of Information and Communications Network Utilization and Information Protection."

Through this Privacy Policy, we inform you of how your personal information is used and what measures are being taken to protect it.

## 1. Personal Information We Collect

The Company collects the following personal information to provide services:

### Required Information

• **Upon Registration:** Name, Email Address

• **Upon SNS Account Integration:** SNS Account Information, Access Token

• **During Service Use:** Generated Content, Usage Records

### Automatically Collected Information

• **Device Information:** Device Model, OS Version, App Version

• **Log Information:** Service Usage Records, Access Time

• **Information obtained through cookies and similar technologies**

## 2. Purpose of Collection and Use of Personal Information

The Company uses collected personal information for the following purposes:

• **Member Management:** User verification and identification for membership services

• **Service Provision:** AI content generation, SNS account integration, trend analysis

• **Service Improvement:** New service development, user experience improvement

• **Marketing and Advertising:** Event information provision, customized service provision

• **Legal Compliance:** Fulfillment of obligations prescribed by relevant laws

## 3. Retention and Use Period of Personal Information

• The Company retains and uses personal information while users use the service.

• Upon membership withdrawal, information is destroyed without delay. However, if there is a need to preserve information according to relevant laws, it will be retained for the applicable period.

### Retention Period According to Relevant Laws

• **Records on contracts or withdrawal of subscription:** 5 years

• **Records on payment and supply of goods:** 5 years

• **Records on consumer complaints or dispute resolution:** 3 years

• **Records on display and advertisement:** 6 months

## 4. Provision of Personal Information to Third Parties

• The Company does not provide users' personal information to third parties in principle.

• However, exceptions are made in the following cases:

• When users have given prior consent

• When required by law

• When requested by investigative agencies

### Advertising Service Providers

• **Google AdMob:** We share personal information with Google AdMob to provide personalized advertising. Users can opt out of ad personalization at any time, and data is processed according to Google's Privacy Policy (https://policies.google.com/privacy).

## 5. Destruction of Personal Information

The Company destroys personal information without delay when it becomes unnecessary, such as when the retention period expires or the processing purpose is achieved.

### Destruction Procedure

Information entered by users is moved to a separate DB after achieving its purpose and stored for a certain period according to internal policies and relevant laws before destruction.

### Destruction Method

• **Electronic Files:** Using technical methods that prevent reproduction

• **Paper Documents:** Shredding or incineration

## 6. Users' Rights and How to Exercise Them

Users can exercise the following rights at any time:

• **Request for access to personal information**

• **Request for correction if there are errors**

• **Request for deletion**

• **Request for suspension of processing**

Rights can be exercised through the settings menu in the app or via email (getposty@gmail.com).

## 7. Security Measures for Personal Information

The Company takes the following measures to protect personal information:

• **Personal Information Encryption:** Important information such as passwords is encrypted and stored

• **Technical Measures Against Hacking:** Installation and regular update of security programs

• **Restriction of Personal Information Access:** Limited to minimum personnel

• **Training for Personal Information Handlers:** Regular training conducted

## 8. Protection of Children's Personal Information

The Company does not collect personal information from children under 14 years of age. If we become aware that personal information from a child under 14 has been collected, we will delete such information immediately.

## 9. Personal Information Protection Officer

The Company designates a Personal Information Protection Officer to oversee personal information processing and handle user complaints and damage relief:

• **Personal Information Protection Officer:** [Name]

• **Position:** [Position]

• **Contact:** privacy@getposty.ai

## 10. Changes to Privacy Policy

This Privacy Policy is effective from the implementation date, and if there are additions, deletions, or corrections to changes according to laws and policies, we will notify you through announcements from 7 days before the implementation of changes.

• --

Contact: getposty@gmail.com

Privacy Inquiries: getposty@gmail.com`;

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
            This privacy policy is effective from {lastUpdated}.
          </Text>
          <Text style={styles.footerText}>
            For privacy questions, please contact: getposty@gmail.com
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

export default PrivacyPolicyScreen_EN;
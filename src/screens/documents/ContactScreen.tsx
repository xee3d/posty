import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Linking, Pressable,  } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../../utils/constants';
import { useAppTheme } from '../../hooks/useAppTheme';
import Clipboard from '@react-native-clipboard/clipboard';

import { Alert } from '../../utils/customAlert';
interface ContactScreenProps {
  onBack: () => void;
  onNavigate?: (screen: string) => void;
}

const ContactScreen: React.FC<ContactScreenProps> = ({ onBack, onNavigate }) => {
  const { colors } = useAppTheme();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const styles = createStyles(colors);

  const categories = [
    { id: 'bug', label: '버그 신고', icon: 'bug' },
    { id: 'feature', label: '기능 제안', icon: 'bulb' },
    { id: 'payment', label: '결제 문의', icon: 'card' },
    { id: 'other', label: '기타 문의', icon: 'help-circle' },
  ];

  const handleCopyEmail = () => {
    Clipboard.setString('hello@getposty.ai');
    Alert.alert('복사 완료', 'hello@getposty.ai가 클립보드에 복사되었어요!');
  };

  const handleOpenEmail = async () => {
    const email = 'hello@getposty.ai';
    const categoryLabel = categories.find(c => c.id === selectedCategory)?.label || '문의';
    const mailUrl = `mailto:${email}?subject=[${categoryLabel}] ${subject}&body=${message}`;
    
    try {
      const canOpen = await Linking.canOpenURL(mailUrl);
      if (canOpen) {
        await Linking.openURL(mailUrl);
      } else {
        Alert.alert(
          '이메일 앱이 없어요',
          'hello@getposty.ai로 직접 메일을 보내주세요.',
          [
            { text: '취소', style: 'cancel' },
            { text: '이메일 복사', onPress: handleCopyEmail }
          ]
        );
      }
    } catch (error) {
      console.error('Error opening email:', error);
      Alert.alert(
        '오류',
        '이메일 앱을 열 수 없어요. 이메일 주소를 복사해서 사용해주세요.',
        [
          { text: '확인', onPress: handleCopyEmail }
        ]
      );
    }
  };

  const handleSubmit = () => {
    if (!subject.trim() || !message.trim() || !selectedCategory) {
      Alert.alert('알림', '모든 필드를 입력해주세요.');
      return;
    }

    handleOpenEmail();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Icon name="chevron-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>문의하기</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.contentContainer}
        >
          {/* 이메일 정보 카드 */}
          <View style={styles.emailCard}>
            <View style={styles.emailHeader}>
              <Icon name="mail" size={24} color={colors.primary} />
              <Text style={styles.emailTitle}>이메일로 문의하기</Text>
            </View>
            <Text style={styles.emailAddress}>hello@getposty.ai</Text>
            <View style={styles.emailActions}>
              <TouchableOpacity style={styles.emailButton} onPress={handleCopyEmail}>
                <Icon name="copy-outline" size={18} color={colors.primary} />
                <Text style={styles.emailButtonText}>복사</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.emailButton, styles.emailButtonPrimary]} onPress={() => handleOpenEmail()}>
                <Icon name="mail-outline" size={18} color={colors.white} />
                <Text style={[styles.emailButtonText, styles.emailButtonTextPrimary]}>이메일 앱 열기</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 빠른 문의 양식 */}
          <View style={styles.formSection}>
            <Text style={styles.formTitle}>빠른 문의</Text>
            <Text style={styles.formSubtitle}>아래 양식을 작성하면 이메일 앱에서 바로 보낼 수 있어요</Text>
            
            {/* 카테고리 선택 */}
            <View style={styles.categoryContainer}>
              {categories.map((category) => (
                <Pressable
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category.id && styles.categoryButtonActive,
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <Icon
                    name={category.icon}
                    size={16}
                    color={selectedCategory === category.id ? colors.white : colors.text.secondary}
                  />
                  <Text
                    style={[
                      styles.categoryText,
                      selectedCategory === category.id && styles.categoryTextActive,
                    ]}
                  >
                    {category.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* 제목 입력 */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>제목</Text>
              <TextInput
                style={styles.input}
                value={subject}
                onChangeText={setSubject}
                placeholder="문의 제목을 입력해주세요"
                placeholderTextColor={colors.text.tertiary}
              />
            </View>

            {/* 내용 입력 */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>내용</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={message}
                onChangeText={setMessage}
                placeholder="자세한 내용을 입력해주세요"
                placeholderTextColor={colors.text.tertiary}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>

            {/* 제출 버튼 */}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>이메일로 보내기</Text>
              <Icon name="send" size={18} color={colors.white} />
            </TouchableOpacity>
          </View>

          {/* 안내사항 */}
          <View style={styles.infoSection}>
            <View style={styles.infoItem}>
              <Icon name="time-outline" size={20} color={colors.text.secondary} />
              <Text style={styles.infoText}>평일 기준 24시간 이내 답변드려요</Text>
            </View>
            <View style={styles.infoItem}>
              <Icon name="globe-outline" size={20} color={colors.text.secondary} />
              <Text style={styles.infoText}>한국어와 영어로 문의 가능해요</Text>
            </View>
          </View>

          <View style={styles.bottomSpace} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const createStyles = (colors: typeof COLORS) => {
  const isDark = colors.background === '#1A202C';

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    keyboardView: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.md,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
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
      paddingBottom: SPACING.xxl,
    },
    emailCard: {
      backgroundColor: colors.surface,
      marginHorizontal: SPACING.lg,
      marginTop: SPACING.lg,
      padding: SPACING.lg,
      borderRadius: BORDER_RADIUS.lg,
      borderWidth: 1,
      borderColor: colors.primary + '30',
    },
    emailHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
      marginBottom: SPACING.sm,
    },
    emailTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text.primary,
    },
    emailAddress: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.primary,
      marginBottom: SPACING.md,
    },
    emailActions: {
      flexDirection: 'row',
      gap: SPACING.sm,
    },
    emailButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SPACING.xs,
      paddingVertical: SPACING.sm,
      borderRadius: BORDER_RADIUS.md,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    emailButtonPrimary: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    emailButtonText: {
      fontSize: FONT_SIZES.small,
      fontWeight: '600',
      color: colors.primary,
    },
    emailButtonTextPrimary: {
      color: colors.white,
    },
    formSection: {
      paddingHorizontal: SPACING.lg,
      paddingTop: SPACING.xl,
    },
    formTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text.primary,
      marginBottom: SPACING.xs,
    },
    formSubtitle: {
      fontSize: FONT_SIZES.small,
      color: colors.text.secondary,
      marginBottom: SPACING.lg,
    },
    categoryContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: SPACING.sm,
      marginBottom: SPACING.lg,
    },
    categoryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md,
      borderRadius: BORDER_RADIUS.full,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      gap: SPACING.xs,
    },
    categoryButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    categoryText: {
      fontSize: FONT_SIZES.small,
      fontWeight: '500',
      color: colors.text.secondary,
    },
    categoryTextActive: {
      color: colors.white,
    },
    inputGroup: {
      marginBottom: SPACING.lg,
    },
    inputLabel: {
      fontSize: FONT_SIZES.small,
      fontWeight: '600',
      color: colors.text.secondary,
      marginBottom: SPACING.sm,
    },
    input: {
      backgroundColor: colors.surface,
      borderRadius: BORDER_RADIUS.md,
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.md,
      fontSize: FONT_SIZES.medium,
      color: colors.text.primary,
      borderWidth: 1,
      borderColor: colors.border,
    },
    textArea: {
      minHeight: 120,
      paddingTop: SPACING.md,
    },
    submitButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      paddingVertical: SPACING.md,
      borderRadius: BORDER_RADIUS.md,
      gap: SPACING.sm,
    },
    submitButtonText: {
      fontSize: FONT_SIZES.medium,
      fontWeight: '600',
      color: colors.white,
    },
    infoSection: {
      paddingHorizontal: SPACING.lg,
      paddingTop: SPACING.xl,
      gap: SPACING.sm,
    },
    infoItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SPACING.sm,
    },
    infoText: {
      fontSize: FONT_SIZES.small,
      color: colors.text.secondary,
      flex: 1,
    },
    bottomSpace: {
      height: SPACING.xxl,
    },
  });
};

export default ContactScreen;

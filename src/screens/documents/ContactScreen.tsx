import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Linking,
  Pressable,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { SafeIcon } from "../../utils/SafeIcon";
import {
  COLORS,
  SPACING,
  BORDER_RADIUS,
  FONT_SIZES,
} from "../../utils/constants";
import { useAppTheme } from "../../hooks/useAppTheme";
import Clipboard from "@react-native-clipboard/clipboard";

import { Alert } from "../../utils/customAlert";
interface ContactScreenProps {
  onBack: () => void;
  onNavigate?: (screen: string) => void;
}

const ContactScreen: React.FC<ContactScreenProps> = ({
  onBack,
  onNavigate,
}) => {
  const { colors } = useAppTheme();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const styles = createStyles(colors);

  const categories = [
    { id: "bug", label: "버그 신고", icon: "bug" },
    { id: "feature", label: "기능 제안", icon: "bulb" },
    { id: "payment", label: "결제 문의", icon: "card" },
    { id: "other", label: "기타 문의", icon: "help-circle" },
  ];

  const handleCopyEmail = () => {
    Clipboard.setString("getposty@gmail.com");
    Alert.alert("복사 완료", "getposty@gmail.com이 클립보드에 복사되었어요!");
  };

  const handleOpenEmail = async () => {
    const email = "getposty@gmail.com";

    try {
      const simpleMailUrl = `mailto:${email}`;
      console.log("Trying to open email with URL:", simpleMailUrl);

      // iOS/Android에서 더 직접적인 접근 시도
      try {
        await Linking.openURL(simpleMailUrl);
        console.log("Email app opened successfully");
        return; // 성공하면 바로 종료
      } catch (openError) {
        console.log("Direct open failed, checking canOpenURL:", openError);

        // 직접 열기가 실패하면 canOpenURL로 확인
        const canOpen = await Linking.canOpenURL("mailto:");
        console.log("Can open mailto scheme:", canOpen);

        if (canOpen) {
          // 다시 한번 시도
          await Linking.openURL(simpleMailUrl);
          console.log("Email app opened on retry");
        } else {
          // 정말 이메일 앱이 없는 경우
          throw new Error("No email app available");
        }
      }
    } catch (error) {
      console.error("All email opening methods failed:", error);
      Alert.alert(
        "이메일 앱을 열 수 없어요",
        "getposty@gmail.com 주소를 복사해서 직접 이메일을 보내주세요.",
        [
          { text: "취소", style: "cancel" },
          { text: "이메일 복사", onPress: handleCopyEmail },
        ]
      );
    }
  };

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim() || !selectedCategory) {
      Alert.alert("알림", "모든 필드를 입력해주세요.");
      return;
    }

    const email = "getposty@gmail.com";
    const categoryLabel =
      categories.find((c) => c.id === selectedCategory)?.label || "문의";

    try {
      const encodedSubject = encodeURIComponent(
        `[${categoryLabel}] ${subject}`
      );
      const encodedBody = encodeURIComponent(message);
      const fullMailUrl = `mailto:${email}?subject=${encodedSubject}&body=${encodedBody}`;

      console.log("Trying to open email with content:", fullMailUrl);

      // 직접 열기 시도
      try {
        await Linking.openURL(fullMailUrl);
        console.log("Email app opened with content");
        return;
      } catch (openError) {
        console.log(
          "Full mailto URL failed, trying simple version:",
          openError
        );

        // 파라미터가 있는 URL이 실패하면 간단한 버전으로 시도
        const simpleMailUrl = `mailto:${email}`;
        await Linking.openURL(simpleMailUrl);
        console.log("Email app opened with simple URL");

        // 사용자에게 수동으로 내용 입력하라고 알림
        Alert.alert(
          "이메일 앱이 열렸습니다",
          `제목: [${categoryLabel}] ${subject}\n\n${message}\n\n위 내용을 복사해서 이메일에 붙여넣어 주세요.`,
          [
            {
              text: "내용 복사",
              onPress: () => {
                const emailContent = `제목: [${categoryLabel}] ${subject}\n\n${message}`;
                Clipboard.setString(emailContent);
                Alert.alert("복사됨", "이메일 내용이 복사되었습니다.");
              },
            },
            { text: "확인" },
          ]
        );
      }
    } catch (error) {
      console.error("All email methods failed:", error);
      // 모든 방법이 실패하면 복사 옵션 제공
      Alert.alert(
        "이메일 앱을 열 수 없어요",
        "이메일 주소와 내용을 복사해서 직접 보내주세요.",
        [
          { text: "취소", style: "cancel" },
          {
            text: "내용 복사",
            onPress: () => {
              const categoryLabel =
                categories.find((c) => c.id === selectedCategory)?.label ||
                "문의";
              const emailContent = `받는 사람: getposty@gmail.com\n제목: [${categoryLabel}] ${subject}\n\n${message}`;
              Clipboard.setString(emailContent);
              Alert.alert("복사됨", "이메일 정보가 모두 복사되었습니다.");
            },
          },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <SafeIcon name="chevron-back" size={24} color={colors.text.primary} />
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
              <SafeIcon name="mail" size={24} color={colors.primary} />
              <Text style={styles.emailTitle}>이메일로 문의하기</Text>
            </View>
            <Text style={styles.emailAddress}>getposty@gmail.com</Text>
            <View style={styles.emailActions}>
              <TouchableOpacity
                style={styles.emailButton}
                onPress={handleCopyEmail}
              >
                <SafeIcon name="copy-outline" size={18} color={colors.primary} />
                <Text style={styles.emailButtonText}>복사</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.emailButton, styles.emailButtonPrimary]}
                onPress={() => handleOpenEmail()}
              >
                <SafeIcon name="mail-outline" size={18} color={colors.white} />
                <Text
                  style={[
                    styles.emailButtonText,
                    styles.emailButtonTextPrimary,
                  ]}
                >
                  이메일 앱 열기
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 빠른 문의 양식 */}
          <View style={styles.formSection}>
            <Text style={styles.formTitle}>빠른 문의</Text>
            <Text style={styles.formSubtitle}>
              아래 양식을 작성하면 이메일 앱에서 바로 보낼 수 있어요
            </Text>

            {/* 카테고리 선택 */}
            <View style={styles.categoryContainer}>
              {categories.map((category) => (
                <Pressable
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category.id &&
                      styles.categoryButtonActive,
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <Icon
                    name={category.icon}
                    size={16}
                    color={
                      selectedCategory === category.id
                        ? colors.white
                        : colors.text.secondary
                    }
                  />
                  <Text
                    style={[
                      styles.categoryText,
                      selectedCategory === category.id &&
                        styles.categoryTextActive,
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
              <SafeIcon name="send" size={18} color={colors.white} />
            </TouchableOpacity>
          </View>

          {/* 안내사항 */}
          <View style={styles.infoSection}>
            <View style={styles.infoItem}>
              <Icon
                name="time-outline"
                size={20}
                color={colors.text.secondary}
              />
              <Text style={styles.infoText}>
                평일 기준 24시간 이내 답변드려요
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Icon
                name="globe-outline"
                size={20}
                color={colors.text.secondary}
              />
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
  const isDark = colors.background === "#1A202C";

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    keyboardView: {
      flex: 1,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: SPACING.md,
      paddingVertical: SPACING.md,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surface,
      justifyContent: "center",
      alignItems: "center",
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
      paddingBottom: SPACING.xxl,
    },
    emailCard: {
      backgroundColor: colors.surface,
      marginHorizontal: SPACING.lg,
      marginTop: SPACING.lg,
      padding: SPACING.lg,
      borderRadius: BORDER_RADIUS.large,
      borderWidth: 1,
      borderColor: colors.primary + "30",
    },
    emailHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.sm,
      marginBottom: SPACING.sm,
    },
    emailTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text.primary,
    },
    emailAddress: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.primary,
      marginBottom: SPACING.md,
    },
    emailActions: {
      flexDirection: "row",
      gap: SPACING.sm,
    },
    emailButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: SPACING.xs,
      paddingVertical: SPACING.sm,
      borderRadius: BORDER_RADIUS.medium,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    emailButtonPrimary: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    emailButtonText: {
      fontSize: FONT_SIZES.small,
      fontWeight: "600",
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
      fontWeight: "700",
      color: colors.text.primary,
      marginBottom: SPACING.xs,
    },
    formSubtitle: {
      fontSize: FONT_SIZES.small,
      color: colors.text.secondary,
      marginBottom: SPACING.lg,
    },
    categoryContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: SPACING.sm,
      marginBottom: SPACING.lg,
    },
    categoryButton: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: SPACING.sm,
      paddingHorizontal: SPACING.md,
      borderRadius: 50,
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
      fontWeight: "500",
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
      fontWeight: "600",
      color: colors.text.secondary,
      marginBottom: SPACING.sm,
    },
    input: {
      backgroundColor: colors.surface,
      borderRadius: BORDER_RADIUS.medium,
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
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary,
      paddingVertical: SPACING.md,
      borderRadius: BORDER_RADIUS.medium,
      gap: SPACING.sm,
    },
    submitButtonText: {
      fontSize: FONT_SIZES.medium,
      fontWeight: "600",
      color: colors.white,
    },
    infoSection: {
      paddingHorizontal: SPACING.lg,
      paddingTop: SPACING.xl,
      gap: SPACING.sm,
    },
    infoItem: {
      flexDirection: "row",
      alignItems: "center",
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

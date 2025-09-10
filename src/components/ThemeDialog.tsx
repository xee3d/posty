import React, { useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from "react-native";
import {
  useTheme,
  THEME_COLORS,
  type ThemeMode,
} from "../contexts/ThemeContext";
import { SafeIcon } from "../utils/SafeIcon";
import Icon from "react-native-vector-icons/Ionicons";

const { width } = Dimensions.get("window");

interface ThemeDialogProps {
  visible: boolean;
  onClose: () => void;
}

export default function ThemeDialog({ visible, onClose }: ThemeDialogProps) {
  const { themeMode, themeColor, colors, setThemeMode, setThemeColor } =
    useTheme();

  const handleModeSelect = (mode: ThemeMode) => {
    setThemeMode(mode);
  };

  const handleColorSelect = (color: string) => {
    setThemeColor(color);
  };

  const getModeIcon = (mode: ThemeMode) => {
    switch (mode) {
      case "light":
        return "sunny";
      case "dark":
        return "moon";
      case "system":
        return "phone-portrait";
      default:
        return "phone-portrait";
    }
  };

  const getModeTitle = (mode: ThemeMode) => {
    switch (mode) {
      case "light":
        return "라이트 모드";
      case "dark":
        return "다크 모드";
      case "system":
        return "시스템 설정 따르기";
      default:
        return "시스템 설정 따르기";
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[styles.dialog, { backgroundColor: colors.cardBackground }]}
        >
          {/* 헤더 */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              테마 설정
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <SafeIcon
                name="close"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* 모드 선택 */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              모드 선택
            </Text>

            {(["light", "dark", "system"] as ThemeMode[]).map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.option,
                  { backgroundColor: colors.background },
                  themeMode === mode && {
                    backgroundColor: `${themeColor}20`,
                    borderColor: themeColor,
                    borderWidth: 1,
                  },
                ]}
                onPress={() => handleModeSelect(mode)}
              >
                <Icon
                  name={getModeIcon(mode)}
                  size={20}
                  color={
                    themeMode === mode ? themeColor : colors.textSecondary
                  }
                  style={styles.modeIcon}
                />
                <Text
                  style={[styles.optionText, { color: colors.textPrimary }]}
                >
                  {getModeTitle(mode)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* 테마 색상 */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              테마 색상
            </Text>
            <View style={styles.colorPalette}>
              {THEME_COLORS.map((color, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    themeColor === color && styles.colorOptionSelected,
                  ]}
                  onPress={() => handleColorSelect(color)}
                >
                  {themeColor === color && (
                    <SafeIcon
                      name="checkmark"
                      size={18}
                      color="#FFFFFF"
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 버튼들 */}
          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.buttonCancel, { borderColor: colors.border }]}
              onPress={onClose}
            >
              <Text
                style={[styles.buttonCancelText, { color: colors.textPrimary }]}
              >
                취소
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.buttonConfirm, { backgroundColor: themeColor }]}
              onPress={onClose}
            >
              <Text style={styles.buttonConfirmText}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  dialog: {
    borderRadius: 16,
    width: Math.min(width - 48, 320),
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  closeButton: {
    padding: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 6,
  },
  modeIcon: {
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
    fontWeight: "500",
  },
  colorPalette: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  colorOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  colorOptionSelected: {
    borderWidth: 2,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  buttonCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  buttonCancelText: {
    fontSize: 16,
    fontWeight: "600",
  },
  buttonConfirm: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonConfirmText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
  },
});

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { useTheme, THEME_COLORS } from "../contexts/ThemeContext";
import ThemeDialog from "../components/ThemeDialog";

interface ThemeTestScreenProps {
  onNavigate: (tab: string) => void;
}

export default function ThemeTestScreen({ onNavigate }: ThemeTestScreenProps) {
  const { colors, isDark, themeColor, themeMode } = useTheme();
  const [showThemeDialog, setShowThemeDialog] = useState(false);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={[styles.content, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View
          style={[styles.header, { backgroundColor: colors.cardBackground }]}
        >
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            🎨 테마 시스템 테스트
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            현재: {themeMode} 모드, {isDark ? "다크" : "라이트"} 테마
          </Text>
        </View>

        {/* Current Theme Info */}
        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            현재 테마 정보
          </Text>

          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: colors.textPrimary }]}>
              액센트 색상:
            </Text>
            <View style={[styles.colorBox, { backgroundColor: themeColor }]} />
            <Text style={[styles.value, { color: colors.textSecondary }]}>
              {themeColor}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: colors.textPrimary }]}>
              모드:{" "}
            </Text>
            <Text style={[styles.value, { color: colors.accent }]}>
              {themeMode}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: colors.textPrimary }]}>
              다크 모드:{" "}
            </Text>
            <Text style={[styles.value, { color: colors.accent }]}>
              {isDark ? "YES" : "NO"}
            </Text>
          </View>
        </View>

        {/* Color Palette */}
        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            사용 가능한 색상
          </Text>

          <View style={styles.colorGrid}>
            {THEME_COLORS.map((color, index) => (
              <View key={index} style={styles.colorItem}>
                <View
                  style={[styles.colorSwatch, { backgroundColor: color }]}
                />
                <Text
                  style={[styles.colorText, { color: colors.textSecondary }]}
                >
                  {color}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Test Colors */}
        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            색상 테스트
          </Text>

          <Text style={[styles.testText, { color: colors.textPrimary }]}>
            Primary Text
          </Text>
          <Text style={[styles.testText, { color: colors.textSecondary }]}>
            Secondary Text
          </Text>
          <Text style={[styles.testText, { color: colors.textTertiary }]}>
            Tertiary Text
          </Text>
          <Text style={[styles.testText, { color: colors.accent }]}>
            Accent Color
          </Text>
          <Text style={[styles.testText, { color: colors.success }]}>
            Success
          </Text>
          <Text style={[styles.testText, { color: colors.warning }]}>
            Warning
          </Text>
          <Text style={[styles.testText, { color: colors.error }]}>Error</Text>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.accent }]}
          onPress={() => setShowThemeDialog(true)}
        >
          <Text style={styles.buttonText}>테마 변경</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.textSecondary }]}
          onPress={() => onNavigate("home")}
        >
          <Text style={styles.buttonText}>홈으로 돌아가기</Text>
        </TouchableOpacity>
      </View>

      {/* Theme Dialog */}
      <ThemeDialog
        visible={showThemeDialog}
        onClose={() => setShowThemeDialog(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    marginRight: 8,
  },
  value: {
    fontSize: 16,
    fontWeight: "500",
  },
  colorBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 8,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  colorItem: {
    alignItems: "center",
    width: 60,
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginBottom: 4,
  },
  colorText: {
    fontSize: 10,
    textAlign: "center",
  },
  testText: {
    fontSize: 16,
    marginBottom: 4,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

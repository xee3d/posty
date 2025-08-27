import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { useTheme, THEME_COLORS } from '../contexts/ThemeContext';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import ThemeDialog from './ThemeDialog';

export default function ThemeDemo() {
  const { colors, isDark, themeColor, themeMode } = useTheme();
  const [showThemeDialog, setShowThemeDialog] = useState(false);

  return (
    <ThemedView style={styles.container} colorKey="background">
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <ThemedView style={styles.header} colorKey="cardBackground">
          <ThemedText type="title" colorKey="textPrimary">
            Theme System Demo
          </ThemedText>
          <ThemedText colorKey="textSecondary">
            Current: {themeMode} mode, {isDark ? 'Dark' : 'Light'} theme
          </ThemedText>
        </ThemedView>

        {/* Theme Info Card */}
        <ThemedView style={styles.card} colorKey="cardBackground">
          <ThemedText type="heading" colorKey="textPrimary" style={styles.cardTitle}>
            Theme Information
          </ThemedText>
          
          <View style={styles.colorInfo}>
            <ThemedText colorKey="textPrimary">Accent Color:</ThemedText>
            <View style={[styles.colorSwatch, { backgroundColor: themeColor }]} />
            <ThemedText colorKey="textSecondary">{themeColor}</ThemedText>
          </View>

          <View style={styles.infoRow}>
            <ThemedText colorKey="textPrimary">Mode: </ThemedText>
            <ThemedText colorKey="accent">{themeMode}</ThemedText>
          </View>

          <View style={styles.infoRow}>
            <ThemedText colorKey="textPrimary">Dark: </ThemedText>
            <ThemedText colorKey="accent">{isDark ? 'Yes' : 'No'}</ThemedText>
          </View>
        </ThemedView>

        {/* Color Palette */}
        <ThemedView style={styles.card} colorKey="cardBackground">
          <ThemedText type="heading" colorKey="textPrimary" style={styles.cardTitle}>
            Available Colors
          </ThemedText>
          
          <View style={styles.colorPalette}>
            {THEME_COLORS.map((color, index) => (
              <View key={index} style={styles.colorItem}>
                <View style={[styles.colorSwatch, { backgroundColor: color }]} />
                <ThemedText colorKey="textSecondary" style={styles.colorText}>
                  {color}
                </ThemedText>
              </View>
            ))}
          </View>
        </ThemedView>

        {/* Text Examples */}
        <ThemedView style={styles.card} colorKey="cardBackground">
          <ThemedText type="heading" colorKey="textPrimary" style={styles.cardTitle}>
            Text Styles
          </ThemedText>
          
          <ThemedText type="title" colorKey="textPrimary">Title Text</ThemedText>
          <ThemedText type="heading" colorKey="textPrimary">Heading Text</ThemedText>
          <ThemedText type="subtitle" colorKey="textPrimary">Subtitle Text</ThemedText>
          <ThemedText type="default" colorKey="textPrimary">Default Text</ThemedText>
          <ThemedText type="caption" colorKey="textSecondary">Caption Text</ThemedText>
          <ThemedText type="link" colorKey="accent">Link Text</ThemedText>
        </ThemedView>

        {/* Status Colors */}
        <ThemedView style={styles.card} colorKey="cardBackground">
          <ThemedText type="heading" colorKey="textPrimary" style={styles.cardTitle}>
            Status Colors
          </ThemedText>
          
          <View style={styles.statusRow}>
            <ThemedText colorKey="success">Success</ThemedText>
            <ThemedText colorKey="warning">Warning</ThemedText>
            <ThemedText colorKey="error">Error</ThemedText>
          </View>
        </ThemedView>

        {/* Theme Button */}
        <TouchableOpacity
          style={[styles.themeButton, { backgroundColor: colors.accent }]}
          onPress={() => setShowThemeDialog(true)}
        >
          <ThemedText style={styles.themeButtonText} lightColor="#FFFFFF" darkColor="#FFFFFF">
            Change Theme
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>

      {/* Theme Dialog */}
      <ThemeDialog
        visible={showThemeDialog}
        onClose={() => setShowThemeDialog(false)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  header: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  card: {
    padding: 16,
    borderRadius: 12,
  },
  cardTitle: {
    marginBottom: 12,
  },
  colorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  colorSwatch: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  colorPalette: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorItem: {
    alignItems: 'center',
    gap: 4,
  },
  colorText: {
    fontSize: 12,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 16,
  },
  themeButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  themeButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
});
import { useTheme } from '@/contexts/ThemeContext';
import { useNavigation } from '@/contexts/NavigationContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ThemeDialog() {
  const { themeMode, themeColor, colors, setThemeMode, setThemeColor } = useTheme();
  const { showThemeDialog, setShowThemeDialog } = useNavigation();

  return (
    <Modal
      visible={showThemeDialog}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowThemeDialog(false)}
    >
      <View style={styles.themeOverlay}>
        <View style={[styles.themeDialog, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.themeHeader}>
            <Text style={[styles.themeTitle, { color: colors.textPrimary }]}>테마 설정</Text>
            <TouchableOpacity onPress={() => setShowThemeDialog(false)}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* 모드 선택 */}
          <View style={styles.themeSection}>
            <Text style={[styles.themeSectionTitle, { color: colors.textPrimary }]}>모드 선택</Text>
            
            <TouchableOpacity 
              style={[
                styles.themeOption, 
                { backgroundColor: colors.background },
                themeMode === 'light' && { backgroundColor: `${themeColor}20`, borderColor: themeColor, borderWidth: 1 }
              ]}
              onPress={() => setThemeMode('light')}
            >
              <Ionicons name="sunny" size={20} color={themeMode === 'light' ? themeColor : colors.textSecondary} />
              <Text style={[styles.themeOptionText, { color: colors.textPrimary }]}>라이트 모드</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.themeOption, 
                { backgroundColor: colors.background },
                themeMode === 'dark' && { backgroundColor: `${themeColor}20`, borderColor: themeColor, borderWidth: 1 }
              ]}
              onPress={() => setThemeMode('dark')}
            >
              <Ionicons name="moon" size={20} color={themeMode === 'dark' ? themeColor : colors.textSecondary} />
              <Text style={[styles.themeOptionText, { color: colors.textPrimary }]}>다크 모드</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.themeOption, 
                { backgroundColor: colors.background },
                themeMode === 'system' && { backgroundColor: `${themeColor}20`, borderColor: themeColor, borderWidth: 1 }
              ]}
              onPress={() => setThemeMode('system')}
            >
              <Ionicons name="laptop" size={20} color={themeMode === 'system' ? themeColor : colors.textSecondary} />
              <Text style={[styles.themeOptionText, { color: colors.textPrimary }]}>시스템 설정 따르기</Text>
            </TouchableOpacity>
          </View>

          {/* 테마 색상 */}
          <View style={styles.themeSection}>
            <Text style={[styles.themeSectionTitle, { color: colors.textPrimary }]}>테마 색상</Text>
            <View style={styles.colorPalette}>
              {['#7C65FF', '#3B82F6', '#10B981', '#EF4444', '#F59E0B'].map((color, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    themeColor === color && styles.colorOptionSelected
                  ]}
                  onPress={() => setThemeColor(color)}
                />
              ))}
            </View>
          </View>

          {/* 버튼들 */}
          <View style={styles.themeButtons}>
            <TouchableOpacity 
              style={[styles.themeButtonCancel, { borderColor: colors.border, backgroundColor: colors.cardBackground }]}
              onPress={() => setShowThemeDialog(false)}
            >
              <Text style={[styles.themeButtonCancelText, { color: colors.textPrimary }]}>취소</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.themeButtonConfirm, { backgroundColor: themeColor }]}
              onPress={() => {
                setShowThemeDialog(false);
              }}
            >
              <Text style={styles.themeButtonConfirmText}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  themeOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  themeDialog: {
    borderRadius: 16,
    width: '100%',
    maxWidth: 320,
    padding: 24,
  },
  themeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  themeTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  themeSection: {
    marginBottom: 24,
  },
  themeSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
    gap: 8,
  },
  themeOptionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  colorPalette: {
    flexDirection: 'row',
    gap: 8,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  colorOptionSelected: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  themeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  themeButtonCancel: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  themeButtonCancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
  themeButtonConfirm: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  themeButtonConfirmText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
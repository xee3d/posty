import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Alert,
} from 'react-native';
import languageService, { 
  SupportedLanguage, 
  LanguageConfig,
  getLanguageConfig 
} from '../../services/localization/languageService';
import { useAppTheme } from '../../hooks/useAppTheme';
import SafeIcon from '../../utils/SafeIcon';
import Icon from 'react-native-vector-icons/Ionicons';
import { SPACING, FONT_SIZES } from '../../utils/constants';

interface LanguageSettingsProps {
  onLanguageChange?: (language: SupportedLanguage) => void;
}

const LanguageSettings: React.FC<LanguageSettingsProps> = ({ onLanguageChange }) => {
  const { colors, isDark } = useAppTheme();
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('ko');
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [supportedLanguages, setSupportedLanguages] = useState<LanguageConfig[]>([]);
  const [isSystemLanguage, setIsSystemLanguage] = useState(false);

  useEffect(() => {
    initializeLanguageSettings();
  }, []);

  const initializeLanguageSettings = async () => {
    try {
      const current = languageService.getCurrentLanguage();
      const languages = languageService.getSupportedLanguages();
      const isUsingSystem = languageService.isUsingSystemLanguage();
      
      setCurrentLanguage(current);
      setSupportedLanguages(languages);
      setIsSystemLanguage(isUsingSystem);
    } catch (error) {
      console.error('Failed to initialize language settings:', error);
    }
  };

  const handleLanguageChange = async (language: SupportedLanguage) => {
    try {
      await languageService.setLanguage(language);
      setCurrentLanguage(language);
      setIsSystemLanguage(language === languageService.getCurrentLanguage());
      setShowLanguageModal(false);
      
      if (onLanguageChange) {
        onLanguageChange(language);
      }

      Alert.alert(
        getLanguageConfig(language).name,
        '언어가 변경되었습니다. 새로 생성되는 콘텐츠부터 적용됩니다.',
        [{ text: '확인' }]
      );
    } catch (error) {
      console.error('Failed to change language:', error);
      Alert.alert('오류', '언어 변경 중 오류가 발생했습니다.');
    }
  };

  const handleResetToSystem = async () => {
    try {
      await languageService.resetToSystemLanguage();
      const newLanguage = languageService.getCurrentLanguage();
      setCurrentLanguage(newLanguage);
      setIsSystemLanguage(true);
      
      if (onLanguageChange) {
        onLanguageChange(newLanguage);
      }

      Alert.alert(
        '시스템 언어',
        `시스템 언어(${getLanguageConfig(newLanguage).nativeName})로 설정되었습니다.`,
        [{ text: '확인' }]
      );
    } catch (error) {
      console.error('Failed to reset to system language:', error);
    }
  };

  const renderLanguageItem = ({ item }: { item: LanguageConfig }) => {
    const isSelected = item.code === currentLanguage;
    
    return (
      <TouchableOpacity
        style={[
          styles.languageItem,
          {
            backgroundColor: isSelected 
              ? (isDark ? colors.primary + '15' : colors.primary + '08')
              : colors.surface,
            borderColor: isSelected ? colors.primary : colors.border,
          },
        ]}
        onPress={() => handleLanguageChange(item.code)}
        activeOpacity={0.7}
      >
        <View style={styles.languageInfo}>
          <Text style={styles.languageFlag}>{item.flag}</Text>
          <View style={styles.languageNames}>
            <Text style={[
              styles.languageName, 
              { color: isSelected ? colors.primary : colors.text.primary }
            ]}>
              {item.nativeName}
            </Text>
            <Text style={[styles.languageNameEn, { color: colors.text.secondary }]}>
              {item.name}
            </Text>
          </View>
        </View>
        {isSelected && (
          <View style={[styles.selectedIndicator, { backgroundColor: colors.primary }]}>
            <SafeIcon name="checkmark" size={14} color={colors.white} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const currentConfig = getLanguageConfig(currentLanguage);

  return (
    <>
      {/* 언어 설정 - 통일된 설정 스타일 */}
      <TouchableOpacity
        style={[styles.settingItem, { borderBottomColor: colors.border + '50' }]}
        onPress={() => setShowLanguageModal(true)}
        activeOpacity={0.7}
      >
        <View style={styles.settingInfo}>
          <View style={styles.settingHeader}>
            <Icon
              name="language-outline"
              size={20}
              color={colors.text.secondary}
            />
            <Text style={[styles.settingLabel, { color: colors.text.primary }]}>언어</Text>
          </View>
          <Text style={[styles.settingDescription, { color: colors.text.tertiary }]}>
            {currentConfig.nativeName} {isSystemLanguage ? '(시스템)' : ''}
          </Text>
        </View>
        <View style={styles.settingRight}>
          <Text style={[styles.currentValue, { color: colors.text.secondary }]}>
            {currentConfig.flag}
          </Text>
          <Icon
            name="chevron-forward"
            size={20}
            color={colors.text.tertiary}
          />
        </View>
      </TouchableOpacity>

      {/* 언어 선택 모달 */}
      <Modal
        visible={showLanguageModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
              <Text style={[styles.modalCancelButton, { color: colors.primary }]}>
                취소
              </Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text.primary }]}>
              언어 선택
            </Text>
            <View style={{ width: 50 }} />
          </View>

          <FlatList
            data={supportedLanguages}
            renderItem={renderLanguageItem}
            keyExtractor={(item) => item.code}
            style={styles.languageList}
            contentContainerStyle={styles.languageListContent}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={
              !isSystemLanguage ? (
                <TouchableOpacity
                  style={[
                    styles.systemLanguageButton,
                    {
                      backgroundColor: isDark ? colors.surface : colors.background,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => {
                    handleResetToSystem();
                    setShowLanguageModal(false);
                  }}
                >
                  <SafeIcon
                    name="phone-portrait-outline"
                    size={20}
                    color={colors.text.secondary}
                  />
                  <Text style={[styles.systemLanguageText, { color: colors.text.secondary }]}>
                    시스템 언어로 재설정
                  </Text>
                </TouchableOpacity>
              ) : null
            }
          />

          <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
            <Text style={[styles.footerNote, { color: colors.text.secondary }]}>
              언어 변경 시 새로 생성되는 콘텐츠부터 선택한 언어로 표시됩니다.
            </Text>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 0.5,
  },
  settingInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: 4,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: FONT_SIZES.small,
    marginLeft: 28,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  currentValue: {
    fontSize: 20,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
  },
  modalCancelButton: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  languageList: {
    flex: 1,
  },
  languageListContent: {
    paddingVertical: 16,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 18,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  languageFlag: {
    fontSize: 32,
    marginRight: 16,
  },
  languageNames: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 3,
  },
  languageNameEn: {
    fontSize: 13,
    opacity: 0.6,
  },
  selectedIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 0.5,
  },
  footerNote: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  systemLanguageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  systemLanguageText: {
    fontSize: 15,
    fontWeight: '500',
  },
});

export default LanguageSettings;
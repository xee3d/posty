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
import { useAppTheme } from '../../hooks/useAppTheme';
import SafeIcon from '../../utils/SafeIcon';
import Icon from 'react-native-vector-icons/Ionicons';
import { SPACING, FONT_SIZES } from '../../utils/constants';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppSelector } from '../../hooks/redux';

const AI_AGENT_STORAGE_KEY = "@ai_agent_preference";

export type AIAgent = "gpt-mini" | "gemini";

interface AIAgentConfig {
  id: AIAgent;
  name: string;
  nativeName: string;
  description: string;
  icon: string;
  color: string;
  badge: string;
  isAvailable: boolean;
  fallbackInfo?: string;
  requiresPro?: boolean;
}

interface AIAgentSettingsProps {
  onAgentChange?: (agent: AIAgent) => void;
}

const AIAgentSettings: React.FC<AIAgentSettingsProps> = ({ onAgentChange }) => {
  const { colors, isDark } = useAppTheme();
  const { t } = useTranslation();
  const subscriptionPlan = useAppSelector((state) => state.user.subscriptionPlan);
  const isPro = subscriptionPlan === 'pro';
  const [currentAgent, setCurrentAgent] = useState<AIAgent>('gpt-mini');
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [availableAgents, setAvailableAgents] = useState<AIAgentConfig[]>([]);

  const aiAgentConfigs: AIAgentConfig[] = [
    {
      id: "gpt-mini",
      name: "GPT-4o Mini",
      nativeName: "GPT-4o Mini",
      description: t('settings.aiAgent.agents.gptMini.description'),
      icon: "flash",
      color: "#10B981",
      badge: "GPT",
      isAvailable: true,
      requiresPro: false,
    },
    {
      id: "gemini",
      name: "Gemini 2.5 Flash Lite",
      nativeName: "Gemini 2.5 Flash Lite",
      description: t('settings.aiAgent.agents.gemini.description'),
      icon: "sparkles",
      color: "#8B5CF6",
      badge: "GEM",
      isAvailable: isPro, // Pro 사용자만 사용 가능
      requiresPro: true,
      fallbackInfo: isPro ? undefined : t('settings.aiAgent.proRequired'),
    },
  ];

  useEffect(() => {
    initializeAgentSettings();
  }, []);

  useEffect(() => {
    // isPro 상태 변경 시 에이전트 목록 업데이트
    setAvailableAgents(aiAgentConfigs);
  }, [isPro]);

  const initializeAgentSettings = async () => {
    try {
      const savedAgent = await AsyncStorage.getItem(AI_AGENT_STORAGE_KEY);
      const current = (savedAgent === "gpt-mini" || savedAgent === "gemini")
        ? (savedAgent as AIAgent)
        : 'gpt-mini';

      // Pro가 아닌 사용자가 Gemini를 선택한 경우 GPT로 변경
      if (current === "gemini" && !isPro) {
        setCurrentAgent('gpt-mini');
        await AsyncStorage.setItem(AI_AGENT_STORAGE_KEY, 'gpt-mini');
      } else {
        setCurrentAgent(current);
      }

      // AI 에이전트 설정
      setAvailableAgents(aiAgentConfigs);
    } catch (error) {
      console.error('Failed to initialize AI agent settings:', error);
      // 오류 시 기본 설정 사용
      setAvailableAgents(aiAgentConfigs);
    }
  };


  const handleAgentChange = async (agent: AIAgent) => {
    try {
      console.log('[AIAgentSettings] Changing agent to:', agent);
      await AsyncStorage.setItem(AI_AGENT_STORAGE_KEY, agent);
      setCurrentAgent(agent);
      setShowAgentModal(false);
      
      if (onAgentChange) {
        onAgentChange(agent);
      }

      // 에이전트 변경 완료 - 팝업 제거됨
    } catch (error) {
      console.error('Failed to change AI agent:', error);
      Alert.alert('Error', 'AI agent change failed.');
    }
  };

  const renderAgentItem = ({ item }: { item: AIAgentConfig }) => {
    const isSelected = item.id === currentAgent;
    const agentConfig = aiAgentConfigs.find(a => a.id === item.id);
    
    return (
      <TouchableOpacity
        style={[
          styles.agentItem,
          {
            backgroundColor: isSelected 
              ? (isDark ? agentConfig?.color + '15' : agentConfig?.color + '08')
              : colors.surface,
            borderColor: isSelected ? agentConfig?.color : colors.border,
            opacity: item.isAvailable ? 1 : 0.6,
          },
        ]}
        onPress={() => item.isAvailable ? handleAgentChange(item.id) : null}
        activeOpacity={item.isAvailable ? 0.7 : 1}
      >
        <View style={styles.agentInfo}>
          <View style={[
            styles.agentBadge, 
            { 
              backgroundColor: agentConfig?.color + '15', 
              borderColor: agentConfig?.color + '30' 
            }
          ]}>
            <Text style={[styles.agentBadgeText, { color: agentConfig?.color }]}>
              {agentConfig?.badge}
            </Text>
          </View>
          <View style={styles.agentNames}>
            <View style={styles.agentNameRow}>
              <Text style={[
                styles.agentName,
                { color: isSelected ? agentConfig?.color : colors.text.primary }
              ]}>
                {item.nativeName}
              </Text>
              {item.requiresPro && (
                <View style={[styles.proBadge, { backgroundColor: colors.primary + '20', borderColor: colors.primary + '40' }]}>
                  <SafeIcon name="star" size={10} color={colors.primary} />
                  <Text style={[styles.proText, { color: colors.primary }]}>
                    PRO
                  </Text>
                </View>
              )}
              {!item.isAvailable && item.requiresPro && (
                <View style={[styles.unavailableBadge, { backgroundColor: colors.text.tertiary + '20' }]}>
                  <Text style={[styles.unavailableText, { color: colors.text.tertiary }]}>
                    {t('settings.aiAgent.subscriptionRequired')}
                  </Text>
                </View>
              )}
            </View>
            <Text style={[styles.agentDescription, { color: colors.text.secondary }]}>
              {item.description}
            </Text>
            {!item.isAvailable && item.fallbackInfo && (
              <Text style={[styles.fallbackInfo, { color: colors.text.tertiary }]}>
                {item.fallbackInfo}
              </Text>
            )}
          </View>
        </View>
        {isSelected && (
          <View style={[styles.selectedIndicator, { backgroundColor: agentConfig?.color }]}>
            <SafeIcon name="checkmark" size={14} color={colors.white} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const currentConfig = aiAgentConfigs.find(agent => agent.id === currentAgent);

  return (
    <>
      {/* AI 에이전트 설정 - 통일된 설정 스타일 */}
      <TouchableOpacity
        style={[styles.settingItem, { borderBottomColor: colors.border + '50' }]}
        onPress={() => setShowAgentModal(true)}
        activeOpacity={0.7}
      >
        <View style={styles.settingInfo}>
          <View style={styles.settingHeader}>
            <Icon
              name="sparkles-outline"
              size={20}
              color={colors.text.secondary}
            />
            <Text style={[styles.settingLabel, { color: colors.text.primary }]}>
              {t('settings.aiAgent.title', { defaultValue: "AI 에이전트" })}
            </Text>
          </View>
          <Text style={[styles.settingDescription, { color: colors.text.tertiary }]}>
            {t('settings.aiAgent.description', { defaultValue: "콘텐츠 생성에 사용할 AI 모델을 선택하세요" })}
          </Text>
        </View>
        <View style={styles.settingRight}>
          <View style={[
            styles.currentAgentBadge, 
            { 
              backgroundColor: currentConfig?.color + '15', 
              borderColor: currentConfig?.color + '30' 
            }
          ]}>
            <Text style={[styles.currentAgentBadgeText, { color: currentConfig?.color }]}>
              {currentConfig?.badge}
            </Text>
          </View>
          <Icon
            name="chevron-forward"
            size={20}
            color={colors.text.tertiary}
          />
        </View>
      </TouchableOpacity>

      {/* AI 에이전트 선택 모달 */}
      <Modal
        visible={showAgentModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setShowAgentModal(false)}>
              <Text style={[styles.modalCancelButton, { color: colors.primary }]}>
                {t('alerts.buttons.cancel', { defaultValue: "취소" })}
              </Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text.primary }]}>
              {t('settings.aiAgent.selectAgent', { defaultValue: "AI 에이전트 선택" })}
            </Text>
            <View style={{ width: 50 }} />
          </View>

          <FlatList
            data={availableAgents}
            renderItem={renderAgentItem}
            keyExtractor={(item) => item.id}
            style={styles.agentList}
            contentContainerStyle={styles.agentListContent}
            showsVerticalScrollIndicator={false}
          />

          <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
            <Text style={[styles.footerNote, { color: colors.text.secondary }]}>
              {t('settings.aiAgent.note', { defaultValue: "AI 에이전트는 콘텐츠 생성 시 사용되는 AI 모델입니다." })}
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
  currentAgentBadge: {
    width: 28,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  currentAgentBadgeText: {
    fontSize: 10,
    fontWeight: '600',
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
  agentList: {
    flex: 1,
  },
  agentListContent: {
    paddingVertical: 20,
    paddingHorizontal: 4,
  },
  agentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  agentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  agentBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  agentBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  agentNames: {
    flex: 1,
  },
  agentNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  agentName: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: -0.3,
    flexShrink: 1,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
  },
  proText: {
    fontSize: 10,
    fontWeight: '700',
  },
  agentDescription: {
    fontSize: 13,
    lineHeight: 19,
    opacity: 0.85,
  },
  fallbackInfo: {
    fontSize: 12,
    lineHeight: 17,
    fontStyle: 'italic',
    marginTop: 4,
    opacity: 0.7,
  },
  unavailableBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  unavailableText: {
    fontSize: 10,
    fontWeight: '600',
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
});

export default AIAgentSettings;

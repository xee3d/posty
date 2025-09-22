import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { SPACING } from '../../utils/constants';

const TestAIAgentSettings: React.FC = () => {
  const { colors } = useAppTheme();

  return (
    <TouchableOpacity
      style={[styles.settingItem, { borderBottomColor: colors.border + '50' }]}
      onPress={() => console.log('Test AI Agent Settings pressed')}
      activeOpacity={0.7}
    >
      <View style={styles.settingInfo}>
        <Text style={[styles.settingLabel, { color: colors.text.primary }]}>
          🤖 AI 에이전트 설정 (테스트)
        </Text>
        <Text style={[styles.settingDescription, { color: colors.text.tertiary }]}>
          이 텍스트가 보인다면 컴포넌트가 정상적으로 렌더링되고 있습니다
        </Text>
      </View>
    </TouchableOpacity>
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
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
  },
});

export default TestAIAgentSettings;

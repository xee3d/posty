import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Alert } from '../utils/customAlert';
import { showImagePicker } from '../utils/imagePicker';
import { useAppTheme } from '../hooks/useAppTheme';
import { SPACING } from '../utils/constants';

const AlertTestScreen: React.FC = () => {
  const { colors } = useAppTheme();

  const handleImagePicker = async () => {
    try {
      const result = await showImagePicker({
        title: '사진 선택',
        quality: 0.8,
      });
      
      if (!result.didCancel && result.assets && result.assets[0]) {
        Alert.alert('성공', '사진이 선택되었습니다!', [
          { text: '확인', style: 'default' }
        ]);
      }
    } catch (error) {
      Alert.alert('오류', '사진 선택 중 문제가 발생했습니다.', [
        { text: '확인', style: 'default' }
      ]);
    }
  };

  const showSuccessAlert = () => {
    Alert.alert('성공', '작업이 성공적으로 완료되었습니다!', [
      { text: '확인', style: 'default' }
    ]);
  };

  const showErrorAlert = () => {
    Alert.alert('오류', '작업 중 문제가 발생했습니다.', [
      { text: '확인', style: 'default' }
    ]);
  };

  const showWarningAlert = () => {
    Alert.alert('주의', '이 작업은 되돌릴 수 없습니다.', [
      { text: '취소', style: 'cancel' },
      { text: '계속', style: 'destructive' }
    ]);
  };

  const showQuestionAlert = () => {
    Alert.alert('질문', '정말로 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive' }
    ]);
  };

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Alert 테스트</Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>이미지 선택</Text>
          <TouchableOpacity style={styles.button} onPress={handleImagePicker}>
            <Text style={styles.buttonText}>사진 선택 팝업</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Alert 타입</Text>
          
          <TouchableOpacity style={[styles.button, styles.successButton]} onPress={showSuccessAlert}>
            <Text style={styles.buttonText}>성공 Alert</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.button, styles.errorButton]} onPress={showErrorAlert}>
            <Text style={styles.buttonText}>오류 Alert</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.button, styles.warningButton]} onPress={showWarningAlert}>
            <Text style={styles.buttonText}>경고 Alert (2개 버튼)</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.button, styles.questionButton]} onPress={showQuestionAlert}>
            <Text style={styles.buttonText}>질문 Alert (2개 버튼)</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: SPACING.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: SPACING.xl,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: SPACING.md,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  successButton: {
    backgroundColor: '#10B981',
  },
  errorButton: {
    backgroundColor: '#EF4444',
  },
  warningButton: {
    backgroundColor: '#F59E0B',
  },
  questionButton: {
    backgroundColor: '#3B82F6',
  },
});

export default AlertTestScreen;

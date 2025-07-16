import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Alert } from '../utils/customAlert';
import { useAppTheme } from '../hooks/useAppTheme';

const AlertTestScreen: React.FC = () => {
  const { colors } = useAppTheme();

  const testAlerts = [
    {
      title: '포스티 알림',
      message: '무엇에 대해 쓸지 알려주세요! 🤔',
      buttons: [{ text: 'OK' }],
    },
    {
      title: '성공',
      message: '게시물이 저장되었습니다!',
      buttons: [{ text: '확인' }],
    },
    {
      title: '오류',
      message: '게시물 저장 중 문제가 발생했습니다.',
      buttons: [{ text: '확인' }],
    },
    {
      title: '삭제 확인',
      message: '정말로 이 게시물을 삭제하시겠습니까?',
      buttons: [
        { text: '취소', style: 'cancel' },
        { text: '삭제', style: 'destructive' },
      ],
    },
    {
      title: '사진 선택',
      message: '어떤 방법으로 사진을 선택하시겠어요?',
      buttons: [
        { text: '취소', style: 'cancel' },
        { text: '카메라로 촬영' },
        { text: '갤러리에서 선택' },
      ],
    },
  ];

  const showTestAlert = (index: number) => {
    const alert = testAlerts[index];
    Alert.alert(alert.title, alert.message, alert.buttons as any);
  };

  const styles = createStyles(colors);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>Alert 테스트</Text>
        
        {testAlerts.map((alert, index) => (
          <TouchableOpacity
            key={index}
            style={styles.button}
            onPress={() => showTestAlert(index)}
          >
            <Text style={styles.buttonTitle}>{alert.title}</Text>
            <Text style={styles.buttonSubtitle}>{alert.message}</Text>
          </TouchableOpacity>
        ))}
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
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 20,
  },
  button: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  buttonSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
  },
});

export default AlertTestScreen;

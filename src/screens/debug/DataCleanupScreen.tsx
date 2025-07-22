import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppTheme } from '../../hooks/useAppTheme';
import achievementService from '../../services/achievementService';
import simplePostService from '../../services/simplePostService';

const DataCleanupScreen: React.FC = () => {
  const { colors } = useAppTheme();
  
  const handleClearAllData = async () => {
    Alert.alert(
      '모든 데이터 삭제',
      '정말로 모든 사용자의 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              // 모든 업적 데이터 삭제
              await achievementService.clearAllUsersAchievements();
              
              // 모든 포스트 데이터 삭제
              await simplePostService.clearAllUsersPosts();
              
              // 기타 데이터 삭제
              const keysToRemove = [
                'SIMPLE_POSTS', // 이전 버전 키
                'USER_ACHIEVEMENTS', // 이전 버전 키
                'USER_PROFILE', // 이전 버전 키
              ];
              await AsyncStorage.multiRemove(keysToRemove);
              
              Alert.alert('완료', '모든 데이터가 삭제되었습니다.');
            } catch (error) {
              Alert.alert('오류', '데이터 삭제 중 오류가 발생했습니다.');
              console.error(error);
            }
          }
        }
      ]
    );
  };
  
  const handleShowStorageKeys = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const relevantKeys = keys.filter(key => 
        key.includes('ACHIEVEMENT') || 
        key.includes('POST') || 
        key.includes('PROFILE') ||
        key.includes('STREAK')
      );
      
      Alert.alert(
        '저장된 키 목록',
        relevantKeys.join('\n') || '관련 키가 없습니다.',
        [{ text: '확인' }]
      );
    } catch (error) {
      console.error(error);
    }
  };
  
  const handleClearCurrentUser = async () => {
    Alert.alert(
      '현재 사용자 데이터 삭제',
      '현재 로그인한 사용자의 데이터만 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await achievementService.clearAchievements();
              Alert.alert('완료', '현재 사용자의 업적 데이터가 삭제되었습니다.');
            } catch (error) {
              Alert.alert('오류', '데이터 삭제 중 오류가 발생했습니다.');
              console.error(error);
            }
          }
        }
      ]
    );
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>데이터 관리</Text>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>디버깅 도구</Text>
          
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={handleShowStorageKeys}
          >
            <Text style={styles.buttonText}>저장된 키 목록 보기</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#FF6B6B' }]}
            onPress={handleClearCurrentUser}
          >
            <Text style={styles.buttonText}>현재 사용자 데이터 삭제</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#DC2626' }]}
            onPress={handleClearAllData}
          >
            <Text style={styles.buttonText}>모든 사용자 데이터 삭제</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.warning, { color: '#DC2626' }]}>
            ⚠️ 주의: 데이터 삭제는 되돌릴 수 없습니다!
          </Text>
          <Text style={[styles.info, { color: colors.textSecondary }]}>
            이 화면은 개발/디버깅 목적으로만 사용하세요.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  warning: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  info: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default DataCleanupScreen;

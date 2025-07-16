import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator,  } from 'react-native';
import postyAPI from '../services/postyAPI';

import { Alert } from '../utils/customAlert';
const APITestScreen = () => {
  const [loading, setLoading] = useState(false);
  const [healthStatus, setHealthStatus] = useState(null);
  const [testResult, setTestResult] = useState(null);

  // Health Check 테스트
  const testHealthCheck = async () => {
    setLoading(true);
    try {
      const result = await postyAPI.checkHealth();
      setHealthStatus(result);
      Alert.alert('성공', 'Health check 성공!');
    } catch (error) {
      Alert.alert('오류', `Health check 실패: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Generate Test 테스트
  const testGenerateEndpoint = async () => {
    setLoading(true);
    try {
      const result = await postyAPI.testGenerate();
      setTestResult(result);
      Alert.alert('성공', 'Generate test 성공!');
    } catch (error) {
      Alert.alert('오류', `Generate test 실패: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Generate Content 테스트
  const testGenerateContent = async () => {
    setLoading(true);
    try {
      const result = await postyAPI.generateContent('테스트 프롬프트', {
        tone: 'friendly',
        platform: 'instagram',
      });
      Alert.alert('성공', 'Content generation 성공!');
      console.log('Generated content:', result);
    } catch (error) {
      Alert.alert('오류', `Content generation 실패: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Posty API 테스트</Text>

      <View style={styles.section}>
        <TouchableOpacity
          style={styles.button}
          onPress={testHealthCheck}
          disabled={loading}>
          <Text style={styles.buttonText}>Health Check 테스트</Text>
        </TouchableOpacity>

        {healthStatus && (
          <View style={styles.result}>
            <Text style={styles.resultTitle}>Health Status:</Text>
            <Text>{JSON.stringify(healthStatus, null, 2)}</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={styles.button}
          onPress={testGenerateEndpoint}
          disabled={loading}>
          <Text style={styles.buttonText}>Generate Test (GET) 테스트</Text>
        </TouchableOpacity>

        {testResult && (
          <View style={styles.result}>
            <Text style={styles.resultTitle}>Test Result:</Text>
            <Text>{JSON.stringify(testResult, null, 2)}</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={testGenerateContent}
          disabled={loading}>
          <Text style={styles.buttonText}>Generate Content (POST) 테스트</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButton: {
    backgroundColor: '#28a745',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  result: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  resultTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  loader: {
    marginTop: 20,
  },
});

export default APITestScreen;

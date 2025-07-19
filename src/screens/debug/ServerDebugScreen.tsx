import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAppTheme } from '../../hooks/useAppTheme';
import { SPACING, FONTS } from '../../utils/constants';
import serverAIService from '../../services/serverAIService';
import API_CONFIG, { getApiUrl, getAuthHeader } from '../../config/api';

const ServerDebugScreen: React.FC = () => {
  const { colors, cardTheme } = useAppTheme();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [testPrompt, setTestPrompt] = useState('오늘의 커피 한잔');

  // 서버 상태 체크
  const testHealthCheck = async () => {
    setLoading(true);
    const startTime = Date.now();
    
    try {
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.HEALTH), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const responseTime = Date.now() - startTime;
      const responseText = await response.text();
      
      setResults(prev => [{
        id: Date.now(),
        test: 'Health Check',
        status: response.status,
        success: response.ok,
        responseTime,
        response: responseText,
        headers: Object.fromEntries(response.headers.entries()),
      }, ...prev]);
      
    } catch (error: any) {
      setResults(prev => [{
        id: Date.now(),
        test: 'Health Check',
        success: false,
        error: error.message,
        responseTime: Date.now() - startTime,
      }, ...prev]);
    } finally {
      setLoading(false);
    }
  };

  // 콘텐츠 생성 테스트
  const testGenerate = async () => {
    setLoading(true);
    const startTime = Date.now();
    
    try {
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.GENERATE), {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({
          prompt: testPrompt,
          tone: 'casual',
          platform: 'instagram',
          language: 'ko',
          length: 'medium',
        }),
      });
      
      const responseTime = Date.now() - startTime;
      const responseText = await response.text();
      
      // JSON 파싱 시도
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(responseText);
      } catch (e) {
        parsedResponse = null;
      }
      
      setResults(prev => [{
        id: Date.now(),
        test: 'Generate Content',
        status: response.status,
        success: response.ok,
        responseTime,
        response: responseText,
        parsed: parsedResponse,
        headers: Object.fromEntries(response.headers.entries()),
      }, ...prev]);
      
    } catch (error: any) {
      setResults(prev => [{
        id: Date.now(),
        test: 'Generate Content',
        success: false,
        error: error.message,
        responseTime: Date.now() - startTime,
      }, ...prev]);
    } finally {
      setLoading(false);
    }
  };

  // 서버 정보 표시
  const testServerInfo = () => {
    setResults(prev => [{
      id: Date.now(),
      test: 'Server Configuration',
      success: true,
      response: {
        baseUrl: API_CONFIG.BASE_URL,
        useServer: API_CONFIG.USE_SERVER,
        timeout: API_CONFIG.TIMEOUT,
        hasSecret: !!API_CONFIG.APP_SECRET,
        endpoints: API_CONFIG.ENDPOINTS,
      },
    }, ...prev]);
  };

  const clearResults = () => {
    setResults([]);
  };

  const styles = createStyles(colors, cardTheme);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>서버 디버그</Text>
        <Text style={styles.subtitle}>서버 연결 상태를 확인합니다</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>프롬프트 테스트</Text>
          <TextInput
            style={styles.input}
            value={testPrompt}
            onChangeText={setTestPrompt}
            placeholder="테스트할 프롬프트 입력"
            placeholderTextColor={colors.text.tertiary}
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={testServerInfo}
            disabled={loading}
          >
            <Icon name="information-circle" size={20} color="#FFF" />
            <Text style={styles.buttonText}>서버 정보</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#10B981' }]}
            onPress={testHealthCheck}
            disabled={loading}
          >
            <Icon name="pulse" size={20} color="#FFF" />
            <Text style={styles.buttonText}>Health Check</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#F59E0B' }]}
            onPress={testGenerate}
            disabled={loading}
          >
            <Icon name="create" size={20} color="#FFF" />
            <Text style={styles.buttonText}>Generate Test</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#EF4444' }]}
            onPress={clearResults}
            disabled={loading}
          >
            <Icon name="trash" size={20} color="#FFF" />
            <Text style={styles.buttonText}>Clear</Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>테스트 중...</Text>
          </View>
        )}

        <View style={styles.results}>
          {results.map((result) => (
            <View key={result.id} style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <Text style={styles.resultTitle}>{result.test}</Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: result.success ? '#10B981' : '#EF4444' }
                ]}>
                  <Text style={styles.statusText}>
                    {result.success ? 'SUCCESS' : 'FAILED'}
                  </Text>
                </View>
              </View>

              {result.status && (
                <Text style={styles.resultInfo}>
                  Status: {result.status}
                </Text>
              )}

              {result.responseTime && (
                <Text style={styles.resultInfo}>
                  Response Time: {result.responseTime}ms
                </Text>
              )}

              {result.error && (
                <Text style={styles.errorText}>
                  Error: {result.error}
                </Text>
              )}

              {result.response && (
                <View style={styles.responseContainer}>
                  <Text style={styles.responseLabel}>Response:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <Text style={styles.responseText}>
                      {typeof result.response === 'string' 
                        ? result.response 
                        : JSON.stringify(result.response, null, 2)}
                    </Text>
                  </ScrollView>
                </View>
              )}

              {result.parsed && (
                <View style={styles.responseContainer}>
                  <Text style={styles.responseLabel}>Parsed JSON:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <Text style={styles.responseText}>
                      {JSON.stringify(result.parsed, null, 2)}
                    </Text>
                  </ScrollView>
                </View>
              )}

              {result.headers && (
                <View style={styles.responseContainer}>
                  <Text style={styles.responseLabel}>Headers:</Text>
                  <Text style={styles.responseText}>
                    {JSON.stringify(result.headers, null, 2)}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: any, cardTheme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: SPACING.md,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: SPACING.md,
    fontSize: 14,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    marginTop: SPACING.sm,
    fontSize: 14,
    color: colors.text.secondary,
  },
  results: {
    padding: SPACING.lg,
  },
  resultCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...cardTheme.default.shadow,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  resultInfo: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: SPACING.xs,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: SPACING.xs,
  },
  responseContainer: {
    marginTop: SPACING.md,
  },
  responseLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: SPACING.xs,
  },
  responseText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontFamily: 'monospace',
    backgroundColor: colors.lightGray,
    padding: SPACING.sm,
    borderRadius: 4,
  },
});

export default ServerDebugScreen;

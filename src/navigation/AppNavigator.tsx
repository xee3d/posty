import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import SettingsScreen from '../screens/SettingsScreen';
import MyStyleScreen from '../screens/MyStyleScreen';
import AIWriteScreen from '../screens/AIWriteScreen';
import TrendScreen from '../screens/TrendScreen';
import FeedWithAdsExample from '../screens/FeedWithAdsExample';
import SubscriptionScreen from '../screens/SubscriptionScreen';
import CostMonitorScreen from '../screens/CostMonitorScreen';
import MissionScreen from '../screens/MissionScreen';
import AnimationExamplesScreen from '../screens/AnimationExamplesScreen';
import TabNavigator from '../components/TabNavigator';
import { COLORS } from '../utils/constants';

const AppNavigator: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [aiWriteMode, setAIWriteMode] = useState<'text' | 'photo' | 'polish'>('text');
  const [preparedContent, setPreparedContent] = useState<any>(null);

  const handleTabChange = useCallback((tab: string) => {
    // 현재 탭과 같으면 무시
    if (tab === activeTab) return;
    
    // AI 글쓰기 탭 관련 처리
    if (tab === 'ai-write' || tab === 'ai-write-photo' || tab === 'ai-write-polish') {
      if (tab === 'ai-write-photo') {
        setAIWriteMode('photo');
        setActiveTab('ai-write');
      } else if (tab === 'ai-write-polish') {
        setAIWriteMode('polish');
        setActiveTab('ai-write');
      } else {
        setAIWriteMode('text');
        setActiveTab(tab);
      }
    } else {
      setActiveTab(tab);
      // 다른 탭으로 이동시 preparedContent 초기화
      if (tab !== 'ai-write') {
        setPreparedContent(null);
      }
    }
  }, [activeTab]);

  const handleNavigate = useCallback((tab: string, content?: any) => {
    if (tab === 'ai-write' && content) {
      setPreparedContent(content);
    }
    handleTabChange(tab);
  }, [handleTabChange]);

  // 개발자 모드에서만 애니메이션 예시 화면 접근 가능
  // 실제 배포시에는 이 부분을 제거하거나 조건을 변경하세요
  const isDevelopment = __DEV__;

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen key="home" onNavigate={handleNavigate} />;
      case 'ai-write':
        return (
          <AIWriteScreen 
            key={`ai-write-${aiWriteMode}`}
            initialMode={aiWriteMode}
            initialContent={preparedContent}
            onNavigate={handleTabChange}
          />
        );
      case 'my-style':
        return <MyStyleScreen key="my-style" />;
      case 'cost-monitor':
        return <CostMonitorScreen key="cost-monitor" />;
      case 'settings':
        return <SettingsScreen key="settings" />;
      case 'trend':
        return <TrendScreen key="trend" />;
      case 'feed-ads':
        return <FeedWithAdsExample key="feed-ads" />;
      case 'subscription':
        return <SubscriptionScreen key="subscription" navigation={{ navigate: handleTabChange }} />;
      case 'mission':
        return <MissionScreen key="mission" />;
      case 'animation-examples':
        return <AnimationExamplesScreen key="animation-examples" />;
      default:
        return <HomeScreen key="home-default" onNavigate={handleNavigate} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {renderScreen()}
      </View>
      <TabNavigator activeTab={activeTab} onTabPress={handleTabChange} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
});

export default AppNavigator;
import React, { useState } from 'react';
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
import TabBar from '../components/TabBar';
import { COLORS } from '../utils/constants';
import { AnimatedCard, SlideInView } from '../components/AnimationComponents';

const AppNavigator: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [aiWriteMode, setAIWriteMode] = useState<'text' | 'photo' | 'polish'>('text');
  const [preparedContent, setPreparedContent] = useState<any>(null);

  const handleTabChange = (tab: string) => {
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
  };

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeScreen 
            onNavigate={(tab, content) => {
              if (tab === 'ai-write' && content) {
                setPreparedContent(content);
              }
              handleTabChange(tab);
            }} 
          />
        );
      case 'ai-write':
        return (
          <AIWriteScreen 
            initialMode={aiWriteMode}
            initialContent={preparedContent}
            onNavigate={handleTabChange}
          />
        );
      case 'my-style':
        return <MyStyleScreen />;
      case 'cost-monitor':
        return <CostMonitorScreen />;
      case 'settings':
        return <SettingsScreen />;
      case 'trend':
        return <TrendScreen />;
      case 'feed-ads':
        return <FeedWithAdsExample />;
      case 'subscription':
        return <SubscriptionScreen navigation={{ navigate: handleTabChange }} />;
      case 'mission':
        return <MissionScreen />;
      default:
        return <HomeScreen onNavigate={handleTabChange} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {renderScreen()}
      </View>
      <TabBar activeTab={activeTab} onTabChange={handleTabChange} />
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

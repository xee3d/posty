import React, { useState, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import HomeScreen from "../screens/HomeScreen";
import SettingsScreen from "../screens/SettingsScreen";
import MyStyleScreen from "../screens/MyStyleScreen";
import AIWriteScreen from "../screens/AIWriteScreen";
// import ModernSubscriptionScreen from "../screens/subscription/ModernSubscriptionScreen"; // 구독탭 제거
import CostMonitorScreen from "../screens/CostMonitorScreen";
import MissionScreen from "../screens/MissionScreen";
import TabNavigator from "../components/TabNavigator";
import { COLORS } from "../utils/constants";

const AppNavigator: React.FC = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [aiWriteMode, setAIWriteMode] = useState<"text" | "photo" | "polish">(
    "text"
  );
  const [preparedContent, setPreparedContent] = useState<any>(null);

  const handleTabChange = useCallback(
    (tab: string) => {
      // 현재 탭과 같으면 무시
      if (tab === activeTab) {
        return;
      }

      // AI 글쓰기 탭 관련 처리
      if (
        tab === "ai-write" ||
        tab === "ai-write-photo" ||
        tab === "ai-write-polish"
      ) {
        if (tab === "ai-write-photo") {
          setAIWriteMode("photo");
          setActiveTab("ai-write");
        } else if (tab === "ai-write-polish") {
          setAIWriteMode("polish");
          setActiveTab("ai-write");
        } else {
          setAIWriteMode("text");
          setActiveTab(tab);
        }
      } else {
        setActiveTab(tab);
        // 다른 탭으로 이동시 preparedContent 초기화
        if (tab !== "ai-write") {
          setPreparedContent(null);
        }
      }
    },
    [activeTab]
  );

  const handleNavigate = useCallback(
    (tab: string, content?: any) => {
      if (tab === "ai-write" && content) {
        setPreparedContent(content);
      }
      handleTabChange(tab);
    },
    [handleTabChange]
  );


  const renderScreen = () => {
    switch (activeTab) {
      case "home":
        return <HomeScreen key="home" onNavigate={handleNavigate} />;
      case "ai-write":
        return (
          <AIWriteScreen
            key={`ai-write-${aiWriteMode}`}
            initialMode={aiWriteMode}
            initialText={
              preparedContent?.initialText ||
              preparedContent?.content ||
              preparedContent
            }
            initialTone={preparedContent?.initialTone}
            initialHashtags={preparedContent?.hashtags}
            initialTitle={preparedContent?.title}
            onNavigate={handleTabChange}
          />
        );
      case "my-style":
        return <MyStyleScreen key="my-style" onNavigate={handleNavigate} />;
      case "cost-monitor":
        return <CostMonitorScreen key="cost-monitor" />;
      case "settings":
        return <SettingsScreen key="settings" />;
      case "feed-ads":
        return <HomeScreen key="feed-ads" onNavigate={handleNavigate} />;
      // case "subscription": // 구독탭 제거
      //   return (
      //     <ModernSubscriptionScreen
      //       key="subscription"
      //       navigation={{
      //         navigate: handleTabChange,
      //         goBack: () => handleTabChange("home"),
      //       }}
      //     />
      //   );
      case "mission":
        return <MissionScreen key="mission" />;
      case "animation-examples":
        return <HomeScreen key="animation-examples" onNavigate={handleNavigate} />;
      default:
        return <HomeScreen key="home-default" onNavigate={handleNavigate} />;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>{renderScreen()}</View>
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

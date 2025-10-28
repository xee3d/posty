import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Linking,
  Platform as RNPlatform,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeIcon } from "../utils/SafeIcon";
import LanguageSettings from "../components/settings/LanguageSettings";
import { User, Platform } from "../types";
import {
  COLORS,
  FONTS,
  SPACING,
  BORDER_RADIUS,
  PLATFORMS,
  BRAND,
  CARD_THEME,
  TYPOGRAPHY,
  FONT_SIZES,
} from "../utils/constants";
import { APP_TEXT } from "../utils/textConstants";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "../hooks/useAppTheme";
import { useTheme } from "../contexts/ThemeContext";
import { createHeaderStyles } from "../styles/commonStyles";
import { storage } from "../utils/storage";
import socialMediaService from "../services/socialMediaService";
// ProfileEditModal 제거
import AsyncStorage from "@react-native-async-storage/async-storage";
import vercelAuthService from "../services/auth/vercelAuthService";
import { useAppSelector, useAppDispatch } from "../hooks/redux";
import { resetUser } from "../store/slices/userSlice";
import {
  TermsOfServiceScreen,
  PrivacyPolicyScreen,
  ContactScreen,
} from "./documents";

import TrendApiSettings from "./settings/TrendApiSettings";
import AIAgentSettings, { AIAgent } from "../components/settings/AIAgentSettings";
import { soundManager } from "../utils/soundManager";
import tokenService from "../services/subscription/tokenService";
import inAppPurchaseService from "../services/subscription/inAppPurchaseService";
import TokenManagementSection from "../components/token/TokenManagementSection";
import {
  resetAllMissionData,
  resetAdData,
  debugMissionData,
} from "../utils/missionUtils";
import achievementService from "../services/achievementService";
import { UserProfile, Achievement } from "../types/achievement";
// Firebase middleware removed
import { Alert } from "../utils/customAlert";
import { useTimer } from "../hooks/useCleanup";
import AccountChangeSection from "../components/settings/AccountChangeSection";
import OnboardingScreen from "./OnboardingScreen";
import NewUserWelcome from "../components/NewUserWelcome";
import MinimalWelcome from "../components/MinimalWelcome";
import AppLogo from "../components/AppLogo";
import ProfileDetailModal from "../components/ProfileDetailModal";
import ThemeDialog from "../components/ThemeDialog";
import adConsentService from "../services/adConsentService";
import NotificationBadge from "../components/NotificationBadge";

interface SettingsScreenProps {
  onNavigate?: (tab: string) => void;
  refreshKey?: number;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ onNavigate }) => {
  const { t } = useTranslation();
  // useAppTheme으로 변경하여 기존 코드와의 호환성 확보
  const { themeMode, colors, isDark, changeTheme, cardTheme, setThemeColor } = useAppTheme();
  const { resetThemeToDefault } = useTheme();
  const dispatch = useAppDispatch();
  const timer = useTimer();
  const insets = useSafeAreaInsets();
  const reduxUser = useAppSelector((state) => state.user);
  const reduxSubscriptionPlan = useAppSelector(
    (state) => state.user.subscriptionPlan
  );
  const [user, setUser] = useState<User>({
    id: "1",
    name: "Google Test User",
    email: "test.google@example.com",
    connectedPlatforms: [],
    preferences: {
      defaultPlatform: "instagram",
      autoSchedule: true,
      notificationsEnabled: true,
      aiRecommendationFrequency: "medium",
      preferredPostingTimes: ["09:00", "19:00"],
    },
  });

  const [pushEnabled, setPushEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  // 프로필 편집 모달 상태 제거
  const [connectedAccounts, setConnectedAccounts] = useState<
    Record<string, boolean>
  >({});
  const [subscriptionPlan, setSubscriptionPlan] = useState("free");
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [loading, setLoading] = useState(true);

  const [showEarnTokenModal, setShowEarnTokenModal] = useState(false);
  const [showTrendSettings, setShowTrendSettings] = useState(false);
  const [userProfile, setUserProfile] = useState<
    (UserProfile & { achievements?: Achievement[] }) | null
  >(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showNewUserWelcome, setShowNewUserWelcome] = useState(false);
  const [showProfileDetailModal, setShowProfileDetailModal] = useState(false);
  const [showThemeDialog, setShowThemeDialog] = useState(false);
  const [selectedAIAgent, setSelectedAIAgent] = useState<AIAgent>("gpt-mini");
  const [themeChangeKey, setThemeChangeKey] = useState(0);

  // 테마 변경 감지
  useEffect(() => {
    setThemeChangeKey(prev => prev + 1);
  }, [themeMode, isDark]);

  // 프로필 완성도 관련
  const profileCompleteness =
    reduxUser.detailedProfile?.profileCompleteness || 0;

  // AI 토큰 및 통계
  const [stats, setStats] = useState({
    weeklyGenerated: 0,
    monthlyGenerated: 0,
    totalSaved: 0,
    aiTokensRemaining: 10,
    aiTokensTotal: 10,
    joinDays: 0,
  });

  // Redux 상태 확인을 위한 로그 추가
  useEffect(() => {
    console.log("[SettingsScreen] Redux user state:", {
      displayName: reduxUser.displayName,
      email: reduxUser.email,
      provider: reduxUser.provider,
      photoURL: reduxUser.photoURL,
    });
  }, [reduxUser]);

  useEffect(() => {
    loadAllData();
  }, []);

  // Redux 구독 플랜 변경 시 업데이트
  useEffect(() => {
    setSubscriptionPlan(reduxSubscriptionPlan || "free");
  }, [reduxSubscriptionPlan]);

  // Redux 상태 변경 시 토큰 정보 업데이트
  useEffect(() => {
    if (reduxUser.tokens?.current !== undefined) {
      setStats((prev) => ({
        ...prev,
        aiTokensRemaining: reduxUser.tokens.current,
      }));
    }
  }, [reduxUser.tokens]); // Redux 토큰 정보가 변경될 때마다 업데이트

  // 통계 업데이트는 loadStats()에서 처리

  const loadAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadUserData(), loadSettings(), loadStats()]);
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async () => {
    try {
      const savedUser = await vercelAuthService.getCurrentUser();
      if (savedUser) {
        setUser({
          id: savedUser.uid || "1",
          name: savedUser.displayName || "User",
          email: savedUser.email || "user@example.com",
          connectedPlatforms: [],
          preferences: {
            defaultPlatform: "instagram",
            autoSchedule: true,
            notificationsEnabled: true,
            aiRecommendationFrequency: "medium",
            preferredPostingTimes: [],
          },
        });
      }

      // 연결된 계정 확인
      const tokens = await socialMediaService.getAccessTokens();
      setConnectedAccounts({
        instagram: !!tokens.instagram,
        facebook: !!tokens.facebook,
        naver: false, // TODO: 네이버 OAuth 구현 필요
        kakao: false, // TODO: 카카오 OAuth 구현 필요
        linkedin: false,
        twitter: false,
      });

      // 구독 정보 로드
      const plan = await AsyncStorage.getItem("subscription_plan");
      setSubscriptionPlan(plan || "free");

      // 프로필 정보 로드
      const profile = await achievementService.getUserProfile();
      const achievements = await achievementService.getAchievements();
      setUserProfile({
        ...profile,
        achievements: achievements,
      });
    } catch (error) {
      console.error("Failed to load user data:", error);
    }
  };

  const loadSettings = async () => {
    try {
      const pushSetting = await AsyncStorage.getItem(
        "push_notifications_enabled"
      );
      if (pushSetting !== null) {
        setPushEnabled(pushSetting === "true");
      }

      const soundSetting = await AsyncStorage.getItem("sound_enabled");
      if (soundSetting !== null) {
        const enabled = soundSetting === "true";
        setSoundEnabled(enabled);
        soundManager.setSoundEnabled(enabled);
      }

      const vibrationSetting = await AsyncStorage.getItem("vibration_enabled");
      if (vibrationSetting !== null) {
        const enabled = vibrationSetting === "true";
        setVibrationEnabled(enabled);
        soundManager.setVibrationEnabled(enabled);
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  };

  const loadStats = async () => {
    try {
      // 가입일 계산
      const joinDateStr = await AsyncStorage.getItem("posty_join_date");
      const joinDate = joinDateStr ? new Date(joinDateStr) : new Date();
      if (!joinDateStr) {
        await AsyncStorage.setItem("posty_join_date", joinDate.toISOString());
      }
      const diffTime = Math.abs(new Date().getTime() - joinDate.getTime());
      const joinDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // 오늘 통계
      const today = new Date().toDateString();
      const todayStats = await AsyncStorage.getItem(`stats_${today}`);
      // 오늘 생성 개수 제거

      // tokenService를 사용하여 실제 토큰 수 가져오기
      const subscription = await tokenService.getSubscription();
      const tokenInfo = await tokenService.getTokenInfo();

      // Redux 상태에서 토큰 정보 확인 (우선)
      const reduxTokens = reduxUser.tokens?.current;

      // Redux 상태에서 현재 구독 플랜 확인
      const currentPlan =
        reduxSubscriptionPlan || subscription.subscriptionPlan;

      // 실제 남은 토큰 수 계산
      let remainingTokens = 0;
      let tokensTotal = 10;

      if (currentPlan === "pro") {
        // 프로 플랜은 무제한
        tokensTotal = 999;
        remainingTokens = 999;
      } else {
        // Free 플랜
        tokensTotal = 10;
        // Redux 상태가 있으면 사용, 없으면 daily tokens 사용
        if (reduxTokens !== undefined) {
          remainingTokens = reduxTokens;
        } else {
          remainingTokens = subscription.dailyTokens || 10;
        }
      }

      setStats({
        // todayGenerated 제거
        weeklyGenerated: 18,
        monthlyGenerated: 127,
        totalSaved: 45,
        aiTokensRemaining: remainingTokens,
        aiTokensTotal: tokensTotal,
        joinDays,
      });

      // 구독 플랜도 Redux에서 가져온 것으로 설정
      setSubscriptionPlan(currentPlan);
    } catch (error) {
      console.error("Failed to load stats:", error);
      // 오류 시 기본값 설정
      setStats({
        weeklyGenerated: 0,
        monthlyGenerated: 0,
        totalSaved: 0,
        aiTokensRemaining: reduxUser.tokens?.current || 10,
        aiTokensTotal: 10,
        joinDays: 0,
      });
    }
  };

  const handlePushToggle = async (value: boolean) => {
    setPushEnabled(value);
    try {
      await AsyncStorage.setItem(
        "push_notifications_enabled",
        value.toString()
      );

      if (value) {
        Alert.alert(
          "Posty",
          t('alerts.notifications.enabled')
        );
      } else {
        Alert.alert("Posty", t('alerts.notifications.disabled'));
      }
    } catch (error) {
      console.error("Failed to save push setting:", error);
    }
  };

  const handleSoundToggle = async (value: boolean) => {
    setSoundEnabled(value);
    soundManager.setSoundEnabled(value);

    try {
      await AsyncStorage.setItem("sound_enabled", value.toString());

      if (value) {
        soundManager.playTap();
        Alert.alert(
          "Posty",
          t('alerts.sound.enabled')
        );
      }
    } catch (error) {
      console.error("Failed to save sound setting:", error);
    }
  };

  const handleVibrationToggle = async (value: boolean) => {
    setVibrationEnabled(value);
    soundManager.setVibrationEnabled(value);

    try {
      await AsyncStorage.setItem("vibration_enabled", value.toString());

      if (value) {
        soundManager.haptic("medium");
        Alert.alert(
          "Posty",
          t('alerts.vibration.enabled')
        );
      }
    } catch (error) {
      console.error("Failed to save vibration setting:", error);
    }
  };

  const handleThemeChange = async (theme: "light" | "dark" | "system") => {
    changeTheme(theme);
    try {
      await AsyncStorage.setItem("app_theme", theme);
    } catch (error) {
      console.error("Failed to save theme setting:", error);
    }
  };

  const handleConnectPlatform = async (platform: string) => {
    Alert.alert(t('alerts.platform.connect.title', { platform }), t('alerts.platform.connect.message', { platform }), [
      { text: t('alerts.buttons.cancel'), style: "cancel" },
      {
        text: t('alerts.buttons.connect'),
        onPress: async () => {
          Alert.alert(
            "Posty",
            t('alerts.platform.connect.comingSoon', { platform })
          );
        },
      },
    ]);
  };

  const handleDisconnectPlatform = async (platform: string) => {
    Alert.alert(t('alerts.platform.disconnect.title'), t('alerts.platform.disconnect.message', { platform }), [
      { text: t('alerts.buttons.cancel'), style: "cancel" },
      {
        text: t('alerts.buttons.disconnect'),
        style: "destructive",
        onPress: async () => {
          try {
            const tokens = await socialMediaService.getAccessTokens();
            delete tokens[platform.toLowerCase() as keyof typeof tokens];
            await AsyncStorage.setItem(
              "SOCIAL_MEDIA_TOKENS",
              JSON.stringify(tokens)
            );

            setConnectedAccounts((prev) => ({
              ...prev,
              [platform.toLowerCase()]: false,
            }));

            Alert.alert(
              "Posty",
              t('alerts.platform.disconnect.success', { platform })
            );
          } catch (error) {
            Alert.alert(t('alerts.buttons.error'), t('alerts.platform.disconnect.failed'));
          }
        },
      },
    ]);
  };

  // 프로필 편집 관련 함수 제거

  const handleUpgradePlan = () => {
    if (onNavigate) {
      onNavigate("subscription");
    }
  };

  const handleRestorePurchases = async () => {
    try {
      Alert.alert(t('alerts.purchase.restore.title'), t('alerts.purchase.restore.message'), [
        { text: t('alerts.buttons.cancel'), style: "cancel" },
        {
          text: t('alerts.buttons.restore'),
          onPress: async () => {
            try {
              await inAppPurchaseService.restorePurchases();
            } catch (error) {
              console.error("Restore error:", error);
              Alert.alert(
                t('alerts.purchase.restore.failedTitle'),
                t('alerts.purchase.restore.failed'),
                [{ text: t('alerts.buttons.ok') }]
              );
            }
          },
        },
      ]);
    } catch (error) {
      console.error("Restore purchases error:", error);
    }
  };

  const handleClearHistory = () => {
    Alert.alert(t('alerts.data.clearHistory.title'), t('alerts.data.clearHistory.message'), [
      { text: t('alerts.buttons.cancel'), style: "cancel" },
      {
        text: t('alerts.buttons.delete'),
        style: "destructive",
        onPress: async () => {
          try {
            const keys = await AsyncStorage.getAllKeys();
            const historyKeys = keys.filter(
              (key) =>
                key.includes("stats_") ||
                key.includes("history_") ||
                key.includes("activity_")
            );
            await AsyncStorage.multiRemove(historyKeys);

            Alert.alert(t('alerts.buttons.completed'), t('alerts.data.clearHistory.success'));
            loadStats();
          } catch (error) {
            Alert.alert(t('alerts.buttons.error'), t('alerts.data.clearHistory.failed'));
          }
        },
      },
    ]);
  };

  const handleDeleteAllData = () => {
    Alert.alert(
      t('alerts.data.deleteAll.title'),
      t('alerts.data.deleteAll.message'),
      [
        { text: t('alerts.buttons.cancel'), style: "cancel" },
        {
          text: t('alerts.buttons.delete'),
          style: "destructive",
          onPress: async () => {
            try {
              const keys = await AsyncStorage.getAllKeys();
              await AsyncStorage.multiRemove(keys);

              Alert.alert(t('alerts.buttons.completed'), t('alerts.data.deleteAll.success'), [
                { text: t('alerts.buttons.ok'), onPress: () => loadAllData() },
              ]);
            } catch (error) {
              Alert.alert(t('alerts.buttons.error'), t('alerts.data.deleteAll.failed'));
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(t('alerts.auth.logout.title'), t('alerts.auth.logout.message'), [
      { text: t('alerts.buttons.cancel'), style: "cancel" },
      {
        text: t('alerts.auth.logout.action'),
        style: "destructive",
        onPress: async () => {
          try {
            // 로그아웃 진행

            // 소셜 로그인 로그아웃 (에러 무시)
            await vercelAuthService.signOut().catch((err: any) => {
              console.log("로그아웃 에러 (continued):", err);
            });

            // Redux 상태 초기화
            dispatch(resetUser());

            // 테마 초기화
            resetThemeToDefault();

            // 모든 로컬 데이터 초기화
            const authKeys = [
              "@user_profile",
              "@posty:persisted_tokens",
              "@posty:persisted_subscription",
              "USER_SUBSCRIPTION",
              "SOCIAL_MEDIA_TOKENS",
              "posty_join_date",
            ];

            await AsyncStorage.multiRemove(authKeys).catch((err) => {
              console.log("로컬 데이터 삭제 에러:", err);
            });

            // 로그인 화면으로 이동
            if (onNavigate) {
              timer.setTimeout(() => {
                onNavigate("login");
              }, 100);
            }
          } catch (error) {
            console.error("로그아웃 중 예상치 못한 에러:", error);
            // 그래도 로그아웃 처리
            dispatch(resetUser());
            if (onNavigate) {
              timer.setTimeout(() => {
                onNavigate("login");
              }, 100);
            }
          }
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('alerts.auth.deleteAccount.title'),
      t('alerts.auth.deleteAccount.message'),
      [
        { text: t('alerts.buttons.cancel'), style: "cancel" },
        {
          text: t('alerts.auth.deleteAccount.action'),
          style: "destructive",
          onPress: async () => {
            // 두 번째 확인
            Alert.alert(
              t('alerts.auth.deleteAccount.confirmTitle'),
              t('alerts.auth.deleteAccount.confirmMessage'),
              [
                { text: t('alerts.buttons.cancel'), style: "cancel" },
                {
                  text: t('alerts.auth.deleteAccount.confirm'),
                  style: "destructive",
                  onPress: async () => {
                    try {
                      setLoading(true);

                      // 모든 데이터 삭제
                      const allKeys = await AsyncStorage.getAllKeys();
                      await AsyncStorage.multiRemove(allKeys);

                      // Redux 상태 초기화
                      dispatch(resetUser());

                      // 테마 초기화
                      resetThemeToDefault();

                      // 로그인 화면으로 이동
                      Alert.alert(
                        t('alerts.auth.deleteAccount.successTitle'),
                        t('alerts.auth.deleteAccount.successMessage'),
                        [
                          {
                            text: t('alerts.buttons.ok'),
                            onPress: () => {
                              if (onNavigate) {
                                timer.setTimeout(() => {
                                  onNavigate("login");
                                }, 100);
                              }
                            },
                          },
                        ]
                      );
                    } catch (error) {
                      console.error("계정 삭제 중 에러:", error);
                      Alert.alert(
                        t('alerts.buttons.error'),
                        t('alerts.auth.deleteAccount.error')
                      );
                    } finally {
                      setLoading(false);
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };


  const handleRateApp = () => {
    Alert.alert(t('alerts.rating.title'), t('alerts.rating.message'), [
      { text: t('alerts.rating.later'), style: "cancel" },
      {
        text: t('alerts.rating.rate'),
        onPress: () => {
          const storeUrl =
            RNPlatform.OS === "ios"
              ? "https://apps.apple.com/app/posty-ai"
              : "https://play.google.com/store/apps/details?id=com.posty.ai";

          Linking.openURL(storeUrl).catch(() => {
            Alert.alert(t('alerts.buttons.error'), t('alerts.rating.error'));
          });
        },
      },
    ]);
  };

  const handleEarnTokens = async (tokens: number) => {
    try {
      // 토큰 추가
      const subscription = await tokenService.getSubscription();

      // 하루 최대 토큰 제한 확인
      const today = new Date().toDateString();
      const earnedTodayKey = `earned_tokens_${today}`;
      const earnedToday = await AsyncStorage.getItem(earnedTodayKey);
      const totalEarnedToday = earnedToday ? parseInt(earnedToday) : 0;

      // 하루 최대 20개까지만 추가 획득 가능 (기본 10개 + 추가 20개 = 총 30개)
      const MAX_DAILY_EARNED = 20;
      if (totalEarnedToday >= MAX_DAILY_EARNED) {
        Alert.alert(
          t('alerts.tokens.dailyLimitExceeded.title'),
          t('alerts.tokens.dailyLimitExceeded.message', { limit: MAX_DAILY_EARNED }),
          [{ text: t('alerts.buttons.ok') }]
        );
        return;
      }

      // 남은 획득 가능한 토큰 계산
      const remainingEarnable = MAX_DAILY_EARNED - totalEarnedToday;
      const actualTokensToAdd = Math.min(tokens, remainingEarnable);

      if (actualTokensToAdd < tokens) {
        Alert.alert(
          t('alerts.tokens.partialGrant.title'),
          t('alerts.tokens.partialGrant.message', { tokens: actualTokensToAdd }),
          [{ text: t('alerts.buttons.ok') }]
        );
      }

      // 토큰 추가
      subscription.dailyTokens = Math.min(
        subscription.dailyTokens + actualTokensToAdd,
        30 // 전체 최대 30개
      );

      // 오늘 획득한 토큰 기록
      await AsyncStorage.setItem(
        earnedTodayKey,
        (totalEarnedToday + actualTokensToAdd).toString()
      );

      // 비정상 패턴 모니터링을 위한 로그 저장
      await logTokenActivity({
        action: "earn",
        amount: actualTokensToAdd,
        source: "modal",
        timestamp: new Date().toISOString(),
      });

      await AsyncStorage.setItem(
        "USER_SUBSCRIPTION",
        JSON.stringify(subscription)
      );

      // 통계 업데이트
      await loadStats();

      // 화면 새로고침
      timer.setTimeout(() => {
        setShowEarnTokenModal(false);
      }, 1000);
    } catch (error) {
      console.error("Failed to add tokens:", error);
    }
  };

  // 토큰 활동 로깅 (비정상 패턴 모니터링용)
  const logTokenActivity = async (activity: any) => {
    try {
      const logsKey = "token_activity_logs";
      const existingLogs = await AsyncStorage.getItem(logsKey);
      const logs = existingLogs ? JSON.parse(existingLogs) : [];

      logs.push(activity);

      // 최근 100개 로그만 유지
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }

      await AsyncStorage.setItem(logsKey, JSON.stringify(logs));

      // 비정상 패턴 체크
      checkAnomalousPatterns(logs);
    } catch (error) {
      console.error("Failed to log activity:", error);
    }
  };

  // 비정상 패턴 감지
  const checkAnomalousPatterns = (logs: any[]) => {
    const recentLogs = logs.filter((log) => {
      const logTime = new Date(log.timestamp).getTime();
      const now = new Date().getTime();
      return now - logTime < 3600000; // 최근 1시간
    });

    // 패턴 1: 너무 빈번한 요청 (1시간에 10번 이상)
    if (recentLogs.length > 10) {
      console.warn("Suspicious pattern detected: Too many token requests");
      // 실제로는 서버에 리포트하거나 계정 플래그 설정
    }

    // 패턴 2: 동일한 작업 반복 (같은 소스에서 5번 이상)
    const sourceCounts = recentLogs.reduce((acc: Record<string, number>, log) => {
      acc[log.source] = (acc[log.source] || 0) + 1;
      return acc;
    }, {});

    Object.entries(sourceCounts).forEach(([source, count]) => {
      if ((count as number) > 5) {
        console.warn(`Suspicious pattern detected: Repeated ${source} actions`);
      }
    });
  };

  // 플랫폼 정보 헬퍼 함수들
  const getProviderName = (provider: string | null | undefined) => {
    console.log("[SettingsScreen] getProviderName - provider:", provider);
    if (!provider) {
      return "Email";
    }
    switch (provider) {
      case "google":
        return "Google";
      case "naver":
        return "Naver";
      case "kakao":
        return "Kakao";
      case "facebook":
        return "Facebook";
      case "apple":
        return "Apple";
      default:
        return "Email";
    }
  };

  const getProviderIcon = (provider: string | null | undefined) => {
    if (!provider) {
      return "mail";
    }
    switch (provider) {
      case "google":
        return "logo-google";
      case "naver":
        return "chatbubble"; // Naver 아이콘 대체
      case "kakao":
        return "chatbubble-ellipses";
      case "facebook":
        return "logo-facebook";
      case "apple":
        return "logo-apple";
      default:
        return "mail";
    }
  };

  const getProviderColor = (provider: string | null | undefined) => {
    if (!provider) {
      return colors.primary;
    }
    switch (provider) {
      case "google":
        return isDark ? "#5A9DF7" : "#4285F4";
      case "naver":
        return isDark ? "#4DD273" : "#03C75A";
      case "kakao":
        return isDark ? "#FFE733" : "#FEE500";
      case "facebook":
        return isDark ? "#4A90E2" : "#1877F2";
      case "apple":
        return colors.text.primary;
      default:
        return colors.primary;
    }
  };

  const getSubscriptionBadge = () => {
    switch (subscriptionPlan) {
      case "pro":
        return {
          text: "MAX",
          color: colors.primary,
          icon: "workspace-premium",
        };
      default:
        return { text: "FREE", color: colors.text.secondary, icon: "person" };
    }
  };

  const platformsData = [
    {
      id: "instagram",
      name: "Instagram",
      username: connectedAccounts.instagram ? "@username" : t('alerts.platform.status.notConnected'),
      color: isDark ? "#F56565" : "#E4405F",
      connected: connectedAccounts.instagram,
      status: connectedAccounts.instagram ? t('alerts.platform.status.connected') : t('alerts.platform.status.connectAction'),
    },
    {
      id: "facebook",
      name: "Facebook",
      username: connectedAccounts.facebook ? "Personal Account" : t('alerts.platform.status.notConnected'),
      color: isDark ? "#4A90E2" : "#1877F2",
      connected: connectedAccounts.facebook,
      status: connectedAccounts.facebook ? t('alerts.platform.status.connected') : t('alerts.platform.status.connectAction'),
    },
    {
      id: "twitter",
      name: "X (Twitter)",
      username: t('alerts.platform.status.notConnected'),
      color: isDark ? colors.text.primary : colors.text.secondary,
      connected: false,
      status: t('alerts.platform.status.connectAction'),
    },
  ];

  const menuItems = [
    // {
    //   icon: 'trending-up',
    //   label: '트렌드 API 설정',
    //   onPress: () => setShowTrendSettings(true),
    // },
    {
      icon: "mail-outline",
      label: t('settings.contact'),
      onPress: () => setShowContact(true),
    },
    {
      icon: "document-text-outline",
      label: t('settings.terms'),
      onPress: () => setShowTerms(true),
    },
    {
      icon: "shield-checkmark-outline",
      label: t('settings.privacy'),
      onPress: () => setShowPrivacy(true),
    },
  ];

  const planBadge = getSubscriptionBadge();
  const styles = useMemo(() => createStyles(colors, cardTheme, isDark), [colors, cardTheme, isDark]);
  const headerStyles = createHeaderStyles(colors);


  if (showTerms) {
    return (
      <TermsOfServiceScreen
        onBack={() => setShowTerms(false)}
        onNavigate={onNavigate}
      />
    );
  }

  if (showPrivacy) {
    return (
      <PrivacyPolicyScreen
        onBack={() => setShowPrivacy(false)}
        onNavigate={onNavigate}
      />
    );
  }

  if (showContact) {
    return (
      <ContactScreen
        onBack={() => setShowContact(false)}
        onNavigate={onNavigate}
      />
    );
  }

  if (showTrendSettings) {
    return <TrendApiSettings onBack={() => setShowTrendSettings(false)} />;
  }

  if (showOnboarding) {
    return <OnboardingScreen onComplete={() => setShowOnboarding(false)} />;
  }

  if (showNewUserWelcome) {
    return (
      <View style={styles.container}>
        <MinimalWelcome onComplete={() => setShowNewUserWelcome(false)} />
      </View>
    );
  }

  if (loading) {
    return (
      <SafeAreaView key={`settings-loading-${themeMode}-${isDark}-${themeChangeKey}`} style={[styles.container, { paddingTop: insets.top + 8 }]} edges={['left', 'right']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView key={`settings-${themeMode}-${isDark}-${themeChangeKey}`} style={[styles.container, { paddingTop: insets.top + 8 }]} edges={['left', 'right']}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 헤더 */}
        <View style={headerStyles.headerSection}>
          <View style={headerStyles.headerTop}>
            <View style={styles.mollyBadge}>
              <Text style={styles.mollyBadgeText}>P</Text>
            </View>
            <Text style={headerStyles.headerTitle}>{t('settings.title')}</Text>
            {/* 알림 아이콘 */}
            <View style={{ marginLeft: 'auto' }}>
              <NotificationBadge size="medium" />
            </View>
          </View>
        </View>

        {/* 프로필 카드 (통합) */}
        <View style={styles.profileSection}>
          <View style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.profileInfo}>
                <View
                  style={[
                    styles.profileAvatar,
                    userProfile?.selectedBadge && {
                      backgroundColor:
                        userProfile.achievements?.find(
                          (a) => a.id === userProfile.selectedBadge
                        )?.badgeColor || colors.primary,
                    },
                  ]}
                >
                  {userProfile?.selectedBadge ? (
                    <SafeIcon
                      name={
                        userProfile.achievements?.find(
                          (a) => a.id === userProfile.selectedBadge
                        )?.icon || "person"
                      }
                      size={32}
                      color={
                        userProfile.achievements?.find(
                          (a) => a.id === userProfile.selectedBadge
                        )?.iconColor || colors.primary
                      }
                    />
                  ) : reduxUser.photoURL ? (
                    <Image
                      source={{ uri: reduxUser.photoURL }}
                      style={styles.profileAvatarImage}
                    />
                  ) : (
                    <Text style={styles.profileAvatarText}>
                      {(reduxUser.displayName || user.name).charAt(0)}
                    </Text>
                  )}
                </View>
                <View style={styles.profileDetails}>
                  <Text style={styles.profileName}>
                    {reduxUser.displayName || user.name}
                  </Text>
                  {userProfile?.selectedTitle && (
                    <Text style={styles.profileTitle}>
                      {(() => {
                        console.log('🔍 [SettingsScreen] selectedTitle value:', userProfile.selectedTitle);

                        // Map old Korean titles to achievement IDs
                        const koreanToIdMap: { [key: string]: string } = {
                          "첫 발걸음": "first_post",
                          "새내기 작가": "post_3",
                          "인플루언서": "influencer",
                          "얼리버드": "early_bird",
                          "새해 첫 글": "new_year",
                          // Add more mappings as needed
                        };

                        // Get the achievement ID (either stored directly or mapped from Korean title)
                        const achievementId = koreanToIdMap[userProfile.selectedTitle] || userProfile.selectedTitle;

                        // Handle backward compatibility for old Korean titles
                        const titleKey = `achievements.items.${achievementId}.name`;
                        const translatedTitle = t(titleKey);

                        console.log('🔍 [SettingsScreen] achievementId:', achievementId);
                        console.log('🔍 [SettingsScreen] titleKey:', titleKey);
                        console.log('🔍 [SettingsScreen] translatedTitle:', translatedTitle);

                        // If translation key not found, it returns the key itself
                        if (translatedTitle === titleKey) {
                          console.log('⚠️ [SettingsScreen] Translation key not found, using original title');
                          // Fallback to the stored title (for old Korean titles)
                          return userProfile.selectedTitle;
                        }
                        console.log('✅ [SettingsScreen] Using translated title');
                        return translatedTitle;
                      })()}
                    </Text>
                  )}
                  {/* 플랫폼 정보 표시 */}
                  {reduxUser.provider ? (
                    <View style={styles.profilePlatformInfo}>
                      <SafeIcon
                        name={getProviderIcon(reduxUser.provider)}
                        size={14}
                        color={getProviderColor(reduxUser.provider)}
                      />
                      <Text style={styles.profilePlatform}>
                        {getProviderName(reduxUser.provider)}
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.profileEmail}>
                      {reduxUser.email || user.email}
                    </Text>
                  )}
                </View>
              </View>
            </View>

            {/* 간단한 통계 제거 */}

            {/* 업적 보기 버튼 */}
            <TouchableOpacity
              style={[
                styles.editProfileButton,
                { backgroundColor: colors.primary + "15" },
              ]}
              onPress={async () => {
                if (onNavigate) {
                  onNavigate("achievements");
                  // 업적 화면에서 돌아온 후 데이터 새로고침을 위해 타이머 설정
                  timer.setTimeout(async () => {
                    const profile = await achievementService.getUserProfile();
                    const achievements =
                      await achievementService.getAchievements();
                    setUserProfile({
                      ...profile,
                      achievements: achievements,
                    });
                  }, 1000);
                }
              }}
            >
              <SafeIcon name="trophy" size={20} color={colors.primary} />
              <Text
                style={[
                  styles.editProfileButtonText,
                  { color: colors.primary },
                ]}
              >
                {t('settings.achievements')}
              </Text>
            </TouchableOpacity>

            {/* 세부 프로필 설정 */}
            <TouchableOpacity
              style={[
                styles.editProfileButton,
                { borderColor: colors.primary },
              ]}
              onPress={() => setShowProfileDetailModal(true)}
            >
              <SafeIcon name="person-circle" size={20} color={colors.primary} />
              <Text
                style={[
                  styles.editProfileButtonText,
                  { color: colors.primary },
                ]}
              >
                {t('settings.profileDetails')}
              </Text>
              {profileCompleteness < 100 && (
                <View
                  style={[
                    styles.profileBadge,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  <Text style={styles.profileBadgeText}>
                    {profileCompleteness}%
                  </Text>
                </View>
              )}
            </TouchableOpacity>

          </View>
        </View>

        {/* 치즈 및 구독 통합 카드 */}
        <View style={styles.unifiedCardContainer}>
          <View style={styles.unifiedCard}>
            {/* 보유 치즈 */}
            <TouchableOpacity
              style={styles.cardRow}
              onPress={() => {
                if (onNavigate) {
                  onNavigate("token-shop");
                }
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.cardIcon, { backgroundColor: colors.primary }]}>
                <Image
                  source={require('../../logo/Cheez_logo.png')}
                  style={{ width: 32, height: 32 }}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardLabel}>{t('tokens.free')}</Text>
                <Text style={styles.cardValue}>{stats.aiTokensRemaining}{t('tokens.unit')}</Text>
              </View>
              <View style={styles.cardAction}>
                <Text style={[styles.cardActionText, { color: colors.primary }]}>
                  {t('tokens.actions.charge')}
                </Text>
                <SafeIcon name="chevron-forward" size={20} color={colors.primary} />
              </View>
            </TouchableOpacity>

            {/* 구분선 */}
            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* Posty Pro */}
            <TouchableOpacity
              style={styles.cardRow}
              onPress={() => {
                if (onNavigate) {
                  onNavigate("subscription");
                }
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.cardIcon, { backgroundColor: colors.primary }]}>
                <SafeIcon name="star" size={28} color="#FFFFFF" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardLabel}>Posty Pro</Text>
                <Text style={styles.cardSubtext}>{t('subscription.enjoyAdFree')}</Text>
              </View>
              <View style={styles.cardAction}>
                <Text style={[styles.cardActionText, { color: colors.primary }]}>
                  {t('subscription.actions.subscribe')}
                </Text>
                <SafeIcon name="chevron-forward" size={20} color={colors.primary} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* 앱 설정 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.appSettings')}</Text>
          
          {/* 언어 설정 */}
          <LanguageSettings
            onLanguageChange={(language) => {
              console.log('[SettingsScreen] Language changed to:', language);
              // 언어 변경 후 강제 리렌더링을 위해 상태 업데이트
              setLoading(true);
              setTimeout(() => setLoading(false), 100);
            }}
          />

          {/* AI 에이전트 설정 */}
          <AIAgentSettings
            onAgentChange={(agent) => {
              console.log('[SettingsScreen] AI Agent changed to:', agent);
              setSelectedAIAgent(agent);
            }}
          />

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={styles.settingHeader}>
                <SafeIcon
                  name="notifications-outline"
                  size={20}
                  color={colors.text.secondary}
                />
                <Text style={styles.settingLabel}>{t('settings.pushNotifications')}</Text>
              </View>
              <Text style={styles.settingDescription}>
                {t('settings.notifications.enabled')}
              </Text>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={handlePushToggle}
              trackColor={{ false: colors.lightGray, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={styles.settingHeader}>
                <SafeIcon
                  name="volume-high-outline"
                  size={20}
                  color={colors.text.secondary}
                />
                <Text style={styles.settingLabel}>{t('settings.soundEffects')}</Text>
              </View>
              <Text style={styles.settingDescription}>
                {t('settings.notifications.soundEnabled')}
              </Text>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={handleSoundToggle}
              trackColor={{ false: colors.lightGray, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <View style={styles.settingHeader}>
                <SafeIcon
                  name="phone-portrait-outline"
                  size={20}
                  color={colors.text.secondary}
                />
                <Text style={styles.settingLabel}>{t('settings.vibration')}</Text>
              </View>
              <Text style={styles.settingDescription}>{t('settings.notifications.vibrationEnabled')}</Text>
            </View>
            <Switch
              value={vibrationEnabled}
              onValueChange={handleVibrationToggle}
              trackColor={{ false: colors.lightGray, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setShowThemeDialog(true)}
          >
            <View style={styles.settingInfo}>
              <View style={styles.settingHeader}>
                <SafeIcon
                  name="color-palette-outline"
                  size={20}
                  color={colors.text.secondary}
                />
                <Text style={styles.settingLabel}>{t('settings.themeAndColors')}</Text>
              </View>
              <Text style={styles.settingDescription}>
                {t('settings.themeDescription')}
              </Text>
            </View>
            <View style={styles.themePreview}>
              <View
                style={[
                  styles.themeColorPreview,
                  { backgroundColor: colors.primary },
                ]}
              />
              <SafeIcon
                name="chevron-forward"
                size={20}
                color={colors.text.tertiary}
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={async () => {
              try {
                await adConsentService.showPrivacyOptionsForm();
                Alert.alert(
                  "Posty",
                  t("settings.adPersonalization.updateSuccess", "Ad personalization settings have been updated.")
                );
              } catch (error) {
                console.error('Privacy options error:', error);
                Alert.alert(
                  "Posty",
                  t("settings.adPersonalization.updateError", "Unable to update settings. Please try again later.")
                );
              }
            }}
          >
            <View style={styles.settingInfo}>
              <View style={styles.settingHeader}>
                <SafeIcon
                  name="shield-outline"
                  size={20}
                  color={colors.text.secondary}
                />
                <Text style={styles.settingLabel}>{t("settings.adPersonalization.title", "Ad Personalization Settings")}</Text>
              </View>
              <Text style={styles.settingDescription}>
                {t("settings.adPersonalization.description", "Configure personalized ads display preferences")}
              </Text>
            </View>
            <SafeIcon
              name="chevron-forward"
              size={20}
              color={colors.text.tertiary}
            />
          </TouchableOpacity>
        </View>

        {/* 기타 메뉴 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('settings.support')}</Text>

          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                <SafeIcon
                  name={item.icon}
                  size={20}
                  color={colors.text.secondary}
                />
                <Text style={styles.menuItemLabel}>{item.label}</Text>
              </View>
              <SafeIcon
                name="chevron-forward"
                size={20}
                color={colors.text.tertiary}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* 버전 정보 */}
        <View style={styles.versionSection}>
          <AppLogo useAppIcon={true} size={80} />
          <Text style={styles.versionText}>Posty v1.0.0</Text>
          <Text style={styles.copyrightText}>
            © 2025 Posty AI. Made with 💕
          </Text>
        </View>

        {/* 로그아웃 버튼 */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <SafeIcon name="log-out-outline" size={20} color={colors.error} />
          <Text style={styles.logoutText}>{t('alerts.auth.logout.action')}</Text>
        </TouchableOpacity>

        {/* 계정 삭제 버튼 */}
        <TouchableOpacity style={styles.deleteAccountButton} onPress={handleDeleteAccount}>
          <SafeIcon name="trash-outline" size={20} color={colors.error} />
          <Text style={styles.deleteAccountText}>{t('settings.deleteAccount')}</Text>
        </TouchableOpacity>

        {/* 회사 정보 */}
        <View style={styles.companyInfoSection}>
          <Text style={styles.companyName}>Posty AI</Text>
          <Text style={styles.companyDetails}>주식회사 틴로봇</Text>
          <Text style={styles.companyDetails}>
            서울시 서초구 강남대로 53길 8, 8층 12-1호 (스타크 강남타워)
          </Text>
          <Text style={styles.companyDetails}>
            대표이사: 최상열  I  사업자등록번호: 120-87-41039
          </Text>
          <Text style={styles.companyDetails}>
            통신판매업신고번호: 2025-서울서초-3363호
          </Text>
          <Text style={styles.companyDetails}>
            전화번호: 031-8016-5242  I  이메일: getposty@gmail.com
          </Text>

          {/* 링크 섹션 */}
          <View style={styles.companyLinksContainer}>
            <TouchableOpacity
              onPress={() => Linking.openURL('https://rustic-english-07b.notion.site/KO-26cdc2bce21c81658456c2e687bf1a87').catch(() =>
                Alert.alert("Error", "링크를 열 수 없습니다.")
              )}
            >
              <Text style={styles.companyLink}>개인정보처리방침</Text>
            </TouchableOpacity>
            <Text style={styles.linkSeparator}>  I  </Text>
            <TouchableOpacity
              onPress={() => Linking.openURL('https://rustic-english-07b.notion.site/KO-26cdc2bce21c81d6b4ecf69d2a3de8c1').catch(() =>
                Alert.alert("Error", "링크를 열 수 없습니다.")
              )}
            >
              <Text style={styles.companyLink}>이용약관</Text>
            </TouchableOpacity>
            <Text style={styles.linkSeparator}>  I  </Text>
            <TouchableOpacity
              onPress={() => Linking.openURL('https://rustic-english-07b.notion.site/KO-26cdc2bce21c817fad4bc24dd1aef208').catch(() =>
                Alert.alert("Error", "링크를 열 수 없습니다.")
              )}
            >
              <Text style={styles.companyLink}>운영정책</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.companyLinksContainer}>
            <TouchableOpacity
              onPress={() => Linking.openURL('https://rustic-english-07b.notion.site/Posty-AI-ccb51ba48a3047eb9797fca32d5bc9f3').catch(() =>
                Alert.alert("Error", "링크를 열 수 없습니다.")
              )}
            >
              <Text style={styles.companyLink}>청소년보호정책</Text>
            </TouchableOpacity>
            <Text style={styles.linkSeparator}>  I  </Text>
            <TouchableOpacity
              onPress={() => Linking.openURL('https://tinrobot.co.kr').catch(() =>
                Alert.alert("Error", "링크를 열 수 없습니다.")
              )}
            >
              <Text style={styles.companyLink}>About Tinrobot</Text>
            </TouchableOpacity>
            <Text style={styles.linkSeparator}>  I  </Text>
            <TouchableOpacity onPress={() => setShowContact(true)}>
              <Text style={styles.companyLink}>고객센터</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* 세부 프로필 설정 모달 */}
      <ProfileDetailModal
        visible={showProfileDetailModal}
        onClose={() => setShowProfileDetailModal(false)}
        showGuide={true}
      />

      {/* 테마 설정 다이얼로그 */}
      <ThemeDialog
        visible={showThemeDialog}
        onClose={() => {
          setShowThemeDialog(false);
          // 테마 변경 후 강제 리렌더링을 위해 상태 업데이트
          setLoading(true);
          setTimeout(() => setLoading(false), 100);
        }}
      />
    </SafeAreaView>
  );
};

const createStyles = (colors: any, cardTheme: any, isDark: boolean) => {

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    content: {
      flex: 1,
    },
    mollyBadge: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      marginRight: SPACING.sm,
    },
    mollyBadgeText: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.white,
    },
    section: {
      backgroundColor: colors.surface,
      marginBottom: SPACING.md,
      paddingVertical: SPACING.md,
      borderRadius: 16,
      marginHorizontal: SPACING.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    profileSection: {
      marginHorizontal: SPACING.md,
      marginBottom: SPACING.md,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.text.secondary,
      paddingHorizontal: SPACING.lg,
      marginBottom: SPACING.md,
    },
    profileCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: SPACING.lg,
      borderWidth: 1,
      borderColor: colors.border,
      ...cardTheme.default.shadow,
    },
    profileHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: SPACING.lg,
    },
    profileInfo: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    profileAvatar: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      marginRight: SPACING.md,
      overflow: "hidden",
      borderWidth: 2,
      borderColor: colors.border,
    },
    profileAvatarImage: {
      width: "100%",
      height: "100%",
    },
    profileAvatarText: {
      fontSize: 24,
      color: colors.white,
      fontWeight: "bold",
    },
    profileDetails: {
      flex: 1,
    },
    profileName: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text.primary,
      marginBottom: 2,
    },
    profileTitle: {
      fontSize: 13,
      fontWeight: "500",
      color: colors.primary,
      marginBottom: 2,
    },
    profileEmail: {
      fontSize: 14,
      color: colors.text.tertiary,
    },
    profilePlatformInfo: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    profilePlatform: {
      fontSize: 14,
      color: colors.text.secondary,
      fontWeight: "500",
    },
    profileStats: {
      flexDirection: "row",
      alignItems: "center",
      marginLeft: "auto",
    },
    profileStatItem: {
      alignItems: "center",
      paddingHorizontal: SPACING.md,
    },
    profileStatValue: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text.primary,
    },
    profileStatLabel: {
      fontSize: 11,
      color: colors.text.tertiary,
      marginTop: 2,
    },
    profileStatDivider: {
      width: 1,
      height: 24,
      backgroundColor: colors.border,
    },
    editProfileButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: SPACING.xs,
      marginTop: SPACING.md,
      paddingVertical: SPACING.sm,
      borderRadius: 12,
      backgroundColor: colors.primary + "10",
    },
    editProfileButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.primary,
    },
    tokenStatusContainer: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: SPACING.md,
      marginBottom: SPACING.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    tokenStatusHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: SPACING.sm,
    },
    tokenStatusInfo: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    tokenStatusLabel: {
      fontSize: 13,
      fontWeight: "500",
      color: colors.text.secondary,
    },
    tokenStatusCount: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.primary,
    },
    tokenProgressBar: {
      height: 6,
      backgroundColor: colors.border + "60",
      borderRadius: 3,
      overflow: "hidden",
    },
    tokenProgressFill: {
      height: "100%",
      backgroundColor: colors.primary,
      borderRadius: 3,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
      elevation: 2,
    },
    miniStats: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.md,
      backgroundColor: colors.surface,
      borderRadius: 12,
      marginTop: SPACING.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    miniStatItem: {
      flex: 1,
      alignItems: "center",
    },
    miniStatValue: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text.primary,
      marginBottom: 2,
    },
    miniStatLabel: {
      fontSize: 11,
      color: colors.text.tertiary,
    },
    miniStatDivider: {
      width: 1,
      height: 30,
      backgroundColor: colors.border,
    },
    upgradePrompt: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.primary + "15",
      borderRadius: 12,
      padding: SPACING.md,
      marginTop: SPACING.sm,
      borderWidth: 1,
      borderColor: colors.primary + "20",
    },
    earnTokenPrompt: {
      backgroundColor: "#10B981" + "10",
      marginTop: SPACING.xs,
    },
    upgradePromptText: {
      flex: 1,
      fontSize: 13,
      color: colors.primary,
      fontWeight: "500",
      marginHorizontal: SPACING.sm,
    },
    platformItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.md,
    },
    platformLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    platformIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
      marginRight: SPACING.md,
    },
    platformIconText: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.white,
    },
    platformInfo: {
      flex: 1,
    },
    platformName: {
      fontSize: 15,
      fontWeight: "500",
      color: colors.text.primary,
      marginBottom: 2,
    },
    platformUsername: {
      fontSize: FONT_SIZES.small,
      color: colors.text.tertiary,
    },
    connectionButton: {
      paddingHorizontal: SPACING.md,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.primary,
    },
    connectedButton: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    connectionButtonText: {
      fontSize: FONT_SIZES.small,
      fontWeight: "600",
      color: colors.white,
    },
    connectedButtonText: {
      color: colors.text.secondary,
    },
    settingItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.md,
      borderBottomWidth: 0.5,
      borderBottomColor: colors.border + "50", // 50% 투명도
    },
    settingInfo: {
      flex: 1,
      marginRight: SPACING.md,
    },
    settingHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.sm,
      marginBottom: 4,
    },
    settingLabel: {
      fontSize: 15,
      fontWeight: "500",
      color: colors.text.primary,
    },
    settingDescription: {
      fontSize: FONT_SIZES.small,
      color: colors.text.tertiary,
      marginLeft: 28,
    },
    themePreview: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.sm,
    },
    themeColorPreview: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.border,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    },
    themeSection: {
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.md,
    },
    themeButtonGroup: {
      flexDirection: "row",
      marginTop: SPACING.md,
      gap: SPACING.sm,
    },
    themeButton: {
      flex: 1,
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: SPACING.md,
      paddingHorizontal: SPACING.sm,
      borderRadius: 12,
      backgroundColor: colors.lightGray,
      gap: 6,
    },
    themeButtonActive: {
      backgroundColor: cardTheme.posty.background,
      borderWidth: 2,
      borderColor: colors.primary,
    },
    themeIcon: {
      fontSize: 24,
    },
    themeButtonText: {
      fontSize: FONT_SIZES.small,
      fontWeight: "600",
      color: colors.text.secondary,
    },
    themeButtonTextActive: {
      color: colors.primary,
    },
    menuItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },

    dangerMenuItem: {
      backgroundColor: "#EF4444" + "10",
    },
    menuItemLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.md,
    },
    menuItemLabel: {
      fontSize: 15,
      color: colors.text.primary,
    },
    versionSection: {
      alignItems: "center",
      paddingVertical: SPACING.lg,
      marginHorizontal: SPACING.md,
    },
    // appIconContainer 제거됨 - AppLogo 컴포넌트 자체에서 라운드 배경 처리
    versionText: {
      fontSize: FONT_SIZES.small,
      color: colors.text.tertiary,
      marginTop: SPACING.md,
      marginBottom: 4,
    },
    copyrightText: {
      fontSize: FONT_SIZES.small,
      color: colors.text.tertiary,
    },
    logoutButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      marginHorizontal: SPACING.md * 2,
      marginBottom: SPACING.lg,
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 12,
      backgroundColor: colors.error + "15",
      minWidth: 150,
      alignSelf: "center",
    },
    logoutText: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.error,
      letterSpacing: -0.3,
      flexShrink: 0,
    },
    deleteAccountButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      marginHorizontal: SPACING.md * 2,
      marginBottom: SPACING.lg,
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 12,
      backgroundColor: colors.error + "10",
      borderWidth: 1,
      borderColor: colors.error + "30",
      minWidth: 150,
      alignSelf: "center",
    },
    deleteAccountText: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.error,
      letterSpacing: -0.3,
      flexShrink: 0,
    },
    bottomSpace: {
      height: SPACING.xxl * 2,
    },
    // Unified Card (치즈 및 구독)
    unifiedCardContainer: {
      paddingHorizontal: SPACING.lg,
      marginBottom: SPACING.xl,
    },
    unifiedCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
    },
    cardRow: {
      flexDirection: "row",
      alignItems: "center",
      padding: SPACING.lg,
    },
    divider: {
      height: 1,
      marginHorizontal: SPACING.lg,
    },
    cardIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: "center",
      alignItems: "center",
      marginRight: SPACING.md,
    },
    cardContent: {
      flex: 1,
    },
    cardLabel: {
      fontSize: 14,
      color: colors.text.tertiary,
      marginBottom: 4,
    },
    cardValue: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.text.primary,
    },
    cardSubtext: {
      fontSize: 14,
      color: colors.text.secondary,
    },
    cardAction: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    cardActionText: {
      fontSize: 15,
      fontWeight: "600",
    },
    testButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: SPACING.sm,
      marginHorizontal: SPACING.lg,
      marginTop: SPACING.sm,
      paddingVertical: SPACING.sm,
      borderRadius: 8,
    },
    testButtonText: {
      fontSize: 14,
      fontWeight: "500",
    },
    // 프로필 완성도 스타일
    profileBadge: {
      position: "absolute",
      right: 12,
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 2,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
      elevation: 2,
    },
    profileBadgeText: {
      color: colors.white,
      fontSize: 10,
      fontWeight: "600",
    },
    // 회사 정보 스타일
    companyInfoSection: {
      alignItems: "flex-start",
      paddingVertical: SPACING.xl,
      paddingHorizontal: SPACING.lg,
      marginHorizontal: SPACING.md,
      marginBottom: SPACING.md,
    },
    companyName: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text.tertiary,
      marginBottom: SPACING.xs,
    },
    companyDetails: {
      fontSize: 12,
      color: colors.text.tertiary,
      textAlign: "left",
      marginBottom: 4,
      lineHeight: 18,
    },
    companyLinksContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "flex-start",
      alignItems: "center",
      marginTop: SPACING.sm,
    },
    companyLink: {
      fontSize: 12,
      color: colors.text.tertiary,
      fontWeight: "500",
    },
    linkSeparator: {
      fontSize: 12,
      color: colors.text.tertiary,
    },
  });
};

export default SettingsScreen;

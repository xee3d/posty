import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { useAppTheme } from "../hooks/useAppTheme";
import offlineSyncService from "../services/offline/offlineSyncService";
import NetInfo from "@react-native-community/netinfo";
import { batteryOptimizer } from "../utils/batteryOptimization";

interface SyncIndicatorProps {
  style?: any;
}

export const SyncIndicator: React.FC<SyncIndicatorProps> = ({ style }) => {
  const { colors } = useAppTheme();
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  // 애니메이션 값
  const rotateValue = useSharedValue(0);
  const scaleValue = useSharedValue(1);

  useEffect(() => {
    // 네트워크 상태 모니터링
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected || false);
    });

    // 초기 상태 체크
    checkSyncStatus();

    // 배터리 최적화: 동기화 상태 체크 주기를 30초로 늘림
    batteryOptimizer.registerInterval(
      "sync-status-check",
      checkSyncStatus,
      30 * 1000, // 30초로 변경 (기존 5초에서 배터리 절약)
      {
        runInBackground: false,
        priority: "normal",
      }
    );

    return () => {
      unsubscribe();
      batteryOptimizer.clearInterval("sync-status-check");
    };
  }, []);

  // 동기화 애니메이션
  useEffect(() => {
    if (isSyncing) {
      rotateValue.value = withRepeat(
        withTiming(360, {
          duration: 1000,
          easing: Easing.linear,
        }),
        -1, // 무한 반복
        false
      );
    } else {
      rotateValue.value = withTiming(0, { duration: 300 });
    }
  }, [isSyncing]);

  // 오프라인 애니메이션
  useEffect(() => {
    if (!isOnline && pendingCount > 0) {
      scaleValue.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        true
      );
    } else {
      scaleValue.value = withTiming(1, { duration: 300 });
    }
  }, [isOnline, pendingCount]);

  const checkSyncStatus = async () => {
    const status = await offlineSyncService.getQueueStatus();
    setPendingCount(status.count);

    // 동기화 중인지 체크 (실제로는 서비스에서 상태를 가져와야 함)
    setIsSyncing(status.count > 0 && isOnline);
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${rotateValue.value}deg` },
        { scale: scaleValue.value },
      ] as any,
    };
  });

  // 표시할 내용이 없으면 null 반환
  if (isOnline && pendingCount === 0 && !isSyncing) {
    return null;
  }

  const styles = createStyles(colors);

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={checkSyncStatus}
      activeOpacity={0.7}
    >
      <Animated.View style={animatedStyle}>
        {!isOnline ? (
          <Icon name="cloud-off" size={20} color={colors.error} />
        ) : isSyncing ? (
          <Icon name="sync" size={20} color={colors.primary} />
        ) : (
          <Icon name="cloud-queue" size={20} color={colors.warning} />
        )}
      </Animated.View>

      <View style={styles.textContainer}>
        {!isOnline ? (
          <>
            <Text style={styles.statusText}>오프라인</Text>
            {pendingCount > 0 && (
              <Text style={styles.countText}>{pendingCount}개 대기 중</Text>
            )}
          </>
        ) : isSyncing ? (
          <Text style={styles.statusText}>동기화 중...</Text>
        ) : pendingCount > 0 ? (
          <Text style={styles.statusText}>{pendingCount}개 동기화 대기</Text>
        ) : null}
      </View>

      {isSyncing && (
        <ActivityIndicator
          size="small"
          color={colors.primary}
          style={styles.loader}
        />
      )}
    </TouchableOpacity>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface || "#FFFFFF",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    },
    textContainer: {
      marginLeft: 8,
    },
    statusText: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.text.primary,
    },
    countText: {
      fontSize: 11,
      color: colors.text.secondary,
      marginTop: 2,
    },
    loader: {
      marginLeft: 8,
    },
  });

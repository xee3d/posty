import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Linking,
  Share,
  Platform,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import LinearGradient from "react-native-linear-gradient";
import { SPACING } from "../utils/constants";
import { useAppTheme } from "../hooks/useAppTheme";
import rewardAdService from "../services/rewardAdService";
import { soundManager } from "../utils/soundManager";
import { Alert } from "../utils/customAlert";

interface FreeTokenModalProps {
  visible: boolean;
  onClose: () => void;
  onTokensEarned: (tokens: number) => void;
}

const FreeTokenModal: React.FC<FreeTokenModalProps> = ({
  visible,
  onClose,
  onTokensEarned,
}) => {
  const { colors, isDark } = useAppTheme();
  const [loading, setLoading] = useState<string | null>(null);

  const tokenMethods = [
    {
      id: "watch_ad",
      title: "광고 보기",
      description: "30초 광고를 시청하고 토큰을 받으세요",
      icon: "play-circle",
      gradient: ["#FF6B6B", "#FF8E53"],
      tokens: 2,
      limit: "하루 3회",
      action: async () => {
        setLoading("watch_ad");
        const result = await rewardAdService.showRewardedAd();
        setLoading(null);
        
        if (result.success && result.reward) {
          soundManager.playSuccess();
          onTokensEarned(result.reward.amount);
          Alert.alert("완료!", `${result.reward.amount}개 토큰을 받았습니다! 🎉`);
        }
      },
    },
    {
      id: "rate_app",
      title: "앱 평가하기",
      description: "스토어에서 5점 평가하고 토큰을 받으세요",
      icon: "star",
      gradient: ["#4FACFE", "#00F2FE"],
      tokens: 10,
      limit: "1회만",
      action: async () => {
        const storeUrl = Platform.OS === "ios"
          ? "https://apps.apple.com/app/id6738293135"
          : "https://play.google.com/store/apps/details?id=com.posty";
        
        await Linking.openURL(storeUrl);
        soundManager.playSuccess();
        onTokensEarned(10);
        Alert.alert("감사합니다!", "10개 토큰을 받았습니다! 🎉");
      },
    },
    {
      id: "share_app",
      title: "친구에게 공유",
      description: "Posty를 친구에게 추천하고 토큰을 받으세요",
      icon: "share-social",
      gradient: ["#A8EDEA", "#FED6E3"],
      tokens: 3,
      limit: "하루 1회",
      action: async () => {
        try {
          await Share.share({
            message: "Posty - AI로 멋진 SNS 글을 작성해보세요! 🎨\n\niOS: https://apps.apple.com/app/id6738293135\nAndroid: https://play.google.com/store/apps/details?id=com.posty",
          });
          soundManager.playSuccess();
          onTokensEarned(3);
          Alert.alert("감사합니다!", "3개 토큰을 받았습니다! 🎉");
        } catch (error) {
          console.error("Share error:", error);
        }
      },
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          {/* 헤더 */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <LinearGradient
                colors={["#667eea", "#764ba2"]}
                style={styles.headerIcon}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Icon name="gift" size={28} color="#FFFFFF" />
              </LinearGradient>
              <View>
                <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
                  무료 토큰 받기
                </Text>
                <Text style={[styles.headerSubtitle, { color: colors.text.secondary }]}>
                  미션을 완료하고 토큰을 모으세요
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Icon name="close" size={28} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* 미션 리스트 */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {tokenMethods.map((method, index) => (
              <TouchableOpacity
                key={method.id}
                style={styles.methodCardWrapper}
                onPress={method.action}
                activeOpacity={0.9}
                disabled={loading !== null}
              >
                <LinearGradient
                  colors={method.gradient}
                  style={styles.methodCard}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.methodContent}>
                    <View style={styles.methodLeft}>
                      <View style={styles.methodIconContainer}>
                        <Icon name={method.icon} size={32} color="#FFFFFF" />
                      </View>
                      <View style={styles.methodInfo}>
                        <Text style={styles.methodTitle}>{method.title}</Text>
                        <Text style={styles.methodDescription}>
                          {method.description}
                        </Text>
                        <Text style={styles.methodLimit}>{method.limit}</Text>
                      </View>
                    </View>
                    
                    <View style={styles.methodRight}>
                      <View style={styles.tokenReward}>
                        <Icon name="flash" size={20} color="#FFFFFF" />
                        <Text style={styles.tokenRewardText}>
                          +{method.tokens}
                        </Text>
                      </View>
                      <Icon name="chevron-forward" size={24} color="#FFFFFF" />
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}

            {/* 안내 */}
            <View style={[styles.infoCard, { backgroundColor: colors.primary + "10" }]}>
              <Icon name="information-circle" size={20} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.text.secondary }]}>
                매일 자정에 무료 토큰이 10개로 충전됩니다
              </Text>
            </View>
          </ScrollView>

          {/* 하단 버튼 */}
          <View style={[styles.bottomContainer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.doneButton, { backgroundColor: colors.primary }]}
              onPress={onClose}
            >
              <Text style={styles.doneButtonText}>완료</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "90%",
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.large,
    paddingTop: SPACING.xl,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.medium,
    flex: 1,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.large,
    paddingTop: 0,
    paddingBottom: SPACING.xl,
  },
  methodCardWrapper: {
    marginBottom: SPACING.large,
  },
  methodCard: {
    borderRadius: 20,
    padding: SPACING.large,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  methodContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  methodLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.medium,
    flex: 1,
  },
  methodIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  methodDescription: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 18,
    marginBottom: 4,
  },
  methodLimit: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    fontWeight: "600",
  },
  methodRight: {
    alignItems: "center",
    gap: 8,
  },
  tokenReward: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tokenRewardText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.small,
    padding: SPACING.medium,
    borderRadius: 14,
    marginTop: SPACING.small,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  bottomContainer: {
    padding: SPACING.large,
    paddingBottom: SPACING.xl,
    borderTopWidth: 1,
  },
  doneButton: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  doneButtonText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});

export default FreeTokenModal;


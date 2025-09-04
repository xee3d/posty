import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { COLORS, SPACING } from "../utils/constants";
import { SafeIcon } from "../utils/SafeIcon";
import MaterialIcon from "react-native-vector-icons/MaterialIcons";
import costAnalyzer from "../utils/costAnalyzer";

const CostMonitorScreen: React.FC = () => {
  const [report, setReport] = useState<any>(null);
  const [selectedTab, setSelectedTab] = useState<"overview" | "details">(
    "overview"
  );

  useEffect(() => {
    loadReport();
  }, []);

  const loadReport = () => {
    const monthlyReport = costAnalyzer.generateMonthlyReport();
    setReport(monthlyReport);
  };

  const formatCurrency = (usd: number): string => {
    const krw = usd * 1300;
    if (krw < 1) {
      return "₩0";
    }
    if (krw < 1000) {
      return `₩${krw.toFixed(0)}`;
    }
    return `₩${(krw / 1000).toFixed(1)}K`;
  };

  const formatNumber = (num: number): string => {
    if (num < 1000) {
      return num.toFixed(0);
    }
    return `${(num / 1000).toFixed(1)}K`;
  };

  if (!report) {
    return (
      <View style={styles.container}>
        <Text>로딩 중...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <MaterialIcon name="analytics" size={24} color={COLORS.primary} />
          <Text style={styles.headerTitle}>AI 사용량 분석</Text>
        </View>
        <Text style={styles.headerSubtitle}>{report.period} 월 사용 현황</Text>
      </View>

      <View style={styles.tabSelector}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === "overview" && styles.activeTab]}
          onPress={() => setSelectedTab("overview")}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === "overview" && styles.activeTabText,
            ]}
          >
            개요
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === "details" && styles.activeTab]}
          onPress={() => setSelectedTab("details")}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === "details" && styles.activeTabText,
            ]}
          >
            상세
          </Text>
        </TouchableOpacity>
      </View>

      {selectedTab === "overview" ? (
        <>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <SafeIcon name="create-outline" size={24} color="#3B82F6" />
              <Text style={styles.metricValue}>
                {formatNumber(report.summary.totalTextGenerations)}
              </Text>
              <Text style={styles.metricLabel}>텍스트 생성</Text>
            </View>
            <View style={styles.metricCard}>
              <SafeIcon name="image-outline" size={24} color="#8B5CF6" />
              <Text style={styles.metricValue}>
                {formatNumber(report.summary.totalImageAnalyses)}
              </Text>
              <Text style={styles.metricLabel}>이미지 분석</Text>
            </View>
            <View style={styles.metricCard}>
              <MaterialIcon name="token" size={24} color="#10B981" />
              <Text style={styles.metricValue}>
                {formatNumber(report.summary.totalTokensUsed)}
              </Text>
              <Text style={styles.metricLabel}>토큰 사용</Text>
            </View>
            <View style={styles.metricCard}>
              <MaterialIcon name="attach-money" size={24} color="#F59E0B" />
              <Text style={styles.metricValue}>
                {formatCurrency(report.summary.totalCost)}
              </Text>
              <Text style={styles.metricLabel}>현재 비용</Text>
            </View>
          </View>

          <View style={styles.projectionCard}>
            <View style={styles.projectionHeader}>
              <Text style={styles.projectionTitle}>예상 월 비용</Text>
              <Text style={styles.projectionAmount}>
                {formatCurrency(report.summary.projectedMonthlyCost)}
              </Text>
            </View>
            <View style={styles.projectionBar}>
              <View
                style={[
                  styles.projectionFill,
                  {
                    width: `${
                      (report.summary.totalCost /
                        report.summary.projectedMonthlyCost) *
                      100
                    }%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.projectionSubtext}>
              일 평균 {formatCurrency(report.dailyAverage.cost)} 사용 중
            </Text>
          </View>

          <View style={styles.recommendationCard}>
            <View style={styles.recommendationHeader}>
              <MaterialIcon name="star" size={20} color="#F59E0B" />
              <Text style={styles.recommendationTitle}>추천 요금제</Text>
            </View>
            <Text style={styles.recommendationPlan}>
              {report.recommendedPlan.plan}
            </Text>
            <Text style={styles.recommendationReason}>
              {report.recommendedPlan.reason}
            </Text>
            {report.recommendedPlan.monthlySaving > 0 && (
              <Text style={styles.recommendationSaving}>
                월 {formatCurrency(report.recommendedPlan.monthlySaving / 1300)}{" "}
                절약 가능!
              </Text>
            )}
          </View>

          <View style={styles.tipsSection}>
            <Text style={styles.sectionTitle}>💡 비용 절감 팁</Text>
            {report.costSavingTips.map((tip: any, index: number) => (
              <View key={index} style={styles.tipCard}>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipDescription}>{tip.description}</Text>
                <Text style={styles.tipSaving}>
                  절감 가능: {tip.potentialSaving}
                </Text>
              </View>
            ))}
          </View>
        </>
      ) : (
        <>
          <View style={styles.efficiencySection}>
            <Text style={styles.sectionTitle}>모델별 사용 현황</Text>
            {report.modelEfficiency.map((model: any, index: number) => (
              <View key={index} style={styles.modelCard}>
                <View style={styles.modelHeader}>
                  <Text style={styles.modelName}>
                    {model.model.split("/")[1]}
                  </Text>
                  <Text style={styles.modelRequests}>
                    {model.totalRequests}회
                  </Text>
                </View>
                <View style={styles.modelStats}>
                  <View style={styles.modelStat}>
                    <Text style={styles.modelStatLabel}>평균 토큰</Text>
                    <Text style={styles.modelStatValue}>
                      {model.avgTokensPerRequest.toFixed(0)}
                    </Text>
                  </View>
                  <View style={styles.modelStat}>
                    <Text style={styles.modelStatLabel}>요청당 비용</Text>
                    <Text style={styles.modelStatValue}>
                      {formatCurrency(model.avgCostPerRequest)}
                    </Text>
                  </View>
                  <View style={styles.modelStat}>
                    <Text style={styles.modelStatLabel}>총 비용</Text>
                    <Text style={styles.modelStatValue}>
                      {formatCurrency(model.totalCost)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.breakdownSection}>
            <Text style={styles.sectionTitle}>기능별 비용 분석</Text>
            <View style={styles.breakdownCard}>
              <View style={styles.breakdownItem}>
                <View style={styles.breakdownLeft}>
                  <SafeIcon name="create-outline" size={20} color="#3B82F6" />
                  <Text style={styles.breakdownLabel}>텍스트 생성</Text>
                </View>
                <Text style={styles.breakdownValue}>
                  {formatCurrency(
                    report.costBreakdown.byFeature.textGeneration
                  )}
                </Text>
              </View>
              <View style={styles.breakdownDivider} />
              <View style={styles.breakdownItem}>
                <View style={styles.breakdownLeft}>
                  <SafeIcon name="image-outline" size={20} color="#8B5CF6" />
                  <Text style={styles.breakdownLabel}>이미지 분석</Text>
                </View>
                <Text style={styles.breakdownValue}>
                  {formatCurrency(report.costBreakdown.byFeature.imageAnalysis)}
                </Text>
              </View>
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    padding: SPACING.lg,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  headerSubtitle: {
    fontSize: 15,
    color: "#6B7280",
    lineHeight: 22,
  },
  tabSelector: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  activeTabText: {
    color: COLORS.primary,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  metricCard: {
    flex: 1,
    minWidth: "48%",
    backgroundColor: "#FFFFFF",
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A1A1A",
    marginVertical: SPACING.xs,
  },
  metricLabel: {
    fontSize: 12,
    color: "#6B7280",
  },
  projectionCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    padding: SPACING.lg,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  projectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  projectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  projectionAmount: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.primary,
  },
  projectionBar: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    marginBottom: SPACING.sm,
  },
  projectionFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  projectionSubtext: {
    fontSize: 13,
    color: "#6B7280",
  },
  recommendationCard: {
    backgroundColor: "#FFF7F5",
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    padding: SPACING.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FFE5E5",
  },
  recommendationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  recommendationTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  recommendationPlan: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  recommendationReason: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  recommendationSaving: {
    fontSize: 14,
    color: "#10B981",
    fontWeight: "600",
    marginTop: SPACING.sm,
  },
  tipsSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: SPACING.md,
  },
  tipCard: {
    backgroundColor: "#FFFFFF",
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.sm,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: SPACING.xs,
  },
  tipDescription: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 18,
  },
  tipSaving: {
    fontSize: 12,
    color: "#10B981",
    fontWeight: "500",
    marginTop: SPACING.xs,
  },
  efficiencySection: {
    padding: SPACING.lg,
  },
  modelCard: {
    backgroundColor: "#FFFFFF",
    padding: SPACING.md,
    borderRadius: 12,
    marginBottom: SPACING.sm,
  },
  modelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  modelName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  modelRequests: {
    fontSize: 13,
    color: "#6B7280",
  },
  modelStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modelStat: {
    alignItems: "center",
  },
  modelStatLabel: {
    fontSize: 11,
    color: "#6B7280",
    marginBottom: 2,
  },
  modelStatValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  breakdownSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  breakdownCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: SPACING.lg,
  },
  breakdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  breakdownLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  breakdownLabel: {
    fontSize: 14,
    color: "#1A1A1A",
  },
  breakdownValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  breakdownDivider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: SPACING.md,
  },
});

export default CostMonitorScreen;

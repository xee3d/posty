import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import Svg, {
  Rect,
  Text as SvgText,
  G,
  Path,
  Defs,
  Pattern,
  Circle,
  Marker,
} from "react-native-svg";

const { width: screenWidth } = Dimensions.get("window");

const PostyArchitectureDiagram = () => {
  const [activeTab, setActiveTab] = useState(0);

  const TabButton = ({ title, index, active, onPress }) => (
    <TouchableOpacity
      style={[styles.tabButton, active && styles.activeTab]}
      onPress={() => onPress(index)}
    >
      <Text style={[styles.tabText, active && styles.activeTabText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const OverviewDiagram = () => (
    <View style={styles.diagramContainer}>
      <Svg width={screenWidth - 40} height={600} viewBox="0 0 1200 800">
        {/* 배경 그리드 */}
        <Defs>
          <Pattern
            id="grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <Path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          </Pattern>
          <Marker
            id="arrowblue"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <Path d="M0,0 L0,6 L9,3 z" fill="#3b82f6" />
          </Marker>
          <Marker
            id="arrowred"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <Path d="M0,0 L0,6 L9,3 z" fill="#ef4444" />
          </Marker>
          <Marker
            id="arrowgreen"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <Path d="M0,0 L0,6 L9,3 z" fill="#10b981" />
          </Marker>
          <Marker
            id="arrowgray"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <Path d="M0,0 L0,6 L9,3 z" fill="#6b7280" />
          </Marker>
        </Defs>

        <Rect width="1200" height="800" fill="url(#grid)" />

        {/* 클라이언트 영역 */}
        <G>
          <Rect
            x="50"
            y="50"
            width="300"
            height="700"
            rx="10"
            fill="#f3f4f6"
            stroke="#9ca3af"
            strokeWidth="2"
          />
          <SvgText
            x="200"
            y="80"
            textAnchor="middle"
            fontSize="20"
            fontWeight="bold"
            fill="#1f2937"
          >
            React Native App
          </SvgText>

          <Rect
            x="80"
            y="120"
            width="240"
            height="60"
            rx="5"
            fill="#dbeafe"
            stroke="#3b82f6"
            strokeWidth="1"
          />
          <SvgText
            x="200"
            y="155"
            textAnchor="middle"
            fontSize="14"
            fill="#1e40af"
          >
            AIWriteScreen
          </SvgText>

          <Rect
            x="80"
            y="200"
            width="240"
            height="60"
            rx="5"
            fill="#dbeafe"
            stroke="#3b82f6"
            strokeWidth="1"
          />
          <SvgText
            x="200"
            y="235"
            textAnchor="middle"
            fontSize="14"
            fill="#1e40af"
          >
            SettingsScreen
          </SvgText>

          <Rect
            x="80"
            y="280"
            width="240"
            height="60"
            rx="5"
            fill="#dbeafe"
            stroke="#3b82f6"
            strokeWidth="1"
          />
          <SvgText
            x="200"
            y="315"
            textAnchor="middle"
            fontSize="14"
            fill="#1e40af"
          >
            TrendScreen
          </SvgText>

          <Rect
            x="80"
            y="380"
            width="240"
            height="80"
            rx="5"
            fill="#fef3c7"
            stroke="#f59e0b"
            strokeWidth="1"
          />
          <SvgText
            x="200"
            y="410"
            textAnchor="middle"
            fontSize="14"
            fontWeight="bold"
            fill="#92400e"
          >
            Redux Store
          </SvgText>
          <SvgText
            x="200"
            y="435"
            textAnchor="middle"
            fontSize="12"
            fill="#92400e"
          >
            userSlice, tokenSlice
          </SvgText>

          <Rect
            x="80"
            y="490"
            width="240"
            height="80"
            rx="5"
            fill="#dcfce7"
            stroke="#22c55e"
            strokeWidth="1"
          />
          <SvgText
            x="200"
            y="520"
            textAnchor="middle"
            fontSize="14"
            fontWeight="bold"
            fill="#166534"
          >
            Firebase
          </SvgText>
          <SvgText
            x="200"
            y="545"
            textAnchor="middle"
            fontSize="12"
            fill="#166534"
          >
            Auth & Firestore
          </SvgText>
        </G>

        {/* API Gateway */}
        <G>
          <Rect
            x="450"
            y="250"
            width="300"
            height="300"
            rx="10"
            fill="#f9fafb"
            stroke="#6b7280"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
          <SvgText
            x="600"
            y="280"
            textAnchor="middle"
            fontSize="18"
            fontWeight="bold"
            fill="#374151"
          >
            API Gateway
          </SvgText>

          <Rect
            x="480"
            y="320"
            width="240"
            height="60"
            rx="5"
            fill="#e0e7ff"
            stroke="#6366f1"
            strokeWidth="1"
          />
          <SvgText
            x="600"
            y="355"
            textAnchor="middle"
            fontSize="14"
            fill="#4338ca"
          >
            AIServiceWrapper
          </SvgText>

          <Rect
            x="480"
            y="400"
            width="240"
            height="60"
            rx="5"
            fill="#e0e7ff"
            stroke="#6366f1"
            strokeWidth="1"
          />
          <SvgText
            x="600"
            y="435"
            textAnchor="middle"
            fontSize="14"
            fill="#4338ca"
          >
            serverAIService
          </SvgText>
        </G>

        {/* 서버들 */}
        <G>
          {/* AI 서버 */}
          <Rect
            x="850"
            y="50"
            width="300"
            height="280"
            rx="10"
            fill="#fee2e2"
            stroke="#ef4444"
            strokeWidth="2"
          />
          <SvgText
            x="1000"
            y="80"
            textAnchor="middle"
            fontSize="18"
            fontWeight="bold"
            fill="#991b1b"
          >
            AI Content Server
          </SvgText>
          <SvgText
            x="1000"
            y="105"
            textAnchor="middle"
            fontSize="12"
            fill="#991b1b"
          >
            posty-server-new.vercel.app
          </SvgText>

          <Rect
            x="880"
            y="140"
            width="240"
            height="50"
            rx="5"
            fill="#fecaca"
            stroke="#ef4444"
            strokeWidth="1"
          />
          <SvgText
            x="1000"
            y="170"
            textAnchor="middle"
            fontSize="13"
            fill="#7f1d1d"
          >
            /api/generate
          </SvgText>

          <Rect
            x="880"
            y="200"
            width="240"
            height="50"
            rx="5"
            fill="#fecaca"
            stroke="#ef4444"
            strokeWidth="1"
          />
          <SvgText
            x="1000"
            y="230"
            textAnchor="middle"
            fontSize="13"
            fill="#7f1d1d"
          >
            /api/health
          </SvgText>

          <Rect
            x="880"
            y="260"
            width="240"
            height="50"
            rx="5"
            fill="#fecaca"
            stroke="#ef4444"
            strokeWidth="1"
          />
          <SvgText
            x="1000"
            y="290"
            textAnchor="middle"
            fontSize="13"
            fill="#7f1d1d"
          >
            /api/generate-test
          </SvgText>

          {/* 트렌드 서버 */}
          <Rect
            x="850"
            y="380"
            width="300"
            height="170"
            rx="10"
            fill="#d1fae5"
            stroke="#10b981"
            strokeWidth="2"
          />
          <SvgText
            x="1000"
            y="410"
            textAnchor="middle"
            fontSize="18"
            fontWeight="bold"
            fill="#065f46"
          >
            Trend Data Server
          </SvgText>
          <SvgText
            x="1000"
            y="435"
            textAnchor="middle"
            fontSize="12"
            fill="#065f46"
          >
            posty-api-v2.vercel.app
          </SvgText>

          <Rect
            x="880"
            y="470"
            width="240"
            height="50"
            rx="5"
            fill="#a7f3d0"
            stroke="#10b981"
            strokeWidth="1"
          />
          <SvgText
            x="1000"
            y="500"
            textAnchor="middle"
            fontSize="13"
            fill="#064e3b"
          >
            /api/trends
          </SvgText>
        </G>

        {/* OpenAI API */}
        <G>
          <Rect
            x="850"
            y="620"
            width="300"
            height="120"
            rx="10"
            fill="#e5e7eb"
            stroke="#6b7280"
            strokeWidth="2"
          />
          <SvgText
            x="1000"
            y="655"
            textAnchor="middle"
            fontSize="18"
            fontWeight="bold"
            fill="#1f2937"
          >
            OpenAI API
          </SvgText>
          <SvgText
            x="1000"
            y="680"
            textAnchor="middle"
            fontSize="14"
            fill="#374151"
          >
            GPT-4o-mini
          </SvgText>
          <SvgText
            x="1000"
            y="705"
            textAnchor="middle"
            fontSize="12"
            fill="#6b7280"
          >
            Chat Completions
          </SvgText>
        </G>

        {/* 연결선들 */}
        <Path
          d="M 350 400 L 450 400"
          stroke="#3b82f6"
          strokeWidth="2"
          markerEnd="url(#arrowblue)"
        />
        <Path
          d="M 750 350 L 850 190"
          stroke="#ef4444"
          strokeWidth="2"
          markerEnd="url(#arrowred)"
        />
        <Path
          d="M 750 430 L 850 480"
          stroke="#10b981"
          strokeWidth="2"
          markerEnd="url(#arrowgreen)"
        />
        <Path
          d="M 1000 330 L 1000 620"
          stroke="#6b7280"
          strokeWidth="2"
          markerEnd="url(#arrowgray)"
        />

        <Path
          d="M 200 570 L 200 630"
          stroke="#22c55e"
          strokeWidth="2"
          strokeDasharray="5,5"
        />
        <Circle
          cx="200"
          cy="650"
          r="40"
          fill="#dcfce7"
          stroke="#22c55e"
          strokeWidth="2"
        />
        <SvgText
          x="200"
          y="655"
          textAnchor="middle"
          fontSize="12"
          fill="#166534"
        >
          Firestore
        </SvgText>
      </Svg>
    </View>
  );

  const DataFlowDiagram = () => (
    <ScrollView style={styles.dataFlowContainer}>
      <Text style={styles.sectionTitle}>데이터 플로우</Text>

      {/* AI 콘텐츠 생성 플로우 */}
      <View style={styles.flowCard}>
        <Text style={styles.flowTitle}>AI 콘텐츠 생성 플로우</Text>
        <View style={styles.flowSteps}>
          <View style={styles.flowStep}>
            <Text style={styles.flowIcon}>📱</Text>
            <Text style={styles.flowLabel}>사용자 입력</Text>
          </View>
          <Text style={styles.flowArrow}>→</Text>
          <View style={styles.flowStep}>
            <Text style={styles.flowIcon}>🔄</Text>
            <Text style={styles.flowLabel}>AIServiceWrapper</Text>
          </View>
          <Text style={styles.flowArrow}>→</Text>
          <View style={styles.flowStep}>
            <Text style={styles.flowIcon}>🖥️</Text>
            <Text style={styles.flowLabel}>Vercel Server</Text>
          </View>
          <Text style={styles.flowArrow}>→</Text>
          <View style={styles.flowStep}>
            <Text style={styles.flowIcon}>🤖</Text>
            <Text style={styles.flowLabel}>OpenAI API</Text>
          </View>
        </View>
        <View style={styles.flowDescription}>
          <Text style={styles.flowDescText}>
            1. 사용자가 프롬프트 입력 (톤, 길이 선택)
          </Text>
          <Text style={styles.flowDescText}>
            2. AIServiceWrapper가 요청 검증 및 플랫폼별 최적화
          </Text>
          <Text style={styles.flowDescText}>
            3. Vercel 서버가 OpenAI API 호출 (보안 키 관리)
          </Text>
          <Text style={styles.flowDescText}>
            4. GPT-4o-mini가 콘텐츠 생성 후 반환
          </Text>
        </View>
      </View>

      {/* 인증 플로우 */}
      <View style={styles.flowCard}>
        <Text style={styles.flowTitle}>인증 및 데이터 동기화</Text>
        <View style={styles.flowSteps}>
          <View style={styles.flowStep}>
            <Text style={styles.flowIcon}>🔐</Text>
            <Text style={styles.flowLabel}>Google Auth</Text>
          </View>
          <Text style={styles.flowArrow}>→</Text>
          <View style={styles.flowStep}>
            <Text style={styles.flowIcon}>🗄️</Text>
            <Text style={styles.flowLabel}>Redux Store</Text>
          </View>
          <Text style={styles.flowArrow}>↔️</Text>
          <View style={styles.flowStep}>
            <Text style={styles.flowIcon}>☁️</Text>
            <Text style={styles.flowLabel}>Firestore</Text>
          </View>
        </View>
        <View style={styles.flowDescription}>
          <Text style={styles.flowDescText}>
            • Firebase Auth로 로그인 → Redux store 업데이트
          </Text>
          <Text style={styles.flowDescText}>
            • Firestore 실시간 동기화 (구독 정보, 토큰, 설정)
          </Text>
          <Text style={styles.flowDescText}>• 오프라인 지원 및 캐싱</Text>
        </View>
      </View>

      {/* 토큰 시스템 */}
      <View style={styles.flowCard}>
        <Text style={styles.flowTitle}>토큰 시스템</Text>
        <View style={styles.tokenGrid}>
          <View style={styles.tokenItem}>
            <Text style={styles.tokenIcon}>🆓</Text>
            <Text style={styles.tokenName}>FREE</Text>
            <Text style={styles.tokenDesc}>10개/일</Text>
          </View>
          <View style={styles.tokenItem}>
            <Text style={styles.tokenIcon}>⭐</Text>
            <Text style={styles.tokenName}>STARTER</Text>
            <Text style={styles.tokenDesc}>200개/월</Text>
          </View>
          <View style={styles.tokenItem}>
            <Text style={styles.tokenIcon}>💎</Text>
            <Text style={styles.tokenName}>PREMIUM</Text>
            <Text style={styles.tokenDesc}>500개/월</Text>
          </View>
          <View style={styles.tokenItem}>
            <Text style={styles.tokenIcon}>👑</Text>
            <Text style={styles.tokenName}>PRO</Text>
            <Text style={styles.tokenDesc}>무제한</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const TechStackDiagram = () => (
    <ScrollView style={styles.techStackContainer}>
      <Text style={styles.sectionTitle}>기술 스택</Text>

      <View style={styles.techGrid}>
        {/* Frontend */}
        <View style={styles.techCard}>
          <Text style={[styles.techTitle, { color: "#3b82f6" }]}>Frontend</Text>
          <View style={styles.techItem}>
            <Text style={styles.techIcon}>⚛️</Text>
            <Text style={styles.techText}>React Native 0.74</Text>
          </View>
          <View style={styles.techItem}>
            <Text style={styles.techIcon}>🗃️</Text>
            <Text style={styles.techText}>Redux Toolkit</Text>
          </View>
          <View style={styles.techItem}>
            <Text style={styles.techIcon}>🔥</Text>
            <Text style={styles.techText}>Firebase SDK</Text>
          </View>
          <View style={styles.techItem}>
            <Text style={styles.techIcon}>📱</Text>
            <Text style={styles.techText}>React Navigation</Text>
          </View>
        </View>

        {/* Backend */}
        <View style={styles.techCard}>
          <Text style={[styles.techTitle, { color: "#ef4444" }]}>Backend</Text>
          <View style={styles.techItem}>
            <Text style={styles.techIcon}>▲</Text>
            <Text style={styles.techText}>Vercel Functions</Text>
          </View>
          <View style={styles.techItem}>
            <Text style={styles.techIcon}>🟢</Text>
            <Text style={styles.techText}>Node.js</Text>
          </View>
          <View style={styles.techItem}>
            <Text style={styles.techIcon}>🔒</Text>
            <Text style={styles.techText}>Environment Variables</Text>
          </View>
          <View style={styles.techItem}>
            <Text style={styles.techIcon}>⚡</Text>
            <Text style={styles.techText}>Serverless</Text>
          </View>
        </View>

        {/* Services */}
        <View style={styles.techCard}>
          <Text style={[styles.techTitle, { color: "#10b981" }]}>Services</Text>
          <View style={styles.techItem}>
            <Text style={styles.techIcon}>🤖</Text>
            <Text style={styles.techText}>OpenAI API</Text>
          </View>
          <View style={styles.techItem}>
            <Text style={styles.techIcon}>🔥</Text>
            <Text style={styles.techText}>Firebase Auth</Text>
          </View>
          <View style={styles.techItem}>
            <Text style={styles.techIcon}>☁️</Text>
            <Text style={styles.techText}>Firestore DB</Text>
          </View>
          <View style={styles.techItem}>
            <Text style={styles.techIcon}>📊</Text>
            <Text style={styles.techText}>Trend APIs</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const tabs = ["전체 구조", "데이터 플로우", "기술 스택"];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Posty 프로젝트 아키텍처</Text>

      <View style={styles.tabContainer}>
        {tabs.map((tab, index) => (
          <TabButton
            key={index}
            title={tab}
            index={index}
            active={activeTab === index}
            onPress={setActiveTab}
          />
        ))}
      </View>

      {activeTab === 0 && <OverviewDiagram />}
      {activeTab === 1 && <DataFlowDiagram />}
      {activeTab === 2 && <TechStackDiagram />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 20,
    color: "#1f2937",
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "#e5e7eb",
  },
  activeTab: {
    borderBottomColor: "#3b82f6",
  },
  tabText: {
    fontSize: 16,
    color: "#6b7280",
  },
  activeTabText: {
    color: "#3b82f6",
    fontWeight: "bold",
  },
  diagramContainer: {
    padding: 20,
    backgroundColor: "#ffffff",
    margin: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dataFlowContainer: {
    flex: 1,
    padding: 20,
  },
  techStackContainer: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#1f2937",
  },
  flowCard: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  flowTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#3b82f6",
  },
  flowSteps: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  flowStep: {
    alignItems: "center",
  },
  flowIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  flowLabel: {
    fontSize: 12,
    color: "#6b7280",
  },
  flowArrow: {
    fontSize: 20,
    color: "#9ca3af",
  },
  flowDescription: {
    marginTop: 10,
  },
  flowDescText: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  tokenGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  tokenItem: {
    alignItems: "center",
    flex: 1,
  },
  tokenIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  tokenName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1f2937",
  },
  tokenDesc: {
    fontSize: 12,
    color: "#6b7280",
  },
  techGrid: {
    gap: 20,
  },
  techCard: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  techTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  techItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  techIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  techText: {
    fontSize: 16,
    color: "#1f2937",
  },
});

export default PostyArchitectureDiagram;

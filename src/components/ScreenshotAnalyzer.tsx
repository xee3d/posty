import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { SafeIcon } from "../utils/SafeIcon";
import MaterialIcon from "react-native-vector-icons/MaterialIcons";
import { COLORS, SPACING } from "../utils/constants";
import { useAppTheme } from "../hooks/useAppTheme";
import {
  launchImageLibrary,
  ImagePickerResponse,
} from "react-native-image-picker";
import { Alert } from "../utils/customAlert";
// import TextRecognition from '@react-native-ml-kit/text-recognition'; // 설치 필요

interface ScreenshotAnalyzerProps {
  onAnalysisComplete: (metrics: {
    likes: number;
    comments: number;
    shares?: number;
    views?: number;
  }) => void;
}

const ScreenshotAnalyzer: React.FC<ScreenshotAnalyzerProps> = ({
  onAnalysisComplete,
}) => {
  const { colors } = useAppTheme();
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleSelectScreenshot = () => {
    const options = {
      mediaType: "photo" as const,
      quality: 1 as any,
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        setSelectedImage(asset.uri || null);
        analyzeScreenshot(asset.uri!);
      }
    });
  };

  const analyzeScreenshot = async (imageUri: string) => {
    setAnalyzing(true);
    try {
      // OCR 라이브러리 사용 시
      // const result = await TextRecognition.recognize(imageUri);
      // const metrics = extractMetrics(result.text);

      // 임시 모의 분석 (실제로는 OCR 사용)
      setTimeout(() => {
        // 모의 데이터
        const mockMetrics = {
          likes: Math.floor(Math.random() * 1000) + 100,
          comments: Math.floor(Math.random() * 100) + 10,
          shares: Math.floor(Math.random() * 50),
          views: Math.floor(Math.random() * 5000) + 500,
        };

        Alert.alert(
          "분석 완료",
          `좋아요: ${mockMetrics.likes}\n` +
            `댓글: ${mockMetrics.comments}\n` +
            `공유: ${mockMetrics.shares}\n` +
            `조회수: ${mockMetrics.views}`,
          [
            { text: "다시 분석", style: "cancel" },
            {
              text: "사용하기",
              onPress: () => onAnalysisComplete(mockMetrics),
            },
          ]
        );
        setAnalyzing(false);
      }, 2000);
    } catch (error) {
      Alert.alert("분석 실패", "스크린샷을 분석할 수 없습니다.");
      setAnalyzing(false);
    }
  };

  // 실제 OCR 텍스트에서 숫자 추출하는 함수
  const extractMetrics = (text: string) => {
    const patterns = {
      likes: [/좋아요\s*([\d,]+)/i, /([\d,]+)\s*likes?/i, /([\d,]+)개$/m],
      comments: [
        /댓글\s*([\d,]+)/i,
        /([\d,]+)\s*comments?/i,
        /댓글\s*모두\s*보기\s*\(([\d,]+)\)/i,
      ],
      shares: [/공유\s*([\d,]+)/i, /([\d,]+)\s*shares?/i],
      views: [
        /조회수?\s*([\d,]+)/i,
        /([\d,]+)\s*views?/i,
        /조회\s*([\d,.]+[만천]?)/i,
      ],
    };

    const extractNumber = (patterns: RegExp[]): number => {
      for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
          let num = match[1].replace(/,/g, "");
          // 만, 천 단위 처리
          if (num.includes("만")) {
            num = num.replace("만", "");
            return parseFloat(num) * 10000;
          }
          if (num.includes("천")) {
            num = num.replace("천", "");
            return parseFloat(num) * 1000;
          }
          return parseInt(num) || 0;
        }
      }
      return 0;
    };

    return {
      likes: extractNumber(patterns.likes),
      comments: extractNumber(patterns.comments),
      shares: extractNumber(patterns.shares),
      views: extractNumber(patterns.views),
    };
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: SPACING.lg,
      marginVertical: SPACING.md,
    },
    title: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text.primary,
      marginBottom: SPACING.sm,
    },
    description: {
      fontSize: 14,
      color: colors.text.secondary,
      marginBottom: SPACING.md,
      lineHeight: 20,
    },
    uploadButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      padding: SPACING.md,
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "center",
      gap: SPACING.sm,
    },
    uploadButtonText: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.white,
    },
    imagePreview: {
      width: "100%",
      height: 200,
      borderRadius: 8,
      marginBottom: SPACING.md,
    },
    analyzing: {
      alignItems: "center",
      padding: SPACING.xl,
    },
    analyzingText: {
      marginTop: SPACING.md,
      fontSize: 14,
      color: colors.text.secondary,
    },
    features: {
      marginTop: SPACING.md,
      gap: SPACING.xs,
    },
    featureItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.xs,
    },
    featureText: {
      fontSize: 13,
      color: colors.text.tertiary,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📸 스크린샷으로 성과 입력</Text>
      <Text style={styles.description}>
        Instagram이나 Facebook 게시물 스크린샷을 업로드하면 좋아요와 댓글 수를
        자동으로 인식합니다!
      </Text>

      {selectedImage && !analyzing && (
        <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
      )}

      {analyzing ? (
        <View style={styles.analyzing}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.analyzingText}>스크린샷 분석 중...</Text>
        </View>
      ) : (
        <>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handleSelectScreenshot}
          >
            <MaterialIcon
              name="add-photo-alternate"
              size={20}
              color={colors.white}
            />
            <Text style={styles.uploadButtonText}>스크린샷 선택</Text>
          </TouchableOpacity>

          <View style={styles.features}>
            <View style={styles.featureItem}>
              <SafeIcon name="checkmark-circle" size={16} color="#10B981" />
              <Text style={styles.featureText}>Instagram 스토리/피드 지원</Text>
            </View>
            <View style={styles.featureItem}>
              <SafeIcon name="checkmark-circle" size={16} color="#10B981" />
              <Text style={styles.featureText}>Facebook 게시물 지원</Text>
            </View>
            <View style={styles.featureItem}>
              <SafeIcon name="checkmark-circle" size={16} color="#10B981" />
              <Text style={styles.featureText}>자동 숫자 인식</Text>
            </View>
          </View>
        </>
      )}
    </View>
  );
};

export default ScreenshotAnalyzer;

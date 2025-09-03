// src/components/common/OptimizedImage.tsx
import React, { useState, useCallback, useMemo } from "react";
import {
  Image,
  ImageProps,
  ImageStyle,
  StyleProp,
  View,
  ActivityIndicator,
  Animated,
  Platform,
  StyleSheet,
} from "react-native";
import { useAnimatedValue } from "../../hooks/useAnimations";
import { useOptimizedAnimation } from "../../utils/animationOptimizer";

interface OptimizedImageProps extends Omit<ImageProps, "source"> {
  source: ImageProps["source"];
  style?: StyleProp<ImageStyle>;
  placeholderColor?: string;
  showLoading?: boolean;
  fadeInDuration?: number;
  // 캐시 옵션
  cachePolicy?: "memory" | "disk" | "memory-disk";
  // 이미지 최적화 옵션
  resizeMode?: "cover" | "contain" | "stretch" | "center";
  // 썸네일 지원
  thumbnailSource?: ImageProps["source"];
  // 오류 시 대체 이미지
  fallbackSource?: ImageProps["source"];
}

/**
 * 최적화된 이미지 컴포넌트
 * - 로딩 상태 표시
 * - 페이드인 애니메이션
 * - 캐시 정책 지원
 * - 썸네일 → 원본 이미지 전환
 * - 오류 처리
 */
const OptimizedImage: React.FC<OptimizedImageProps> = ({
  source,
  style,
  placeholderColor = "#f0f0f0",
  showLoading = true,
  fadeInDuration = 300,
  cachePolicy = "memory-disk",
  resizeMode = "cover",
  thumbnailSource,
  fallbackSource,
  onLoad,
  onError,
  ...props
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [thumbnailLoaded, setThumbnailLoaded] = useState(false);
  const opacity = useAnimatedValue(0);
  const thumbnailOpacity = useAnimatedValue(1);
  const { getConfig, shouldAnimate } = useOptimizedAnimation();

  // 스타일 계산
  const imageStyle = useMemo(() => {
    return StyleSheet.flatten([style]);
  }, [style]);

  const containerStyle = useMemo(() => {
    return [
      imageStyle,
      {
        backgroundColor: loading ? placeholderColor : "transparent",
        overflow: "hidden" as const,
      },
    ] as any;
  }, [imageStyle, loading, placeholderColor]);

  // 캐시 설정이 적용된 source
  const optimizedSource = useMemo(() => {
    if (!source || typeof source !== "object" || !("uri" in source)) {
      return source;
    }

    const headers = {
      ...source.headers,
    };

    // Android에서 캐시 정책 적용
    if (Platform.OS === "android") {
      switch (cachePolicy) {
        case "memory":
          headers["Cache-Control"] = "max-age=3600"; // 1시간
          break;
        case "disk":
          headers["Cache-Control"] = "max-age=86400"; // 24시간
          break;
        case "memory-disk":
        default:
          headers["Cache-Control"] = "max-age=604800"; // 7일
          break;
      }
    }

    return {
      ...source,
      headers,
      cache: (cachePolicy === "memory" ? "reload" : "default") as any,
    };
  }, [source, cachePolicy]);

  // 이미지 로드 완료 처리
  const handleLoad = useCallback(
    (event: any) => {
      setLoading(false);
      setError(false);

      // 배터리 효율적인 페이드인 애니메이션
      if (shouldAnimate()) {
        Animated.timing(
          opacity,
          getConfig({
            toValue: 1,
            duration: fadeInDuration,
            useNativeDriver: true,
          })
        ).start();

        // 썸네일 페이드아웃
        if (thumbnailSource && thumbnailLoaded) {
          Animated.timing(
            thumbnailOpacity,
            getConfig({
              toValue: 0,
              duration: fadeInDuration,
              useNativeDriver: true,
            })
          ).start();
        }
      } else {
        // 애니메이션 없이 즉시 변경
        opacity.setValue(1);
        if (thumbnailSource && thumbnailLoaded) {
          thumbnailOpacity.setValue(0);
        }
      }

      onLoad?.(event);
    },
    [
      fadeInDuration,
      onLoad,
      opacity,
      thumbnailLoaded,
      thumbnailOpacity,
      thumbnailSource,
    ]
  );

  // 썸네일 로드 완료 처리
  const handleThumbnailLoad = useCallback(() => {
    setThumbnailLoaded(true);
    if (shouldAnimate()) {
      Animated.timing(
        thumbnailOpacity,
        getConfig({
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        })
      ).start();
    } else {
      thumbnailOpacity.setValue(1);
    }
  }, [thumbnailOpacity, getConfig, shouldAnimate]);

  // 오류 처리
  const handleError = useCallback(
    (error: any) => {
      setLoading(false);
      setError(true);
      onError?.(error);
    },
    [onError]
  );

  return (
    <View style={containerStyle}>
      {/* 썸네일 이미지 */}
      {thumbnailSource && !error && (
        <Animated.Image
          source={thumbnailSource}
          style={[
            StyleSheet.absoluteFillObject,
            { opacity: thumbnailOpacity },
            imageStyle,
          ]}
          resizeMode={resizeMode}
          onLoad={handleThumbnailLoad}
          blurRadius={20}
        />
      )}

      {/* 메인 이미지 */}
      {!error && (
        <Animated.Image
          {...props}
          source={optimizedSource}
          style={[StyleSheet.absoluteFillObject, { opacity }, imageStyle]}
          resizeMode={resizeMode}
          onLoad={handleLoad}
          onError={handleError}
          onLoadStart={() => setLoading(true)}
        />
      )}

      {/* 오류 시 대체 이미지 */}
      {error && fallbackSource && (
        <Image
          source={fallbackSource}
          style={[StyleSheet.absoluteFillObject, imageStyle]}
          resizeMode={resizeMode}
        />
      )}

      {/* 로딩 인디케이터 */}
      {loading && showLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#999" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default React.memo(OptimizedImage);

// 사용 예시:
// <OptimizedImage
//   source={{ uri: 'https://example.com/image.jpg' }}
//   thumbnailSource={{ uri: 'https://example.com/image-thumb.jpg' }}
//   fallbackSource={require('../../assets/placeholder.png')}
//   style={{ width: 200, height: 200 }}
//   cachePolicy="memory-disk"
//   showLoading
// />

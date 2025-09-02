import React, { useMemo } from "react";
import { FlatList, View, StyleSheet } from "react-native";
import AdaptiveNativeAd from "./AdaptiveNativeAd";
import SmartAdPlacement from "./SmartAdPlacement";
import AdIntegrationService from "../../services/AdIntegrationService";

interface FeedWithAdsProps {
  data: any[];
  renderItem: ({
    item,
    index,
  }: {
    item: any;
    index: number;
  }) => React.ReactElement;
  keyExtractor: (item: any, index: number) => string;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement;
  ListFooterComponent?: React.ComponentType<any> | React.ReactElement;
  onRefresh?: () => void;
  refreshing?: boolean;
  adInterval?: number; // 몇 개의 아이템마다 광고를 삽입할지
}

/**
 * 광고가 자동으로 삽입되는 피드 컴포넌트
 * - 일정 간격으로 네이티브 광고 삽입
 * - 다양한 광고 레이아웃 자동 선택
 * - 사용자 경험을 해치지 않는 자연스러운 광고 배치
 */
const FeedWithAds: React.FC<FeedWithAdsProps> = ({
  data,
  renderItem,
  keyExtractor,
  ListHeaderComponent,
  ListFooterComponent,
  onRefresh,
  refreshing,
  adInterval = 5, // 기본값: 5개 아이템마다 광고
}) => {
  // 광고가 삽입된 데이터 생성
  const dataWithAds = useMemo(() => {
    const result: any[] = [];
    let adCount = 0;

    data.forEach((item, index) => {
      result.push({ type: "content", data: item });

      // 광고 삽입 로직
      if ((index + 1) % adInterval === 0) {
        const adPosition = Math.floor((index + 1) / adInterval);
        const layout = AdIntegrationService.getAdLayoutType(adPosition);

        result.push({
          type: "ad",
          id: `ad_${adCount++}`,
          layout,
          position: adPosition,
        });
      }
    });

    return result;
  }, [data, adInterval]);

  // 렌더링 함수
  const renderItemWithAd = ({ item, index }: { item: any; index: number }) => {
    if (item.type === "ad") {
      return (
        <View style={styles.adWrapper}>
          <AdaptiveNativeAd
            layout={item.layout}
            onPress={() => {
              AdIntegrationService.trackUserAction("ad_click");
            }}
          />
        </View>
      );
    }

    // 일반 콘텐츠
    return renderItem({ item: item.data, index });
  };

  // 키 추출 함수
  const keyExtractorWithAd = (item: any, index: number) => {
    if (item.type === "ad") {
      return item.id;
    }
    return keyExtractor(item.data, index);
  };

  return (
    <FlatList
      data={dataWithAds}
      renderItem={renderItemWithAd}
      keyExtractor={keyExtractorWithAd}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
      onRefresh={onRefresh}
      refreshing={refreshing}
      showsVerticalScrollIndicator={false}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      contentContainerStyle={styles.contentContainer}
    />
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: 20,
  },
  adWrapper: {
    marginVertical: 8,
  },
  separator: {
    height: 1,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    marginHorizontal: 16,
  },
});

export default FeedWithAds;

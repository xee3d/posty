// 해시태그 개인화 유틸리티
import personalizedHashtagService from '../services/personalizedHashtagService';
import { Alert } from './customAlert';

// 개인화 데이터 현황 조회
export const getPersonalizationStats = async () => {
  try {
    const preferences = await personalizedHashtagService['getUserPreferences']();
    return {
      favoriteHashtagsCount: preferences.favorites.length,
      searchHistoryCount: preferences.searchHistory.length,
      lastUpdated: preferences.lastUpdated,
      topHashtags: preferences.favorites
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .map(item => ({ tag: item.tag, count: item.count }))
    };
  } catch (error) {
    console.error('Failed to get personalization stats:', error);
    return null;
  }
};

// 개인화 데이터 초기화 (사용자 요청 시)
export const resetPersonalization = () => {
  Alert.alert(
    '개인화 데이터 초기화',
    '지금까지 학습된 해시태그 선호도와 검색 기록을 모두 삭제하시겠습니까?\n\n삭제 후에는 복구할 수 없으며, 처음부터 새로 학습됩니다.',
    [
      {
        text: '취소',
        style: 'cancel',
      },
      {
        text: '초기화',
        style: 'destructive',
        onPress: async () => {
          try {
            await personalizedHashtagService.clearPreferences();
            Alert.alert(
              '초기화 완료',
              '개인화 데이터가 모두 삭제되었습니다.\n앞으로 글을 작성하시면 새로운 패턴을 학습하여 더 나은 추천을 제공하겠습니다!'
            );
          } catch (error) {
            console.error('Failed to reset personalization:', error);
            Alert.alert('오류', '초기화 중 문제가 발생했습니다. 다시 시도해주세요.');
          }
        },
      },
    ]
  );
};

// 개인화 시스템 설명
export const showPersonalizationInfo = () => {
  Alert.alert(
    '🎯 스마트 해시태그 추천',
    `포스티는 사용자의 글쓰기 패턴을 학습하여 맞춤형 해시태그를 추천합니다.

📊 추천 요소:
• 실시간 트렌드 (40%)
• 사용자 선호 해시태그 (30%)
• 시간대별 키워드 (20%)
• 검색 기록 (10%)

🔄 학습 방식:
• 생성한 글의 해시태그 분석
• 입력한 프롬프트 키워드 추출
• 사용 빈도와 최근성 반영
• 카테고리별 다양성 보장

🎨 실시간 반영:
• 프롬프트 입력 시 즉시 업데이트
• 글 생성 후 선호도 자동 저장
• 시간대/요일/계절 자동 고려

개인정보는 기기에만 저장되며 외부로 전송되지 않습니다.`,
    [{ text: '확인' }]
  );
};

// 개인화 품질 향상 팁
export const showPersonalizationTips = () => {
  Alert.alert(
    '💡 더 나은 추천을 위한 팁',
    `더 정확한 해시태그 추천을 받으려면:

✍️ 다양한 주제로 글쓰기:
• 일상, 여행, 음식, 취미 등 다양한 주제
• 시간대별로 다른 내용 작성

🎯 구체적인 프롬프트 작성:
• "카페에서 라떼 마시는 중" (좋음)
• "오늘 일상" (부족함)

📱 꾸준한 사용:
• 일주일에 3-4회 이상 사용
• 생성된 해시태그를 실제로 선택

🔄 피드백 제공:
• 마음에 드는 해시태그는 선택하기
• 다양한 톤과 길이로 실험해보기

2주 정도 사용하시면 확실히 더 나은 추천을 받으실 수 있습니다!`,
    [{ text: '확인' }]
  );
};
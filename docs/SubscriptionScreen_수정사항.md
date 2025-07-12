// SubscriptionScreen.tsx 상단 import 부분 수정
// 기존:
import EarnTokenModal from '../components/EarnTokenModal';

// 변경:
import rewardAdService from '../services/rewardAdService';
import missionService from '../services/missionService';
import MissionModal from '../components/MissionModal';

// state 수정
// 기존:
const [showEarnTokenModal, setShowEarnTokenModal] = useState(false);

// 변경:
const [showMissionModal, setShowMissionModal] = useState(false);

// handleWatchAd 함수 수정
const handleWatchAd = async () => {
  const { canWatch, remainingCount } = await rewardAdService.canWatchAd();
  
  if (!canWatch) {
    Alert.alert(
      '일일 한도 초과',
      '오늘의 광고 시청 횟수를 모두 사용했어요. 내일 다시 시도해주세요!',
      [{ text: '확인' }]
    );
    return;
  }
  
  Alert.alert(
    '광고 시청',
    `30초 광고를 시청하고 2개의 토큰을 받으시겠어요?\n(오늘 남은 횟수: ${remainingCount}회)`,
    [
      { text: '취소', style: 'cancel' },
      { 
        text: '시청하기',
        onPress: async () => {
          const result = await rewardAdService.showAd();
          if (result.success && result.reward) {
            handleEarnTokens(result.reward);
          }
        }
      }
    ]
  );
};

// handleDailyCheck 함수 수정
const handleDailyCheck = async () => {
  // 오늘 이미 받았는지 확인
  const today = new Date().toDateString();
  const lastCheck = await AsyncStorage.getItem('last_daily_check');
  
  if (lastCheck === today) {
    Alert.alert('알림', '오늘은 이미 출석 체크를 했어요!');
    return;
  }
  
  // 출석 성공
  await AsyncStorage.setItem('last_daily_check', today);
  handleEarnTokens(1);
  
  // 미션 업데이트
  const loginResult = await missionService.trackDailyLogin();
  if (loginResult.isFirstToday) {
    console.log(`연속 로그인: ${loginResult.streak}일`);
  }
};

// handleShareSNS 함수 수정
const handleShareSNS = async () => {
  try {
    const result = await Share.share({
      message: 'Posty로 AI가 만드는 SNS 콘텐츠! 지금 바로 사용해보세요 🚀\nhttps://posty.app',
      title: 'Posty - AI 콘텐츠 생성',
    });
    
    if (result.action === Share.sharedAction) {
      // 공유 성공
      const today = new Date().toDateString();
      const sharedToday = await AsyncStorage.getItem(`shared_sns_${today}`);
      
      if (!sharedToday) {
        await AsyncStorage.setItem(`shared_sns_${today}`, 'true');
        handleEarnTokens(3);
        
        // 미션 업데이트
        await missionService.trackShare();
      } else {
        Alert.alert('알림', '오늘은 이미 SNS 공유를 했어요!');
      }
    }
  } catch (error) {
    console.error('Share error:', error);
  }
};

// handleCompleteMission 함수 수정
const handleCompleteMission = () => {
  // 미션 화면 보여주기
  setShowMissionModal(true);
};

// Modal 부분 수정
// 기존:
<EarnTokenModal
  visible={showEarnTokenModal}
  onClose={() => {
    setShowEarnTokenModal(false);
    loadTokenStats();
  }}
  onTokensEarned={handleEarnTokens}
/>

// 변경:
<MissionModal
  visible={showMissionModal}
  onClose={() => setShowMissionModal(false)}
  onTokensEarned={handleEarnTokens}
/>

// 헤더의 토큰 버튼 onPress 수정
// 기존:
onPress={() => setShowEarnTokenModal(true)}

// 변경:
onPress={() => setShowMissionModal(true)}
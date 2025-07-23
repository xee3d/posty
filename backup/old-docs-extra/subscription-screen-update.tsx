// ModernSubscriptionScreen.tsx 수정사항
// 파일 상단에 추가
import PaymentSuccessModal from '../../components/PaymentSuccessModal';

// 컴포넌트 내부에 state 추가
const [showSuccessModal, setShowSuccessModal] = useState(false);
const [purchaseType, setPurchaseType] = useState<'subscription' | 'tokens'>('subscription');
const [purchaseDetails, setPurchaseDetails] = useState<any>({});

// handleSubscribe 함수 수정
const handleSubscribe = async (plan: 'starter' | 'premium' | 'pro') => {
  setIsProcessing(true);
  
  try {
    // 개발 모드
    if (__DEV__) {
      console.log(`🛒 Mock subscribing to ${plan} plan`);
      
      // Redux 액션 디스패치
      dispatch(upgradePlan({ 
        plan, 
        initialTokens: SUBSCRIPTION_PLANS[plan].tokens 
      }));
      
      // 폭죽 모달 표시
      setPurchaseType('subscription');
      setPurchaseDetails({ planName: SUBSCRIPTION_PLANS[plan].name });
      setShowSuccessModal(true);
      
      return;
    }
    
    // 프로덕션: 실제 구독
    const result = await inAppPurchaseService.purchaseSubscription(plan);
    
    if (result) {
      dispatch(upgradePlan({ 
        plan, 
        initialTokens: SUBSCRIPTION_PLANS[plan].tokens 
      }));
      
      // 폭죽 모달 표시
      setPurchaseType('subscription');
      setPurchaseDetails({ planName: SUBSCRIPTION_PLANS[plan].name });
      setShowSuccessModal(true);
    }
  } catch (error) {
    console.error('Subscription failed:', error);
    Alert.show({
      title: '구독 실패',
      message: '구독 처리 중 오류가 발생했습니다.',
      type: 'error'
    });
  } finally {
    setIsProcessing(false);
  }
};

// 컴포넌트 return 문에 모달 추가
return (
  <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
    {/* 기존 내용 */}
    
    {/* 성공 모달 추가 */}
    <PaymentSuccessModal
      visible={showSuccessModal}
      onClose={() => setShowSuccessModal(false)}
      type={purchaseType}
      planName={purchaseDetails.planName}
      tokenAmount={purchaseDetails.tokenAmount}
    />
  </SafeAreaView>
);

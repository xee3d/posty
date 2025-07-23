// TokenPurchaseView.tsx 수정사항
// 파일 상단에 추가
import PaymentSuccessModal from './PaymentSuccessModal';

// 컴포넌트 내부에 state 추가
const [showSuccessModal, setShowSuccessModal] = useState(false);
const [purchasedAmount, setPurchasedAmount] = useState(0);

// handlePurchase 함수 수정 (Alert 대신 모달 사용)
const handlePurchase = async (tokens: number, price: string) => {
  setIsProcessing(true);
  
  try {
    // 개발 모드에서 즉시 성공
    if (__DEV__) {
      console.log(`🛒 Mock purchasing ${tokens} tokens`);
      
      // Redux 액션 디스패치
      dispatch(purchaseTokens({ amount: tokens }));
      
      // 폭죽 모달 표시
      setPurchasedAmount(tokens);
      setShowSuccessModal(true);
      
      // 사운드 효과는 모달에서 재생됨
      return;
    }
    
    // 프로덕션: 실제 인앱 결제
    const sku = getSkuByTokenAmount(tokens);
    if (!sku) {
      throw new Error('Invalid token package');
    }
    
    const purchase = await inAppPurchaseService.purchaseTokens(sku);
    
    if (purchase) {
      // Redux 액션 디스패치
      dispatch(purchaseTokens({ amount: tokens }));
      
      // 폭죽 모달 표시
      setPurchasedAmount(tokens);
      setShowSuccessModal(true);
    }
  } catch (error) {
    console.error('Purchase failed:', error);
    Alert.show({
      title: '구매 실패',
      message: error instanceof Error ? error.message : '구매 중 오류가 발생했습니다.',
      type: 'error'
    });
  } finally {
    setIsProcessing(false);
  }
};

// 컴포넌트 return 문에 모달 추가
return (
  <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
    {/* 기존 내용 */}
    
    {/* 성공 모달 추가 */}
    <PaymentSuccessModal
      visible={showSuccessModal}
      onClose={() => setShowSuccessModal(false)}
      type="tokens"
      tokenAmount={purchasedAmount}
    />
  </ScrollView>
);

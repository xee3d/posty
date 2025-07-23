// ModernSubscriptionScreen.tsx의 return 문에 추가할 코드
// </SafeAreaView> 바로 앞에 추가:

{/* 결제 성공 모달 */}
<PaymentSuccessModal
  visible={showSuccessModal}
  onClose={() => setShowSuccessModal(false)}
  type={purchaseType}
  planName={purchaseDetails.planName}
  tokenAmount={purchaseDetails.tokenAmount}
/>

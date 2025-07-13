// HomeScreen.tsx 수정 - 토큰 잔액 표시 부분 개선

{/* 헤더 섹션 */}
<FadeInView delay={0} duration={250}>
  <View style={styles.headerSection}>
    <View style={styles.headerContent}>
      <View style={styles.logoContainer}>
        <View style={styles.logoCircle}>
          <Text style={styles.mollyIcon}>{APP_TEXT.brand.characterName.charAt(0)}</Text>
        </View>
        <View>
          <Text style={styles.appTitle}>{BRAND.name}</Text>
          <Text style={styles.appSubtitle}>{BRAND.tagline}</Text>
        </View>
      </View>
      
      {/* 토큰 잔액 표시 - 개선된 버전 */}
      <View style={styles.tokenContainer}>
        <TouchableOpacity 
          style={styles.tokenBalance}
          onPress={() => onNavigate('subscription')}
          activeOpacity={0.7}
        >
          <MaterialIcon name="flash-on" size={18} color={colors.white} />
          <Text style={styles.tokenBalanceText}>{currentTokens}</Text>
        </TouchableOpacity>
        
        {/* 무료 토큰 받기 버튼 - 무료 사용자에게만 표시 */}
        {subscriptionPlan === 'free' && currentTokens < 5 && (
          <TouchableOpacity 
            style={styles.earnTokenButton}
            onPress={() => setShowEarnTokenModal(true)}
            activeOpacity={0.7}
          >
            <MaterialIcon name="add-circle" size={20} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  </View>
</FadeInView>

// 스타일 추가
tokenContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
},
earnTokenButton: {
  width: 32,
  height: 32,
  borderRadius: 16,
  backgroundColor: colors.white,
  justifyContent: 'center',
  alignItems: 'center',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
},
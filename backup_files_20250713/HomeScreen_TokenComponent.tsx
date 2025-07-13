// HomeScreen.tsx 헤더 부분 수정
import TokenDisplay from '../components/TokenDisplay';

// ... 기존 코드 ...

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
      
      {/* 토큰 잔액 표시 - 공통 컴포넌트 사용 */}
      <TokenDisplay 
        size="medium"
        showAddButton={true}
        onPress={() => onNavigate('subscription')}
      />
    </View>
  </View>
</FadeInView>
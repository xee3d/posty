// SettingsScreen.tsx 수정 사항
// 토큰 표시 부분을 제거한 프로필 카드 섹션

{/* 프로필 카드 (통합) */}
<View style={styles.section}>
  <View style={styles.profileCard}>
    <View style={styles.profileHeader}>
      <View style={styles.profileInfo}>
        <View style={styles.profileAvatar}>
          <Text style={styles.profileAvatarText}>{user.name.charAt(0)}</Text>
        </View>
        <View style={styles.profileDetails}>
          <Text style={styles.profileName}>{user.name}</Text>
          <Text style={styles.profileEmail}>{user.email}</Text>
          <View style={styles.planBadgeContainer}>
            <MaterialIcon name={planBadge.icon} size={14} color={planBadge.color} />
            <Text style={[styles.planBadgeText, { color: planBadge.color }]}>
              {planBadge.text}
            </Text>
          </View>
        </View>
      </View>
      <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
        <Icon name="create-outline" size={20} color={colors.text.secondary} />
      </TouchableOpacity>
    </View>

    {/* 간단한 통계만 표시 (토큰 제외) */}
    <View style={styles.miniStats}>
      <View style={styles.miniStatItem}>
        <Text style={styles.miniStatValue}>{stats.todayGenerated}</Text>
        <Text style={styles.miniStatLabel}>오늘 생성</Text>
      </View>
      <View style={styles.miniStatDivider} />
      <View style={styles.miniStatItem}>
        <Text style={styles.miniStatValue}>{stats.totalSaved}</Text>
        <Text style={styles.miniStatLabel}>저장된 콘텐츠</Text>
      </View>
      <View style={styles.miniStatDivider} />
      <View style={styles.miniStatItem}>
        <Text style={styles.miniStatValue}>{stats.joinDays}일</Text>
        <Text style={styles.miniStatLabel}>함께한 날</Text>
      </View>
    </View>

    {/* 구독 업그레이드 프롬프트 */}
    <TouchableOpacity 
      style={styles.upgradePrompt} 
      onPress={handleUpgradePlan}
    >
      <Icon name="rocket-outline" size={16} color={colors.primary} />
      <Text style={styles.upgradePromptText}>
        {subscriptionPlan === 'free' 
          ? 'Pro로 업그레이드하고 무제한으로 사용하세요'
          : '구독 관리 및 토큰 확인'
        }
      </Text>
      <Icon name="chevron-forward" size={16} color={colors.primary} />
    </TouchableOpacity>
  </View>
</View>
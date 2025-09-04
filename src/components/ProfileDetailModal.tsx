import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { updateDetailedProfile } from "../store/slices/userSlice";
import {
  DetailedUserProfile,
  INTEREST_SUGGESTIONS,
  getProfileGuideMessage,
  calculateProfileCompleteness,
} from "../types/userProfile";
import { SafeIcon } from "../utils/SafeIcon";
import LinearGradient from "react-native-linear-gradient";
import { useAppTheme } from "../hooks/useAppTheme";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface ProfileDetailModalProps {
  visible: boolean;
  onClose: () => void;
  showGuide?: boolean;
}

const ProfileDetailModal: React.FC<ProfileDetailModalProps> = ({
  visible,
  onClose,
  showGuide = false,
}) => {
  const dispatch = useDispatch();
  const { detailedProfile } = useSelector((state: RootState) => state.user);
  const { colors, isDark } = useAppTheme();
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  // 로컬 상태 관리
  const [localProfile, setLocalProfile] = useState<
    Partial<DetailedUserProfile>
  >(detailedProfile || {});
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    detailedProfile?.interests || []
  );
  const [customOccupation, setCustomOccupation] = useState(
    detailedProfile?.occupationDetail || ""
  );

  const styles = createStyles(colors, isDark);

  // 모달 애니메이션
  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  // 실시간 프로필 업데이트
  const updateProfileRealtime = (updates: Partial<DetailedUserProfile>) => {
    const updatedProfile: Partial<DetailedUserProfile> = {
      ...localProfile,
      ...updates,
      interests: selectedInterests,
      occupationDetail: customOccupation,
    };

    console.log("🔄 Real-time profile update:", updatedProfile);
    dispatch(updateDetailedProfile(updatedProfile));
  };

  // 프로필 저장
  const handleSave = () => {
    const updatedProfile: Partial<DetailedUserProfile> = {
      ...localProfile,
      interests: selectedInterests,
      occupationDetail: customOccupation,
    };

    console.log("📝 Saving user profile:", updatedProfile);
    dispatch(updateDetailedProfile(updatedProfile));

    // 저장 후 완성도 계산
    const completionAfterSave = calculateProfileCompleteness(
      updatedProfile as DetailedUserProfile
    );
    console.log("🎯 Profile completion after save:", completionAfterSave + "%");

    Alert.alert(
      "프로필 업데이트 완료! 🎉",
      `프로필이 ${completionAfterSave}% 완성되었습니다.\n이제 AI가 당신의 스타일에 맞는 글을 작성해드려요!`,
      [{ text: "확인", onPress: onClose }]
    );
  };

  // 관심사 토글
  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) => {
      const newInterests = prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest];

      // 실시간 업데이트
      updateProfileRealtime({ interests: newInterests });
      return newInterests;
    });
  };

  // 선택 버튼 컴포넌트
  const SelectButton = ({ label, selected, onPress }: any) => (
    <TouchableOpacity
      style={[styles.selectButton, selected && styles.selectButtonActive]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.selectButtonText,
          selected && styles.selectButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  // 프로필 완성도 표시
  const completeness = detailedProfile?.profileCompleteness || 0;
  const guideMessage = getProfileGuideMessage(completeness);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <Animated.View
          style={[
            styles.modalContent,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardAvoid}
            keyboardVerticalOffset={20}
          >
            {/* 헤더 */}
            <View style={styles.header}>
              <View style={styles.handleBar} />
              <Text style={styles.title}>나의 상세 프로필</Text>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <SafeIcon name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            {/* 프로필 완성도 */}
            <View style={styles.completenessSection}>
              <Text style={styles.completenessText}>
                프로필 완성도 {completeness}%
              </Text>
              <View style={styles.progressBar}>
                <LinearGradient
                  colors={["#4F46E5", "#7C3AED"]}  // 진한 인디고에서 보라색으로
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressFill, { width: `${completeness}%` }]}
                />
              </View>
              {guideMessage && showGuide && (
                <View style={styles.guideContainer}>
                  <View style={styles.guideIconContainer}>
                    <SafeIcon name="information-circle" size={18} color={colors.info} />
                  </View>
                  <Text style={styles.guideMessage}>{guideMessage}</Text>
                </View>
              )}
            </View>

            <ScrollView
              style={styles.scrollContent}
              contentContainerStyle={styles.scrollContentContainer}
              showsVerticalScrollIndicator={false}
              bounces={true}
            >
              {/* 연령대 */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>연령대</Text>
                <View style={styles.optionGrid}>
                  {["10s", "20s", "30s", "40s", "50s", "60s+"].map((age) => (
                    <SelectButton
                      key={age}
                      label={
                        age === "60s+" ? "60대 이상" : age.replace("s", "대")
                      }
                      selected={localProfile.ageGroup === age}
                      onPress={() => {
                        setLocalProfile((prev) => ({
                          ...prev,
                          ageGroup: age as any,
                        }));
                        updateProfileRealtime({ ageGroup: age as any });
                      }}
                    />
                  ))}
                </View>
              </View>

              {/* 성별 */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>성별</Text>
                <View style={styles.optionGrid}>
                  <SelectButton
                    label="남성"
                    selected={localProfile.gender === "male"}
                    onPress={() => {
                      setLocalProfile((prev) => ({ ...prev, gender: "male" }));
                      updateProfileRealtime({ gender: "male" });
                    }}
                  />
                  <SelectButton
                    label="여성"
                    selected={localProfile.gender === "female"}
                    onPress={() => {
                      setLocalProfile((prev) => ({
                        ...prev,
                        gender: "female",
                      }));
                      updateProfileRealtime({ gender: "female" });
                    }}
                  />
                  <SelectButton
                    label="기타"
                    selected={localProfile.gender === "other"}
                    onPress={() => {
                      setLocalProfile((prev) => ({ ...prev, gender: "other" }));
                      updateProfileRealtime({ gender: "other" });
                    }}
                  />
                  <SelectButton
                    label="비공개"
                    selected={localProfile.gender === "prefer_not_to_say"}
                    onPress={() => {
                      setLocalProfile((prev) => ({
                        ...prev,
                        gender: "prefer_not_to_say",
                      }));
                      updateProfileRealtime({ gender: "prefer_not_to_say" });
                    }}
                  />
                </View>
              </View>

              {/* 가족 관계 */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>가족 상태</Text>
                <View style={styles.optionGrid}>
                  <SelectButton
                    label="미혼"
                    selected={localProfile.familyRole === "single"}
                    onPress={() => {
                      setLocalProfile((prev) => ({
                        ...prev,
                        familyRole: "single",
                      }));
                      updateProfileRealtime({ familyRole: "single" });
                    }}
                  />
                  <SelectButton
                    label="기혼"
                    selected={localProfile.familyRole === "married"}
                    onPress={() => {
                      setLocalProfile((prev) => ({
                        ...prev,
                        familyRole: "married",
                      }));
                      updateProfileRealtime({ familyRole: "married" });
                    }}
                  />
                  <SelectButton
                    label="부모"
                    selected={localProfile.familyRole === "parent"}
                    onPress={() => {
                      setLocalProfile((prev) => ({
                        ...prev,
                        familyRole: "parent",
                      }));
                      updateProfileRealtime({ familyRole: "parent" });
                    }}
                  />
                  <SelectButton
                    label="조부모"
                    selected={localProfile.familyRole === "grandparent"}
                    onPress={() => {
                      setLocalProfile((prev) => ({
                        ...prev,
                        familyRole: "grandparent",
                      }));
                      updateProfileRealtime({ familyRole: "grandparent" });
                    }}
                  />
                </View>
              </View>

              {/* 부모 타입 (부모 선택시만 표시) */}
              {localProfile.familyRole === "parent" && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>부모 역할</Text>
                  <View style={styles.optionGrid}>
                    <SelectButton
                      label="엄마"
                      selected={localProfile.parentType === "mother"}
                      onPress={() =>
                        setLocalProfile((prev) => ({
                          ...prev,
                          parentType: "mother",
                        }))
                      }
                    />
                    <SelectButton
                      label="아빠"
                      selected={localProfile.parentType === "father"}
                      onPress={() =>
                        setLocalProfile((prev) => ({
                          ...prev,
                          parentType: "father",
                        }))
                      }
                    />
                  </View>

                  <Text style={[styles.sectionTitle, { marginTop: 15 }]}>
                    자녀 연령
                  </Text>
                  <View style={styles.optionGrid}>
                    {[
                      "baby",
                      "toddler",
                      "elementary",
                      "middle_school",
                      "high_school",
                      "adult",
                    ].map((age) => {
                      const labels: Record<string, string> = {
                        baby: "영아",
                        toddler: "유아",
                        elementary: "초등",
                        middle_school: "중등",
                        high_school: "고등",
                        adult: "성인",
                      };
                      return (
                        <SelectButton
                          key={age}
                          label={labels[age]}
                          selected={localProfile.childrenAge === age}
                          onPress={() =>
                            setLocalProfile((prev) => ({
                              ...prev,
                              childrenAge: age as any,
                            }))
                          }
                        />
                      );
                    })}
                  </View>
                </View>
              )}

              {/* 직업 */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>직업</Text>
                <View style={styles.optionGrid}>
                  {[
                    "student",
                    "office_worker",
                    "business_owner",
                    "freelancer",
                    "homemaker",
                    "retired",
                  ].map((job) => {
                    const labels: Record<string, string> = {
                      student: "학생",
                      office_worker: "직장인",
                      business_owner: "사업가",
                      freelancer: "프리랜서",
                      homemaker: "주부/주부",
                      retired: "은퇴",
                    };
                    return (
                      <SelectButton
                        key={job}
                        label={labels[job]}
                        selected={localProfile.occupation === job}
                        onPress={() =>
                          setLocalProfile((prev) => ({
                            ...prev,
                            occupation: job as any,
                          }))
                        }
                      />
                    );
                  })}
                </View>

                {localProfile.occupation &&
                  localProfile.occupation !== "student" && (
                    <TextInput
                      style={styles.textInput}
                      placeholder="구체적인 직업을 입력해주세요 (선택사항)"
                      value={customOccupation}
                      onChangeText={setCustomOccupation}
                      placeholderTextColor={colors.text.tertiary}
                    />
                  )}
              </View>

              {/* 관심사 */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>관심사 (복수 선택 가능)</Text>
                <View style={styles.interestGrid}>
                  {INTEREST_SUGGESTIONS.map((interest) => (
                    <TouchableOpacity
                      key={interest}
                      style={[
                        styles.interestChip,
                        selectedInterests.includes(interest) &&
                          styles.interestChipActive,
                      ]}
                      onPress={() => toggleInterest(interest)}
                    >
                      <Text
                        style={[
                          styles.interestChipText,
                          selectedInterests.includes(interest) &&
                            styles.interestChipTextActive,
                        ]}
                      >
                        {interest}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* 글쓰기 스타일 */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>선호하는 글쓰기 스타일</Text>

                <Text style={styles.subSectionTitle}>격식</Text>
                <View style={styles.optionGrid}>
                  <SelectButton
                    label="캐주얼"
                    selected={localProfile.writingStyle?.formality === "casual"}
                    onPress={() =>
                      setLocalProfile((prev) => ({
                        ...prev,
                        writingStyle: {
                          ...prev.writingStyle,
                          formality: "casual",
                        } as any,
                      }))
                    }
                  />
                  <SelectButton
                    label="균형"
                    selected={
                      localProfile.writingStyle?.formality === "balanced"
                    }
                    onPress={() =>
                      setLocalProfile((prev) => ({
                        ...prev,
                        writingStyle: {
                          ...prev.writingStyle,
                          formality: "balanced",
                        } as any,
                      }))
                    }
                  />
                  <SelectButton
                    label="격식"
                    selected={localProfile.writingStyle?.formality === "formal"}
                    onPress={() =>
                      setLocalProfile((prev) => ({
                        ...prev,
                        writingStyle: {
                          ...prev.writingStyle,
                          formality: "formal",
                        } as any,
                      }))
                    }
                  />
                </View>

                <Text style={styles.subSectionTitle}>감정 표현</Text>
                <View style={styles.optionGrid}>
                  <SelectButton
                    label="절제"
                    selected={localProfile.writingStyle?.emotiveness === "low"}
                    onPress={() =>
                      setLocalProfile((prev) => ({
                        ...prev,
                        writingStyle: {
                          ...prev.writingStyle,
                          emotiveness: "low",
                        } as any,
                      }))
                    }
                  />
                  <SelectButton
                    label="적당히"
                    selected={
                      localProfile.writingStyle?.emotiveness === "medium"
                    }
                    onPress={() =>
                      setLocalProfile((prev) => ({
                        ...prev,
                        writingStyle: {
                          ...prev.writingStyle,
                          emotiveness: "medium",
                        } as any,
                      }))
                    }
                  />
                  <SelectButton
                    label="풍부하게"
                    selected={localProfile.writingStyle?.emotiveness === "high"}
                    onPress={() =>
                      setLocalProfile((prev) => ({
                        ...prev,
                        writingStyle: {
                          ...prev.writingStyle,
                          emotiveness: "high",
                        } as any,
                      }))
                    }
                  />
                </View>

                <Text style={styles.subSectionTitle}>유머</Text>
                <View style={styles.optionGrid}>
                  <SelectButton
                    label="진지하게"
                    selected={localProfile.writingStyle?.humor === "none"}
                    onPress={() =>
                      setLocalProfile((prev) => ({
                        ...prev,
                        writingStyle: {
                          ...prev.writingStyle,
                          humor: "none",
                        } as any,
                      }))
                    }
                  />
                  <SelectButton
                    label="가볍게"
                    selected={localProfile.writingStyle?.humor === "light"}
                    onPress={() =>
                      setLocalProfile((prev) => ({
                        ...prev,
                        writingStyle: {
                          ...prev.writingStyle,
                          humor: "light",
                        } as any,
                      }))
                    }
                  />
                  <SelectButton
                    label="재치있게"
                    selected={localProfile.writingStyle?.humor === "witty"}
                    onPress={() =>
                      setLocalProfile((prev) => ({
                        ...prev,
                        writingStyle: {
                          ...prev.writingStyle,
                          humor: "witty",
                        } as any,
                      }))
                    }
                  />
                </View>
              </View>

              {/* 저장 버튼 */}
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <LinearGradient
                  colors={[colors.primary, colors.primary + "90"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.saveButtonGradient}
                >
                  <Text style={styles.saveButtonText}>프로필 저장하기</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
};

const createStyles = (colors: any, isDark: boolean) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    backdrop: {
      flex: 1,
    },
    modalContent: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      height: SCREEN_HEIGHT * 0.85, // 고정 높이로 변경 (85%)
    },
    keyboardAvoid: {
      flex: 1,
      height: "100%",
    },
    header: {
      alignItems: "center",
      paddingVertical: 15,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    handleBar: {
      width: 40,
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      marginBottom: 10,
    },
    title: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text.primary,
    },
    closeButton: {
      position: "absolute",
      right: 20,
      top: 20,
    },
    completenessSection: {
      paddingHorizontal: 20,
      paddingVertical: 15,
      backgroundColor: isDark
        ? colors.surfaceVariant || colors.surface
        : colors.surfaceVariant || colors.lightGray,
    },
    completenessText: {
      fontSize: 14,
      color: colors.text.primary,
      marginBottom: 8,
      fontWeight: "600",
    },
    progressBar: {
      height: 10,
      backgroundColor: colors.border,
      borderRadius: 6,
      overflow: "hidden",
      marginVertical: 4,
    },
    progressFill: {
      height: "100%",
      borderRadius: 6,
      shadowColor: "#4F46E5",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 3,
    },
    guideContainer: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginTop: 10,
      padding: 14,
      backgroundColor: isDark 
        ? colors.info + "20" 
        : colors.info + "10", // 다크모드에서 더 진한 배경
      borderRadius: 10,
      borderLeftWidth: 4,
      borderLeftColor: colors.info,
      shadowColor: colors.info,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    guideIconContainer: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.info + "20",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 10,
      marginTop: -1, // 텍스트와 수직 정렬
    },
    guideMessage: {
      flex: 1,
      fontSize: 13,
      color: isDark ? colors.info + "E6" : colors.info, // 다크모드에서 살짝 투명도
      lineHeight: 18,
      fontWeight: "500",
    },
    scrollContent: {
      flex: 1,
    },
    scrollContentContainer: {
      paddingHorizontal: 20,
      paddingBottom: 40, // 하단 여유 공간
      flexGrow: 1,
    },
    section: {
      marginTop: 25,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text.primary,
      marginBottom: 12,
    },
    subSectionTitle: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.text.secondary,
      marginTop: 15,
      marginBottom: 10,
    },
    optionGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
    },
    selectButton: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    selectButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    selectButtonText: {
      fontSize: 14,
      color: colors.text.secondary,
    },
    selectButtonTextActive: {
      color: colors.white,
      fontWeight: "500",
    },
    interestGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    interestChip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 16,
      backgroundColor: colors.border,
    },
    interestChipActive: {
      backgroundColor: colors.accentLight || colors.primary + "20",
    },
    interestChipText: {
      fontSize: 13,
      color: colors.text.secondary,
    },
    interestChipTextActive: {
      color: colors.primary,
      fontWeight: "500",
    },
    textInput: {
      marginTop: 12,
      paddingHorizontal: 15,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      fontSize: 14,
      color: colors.text.primary,
      backgroundColor: colors.surface,
    },
    saveButton: {
      marginTop: 30,
      marginBottom: 30,
      marginHorizontal: 0,
    },
    saveButtonGradient: {
      paddingVertical: 15,
      borderRadius: 25,
      alignItems: "center",
    },
    saveButtonText: {
      color: colors.white,
      fontSize: 16,
      fontWeight: "600",
    },
  });

export default ProfileDetailModal;

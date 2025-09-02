// 개인화된 AI 서비스 - 세부 프로필 기반
import { DetailedUserProfile, getToneByProfile } from "../../types/userProfile";

export interface PersonalizedPromptConfig {
  userProfile: DetailedUserProfile;
  content: string;
  platform: string;
  imageContext?: string; // 이미지 컨텍스트 (예: 'baby_photo', 'food', 'travel')
  occasion?: string;
}

export class EnhancedAIService {
  // 프로필 기반 상세 프롬프트 생성
  generatePersonalizedPrompt(config: PersonalizedPromptConfig): string {
    const { userProfile, content, platform, imageContext } = config;

    // 기본 페르소나 설정
    const persona = this.buildPersona(userProfile, imageContext);

    // 톤 설정
    const tone = getToneByProfile(userProfile, imageContext);

    // 글쓰기 스타일 적용
    const styleGuide = this.getStyleGuide(userProfile);

    // 관심사 기반 해시태그 추천
    const hashtagStrategy = this.getHashtagStrategy(userProfile, platform);

    return `
당신의 페르소나:
${persona}

글쓰기 톤: ${tone}

${styleGuide}

주제: ${content}
${imageContext ? `이미지 컨텍스트: ${imageContext}` : ""}

작성 지침:
1. 위 페르소나와 톤을 일관되게 유지하세요
2. 실제 ${this.getAgeGroupDescription(
      userProfile.ageGroup
    )} ${this.getGenderDescription(
      userProfile.gender
    )}이(가) 쓴 것처럼 자연스럽게
3. ${this.getFamilyContextPrompt(userProfile, imageContext)}
4. ${this.getOccupationContextPrompt(userProfile)}
5. 관심사 반영: ${userProfile.interests?.join(", ") || "일반적인 주제"}

${hashtagStrategy}

특별 지침:
${this.getSpecialInstructions(userProfile, imageContext)}
`;
  }

  // 페르소나 구축
  private buildPersona(
    profile: DetailedUserProfile,
    imageContext?: string
  ): string {
    const age = this.getAgeGroupDescription(profile.ageGroup);
    const gender = this.getGenderDescription(profile.gender);
    const family = this.getFamilyDescription(profile);
    const occupation = this.getOccupationDescription(profile);

    let persona = `당신은 ${age} ${gender}입니다.`;

    if (family) {
      persona += ` ${family}`;
    }

    if (occupation) {
      persona += ` 직업은 ${occupation}입니다.`;
    }

    if (profile.interests && profile.interests.length > 0) {
      persona += ` 주요 관심사는 ${profile.interests
        .slice(0, 3)
        .join(", ")} 등입니다.`;
    }

    // 특별한 컨텍스트 추가
    if (imageContext === "baby_photo" && profile.parentType) {
      persona += ` 아이를 사랑하는 ${
        profile.parentType === "mother" ? "엄마" : "아빠"
      }의 마음으로 글을 씁니다.`;
    } else if (
      imageContext === "baby_photo" &&
      profile.familyRole === "grandparent"
    ) {
      persona += " 손주를 사랑하는 조부모의 따뜻한 시선으로 글을 씁니다.";
    }

    return persona;
  }

  // 스타일 가이드 생성
  private getStyleGuide(profile: DetailedUserProfile): string {
    const style = profile.writingStyle;
    if (!style) {
      return "자연스럽고 진솔한 스타일로 작성하세요.";
    }

    const guides = [];

    // 격식
    if (style.formality === "casual") {
      guides.push("친구와 대화하듯 편안하게");
    } else if (style.formality === "formal") {
      guides.push("정중하고 격식 있게");
    } else {
      guides.push("적당히 친근하면서도 예의 바르게");
    }

    // 감정 표현
    if (style.emotiveness === "high") {
      guides.push("감정을 풍부하게 표현하며");
    } else if (style.emotiveness === "low") {
      guides.push("감정을 절제하여 담담하게");
    } else {
      guides.push("적절한 감정 표현으로");
    }

    // 유머
    if (style.humor === "witty") {
      guides.push("재치있는 표현을 섞어서");
    } else if (style.humor === "light") {
      guides.push("가벼운 유머를 곁들여");
    }

    // 길이
    if (style.length === "brief") {
      guides.push("간결하고 핵심적으로");
    } else if (style.length === "detailed") {
      guides.push("상세하고 구체적으로");
    }

    return `글쓰기 스타일: ${guides.join(", ")} 작성하세요.`;
  }

  // 연령대 설명
  private getAgeGroupDescription(ageGroup?: string): string {
    const descriptions: Record<string, string> = {
      "10s": "10대",
      "20s": "20대",
      "30s": "30대",
      "40s": "40대",
      "50s": "50대",
      "60s+": "60대 이상",
    };
    return descriptions[ageGroup || ""] || "30-40대";
  }

  // 성별 설명
  private getGenderDescription(gender?: string): string {
    const descriptions: Record<string, string> = {
      male: "남성",
      female: "여성",
      other: "사람",
      prefer_not_to_say: "사람",
    };
    return descriptions[gender || ""] || "사람";
  }

  // 가족 관계 설명
  private getFamilyDescription(profile: DetailedUserProfile): string {
    if (!profile.familyRole) {
      return "";
    }

    const descriptions: Record<string, string> = {
      single: "미혼입니다.",
      married: "기혼입니다.",
      parent: profile.parentType === "mother" ? "엄마입니다." : "아빠입니다.",
      grandparent: "조부모입니다.",
    };

    let desc = descriptions[profile.familyRole] || "";

    if (profile.familyRole === "parent" && profile.childrenAge) {
      const childAge: Record<string, string> = {
        baby: "영아",
        toddler: "유아",
        elementary: "초등학생",
        middle_school: "중학생",
        high_school: "고등학생",
        adult: "성인",
      };
      desc += ` ${childAge[profile.childrenAge]} 자녀가 있습니다.`;
    }

    return desc;
  }

  // 직업 설명
  private getOccupationDescription(profile: DetailedUserProfile): string {
    if (!profile.occupation) {
      return "";
    }

    if (profile.occupationDetail) {
      return profile.occupationDetail;
    }

    const descriptions: Record<string, string> = {
      student: "학생",
      office_worker: "직장인",
      business_owner: "사업가",
      freelancer: "프리랜서",
      homemaker: "주부",
      retired: "은퇴자",
    };

    return descriptions[profile.occupation] || "";
  }

  // 가족 컨텍스트 프롬프트
  private getFamilyContextPrompt(
    profile: DetailedUserProfile,
    imageContext?: string
  ): string {
    if (imageContext === "baby_photo") {
      if (profile.parentType === "mother") {
        return "엄마의 사랑과 자부심이 느껴지도록 표현하세요";
      } else if (profile.parentType === "father") {
        return "아빠의 든든함과 애정이 담기도록 표현하세요";
      } else if (profile.familyRole === "grandparent") {
        return "손주를 향한 무한한 사랑과 자랑스러움을 표현하세요";
      } else if (profile.ageGroup === "20s" || profile.ageGroup === "30s") {
        return "아기의 귀여움에 감탄하는 마음을 표현하세요";
      }
    }

    return "자연스럽게 개인적인 경험과 감정을 담아 표현하세요";
  }

  // 직업 컨텍스트 프롬프트
  private getOccupationContextPrompt(profile: DetailedUserProfile): string {
    if (profile.occupation === "business_owner") {
      return "사업가다운 긍정적이고 진취적인 태도를 보여주세요";
    } else if (profile.occupation === "office_worker") {
      return "일상의 소소한 행복과 워라밸을 중시하는 모습을 보여주세요";
    } else if (profile.occupation === "homemaker") {
      return "가정과 일상의 따뜻함을 담아 표현하세요";
    } else if (profile.occupation === "student") {
      return "젊고 활기찬 에너지를 담아 표현하세요";
    }

    return "직업적 특성을 자연스럽게 반영하세요";
  }

  // 해시태그 전략
  private getHashtagStrategy(
    profile: DetailedUserProfile,
    platform: string
  ): string {
    const hashtags: string[] = [];

    // 연령대별 해시태그
    if (profile.ageGroup) {
      const ageHashtags: Record<string, string[]> = {
        "10s": ["10대일상", "학생스타그램", "청춘"],
        "20s": ["20대일상", "청춘스타그램", "MZ"],
        "30s": ["30대일상", "워라밸", "소확행"],
        "40s": ["40대일상", "중년의품격", "인생2막"],
        "50s": ["50대일상", "오늘도화이팅", "인생은지금부터"],
        "60s+": ["60대일상", "액티브시니어", "제2의인생"],
      };
      hashtags.push(...(ageHashtags[profile.ageGroup] || []));
    }

    // 가족 관련 해시태그
    if (profile.parentType) {
      hashtags.push(
        profile.parentType === "mother" ? "엄마스타그램" : "아빠스타그램"
      );
      if (profile.childrenAge === "baby") {
        hashtags.push("육아스타그램", "아기스타그램");
      }
    }

    // 관심사 해시태그
    if (profile.interests) {
      hashtags.push(...profile.interests.slice(0, 3).map((i) => `#${i}`));
    }

    return `추천 해시태그: ${hashtags.join(
      " "
    )} (플랫폼과 상황에 맞게 5-7개 선택)`;
  }

  // 특별 지침
  private getSpecialInstructions(
    profile: DetailedUserProfile,
    imageContext?: string
  ): string {
    const instructions: string[] = [];

    // 연령대별 특별 지침
    if (profile.ageGroup === "10s" || profile.ageGroup === "20s") {
      instructions.push(
        "이모지와 ㅋㅋㅋ, ㅠㅠ 같은 표현을 자연스럽게 사용하세요"
      );
    } else if (profile.ageGroup === "50s" || profile.ageGroup === "60s+") {
      instructions.push("이모지는 적당히, 진솔하고 따뜻한 표현을 사용하세요");
    }

    // 성별 특별 지침
    if (
      profile.gender === "female" &&
      (profile.ageGroup === "20s" || profile.ageGroup === "30s")
    ) {
      instructions.push("감성적이고 공감가는 표현을 활용하세요");
    }

    // 컨텍스트별 특별 지침
    if (imageContext === "food") {
      instructions.push("맛과 분위기를 생생하게 전달하세요");
    } else if (imageContext === "travel") {
      instructions.push("여행의 설렘과 추억을 담아 표현하세요");
    }

    return instructions.join("\n");
  }

  // 이미지 컨텍스트 자동 감지 (향후 구현)
  detectImageContext(imageDescription: string): string {
    // 키워드 기반 간단한 감지
    if (
      imageDescription.includes("아기") ||
      imageDescription.includes("baby")
    ) {
      return "baby_photo";
    } else if (
      imageDescription.includes("음식") ||
      imageDescription.includes("food")
    ) {
      return "food";
    } else if (
      imageDescription.includes("여행") ||
      imageDescription.includes("travel")
    ) {
      return "travel";
    } else if (
      imageDescription.includes("카페") ||
      imageDescription.includes("coffee")
    ) {
      return "cafe";
    }

    return "general";
  }
}

export const enhancedAI = new EnhancedAIService();

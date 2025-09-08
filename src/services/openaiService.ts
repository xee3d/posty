// OpenAI API를 직접 사용하는 서비스
// GPT-4o-mini 모델 사용 - Phase 1 심플 버전

// 환경변수에서 API 키 가져오기
// @ts-ignore
import { OPENAI_API_KEY } from "@env";

// API 키가 없을 경우 기본값
const API_KEY = OPENAI_API_KEY || "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";

interface GenerateContentParams {
  prompt: string;
  tone:
    | "casual"
    | "professional"
    | "humorous"
    | "emotional"
    | "genz"
    | "millennial"
    | "minimalist"
    | "storytelling"
    | "motivational";
  length: "short" | "medium" | "long";
  platform?: "instagram" | "facebook" | "twitter" | "linkedin" | "blog";
  hashtags?: string[];
}

interface PolishContentParams {
  text: string;
  tone:
    | "casual"
    | "professional"
    | "humorous"
    | "emotional"
    | "genz"
    | "millennial"
    | "minimalist"
    | "storytelling"
    | "motivational";
  length: "short" | "medium" | "long";
  platform?: "instagram" | "facebook" | "twitter" | "linkedin" | "blog";
  polishType?:
    | "spelling"
    | "refine"
    | "improve"
    | "formal"
    | "simple"
    | "engaging";
}

interface AnalyzeImageParams {
  imageUrl: string;
}

class OpenAIService {
  private apiKey: string;
  private baseUrl = "https://api.openai.com/v1";
  private model = "gpt-4o-mini"; // GPT-4o-mini 사용

  constructor() {
    this.apiKey = API_KEY;

    // 디버깅을 위한 로그 추가
    console.log(
      "ENV OPENAI_API_KEY:",
      OPENAI_API_KEY ? `${OPENAI_API_KEY.substring(0, 10)}...` : "undefined"
    );
    console.log(
      "API_KEY variable:",
      API_KEY ? `${API_KEY.substring(0, 10)}...` : "undefined"
    );

    if (!API_KEY || API_KEY.includes("YOUR_OPENAI_API_KEY_HERE")) {
      console.warn("⚠️ OpenAI API key not configured!");
      console.warn("Please add OPENAI_API_KEY to your .env file");
      console.warn(
        "Get your API key from: https://platform.openai.com/api-keys"
      );
    }
    console.log("OpenAI Service initialized with GPT-4o-mini");
  }

  // 텍스트 생성
  async generateContent(params: GenerateContentParams) {
    // Phase 1: 간단한 개선만 적용
    // 프롬프트 유효성 검사
    if (!params.prompt || params.prompt.trim().length === 0) {
      throw new Error("프롬프트가 비어있습니다");
    }

    const enhancedSystemPrompt = this.createEnhancedSystemPrompt(
      params.tone,
      params.platform
    );
    const userPrompt = this.createUserPrompt(params);

    console.log("Generating content with OpenAI:", {
      model: this.model,
      tone: params.tone,
      length: params.length,
      prompt: params.prompt,
      promptLength: params.prompt.length,
    });

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: "system", content: enhancedSystemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: this.getTemperature(params.tone),
          max_tokens: this.getMaxTokens(params.length, params.platform),
          presence_penalty: 0.3, // 다양성 증가
          frequency_penalty: 0.3, // 반복 감소
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("OpenAI API Error:", response.status, errorText);
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      console.log("OpenAI response received");

      let content = data.choices[0].message.content;

      // 콘텐츠 정리
      content = content.replace(/^"|"/g, "");
      content = content.replace(/\\n/g, "\n");
      content = content.trim();

      // 불필요한 텍스트 제거 및 플랫폼별 최적화
      content = this.cleanAndOptimizeContent(
        content,
        params.platform,
        params.tone
      );

      // Phase 1: 콘텐츠 자연스럽게 만들기 (간단한 버전)
      content = this.makeContentNatural(content);

      // 해시태그 추출
      const hashtags = this.extractHashtags(content, params.platform);

      return {
        content: content.replace(/#\S+/g, "").trim(),
        hashtags,
        platform: params.platform || "instagram",
      };
    } catch (error) {
      console.error("OpenAI Generation Error:", error);
      throw error;
    }
  }

  // Phase 1: 향상된 시스템 프롬프트
  private createEnhancedSystemPrompt(tone: string, platform?: string): string {
    const basePrompt = this.createSystemPrompt(tone, platform);

    // 간단한 개선사항 추가
    const enhancement = `

추가 지침:
- 진짜 사람이 쓴 것처럼 자연스럽게 작성하세요
- 완벽한 문법보다는 편안한 대화체를 사용하세요
- 과도한 마케팅 문구는 피하세요
- 따뜻하고 진솔한 느낌을 담아주세요`;

    return basePrompt + enhancement;
  }

  // 콘텐츠 정리 및 플랫폼별 최적화 - 통합 메서드
  private cleanAndOptimizeContent(
    content: string,
    platform?: string,
    tone?: string
  ): string {
    // 1. 기본 정리
    const lines = content.split("\n");
    const cleanedLines = lines.filter((line, index) => {
      const trimmedLine = line.trim();
      const isLastLine =
        index === lines.length - 1 || index === lines.length - 2;

      // 마지막 두 줄에서 모든 질문형 제거
      if (isLastLine && trimmedLine.includes("?")) {
        return false;
      }

      // 참여 유도 패턴 제거
      const engagementPatterns = [
        "여러분은",
        "여러분들",
        "어떻게",
        "어떤",
        "무엇",
        "공유해",
        "저장하고",
        "댓글로",
        "알려주세요",
        "맞팔",
        "소통해요",
        "따라와",
        "팔로우",
        "비슷한",
        "같은 경험",
        "나만 그런가",
      ];

      if (engagementPatterns.some((pattern) => trimmedLine.includes(pattern))) {
        return false;
      }

      return trimmedLine.length > 2 && !trimmedLine.match(/^[가-힣]{2,4}$/);
    });
    content = cleanedLines.join("\n").trim();

    // 2. 질문형 마무리 강력하게 제거
    const questionPatterns = [
      "?",
      "여러분은",
      "여러분들은",
      "어떻게",
      "어떤",
      "무엇",
      "언제",
      "어디",
      "누가",
      "왜",
      "얼마나",
      "어떠신가요",
      "있으신가요",
      "계신가요",
      "하시나요",
    ];
    const contentLines = content.split("\n").filter((line) => line.trim());
    let needsNewEnding = false;

    // 마지막 두 줄 검사
    for (
      let i = contentLines.length - 1;
      i >= Math.max(0, contentLines.length - 2);
      i--
    ) {
      const line = contentLines[i];
      if (questionPatterns.some((pattern) => line.includes(pattern))) {
        contentLines.splice(i, 1);
        needsNewEnding = true;
      }
    }

    content = contentLines.join("\n");

    // 3. 플랫폼별 대체 마무리 추가 - 특히 페이스북은 무조건 추가
    if (needsNewEnding || platform === "facebook") {
      const alternativeEndings = {
        instagram: [
          "오늘 하루도 감사해요 😊",
          "이런 순간들이 모여 행복한 하루가 되네요",
          "지금 이 순간을 기억하고 싶어요",
        ],
        facebook: [
          "이런 경험들이 쌓여서 성장하는 것 같네요",
          "오늘도 의미 있는 하루였습니다",
          "매일 조금씩 나아지고 있어요",
          "이런 일상이 쌓여 행복이 되는 것 같아요",
          "오늘 하루도 감사한 마음으로 마무리합니다",
          "작은 순간들이 모여 큰 추억이 되네요",
          "이런 경험을 나눌 수 있어 행복합니다",
          "오늘의 소중한 기록을 남깁니다",
        ],
        twitter: ["오늘도 수고했다", "이런 게 삶이다", "하루를 마무리한다"],
        linkedin: [
          "지속적인 성장이 핵심입니다",
          "매일의 작은 성장이 큰 변화를 만듭니다",
          "조금씩 성장하고 있습니다",
        ],
      };

      const selectedPlatform = platform || "instagram";
      const endings =
        alternativeEndings[selectedPlatform] || alternativeEndings.instagram;
      const randomEnding = endings[Math.floor(Math.random() * endings.length)];

      // 인스타그램은 줄바꿈 후 추가, 다른 플랫폼은 공백 후 추가
      if (selectedPlatform === "instagram") {
        content = content.trim() + "\n\n" + randomEnding;
      } else {
        content = content.trim() + " " + randomEnding;
      }
    }

    return content;
  }

  // Phase 1: 콘텐츠 자연스럽게 만들기 (오타 제거)
  private makeContentNatural(content: string): string {
    // 자연스러운 줄임말만 사용 (오타는 제거)
    const naturalReplacements = [
      { from: "그런데", to: "근데" },
      { from: "그리고", to: "그리고" },
      { from: "그래서", to: "그래서" },
      { from: "하지만", to: "하지만" },
      { from: "왜냐하면", to: "왜냐면" },
    ];

    // 20% 확률로 자연스러운 줄임말 적용
    if (Math.random() < 0.2) {
      const replacement =
        naturalReplacements[
          Math.floor(Math.random() * naturalReplacements.length)
        ];
      content = content.replace(replacement.from, replacement.to);
    }

    return content;
  }

  // 문장 정리/교정
  async polishContent(params: PolishContentParams) {
    const polishGuides = {
      spelling: {
        name: "맞춤법 교정",
        instruction:
          "맞춤법과 문법 오류만 수정하고, 원문의 느낌은 그대로 유지해주세요.",
      },
      refine: {
        name: "문장 다듬기",
        instruction:
          "어색한 표현을 자연스럽게 다듬고, 문장의 흐름을 매끄럽게 만들어주세요.",
      },
      improve: {
        name: "표현 개선",
        instruction:
          "더 세련되고 인상적인 표현으로 바꿔주되, 원래 의미는 유지해주세요.",
      },
      formal: {
        name: "격식체 변환",
        instruction:
          "비즈니스나 공식적인 상황에 적합한 정중하고 격식 있는 문체로 변환해주세요. 존댓말을 사용하고 전문적인 어휘를 활용하세요.",
      },
      simple: {
        name: "쉽게 풀어쓰기",
        instruction:
          "누구나 이해하기 쉽도록 간단한 단어와 짧은 문장으로 바꿔주세요. 전문용어는 쉼운 말로 풀어서 설명해주세요.",
      },
      engaging: {
        name: "매력적으로 만들기",
        instruction:
          "독자의 관심을 끌 수 있도록 흥미롭고 생동감 있게 만들어주세요. 감정을 자극하는 표현과 생생한 묘사를 추가하세요.",
      },
    };

    const guide = polishGuides[params.polishType || "refine"];

    const systemPrompt = `당신은 한국어 문장 교정 전문가입니다. 
${guide.name} 작업을 수행해주세요.

지침: ${guide.instruction}

추가 규칙:
1. 원문의 핵심 메시지는 반드시 유지합니다
2. SNS에 적합한 표현으로 다듬어주세요
3. 적절한 줄바꿈과 구두점을 추가합니다
4. 해시태그가 있다면 유지하되, 더 나은 해시태그로 교체할 수 있습니다`;

    const toneGuides = {
      casual: "친근하고 편안한 느낌을 유지하며",
      professional: "전문적이고 신뢰감 있는 톤으로",
      humorous: "재미있고 가볍게 유머를 살려서",
      emotional: "따뜻하고 감성적인 느낌으로",
    };

    const lengthGuides = {
      short: "50자 이내로 간결하게",
      medium: "100-150자로",
      long: "200-300자로",
    };

    const userPrompt = `다음 글을 ${toneGuides[params.tone]} ${
      lengthGuides[params.length]
    } 다듬어주세요:\n\n${
      params.text
    }\n\n수정된 글과 함께 어울리는 해시태그 5-7개를 추가해주세요.`;

    console.log("Polishing content with OpenAI:", {
      tone: params.tone,
      length: params.length,
    });

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.5,
          max_tokens: this.getMaxTokens(params.length),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("OpenAI API Error:", response.status, errorText);
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      console.log("OpenAI polish response received");

      let content = data.choices[0].message.content;
      content = content.replace(/^\"|\"/g, "").trim();

      // 해시태그 추출
      const hashtags = this.extractHashtags(content);

      return {
        content: content.replace(/#\S+/g, "").trim(),
        hashtags,
        platform: "instagram",
      };
    } catch (error) {
      console.error("OpenAI Polish Error:", error);
      throw error;
    }
  }

  // 이미지 분석 (GPT-4o-mini의 vision 기능 사용)
  async analyzeImage(params: AnalyzeImageParams) {
    console.log("Analyzing image with OpenAI Vision");

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: "system",
              content: `당신은 이미지 분석 전문가입니다. 사용자가 보낸 이미지를 분석하고 설명해주세요.

응답 형식:
1. 첫 번째 줄: 이미지에 대한 구체적인 설명 (무엇이 보이는지, 어떤 상황인지)
2. 두 번째 줄: 빈 줄
3. 세 번째 줄부터: 이 이미지에 어울리는 SNS 게시글 3개 추천 (각각 새로운 줄로)

주의사항:
- 이미지 설명은 객관적이고 구체적으로
- 추천 게시글은 50-100자 내외
- 이모지 적절히 사용
- 해시태그는 포함하지 마세요`,
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "이 이미지를 분석하고, 어울리는 SNS 게시글 3개를 추천해주세요.",
                },
                {
                  type: "image_url",
                  image_url: {
                    url: params.imageUrl,
                  },
                },
              ],
            },
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("OpenAI Vision API Error:", response.status, errorText);
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Image analysis response received");

      const content = data.choices[0].message.content;
      console.log("Raw vision response:", content);

      // 응답 파싱
      const lines = content.split("\n").filter((line) => line.trim());
      let description = "";
      const suggestedContent = [];

      // 첫 번째 줄은 이미지 설명
      if (lines.length > 0) {
        description = lines[0].trim();
        console.log("Image description:", description);
      }

      // 나머지 줄들은 추천 콘텐츠 (빈 줄 이후)
      let foundEmptyLine = false;
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();

        // 빈 줄을 찾으면 그 다음부터 추천 콘텐츠
        if (!foundEmptyLine && line === "") {
          foundEmptyLine = true;
          continue;
        }

        if (foundEmptyLine && line.length > 10) {
          // 번호나 불리트 제거
          const cleanedLine = line
            .replace(/^[1-3][\.)\:]\s*|^[-•]\s*/, "")
            .trim();
          if (cleanedLine) {
            suggestedContent.push(cleanedLine);
          }
        }
      }

      // 만약 빈 줄을 찾지 못했다면, 두 번째 줄부터 추천 콘텐츠로 간주
      if (!foundEmptyLine && lines.length > 1) {
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line.length > 10) {
            const cleanedLine = line
              .replace(/^[1-3][\.)\:]\s*|^[-•]\s*/, "")
              .trim();
            if (cleanedLine) {
              suggestedContent.push(cleanedLine);
            }
          }
        }
      }

      // 최소 3개의 추천 콘텐츠 보장
      if (suggestedContent.length < 3) {
        suggestedContent.push(
          "오늘도 특별한 순간을 기록해요 ✨",
          "일상 속 작은 행복을 발견했어요 🌟",
          "이 순간이 영원히 기억되길 바라며 📸"
        );
      }

      return {
        description: description || "아름다운 순간이 담긴 사진이네요",
        objects: this.extractObjects(description),
        mood: this.detectMood(description),
        suggestedContent: suggestedContent.slice(0, 3),
      };
    } catch (error) {
      console.error("Image analysis failed:", error);
      // 폴백 응답
      return {
        description: "아름다운 순간이 담긴 사진이네요",
        objects: ["사진", "순간", "일상"],
        mood: "positive",
        suggestedContent: [
          "오늘의 특별한 순간을 기록합니다 📸",
          "평범한 일상 속 특별함을 발견했어요 ✨",
          "이런 순간들이 모여 행복이 되는 것 같아요 💕",
        ],
      };
    }
  }

  // 프롬프트 생성 헬퍼 함수들
  private createSystemPrompt(tone: string, platform?: string): string {
    const toneGuides = {
      casual: `친근하고 편안한 일상 대화체로 작성하세요.
특징:
- 친구와 대화하듯 자연스럽게
- 부담 없는 톤
- 적당한 이모지 (1-2개)
- 일상적인 단어 사용
베리에이션:
- "오늘 너무 피곤해서 그냥 침대에 눕굴눕굴"
- "야, 이거 진짜 맛있더라! 다음에 같이 가자"
- "하... 오늘도 어쩌다 보니 이 시간이네"`,

      professional: `전문적이고 신뢰감 있는 톤으로 작성하세요.
특징:
- 체계적이고 논리적인 구성
- 전문 용어 적절히 사용
- 객관적 사실과 분석
- 최소한의 이모지
베리에이션:
- "최근 업계 동향을 분석한 결과..."
- "효율적인 업무 프로세스를 위해서는..."
- "데이터 기반의 의사결정이 중요한 이유..."`,

      humorous: `재미있고 가볍게 작성하세요.
특징:
- 일상의 아이러니 포착
- 과장된 표현 활용
- 자조적 유머
- 번뜩 반전 활용
베리에이션:
- "다이어트는 내일부터... (매년 하는 말)"
- "나: 일찍 자야지 / 새벽 3시의 나: 유튜브"
- "성인이 되면 돈을 많이 벌 줄 알았다. 현실: 커피값도 아깝다"`,

      emotional: `따뜻하고 감성적인 톤으로 작성하세요.
특징:
- 진심이 담긴 표현
- 공감대 형성
- 따뜻한 어투
- 감성적 단어 선택
베리에이션:
- "누군가의 작은 배려가 하루를 특별하게 만들어요"
- "가끔은 멈춰 서서 주변을 돌아보는 여유가 필요해요"
- "소중한 사람들과 함께하는 순간이 가장 행복해요"`,
      genz: `20대 초반 GenZ 스타일로 작성하세요.
특징:
- ㅋㅋㅋ, ㅠㅠ 같은 자음 반복 자주 사용
- "~각", "찐", "레전드", "실화" 같은 신조어 사용
- 문장 끝을 늘여서 표현 (그래서~~~)
- 이모지보다 ㅎㅎ ㅋㅋ 선호
- 소문자만 사용하기도 함
예시: "아 진짜 오늘 카페 분위기 미쳤다ㅋㅋㅋㅋ 라떼아트 실화냐고"`,
      millennial: `30대 밀레니얼 스타일로 작성하세요.
특징:
- "소확행", "워라밸", "힐링" 같은 표현 사용
- 적절한 이모지 활용 (1-2개)
- ~했다, ~네요 같은 완성형 문장
- 일상의 작은 행복 강조
예시: "오늘의 소확행 ☕ 향긋한 커피 한 잔에 하루의 피로가 녹네요"`,
      minimalist: `미니멀리스트 스타일로 작성하세요.
특징:
- 매우 짧고 간결한 문장
- 핵심만 전달
- 과도한 수식어 배제
- 여백의 미 활용
- 마침표 사용
예시: "커피. 일요일. 충분하다."`,
    };

    const platformGuides = {
      instagram: `인스타그램 게시글처럼 시각적 경험을 공유하는 느낌으로
특징:
- 감성적이고 개인적인 이야기
- 짧은 문단으로 구성 (줄바꿈 활용)
- 적절한 이모지 사용 (3-5개)
- 해시태그 8-15개 (본문 끝에)
- 다양한 종결 스타일 사용

종결 스타일 예시:
1. 공감 유도: "이런 날은 정말 소중한 것 같아요 💕"
2. 선언적 종결: "오늘도 나답게, 내 속도대로."
3. 시적 표현: "커피향에 물든 오후, 그저 좋다."
4. 호기심 유발: "내일은 또 어떤 일이 펼쳐질까..."
5. 감탄사 활용: "아, 이런 게 행복이구나!"
6. 미완성 문장: "이 순간이 영원했으면..."
7. 격언 인용: "일상이 곧 예술이다 - 오늘의 깨달음"

구조 베리에이션:
- 한 문장으로 강렬하게
- 짧은 문장들의 나열
- 감성적인 긴 문장
- 대화체로 독백하듯이`,

      facebook: `페이스북 게시글처럼 이야기를 들려주는 느낌으로
특징:
- 상세한 스토리텔링
- 정보성 컨텐츠 포함
- 분명한 단락 구분
- 적당한 이모지 (1-3개)
- 해시태그 2-5개
- 다양한 참여 유도 방식

종결 스타일 예시:
1. 정보 공유: "혹시 도움이 되실 분들을 위해 공유합니다."
2. 개인 소감: "이런 경험들이 쌓여서 성장하는 것 같네요."
3. 조언 제공: "비슷한 상황이시라면 한번 시도해보세요!"
4. 감사 표현: "이런 순간을 함께 나눌 수 있어 감사합니다."
5. 미래 계획: "다음엔 더 재밌는 이야기로 찾아올게요."
6. 교훈 정리: "결국 중요한 건 꾸준함이더라구요."
7. 열린 결말: "각자의 방법이 있겠지만, 전 이렇게 해봤어요."

스토리텔링 패턴:
- 시간순 나열
- 문제-해결 구조
- 비포-애프터
- 인과관계 설명
- 에피소드 중심`,

      twitter: `X(트위터) 게시글처럼 간결하고 임팩트 있게
특징:
- 매우 짧고 간결한 문장 (280자 제한 엄수)
- 핵심만 집약적으로 전달
- 줄바꿈 없이 한 호흡으로
- 위트나 통찰력 포함
- 최소한의 이모지 (0-2개)
- 해시태그 1-3개만 (본문에 자연스럽게 포함)
- RT 가능한 콘텐츠

스타일 베리에이션:
1. 위트형: "회사에서 커피가 떨어졌다. 생산성도 함께 떨어졌다."
2. 통찰형: "어른이 된다는 건 작은 것에 감사할 줄 아는 것."
3. 공감형: "월요일 아침 지하철. 우리 모두 수고했다."
4. 선언형: "오늘부터 나는 일찍 자는 사람."
5. 반전형: "다이어트 3일차. 치킨이 나를 부른다."
6. 관찰형: "비 오는 날 카페는 왜 이리 낭만적일까."
7. 자조형: "성인이 되면 돈 많이 벌 줄 알았는데."

트렌드 반영:
- 밈(meme) 활용
- 시사 이슈 언급
- 일상 공감대
- 세대 특성 반영`,

      linkedin: `링크드인 게시글처럼 전문적이고 비즈니스적으로
특징:
- 전문적 인사이트 공유
- 업계 경험담이나 교훈
- 체계적인 구성 (서론-본론-결론)
- 최소한의 이모지 사용
- 해시태그 3-5개 (전문 용어 위주)
- 다양한 네트워킹 방식

종결 스타일 예시:
1. 인사이트 정리: "리더십은 결국 사람에 대한 이해에서 시작됩니다."
2. 행동 촉구: "작은 변화부터 시작해보시길 권합니다."
3. 미래 전망: "앞으로 이 분야는 더욱 중요해질 것입니다."
4. 겸손한 마무리: "아직 배울 게 많지만, 조금씩 성장하고 있습니다."
5. 감사 표현: "좋은 팀을 만나 함께 성장할 수 있어 감사합니다."
6. 열린 토론: "다양한 관점을 듣고 싶습니다. 의견을 나눠주세요."
7. 격려 메시지: "모두가 각자의 속도로 성장하고 있습니다."

콘텐츠 유형:
- 성공/실패 사례
- 업계 트렌드 분석
- 커리어 조언
- 팀 문화 이야기
- 개인 성장 스토리`,

      blog: `블로그 포스트처럼 깊이 있고 체계적으로
특징:
- 서론-본론-결론의 명확한 구조
- 충분한 설명과 예시
- 소제목 활용 가능
- 정보성과 개인 의견의 균형
- 해시태그는 SEO 고려하여 선택
예시 구조:
[흥미로운 도입부]

[주제에 대한 상세한 설명]

[개인적 경험이나 사례]

[마무리와 독자에게 던지는 메시지]`,
    };

    return `당신은 한국인 SNS 인플루언서입니다. 주어진 주제로 자연스러운 SNS 게시글을 작성해주세요.

톤: ${toneGuides[tone]}
플랫폼: ${platform ? platformGuides[platform] : "일반적인 SNS"}

작성 규칙:
1. 한국어로 자연스럽게 작성하세요
2. 적절한 줄바꿈으로 가독성을 높이세요
3. 해시태그는 글 끝에 반드시 포함하세요:
   - Instagram: 10-15개 (예: #일상 #데일리 #소통 등)
   - Facebook: 3-5개
   - Twitter: 1-3개
   - LinkedIn: 3-5개
4. 이모지는 톤과 플랫폼에 맞게 사용하세요
5. 실제 사람이 쓴 것처럼 자연스럽게 작성하세요
6. 매번 다른 문장 구조와 종결 스타일을 사용하세요
7. 질문으로 끝나는 획일적인 패턴을 피하세요
8. 특히 페이스북에서는 절대 질문형으로 끝내지 마세요. 반드시 긍정적이고 선언적인 마무리를 사용하세요.
9. 페이스북 게시글은 "이런 경험을 나눌 수 있어 감사합니다", "오늘도 의미 있는 하루였습니다" 같은 감사나 성찰로 끝내세요.

다양성 규칙:
- 문장 길이를 변화있게 구성하세요 (짧은 문장과 긴 문장 조합)
- 시작 방식을 다양하게 하세요 (감탄사, 시간 표현, 직접 주제 진입 등)
- 리듬감 있는 글쓰기를 위해 문장 구조를 변화시키세요
- 플랫폼별 특성에 맞는 고유한 표현을 사용하세요`;
  }

  private createUserPrompt(params: GenerateContentParams): string {
    // 프롬프트 검증
    if (!params.prompt || params.prompt.trim().length === 0) {
      console.warn("Empty prompt received, using default");
      params.prompt = "오늘 하루 일상";
    }

    console.log("Creating user prompt with:", {
      prompt: params.prompt,
      tone: params.tone,
      length: params.length,
      platform: params.platform,
    });

    const lengthGuides = {
      short: "50자 이내로",
      medium: "100-150자로",
      long: "200-300자로",
    };

    // 플랫폼별 종결 스타일 예시 - 매번 다른 스타일 선택
    const randomIndex = Math.floor(Math.random() * 10);

    const endingStyles = {
      instagram: [
        '감성적 공감 유도로 끝내세요 ("이런 순간들이 모여 행복이 되는 것 같아요 💕")',
        '시적 표현으로 마무리하세요 ("커피향에 물든 오후, 그저 좋다.")',
        '미완성 문장으로 여운을 남기세요 ("이 순간이 영원했으면...")',
        '선언적 태도로 마무리하세요 ("오늘도 나답게, 내 속도대로.")',
        '호기심을 유발하는 말로 끝내세요 ("내일은 또 어떤 일이 펼쳐질까...")',
        '감탄사로 마무리하세요 ("아, 이런 게 행복이구나!")',
        '격언이나 인용구로 끝내세요 ("일상이 곧 예술이다 - 오늘의 깨달음")',
        '감사의 마음을 표현하세요 ("이런 순간을 만들어주어서 고마워요 ✨")',
        '행동 촉구로 마무리하세요 ("오늘은 나를 위한 작은 선물을 해보세요 🎁")',
        '간단한 성찰로 끝내세요 ("오늘 하루도 소중했다.")',
      ][randomIndex % 10],

      facebook: [
        '정보 공유의 마음으로 마무리하세요 ("혹시 도움이 되실 분들을 위해 공유합니다.")',
        '개인적 소감으로 끝내세요 ("이런 경험들이 쌓여서 성장하는 것 같네요.")',
        '조언을 제공하며 마무리하세요 ("비슷한 상황이시라면 한번 시도해보세요!")',
        '미래 계획을 밝히며 끝내세요 ("다음에는 더 재밌는 이야기로 찾아올게요.")',
        '교훈을 정리하며 마무리하세요 ("결국 중요한 건 꾸준함이더라구요.")',
        '열린 토론으로 끝내세요 ("다양한 의견을 듣고 싶어요. 댓글로 알려주세요.")',
        '감사 표현으로 마무리하세요 ("이런 경험을 나눌 수 있어 감사합니다.")',
        '희망적 메시지로 끝내세요 ("우리 모두에게 좋은 일들이 가득하길 바라요.")',
        '실천 제안으로 마무리하세요 ("오늘부터 하나씩 실천해보면 어떨까요?")',
        '공감대 형성으로 끝내세요 ("비슷한 경험이 있으신 분들이 많을 것 같아요.")',
      ][randomIndex % 10],

      twitter: [
        '위트 있는 한 줄로 작성하세요 ("회사에서 커피가 떨어졌다. 생산성도 함께 떨어졌다.")',
        '통찰력 있는 관찰로 작성하세요 ("어른이 된다는 건 작은 것에 감사할 줄 아는 것.")',
        '일상 공감으로 작성하세요 ("월요일 아침 지하철. 우리 모두 수고했다.")',
        '자조적 유머로 작성하세요 ("성인이 되면 돈 많이 벌 줄 알았는데.")',
        '번뜩 반전으로 작성하세요 ("다이어트 3일차. 치킨이 나를 부른다.")',
        '현실적 관찰로 작성하세요 ("비 오는 날 카페는 왜 이리 낭만적일까.")',
        '짧은 선언으로 작성하세요 ("오늘부터 나는 일찍 자는 사람.")',
        '공감 유발로 작성하세요 ("금요일 오후 5시. 가장 행복한 시간.")',
        '아이러니로 작성하세요 ("휴가 마지막 날이 제일 피곤하다는 역설.")',
        '간결한 통찰로 작성하세요 ("행복은 늘 가까운 곳에 있었다.")',
      ][randomIndex % 10],

      linkedin: [
        '인사이트 정리로 마무리하세요 ("리더십은 결국 사람에 대한 이해에서 시작됩니다.")',
        '행동 촉구로 끝내세요 ("작은 변화부터 시작해보시길 권합니다.")',
        '미래 전망으로 마무리하세요 ("앞으로 이 분야는 더욱 중요해질 것입니다.")',
        '겸손한 마무리로 끝내세요 ("아직 배울 게 많지만, 조금씩 성장하고 있습니다.")',
        '감사 표현으로 마무리하세요 ("좋은 팀을 만나 함께 성장할 수 있어 감사합니다.")',
        '전문적 조언으로 끝내세요 ("이 방법이 많은 분들께 도움이 되길 바랍니다.")',
        '성찰로 마무리하세요 ("매일의 작은 성장이 모여 큰 변화를 만듭니다.")',
        '동기부여로 끝내세요 ("우리 모두가 각자의 속도로 성장하고 있습니다.")',
        '개방적 태도로 마무리하세요 ("다양한 관점을 환영합니다. 함께 성장해요.")',
        '핵심 메시지로 끝내세요 ("성공의 열쇠는 지속적인 학습과 적용입니다.")',
      ][randomIndex % 10],

      blog: "문단의 자연스러운 흐름으로 종결하세요. 독자에게 생각할 거리를 남기거나, 행동을 촉구하거나, 희망적인 메시지로 마무리하세요.",
    };

    const platformInstruction =
      endingStyles[params.platform] || endingStyles.instagram[randomIndex % 10];

    const prompt = `다음 주제에 대해 SNS 게시글을 작성해주세요:

주제: "${params.prompt}"
길이: ${lengthGuides[params.length]}
플랫폼: ${params.platform || "instagram"}

${platformInstruction}

중요: 반드시 위에 제시된 "${
      params.prompt
    }" 주제에 대해서만 작성하고, 다른 내용은 절대 쓰지 마세요.
해시태그는 글 끝에 포함해주세요.`;

    console.log("Generated prompt:", prompt);
    return prompt;
  }

  private getTemperature(tone: string): number {
    const temperatures = {
      casual: 0.7,
      professional: 0.3,
      humorous: 0.9,
      emotional: 0.6,
      genz: 0.8, // 다양하고 창의적인 표현
      millennial: 0.5, // 균형잡힌 표현
      minimalist: 0.2, // 일관되고 간결한 표현
    };
    return temperatures[tone] || 0.7;
  }

  private getMaxTokens(length: string, platform?: string): number {
    // 플랫폼별 최적 길이 조정
    if (platform === "twitter") {
      const twitterTokens = {
        short: 80, // ~50자
        medium: 120, // ~100자
        long: 150, // ~140자 (280자 제한 고려)
      };
      return twitterTokens[length] || 120;
    } else if (platform === "facebook") {
      const facebookTokens = {
        short: 200, // ~150자
        medium: 400, // ~300자
        long: 700, // ~500자
      };
      return facebookTokens[length] || 400;
    }

    // 기본값 (Instagram 및 기타)
    const tokens = {
      short: 150,
      medium: 300,
      long: 500,
    };
    return tokens[length] || 300;
  }

  private extractHashtags(content: string, platform?: string): string[] {
    const hashtagRegex = /#[가-힣a-zA-Z0-9_]+/g;
    const matches = content.match(hashtagRegex) || [];
    const uniqueTags = [...new Set(matches.map((tag) => tag.substring(1)))];

    // 플랫폼별 해시태그 개수 조정 (랜덤성 추가)
    const tagRanges = {
      instagram: { min: 8, max: 15 },
      twitter: { min: 1, max: 3 },
      facebook: { min: 3, max: 5 },
      linkedin: { min: 3, max: 5 },
      blog: { min: 5, max: 8 },
    };

    const range = tagRanges[platform] || tagRanges.instagram;
    const targetCount =
      Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;

    // 태그가 부족한 경우 기본 태그 추가
    if (uniqueTags.length < targetCount) {
      console.log(
        `Hashtags needed: ${targetCount}, found: ${uniqueTags.length}`
      );

      // PersonalizedHashtagService로부터 개인화된 해시태그 가져오기 (하드코딩 제거)
      try {
        const personalizedHashtagService = require('./personalizedHashtagService').default;
        const neededCount = targetCount - uniqueTags.length;
        const personalizedTags = await personalizedHashtagService.getPersonalizedHashtags(content, neededCount * 2);
        
        // 중복 제거 후 기본 추가 태그로 사용
        const additionalTags = personalizedTags.filter(tag => !uniqueTags.includes(tag));
        
        // 부족한 만큼 추가
        while (uniqueTags.length < targetCount && additionalTags.length > 0) {
          const randomIndex = Math.floor(Math.random() * additionalTags.length);
          const newTag = additionalTags[randomIndex];
          if (!uniqueTags.includes(newTag)) {
            uniqueTags.push(newTag);
          }
          additionalTags.splice(randomIndex, 1);
        }
      } catch (error) {
        console.error('Failed to get personalized hashtags, using fallback:', error);
        // 폴백: 번역된 기본 태그 사용
        try {
          const { t } = require('../locales/i18n');
          const fallbackTags = [
            t("home.topics.daily"),
            t("home.topics.weekend"), 
            t("home.topics.cafe"),
            t("home.topics.food"),
            t("home.topics.travel")
          ];
          
          for (const tag of fallbackTags) {
            if (!uniqueTags.includes(tag) && uniqueTags.length < targetCount) {
              uniqueTags.push(tag);
            }
          }
        } catch (translationError) {
          console.error('Translation fallback failed:', translationError);
          // 최후의 폴백: 하드코딩된 태그
          const hardcodedFallbackTags = ["일상", "데일리", "오늘", "좋아요", "행복"];
          
          for (const tag of hardcodedFallbackTags) {
            if (!uniqueTags.includes(tag) && uniqueTags.length < targetCount) {
              uniqueTags.push(tag);
            }
          }
        }
      }
    }

    return uniqueTags.slice(0, targetCount);
  }

  // 설명에서 객체 추출
  private extractObjects(description: string): string[] {
    const keywords = [
      "커피",
      "라떼",
      "카페",
      "테이블",
      "창문",
      "음식",
      "디저트",
      "꽃",
      "하늘",
      "바다",
    ];
    return keywords.filter((keyword) => description.includes(keyword));
  }

  // 분위기 감지
  private detectMood(description: string): string {
    if (description.includes("아늑") || description.includes("따뜻")) {
      return "cozy";
    }
    if (description.includes("밝") || description.includes("화창")) {
      return "bright";
    }
    if (description.includes("조용") || description.includes("평화")) {
      return "peaceful";
    }
    if (description.includes("활기") || description.includes("즐거")) {
      return "cheerful";
    }
    return "positive";
  }
}

export default new OpenAIService();

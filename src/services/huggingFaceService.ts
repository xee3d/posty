// Hugging Face 무료 API를 사용한 AI 서비스
// 완전 무료, 한국어 지원

const HF_API_KEY = "hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"; // Hugging Face에서 무료로 발급

interface GenerateContentParams {
  prompt: string;
  tone: "casual" | "professional" | "humorous" | "emotional";
  length: "short" | "medium" | "long";
  platform?: "instagram" | "facebook" | "twitter" | "linkedin";
}

class HuggingFaceService {
  private apiKey: string;
  private baseUrl = "https://api-inference.huggingface.co/models/";
  private model = "beomi/llama-2-ko-7b"; // 한국어 특화 모델

  constructor() {
    this.apiKey = HF_API_KEY;
    console.log("HuggingFace Service initialized");
  }

  async generateContent(params: GenerateContentParams) {
    const prompt = this.createPrompt(params);

    try {
      const response = await fetch(`${this.baseUrl}${this.model}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: this.getMaxTokens(params.length),
            temperature: this.getTemperature(params.tone),
            return_full_text: false,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const content = data[0].generated_text;

      // 해시태그 추출
      const hashtags = this.extractHashtags(content);

      return {
        content: content.replace(/#\S+/g, "").trim(),
        hashtags,
        platform: params.platform || "instagram",
        model: this.model,
      };
    } catch (error) {
      console.error("HuggingFace API Error:", error);
      throw error;
    }
  }

  private createPrompt(params: GenerateContentParams): string {
    const toneGuides = {
      casual: "친근하고 편안한",
      professional: "전문적이고 신뢰감 있는",
      humorous: "재미있고 유머러스한",
      emotional: "감성적이고 따뜻한",
    };

    const lengthGuides = {
      short: "50자 이내의 짧은",
      medium: "100-150자의",
      long: "200-300자의 긴",
    };

    return `다음 주제로 ${toneGuides[params.tone]} 톤의 ${
      lengthGuides[params.length]
    } SNS 게시글을 작성해주세요. 이모지와 해시태그를 포함해주세요.

주제: ${params.prompt}
플랫폼: ${params.platform || "instagram"}

게시글:`;
  }

  private getTemperature(tone: string): number {
    const temperatures = {
      casual: 0.7,
      professional: 0.3,
      humorous: 0.9,
      emotional: 0.6,
    };
    return temperatures[tone] || 0.7;
  }

  private getMaxTokens(length: string): number {
    const tokens = {
      short: 100,
      medium: 200,
      long: 300,
    };
    return tokens[length] || 200;
  }

  private extractHashtags(content: string): string[] {
    const hashtagRegex = /#[가-힣a-zA-Z0-9_]+/g;
    const matches = content.match(hashtagRegex) || [];
    return matches.map((tag) => tag.substring(1));
  }
}

export default new HuggingFaceService();

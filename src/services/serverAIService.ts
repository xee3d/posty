import { getCurrentLanguage } from './localization/languageService';
import { generatePrompt, getImageAnalysisPrompt } from './localization/promptTemplates';

// 서버 API 서비스 - Posty 백엔드 서버와 통신
import API_CONFIG, { getApiUrl, getAuthHeader } from "../config/api";
import apiService from "./api/apiService";

interface ServerGenerateParams {
  prompt: string;
  tone: string;
  platform?: string;
  imageBase64?: string;
  length?: string;
  model?: string;
  includeEmojis?: boolean;
  generatePlatformVersions?: boolean;
  userProfile?: any; // Optional user profile data
}

interface ServerResponse {
  success: boolean;
  content?: string;
  contentLength?: number;
  usage?: any;
  platforms?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    tiktok?: string;
  };
  metadata?: {
    tone: string;
    platform: string;
    includeEmojis: boolean;
    generatePlatformVersions: boolean;
    timestamp: string;
    model: string;
  };
  error?: string;
  message?: string;
}

class ServerAIService {
  private timeout: number = API_CONFIG.TIMEOUT;

  constructor() {
    console.log("ServerAIService initialized with:", {
      baseUrl: API_CONFIG.BASE_URL,
      hasSecret: !!API_CONFIG.APP_SECRET,
    });
  }

  // 서버 상태 체크
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.HEALTH), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const responseText = await response.text();

      try {
        const data = JSON.parse(responseText);
        return data.status === "ok";
      } catch (parseError) {
        console.error("Health check JSON parse error:", parseError);
        console.error("Response text:", responseText);
        return false;
      }
    } catch (error) {
      console.error("Health check failed:", error);
      return false;
    }
  }

  // 콘텐츠 생성 (서버 API 호출)
  async generateContent(
    params: ServerGenerateParams
  ): Promise<{ content: string; platforms?: any }> {
    try {
      const apiUrl = getApiUrl(API_CONFIG.ENDPOINTS.GENERATE);
      console.log("Calling server API:", apiUrl);
      console.log("Full URL components:", {
        BASE_URL: API_CONFIG.BASE_URL,
        ENDPOINT: API_CONFIG.ENDPOINTS.GENERATE,
        FULL_URL: apiUrl,
      });

      // 길이에 따른 타임아웃 설정
      const timeoutDuration =
        params.length === "long"
          ? 60000 // 긴 글: 60초
          : this.timeout; // 기본: 60초

      console.log(
        `Using timeout: ${timeoutDuration / 1000}s for length: ${params.length}`
      );

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          ...getAuthHeader(),
          "X-App-Version": "1.0.0",
        },
        body: JSON.stringify({
          prompt: (() => {
            const enhancedPrompt = this.enhancePromptWithLanguage(params.prompt, params.tone, params.platform || "instagram", params.length);
            console.log("🔧 [ServerAIService] Final prompt to server length:", enhancedPrompt.length, "characters");
            console.log("🔧 [ServerAIService] ACTUAL PROMPT BEING SENT:", enhancedPrompt);
            if (enhancedPrompt.length > 1000) {
              console.warn("⚠️ [ServerAIService] Prompt exceeds 1000 characters! Length:", enhancedPrompt.length);
            }
            return enhancedPrompt;
          })(),
          tone: params.tone,
          platform: params.platform || "instagram",
          language: (() => {
            const currentLang = getCurrentLanguage();
            console.log("🔧 [ServerAIService] Sending language to server:", currentLang);
            return currentLang;
          })(), // 동적 언어 감지
          length: params.length || "medium", // 길이 추가
          model: params.model, // AI 모델 추가
          includeEmojis: params.includeEmojis ?? true,
          generatePlatformVersions: params.generatePlatformVersions ?? false,
          // 언어 변경 시 컨텍스트 리셋을 위한 완전 무작위 세션 ID
          sessionId: (() => {
            const currentLang = getCurrentLanguage();
            const timestamp = Date.now();
            const randomStr = Math.random().toString(36).substr(2, 15);
            const uuid = Math.random().toString(36).substr(2, 9) + Math.random().toString(36).substr(2, 9);
            const sessionId = `RESET_${currentLang}_${timestamp}_${randomStr}_${uuid}`;
            console.log("🔧 [ServerAIService] COMPLETE CONTEXT RESET - Session ID:", sessionId);
            return sessionId;
          })(),
          // 서버에서 언어 강제 변환 방지
          forceLanguage: (() => {
            const currentLang = getCurrentLanguage();
            console.log("🔧 [ServerAIService] Force language parameter:", currentLang);
            return currentLang;
          })(),
          disableKoreanFallback: getCurrentLanguage() !== 'ko',
          // 길이에 따른 max_tokens 설정
          max_tokens: this.getMaxTokensByLength(params.length),
          // 이미지가 있으면 base64 전송
          ...(params.imageBase64 && { image: params.imageBase64 }),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // 응답을 먼저 텍스트로 읽기
      const responseText = await response.text();

      // JSON 파싱 시도
      let data: ServerResponse;
      try {
        console.log("🔧 [ServerAIService] Raw server response:", responseText.substring(0, 200) + "...");
        const parsed = JSON.parse(responseText);

        // 서버가 data wrapper를 사용하는 경우 처리
        if (parsed.success && parsed.data) {
          data = {
            success: parsed.success,
            content: parsed.data.content,
            contentLength:
              parsed.data.contentLength || parsed.data.content?.length,
            usage: parsed.data.usage,
            platforms: parsed.data.platforms,
            metadata: parsed.metadata || parsed.data.metadata,
            error: parsed.error,
            message: parsed.message,
          };
        } else {
          data = parsed;
        }

        console.log("Parsed server data structure:", {
          success: data.success,
          hasContent: !!data.content,
          hasPlatforms: !!data.platforms,
          keys: Object.keys(data),
          rawData: data,
        });
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        console.error("Response text:", responseText.substring(0, 200));

        // JSON이 아닌 경우 에러 처리
        if (response.ok) {
          throw new Error("서버가 올바른 형식의 응답을 반환하지 않았습니다.");
        } else {
          // HTML 응답인 경우 체크
          if (
            responseText.includes("<!DOCTYPE") ||
            responseText.includes("<html")
          ) {
            console.error("Server returned HTML instead of JSON");
            console.error("This usually means the endpoint is not found (404)");
            console.error("Check API URL:", apiUrl);
            console.error("Response status:", response.status);
            console.error(
              "First 200 chars of response:",
              responseText.substring(0, 200)
            );
            throw new Error("JSON Parse error: Unexpected character: T");
          }
          throw new Error(`JSON Parse error: ${parseError.message}`);
        }
      }

      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`);
      }

      if (!data.success || !data.content) {
        throw new Error("Invalid response from server");
      }

      console.log("Server response:", {
        success: data.success,
        contentLength: data.contentLength,
        usage: data.usage,
        hasPlatforms: !!data.platforms,
        platformKeys: data.platforms ? Object.keys(data.platforms) : [],
        content:
          typeof data.content === "string"
            ? data.content.substring(0, 100) + "..."
            : data.content, // 일부만 출력
        rawResponse: data, // 전체 응답 구조 확인
      });

      // 사진과 관련 없는 내용 필터링 (임시 조치)
      let content = data.content;

      // content가 문자열인지 확인
      if (typeof content !== "string") {
        console.error("Content is not a string:", typeof content, content);
        content = String(content || "");
      }

      // 이미지가 있는 경우에만 필터링 적용
      if (params.imageBase64) {
        // 사진과 관련 없는 내용 제거
        const unwantedPatterns = [
          /보양식[^.!?\n]*[.!?]/g,
          /미각으로[^.!?\n]*[.!?]/g,
          /레시피[^.!?\n]*[.!?]/g,
          /요리[^.!?\n]*[.!?]/g,
          /맛집[^.!?\n]*[.!?]/g,
          /음식[^.!?\n]*추천[^.!?\n]*[.!?]/g,
        ];

        unwantedPatterns.forEach((pattern) => {
          const matches = content.match(pattern);
          if (matches) {
            console.log("Filtering out unwanted content:", matches);
            content = content.replace(pattern, "");
          }
        });

        // 빈 줄이 여러 개 생긴 경우 정리
        content = content.replace(/\n{3,}/g, "\n\n").trim();
      }

      return {
        content: content,
        platforms: data.platforms || null,
      };
    } catch (error: any) {
      console.error("Server API error:", error);

      // 에러 타입에 따른 처리
      if (error.name === "AbortError") {
        console.error(
          "Request timeout after",
          this.getMaxTokensByLength(params.length),
          "ms"
        );
        throw new Error("요청 시간이 초과되었습니다. 다시 시도해주세요.");
      }

      if (error.message.includes("Failed to fetch")) {
        console.error("Network error - server may be down");
        throw new Error("서버에 연결할 수 없습니다. 네트워크를 확인해주세요.");
      }

      if (error.message.includes("429")) {
        console.error("Rate limit exceeded");
        throw new Error("요청이 너무 많습니다. 잠시 후 다시 시도해주세요.");
      }

      if (error.message.includes("401")) {
        throw new Error("인증에 실패했습니다. 앱을 다시 시작해주세요.");
      }

      // 기타 서버 에러
      console.error("Unexpected server error:", error.message);
      throw new Error(`서버 오류: ${error.message}`);
    }
  }

  // 이미지 분석 (서버 API 호출)
  async analyzeImage(imageBase64: string): Promise<string> {
    try {
      // 서버에 이미지 분석 엔드포인트가 없으므로,
      // 이미지 분석을 포함한 콘텐츠 생성 요청으로 대체
      console.log("Analyzing image through content generation...");
      console.log("Image data length:", imageBase64.length);
      console.log(
        "Estimated image size:",
        ((imageBase64.length * 0.75) / 1024 / 1024).toFixed(2),
        "MB"
      );

      const currentLanguage = getCurrentLanguage();
      const requestBody = {
        prompt: getImageAnalysisPrompt(currentLanguage),
        image: imageBase64, // imageBase64 대신 image로 변경
        platform: "instagram",
        tone: "casual",
        length: "short",
        language: currentLanguage,
      };

      // 개발 모드에서만 상세 로그 출력
      if (__DEV__) {
        console.log("Request body size:", JSON.stringify(requestBody).length);
        console.log("API URL:", getApiUrl(API_CONFIG.ENDPOINTS.GENERATE));
      }

      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.GENERATE), {
        method: "POST",
        headers: getAuthHeader(),
        body: JSON.stringify(requestBody),
      });

      console.log("Response status:", response.status);

      // 응답 텍스트 확인
      const responseText = await response.text();
      if (__DEV__) {
        console.log(
          "Response text (first 200 chars):",
          responseText.substring(0, 200)
        );
      }

      // JSON 파싱 시도
      let data;
      try {
        data = JSON.parse(responseText);
        if (__DEV__) {
          console.log("Parsed response data:", {
            success: data.success,
            hasContent: !!data.content,
            contentLength: data.content?.length || 0,
          });
        }
      } catch (parseError) {
        console.error("JSON parse error:", parseError);
        console.log("Response was not JSON.");
        return "멋진 사진이네요! 이 순간을 포착하신 센스가 돋보입니다.";
      }

      if (!response.ok || !data.success) {
        console.log("Image analysis failed:", data.error || data.message);
        if (data.details) {
          console.log("Error details:", data.details);
        }
        return "멋진 사진이네요! 이 순간을 포착하신 센스가 돋보입니다.";
      }

      // content에서 분석 결과만 추출
      const content = data.content || "";
      // 해시태그 제거
      const description = content.replace(/#\S+/g, "").trim();

      console.log("Image analysis result:", description);

      return description || "멋진 사진이네요! 어떤 이야기가 담겨있나요?";
    } catch (error) {
      console.error("Image analysis error:", error);
      // 에러 시 기본 응답
      return "아름다운 사진이네요! 오늘의 특별한 순간을 담으셨군요.";
    }
  }

  // 사용량 확인
  async checkUsage(): Promise<any> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/usage`, {
        method: "GET",
        headers: getAuthHeader(),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Usage check error:", error);
      return null;
    }
  }

  // 테스트 생성 (개발용)
  async testGenerate(): Promise<any> {
    try {
      const response = await fetch(
        getApiUrl(API_CONFIG.ENDPOINTS.GENERATE_TEST),
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Test generate error:", error);
      throw error;
    }
  }

  // 언어별 프롬프트 생성 - COMPLETELY REWRITTEN FOR MULTILINGUAL SUPPORT
  private enhancePromptWithLanguage(
    prompt: string, 
    tone: string, 
    platform: string, 
    length?: string
  ): string {
    const currentLanguage = getCurrentLanguage();
    console.log("🔧 [ServerAIService] ENHANCED PROMPT - Current language:", currentLanguage);
    // console.log("🔧 [ServerAIService] ENHANCED PROMPT - i18next language:", i18n.language);
    console.log("🔧 [ServerAIService] ENHANCED PROMPT - Call stack:", new Error().stack?.split('\n')[1]);
    
    // 완전히 새로운 접근법: 언어별 전용 프롬프트 생성
    let finalPrompt = "";
    
    // 언어별 극도로 강력한 지시문 (컨텍스트 완전 리셋)
    const languageInstructions: Record<string, string> = {
      'ko': `다음 내용을 한국어로 SNS 포스팅해주세요:\n${prompt}`,
      'en': `SYSTEM: New conversation. Reply in English only. No Korean/Japanese/Chinese.

Create an English social media post for:\n${prompt}

Requirements: English language only, engaging tone, appropriate hashtags.`,
      'ja': `システム：新しい対話です。日本語のみで応答してください。

以下の内容について日本語でSNS投稿を作成：\n${prompt}

要件：日本語のみ、魅力的なトーン、適切なハッシュタグ。`,
      'zh-CN': `系统：新对话，仅用中文回答。

为以下内容创作中文社交媒体帖子：\n${prompt}

要求：仅使用中文，吸引人的语调，适当的标签。`
    };
    
    // 언어 매핑 (중국어 특별 처리)
    let langKey = currentLanguage;
    console.log("🔧 [ServerAIService] ENHANCED PROMPT - Original language:", currentLanguage);
    console.log("🔧 [ServerAIService] ENHANCED PROMPT - Available language instructions:", Object.keys(languageInstructions));
    
    if (currentLanguage.startsWith('zh') || currentLanguage === 'zh-CN') {
      langKey = 'zh-CN';
      console.log("🔧 [ServerAIService] ENHANCED PROMPT - Chinese language detected, mapped to zh-CN");
    } else if (currentLanguage.startsWith('ja')) {
      langKey = 'ja';
    } else if (currentLanguage.startsWith('en')) {
      langKey = 'en';
    } else {
      langKey = 'ko';
    }
    
    // 해당 언어의 전용 프롬프트 생성
    finalPrompt = languageInstructions[langKey] || languageInstructions.ko;
    console.log("🔧 [ServerAIService] ENHANCED PROMPT - Final language key:", langKey);
    console.log("🔧 [ServerAIService] ENHANCED PROMPT - Using instruction for:", langKey, "Available keys:", Object.keys(languageInstructions));
    console.log("🔧 [ServerAIService] ENHANCED PROMPT - Selected instruction preview:", finalPrompt.substring(0, 100) + "...");
    console.log("🔧 [ServerAIService] ENHANCED PROMPT - Instruction length:", finalPrompt.length);
    
    // 언어별 길이 지시사항 (극단적으로 짧게)
    const lengthInstructions: Record<string, Record<string, string>> = {
      'ko': {
        short: '짧게',
        medium: '보통',
        long: '길게'
      },
      'en': {
        short: 'short',
        medium: 'medium',
        long: 'long'
      },
      'ja': {
        short: '短く',
        medium: '普通',
        long: '詳しく'
      },
      'zh-CN': {
        short: '简短',
        medium: '适中',
        long: '详细'
      }
    };
    
    // 이미 위에서 langKey가 설정되었으므로 재사용
    const langInstructions = lengthInstructions[langKey] || lengthInstructions.ko;
    
    // 길이 옵션에 따른 지시 추가
    if (length && langInstructions[length]) {
      finalPrompt += `\n${langInstructions[length]}`;
    }
    
    console.log("🔧 [ServerAIService] ENHANCED PROMPT COMPLETE - Final language:", langKey, "Length:", finalPrompt.length);
    return finalPrompt;
  }

  // 길이에 따라 프롬프트 보강 (fallback용 - 다국어 지원)
  private enhancePromptWithLength(prompt: string, length?: string): string {
    const currentLanguage = getCurrentLanguage();
    console.warn("⚠️ [ServerAIService] FALLBACK FUNCTION CALLED! This should not happen!");
    console.log("🔧 [ServerAIService] FALLBACK - Current language:", currentLanguage);
    console.log("🔧 [ServerAIService] FALLBACK - Call stack:", new Error().stack);
    
    // 언어별 응답 지시 추가 (fallback에서도 동일하게)
    let finalPrompt = prompt;
    
    const responseLanguageInstructions: Record<string, string> = {
      'ko': '한국어로 응답해주세요.',
      'en': 'Reply in English only.',
      'ja': '日本語で応答してください。',
      'zh-CN': '请用中文回答。'
    };
    
    // 한국어가 아닌 경우 언어 지시 추가
    if (currentLanguage !== 'ko') {
      const langKey = currentLanguage.startsWith('zh') ? 'zh-CN' :
                     currentLanguage.startsWith('ja') ? 'ja' :
                     currentLanguage.startsWith('en') ? 'en' : 'ko';
                     
      const responseInstruction = responseLanguageInstructions[langKey];
      if (responseInstruction) {
        finalPrompt = `${responseInstruction}\n\n${finalPrompt}`;
        console.log("🔧 [ServerAIService] FALLBACK - Added language instruction:", responseInstruction);
      }
    }
    
    // 언어별 길이 지시문 (극단적으로 짧게)
    const lengthInstructions: Record<string, Record<string, string>> = {
      'ko': {
        short: '짧게',
        medium: '보통',
        long: '길게'
      },
      'en': {
        short: 'short',
        medium: 'medium',
        long: 'long'
      },
      'ja': {
        short: '短く',
        medium: '普通',
        long: '詳しく'
      },
      'zh-CN': {
        short: '简短',
        medium: '适中',
        long: '详细'
      }
    };
    
    // 언어 코드 변환 (메인 함수와 동일하게)
    let langKey = currentLanguage;
    if (currentLanguage.startsWith('zh')) {
      langKey = 'zh-CN';
    } else if (currentLanguage.startsWith('ja')) {
      langKey = 'ja';
    } else if (currentLanguage.startsWith('en')) {
      langKey = 'en';
    } else if (currentLanguage.startsWith('ko')) {
      langKey = 'ko';
    }
    
    console.log("🔧 [ServerAIService] FALLBACK - Language mapping:", currentLanguage, "->", langKey);
    
    const langInstructions = lengthInstructions[langKey] || lengthInstructions.ko;
    
    if (length && langInstructions[length]) {
      finalPrompt += `\n${langInstructions[length]}`;
      console.log("🔧 [ServerAIService] FALLBACK - Added length instruction:", langInstructions[length]);
    }
    
    console.log("🔧 [ServerAIService] FALLBACK - Final prompt length:", finalPrompt.length);
    return finalPrompt;
  }

  // 길이에 따른 최대 토큰 수 설정
  private getMaxTokensByLength(length?: string): number {
    switch (length) {
      case "short":
        return 150;
      case "medium":
        return 300;
      case "long":
        return 600;
      default:
        return 300;
    }
  }
}

// 싱글톤 인스턴스
const serverAIService = new ServerAIService();

// 개발 중 디버깅을 위해 전역 객체에 추가
if (__DEV__) {
  (global as any).serverAIService = serverAIService;
}

export default serverAIService;

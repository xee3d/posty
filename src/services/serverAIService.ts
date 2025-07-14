// import { getCurrentLanguage } from '../locales/i18n';

// 서버 API 서비스 - Posty 백엔드 서버와 통신
import API_CONFIG, { getApiUrl, getAuthHeader } from '../config/api';

interface ServerGenerateParams {
  prompt: string;
  tone: string;
  platform?: string;
  imageBase64?: string;
  length?: string;
}

interface ServerResponse {
  success: boolean;
  data?: {
    content: string;
    usage?: any;
    model?: string;
  };
  metadata?: {
    tone: string;
    platform: string;
    timestamp: string;
  };
  error?: string;
  message?: string;
}

class ServerAIService {
  private timeout: number = API_CONFIG.TIMEOUT;

  constructor() {
    console.log('ServerAIService initialized with:', {
      baseUrl: API_CONFIG.BASE_URL,
      hasSecret: !!API_CONFIG.APP_SECRET,
    });
  }

  // 서버 상태 체크
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.HEALTH), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      return data.status === 'ok';
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  // 콘텐츠 생성 (서버 API 호출)
  async generateContent(params: ServerGenerateParams): Promise<string> {
    try {
      console.log('Calling server API:', getApiUrl(API_CONFIG.ENDPOINTS.GENERATE));
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.GENERATE), {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
          'X-App-Version': '1.0.0',
        },
        body: JSON.stringify({
          prompt: this.enhancePromptWithLength(params.prompt, params.length),
          tone: params.tone,
          platform: params.platform || 'instagram',
          language: 'ko', // getCurrentLanguage(), // 현재 언어 추가
          length: params.length || 'medium', // 길이 추가
          // 이미지가 있으면 base64 전송
          ...(params.imageBase64 && { image: params.imageBase64 }),
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      const data: ServerResponse = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`);
      }
      
      if (!data.success || !data.data?.content) {
        throw new Error('Invalid response from server');
      }
      
      console.log('Server response:', {
        success: data.success,
        contentLength: data.data.content.length,
        usage: data.data.usage,
        content: data.data.content, // 실제 콘텐츠도 출력
      });
      
      return data.data.content;
      
    } catch (error: any) {
      console.error('Server API error:', error);
      
      // 에러 타입에 따른 처리
      if (error.name === 'AbortError') {
        throw new Error('요청 시간이 초과되었습니다. 다시 시도해주세요.');
      }
      
      if (error.message.includes('Failed to fetch')) {
        throw new Error('서버에 연결할 수 없습니다. 네트워크를 확인해주세요.');
      }
      
      if (error.message.includes('429')) {
        throw new Error('요청이 너무 많습니다. 잠시 후 다시 시도해주세요.');
      }
      
      if (error.message.includes('401')) {
        throw new Error('인증에 실패했습니다. 앱을 다시 시작해주세요.');
      }
      
      throw error;
    }
  }

  // 이미지 분석 (서버 API 호출)
  async analyzeImage(imageBase64: string): Promise<string> {
    try {
      const response = await fetch(getApiUrl('/analyze-image'), {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({
          imageBase64: imageBase64,
          platform: 'instagram',
          tone: 'casual'
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        console.log('Image analysis failed, using fallback');
        return '멋진 사진이네요! 이 순간을 포착하신 센스가 돋보입니다.';
      }
      
      return data.data.description;
      
    } catch (error) {
      console.error('Image analysis error:', error);
      // 에러 시 기본 응답
      return '아름다운 사진이네요! 오늘의 특별한 순간을 담으셨군요.';
    }
  }

  // 사용량 확인
  async checkUsage(): Promise<any> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/usage`, {
        method: 'GET',
        headers: getAuthHeader(),
      });
      
      const data = await response.json();
      return data;
      
    } catch (error) {
      console.error('Usage check error:', error);
      return null;
    }
  }

  // 테스트 생성 (개발용)
  async testGenerate(): Promise<any> {
    try {
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.GENERATE_TEST), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      return data;
      
    } catch (error) {
      console.error('Test generate error:', error);
      throw error;
    }
  }

  // 길이에 따라 프롬프트 보강
  private enhancePromptWithLength(prompt: string, length?: string): string {
    if (length === 'long') {
      return `${prompt} (자세히 300-400자로 설명해주세요. 구체적인 예시와 상세한 설명을 포함해주세요. 해시태그는 글자 수에서 제외하고 본문만 계산해주세요.)`;
    } else if (length === 'short') {
      return `${prompt} (간결하게 30-50자로 작성해주세요. 해시태그는 글자 수에서 제외하고 본문만 계산해주세요.)`;
    } else if (length === 'medium') {
      return `${prompt} (적당히 100-200자로 작성해주세요. 해시태그는 글자 수에서 제외하고 본문만 계산해주세요.)`;
    }
    return prompt;
  }
}

// 싱글톤 인스턴스
const serverAIService = new ServerAIService();

// 개발 중 디버깅을 위해 전역 객체에 추가
if (__DEV__) {
  (global as any).serverAIService = serverAIService;
}

export default serverAIService;

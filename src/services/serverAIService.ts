// 서버 API 서비스 - Posty 백엔드 서버와 통신
import { API_BASE_URL, APP_SECRET } from '@env';

interface ServerGenerateParams {
  prompt: string;
  tone: string;
  platform?: string;
  imageBase64?: string;
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
  private baseUrl: string;
  private appSecret: string;
  private timeout: number = 30000; // 30초

  constructor() {
    // 환경 변수에서 서버 URL과 시크릿 키 가져오기
    // 개발 중에는 로컬 서버, 프로덕션에서는 Vercel URL 사용
    this.baseUrl = API_BASE_URL || 'http://localhost:3000';
    this.appSecret = APP_SECRET || 'development-secret';
    
    console.log('ServerAIService initialized with:', {
      baseUrl: this.baseUrl,
      hasSecret: !!this.appSecret,
    });
  }

  // 서버 상태 체크
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`, {
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
      console.log('Calling server API:', `${this.baseUrl}/api/generate`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.appSecret}`,
          'X-App-Version': '1.0.0',
        },
        body: JSON.stringify({
          prompt: params.prompt,
          tone: params.tone,
          platform: params.platform,
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
      const response = await fetch(`${this.baseUrl}/api/analyze-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.appSecret}`,
        },
        body: JSON.stringify({
          image: imageBase64,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Image analysis failed');
      }
      
      return data.data.description;
      
    } catch (error) {
      console.error('Image analysis error:', error);
      throw error;
    }
  }

  // 사용량 확인
  async checkUsage(): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/api/usage`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.appSecret}`,
        },
      });
      
      const data = await response.json();
      return data;
      
    } catch (error) {
      console.error('Usage check error:', error);
      return null;
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

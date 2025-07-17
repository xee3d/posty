// import { getCurrentLanguage } from '../locales/i18n';

// 서버 API 서비스 - Posty 백엔드 서버와 통신
import API_CONFIG, { getApiUrl, getAuthHeader } from '../config/api';

interface ServerGenerateParams {
  prompt: string;
  tone: string;
  platform?: string;
  imageBase64?: string;
  length?: string;
  model?: string;
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
          model: params.model, // AI 모델 추가
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
      
      // 사진과 관련 없는 내용 필터링 (임시 조치)
      let content = data.data.content;
      
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
        
        unwantedPatterns.forEach(pattern => {
          const matches = content.match(pattern);
          if (matches) {
            console.log('Filtering out unwanted content:', matches);
            content = content.replace(pattern, '');
          }
        });
        
        // 빈 줄이 여러 개 생긴 경우 정리
        content = content.replace(/\n{3,}/g, '\n\n').trim();
      }
      
      return content;
      
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
      // 서버에 이미지 분석 엔드포인트가 없으므로,
      // 이미지 분석을 포함한 콘텐츠 생성 요청으로 대체
      console.log('Analyzing image through content generation...');
      console.log('Image data length:', imageBase64.length);
      console.log('Estimated image size:', (imageBase64.length * 0.75 / 1024 / 1024).toFixed(2), 'MB');
      
      const requestBody = {
        prompt: '사진을 보고 사진에 대한 설명을 한국어로 자연스럽게 작성해주세요. 사진 속 분위기, 배경, 주요 요소들을 포함해서 설명해주세요.',
        image: imageBase64, // imageBase64 대신 image로 변경
        platform: 'instagram',
        tone: 'casual',
        length: 'short'
      };
      
      // 개발 모드에서만 상세 로그 출력
      if (__DEV__) {
        console.log('Request body size:', JSON.stringify(requestBody).length);
        console.log('API URL:', getApiUrl(API_CONFIG.ENDPOINTS.GENERATE));
      }
      
      const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.GENERATE), {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(requestBody),
      });
      
      console.log('Response status:', response.status);
      
      // 응답 텍스트 확인
      const responseText = await response.text();
      if (__DEV__) {
        console.log('Response text (first 200 chars):', responseText.substring(0, 200));
      }
      
      // JSON 파싱 시도
      let data;
      try {
        data = JSON.parse(responseText);
        if (__DEV__) {
          console.log('Parsed response data:', {
            success: data.success,
            hasContent: !!data.data?.content,
            contentLength: data.data?.content?.length || 0
          });
        }
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.log('Response was not JSON.');
        return '멋진 사진이네요! 이 순간을 포착하신 센스가 돋보입니다.';
      }
      
      if (!response.ok || !data.success) {
        console.log('Image analysis failed:', data.error || data.message);
        if (data.details) {
          console.log('Error details:', data.details);
        }
        return '멋진 사진이네요! 이 순간을 포착하신 센스가 돋보입니다.';
      }
      
      // content에서 분석 결과만 추출
      const content = data.data?.content || '';
      // 해시태그 제거
      const description = content.replace(/#\S+/g, '').trim();
      
      console.log('Image analysis result:', description);
      
      return description || '멋진 사진이네요! 어떤 이야기가 담겨있나요?';
      
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

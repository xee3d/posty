// OpenRouter를 통한 AI 서비스 구현
// DeepSeek 무료 모델로 시작, 추후 다른 모델로 전환 가능

// 임시로 API 키 직접 입력 (나중에 react-native-dotenv로 변경)
const OPENROUTER_API_KEY = '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';

// 모델별 가격 정보 (1M 토큰당 USD)
const MODEL_PRICING = {
  // 무료 모델
  'deepseek/deepseek-chat': {
    input: 0,
    output: 0,
    name: 'DeepSeek Chat (무료)',
    maxTokens: 4096,
  },
  'mistralai/mistral-7b-instruct:free': {
    input: 0,
    output: 0,
    name: 'Mistral 7B (무료)',
    maxTokens: 4096,
  },
  
  // 유료 모델들
  'openai/gpt-4o-mini': {
    input: 0.15,
    output: 0.6,
    name: 'GPT-4o Mini',
    maxTokens: 128000,
  },
  'anthropic/claude-3-haiku': {
    input: 0.25,
    output: 1.25,
    name: 'Claude 3 Haiku',
    maxTokens: 200000,
  },
  'google/gemini-pro': {
    input: 0.5,
    output: 1.5,
    name: 'Gemini Pro',
    maxTokens: 32000,
  },
};

interface GenerateContentParams {
  prompt: string;
  tone: 'casual' | 'professional' | 'humorous' | 'emotional';
  length: 'short' | 'medium' | 'long';
  platform?: 'instagram' | 'facebook' | 'twitter' | 'linkedin';
  model?: string;
}

interface AnalyzeImageParams {
  imageUrl: string;
  model?: string;
}

interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCost: number;
}

class OpenRouterService {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1';
  private defaultModel = 'openai/gpt-4o-mini'; // GPT-4o-mini 사용
  
  constructor() {
    this.apiKey = OPENROUTER_API_KEY;
    console.log('OpenRouter Service initialized with GPT-4o-mini');
  }
  
  // 텍스트 생성
  async generateContent(params: GenerateContentParams) {
    const model = params.model || this.defaultModel;
    const systemPrompt = this.createSystemPrompt(params.tone, params.platform);
    const userPrompt = this.createUserPrompt(params);
    
    console.log('Generating content with:', { model, tone: params.tone, length: params.length });
    console.log('Request URL:', `${this.baseUrl}/chat/completions`);
    console.log('Request headers:', {
      'Authorization': `Bearer ${this.apiKey.substring(0, 10)}...`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://molly.app',
      'X-Title': 'Molly AI Assistant',
    });
    
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://molly.app',
          'X-Title': 'Molly AI Assistant',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: this.getTemperature(params.tone),
          max_tokens: this.getMaxTokens(params.length),
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', response.status, errorText);
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('API Response received');
      
      let content = data.choices[0].message.content;
      
      // 콘텐츠 정리 - 불필요한 따옴표, 이스케이프 문자 제거
      content = content.replace(/^"|"$/g, ''); // 시작과 끝의 따옴표 제거
      content = content.replace(/\\n/g, '\n'); // 이스케이프된 줄바꿈 처리
      content = content.trim();
      
      // 이상한 텍스트 제거
      const lines = content.split('\n');
      const cleanedLines = lines.filter(line => {
        const trimmedLine = line.trim();
        // 광고성 멘트 제거
        if (trimmedLine.includes('여러분은') && trimmedLine.includes('어떻게')) return false;
        if (trimmedLine.includes('저장하고') || trimmedLine.includes('공유해')) return false;
        if (trimmedLine.includes('댓글로') || trimmedLine.includes('알려주세요')) return false;
        if (trimmedLine.includes('맞팔') || trimmedLine.includes('소통해요')) return false;
        // 너무 짧거나 의미없어 보이는 줄 제거
        return trimmedLine.length > 2 && !trimmedLine.match(/^[가-힣]{2,4}$/); // 2-4글자 한글만 있는 줄 제거
      });
      content = cleanedLines.join('\n').trim();
      
      const usage = this.calculateUsage(data.usage, model);
      
      // 해시태그 추출 및 중복 제거
      const hashtags = this.extractHashtags(content);
      
      return {
        content: content.replace(/#\S+/g, '').trim(),
        hashtags,
        platform: params.platform || 'instagram',
        model,
        usage,
      };
    } catch (error) {
      console.error('AI Generation Error:', error);
      throw error;
    }
  }
  
  // 프롬프트 생성 헬퍼 함수들
  private createSystemPrompt(tone: string, platform?: string): string {
    const toneGuides = {
      casual: '친근하고 편안한 일상 대화체로 작성하세요. 이모지는 1-2개만 사용하세요.',
      professional: '깔끔하고 정돈된 느낌으로 작성하세요. 과하지 않게 적당히 진지하게.',
      humorous: '재미있고 가볍게 작성하세요. 억지 유머 말고 자연스러운 재치를 사용하세요.',
      emotional: '따뜻하고 감성적인 톤으로 작성하세요. 진심이 느껴지도록 하세요.',
    };
    
    const platformGuides = {
      instagram: `인스타그램 게시글 스타일로 작성하세요.
      
마무리 스타일 예시:
- 감정/분위기 전달: "오늘은 이런 날 💫"
- 순간 포착: "지금 이 순간을 기억하고 싶어요"
- 일상적 마무리: "오늘 하루도 수고했어요 ☕"
- 짧은 감상: "이런 순간들이 모여 행복한 하루가 되는 것 같아요"
- 감사 표현: "오늘도 평범한 일상에 감사해요 🙏"

피해야 할 표현:
- "여러분은 어떻게 생각하시나요?"
- "저장하고 공유해보세요"
- "맞팔해요" 같은 홍보성 멘트`,
      
      facebook: `페이스북 게시글 스타일로 작성하세요.
      
마무리 스타일 예시:
- 경험 정리: "이런 경험들이 쌓여서 성장하는 것 같네요"
- 교훈/깨달음: "작은 관심이 큰 변화를 만든다는 걸 다시 한번 느꼈습니다"
- 순간의 의미: "이런 평범한 순간들이 모여 특별한 삶이 되는 것 같네요"
- 따뜻한 마무리: "모두가 행복한 하루 보내시길 바랍니다"

피해야 할 표현:
- "댓글로 알려주세요"
- "공유 부탁드려요"`,
      
      twitter: `트위터(X) 스타일로 간결하게 작성하세요.
      
마무리 스타일 예시:
- 위트형: "회사에서 커피가 떨어졌다. 생산성도 함께 떨어졌다."
- 관찰형: "비 오는 날 카페는 왜 이리 낭만적일까"
- 공감형: "월요일 아침 지하철. 우리 모두 수고했다."
- 선언형: "오늘부터 나는 일찍 자는 사람."

280자 제한을 지키고, 줄바꿈 없이 한 문장으로 작성하세요.`,
      
      linkedin: `링크드인 스타일로 적당히 진지하게 작성하세요.
      
마무리 스타일 예시:
- 성장 메시지: "매일의 작은 성장이 모여 큰 변화를 만듭니다"
- 인사이트: "이 경험을 통해 배운 가장 중요한 것은..."
- 겸손한 마무리: "아직 배울 게 많지만, 조금씩 성장하고 있습니다"

피해야 할 표현:
- "여러분의 경험을 공유해주세요" 같은 직접적 요청`,
    };
    
    return `당신은 평범한 한국인 SNS 사용자입니다. 일상을 기록하고 싶지만 글쓰기가 어려운 사람을 도와주세요.

톤: ${toneGuides[tone]}
플랫폼: ${platform ? platformGuides[platform] : '일반적인 SNS'}

작성 규칙:
1. 평범한 일반인이 쓸 법한 자연스러운 글을 작성하세요
2. 과도한 홍보나 마케팅 느낌은 피하세요
3. 적절한 줄바꿈으로 읽기 편하게 만드세요
4. 해시태그는 글 끝에 자연스럽게 5-7개 정도
5. 이모지는 적당히, 과하지 않게
6. 인플루언서처럼 보이려 하지 말고 진짜 일상을 담아주세요
7. 위에 제시된 플랫폼별 마무리 스타일을 참고하세요
8. "공유해주세요", "어떻게 생각하시나요?", "댓글 달아주세요" 같은 요청은 절대 하지 마세요`;
  }
  
  private createUserPrompt(params: GenerateContentParams): string {
    const lengthGuides = {
      short: '50자 이내로',
      medium: '100-150자로',
      long: '200-300자로',
    };
    
    return `주제: ${params.prompt}
길이: ${lengthGuides[params.length]}
플랫폼: ${params.platform || 'instagram'}

위 조건에 맞는 SNS 게시글을 작성해주세요. 
- 일반인이 일상을 기록하는 것처럼 자연스럽게
- 홍보성 멘트나 직접적인 요청은 피하고
- 플랫폼에 맞는 자연스러운 마무리로
- 해시태그는 글 끝에 포함`;
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
      short: 150,
      medium: 300,
      long: 500,
    };
    return tokens[length] || 300;
  }
  
  private extractHashtags(content: string): string[] {
    const hashtagRegex = /#[가-힣a-zA-Z0-9_]+/g;
    const matches = content.match(hashtagRegex) || [];
    // 중복 제거 및 정리
    const uniqueTags = [...new Set(matches.map(tag => tag.substring(1)))];
    
    // 너무 많은 해시태그는 5-7개로 제한
    return uniqueTags.slice(0, 7);
  }
  
  // 토큰 사용량 및 비용 계산
  private calculateUsage(usage: any, model: string): TokenUsage {
    const pricing = MODEL_PRICING[model];
    
    if (!pricing) {
      console.warn(`Pricing not found for model: ${model}, using default`);
      // 기본값 사용
      return {
        promptTokens: usage?.prompt_tokens || 0,
        completionTokens: usage?.completion_tokens || 0,
        totalTokens: (usage?.prompt_tokens || 0) + (usage?.completion_tokens || 0),
        estimatedCost: 0,
      };
    }
    
    const promptTokens = usage?.prompt_tokens || 0;
    const completionTokens = usage?.completion_tokens || 0;
    const totalTokens = promptTokens + completionTokens;
    
    // 비용 계산 (USD)
    const inputCost = (promptTokens / 1000000) * pricing.input;
    const outputCost = (completionTokens / 1000000) * pricing.output;
    const estimatedCost = inputCost + outputCost;
    
    return {
      promptTokens,
      completionTokens,
      totalTokens,
      estimatedCost,
    };
  }
  
  // 이미지 분석
  async analyzeImage(params: AnalyzeImageParams) {
    const model = params.model || 'openai/gpt-4o-mini'; // GPT-4o-mini는 이미지 분석 지원
    
    console.log('Analyzing image with:', { model });
    
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://molly.app',
          'X-Title': 'Molly AI Assistant',
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: `당신은 SNS 콘텐츠 전문가입니다. 사용자가 보낸 이미지를 분석하고, 그에 어울리는 감성적인 SNS 게시글을 추천해주세요.

작성 규칙:
1. 이미지의 분위기와 내용을 정확히 파악하세요
2. 다양한 감정톤의 게시글 3개를 제안하세요
3. 각 게시글은 50-100자 내외로 작성하세요
4. 이모지를 적절히 사용하세요
5. 해시태그는 포함하지 마세요`
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: '이 이미지를 분석하고, 어울리는 SNS 게시글을 추천해주세요.'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: params.imageUrl
                  }
                }
              ]
            }
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Image Analysis API Error:', response.status, errorText);
        throw new Error(`API Error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Image analysis response received');
      
      const content = data.choices[0].message.content;
      
      // 응답 파싱
      const lines = content.split('\n').filter(line => line.trim());
      const suggestedContent = [];
      let description = '';
      
      // 첫 줄은 보통 이미지 설명
      if (lines.length > 0) {
        description = lines[0];
      }
      
      // 나머지 줄들에서 추천 콘텐츠 추출
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        // 번호나 기호로 시작하는 줄 찾기
        if (line.match(/^[1-3]\.|^-|^•/) || (line.length > 10 && !line.includes(':'))) {
          const cleanedLine = line.replace(/^[1-3]\.|^-|^•/, '').trim();
          if (cleanedLine) {
            suggestedContent.push(cleanedLine);
          }
        }
      }
      
      // 최소 3개의 추천 콘텐츠 보장
      if (suggestedContent.length < 3) {
        suggestedContent.push(
          '오늘도 특별한 순간을 기록해요 ✨',
          '일상 속 작은 행복을 발견했어요 🌟',
          '이 순간이 영원히 기억되길 바라며 📸'
        );
      }
      
      return {
        description,
        objects: this.extractObjects(description),
        mood: this.detectMood(description),
        suggestedContent: suggestedContent.slice(0, 3),
      };
    } catch (error) {
      console.error('Image analysis failed:', error);
      // 폴백 응답
      return {
        description: '아름다운 순간이 담긴 사진이네요',
        objects: ['사진', '순간', '일상'],
        mood: 'positive',
        suggestedContent: [
          '오늘의 특별한 순간을 기록합니다 📸',
          '평범한 일상 속 특별함을 발견했어요 ✨',
          '이런 순간들이 모여 행복이 되는 것 같아요 💕'
        ],
      };
    }
  }
}

export default new OpenRouterService();
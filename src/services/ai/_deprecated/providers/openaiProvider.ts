// OpenAI API Provider
import { OPENAI_API_KEY } from '@env';
import {
  AIProvider,
  GenerateContentParams,
  PolishContentParams,
  AnalyzeImageParams,
  GeneratedContent,
  ImageAnalysis,
  ContentExample
} from '../types/ai.types';
import { ContentStrategy } from '../strategies/contentStrategy';
import { HashtagStrategy } from '../strategies/hashtagStrategy';
import { EngagementStrategy } from '../strategies/engagementStrategy';

export class OpenAIProvider implements AIProvider {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1';
  private model = 'gpt-4o-mini';
  private visionModel = 'gpt-4o-mini'; // gpt-4o-mini는 이미지 분석을 지원합니다
  
  private contentStrategy: ContentStrategy;
  private hashtagStrategy: HashtagStrategy;
  private engagementStrategy: EngagementStrategy;

  constructor() {
    this.apiKey = OPENAI_API_KEY || '';
    this.contentStrategy = new ContentStrategy();
    this.hashtagStrategy = new HashtagStrategy();
    this.engagementStrategy = new EngagementStrategy();
  }

  async generateContent(params: GenerateContentParams): Promise<GeneratedContent> {
    console.log('OpenAIProvider.generateContent called with:', JSON.stringify(params, null, 2));
    try {
      // 1. 전략 준비
      const timeStrategy = this.contentStrategy.getTimeStrategy(params.options?.timeOfDay);
      const examples = this.contentStrategy.selectBestExamples(
        params.platform || 'instagram',
        params.userProfile?.type || 'casual_user',
        params.tone
      );
      const temperature = this.contentStrategy.calculateTemperature(
        params.userProfile || { type: 'casual_user', experience: 'intermediate', primaryGoal: 'engagement' },
        params.tone
      );

      // 2. 시스템 프롬프트 생성
      const systemPrompt = this.createSystemPrompt(params, examples);
      
      // 3. 사용자 프롬프트 생성
      const userPrompt = this.createUserPrompt(params, timeStrategy);

      // 4. API 호출
      const startTime = Date.now();
      const response = await this.callOpenAI({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature,
        max_tokens: this.getOptimalTokens(params.length, params.platform),
        presence_penalty: 0.6,
        frequency_penalty: 0.8,
      });

      const generationTime = Date.now() - startTime;
      let content = response.choices[0].message.content;

      // 5. 후처리
      content = this.contentStrategy.applyVariationStrategy(content, params.platform || 'instagram');
      content = this.contentStrategy.postProcessContent(content, params.platform);

      // 6. 해시태그 생성
      console.log('Generating hashtags...');
      console.log('params.hashtags:', params.hashtags);
      
      let hashtags: string[] = [];
      try {
        if (params.hashtags && params.hashtags.length > 0) {
          hashtags = params.hashtags;
          console.log('Using provided hashtags:', hashtags);
        } else {
          const generated = this.hashtagStrategy.generateHashtags(
            content,
            params.platform || 'instagram',
            params.tone,
            params.userProfile
          );
          hashtags = generated || [];
          console.log('Generated hashtags:', hashtags);
        }
      } catch (hashtagError) {
        console.error('Error generating hashtags:', hashtagError);
        hashtags = [];
      }

      // 7. 참여도 계산
      const estimatedEngagement = this.engagementStrategy.calculateEngagement(
        content,
        params.platform || 'instagram',
        params.userProfile
      );

      return {
        content: content.replace(/#[\w가-힣]+/g, '').trim(),
        hashtags: hashtags || [],
        platform: params.platform || 'instagram',
        estimatedEngagement,
        metadata: {
          tokensUsed: response.usage?.total_tokens,
          generationTime,
          strategy: 'openai'
        }
      };

    } catch (error) {
      console.error('OpenAI generation failed:', error);
      throw error;
    }
  }

  async polishContent(params: PolishContentParams): Promise<GeneratedContent> {
    try {
      const polishPrompts = {
        spelling: '맞춤법과 문법을 교정해주세요. 원문의 의미와 톤은 유지하되, 오류만 수정해주세요.',
        refine: '문장을 더 자연스럽고 매끄럽게 다듬어주세요. 원문의 핵심 메시지는 유지해주세요.',
        improve: '더 매력적이고 참여도 높은 콘텐츠로 개선해주세요. 창의적인 표현을 추가하고 감정을 풍부하게 만들어주세요.'
      };

      const systemPrompt = `당신은 한국어 SNS 콘텐츠 전문 에디터입니다.
${polishPrompts[params.polishType || 'refine']}
플랫폼: ${params.platform || 'instagram'}
톤: ${params.tone}
길이: ${params.length}`;

      const response = await this.callOpenAI({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `다음 텍스트를 개선해주세요:\n\n${params.text}` }
        ],
        temperature: 0.5,
        max_tokens: this.getOptimalTokens(params.length, params.platform),
      });

      const polishedContent = response.choices[0].message.content;
      const hashtags = this.hashtagStrategy.generateHashtags(
        polishedContent,
        params.platform || 'instagram',
        params.tone
      ) || [];

      return {
        content: polishedContent,
        hashtags: hashtags || [],
        platform: params.platform || 'instagram',
        estimatedEngagement: this.engagementStrategy.calculateEngagement(
          polishedContent,
          params.platform || 'instagram'
        )
      };

    } catch (error) {
      console.error('OpenAI polish failed:', error);
      throw error;
    }
  }

  async analyzeImage(params: AnalyzeImageParams): Promise<ImageAnalysis> {
    console.log('OpenAIProvider: Starting image analysis');
    console.log('Image URI type:', params.imageUri.substring(0, 50));
    
    try {
      const messages = [
        {
          role: 'system',
          content: `당신은 이미지 분석 전문가입니다. 이미지를 보고 SNS에 적합한 감성적인 설명을 해주세요.

응답 형식:
1. 첫 줄: 이미지에 대한 자연스럽고 감성적인 설명 (50-100자)
2. 둘째 줄부터: SNS 게시물에 어울리는 짧은 텍스트 3개 (각각 다른 느낌으로)

주의사항:
- 마크다운이나 번호를 사용하지 마세요
- 자연스러운 한국어로 작성하세요
- 이모지를 적절히 사용하세요`
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: '이 이미지를 분석해주세요.'
            },
            {
              type: 'image_url',
              image_url: {
                url: params.imageUri.startsWith('data:') 
                  ? params.imageUri 
                  : `data:image/jpeg;base64,${params.imageUri}`
              }
            }
          ]
        }
      ];

      console.log('Calling OpenAI with vision model...');
      const response = await this.callOpenAI({
        messages,
        model: this.visionModel, // 비전 모델 사용
        temperature: 0.7,
        max_tokens: 500,
      });

      const analysis = response.choices[0].message.content;
      console.log('Raw OpenAI response:', analysis);
      
      // 분석 결과 파싱 개선
      const lines = analysis.split('\n').filter(line => line.trim());
      
      // 첫 줄은 설명, 나머지는 제안 콘텐츠
      const description = lines[0] || '멋진 사진이네요!';
      const suggestedContent = lines.slice(1).filter(line => line.trim().length > 0);
      
      // 만약 제안 콘텐츠가 부족하면 기본값 추가
      while (suggestedContent.length < 3) {
        suggestedContent.push(`이 순간을 기억하고 싶어요 ${['✨', '💕', '🌟'][suggestedContent.length]}`);
      }
      
      const objects = this.extractObjects(description);
      const mood = this.detectMood(description);

      const result = {
        description,
        objects,
        mood,
        suggestedContent: suggestedContent.slice(0, 3) // 최대 3개만
      };
      
      console.log('Parsed image analysis:', result);
      return result;

    } catch (error) {
      console.error('OpenAI image analysis failed:', error);
      throw error;
    }
  }

  private createSystemPrompt(params: GenerateContentParams, examples: ContentExample[]): string {
    try {
      const tonePattern = this.contentStrategy.getTonePattern(params.tone);
      
      // examples 배열 안전 체크
      const examplesSection = examples && examples.length > 0 
        ? examples.map((ex, idx) => {
            const successFactorsText = ex.successFactors && Array.isArray(ex.successFactors) 
              ? ex.successFactors.join(', ') 
              : '성공 요인 없음';
            
            return `
예시 ${idx + 1} (좋아요 ${ex.engagement?.likes || 0}개):
"${ex.content || ''}"
성공 요인: ${successFactorsText}
`;
          }).join('\n')
        : '예시 없음';
      
      // tonePattern 안전 체크
      const toneGuideSection = tonePattern ? `
톤 가이드 (${params.tone}):
- 주요 어휘: ${tonePattern.vocabulary ? tonePattern.vocabulary.join(', ') : ''}
- 문장 끝: ${tonePattern.sentenceEndings ? tonePattern.sentenceEndings.join(', ') : ''}
- 표현: ${tonePattern.expressions ? tonePattern.expressions.join(', ') : ''}
` : '';
      
      return `당신은 한국의 인기 SNS 크리에이터입니다.
${params.userProfile?.type === 'business_manager' ? `${params.userProfile.businessType || '소상공인'} 사장님으로서` : '일반 사용자로서'} 자연스럽고 진정성 있는 글을 작성합니다.

성공적인 콘텐츠 예시들:
${examplesSection}
${toneGuideSection}

작성 원칙:
1. 진정성: 완벽하지 않아도 됩니다. 진짜 사람이 쓴 것처럼
2. 자연스러움: 친구에게 이야기하듯 편하게
3. 구체성: 막연한 표현보다 구체적인 상황과 감정
4. 공감: 읽는 사람이 공감할 수 있는 내용
5. 적절한 이모지: 감정을 표현하되 과하지 않게

피해야 할 것:
- 과도한 마케팅 문구
- 억지스러운 참여 유도
- 기계적인 문장 구조
- 뻔한 클리셰`;
    } catch (error) {
      console.error('Error in createSystemPrompt:', error);
      console.error('params:', params);
      console.error('examples:', examples);
      throw error;
    }
  }

  private createUserPrompt(params: GenerateContentParams, timeStrategy: any): string {
    return `주제: ${params.prompt}
플랫폼: ${params.platform || 'instagram'}
시간대: ${timeStrategy.time} (${timeStrategy.content})
길이: ${params.length === 'short' ? '2-3문장' : params.length === 'long' ? '7-10문장' : '4-6문장'}

${params.options?.includeImage ? '사진과 함께 올릴 글입니다. 사진 설명은 자연스럽게 녹여주세요.' : ''}

특별 지시사항:
- 진짜 사람이 ${timeStrategy.time}에 올릴 법한 자연스러운 글
- ${params.tone} 톤으로, 하지만 너무 극단적이지 않게
- 개인적인 경험이나 감정을 포함시켜 주세요
- 문장이 너무 매끄럽지 않아도 괜찮습니다

해시태그는 생성하지 마세요. 본문만 작성해주세요.`;
  }

  private async callOpenAI(params: any): Promise<any> {
    const requestBody = {
      model: this.model,
      ...params
    };
    
    console.log('OpenAI API Request:', {
      url: `${this.baseUrl}/chat/completions`,
      model: requestBody.model,
      hasMessages: !!requestBody.messages,
      messageCount: requestBody.messages?.length
    });

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API Error Response:', error);
      throw new Error(`OpenAI API Error: ${error.error?.message || response.statusText}`);
    }

    const result = await response.json();
    console.log('OpenAI API Success');
    return result;
  }

  private getOptimalTokens(length: string, platform?: string): number {
    const baseTokens = {
      short: 150,
      medium: 300,
      long: 500
    };
    
    const platformMultiplier = {
      twitter: 0.5,
      instagram: 1.0,
      facebook: 1.3,
      linkedin: 1.1,
      blog: 2.0
    };
    
    const base = baseTokens[length] || 300;
    const multiplier = platform ? (platformMultiplier[platform] || 1.0) : 1.0;
    
    return Math.floor(base * multiplier);
  }

  private extractObjects(description: string): string[] {
    const commonObjects = [
      '사람', '하늘', '구름', '나무', '꽃', '건물', '도로', '차', 
      '음식', '커피', '책', '컴퓨터', '휴대폰', '가방', '신발',
      '강아지', '고양이', '새', '바다', '산', '호수', '다리'
    ];
    
    return commonObjects.filter(obj => description.includes(obj));
  }

  private detectMood(text: string): string {
    const moodKeywords = {
      happy: ['행복', '즐거', '기쁘', '웃', '신나'],
      peaceful: ['평화', '고요', '차분', '편안', '조용'],
      energetic: ['활기', '에너지', '열정', '활발', '역동'],
      cozy: ['아늑', '따뜻', '포근', '편안'],
      melancholy: ['우울', '쓸쓸', '외로', '그리움'],
      exciting: ['흥분', '설레', '기대', '두근']
    };

    for (const [mood, keywords] of Object.entries(moodKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return mood;
      }
    }

    return 'neutral';
  }
}
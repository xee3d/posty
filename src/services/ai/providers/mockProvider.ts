// Mock Provider for development and testing
import {
  AIProvider,
  GenerateContentParams,
  PolishContentParams,
  AnalyzeImageParams,
  GeneratedContent,
  ImageAnalysis,
  ToneType
} from '../types/ai.types';
import { HashtagStrategy } from '../strategies/hashtagStrategy';
import { EngagementStrategy } from '../strategies/engagementStrategy';

export class MockProvider implements AIProvider {
  private hashtagStrategy: HashtagStrategy;
  private engagementStrategy: EngagementStrategy;

  constructor() {
    this.hashtagStrategy = new HashtagStrategy();
    this.engagementStrategy = new EngagementStrategy();
  }

  async generateContent(params: GenerateContentParams): Promise<GeneratedContent> {
    // 개발 중 빠른 테스트를 위한 딜레이
    await this.simulateDelay(1000);

    const content = this.generateMockContent(params);
    const hashtags = params.hashtags?.length 
      ? params.hashtags 
      : this.hashtagStrategy.generateHashtags(
          content,
          params.platform || 'instagram',
          params.tone,
          params.userProfile
        );

    const estimatedEngagement = this.engagementStrategy.calculateEngagement(
      content,
      params.platform || 'instagram',
      params.userProfile
    );

    return {
      content,
      hashtags,
      platform: params.platform || 'instagram',
      estimatedEngagement,
      metadata: {
        tokensUsed: 0,
        generationTime: 1000,
        strategy: 'mock'
      }
    };
  }

  async polishContent(params: PolishContentParams): Promise<GeneratedContent> {
    await this.simulateDelay(500);

    let polishedContent = params.text;

    switch (params.polishType) {
      case 'spelling':
        // 간단한 맞춤법 교정 시뮬레이션
        polishedContent = polishedContent
          .replace(/됬/g, '됐')
          .replace(/햇/g, '했')
          .replace(/\s{2,}/g, ' ')
          .trim();
        break;

      case 'refine':
        // 문장 다듬기
        polishedContent = polishedContent
          .replace(/근데/g, '그런데')
          .replace(/\.\.\./g, '…')
          .replace(/!{2,}/g, '!')
          .replace(/\?{2,}/g, '?');
        break;

      case 'improve':
        // 개선
        const prefix = ['오늘 ', '방금 ', '드디어 '][Math.floor(Math.random() * 3)];
        const suffix = [' 😊', ' ✨', ' 💕'][Math.floor(Math.random() * 3)];
        polishedContent = prefix + polishedContent + suffix;
        break;
    }

    const hashtags = this.hashtagStrategy.generateHashtags(
      polishedContent,
      params.platform || 'instagram',
      params.tone
    );

    return {
      content: polishedContent,
      hashtags,
      platform: params.platform || 'instagram',
      estimatedEngagement: this.engagementStrategy.calculateEngagement(
        polishedContent,
        params.platform || 'instagram'
      )
    };
  }

  async analyzeImage(params: AnalyzeImageParams): Promise<ImageAnalysis> {
    await this.simulateDelay(1500);

    // Mock 이미지 분석 결과
    const mockAnalyses = [
      {
        description: '카페에서 찍은 따뜻한 라떼 한 잔, 창가 자리의 아늑한 분위기',
        objects: ['커피', '라떼아트', '테이블', '창문', '자연광'],
        mood: 'cozy',
        suggestedContent: [
          '향긋한 커피 한 잔과 함께하는 여유로운 오후 ☕',
          '창가 자리에서 즐기는 나만의 힐링타임',
          '일상 속 작은 행복, 따뜻한 라떼 한 잔에서 시작해요'
        ]
      },
      {
        description: '맑은 하늘 아래 활짝 핀 벚꽃나무',
        objects: ['벚꽃', '나무', '하늘', '꽃잎', '봄'],
        mood: 'peaceful',
        suggestedContent: [
          '봄이 왔음을 알려주는 벚꽃 🌸',
          '잠시 멈춰서서 봄을 만끽하는 중',
          '매년 이맘때면 설레는 마음, 벚꽃 구경'
        ]
      },
      {
        description: '노을이 지는 해변가의 아름다운 풍경',
        objects: ['바다', '노을', '해변', '하늘', '구름'],
        mood: 'peaceful',
        suggestedContent: [
          '하루의 끝, 노을과 함께하는 힐링타임 🌅',
          '바다가 주는 위로, 오늘도 수고했어요',
          '이런 순간이 있어 행복한 하루'
        ]
      }
    ];

    const selected = mockAnalyses[Math.floor(Math.random() * mockAnalyses.length)];
    return selected;
  }

  private generateMockContent(params: GenerateContentParams): string {
    const topic = params.prompt || '일상';
    const templates = this.getTemplatesByTone(params.tone);
    
    let template = templates[Math.floor(Math.random() * templates.length)];
    template = template.replace('{topic}', topic);

    // 길이 조정
    if (params.length === 'short') {
      const sentences = template.split('. ');
      template = sentences.slice(0, 2).join('. ') + '.';
    } else if (params.length === 'long') {
      template += ` ${topic}에 대해 더 이야기하자면, 정말 많은 생각이 드네요. 
      오늘 하루도 ${topic}와 함께 특별했어요. 여러분은 어떻게 생각하시나요?`;
    }

    // 플랫폼별 조정
    if (params.platform === 'twitter' && template.length > 280) {
      template = template.substring(0, 277) + '...';
    }

    return template;
  }

  private getTemplatesByTone(tone: ToneType): string[] {
    const templates: Record<ToneType, string[]> = {
      casual: [
        '{topic} 이야기! 오늘도 평범하지만 특별한 하루였어요 ✨',
        '{topic} 하면서 느낀 소소한 행복... 이런 게 진짜 행복 아닐까요? 😊',
        '요즘 {topic} 생각이 많이 나요. 다들 어떻게 지내시나요?'
      ],
      professional: [
        '{topic}에 대한 전문적인 인사이트를 공유합니다. 함께 성장해요.',
        '오늘 {topic}를 통해 얻은 중요한 교훈을 나눕니다.',
        '{topic}의 핵심은 꾸준함과 전문성입니다. 여러분의 생각은 어떠신가요?'
      ],
      humorous: [
        '{topic}? 그거 먹는 건가요? 😂 농담이고요, 진짜 재밌는 얘기 들려드릴게요!',
        '{topic} 하다가 생긴 웃픈 이야기... 저만 이런가요? ㅋㅋㅋ',
        '나: {topic} 완벽하게 할 수 있어! / 현실: 🤯 / 결과: 그래도 재밌었다!'
      ],
      emotional: [
        '{topic}를 통해 느낀 감동... 가슴이 뭉클해지네요 🥺',
        '{topic}가 주는 따뜻한 위로에 감사한 하루입니다 💗',
        '가끔은 {topic} 같은 작은 것들이 큰 행복을 주는 것 같아요'
      ],
      genz: [
        '{topic} 실화냐? 진짜 대박이었음 ㅋㅋㅋㅋ',
        'ㄹㅇ {topic} 없으면 못 살 듯... 인정하면 댓글 ㄱㄱ',
        '{topic} 찐팬들 모여라~ 우리가 최고야 ㅎㅎ'
      ],
      millennial: [
        '{topic} 하면서 추억 돋네요... 우리 세대만 아는 그 느낌 있잖아요',
        '요즘 {topic} 보면서 예전 생각 많이 나요. 그때가 좋았죠.',
        '{topic}와 함께한 우리의 청춘, 아직 끝나지 않았어요!'
      ],
      minimalist: [
        '{topic}.',
        '오늘, {topic}.',
        '{topic}. 그것으로 충분합니다.'
      ],
      storytelling: [
        '{topic}에 대한 이야기를 들려드릴게요. 그날은 평범한 하루였는데...',
        '제가 {topic}를 처음 만난 건 작년 이맘때였어요. 그때의 설렘이 아직도 생생해요.',
        '{topic} 이야기, 시작합니다. 끝까지 들어주실 거죠?'
      ],
      motivational: [
        '{topic}를 통해 배운 것: 포기하지 않으면 반드시 이룰 수 있다! 💪',
        '오늘도 {topic}와 함께 한 걸음 더 성장했습니다. 여러분도 할 수 있어요!',
        '{topic}가 어렵다고요? 시작이 반입니다. 지금 바로 도전하세요!'
      ]
    };

    return templates[tone] || templates.casual;
  }

  private async simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
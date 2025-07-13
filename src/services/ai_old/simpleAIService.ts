// 간단한 테스트용 AI 서비스
// 실제 API 연동 전 테스트용

class SimpleAIService {
  // 간단한 텍스트 생성 (테스트용)
  async generateContent(params: any) {
    console.log('SimpleAIService: generateContent called with:', params);
    
    // 프롬프트 기반으로 동적 생성
    const topic = params.prompt || '일상';
    const tone = params.tone || 'casual';
    
    // 톤별 템플릿
    const templates = {
      casual: [
        `${topic} 이야기! 정말 특별한 순간이었어요 ✨`,
        `${topic}, 소소하지만 행복한 순간이었어요 😊`,
        `${topic} 하면서 느낀 점... 역시 일상이 최고야! 💕`
      ],
      professional: [
        `${topic}에 대한 전문적인 인사이트를 공유합니다.`,
        `오늘 ${topic}를 통해 얻은 중요한 교훈입니다.`,
        `${topic}의 핵심 포인트를 정리해보았습니다.`
      ],
      humorous: [
        `${topic}? 그거 먹는 건가요? 😂`,
        `${topic} 하다가 생긴 웃픈 이야기 ㅋㅋㅋ`,
        `나: ${topic} 잘할 수 있어! / 현실: 🤯`
      ],
      emotional: [
        `${topic}를 통해 느낀 감동... 가슴이 뭉클해요 🥺`,
        `${topic}가 주는 따뜻한 위로, 감사합니다 💗`,
        `${topic}와 함께라서 행복한 순간들 ✨`
      ]
    };
    
    const selectedTemplates = templates[tone] || templates.casual;
    const content = selectedTemplates[Math.floor(Math.random() * selectedTemplates.length)];
    
    // 길이 조정
    let finalContent = content;
    if (params.length === 'short') {
      finalContent = content.substring(0, 50);
    } else if (params.length === 'long') {
      finalContent = content + ` ${topic}에 대해 더 이야기하자면, 정말 많은 생각이 드네요. 여러분은 어떻게 생각하시나요?`;
    }
    
    // 해시태그 생성
    const hashtags = [
      topic.replace(/\s/g, ''),
      tone === 'casual' ? '일상' : tone === 'professional' ? '인사이트' : tone === 'humorous' ? '유머' : '감성',
      '몰리와함께',
      params.platform || 'instagram'
    ];
    
    // 딜레이 추가 (실제 API 느낌)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      content: finalContent,
      hashtags,
      platform: params.platform || 'instagram',
      usage: {
        promptTokens: 100,
        completionTokens: 50,
        totalTokens: 150,
        estimatedCost: 0
      }
    };
  }
}

export default new SimpleAIService();
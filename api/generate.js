// CORS 헤더 설정
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// 사용량 제한 (메모리 기반 - 프로덕션에서는 Redis 사용 권장)
const rateLimitMap = new Map();

function checkRateLimit(clientId) {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15분
  const maxRequests = 50;
  
  if (!rateLimitMap.has(clientId)) {
    rateLimitMap.set(clientId, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  const limit = rateLimitMap.get(clientId);
  
  if (now > limit.resetTime) {
    limit.count = 1;
    limit.resetTime = now + windowMs;
    return true;
  }
  
  if (limit.count >= maxRequests) {
    return false;
  }
  
  limit.count++;
  return true;
}

export default async function handler(req, res) {
  // 환경 변수 체크 (디버깅용)
  console.log('Environment check:', {
    hasOpenAI: !!process.env.OPENAI_API_KEY,
    hasAppSecret: !!process.env.APP_SECRET,
    nodeEnv: process.env.NODE_ENV
  });
  
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // CORS preflight 요청 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // POST 요청만 허용
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, tone, platform, model, language = 'ko', length = 'medium', image, max_tokens, includeEmojis = true, generatePlatformVersions = false } = req.body;
    
    // 입력 검증
    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    if (prompt.length > 1000) {
      return res.status(400).json({ error: 'Prompt too long (max 1000 characters)' });
    }
    
    // 간단한 인증 (프로덕션에서는 JWT 등 사용)
    const authToken = req.headers.authorization;
    if (!authToken || !authToken.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization required' });
    }
    
    const clientToken = authToken.substring(7);
    if (clientToken !== process.env.APP_SECRET) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    // Rate limiting
    const clientId = req.headers['x-forwarded-for'] || 'anonymous';
    if (!checkRateLimit(clientId)) {
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }
    
    // 시스템 프롬프트 생성 (언어별)
    const lengthGuides = {
      short: { ko: '50자 이내', en: 'under 50 characters' },
      medium: { ko: '100-150자', en: '100-150 characters' },
      long: { ko: '250-300자', en: '250-300 characters' },
      extra: { ko: '500-700자', en: '500-700 characters' }
    };
    
    const emojiGuide = includeEmojis 
      ? (language === 'ko' ? '이모지를 적절히 사용하여 감정을 표현하세요' : 'Use emojis appropriately to express emotions')
      : (language === 'ko' ? '이모지를 사용하지 마세요' : 'Do not use any emojis');
    
    // 플랫폼별 콘텐츠 생성 시 더 명확한 지시사항
    console.log('Generate platform versions:', generatePlatformVersions);
    console.log('Request params:', { prompt, tone, platform, language, length, includeEmojis });

    const systemPrompts = {
      ko: `당신은 창의적인 소셜 미디어 콘텐츠를 만드는 AI 어시스턴트 '포스티'입니다.
    
    현재 설정:
    - 톤: ${tone || 'friendly'}
    - 플랫폼: ${platform || 'general'}
    - 길이: ${lengthGuides[length]?.ko || lengthGuides.medium.ko}
    - 이모지: ${includeEmojis ? '사용' : '사용 안 함'}
    
    가이드라인:
    - 창의적이고 매력적인 콘텐츠를 작성하세요
    - 특정 플랫폼에 맞게 콘텐츠를 조정하세요
    - 적절한 해시태그를 사용하세요
    - 요청된 길이(${lengthGuides[length]?.ko || lengthGuides.medium.ko})에 맞춰 작성하세요
    - 요청된 톤에 완벽하게 맞춰 작성하세요
    - ${emojiGuide}
    ${!generatePlatformVersions ? '- 반드시 한국어로 응답하세요' : ''}
    
    ${generatePlatformVersions ? `

    🚨🚨🚨 매우 중요 🚨🚨🚨
    반드시 다음 형식으로 3가지 버전을 모두 작성해주세요:

    1. Instagram 스타일:
    [여기에 Instagram용 콘텐츠 작성]

    2. Facebook 스타일:
    [여기에 Facebook용 콘텐츠 작성]

    3. Twitter 스타일:
    [여기에 Twitter용 콘텐츠 작성]

    각 플랫폼별 특징:
    - Instagram: 감성적, 스토리텔링, 해시태그 5-7개, 줄바꿈 활용
    - Facebook: 친근한 대화체, 개인적 경험, 한 문단으로 자연스럽게
    - Twitter: 280자 이내, 간결하고 위트있게, 해시태그 1-2개

    🔥 절대로 하나의 통합된 글만 쓰지 마세요. 반드시 3개의 서로 다른 글을 작성해주세요!` : ''}`,
      
      en: `You are Posty, a creative AI assistant specialized in creating engaging social media content.
    
    Current settings:
    - Tone: ${tone || 'friendly'}
    - Platform: ${platform || 'general'}
    - Length: ${lengthGuides[length]?.en || lengthGuides.medium.en}
    - Emojis: ${includeEmojis ? 'Enabled' : 'Disabled'}
    
    Guidelines:
    - Be creative and engaging
    - Adapt content for the specific platform
    - Use appropriate hashtags when relevant
    - Keep content to the requested length (${lengthGuides[length]?.en || lengthGuides.medium.en})
    - Match the requested tone perfectly
    - ${emojiGuide}
    ${!generatePlatformVersions ? '- Always respond in English' : ''}
    
    ${generatePlatformVersions ? `
    CRITICAL: You must respond ONLY in valid JSON format. No other text allowed.
    
    Create completely different content for each of these 3 platforms:
    
    - Instagram: Short sentences, story format, natural hashtags 5-8
    - Facebook: Single paragraph, conversational, personal experience
    - Twitter: One-liner, witty, meme vibes, 1-2 hashtags, 280 chars max
    
    Each platform must have completely different content and tone.
    
    You must respond with this exact JSON structure:
    {
      "original": "basic English content",
      "platforms": {
        "instagram": "Instagram optimized content",
        "facebook": "Facebook optimized content",
        "twitter": "Twitter optimized content"
      }
    }` : ''}`
    };
    
    const systemPrompt = systemPrompts[language] || systemPrompts.ko;
    
    // 길이에 따른 max_tokens 설정 (플랫폼별 생성시 크게 증가)
    const maxTokensMap = {
      short: generatePlatformVersions ? 600 : 150,
      medium: generatePlatformVersions ? 1000 : 300,
      long: generatePlatformVersions ? 1500 : 600,
      extra: generatePlatformVersions ? 2500 : 1200
    };
    
    // 클라이언트에서 보낸 max_tokens를 우선 사용, 없으면 기본값 사용
    const finalMaxTokens = max_tokens || maxTokensMap[length] || 300;
    
    // 문장 정리/교정 모드 감지 (프롬프트에 특정 키워드가 포함된 경우)
    const isPolishMode = prompt.includes('맞춤법') || prompt.includes('문장') || prompt.includes('다듬') || 
                        prompt.includes('교정') || prompt.includes('개선') || prompt.includes('격식체') ||
                        prompt.includes('쉽게') || prompt.includes('매력적');
    
    // 문장 정리 모드인 경우 원본 길이를 고려하여 max_tokens 증가
    if (isPolishMode) {
      // 원본 텍스트를 추출 (따옴표 사이의 텍스트)
      const textMatch = prompt.match(/"으로|해주세요:\s*"([^"]+)"|'로|해주세요:\s*'([^']+)'/);
      const originalTextLength = textMatch ? (textMatch[1] || textMatch[2] || '').length : prompt.length;
      
      // 원본 길이에 따라 max_tokens 조정 (여유롭게 설정)
      if (originalTextLength > 300) {
        maxTokensMap.short = 500;
        maxTokensMap.medium = 700;
        maxTokensMap.long = 1000;
      } else if (originalTextLength > 150) {
        maxTokensMap.short = 300;
        maxTokensMap.medium = 500;
        maxTokensMap.long = 800;
      } else {
        maxTokensMap.short = 200;
        maxTokensMap.medium = 400;
        maxTokensMap.long = 600;
      }
      
      console.log('Polish mode detected. Original text length:', originalTextLength, 'Max tokens:', maxTokensMap[length]);
    }
    
    // 이미지가 있는 경우 Vision API 사용
    let messages;
    let apiModel = model || 'gpt-4o-mini'; // 기본 모델을 gpt-4o-mini로 변경
    
    if (image) {
      console.log('Image detected, using Vision-capable model');
      console.log('Image data length:', image.length);
      console.log('Image data prefix:', image.substring(0, 100));
      
      // base64 유효성 검사
      const isValidBase64 = /^data:image\/(png|jpeg|jpg|gif);base64,/.test(image);
      if (!isValidBase64 && !image.startsWith('data:')) {
        console.log('Invalid image format, attempting to fix...');
      }
      
      // 이미지 크기 체크 (4MB 제한)
      const imageSizeInBytes = (image.length * 3) / 4;
      const imageSizeInMB = imageSizeInBytes / (1024 * 1024);
      console.log('Estimated image size:', imageSizeInMB.toFixed(2), 'MB');
      
      if (imageSizeInMB > 4) {
        return res.status(400).json({
          success: false,
          error: 'Image too large. Please use an image under 4MB.',
          details: {
            sizeInMB: imageSizeInMB.toFixed(2),
            maxSizeMB: 4
          }
        });
      }
      
      // Vision 모델 사용 - 비용 효율적인 순서로
      const visionModels = ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo'];
      apiModel = visionModels[0]; // 'gpt-4o-mini' 먼저 사용 (비용 절감)
      console.log('Switching to Vision model:', apiModel);
      
      // 이미지 분석용 메시지 구성
      messages = [
        {
          role: 'system',
          content: language === 'ko' 
            ? `당신은 사진을 분석하고 SNS 콘텐츠를 만드는 AI 어시스턴트 '포스티'입니다. 
사진을 자세히 분석하고 다음 정보를 포함하여 설명해주세요:
1. 사진 속 인물 (나이, 표정, 의상 등)
2. 배경과 장소
3. 분위기와 느낌
4. 특별한 요소나 상황

그 후 이 사진에 어울리는 매력적인 SNS 글을 작성해주세요.
톤: ${tone || 'casual'}
길이: ${lengthGuides[length]?.ko || lengthGuides.medium.ko}

중요: 사진과 직접적으로 관련 없는 내용(음식, 보양식, 레시피 등)은 절대 포함하지 마세요. 오직 사진에서 볼 수 있는 것만 설명하세요.`
            : `You are 'Posty', an AI assistant that analyzes photos and creates social media content. 
Analyze the photo in detail and include:
1. People in the photo (age, expressions, clothing)
2. Background and location
3. Mood and atmosphere
4. Special elements or situations

Then create an engaging social media post for this photo.
Tone: ${tone || 'casual'}
Length: ${lengthGuides[length]?.en || lengthGuides.medium.en}

IMPORTANT: Do NOT include any content not directly related to the photo (such as food, recipes, or other unrelated topics). Only describe what can be seen in the photo.`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt || (language === 'ko' 
                ? '이 사진을 분석하고 SNS에 올릴 매력적인 글을 작성해주세요. 사진의 분위기, 배경, 주요 요소들을 포함해서 설명해주세요.'
                : 'Analyze this photo and write an engaging social media post. Include the mood, background, and key elements in the photo.'),
            },
            {
              type: 'image_url',
              image_url: {
                url: image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`,
                detail: 'low', // 'low'로 변경하여 비용 절감 및 성능 향상
              },
            },
          ],
        },
      ];
      
      // Vision API는 max_tokens가 더 필요함
      maxTokensMap.short = 300;
      maxTokensMap.medium = 500;
      maxTokensMap.long = 800;
    } else {
      // 텍스트만 있는 경우 기존 방식
      messages = [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: prompt,
        },
      ];
    }
    
    // OpenAI API 호출
    console.log('Calling OpenAI API with model:', apiModel);
    console.log('Request body:', JSON.stringify({
      model: apiModel,
      messages: messages.map(m => ({ role: m.role, content: m.content?.length > 100 ? m.content.substring(0, 100) + '...' : m.content })),
      max_tokens: finalMaxTokens,
      temperature: generatePlatformVersions ? 0.2 : 0.8,
      ...(generatePlatformVersions && { response_format: { type: "json_object" } })
    }, null, 2));
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: apiModel,
        messages: messages,
        max_tokens: finalMaxTokens,
        temperature: generatePlatformVersions ? 0.7 : 0.8, // Normal temperature for natural writing
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API Error:', errorData);
      
      // Vision 모델이 실패하면 다른 모델 시도
      if (image && errorData.error) {
        console.log('Vision model error:', errorData.error.code, errorData.error.message);
        
        // 다른 Vision 모델 시도
        if (errorData.error.code === 'model_not_found' || errorData.error.code === 'invalid_request_error') {
          console.log('Trying alternative vision model: gpt-4o');
          
          // gpt-4o로 재시도 (더 강력한 모델)
          const retryResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4o',
              messages: messages,
              max_tokens: finalMaxTokens,
              temperature: 0.8,
            }),
          });
          
          if (retryResponse.ok) {
            const retryData = await retryResponse.json();
            let retryContent = retryData.choices[0].message.content;
            let retryParsed = null;
            
            if (generatePlatformVersions) {
              try {
                const jsonMatch = retryContent.match(/```json\s*([\s\S]*?)\s*```/) || 
                                 retryContent.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                  const jsonString = jsonMatch[1] || jsonMatch[0];
                  retryParsed = JSON.parse(jsonString);
                }
              } catch (parseError) {
                console.warn('Retry: Failed to parse JSON, using original');
              }
            }
            
            return res.status(200).json({
              success: true,
              content: retryParsed?.original || retryContent,
              contentLength: (retryParsed?.original || retryContent).length,
              usage: retryData.usage,
              platforms: retryParsed?.platforms || null,
              metadata: {
                tone,
                platform,
                includeEmojis,
                generatePlatformVersions,
                timestamp: new Date().toISOString(),
                model: retryData.model,
              },
            });
          }
        }
        
        // 그래도 안 되면 텍스트 모델로 폴백
        console.log('All vision models failed, falling back to text model');
        
        // 텍스트 기반 이미지 설명으로 대체
        const imageContext = language === 'ko' 
          ? '사진에 담긴 특별한 순간을 SNS에 공유하려고 합니다.' 
          : 'Sharing a special moment captured in this photo.';
        
        messages = [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: prompt || `${imageContext} 사진 분위기에 어울리는 매력적인 SNS 글을 작성해주세요.`,
          },
        ];
        
        // 텍스트 모델로 재시도
        const fallbackResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: model || 'gpt-4o-mini', // 기본 모델 사용
            messages: messages,
            max_tokens: finalMaxTokens,
            temperature: 0.8,
            presence_penalty: 0.1,
            frequency_penalty: 0.1,
          }),
        });
        
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          let fallbackContent = fallbackData.choices[0].message.content;
          let fallbackParsed = null;
          
          if (generatePlatformVersions) {
            try {
              const jsonMatch = fallbackContent.match(/```json\s*([\s\S]*?)\s*```/) || 
                               fallbackContent.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                const jsonString = jsonMatch[1] || jsonMatch[0];
                fallbackParsed = JSON.parse(jsonString);
              }
            } catch (parseError) {
              console.warn('Fallback: Failed to parse JSON, using original');
            }
          }
          
          return res.status(200).json({
            success: true,
            content: fallbackParsed?.original || fallbackContent,
            contentLength: (fallbackParsed?.original || fallbackContent).length,
            usage: fallbackData.usage,
            platforms: fallbackParsed?.platforms || null,
            metadata: {
              tone,
              platform,
              includeEmojis,
              generatePlatformVersions,
              timestamp: new Date().toISOString(),
              model: fallbackData.model,
              fallback: true,
            },
          });
        }
      }
      
      if (response.status === 429) {
        return res.status(429).json({
          success: false,
          error: 'OpenAI API rate limit exceeded. Please try again later.',
        });
      }
      
      if (response.status === 401) {
        return res.status(500).json({
          success: false,
          error: 'Server configuration error. Please contact support.',
        });
      }
      
      throw new Error(`OpenAI API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    console.log('OpenAI response:', JSON.stringify(data, null, 2));
    
    let responseContent = data.choices[0].message.content;
    let parsedContent = null;
    
    // 플랫폼별 콘텐츠 요청인 경우 자연어 응답에서 플랫폼별 내용 추출
    if (generatePlatformVersions) {
      console.log('Processing platform-specific content...');
      console.log('Raw response content:', responseContent);
      
      try {
        // 자연어 응답에서 플랫폼별 내용 추출
        const platforms = {};
        let original = responseContent;
        
        // Instagram 스타일 추출 (1. Instagram으로 시작하는 부분)
        const instagramMatch = responseContent.match(/1\.\s*Instagram[^:]*:?\s*([\s\S]*?)(?=2\.|$)/i);
        if (instagramMatch) {
          platforms.instagram = instagramMatch[1].trim();
        }
        
        // Facebook 스타일 추출 (2. Facebook으로 시작하는 부분)
        const facebookMatch = responseContent.match(/2\.\s*Facebook[^:]*:?\s*([\s\S]*?)(?=3\.|$)/i);
        if (facebookMatch) {
          platforms.facebook = facebookMatch[1].trim();
        }
        
        // Twitter 스타일 추출 (3. Twitter로 시작하는 부분)
        const twitterMatch = responseContent.match(/3\.\s*Twitter[^:]*:?\s*([\s\S]*?)$/i);
        if (twitterMatch) {
          platforms.twitter = twitterMatch[1].trim();
        }
        
        // 첫 번째 스타일을 원본으로 사용
        if (platforms.instagram) {
          original = platforms.instagram;
        }
        
        console.log('Extracted platforms:', {
          hasInstagram: !!platforms.instagram,
          hasFacebook: !!platforms.facebook,
          hasTwitter: !!platforms.twitter,
          platformKeys: Object.keys(platforms)
        });
        
        if (Object.keys(platforms).length > 0) {
          parsedContent = {
            original: original,
            platforms: platforms
          };
        }
      } catch (parseError) {
        console.warn('Failed to parse platform content:', parseError.message);
        parsedContent = null;
      }
    }
    
    // 성공 응답
    return res.status(200).json({
      success: true,
      content: parsedContent?.original || responseContent,
      contentLength: (parsedContent?.original || responseContent).length,
      usage: data.usage,
      platforms: parsedContent?.platforms || null,
      metadata: {
        tone,
        platform,
        includeEmojis,
        generatePlatformVersions,
        timestamp: new Date().toISOString(),
        model: data.model,
      },
    });
    
  } catch (error) {
    console.error('API Error:', error.message);
    
    // 일반 에러
    return res.status(500).json({
      success: false,
      error: 'Failed to generate content',
      message: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'An unexpected error occurred',
    });
  }
}

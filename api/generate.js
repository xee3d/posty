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
    const { prompt, tone, platform, model, language = 'ko', length = 'medium', image, max_tokens, includeEmojis = true, generatePlatformVersions = true } = req.body;
    
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
    - 반드시 한국어로 응답하세요
    
    ${generatePlatformVersions ? `
    ** 중요: 반드시 JSON 형식으로만 응답하세요 **
    
    각 플랫폼별로 최적화된 버전을 생성하세요:
    - Instagram: 감성적이고 시각적인 스토리텔링, 해시태그 많이 사용
    - Facebook: 대화형이고 친근한 톤, 스토리 기반
    - Twitter: 간결하고 임팩트 있는 표현, 280자 제한 고려
    - LinkedIn: 전문적이고 인사이트가 있는 내용
    - TikTok: 트렌디하고 젊은 감성, 짧고 강렬한 표현
    
    다음 JSON 형식으로만 응답하세요. 다른 설명이나 텍스트는 절대 포함하지 마세요:
    {
      "original": "여기에 기본 콘텐츠 작성",
      "platforms": {
        "instagram": "인스타그램용 최적화 콘텐츠",
        "facebook": "페이스북용 최적화 콘텐츠", 
        "twitter": "트위터용 최적화 콘텐츠",
        "linkedin": "링크드인용 최적화 콘텐츠",
        "tiktok": "틱톡용 최적화 콘텐츠"
      }
    }
    
    반드시 이 JSON 형식을 정확히 따라주세요.` : ''}`,
      
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
    - Always respond in English
    
    ${generatePlatformVersions ? `
    ** IMPORTANT: Respond ONLY in JSON format **
    
    Create optimized versions for each platform:
    - Instagram: Emotional and visual storytelling, many hashtags
    - Facebook: Conversational and friendly tone, story-based
    - Twitter: Concise and impactful expression, consider 280 character limit
    - LinkedIn: Professional and insightful content
    - TikTok: Trendy and youthful vibe, short and powerful expression
    
    Respond with this exact JSON format only. Do not include any other text or explanations:
    {
      "original": "write basic content here",
      "platforms": {
        "instagram": "Instagram optimized content",
        "facebook": "Facebook optimized content", 
        "twitter": "Twitter optimized content",
        "linkedin": "LinkedIn optimized content",
        "tiktok": "TikTok optimized content"
      }
    }
    
    You must follow this JSON format exactly.` : ''}`
    };
    
    const systemPrompt = systemPrompts[language] || systemPrompts.ko;
    
    // 길이에 따른 max_tokens 설정
    const maxTokensMap = {
      short: 150,
      medium: 300,
      long: 600,
      extra: 1200
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
        temperature: generatePlatformVersions ? 0.3 : 0.8, // Lower temperature for JSON consistency
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
    
    // JSON 응답인지 확인 (플랫폼별 최적화가 요청된 경우)
    if (generatePlatformVersions) {
      console.log('Processing platform-specific content...');
      console.log('Raw response content:', responseContent);
      
      try {
        // 다양한 JSON 추출 방법 시도
        let jsonString = null;
        
        // 1. 마크다운 코드 블록에서 추출
        const markdownMatch = responseContent.match(/```json\s*([\s\S]*?)\s*```/);
        if (markdownMatch) {
          jsonString = markdownMatch[1];
          console.log('Found JSON in markdown block');
        }
        
        // 2. 중괄호 블록에서 추출
        if (!jsonString) {
          const braceMatch = responseContent.match(/\{[\s\S]*\}/);
          if (braceMatch) {
            jsonString = braceMatch[0];
            console.log('Found JSON in brace block');
          }
        }
        
        // 3. 전체 응답이 JSON인지 확인
        if (!jsonString && responseContent.trim().startsWith('{')) {
          jsonString = responseContent.trim();
          console.log('Entire response is JSON');
        }
        
        if (jsonString) {
          // JSON 문자열 정리 (불필요한 문자 제거)
          jsonString = jsonString.trim();
          
          parsedContent = JSON.parse(jsonString);
          console.log('Successfully parsed platform-specific content:', {
            hasOriginal: !!parsedContent.original,
            hasPlatforms: !!parsedContent.platforms,
            platformKeys: parsedContent.platforms ? Object.keys(parsedContent.platforms) : []
          });
          
          // 필수 필드 검증
          if (!parsedContent.original || !parsedContent.platforms) {
            console.warn('Invalid JSON structure - missing original or platforms');
            parsedContent = null;
          }
        } else {
          console.warn('No valid JSON found in response');
        }
      } catch (parseError) {
        console.warn('Failed to parse JSON response:', parseError.message);
        console.warn('JSON string that failed:', jsonString);
        // JSON 파싱 실패시 원본 텍스트 사용
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

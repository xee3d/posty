import { OpenAI } from "openai";

// Rate limiting
const rateLimitMap = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 10; // 10 requests per minute

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 0, resetTime: now + windowMs });
  }

  const limit = rateLimitMap.get(ip);

  if (now > limit.resetTime) {
    limit.count = 0;
    limit.resetTime = now + windowMs;
  }

  if (limit.count >= maxRequests) {
    return false;
  }

  limit.count++;
  return true;
}

export default async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Rate limiting
  const clientIP = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  if (!checkRateLimit(clientIP)) {
    return res.status(429).json({ error: "Too many requests" });
  }

  // 인증 확인
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.substring(7);
  if (token !== process.env.APP_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const {
      prompt,
      tone = "casual",
      platform = "instagram",
      includeEmojis = true,
      generatePlatformVersions = false,
      language = "ko",
      length = "medium",
      model = "gpt-4o-mini",
      image,
    } = req.body;

    if (!prompt && !image) {
      return res.status(400).json({ error: "Prompt or image is required" });
    }

    // 토큰 수 계산 (한국어는 더 많은 토큰 필요)
    const lengthTokens = {
      short: 150,
      medium: 300,
      long: 500,
    };

    const finalMaxTokens = lengthTokens[length] || 300;

    // 시스템 메시지 구성
    const systemMessage = `당신은 전문적인 SNS 콘텐츠 크리에이터입니다. 
주어진 주제에 대해 ${platform}에 적합한 ${tone}한 톤의 콘텐츠를 작성해주세요.
${includeEmojis ? "적절한 이모지를 포함해주세요." : "이모지는 사용하지 마세요."}
길이: ${length} (${finalMaxTokens}토큰 이내)
언어: ${language}`;

    const messages = [
      { role: "system", content: systemMessage },
      { role: "user", content: prompt },
    ];

    // AI 모델에 따른 API 호출 분기
    let responseContent;
    let usageData = null;
    let actualModel = model;

    // 이미지 분석은 항상 GPT 사용 (Gemini는 이미지 분석 미지원)
    const hasImage = !!image;
    const useGemini = (model.startsWith('gemini') || model.includes('gemini')) && !hasImage;

    if (useGemini) {
      // Gemini API 호출
      console.log("Calling Gemini API with model:", model);

      const geminiPrompt = `${systemMessage}\n\nUser: ${prompt}`;

      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: geminiPrompt,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: generatePlatformVersions ? 0.5 : 0.8,
              maxOutputTokens: finalMaxTokens,
            },
          }),
        }
      );

      if (!geminiResponse.ok) {
        const errorText = await geminiResponse.text();
        console.error("Gemini API Error:", errorText);
        throw new Error(`Gemini API error: ${geminiResponse.status}`);
      }

      const geminiData = await geminiResponse.json();
      responseContent = geminiData.candidates[0].content.parts[0].text;
      usageData = {
        promptTokens: geminiData.usageMetadata?.promptTokenCount || 0,
        completionTokens: geminiData.usageMetadata?.candidatesTokenCount || 0,
        totalTokens: geminiData.usageMetadata?.totalTokenCount || 0,
      };
    } else {
      // OpenAI API 호출
      console.log("Calling OpenAI API with model:", model);

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: model,
          messages: messages,
          max_tokens: finalMaxTokens,
          temperature: generatePlatformVersions ? 0.5 : 0.8,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("OpenAI API Error:", errorText);
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      responseContent = data.choices[0].message.content;
      usageData = data.usage;
      actualModel = data.model;
    }

    // 플랫폼별 버전 생성
    let platforms = null;
    if (generatePlatformVersions) {
      const platformPrompts = {
        instagram: "인스타그램에 적합한 스타일로 다시 작성해주세요.",
        facebook: "페이스북에 적합한 스타일로 다시 작성해주세요.",
        twitter: "트위터에 적합한 스타일로 다시 작성해주세요.",
        linkedin: "링크드인에 적합한 전문적인 스타일로 다시 작성해주세요.",
      };

      platforms = {};
      for (const [platformName, platformPrompt] of Object.entries(platformPrompts)) {
        if (platformName === platform) continue;

        const platformMessages = [
          { role: "system", content: systemMessage },
          { role: "user", content: `${prompt}\n\n${platformPrompt}` },
        ];

        const platformResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: platformMessages,
            max_tokens: finalMaxTokens,
            temperature: 0.5,
          }),
        });

        if (platformResponse.ok) {
          const platformData = await platformResponse.json();
          platforms[platformName] = platformData.choices[0].message.content;
        }
      }
    }

    return res.status(200).json({
      success: true,
      content: responseContent,
      contentLength: responseContent.length,
      usage: usageData,
      platforms,
      metadata: {
        tone,
        platform,
        includeEmojis,
        generatePlatformVersions,
        timestamp: new Date().toISOString(),
        model: actualModel,
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to generate content",
      message: "An unexpected error occurred",
    });
  }
}
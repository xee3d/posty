# 🚀 Posty 앱 서버 구축 가이드

## 📋 서버가 필요한 이유

### 현재 문제점

1. **API 키 노출**: 클라이언트에 API 키가 하드코딩됨
2. **사용량 제어 불가**: 사용자별 API 사용량 추적 불가
3. **보안 취약**: 악의적 사용자가 API 키 탈취 가능
4. **업데이트 제한**: API 키 변경 시 앱 업데이트 필요

## 🏗️ 서버 아키텍처

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Posty     │────▶│   서버      │────▶│  OpenAI     │
│   앱        │◀────│  (Proxy)    │◀────│   API       │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  Database   │
                    │  (사용량)   │
                    └─────────────┘
```

## 🛠️ 서버 구축 옵션

### 옵션 1: Vercel (무료, 추천) ⭐

```javascript
// /api/generate.js
export default async function handler(req, res) {
  // API 키는 환경 변수에서
  const openaiApiKey = process.env.OPENAI_API_KEY;

  // 사용자 인증 확인
  const { userId, prompt, tone } = req.body;

  // OpenAI API 호출
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openaiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await response.json();
  res.status(200).json(data);
}
```

**장점**: 무료, 자동 확장, 간단한 배포
**단점**: 콜드 스타트, 실행 시간 제한

### 옵션 2: AWS Lambda (저렴)

```javascript
// handler.js
const AWS = require("aws-sdk");
const axios = require("axios");

exports.generateContent = async (event) => {
  const { prompt, tone } = JSON.parse(event.body);

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    return {
      statusCode: 200,
      body: JSON.stringify(response.data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
```

**장점**: 저렴, 자동 확장, AWS 생태계
**단점**: 설정 복잡, 콜드 스타트

### 옵션 3: Node.js Express (전통적)

```javascript
// server.js
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();

// 미들웨어
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // 최대 100 요청
});

app.use("/api/", limiter);

// API 엔드포인트
app.post("/api/generate", async (req, res) => {
  try {
    const { prompt, tone, platform } = req.body;

    // 사용자 인증 확인
    const authToken = req.headers.authorization;
    if (!authToken) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // OpenAI API 호출
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a social media content creator.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    const data = await response.json();

    // 사용량 기록
    await logUsage(authToken, prompt.length);

    res.json(data);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

**장점**: 완전한 제어, 유연성
**단점**: 서버 관리 필요, 비용

## 📝 Vercel 배포 단계별 가이드

### 1. 프로젝트 생성

```bash
mkdir posty-server
cd posty-server
npm init -y
npm install axios dotenv
```

### 2. API 라우트 생성

```javascript
// /api/generate.js
import axios from "axios";

// CORS 헤더 설정
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export default async function handler(req, res) {
  // OPTIONS 요청 처리 (CORS)
  if (req.method === "OPTIONS") {
    res.status(200).setHeaders(corsHeaders).end();
    return;
  }

  // POST 요청만 허용
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { prompt, tone, platform } = req.body;

    // 입력 검증
    if (!prompt) {
      res.status(400).json({ error: "Prompt is required" });
      return;
    }

    // 사용자 인증 (간단한 토큰 체크)
    const authToken = req.headers.authorization;
    if (!authToken || authToken !== `Bearer ${process.env.APP_SECRET}`) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    // OpenAI API 호출
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a creative social media content writer. 
                     Tone: ${tone || "friendly"}. 
                     Platform: ${platform || "general"}.`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    // 응답 전송
    res.status(200).setHeaders(corsHeaders).json({
      success: true,
      data: response.data.choices[0].message.content,
      usage: response.data.usage,
    });
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);

    res
      .status(500)
      .setHeaders(corsHeaders)
      .json({
        success: false,
        error: "Failed to generate content",
        message: error.response?.data?.error?.message || error.message,
      });
  }
}
```

### 3. 환경 변수 설정

```bash
# .env.local
OPENAI_API_KEY=sk-...
APP_SECRET=your-secret-key
```

### 4. vercel.json 설정

```json
{
  "functions": {
    "api/generate.js": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET,POST,OPTIONS" },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type,Authorization"
        }
      ]
    }
  ]
}
```

### 5. 배포

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel

# 환경 변수 설정
vercel env add OPENAI_API_KEY
vercel env add APP_SECRET
```

## 📱 앱에서 서버 연동

### aiService.ts 수정

```typescript
// src/services/aiService.ts
const API_BASE_URL = "https://your-app.vercel.app/api";
const APP_SECRET = "your-secret-key"; // 실제로는 환경 변수 사용

class AIService {
  async generateContent(prompt: string, tone: string, platform?: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${APP_SECRET}`,
        },
        body: JSON.stringify({
          prompt,
          tone,
          platform,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate content");
      }

      return data.data;
    } catch (error) {
      console.error("AI Service Error:", error);
      throw error;
    }
  }
}

export default new AIService();
```

## 🔒 보안 강화

### 1. 사용자 인증

```javascript
// Firebase Auth 연동
import { getAuth } from "firebase/auth";

const auth = getAuth();
const user = auth.currentUser;
const idToken = await user.getIdToken();

// 서버에서 토큰 검증
const decodedToken = await admin.auth().verifyIdToken(idToken);
```

### 2. Rate Limiting

```javascript
// 사용자별 제한
const userLimits = new Map();

function checkRateLimit(userId) {
  const limit = userLimits.get(userId) || {
    count: 0,
    resetTime: Date.now() + 3600000,
  };

  if (Date.now() > limit.resetTime) {
    limit.count = 0;
    limit.resetTime = Date.now() + 3600000;
  }

  if (limit.count >= 100) {
    throw new Error("Rate limit exceeded");
  }

  limit.count++;
  userLimits.set(userId, limit);
}
```

### 3. 사용량 추적

```javascript
// PostgreSQL/Supabase 연동
const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function logUsage(userId, tokens) {
  await supabase.from("usage_logs").insert({
    user_id: userId,
    tokens_used: tokens,
    timestamp: new Date(),
  });
}
```

## 💰 비용 예측

### Vercel (무료 플랜)

- **서버**: $0/월
- **제한**: 100GB 대역폭, 100시간 실행 시간
- **적합**: 월 활성 사용자 1,000명 이하

### AWS Lambda

- **서버**: ~$5-20/월 (사용량 기반)
- **DB**: RDS ~$15/월 또는 DynamoDB ~$5/월
- **적합**: 확장 가능한 서비스

### 전용 서버

- **VPS**: $5-20/월 (DigitalOcean, Linode)
- **관리**: 직접 관리 필요
- **적합**: 완전한 제어 필요 시

## 🚀 추천 아키텍처

### MVP (최소 기능 제품)

1. **Vercel 무료 플랜** - API 프록시
2. **Supabase 무료 플랜** - 사용자 인증 & DB
3. **환경 변수** - API 키 보호

### 성장 단계

1. **Vercel Pro** - 더 많은 리소스
2. **Redis** - 캐싱 & Rate limiting
3. **PostgreSQL** - 사용량 추적

### 엔터프라이즈

1. **AWS/GCP** - 완전한 인프라
2. **Kubernetes** - 자동 확장
3. **모니터링** - DataDog, New Relic

## 📝 체크리스트

- [ ] Vercel 계정 생성
- [ ] 서버 프로젝트 생성
- [ ] API 엔드포인트 구현
- [ ] 환경 변수 설정
- [ ] CORS 설정
- [ ] 앱에서 서버 URL 변경
- [ ] 테스트
- [ ] 모니터링 설정

---

**시작하기 가장 좋은 옵션은 Vercel 무료 플랜입니다!**

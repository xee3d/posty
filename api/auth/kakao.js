import crypto from "crypto";

const JWT_SECRET =
  process.env.JWT_SECRET ||
  (process.env.NODE_ENV === "production"
    ? (() => {
        console.error(
          "🚨 JWT_SECRET 환경변수가 프로덕션에서 설정되지 않았습니다!"
        );
        throw new Error("Missing required environment variable: JWT_SECRET");
      })()
    : "dev-jwt-secret-kakao-2025");
const KAKAO_APP_KEY = process.env.KAKAO_APP_KEY;

// JWT 토큰 생성 함수
function generateJWT(payload) {
  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString(
    "base64url"
  );
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
    "base64url"
  );

  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64url");

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export default async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // OPTIONS 요청 처리
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({ error: "Access token is required" });
    }

    // 카카오 API로 사용자 정보 검증
    const response = await fetch("https://kapi.kakao.com/v2/user/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
      },
    });

    if (!response.ok) {
      return res.status(401).json({ error: "Invalid access token" });
    }

    const kakaoUser = await response.json();

    // JWT 페이로드 생성
    const payload = {
      uid: `kakao_${kakaoUser.id}`,
      email: kakaoUser.kakao_account?.email || null,
      displayName: kakaoUser.kakao_account?.profile?.nickname || null,
      photoURL: kakaoUser.kakao_account?.profile?.profile_image_url || null,
      provider: "kakao",
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24시간
    };

    // JWT 토큰 생성
    const jwt = generateJWT(payload);

    res.status(200).json({
      success: true,
      user: {
        uid: payload.uid,
        email: payload.email,
        displayName: payload.displayName,
        photoURL: payload.photoURL,
        provider: payload.provider,
      },
      token: jwt,
      expiresIn: 86400, // 24시간 (초)
    });
  } catch (error) {
    console.error("Kakao auth error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
}

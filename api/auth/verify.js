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
    : "dev-jwt-secret-verify-2025");

// JWT 토큰 검증 함수
function verifyJWT(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("Invalid JWT format");
    }

    const [header, payload, signature] = parts;

    // 서명 검증
    const expectedSignature = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(`${header}.${payload}`)
      .digest("base64url");

    if (signature !== expectedSignature) {
      throw new Error("Invalid signature");
    }

    // 페이로드 디코드
    const decodedPayload = JSON.parse(
      Buffer.from(payload, "base64url").toString()
    );

    // 만료 시간 검증
    const now = Math.floor(Date.now() / 1000);
    if (decodedPayload.exp && decodedPayload.exp < now) {
      throw new Error("Token expired");
    }

    return decodedPayload;
  } catch (error) {
    throw new Error(`JWT verification failed: ${error.message}`);
  }
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
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "Missing or invalid Authorization header" });
    }

    const token = authHeader.substring(7); // "Bearer " 제거

    // JWT 토큰 검증
    const payload = verifyJWT(token);

    res.status(200).json({
      success: true,
      valid: true,
      user: {
        uid: payload.uid,
        email: payload.email,
        displayName: payload.displayName,
        photoURL: payload.photoURL,
        provider: payload.provider,
      },
      iat: payload.iat,
      exp: payload.exp,
    });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({
      success: false,
      valid: false,
      error: "Invalid token",
      message: error.message,
    });
  }
}

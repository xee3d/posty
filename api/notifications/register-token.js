/**
 * 📱 FCM 토큰 등록 API
 * Vercel Serverless Functions + Vercel KV
 */

import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  // CORS 설정
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "메소드가 허용되지 않습니다" });
  }

  try {
    const { token, userId, deviceInfo } = req.body;

    if (!token) {
      return res.status(400).json({
        error: "FCM 토큰이 필요합니다",
        success: false,
      });
    }

    // Vercel KV에 토큰 저장
    const tokenData = {
      fcmToken: token,
      userId: userId || null,
      deviceInfo: deviceInfo || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      notifications: {
        mission: false, // 일일 미션 알림 (비활성화)
        trend: false, // 트렌드 업데이트 (비활성화)
        achievement: false, // 업적 달성 (비활성화)
        tip: false, // 맞춤 팁 (비활성화)
        marketing: false, // 마케팅 알림 (비활성화)
      },
    };

    // KV에서 기존 토큰 확인
    const existingToken = await kv.get(`fcm_token:${token}`);

    if (existingToken) {
      // 기존 토큰 업데이트
      await kv.set(`fcm_token:${token}`, {
        ...tokenData,
        updatedAt: new Date().toISOString(),
      });
      console.log(`📱 Token updated: ${token.substring(0, 20)}...`);
    } else {
      // 새 토큰 등록
      await kv.set(`fcm_token:${token}`, tokenData);

      // 전체 토큰 목록에 추가
      await kv.sadd("all_fcm_tokens", token);
      console.log(`📱 New token registered: ${token.substring(0, 20)}...`);
    }

    // 유저별 토큰 관리 (userId가 있는 경우)
    if (userId) {
      await kv.set(`user:${userId}`, {
        fcmTokens: [token],
        lastActive: new Date().toISOString(),
        notificationSettings: tokenData.notifications,
      });

      // 유저별 토큰 매핑
      await kv.sadd(`user_tokens:${userId}`, token);
    }

    res.status(200).json({
      success: true,
      message: "토큰이 성공적으로 등록되었습니다",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("📱 Token registration error:", error);
    res.status(500).json({
      success: false,
      error: "토큰 등록 중 오류가 발생했습니다",
      details: error.message,
    });
  }
}

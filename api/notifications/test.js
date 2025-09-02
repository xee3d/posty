/**
 * 🧪 푸시 알림 서버 API 테스트 엔드포인트
 * 개발/테스트 전용
 */

import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  // CORS 설정
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,POST");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    const { action } = req.query;

    switch (action) {
      case "register-test-token":
        // 테스트 토큰 등록
        const testToken = "test_token_" + Date.now();
        await kv.set(`fcm_token:${testToken}`, {
          fcmToken: testToken,
          userId: "test_user",
          deviceInfo: { platform: "test", version: "1.0.0" },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isActive: true,
          notifications: {
            mission: true,
            trend: true,
            achievement: true,
            tip: true,
            marketing: true,
          },
        });

        await kv.sadd("all_fcm_tokens", testToken);

        res.status(200).json({
          success: true,
          message: "테스트 토큰이 등록되었습니다",
          testToken,
          timestamp: new Date().toISOString(),
        });
        break;

      case "send-test":
        // 테스트 알림 발송
        const {
          title = "🧪 테스트 알림",
          body = "포스티 테스트 메시지입니다!",
        } = req.query;

        const sendResponse = await fetch(
          `${
            req.headers.host
              ? `https://${req.headers.host}`
              : "http://localhost:3000"
          }/api/notifications/send`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title,
              body,
              data: { type: "mission", action: "test" },
              target: "all",
              notificationType: "test",
            }),
          }
        );

        const sendResult = await sendResponse.json();

        res.status(200).json({
          success: true,
          message: "테스트 알림이 발송되었습니다",
          result: sendResult,
          timestamp: new Date().toISOString(),
        });
        break;

      case "check-tokens":
        // 등록된 토큰 확인
        const allTokens = await kv.smembers("all_fcm_tokens");
        const tokenDetails = [];

        for (const token of allTokens.slice(0, 10)) {
          // 최대 10개만
          const details = await kv.get(`fcm_token:${token}`);
          if (details) {
            tokenDetails.push({
              token: token.substring(0, 20) + "...",
              createdAt: details.createdAt,
              userId: details.userId,
              platform: details.deviceInfo?.platform,
            });
          }
        }

        res.status(200).json({
          success: true,
          totalTokens: allTokens.length,
          sampleTokens: tokenDetails,
          timestamp: new Date().toISOString(),
        });
        break;

      case "check-logs":
        // 최근 알림 로그 확인
        const logs = await kv.lrange("notification_logs", 0, 4); // 최근 5개
        const errors = await kv.lrange("notification_errors", 0, 4); // 최근 5개 에러

        const parsedLogs = logs.map((log) => {
          try {
            return JSON.parse(log);
          } catch (e) {
            return { error: "Failed to parse log", raw: log };
          }
        });

        const parsedErrors = errors.map((error) => {
          try {
            return JSON.parse(error);
          } catch (e) {
            return { error: "Failed to parse error", raw: error };
          }
        });

        res.status(200).json({
          success: true,
          recentLogs: parsedLogs,
          recentErrors: parsedErrors,
          timestamp: new Date().toISOString(),
        });
        break;

      case "schedule-test":
        // 스케줄 테스트 (수동 실행)
        const scheduleResponse = await fetch(
          `${
            req.headers.host
              ? `https://${req.headers.host}`
              : "http://localhost:3000"
          }/api/notifications/schedule?type=daily`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${
                process.env.CRON_SECRET || "test_secret"
              }`,
            },
          }
        );

        const scheduleResult = await scheduleResponse.json();

        res.status(200).json({
          success: true,
          message: "스케줄 테스트가 실행되었습니다",
          result: scheduleResult,
          timestamp: new Date().toISOString(),
        });
        break;

      default:
        res.status(200).json({
          success: true,
          message: "푸시 알림 테스트 API",
          availableActions: [
            "register-test-token - 테스트 토큰 등록",
            "send-test - 테스트 알림 발송",
            "check-tokens - 등록된 토큰 확인",
            "check-logs - 최근 알림 로그 확인",
            "schedule-test - 스케줄 테스트 실행",
          ],
          usage: "/api/notifications/test?action=ACTION_NAME",
          timestamp: new Date().toISOString(),
        });
    }
  } catch (error) {
    console.error("🧪 Test API error:", error);
    res.status(500).json({
      success: false,
      error: "테스트 API 오류가 발생했습니다",
      details: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * 📅 스케줄된 푸시 알림 API
 * Vercel Cron Jobs과 연동
 */

import { kv } from "@vercel/kv";

// 포스티 알림 메시지 템플릿
const NOTIFICATION_TEMPLATES = {
  daily_mission: {
    title: "🌟 새로운 미션이 도착했어요!",
    body: "포스티와 함께 오늘의 창의적인 콘텐츠를 만들어보세요.",
    data: { type: "mission", action: "open_mission" },
  },

  trend_update: {
    title: "📈 실시간 트렌드 업데이트",
    body: "지금 뜨고 있는 키워드로 콘텐츠를 만들어보세요!",
    data: { type: "trend", action: "open_trends" },
  },

  weekly_summary: {
    title: "📊 이번 주 활동 요약",
    body: "이번 주 얼마나 많은 창작물을 만드셨는지 확인해보세요!",
    data: { type: "achievement", action: "open_stats" },
  },

  inactive_user: {
    title: "💡 포스티가 기다리고 있어요!",
    body: "오늘 하루 어떤 이야기를 들려주실까요?",
    data: { type: "mission", action: "open_write" },
  },

  personalized_tip: {
    title: "🎯 포스티의 맞춤 아이디어",
    body: "당신의 스타일에 맞는 새로운 콘텐츠 아이디어가 준비되었어요!",
    data: { type: "tip", action: "open_tips" },
  },

  achievement_unlock: {
    title: "🏆 새로운 업적 달성!",
    body: "축하합니다! 포스티가 새로운 뱃지를 준비했어요.",
    data: { type: "achievement", action: "open_achievements" },
  },
};

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

  // Vercel Cron Jobs에서만 호출 허용
  const cronSecret = req.headers.authorization;
  if (cronSecret !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "권한이 없습니다" });
  }

  try {
    const { type, time } = req.query;

    let notificationsToSend = [];
    const currentHour = new Date().getHours();
    const currentDay = new Date().getDay(); // 0 = 일요일

    // 스케줄 타입별 알림 처리
    switch (type) {
      case "daily":
        // 매일 오전 9시 - 일일 미션
        if (currentHour === 9) {
          notificationsToSend.push({
            ...NOTIFICATION_TEMPLATES.daily_mission,
            target: "all",
            notificationType: "daily_mission",
          });
        }

        // 매일 오후 6시 - 트렌드 업데이트
        if (currentHour === 18) {
          notificationsToSend.push({
            ...NOTIFICATION_TEMPLATES.trend_update,
            target: "all",
            notificationType: "trend_update",
          });
        }
        break;

      case "weekly":
        // 일요일 오후 8시 - 주간 요약
        if (currentDay === 0 && currentHour === 20) {
          notificationsToSend.push({
            ...NOTIFICATION_TEMPLATES.weekly_summary,
            target: "all",
            notificationType: "weekly_summary",
          });
        }
        break;

      case "smart":
        // 스마트 개인화 알림 처리
        await processSmartNotifications();
        break;

      default:
        return res.status(400).json({ error: "잘못된 스케줄 타입입니다" });
    }

    const results = [];

    // 각 알림 발송
    for (const notification of notificationsToSend) {
      try {
        const sendResponse = await fetch(
          `${
            process.env.VERCEL_URL || "http://localhost:3000"
          }/api/notifications/send`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(notification),
          }
        );

        const sendResult = await sendResponse.json();
        results.push({
          type: notification.notificationType,
          success: sendResult.success,
          targetCount: sendResult.targetCount,
        });
      } catch (error) {
        console.error(
          `📱 Failed to send ${notification.notificationType}:`,
          error
        );
        results.push({
          type: notification.notificationType,
          success: false,
          error: error.message,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "스케줄된 알림 처리 완료",
      results,
      processedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("📱 Schedule notification error:", error);
    res.status(500).json({
      success: false,
      error: "스케줄 알림 처리 중 오류가 발생했습니다",
      details: error.message,
    });
  }
}

/**
 * 스마트 개인화 알림 처리
 * 사용자 활동 패턴 기반으로 맞춤 알림 발송
 */
async function processSmartNotifications() {
  try {
    // 비활성 사용자 찾기 (3일 이상 미접속)
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    const allTokens = await kv.smembers("all_fcm_tokens");

    const inactiveUsers = [];

    for (const token of allTokens) {
      const tokenData = await kv.get(`fcm_token:${token}`);
      if (tokenData && new Date(tokenData.updatedAt) < threeDaysAgo) {
        inactiveUsers.push(token);
      }
    }

    // 비활성 사용자에게 복귀 유도 알림
    if (inactiveUsers.length > 0) {
      await fetch(
        `${
          process.env.VERCEL_URL || "http://localhost:3000"
        }/api/notifications/send`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...NOTIFICATION_TEMPLATES.inactive_user,
            target: "specific_tokens",
            tokens: inactiveUsers,
            notificationType: "inactive_user",
          }),
        }
      );

      console.log(
        `📱 Sent inactive user notifications to ${inactiveUsers.length} users`
      );
    }

    // 개인화된 팁 알림 (랜덤하게 일부 사용자에게)
    const activeTokens = allTokens.filter(
      (token) => !inactiveUsers.includes(token)
    );
    const tipTargets = activeTokens
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(50, Math.floor(activeTokens.length * 0.1))); // 활성 사용자의 10% 또는 최대 50명

    if (tipTargets.length > 0) {
      await fetch(
        `${
          process.env.VERCEL_URL || "http://localhost:3000"
        }/api/notifications/send`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...NOTIFICATION_TEMPLATES.personalized_tip,
            target: "specific_tokens",
            tokens: tipTargets,
            notificationType: "personalized_tip",
          }),
        }
      );

      console.log(`📱 Sent personalized tips to ${tipTargets.length} users`);
    }
  } catch (error) {
    console.error("📱 Smart notification processing error:", error);
  }
}

/**
 * 📱 푸시 알림 발송 API
 * OneSignal 또는 FCM 직접 연동
 */

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // CORS 설정
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: '메소드가 허용되지 않습니다' });
  }

  try {
    const { 
      title, 
      body, 
      data = {},
      target = 'all', // 'all', 'user', 'specific_tokens'
      userId = null,
      tokens = [],
      notificationType = 'general'
    } = req.body;

    if (!title || !body) {
      return res.status(400).json({
        success: false,
        error: '제목과 내용이 필요합니다'
      });
    }

    let targetTokens = [];

    // 대상 토큰 결정
    switch (target) {
      case 'all':
        // 모든 활성 토큰 가져오기
        const allTokens = await kv.smembers('all_fcm_tokens');
        targetTokens = allTokens;
        break;
        
      case 'user':
        if (!userId) {
          return res.status(400).json({
            success: false,
            error: '사용자 ID가 필요합니다'
          });
        }
        // 특정 유저의 토큰들
        const userTokens = await kv.smembers(`user_tokens:${userId}`);
        targetTokens = userTokens;
        break;
        
      case 'specific_tokens':
        targetTokens = tokens;
        break;
        
      default:
        return res.status(400).json({
          success: false,
          error: '잘못된 대상 유형입니다'
        });
    }

    if (targetTokens.length === 0) {
      return res.status(400).json({
        success: false,
        error: '발송할 대상이 없습니다'
      });
    }

    // OneSignal API 사용 (가장 간단한 방법)
    const notification = {
      app_id: process.env.ONESIGNAL_APP_ID,
      headings: { en: title, ko: title },
      contents: { en: body, ko: body },
      data: data,
      include_external_user_ids: target === 'user' ? [userId] : undefined,
      include_player_ids: target === 'specific_tokens' ? targetTokens : undefined,
      included_segments: target === 'all' ? ['All'] : undefined,
    };

    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${process.env.ONESIGNAL_REST_API_KEY}`,
      },
      body: JSON.stringify(notification),
    });

    const result = await response.json();

    if (response.ok) {
      // 발송 기록 저장
      const logData = {
        title,
        body,
        data,
        target,
        userId,
        targetTokenCount: targetTokens.length,
        sentAt: new Date().toISOString(),
        notificationType,
        oneSignalId: result.id,
        success: true,
      };

      await kv.lpush('notification_logs', JSON.stringify(logData));
      
      console.log(`📱 Notification sent successfully: ${result.id}`);
      
      res.status(200).json({
        success: true,
        message: '알림이 성공적으로 발송되었습니다',
        notificationId: result.id,
        targetCount: targetTokens.length,
        sentAt: new Date().toISOString(),
      });

    } else {
      throw new Error(`OneSignal API Error: ${JSON.stringify(result)}`);
    }

  } catch (error) {
    console.error('📱 Notification send error:', error);
    
    // 실패 기록 저장
    const errorLog = {
      title: req.body.title,
      body: req.body.body,
      target: req.body.target,
      error: error.message,
      sentAt: new Date().toISOString(),
      success: false,
    };
    
    try {
      await kv.lpush('notification_errors', JSON.stringify(errorLog));
    } catch (kvError) {
      console.error('📱 Failed to log error:', kvError);
    }

    res.status(500).json({
      success: false,
      error: '알림 발송 중 오류가 발생했습니다',
      details: error.message,
    });
  }
}
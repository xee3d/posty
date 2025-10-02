// 구독 웹훅 API (App Store, Google Play 결제 검증)
const { createClient } = require('@vercel/postgres');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      platform, 
      transactionId, 
      productId, 
      userId, 
      receiptData,
      purchaseToken 
    } = req.body;

    if (!platform || !transactionId || !productId || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const client = createClient();
    await client.connect();

    // 플랫폼별 결제 검증
    let isValid = false;
    let subscriptionPlan = '';

    if (platform === 'ios') {
      // App Store 영수증 검증
      isValid = await verifyAppStoreReceipt(receiptData);
      subscriptionPlan = getPlanFromProductId(productId);
    } else if (platform === 'android') {
      // Google Play 결제 검증
      isValid = await verifyGooglePlayPurchase(purchaseToken, productId);
      subscriptionPlan = getPlanFromProductId(productId);
    }

    if (!isValid) {
      await client.end();
      return res.status(400).json({ error: 'Invalid purchase' });
    }

    // 중복 구독 확인
    const existingSubscription = await client.query(`
      SELECT id FROM subscriptions 
      WHERE transaction_id = $1 AND status = 'active'
    `, [transactionId]);

    if (existingSubscription.rows.length > 0) {
      await client.end();
      return res.status(409).json({ error: 'Subscription already exists' });
    }

    // 구독 생성
    const subscription = await client.query(`
      INSERT INTO subscriptions (user_id, plan, status, payment_method, transaction_id, platform, created_at, expires_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW() + INTERVAL '1 month')
      RETURNING *
    `, [userId, subscriptionPlan, 'active', platform, transactionId, platform]);

    // 사용자 구독 상태 업데이트
    await client.query(`
      UPDATE users 
      SET subscription_status = 'active', subscription_plan = $1, subscription_expires_at = $2
      WHERE id = $3
    `, [subscriptionPlan, subscription.rows[0].expires_at, userId]);

    await client.end();

    res.status(200).json({
      success: true,
      subscription: subscription.rows[0]
    });

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// App Store 영수증 검증 (실제 구현 필요)
async function verifyAppStoreReceipt(receiptData) {
  // Apple의 영수증 검증 API 호출
  // 실제 구현에서는 Apple의 서버와 통신
  return true; // 임시로 항상 true 반환
}

// Google Play 결제 검증 (실제 구현 필요)
async function verifyGooglePlayPurchase(purchaseToken, productId) {
  // Google Play Developer API 호출
  // 실제 구현에서는 Google의 서버와 통신
  return true; // 임시로 항상 true 반환
}

// 제품 ID에서 구독 플랜 추출
function getPlanFromProductId(productId) {
  const planMap = {
    'com.posty.subscription.starter': 'starter',
    'com.posty.subscription.premium': 'premium',
    'com.posty.subscription.pro': 'pro'
  };
  return planMap[productId] || 'starter';
}

// 구독 생성 API
const { createClient } = require('@vercel/postgres');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, plan, paymentMethod, transactionId } = req.body;

    if (!userId || !plan || !transactionId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const client = createClient();
    await client.connect();

    // 구독 정보 생성
    const subscription = await client.query(`
      INSERT INTO subscriptions (user_id, plan, status, payment_method, transaction_id, created_at, expires_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW() + INTERVAL '1 month')
      RETURNING *
    `, [userId, plan, 'active', paymentMethod, transactionId]);

    // 사용자 구독 상태 업데이트
    await client.query(`
      UPDATE users 
      SET subscription_status = $1, subscription_plan = $2, subscription_expires_at = $3
      WHERE id = $4
    `, ['active', plan, subscription.rows[0].expires_at, userId]);

    await client.end();

    res.status(201).json({
      success: true,
      subscription: subscription.rows[0]
    });

  } catch (error) {
    console.error('Subscription creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

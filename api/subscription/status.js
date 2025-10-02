// 구독 상태 조회 API
const { createClient } = require('@vercel/postgres');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const client = createClient();
    await client.connect();

    // 사용자 구독 정보 조회
    const user = await client.query(`
      SELECT subscription_status, subscription_plan, subscription_expires_at
      FROM users 
      WHERE id = $1
    `, [userId]);

    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = user.rows[0];
    const now = new Date();
    const expiresAt = new Date(userData.subscription_expires_at);
    
    // 구독 만료 여부 확인
    const isExpired = expiresAt < now;
    const isActive = userData.subscription_status === 'active' && !isExpired;

    // 만료된 구독 상태 업데이트
    if (isExpired && userData.subscription_status === 'active') {
      await client.query(`
        UPDATE users 
        SET subscription_status = 'expired'
        WHERE id = $1
      `, [userId]);
    }

    await client.end();

    res.status(200).json({
      success: true,
      subscription: {
        status: isActive ? 'active' : 'inactive',
        plan: userData.subscription_plan,
        expiresAt: userData.subscription_expires_at,
        isActive,
        isExpired
      }
    });

  } catch (error) {
    console.error('Subscription status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

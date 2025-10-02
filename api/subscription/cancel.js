// 구독 취소 API
const { createClient } = require('@vercel/postgres');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, reason } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const client = createClient();
    await client.connect();

    // 구독 상태를 취소로 변경
    await client.query(`
      UPDATE users 
      SET subscription_status = 'cancelled'
      WHERE id = $1
    `, [userId]);

    // 구독 이력에 취소 기록 추가
    await client.query(`
      INSERT INTO subscription_history (user_id, action, reason, created_at)
      VALUES ($1, $2, $3, NOW())
    `, [userId, 'cancelled', reason || 'User requested cancellation']);

    await client.end();

    res.status(200).json({
      success: true,
      message: 'Subscription cancelled successfully'
    });

  } catch (error) {
    console.error('Subscription cancellation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

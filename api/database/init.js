// 데이터베이스 초기화 스크립트
const { createClient } = require('@vercel/postgres');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const client = createClient();
    await client.connect();

    // 스키마 파일 읽기 및 실행
    const fs = require('fs');
    const path = require('path');
    
    const schemaPath = path.join(process.cwd(), 'api/database/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // SQL 스크립트 실행
    await client.query(schema);

    await client.end();

    res.status(200).json({
      success: true,
      message: 'Database initialized successfully'
    });

  } catch (error) {
    console.error('Database initialization error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

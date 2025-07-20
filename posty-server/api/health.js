export default function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  
  // OPTIONS 요청 처리
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const deploymentInfo = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    deployment: process.env.VERCEL_URL || 'unknown',
    region: process.env.VERCEL_REGION || 'unknown',
    env: process.env.VERCEL_ENV || 'unknown',
    node_version: process.version,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    headers: req.headers,
    query: req.query,
    method: req.method
  };
  
  res.status(200).json(deploymentInfo);
}

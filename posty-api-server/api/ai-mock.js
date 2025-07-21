// AI 서비스를 위한 임시 Mock 서버
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Mock AI response
  res.status(200).json({
    generated: true,
    content: "AI 서버가 일시적으로 점검 중입니다. 잠시 후 다시 시도해주세요.",
    style: "casual"
  });
}
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'posty-api-server',
    endpoints: [
      '/api/health',
      '/api/auth/custom-token',
      '/api/trends'
    ]
  });
}

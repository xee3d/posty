export default function handler(req, res) {
  const healthStatus = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Posty API Server',
    version: '1.0.0',
    uptime: process.uptime(),
  };
  
  res.status(200).json(healthStatus);
}

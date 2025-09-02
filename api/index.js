export default function handler(req, res) {
  res.status(200).json({
    name: "Posty API Server",
    version: "1.0.0",
    status: "operational",
    endpoints: {
      health: "/api/health",
      generate: "/api/generate",
      generateTest: "/api/generate-test",
    },
    documentation: "https://github.com/your-username/posty-server",
    timestamp: new Date().toISOString(),
  });
}

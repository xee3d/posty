export default async function handler(req, res) {
  // CORS 설정
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With, Content-Type, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  return res.status(200).json({
    status: "OK",
    message: "Posty API Server is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    endpoints: [
      "/api/health",
      "/api/auth/google",
      "/api/auth/kakao",
      "/api/auth/naver",
      "/api/auth/apple",
    ],
  });
}

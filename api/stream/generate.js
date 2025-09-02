// Stream API test endpoint
export default function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt, length } = req.body;

    // 길이에 따른 응답 시간 시뮬레이션
    const responseTime =
      length === "extra"
        ? 5000 // 초장문: 5초
        : length === "long"
        ? 3000 // 긴 글: 3초
        : 1000; // 기본: 1초

    // 스트리밍 응답 설정
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    // 청크로 응답 전송
    const chunks = [
      "안녕하세요! ",
      "포스티가 ",
      "글을 생성 중입니다... ",
      "완료되었습니다!",
    ];

    let index = 0;
    const interval = setInterval(() => {
      if (index < chunks.length) {
        res.write(`data: ${JSON.stringify({ chunk: chunks[index] })}\n\n`);
        index++;
      } else {
        res.write("data: [DONE]\n\n");
        clearInterval(interval);
        res.end();
      }
    }, responseTime / chunks.length);
  } catch (error) {
    console.error("Stream error:", error);
    res.status(500).json({ error: error.message });
  }
}

export default function handler(req, res) {
  res.status(200).json({
    message: "Hello from Posty AI Server",
    timestamp: new Date().toISOString(),
  });
}

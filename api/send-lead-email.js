export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  return res.status(410).json({
    success: false,
    error: "endpoint_disabled"
  });
}

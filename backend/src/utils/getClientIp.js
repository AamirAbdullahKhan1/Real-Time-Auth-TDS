export function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  const realIp = req.headers["x-real-ip"];

  let ip =
    (typeof forwarded === "string" && forwarded.split(",")[0].trim()) ||
    (typeof realIp === "string" && realIp.trim()) ||
    req.ip ||
    req.socket?.remoteAddress ||
    req.connection?.remoteAddress ||
    "";

  if (ip.startsWith("::ffff:")) {
    ip = ip.replace("::ffff:", "");
  }

  if (ip === "::1") {
    ip = "127.0.0.1";
  }

  return ip;
}
export function getClientIp(req) {
    const ip = req.ip || req.socket?.remoteAddress || "";
    return ip === "::1" ? "127.0.0.1" : ip.replace(/^::ffff:/, "");
}

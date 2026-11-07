import jwt from "jsonwebtoken";
import { pool } from "../config/db.js";

export async function verifyToken(req, res, next) {
    const token = req.headers.authorization?.match(/^Bearer (\S+)$/)?.[1];
    try {
        req.sessionId = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] }).sid;
        if (!req.sessionId) throw new Error("Missing session");
    } catch {
        return res.status(401).json({ error: "Invalid or expired session" });
    }

    const { rows } = await pool.query(
        `SELECT u.id, u.name, u.email
           FROM auth_sessions s JOIN users u ON u.id = s.user_id
          WHERE s.id = $1 AND s.email_challenge_id IS NOT NULL
            AND s.revoked_at IS NULL AND s.expires_at > now()`,
        [req.sessionId],
    );
    if (!rows[0]) return res.status(401).json({ error: "Invalid or expired session" });
    req.user = rows[0];
    next();
}

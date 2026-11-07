import { randomUUID } from "node:crypto";
import jwt from "jsonwebtoken";

export async function createSession(user, challengeId, db) {
    const sid = randomUUID();
    const token = jwt.sign({ sid }, process.env.JWT_SECRET, {
        algorithm: "HS256",
        expiresIn: "24h",
    });
    await db.query(
        "INSERT INTO auth_sessions (id, user_id, email_challenge_id, expires_at) VALUES ($1, $2, $3, now() + interval '24 hours')",
        [sid, user.id, challengeId],
    );
    return token;
}

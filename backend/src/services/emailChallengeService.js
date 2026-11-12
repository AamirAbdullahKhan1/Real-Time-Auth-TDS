import { createHmac, randomInt, randomUUID, timingSafeEqual } from "node:crypto";

function digest(id, code) {
    return createHmac("sha256", process.env.JWT_SECRET).update(`ironclad-email-otp:${id}:${code}`).digest();
}

export async function createEmailChallenge(db, userId, purpose, expectedPasswordHash) {
    // Serialize requests for the same account across backend instances.
    const { rows: [account] } = await db.query("SELECT password_hash FROM users WHERE id = $1 FOR UPDATE", [userId]);
    if (!account || (expectedPasswordHash && account.password_hash !== expectedPasswordHash)) return null;
    const { rows: [limits] } = await db.query(
        `SELECT count(*) >= 5 AS hourly_limit,
                coalesce(bool_or(created_at > now() - interval '60 seconds'
                    AND consumed_at IS NULL AND invalidated_at IS NULL), false) AS cooldown
           FROM auth_email_challenges WHERE user_id = $1 AND created_at > now() - interval '1 hour'
            AND (purpose = 'password_reset') = ($2 = 'password_reset')`,
        [userId, purpose],
    );
    if (limits.hourly_limit || limits.cooldown) return null;

    const id = randomUUID();
    const code = String(randomInt(1_000_000)).padStart(6, "0");
    await db.query(
        `INSERT INTO auth_email_challenges (id, user_id, purpose, code_digest, expires_at)
         VALUES ($1, $2, $3, $4, now() + interval '10 minutes')`,
        [id, userId, purpose, digest(id, code).toString("hex")],
    );
    return { id, code };
}

export function codeMatches(challenge, code) {
    return timingSafeEqual(digest(challenge.id, code), Buffer.from(challenge.code_digest, "hex"));
}

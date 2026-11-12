import bcrypt from "bcrypt";
import { randomUUID } from "node:crypto";
import { pool } from "../config/db.js";
import { insertAuthEvent, publishAuthEvent } from "../services/authEventService.js";
import { createSession } from "../services/sessionService.js";
import { geoLookup } from "../utils/geoLookup.js";
import { getClientIp } from "../utils/getClientIp.js";
import { createEmailChallenge, codeMatches } from "../services/emailChallengeService.js";
import { emailConfigured, sendVerificationCode } from "../services/verificationEmail.js";

function normalizeEmail(input) {
    if (typeof input !== "string") return null;
    const email = input.trim().toLowerCase();
    return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

function validPassword(password) {
    return typeof password === "string" && password.length >= 12 &&
        Buffer.byteLength(password) <= 72 && /\d/.test(password) && /[^a-z\d\s]/i.test(password);
}

async function withTransaction(work) {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const result = await work(client);
        await client.query("COMMIT");
        return result;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

async function findUser(email) {
    const { rows } = await pool.query(
        "SELECT * FROM users WHERE lower(email) = $1 ORDER BY (email = $1) DESC, id LIMIT 1",
        [email],
    );
    return rows[0];
}

function audit(req, eventType, user, reason = null) {
    const ip = getClientIp(req);
    return {
        user_id: user?.id ?? null,
        username: user?.name ?? null,
        email: user?.email ?? normalizeEmail(req.body?.email),
        event_type: eventType,
        account_role: user?.role ?? null,
        risk_label: reason ? "suspicious" : "normal",
        severity: reason ? "medium" : "low",
        detected_rule: reason,
        ip_address: ip,
        country: geoLookup(ip).country,
        user_agent: req.headers["user-agent"] || null,
    };
}

export async function register(req, res) {
    const { name, password } = req.body ?? {};
    const email = normalizeEmail(req.body?.email);
    if (!email || typeof name !== "string" || !name.trim() || name.length > 120 ||
        !validPassword(password)) {
        return res.status(400).json({
            error: "Enter a valid name, email, and password (12+ characters with a number and symbol, at most 72 bytes).",
        });
    }

    if (!emailConfigured()) return emailUnavailable(res);
    if (await findUser(email)) return res.status(400).json({ error: "An account already exists. Sign in to continue." });
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await withTransaction(async client => {
        const { rows } = await client.query(
            "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING RETURNING id, name, email, role",
            [name.trim(), email, passwordHash],
        );
        const user = rows[0];
        if (!user) return null;
        const challenge = await createEmailChallenge(client, user.id, "register");
        return { user, challenge };
    });
    if (!result) return res.status(400).json({ error: "User already exists" });
    return deliverChallenge(req, res, result.user, result.challenge);
}

export async function login(req, res) {
    const email = normalizeEmail(req.body?.email);
    const password = req.body?.password;
    if (!email || typeof password !== "string" || !password || Buffer.byteLength(password) > 72) {
        return res.status(400).json({ error: "Enter a valid email and password." });
    }

    const user = await findUser(email);
    if (!user || !await bcrypt.compare(password, user.password_hash)) {
        const reason = user ? "invalid_credentials" : "non_existent_user";
        await publishAuthEvent(await insertAuthEvent(audit(req, "LOGIN_FAILED", user, reason)));
        return res.status(401).json({ error: "Invalid credentials" });
    }

    if (!emailConfigured()) return emailUnavailable(res);
    const challenge = await withTransaction(client => createEmailChallenge(client, user.id, "login", user.password_hash));
    if (!challenge) return res.status(429).json({ error: "A code was requested recently or the hourly limit was reached. Wait before requesting another." });
    return deliverChallenge(req, res, user, challenge);
}

function emailUnavailable(res) {
    return res.status(503).json({ error: "Verification email is unavailable. Try again later." });
}

async function deliverChallenge(req, res, user, challenge) {
    if (!await deliverCode(req, user, challenge)) {
        return res.status(503).json({ error: "We couldn't send a verification email. Sign in again to retry." });
    }
    res.status(202).json({ challengeId: challenge.id, email: user.email });
}

async function deliverCode(req, user, challenge, purpose) {
    try {
        await sendVerificationCode(user.email, challenge.code, challenge.id, purpose);
        return true;
    } catch (error) {
        console.error("Verification email request failed:", error.response?.status ?? error.code ?? "provider_error");
        await pool.query("UPDATE auth_email_challenges SET invalidated_at = now() WHERE id = $1", [challenge.id]);
        await publishAuthEvent(await insertAuthEvent(audit(req, "OTP_DELIVERY_FAILED", user, "email_provider_error")));
        return false;
    }
}

function validCode(challengeId, code) {
    return typeof challengeId === "string" &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(challengeId) &&
        typeof code === "string" && /^\d{6}$/.test(code);
}

async function lockChallenge(client, challengeId, reset) {
    // Use the same lock order as issuance and password changes.
    const { rows: [user] } = await client.query(
        `SELECT u.id, u.name, u.email, u.role
           FROM users u JOIN auth_email_challenges c ON u.id = c.user_id
          WHERE c.id = $1 AND (c.purpose = 'password_reset') = $2 FOR UPDATE OF u`,
        [challengeId, reset],
    );
    if (!user) return {};
    const { rows: [challenge] } = await client.query(
        `SELECT *, expires_at <= clock_timestamp() AS expired
           FROM auth_email_challenges WHERE id = $1 FOR UPDATE`, [challengeId],
    );
    return { user, challenge };
}

function usable(challenge) {
    return challenge && !challenge.expired && !challenge.consumed_at &&
        !challenge.invalidated_at && challenge.failed_attempts < 5;
}

export async function verifyEmailCode(req, res) {
    const { challengeId, code } = req.body ?? {};
    if (!validCode(challengeId, code)) {
        return res.status(400).json({ error: "Enter a six-digit verification code." });
    }

    const result = await withTransaction(async client => {
        const { user, challenge } = await lockChallenge(client, challengeId, false);
        if (!challenge) return { events: [] };
        if (!usable(challenge)) {
            return { events: [], unavailable: true };
        }
        if (!codeMatches(challenge, code)) {
            await client.query("UPDATE auth_email_challenges SET failed_attempts = failed_attempts + 1 WHERE id = $1", [challengeId]);
            const event = await insertAuthEvent(audit(req, "OTP_FAILED", user, "invalid_code"), client);
            return { events: [event], unavailable: challenge.failed_attempts === 4 };
        }

        await client.query("UPDATE auth_email_challenges SET consumed_at = now() WHERE id = $1", [challengeId]);
        await client.query("UPDATE users SET email_verified_at = now() WHERE id = $1 AND email_verified_at IS NULL", [user.id]);
        const token = await createSession(user, challengeId, client);
        const otpEvent = await insertAuthEvent(audit(req, "OTP_VERIFIED", user), client);
        const authEvent = await insertAuthEvent(audit(req, challenge.purpose === "register" ? "REGISTER_SUCCESS" : "LOGIN_SUCCESS", user), client);
        return { token, user, events: [otpEvent, authEvent] };
    });
    for (const event of result.events) await publishAuthEvent(event);
    if (!result.token) {
        const error = result.unavailable ? "This code is no longer usable. Sign in again for a new code." : "Incorrect verification code.";
        return res.status(401).json({ error });
    }
    res.json({ token: result.token, user: result.user });
}

export async function requestPasswordReset(req, res) {
    const email = normalizeEmail(req.body?.email);
    if (!email) return res.status(400).json({ error: "Enter a valid email address." });
    if (!emailConfigured()) return emailUnavailable(res);
    const user = await findUser(email);
    const challenge = user && await withTransaction(client => createEmailChallenge(client, user.id, "password_reset"));
    res.status(202).json({ challengeId: challenge?.id ?? randomUUID() });
    if (challenge) {
        void deliverCode(req, user, challenge, "password_reset").catch(error => {
            console.error("Password reset delivery audit failed:", error.code ?? "database_error");
        });
    }
}

export async function resetPassword(req, res) {
    const { challengeId, code, password } = req.body ?? {};
    if (!validCode(challengeId, code)) return res.status(400).json({ error: "Enter a six-digit verification code." });
    if (!validPassword(password)) {
        return res.status(400).json({ error: "Use at least 12 characters, including a number and symbol, and at most 72 bytes." });
    }
    const result = await withTransaction(async client => {
        const { user, challenge } = await lockChallenge(client, challengeId, true);
        if (!usable(challenge)) return {};
        if (!codeMatches(challenge, code)) {
            await client.query("UPDATE auth_email_challenges SET failed_attempts = failed_attempts + 1 WHERE id = $1", [challengeId]);
            return { event: await insertAuthEvent(audit(req, "PASSWORD_RESET_FAILED", user, "invalid_code"), client) };
        }
        await client.query("UPDATE users SET password_hash = $1 WHERE id = $2", [await bcrypt.hash(password, 10), user.id]);
        await client.query("UPDATE auth_email_challenges SET consumed_at = now() WHERE id = $1", [challengeId]);
        await client.query(
            "UPDATE auth_email_challenges SET invalidated_at = now() WHERE user_id = $1 AND consumed_at IS NULL AND invalidated_at IS NULL",
            [user.id],
        );
        await client.query("UPDATE auth_sessions SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL", [user.id]);
        return { changed: true, event: await insertAuthEvent(audit(req, "PASSWORD_RESET_SUCCESS", user), client) };
    });
    if (result.event) await publishAuthEvent(result.event);
    if (!result.changed) return res.status(400).json({ error: "This code is incorrect or no longer usable." });
    res.json({ success: true });
}

export async function logout(req, res) {
    const event = await withTransaction(async client => {
        const { rowCount } = await client.query(
            "UPDATE auth_sessions SET revoked_at = now() WHERE id = $1 AND revoked_at IS NULL",
            [req.sessionId],
        );
        if (rowCount === 0) return null;
        return insertAuthEvent(audit(req, "LOGOUT_SUCCESS", req.user), client);
    });
    if (event) await publishAuthEvent(event);
    res.json({ success: true, message: "User logged out successfully" });
}

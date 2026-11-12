import express from "express";
import { pool } from "../config/db.js";
import { register, login, logout, verifyEmailCode, requestPasswordReset, resetPassword } from "../controllers/authControllers.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();
router.post("/register", register);
router.post("/login", login);
router.post("/verify-email-code", verifyEmailCode);
router.post("/password-reset/request", requestPasswordReset);
router.post("/password-reset/confirm", resetPassword);
router.post("/logout", verifyToken, logout);
router.get("/me", verifyToken, (req, res) => res.json({ user: req.user }));
router.get("/admin/events", verifyToken, async (req, res) => {
    if (req.user.role !== "admin") return res.status(403).json({ error: "Administrator access required." });
    const { rows } = await pool.query(
        `SELECT id, user_id, account_role, event_type, detected_rule, ip_address, country, created_at
           FROM auth_events ORDER BY created_at DESC, id DESC LIMIT 50`,
    );
    res.json({ events: rows });
});
router.get("/events", verifyToken, async (req, res) => {
    const { rows } = await pool.query(
        `SELECT id, event_type, ip_address, country, created_at
           FROM auth_events WHERE user_id = $1
          ORDER BY created_at DESC, id DESC LIMIT 50`,
        [req.user.id],
    );
    res.json({ events: rows });
});

export default router;

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { rateLimit } from "express-rate-limit";
import { connectDB } from "./src/config/db.js"
import dotenv from 'dotenv'
import authRoutes from "./src/routes/authRoutes.js"
import { emailConfigured } from "./src/services/verificationEmail.js";
dotenv.config();

const app = express()
const trustedProxyHops = process.env.TRUST_PROXY_HOPS;
if (trustedProxyHops !== undefined) {
    const hops = Number(trustedProxyHops);
    if (!/^\d+$/.test(trustedProxyHops) || !Number.isSafeInteger(hops)) {
        throw new Error("TRUST_PROXY_HOPS must be a non-negative integer");
    }
    app.set("trust proxy", hops);
} else if (process.env.TRUST_PROXY === "loopback") {
    app.set("trust proxy", "loopback");
}

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window`
    message: { error: "Too many requests from this IP, please try again later." }
});

app.use(express.json())
const frontendOrigin = process.env.FRONTEND_ORIGIN?.trim().replace(/\/+$/, "");
if (frontendOrigin) app.use(cors({ origin: frontendOrigin }));
app.use(helmet())
app.use(morgan("dev"))
app.use(limiter)

app.use("/api/auth", authRoutes)

app.get("/", (req,res) => {
    res.send("Backend is fine!")
})

app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    if (error.status === 400) return res.status(400).json({ error: "Invalid request body" });
    console.error("Request failed:", error.code);
    res.status(500).json({ error: "Internal server error" });
});

if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is required");
if (!emailConfigured()) {
    console.warn("Email verification is unavailable. Configure RESEND_API_KEY and OTP_FROM_EMAIL in backend/.env.");
}

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    })
});

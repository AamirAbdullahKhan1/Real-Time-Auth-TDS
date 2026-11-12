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

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window`
    message: { error: "Too many requests from this IP, please try again later." }
});

app.use(express.json())
if (process.env.FRONTEND_ORIGIN) app.use(cors({ origin: process.env.FRONTEND_ORIGIN }));
app.use(helmet())
app.use(morgan("dev"))
app.use(limiter)

app.use("/api/auth", authRoutes)

if (process.env.TRUST_PROXY === "loopback") app.set("trust proxy", "loopback");

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

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { rateLimit } from "express-rate-limit";
import { connectDB } from "./src/config/db.js"
import dotenv from 'dotenv'
import authRoutes from "./src/routes/authRoutes.js"
dotenv.config();

const app = express()

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window`
    message: "Too many requests from this IP, please try again later."
});

app.use(express.json())
app.use(cors())
app.use(helmet())
app.use(morgan("dev"))
app.use(limiter)

app.use("/api/auth", authRoutes)

app.get("/", (req,res) => {
    res.send("Backend is fine!")
})

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    })
});
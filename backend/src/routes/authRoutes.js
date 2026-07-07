import express from "express";
import { register } from "../controllers/authControllers.js";
import { login } from "../controllers/authControllers.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { logout } from "../controllers/authControllers.js";
const router = express.Router();

router.post("/register", register)
router.post("/login", login)
router.post("/logout", verifyToken, logout)

export default router
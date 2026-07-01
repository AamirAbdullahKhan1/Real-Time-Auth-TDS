import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {pool} from "../config/db.js"
import { insertAuthEvent } from "../services/authEventService.js"

const SALT_ROUNDS = 10

export const register = async (req,res) => {
    const {name, email, password} = req.body;

    try {
        const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email])
        if (existingUser.rows.length > 0){
            return res.status(400).json({error: "User already exists"})
        }

        const hashed_password = await bcrypt.hash(password, SALT_ROUNDS)

        const result = await pool.query("INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email", [name, email, hashed_password])
        const newUser = result.rows[0]
        await insertAuthEvent({
            user_id: newUser.id,
            username: newUser.name,
            email: newUser.email,
            event_type: "REGISTER_SUCCESS",
            risk_label: "normal",
            severity: "low",
            detected_rule: null,
            ip_address: null, 
            country: null,
            region: null,
            city: null,
            user_agent: req.headers["user-agent"] || null,
            details: { message: "User registered successfully" }
        });
        const token = jwt.sign({id: newUser.id, email: newUser.email}, process.env.JWT_SECRET, {expiresIn: "24h"})

        res.status(201).json({
            success: true,
            token,
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email
            }
        })
    } catch (error) {
        console.error("Registration error:", error)
        res.status(500).json({error: "Internal server error"})
    }
}

export const login = async (req,res) => {
    const {name, email, password} = req.body

    try {
        const user = await pool.query("SELECT * FROM users WHERE email = $1", [email])

        if(user.rows.length === 0){
            await insertAuthEvent({
                user_id: null,
                username: email,
                email,
                event_type: "LOGIN_FAILED",
                risk_label: "suspicious",
                severity: "medium",
                detected_rule: "invalid_credentials",
                ip_address: null,
                country: null,
                region: null,
                city: null,
                user_agent: req.headers["user-agent"] || null,
                details: { message: "Invalid credentials" }
            });
            return res.status(401).json({error: "User not found"})
        }

        const validPassword = await bcrypt.compare(password, user.rows[0].password_hash)
        if(!validPassword){
            return res.status(401).json({error: "Invalid Credentials"})
        }

        const token = jwt.sign({id: user.rows[0].id, email: user.rows[0].email}, process.env.JWT_SECRET, {expiresIn: "24h"})

        await insertAuthEvent({
            user_id: user.rows[0].id,
            username: user.rows[0].name,
            email: user.rows[0].email,
            event_type: "LOGIN_SUCCESS",
            risk_label: "normal",
            severity: "low",
            detected_rule: null,
            ip_address: null,
            country: null,
            region: null,
            city: null,
            user_agent: req.headers["user-agent"] || null,
            details: { message: "User logged in successfully" }
        });

        res.status(200).json({
            success: true,
            token,
            user:{
                id: user.rows[0].id,
                name: user.rows[0].name,
                email: user.rows[0].email
            }
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({error: "Internal server error"})
    }
}
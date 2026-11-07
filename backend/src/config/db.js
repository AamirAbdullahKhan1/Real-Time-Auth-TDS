import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const { Pool} = pkg;

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 5000,
});

export const connectDB = async () => {
    try {
        const client = await pool.connect();
        console.log("Database connected successfully");
        client.release();
    } catch (err) {
        console.error("Database connection error:", err.message);
        if (err.code === "ENOTFOUND" || err.code === "EAI_AGAIN") {
            console.error("Verify the Neon hostname in backend/.env and check DNS from the machine running Express. The API cannot start until PostgreSQL is reachable.");
        }
        process.exit(1);
    }
};

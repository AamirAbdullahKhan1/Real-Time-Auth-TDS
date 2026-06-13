import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const { Pool} = pkg;

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});

export const connectDB = async () => {
    try {
        const client = await pool.connect();
        console.log("Database connected successfully");
        client.release();
    } catch (err) {
        console.error("Database connection error:", err.message);
        process.exit(1);
    }
};

import { Pool } from "pg";
import { config } from "../config/env";

const pool = new Pool({
  connectionString: config.databaseUrl,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 4,
});

export const initDatabase = async (): Promise<void> => {
  const query = `
    CREATE TABLE IF NOT EXISTS posts (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      text TEXT,
      image TEXT,
      schedule_days VARCHAR(50),
      schedule_time VARCHAR(10),
      last_posted TIMESTAMP,
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;
  try {
    await pool.query(query);
    console.log("Database tables verified/created successfully.");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
};

export default pool;

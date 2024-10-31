const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  allowExitOnIdle: false,
  ssl: true,
});

const testConnection = async () => {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("Database connected successfully:", result.rows);
  } catch (error) {
    console.error("Error connecting to the database:", error.message);
  } finally {
    await pool.end(); // Close the pool when done
  }
};

testConnection();

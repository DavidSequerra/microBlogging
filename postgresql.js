const { Pool } = require("pg");
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  allowExitOnIdle: false,
  ssl: true,
});

const poolDB = async (query, args) => {
  const result = await pool.query(query, args);
  return result.rows;
};

module.exports = {
  poolDB
};

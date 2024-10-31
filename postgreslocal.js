const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.LOCAL_HOST,
  user: process.env.LOCAL_USER,
  password: process.env.LOCAL_PASSWORD,
  database: process.env.LOCAL_DATABASE,
  allowExitOnIdle: false,
  ssl: false,
});

const poolDBlocal = async (query, args) => {
  const result = await pool.query(query, args);
  return result.rows;
};

module.exports = {
  poolDBlocal,
};
